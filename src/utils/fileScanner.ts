import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Finding, PrivacyScanSummary, ScannedFile } from '../types/privacy';
import { calculateSHA256 } from './crypto';
import { maskSensitiveValue } from './masking';
import { calculateRisk, PRIVACY_RULES } from './privacyDetectors';

export interface ScanProgressCallback {
  (progressPercent: number, statusMessage: string): void;
}

interface IntermediateFinding {
  dataType: string;
  rule: (typeof PRIVACY_RULES)[0];
  columnOrField: string;
  rowIndices: number[];
  samples: string[];
  occurrences: number;
  highestConfidence: number;
}

export async function scanFile(
  file: File,
  onProgress?: ScanProgressCallback
): Promise<{ scannedFile: ScannedFile; findings: Finding[] }> {
  onProgress?.(5, `Hashing file ${file.name} for cryptographic integrity...`);

  const arrayBuffer = await file.arrayBuffer();
  const sha256 = await calculateSHA256(arrayBuffer);

  const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const fileCategory: ScannedFile['extension'] =
    ext === 'csv' ? 'csv' : ext === 'xlsx' || ext === 'xls' ? 'xlsx' : ext === 'json' ? 'json' : 'txt';

  onProgress?.(25, `Parsing contents of ${file.name}...`);

  const intermediateMap = new Map<string, IntermediateFinding>();

  const recordFinding = (
    rule: (typeof PRIVACY_RULES)[0],
    columnOrField: string,
    rowIndex: number,
    value: string,
    confidence: number
  ) => {
    const key = `${rule.type}:::${columnOrField}`;
    let item = intermediateMap.get(key);
    if (!item) {
      item = {
        dataType: rule.type,
        rule,
        columnOrField,
        rowIndices: [],
        samples: [],
        occurrences: 0,
        highestConfidence: confidence
      };
      intermediateMap.set(key, item);
    }

    item.occurrences += 1;
    if (confidence > item.highestConfidence) {
      item.highestConfidence = confidence;
    }
    if (item.rowIndices.length < 50 && !item.rowIndices.includes(rowIndex)) {
      item.rowIndices.push(rowIndex);
    }
    // Mask immediately before storing sample
    const masked = maskSensitiveValue(value, rule.type);
    if (item.samples.length < 5 && !item.samples.includes(masked)) {
      item.samples.push(masked);
    }
  };

  let totalRows = 0;
  let textSnippet = '';

  if (fileCategory === 'csv') {
    const text = new TextDecoder('utf-8').decode(arrayBuffer);
    textSnippet = text.slice(0, 300);
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true
    });

    const rows = parsed.data;
    totalRows = rows.length;
    const headers = parsed.meta.fields || [];

    for (let r = 0; r < rows.length; r++) {
      if (r % 50 === 0 && onProgress) {
        onProgress(30 + Math.floor((r / rows.length) * 50), `Analyzing row ${r + 1} of ${rows.length}...`);
      }
      const row = rows[r];
      for (const header of headers) {
        const val = row[header];
        if (!val || typeof val !== 'string') continue;

        for (const rule of PRIVACY_RULES) {
          const matchResult = rule.detectValue(val, header);
          if (matchResult?.match) {
            recordFinding(rule, header, r + 2, val, matchResult.confidence);
          }
        }
      }
    }
  } else if (fileCategory === 'xlsx') {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
    totalRows = jsonRows.length;

    for (let r = 0; r < jsonRows.length; r++) {
      if (r % 50 === 0 && onProgress) {
        onProgress(30 + Math.floor((r / jsonRows.length) * 50), `Evaluating record ${r + 1} of ${jsonRows.length}...`);
      }
      const row = jsonRows[r];
      for (const [colName, rawVal] of Object.entries(row)) {
        if (rawVal === undefined || rawVal === null) continue;
        const valStr = String(rawVal).trim();
        if (!valStr) continue;

        for (const rule of PRIVACY_RULES) {
          const matchResult = rule.detectValue(valStr, colName);
          if (matchResult?.match) {
            recordFinding(rule, colName, r + 2, valStr, matchResult.confidence);
          }
        }
      }
    }
  } else if (fileCategory === 'json') {
    const text = new TextDecoder('utf-8').decode(arrayBuffer);
    textSnippet = text.slice(0, 300);
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        totalRows = data.length;
        for (let r = 0; r < data.length; r++) {
          const item = data[r];
          if (typeof item === 'object' && item !== null) {
            scanJsonObject(item, (keyPath, val) => {
              for (const rule of PRIVACY_RULES) {
                const matchResult = rule.detectValue(String(val), keyPath);
                if (matchResult?.match) {
                  recordFinding(rule, keyPath, r + 1, String(val), matchResult.confidence);
                }
              }
            });
          }
        }
      } else if (typeof data === 'object' && data !== null) {
        totalRows = 1;
        scanJsonObject(data, (keyPath, val) => {
          for (const rule of PRIVACY_RULES) {
            const matchResult = rule.detectValue(String(val), keyPath);
            if (matchResult?.match) {
              recordFinding(rule, keyPath, 1, String(val), matchResult.confidence);
            }
          }
        });
      }
    } catch {
      // Fallback to text lines scan
      scanTextLines(text, recordFinding);
    }
  } else {
    // Plain text / logs / unstructured
    const text = new TextDecoder('utf-8').decode(arrayBuffer);
    textSnippet = text.slice(0, 300);
    const lines = text.split(/\r?\n/);
    totalRows = lines.length;

    for (let i = 0; i < lines.length; i++) {
      if (i % 100 === 0 && onProgress) {
        onProgress(30 + Math.floor((i / lines.length) * 50), `Inspecting log line ${i + 1} of ${lines.length}...`);
      }
      const line = lines[i];
      if (!line.trim()) continue;

      for (const rule of PRIVACY_RULES) {
        const matchResult = rule.detectValue(line);
        if (matchResult?.match) {
          recordFinding(rule, `Line ${i + 1}`, i + 1, matchResult.normalized || line, matchResult.confidence);
        }
      }
    }
  }

  onProgress?.(90, 'Scoring privacy risk levels & compiling evidence inventory...');

  const findings: Finding[] = [];
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  let findingIdx = 1;
  for (const item of intermediateMap.values()) {
    const { riskScore, riskLevel } = calculateRisk(
      item.rule.category,
      item.rule.sensitivity,
      item.occurrences
    );

    if (riskLevel === 'CRITICAL') criticalCount++;
    else if (riskLevel === 'HIGH') highCount++;
    else if (riskLevel === 'MEDIUM') mediumCount++;
    else lowCount++;

    const rowsDisplay =
      item.rowIndices.length > 0
        ? `Row(s): ${item.rowIndices.slice(0, 5).join(', ')}${item.rowIndices.length > 5 ? '...' : ''}`
        : 'Multiple positions';

    const locationDesc = item.columnOrField.startsWith('Line')
      ? item.columnOrField
      : `Column "${item.columnOrField}" (${rowsDisplay})`;

    findings.push({
      id: `PL-${Date.now().toString().slice(-4)}-${findingIdx.toString().padStart(3, '0')}`,
      fileId,
      fileName: file.name,
      fileHash: sha256,
      location: locationDesc,
      columnOrField: item.columnOrField,
      rowOrLineNumber: item.rowIndices[0] || 1,
      dataType: item.rule.type,
      dataTypeName: item.rule.name,
      category: item.rule.category,
      sensitivity: item.rule.sensitivity,
      occurrences: item.occurrences,
      maskedSample: item.samples[0] || '****',
      maskedSamplesList: item.samples,
      rawSamplesCount: item.occurrences,
      detectionMethod: item.rule.description,
      confidence: item.highestConfidence,
      detectedAt: new Date().toISOString(),
      riskScore,
      riskLevel,
      contextSnippet: `${item.rule.name} discovered across ${item.occurrences} instance(s) in "${item.columnOrField}".`,
      complianceTags: item.rule.complianceTags,
      mitigationRecommendation: item.rule.mitigation
    });

    findingIdx++;
  }

  onProgress?.(100, 'Scan completed.');

  const scannedFile: ScannedFile = {
    id: fileId,
    name: file.name,
    size: file.size,
    type: file.type || 'text/plain',
    extension: fileCategory,
    sha256,
    scannedAt: new Date().toISOString(),
    status: 'completed',
    findingsCount: findings.length,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    rowCount: totalRows,
    previewSnippet: textSnippet
  };

  return { scannedFile, findings };
}

