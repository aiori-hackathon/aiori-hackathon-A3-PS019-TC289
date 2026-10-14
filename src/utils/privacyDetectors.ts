import { PrivacyCategory, PrivacyDataType, RiskLevel } from '../types/privacy';
import { isValidAadhaar } from './verhoeff';
import { validateLuhn } from './luhn';

export interface DetectionRule {
  type: PrivacyDataType;
  name: string;
  category: PrivacyCategory;
  sensitivity: number; // 1 to 5
  description: string;
  complianceTags: string[];
  mitigation: string;
  detectValue: (value: string, headerName?: string) => { match: boolean; confidence: number; normalized?: string } | null;
}

// Regex patterns
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const PAN_REGEX = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/;
const INDIAN_PHONE_REGEX = /(?:(?:\+|0{0,2})91[\s-]?)?[6-9]\d{9}\b/;
const IPV4_REGEX = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
const PASSPORT_IN_REGEX = /\b[A-PR-WYa-pr-wy][0-9]{7}\b/;
const IFSC_REGEX = /\b[A-Z]{4}0[A-Z0-9]{6}\b/;

export const PRIVACY_RULES: DetectionRule[] = [
  {
    type: 'AADHAAR',
    name: 'Indian Aadhaar Number',
    category: 'SENSITIVE_PERSONAL_DATA',
    sensitivity: 5,
    description: '12-digit Indian national identity number validated via Verhoeff dihedral algorithm.',
    complianceTags: ['India DPDP Act 2023 §3', 'UIDAI Aadhaar Act 2016 §29', 'CERT-In'],
    mitigation: 'Immediately redact or mask in storage (retain only last 4 digits per UIDAI mandate). Never store cleartext Aadhaar in unencrypted logs or databases.',
    detectValue: (rawVal: string, headerName?: string) => {
      const str = String(rawVal).trim();
      const clean = str.replace(/[\s-]/g, '');

      // Check header hint
      const isAadhaarHeader = headerName && /aadhaar|uidai|adhaar|adhar/i.test(headerName);

      if (clean.length === 12 && /^[2-9]\d{11}$/.test(clean)) {
        if (isValidAadhaar(clean)) {
          return { match: true, confidence: isAadhaarHeader ? 1.0 : 0.95, normalized: clean };
        }
      }

      // Check if inside longer string with spaces or hyphens (XXXX XXXX XXXX)
      const regexMatch = str.match(/\b[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}\b/);
      if (regexMatch) {
        const candidate = regexMatch[0].replace(/[\s-]/g, '');
        if (candidate.length === 12 && isValidAadhaar(candidate)) {
          return { match: true, confidence: 0.92, normalized: candidate };
        }
      }

      return null;
    }
  },
  {
    type: 'CREDIT_CARD',
    name: 'Credit / Debit Card Number',
    category: 'SENSITIVE_PERSONAL_DATA',
    sensitivity: 5,
    description: '13-19 digit payment card primary account number validated via Luhn checksum algorithm.',
    complianceTags: ['PCI-DSS v4.0 Req 3.4', 'RBI Card-on-File Tokenization', 'ISO/IEC 7812'],
    mitigation: 'Mask PAN data; truncate all digits except first 6 and last 4 (or tokenise). Never store CVV/PIN. Restrict access strictly with tokenization.',
    detectValue: (rawVal: string, headerName?: string) => {
      const str = String(rawVal).trim();
      const clean = str.replace(/[\s-]/g, '');

      const isCardHeader = headerName && /card|credit|debit|pan_card|card_no|cc_num/i.test(headerName) && !/pan_number|pan_no/i.test(headerName);

      if (clean.length >= 13 && clean.length <= 19 && /^\d+$/.test(clean)) {
        if (validateLuhn(clean)) {
          return { match: true, confidence: isCardHeader ? 0.99 : 0.92, normalized: clean };
        }
      }

      // Inside text with format 1234-5678-9012-3456
      const formattedMatch = str.match(/\b(?:\d{4}[ -]?){3}\d{4}\b|\b\d{4}[ -]\d{6}[ -]\d{5}\b/);
      if (formattedMatch) {
        const candidate = formattedMatch[0].replace(/[\s-]/g, '');
        if (validateLuhn(candidate)) {
          return { match: true, confidence: 0.94, normalized: candidate };
        }
      }

      return null;
    }
  },
  {
    type: 'PAN',
    name: 'Indian PAN (Permanent Account Number)',
    category: 'SENSITIVE_PERSONAL_DATA',
    sensitivity: 4,
    description: '10-character alphanumeric Indian Income Tax identifier (5 letters + 4 digits + 1 letter).',
    complianceTags: ['India Income Tax Act 1961', 'DPDP Act 2023', 'RBI KYC Norms'],
    mitigation: 'PAN should be stored encrypted at rest. Display only masked values with middle digits hidden.',
    detectValue: (rawVal: string, headerName?: string) => {
      const str = String(rawVal).trim().toUpperCase();
      const isPanHeader = headerName && /(?:^|_)pan(?:$|_)|pan_card|pan_number|tax_id/i.test(headerName);

      const match = str.match(PAN_REGEX);
      if (match) {
        // Validate 4th character typically denotes status: P(person), C(company), H(HUF), F(firm), A(AOP), T(trust), B, L, J, G
        const panStr = match[0];
        const statusChar = panStr.charAt(3);
        const validStatuses = ['P', 'C', 'H', 'F', 'A', 'T', 'B', 'L', 'J', 'G'];
        const isValidStatus = validStatuses.includes(statusChar);

        return {
          match: true,
          confidence: isPanHeader ? 1.0 : (isValidStatus ? 0.95 : 0.85),
          normalized: panStr
        };
      }
      return null;
    }
  },
  {
    type: 'PASSPORT',
    name: 'Passport Number',
    category: 'SENSITIVE_PERSONAL_DATA',
    sensitivity: 4,
    description: 'Official national travel document identifier (Indian standard: 1 letter + 7 digits).',
    complianceTags: ['ICAO 9303', 'DPDP Act 2023', 'GDPR Art. 9'],
    mitigation: 'Passport data is sensitive government ID. Store under AES-256 and restrict role-based access.',
    detectValue: (rawVal: string, headerName?: string) => {
      const str = String(rawVal).trim();
      const isPassportHeader = headerName && /passport|travel_doc/i.test(headerName);

      if (PASSPORT_IN_REGEX.test(str)) {
        return { match: true, confidence: isPassportHeader ? 0.98 : 0.82, normalized: str.toUpperCase() };
      }
      return null;
    }
  },
  {
    type: 'BANK_ACCOUNT',
    name: 'Bank Account Number',
    category: 'SENSITIVE_PERSONAL_DATA',
    sensitivity: 4,
    description: 'Commercial bank account number (9 to 18 digits in designated account columns).',
    complianceTags: ['RBI Banking Guidelines', 'PCI-DSS', 'DPDP Act 2023'],
    mitigation: 'Truncate account numbers in logs; enforce strict access controls and tokenization.',
    detectValue: (rawVal: string, headerName?: string) => {
      const str = String(rawVal).trim().replace(/[\s-]/g, '');
      const isAccountHeader = headerName && /(?:^|_)bank_acc(?:ount)?|acc(?:ount)?_no|acct_num|beneficiary_acc/i.test(headerName);

      if (/^\d{9,18}$/.test(str)) {
        if (isAccountHeader) {
          return { match: true, confidence: 0.95, normalized: str };
        }
      }
      return null;
    }
  },
  {
    type: 'DOB',
    name: 'Date of Birth',
    category: 'SENSITIVE_PERSONAL_DATA',
    sensitivity: 3,
    description: 'Calendar birth date (DD/MM/YYYY, YYYY-MM-DD) indicating individual age and demographics.',
    complianceTags: ['DPDP Act 2023 §9 (Children Data)', 'GDPR Art. 4', 'COPPA'],
    mitigation: 'Age verification should prefer zero-knowledge proofs or boolean age confirmation rather than raw DOB storage.',
    detectValue: (rawVal: string, headerName?: string) => {
      const str = String(rawVal).trim();
      const isDobHeader = headerName && /dob|birth_date|date_of_birth|birthdate|born/i.test(headerName);

      // Patterns: YYYY-MM-DD or DD/MM/YYYY or DD-MM-YYYY
      const dateMatch = str.match(/\b(19\d\d|20[0-2]\d)[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])\b|\b(0[1-9]|[12]\d|3[01])[-/](0[1-9]|1[0-2])[-/](19\d\d|20[0-2]\d)\b/);

      if (dateMatch) {
        return { match: true, confidence: isDobHeader ? 0.98 : 0.75, normalized: str };
      }
      if (isDobHeader && str.length > 5 && !isNaN(Date.parse(str))) {
        return { match: true, confidence: 0.9, normalized: str };
      }
      return null;
    }
  },
  {
    type: 'EMAIL',
    name: 'Email Address',
    category: 'PERSONAL_DATA',
    sensitivity: 2,
    description: 'Standard electronic mail address identifiable to an individual user.',
    complianceTags: ['GDPR Art. 6', 'DPDP Act 2023', 'CAN-SPAM'],
    mitigation: 'Obtain informed opt-in consent for processing; pseudonymize in analytic pipelines.',
    detectValue: (rawVal: string, headerName?: string) => {
      const str = String(rawVal).trim();
      const isEmailHeader = headerName && /email|e_mail|mail_address/i.test(headerName);

      const match = str.match(EMAIL_REGEX);
      if (match) {
        // Exclude dummy placeholders like user@example.com unless desired
        return { match: true, confidence: isEmailHeader ? 1.0 : 0.95, normalized: match[0].toLowerCase() };
      }
      return null;
    }
  },
  {
    type: 'PHONE_IN',
    name: 'Indian Phone Number',
    category: 'PERSONAL_DATA',
    sensitivity: 2,
    description: '10-digit mobile number with or without Indian country code (+91 / 0) starting with 6-9.',
    complianceTags: ['TRAI DND Regulations', 'DPDP Act 2023', 'DoT Telecommunications'],
    mitigation: 'Never log mobile numbers in application debug logs. Maintain consent ledger for communications.',
    detectValue: (rawVal: string, headerName?: string) => {
      const str = String(rawVal).trim();
      const isPhoneHeader = headerName && /phone|mobile|cell|contact_no|tel|whatsapp/i.test(headerName);

      const clean = str.replace(/[\s\-()]/g, '');

      if (/^(?:\+91|0)?[6-9]\d{9}$/.test(clean)) {
        return { match: true, confidence: isPhoneHeader ? 1.0 : 0.9, normalized: clean };
      }

      const match = str.match(INDIAN_PHONE_REGEX);
      if (match && isPhoneHeader) {
        return { match: true, confidence: 0.92, normalized: match[0] };
      }
      return null;
    }
  },
  {
    type: 'IPV4',
    name: 'IPv4 Address',
    category: 'PERSONAL_DATA',
    sensitivity: 2,
    description: 'Internet Protocol address classified as online personal identifier under privacy jurisprudence.',
    complianceTags: ['GDPR Recital 49 & Art. 4', 'CJEU Breyer Ruling C-582/14', 'DPDP Act 2023'],
    mitigation: 'Anonymize or truncate client IP addresses in web logs (e.g. zero the last octet /24).',
    detectValue: (rawVal: string, headerName?: string) => {
      const str = String(rawVal).trim();
      const isIpHeader = headerName && /ip|client_ip|remote_addr|host_ip/i.test(headerName);

      const match = str.match(IPV4_REGEX);
      if (match) {
        const ip = match[0];
        // Exclude common loopback or multicast
        if (ip === '127.0.0.1' || ip === '0.0.0.0' || ip === '255.255.255.255') {
          return { match: true, confidence: 0.5, normalized: ip };
        }
        return { match: true, confidence: isIpHeader ? 0.98 : 0.88, normalized: ip };
      }
      return null;
    }
  },
  {
    type: 'IFSC',
    name: 'Indian Financial System Code (IFSC)',
    category: 'PERSONAL_DATA',
    sensitivity: 2,
    description: '11-character alphanumeric code identifying bank branch for electronic transfers.',
    complianceTags: ['RBI RTGS/NEFT Guidelines'],
    mitigation: 'Verify branch associations; avoid pairing IFSC directly with unmasked account holders.',
    detectValue: (rawVal: string, headerName?: string) => {
      const str = String(rawVal).trim().toUpperCase();
      const isIfscHeader = headerName && /ifsc|bank_code/i.test(headerName);

      const match = str.match(IFSC_REGEX);
      if (match) {
        return { match: true, confidence: isIfscHeader ? 1.0 : 0.9, normalized: match[0] };
      }
      return null;
    }
  },
  {
    type: 'PERSON_NAME',
    name: 'Person Full Name',
    category: 'PERSONAL_DATA',
    sensitivity: 2,
    description: 'Individual full or partial name detected via structured column headers.',
    complianceTags: ['DPDP Act 2023', 'GDPR Art. 4', 'OECD Guidelines'],
    mitigation: 'Minimize transmission across data silos; mask names in analytics and testing copies.',
    detectValue: (rawVal: string, headerName?: string) => {
      const str = String(rawVal).trim();
      if (!str || str.length < 3 || str.length > 50) return null;
      if (/\d/.test(str)) return null; // Names don't contain digits

      const isNameHeader = headerName && /^(?:customer_|client_|employee_|user_|patient_)?(?:full_)?name$|^first_name$|^last_name$/i.test(headerName);

      if (isNameHeader) {
        // Words separated by spaces, capitalized or normal words
        if (/^[A-Za-z\s.'-]+$/.test(str) && str.split(' ').length <= 4) {
          return { match: true, confidence: 0.94, normalized: str };
        }
      }
      return null;
    }
  },
  {
    type: 'ADDRESS',
    name: 'Postal Address / Location',
    category: 'PERSONAL_DATA',
    sensitivity: 2,
    description: 'Physical residential or workplace address detected via location column headers.',
    complianceTags: ['DPDP Act 2023', 'GDPR Art. 4'],
    mitigation: 'Aggregate geographical data to higher-level districts or pincodes to preserve anonymity.',
    detectValue: (rawVal: string, headerName?: string) => {
      const str = String(rawVal).trim();
      if (!str || str.length < 6 || str.length > 150) return null;

      const isAddressHeader = headerName && /address|street|residence|postal_address|billing_address|shipping_address/i.test(headerName);

      if (isAddressHeader) {
        return { match: true, confidence: 0.92, normalized: str };
      }
      return null;
    }
  }
];

