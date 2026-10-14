import Papa from 'papaparse';
import { Finding, PrivacyScanSummary, ScannedFile } from '../types/privacy';

/**
 * Downloads a string as a file in the browser
 */
function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports findings as CSV
 */
export function exportFindingsToCsv(findings: Finding[], filename = 'privacylens_inventory_export.csv') {
  const rows = findings.map(f => ({
    Finding_ID: f.id,
    Source_File: f.fileName,
    File_SHA256: f.fileHash,
    Data_Type: f.dataTypeName,
    Category: f.category,
    Sensitivity_Tier: f.sensitivity,
    Location: f.location,
    Occurrences: f.occurrences,
    Masked_Evidence: f.maskedSample,
    Risk_Score: f.riskScore,
    Risk_Level: f.riskLevel,
    Confidence: `${Math.round(f.confidence * 100)}%`,
    Detection_Method: f.detectionMethod,
    Compliance_Tags: f.complianceTags.join('; '),
    Recommended_Mitigation: f.mitigationRecommendation,
    Detected_At: f.detectedAt
  }));

  const csv = Papa.unparse(rows);
  downloadBlob(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Exports complete auditable inventory as structured JSON
 */
export function exportInventoryToJson(
  summary: PrivacyScanSummary,
  files: ScannedFile[],
  findings: Finding[],
  filename = 'privacylens_audit_manifest.json'
) {
  const auditBundle = {
    generator: 'PrivacyLens v2.4 (Enterprise Evidence Inventory)',
    generatedAt: new Date().toISOString(),
    auditStandard: ['India DPDP Act 2023', 'ISO/IEC 27701:2021', 'GDPR Article 30', 'PCI-DSS v4.0'],
    executiveSummary: summary,
    scannedManifests: files.map(file => ({
      fileId: file.id,
      name: file.name,
      fileSizeBytes: file.size,
      sha256Hash: file.sha256,
      scannedAt: file.scannedAt,
      rowCount: file.rowCount,
      findingsDiscovered: file.findingsCount,
      riskTiers: {
        critical: file.criticalCount,
        high: file.highCount,
        medium: file.mediumCount,
        low: file.lowCount
      }
    })),
    evidenceInventory: findings.map(f => ({
      findingId: f.id,
      sourceFile: f.fileName,
      integrityHash: f.fileHash,
      location: f.location,
      dataType: f.dataType,
      label: f.dataTypeName,
      category: f.category,
      sensitivityRating: f.sensitivity,
      totalOccurrences: f.occurrences,
      maskedEvidenceSample: f.maskedSample,
      maskedSamplesPool: f.maskedSamplesList,
      detectionMechanism: f.detectionMethod,
      confidenceScore: f.confidence,
      riskAssessment: {
        score: f.riskScore,
        level: f.riskLevel
      },
      complianceJurisdictions: f.complianceTags,
      remediationPlan: f.mitigationRecommendation,
      timestamp: f.detectedAt
    }))
  };

  const json = JSON.stringify(auditBundle, null, 2);
  downloadBlob(json, filename, 'application/json');
}