function scanJsonObject(obj: Record<string, unknown>, callback: (path: string, val: unknown) => void, prefix = '') {
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      scanJsonObject(value as Record<string, unknown>, callback, fullPath);
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (typeof item === 'object' && item !== null) {
          scanJsonObject(item as Record<string, unknown>, callback, `${fullPath}[${i}]`);
        } else if (item !== undefined && item !== null) {
          callback(`${fullPath}[${i}]`, item);
        }
      }
    } else if (value !== undefined && value !== null) {
      callback(fullPath, value);
    }
  }
}

function scanTextLines(text: string, recordFinding: (rule: (typeof PRIVACY_RULES)[0], col: string, row: number, val: string, conf: number) => void) {
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    for (const rule of PRIVACY_RULES) {
      const matchResult = rule.detectValue(line);
      if (matchResult?.match) {
        recordFinding(rule, `Line ${i + 1}`, i + 1, matchResult.normalized || line, matchResult.confidence);
      }
    }
  }
}

export function computeSummary(files: ScannedFile[], findings: Finding[]): PrivacyScanSummary {
  let criticalFindings = 0;
  let highFindings = 0;
  let mediumFindings = 0;
  let lowFindings = 0;
  let totalOccurrences = 0;
  let personalDataCount = 0;
  let sensitivePersonalDataCount = 0;

  const dataTypeDistribution: Record<string, number> = {};
  const complianceBreakdown: Record<string, number> = {};

  for (const f of findings) {
    if (f.riskLevel === 'CRITICAL') criticalFindings++;
    else if (f.riskLevel === 'HIGH') highFindings++;
    else if (f.riskLevel === 'MEDIUM') mediumFindings++;
    else lowFindings++;

    totalOccurrences += f.occurrences;

    if (f.category === 'SENSITIVE_PERSONAL_DATA') {
      sensitivePersonalDataCount += f.occurrences;
    } else {
      personalDataCount += f.occurrences;
    }

    dataTypeDistribution[f.dataTypeName] = (dataTypeDistribution[f.dataTypeName] || 0) + f.occurrences;

    for (const tag of f.complianceTags) {
      complianceBreakdown[tag] = (complianceBreakdown[tag] || 0) + f.occurrences;
    }
  }

  // Calculate overall risk score
  // If there are critical findings, overall score is elevated
  let overallRiskScore = 0;
  if (findings.length > 0) {
    const weightedSum = findings.reduce((acc, curr) => acc + curr.riskScore, 0);
    overallRiskScore = Math.min(100, Math.round(weightedSum / findings.length));
    if (criticalFindings > 0) {
      overallRiskScore = Math.max(overallRiskScore, 82);
    } else if (highFindings > 0) {
      overallRiskScore = Math.max(overallRiskScore, 65);
    }
  }

  let overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (overallRiskScore >= 80) overallRiskLevel = 'CRITICAL';
  else if (overallRiskScore >= 60) overallRiskLevel = 'HIGH';
  else if (overallRiskScore >= 35) overallRiskLevel = 'MEDIUM';

  return {
    totalFiles: files.length,
    totalFindings: findings.length,
    totalOccurrences,
    criticalFindings,
    highFindings,
    mediumFindings,
    lowFindings,
    personalDataCount,
    sensitivePersonalDataCount,
    overallRiskScore,
    overallRiskLevel,
    scannedAt: new Date().toISOString(),
    dataTypeDistribution,
    complianceBreakdown
  };
}
