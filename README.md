# PrivacyLens — Personal Data Discovery and Privacy Evidence Inventory (Hackathon PS-019)

PrivacyLens is an enterprise privacy compliance and automated personal data discovery tool that allows organizations, Data Protection Officers (DPOs), and security engineers to discover personally identifiable information (PII) and sensitive personal data across structured and unstructured datasets.

## Key Features

- **100% Client-Side Privacy Architecture**: No data leaves the browser. Scanning, regex tokenization, mathematical checksum verification, and reporting run exclusively in browser memory.
- **Cryptographic Provenance**: Every scanned file is hashed with SHA-256 via the native Web Crypto API (`crypto.subtle.digest`) to produce an immutable, tamper-evident audit trail.
- **Strict Zero-Leakage Masking**: Raw identities are never rendered in the UI or stored in plain state. Values are masked client-side (e.g., `ra****@gmail.com`, `XXXX-XXXX-1234`, `ABC****45F`).
- **Real Checksum Validation**:
  - **UIDAI Aadhaar**: 12-digit verification using the authentic **Verhoeff dihedral (D5)** algorithm (multiplication, permutation, and inverse tables).
  - **Payment Cards (PCI-DSS)**: 13–19 digit credit and debit card validation using the **Luhn mod 10** algorithm with automatic brand detection (Visa, MasterCard, Amex, RuPay).
  - **Indian PAN**: Formatted 10-char alphanumeric checking with entity status code verification.
  - **Indian Phone (+91)**: 10-digit mobile number parsing with country prefix handling.
  - **Financial Data**: Bank account and IFSC code validation.
  - **Online Identifiers**: IPv4 addresses, Passport numbers, and Date of Birth (DOB).
  - **Column Heuristics**: Automatic categorization of name and location data from structured headers.
- **Auditable Evidence Inventory**:
  - Filterable, searchable, and sortable table with unique Finding IDs.
  - Detail drawer containing masked samples, coordinate locations (row/column or line numbers), detection mechanism, and statutory compliance tags.
  - Remediation recommendations for DPDP Act 2023, GDPR Art. 9, and PCI-DSS v4.0.
- **Exportable Compliance Dossiers**:
  - Export inventory as CSV.
  - Export structured audit manifest as JSON.
  - Print/save PDF Executive Compliance Report with cryptographic ledger and sign-off blocks.
- **Built-in Sample Datasets**: One-click generation of realistic KYC CSV, staff payroll XLSX, and server access log files with mathematically valid sample Aadhaar and card numbers.

## Supported Formats
- `.csv` (Parsed with PapaParse)
- `.xlsx`, `.xls` (Parsed with SheetJS / xlsx)
- `.json` (Recursive object and array key-value walker)
- `.txt` (Line-by-line log parsing)

## Tech Stack
- **Framework**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Visualizations**: Recharts (Pie, Bar, Risk Distribution)
- **Parsing**: PapaParse, SheetJS (`xlsx`)
- **Crypto**: Native Web Crypto API (SHA-256)
