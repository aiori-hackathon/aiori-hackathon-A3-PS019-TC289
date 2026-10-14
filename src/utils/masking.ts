import { PrivacyDataType } from '../types/privacy';

/**
 * Privacy by Design: Irreversible client-side redaction and masking.
 * Never exposes raw personally identifiable values in UI or state.
 */
export function maskSensitiveValue(value: string, dataType: PrivacyDataType): string {
  const trimmed = String(value).trim();
  if (!trimmed) return '****';

  switch (dataType) {
    case 'EMAIL': {
      const parts = trimmed.split('@');
      if (parts.length === 2) {
        const name = parts[0];
        const domain = parts[1];
        if (name.length <= 2) {
          return `${name[0]}*@${domain}`;
        }
        return `${name.slice(0, 2)}${'*'.repeat(Math.max(4, name.length - 2))}@${domain}`;
      }
      return `${trimmed.slice(0, 2)}****@***.com`;
    }

    case 'AADHAAR': {
      const clean = trimmed.replace(/\s|-/g, '');
      const last4 = clean.slice(-4);
      return `XXXX-XXXX-${last4}`;
    }

    case 'PAN': {
      const clean = trimmed.toUpperCase().replace(/\s/g, '');
      if (clean.length === 10) {
        return `${clean.slice(0, 3)}****${clean.slice(7)}`;
      }
      return `${clean.slice(0, 2)}****${clean.slice(-2)}`;
    }

    case 'CREDIT_CARD': {
      const clean = trimmed.replace(/[\s-]/g, '');
      const last4 = clean.slice(-4);
      if (clean.length === 15) {
        return `XXXX-XXXXXX-X${last4.slice(1)}`;
      }
      return `XXXX-XXXX-XXXX-${last4}`;
    }

    case 'PHONE_IN': {
      const clean = trimmed.replace(/[\s-]/g, '');
      if (clean.startsWith('+91') && clean.length >= 12) {
        const number = clean.slice(3);
        return `+91 ${number.slice(0, 2)}****${number.slice(-4)}`;
      }
      if (clean.length === 10) {
        return `${clean.slice(0, 2)}****${clean.slice(-4)}`;
      }
      return `${trimmed.slice(0, 3)}****${trimmed.slice(-3)}`;
    }

    case 'IPV4': {
      const octets = trimmed.split('.');
      if (octets.length === 4) {
        return `${octets[0]}.${octets[1]}.***.***`;
      }
      return `${trimmed.slice(0, 6)}***.***`;
    }

    case 'DOB': {
      if (trimmed.includes('-')) {
        const parts = trimmed.split('-');
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          return `${parts[0]}-**-**`;
        }
        // DD-MM-YYYY
        return `**-**-${parts[2] || parts[0]}`;
      }
      if (trimmed.includes('/')) {
        const parts = trimmed.split('/');
        return `**/**/${parts[2] || '****'}`;
      }
      return `**/**/****`;
    }

    case 'PASSPORT': {
      const clean = trimmed.toUpperCase().replace(/\s/g, '');
      if (clean.length >= 8) {
        return `${clean[0]}****${clean.slice(-3)}`;
      }
      return `${clean.slice(0, 2)}****${clean.slice(-2)}`;
    }

    case 'BANK_ACCOUNT': {
      const clean = trimmed.replace(/[\s-]/g, '');
      if (clean.length >= 8) {
        return `${'X'.repeat(Math.max(6, clean.length - 4))}${clean.slice(-4)}`;
      }
      return `XXXXXX${clean.slice(-3)}`;
    }

    case 'IFSC': {
      const clean = trimmed.toUpperCase().replace(/\s/g, '');
      if (clean.length === 11) {
        return `${clean.slice(0, 4)}0****${clean.slice(-2)}`;
      }
      return `${clean.slice(0, 4)}****`;
    }

    case 'PERSON_NAME': {
      const words = trimmed.split(/\s+/);
      return words
        .map(w => {
          if (w.length <= 1) return w;
          return `${w[0]}${'*'.repeat(Math.min(5, Math.max(3, w.length - 1)))}`;
        })
        .join(' ');
    }

    case 'ADDRESS': {
      const words = trimmed.split(/,\s*/);
      if (words.length > 1) {
        const maskedParts = words.map((part, idx) => {
          if (idx === 0) {
            const first = part.split(' ');
            return `${first[0]} ${first.slice(1).map(w => `${w[0]}****`).join(' ')}`;
          }
          return `${part.trim()[0]}****`;
        });
        return maskedParts.join(', ');
      }
      return `${trimmed.slice(0, 4)}**** [Redacted Address]`;
    }

    default: {
      if (trimmed.length <= 4) return '****';
      return `${trimmed.slice(0, 2)}****${trimmed.slice(-2)}`;
    }
  }
}