/**
 * Calculates quantitative risk score and category according to:
 * - Data sensitivity weight (1-5)
 * - Occurrences volume
 * - Sensitive status (Aadhaar / Card / PAN / Passport)
 */
export function calculateRisk(
  category: PrivacyCategory,
  sensitivity: number,
  occurrences: number
): { riskScore: number; riskLevel: RiskLevel } {
  // Base score from sensitivity (20 points per sensitivity tier)
  const baseScore = sensitivity * 16; // 16 to 80

  // Volume factor using logarithmic scale: 1 -> 0, 10 -> ~6.6, 100 -> ~13.3, 1000 -> 20
  const volumeMultiplier = Math.min(20, Math.log10(Math.max(1, occurrences)) * 10);

  // Bonus weight if sensitive personal data
  const sensitiveBonus = category === 'SENSITIVE_PERSONAL_DATA' ? 10 : 0;

  const rawScore = Math.min(100, Math.round(baseScore + volumeMultiplier + sensitiveBonus));

  let riskLevel: RiskLevel;
  if (rawScore >= 80 || (sensitivity === 5 && occurrences >= 1)) {
    riskLevel = 'CRITICAL';
  } else if (rawScore >= 60 || (sensitivity >= 4 && occurrences >= 5)) {
    riskLevel = 'HIGH';
  } else if (rawScore >= 35) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  return { riskScore: rawScore, riskLevel };
}
