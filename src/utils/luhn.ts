/**
 * Luhn Algorithm (Mod 10) Implementation for Payment Card Validation
 * Validates Visa, MasterCard, American Express, RuPay, Diners Club, Discover.
 */

export function validateLuhn(cardNumber: string): boolean {
  const clean = cardNumber.replace(/[\s-]/g, '');
  if (!/^\d{13,19}$/.test(clean)) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function generateLuhnChecksum(partialCardNumber: string): number {
  const clean = partialCardNumber.replace(/[\s-]/g, '');
  let sum = 0;
  let shouldDouble = true; // since the checksum digit will be appended at the end

  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return (10 - (sum % 10)) % 10;
}

export function getCardBrand(cardNumber: string): string {
  const clean = cardNumber.replace(/[\s-]/g, '');
  if (/^4/.test(clean)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'MasterCard';
  if (/^3[47]/.test(clean)) return 'American Express';
  if (/^(60|65|81|82|508)/.test(clean)) return 'RuPay';
  if (/^6(?:011|5)/.test(clean)) return 'Discover';
  return 'Credit/Debit Card';
}
