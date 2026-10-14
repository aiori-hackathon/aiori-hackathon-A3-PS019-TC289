/**
 * Verhoeff Algorithm Implementation for Aadhaar Card Number Validation
 * Aadhaar is a 12-digit unique identity number issued by UIDAI.
 * The 12th digit is a checksum computed using the Verhoeff dihedral D5 algorithm.
 */

// The multiplication table (d)
const d: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

// The permutation table (p)
const p: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

// The inverse table (inv)
const inv: number[] = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/**
 * Validates whether a number string satisfies the Verhoeff algorithm.
 */
export function validateVerhoeff(str: string): boolean {
  const clean = str.replace(/\s|-/g, '');
  if (!/^\d+$/.test(clean)) return false;

  let c = 0;
  const digits = clean.split('').map(d => parseInt(d, 10)).reverse();

  for (let i = 0; i < digits.length; i++) {
    c = d[c][p[i % 8][digits[i]]];
  }

  return c === 0;
}

/**
 * Calculates the Verhoeff checksum digit for a given digit string.
 * Used to construct authentic test Aadhaar numbers for the demo.
 */
export function generateVerhoeffChecksum(str: string): number {
  const clean = str.replace(/\s|-/g, '');
  let c = 0;
  const digits = clean.split('').map(d => parseInt(d, 10)).reverse();

  for (let i = 0; i < digits.length; i++) {
    c = d[c][p[(i + 1) % 8][digits[i]]];
  }

  return inv[c];
}

/**
 * Validates an Indian Aadhaar number format and Verhoeff check.
 * Aadhaar should not start with 0 or 1.
 */
export function isValidAadhaar(aadhaar: string): boolean {
  const clean = aadhaar.replace(/\s|-/g, '');
  if (clean.length !== 12) return false;
  if (!/^[2-9]\d{11}$/.test(clean)) return false;
  return validateVerhoeff(clean);
}
