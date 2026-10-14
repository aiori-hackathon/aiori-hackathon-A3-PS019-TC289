export type PrivacyDataType =
  | 'AADHAAR'
  | 'PAN'
  | 'CREDIT_CARD'
  | 'BANK_ACCOUNT'
  | 'PASSPORT'
  | 'DOB'
  | 'EMAIL'
  | 'PHONE_IN'
  | 'IPV4'
  | 'IFSC'
  | 'PERSON_NAME'
  | 'ADDRESS';

export type PrivacyCategory = 'PERSONAL_DATA' | 'SENSITIVE_PERSONAL_DATA';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Finding {
  id: string;
  fileId: string;
  fileName: string;
  fileHash: string; // SHA-256 hash for integrity
  location: string; // e.g. 'Row 14, Column "aadhaar_no"' or 'Line 188'
  columnOrField?: string;
  rowOrLineNumber?: number;
  dataType: PrivacyDataType;
  dataTypeName: string;
  category: PrivacyCategory;
  sensitivity: number; // 1 to 5 scale
  occurrences: number;
  maskedSample: string;
  maskedSamplesList: string[];
  rawSamplesCount: number;
  detectionMethod: string;
  confidence: number; // 0.0 to 1.0
  detectedAt: string; // ISO 8601 string
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  contextSnippet?: string;
  complianceTags: string[];
  mitigationRecommendation: string;
}

export interface ScannedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  extension: 'csv' | 'xlsx' | 'json' | 'txt' | 'other';
  sha256: string;
  scannedAt: string;
  status: 'pending' | 'scanning' | 'completed' | 'error';
  errorMessage?: string;
  findingsCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  rowCount?: number;
  previewSnippet?: string;
}

export interface PrivacyScanSummary {
  totalFiles: number;
  totalFindings: number;
  totalOccurrences: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  personalDataCount: number;
  sensitivePersonalDataCount: number;
  overallRiskScore: number; // 0 to 100
  overallRiskLevel: RiskLevel;
  scannedAt: string;
  dataTypeDistribution: Record<string, number>;
  complianceBreakdown: Record<string, number>;
}
