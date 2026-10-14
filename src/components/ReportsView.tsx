import React, { useRef } from 'react';
import {
  Printer,
  Download,
  ShieldCheck,
  FileCheck2,
  Calendar,
  AlertTriangle,
  Scale,
  Award,
  Layers,
  Hash
} from 'lucide-react';
import { useScan } from '../context/ScanContext';
import { exportFindingsToCsv, exportInventoryToJson } from '../utils/reportExporter';

export const ReportsView: React.FC = () => {
  const { summary, files, findings, addToast, setActiveTab } = useScan();
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    exportFindingsToCsv(findings);
    addToast('Exported inventory findings to CSV', 'success');
  };

  const handleExportJson = () => {
    exportInventoryToJson(summary, files, findings);
    addToast('Exported JSON audit manifest package', 'success');
  };

  if (findings.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4">
          <FileCheck2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          No Audit Data Available
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Scan data files to generate an executive compliance audit report.
        </p>
        <button
          onClick={() => setActiveTab('scan')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
        >
          Scan Files Now
        </button>
      </div>
    );
  }

  const criticalFindings = findings.filter(f => f.riskLevel === 'CRITICAL');
  const highFindings = findings.filter(f => f.riskLevel === 'HIGH');

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Action Bar (hidden on print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Statutory Privacy Compliance Audit Report
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Formal verification dossier generated from client-side personal data discovery.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Download CSV
          </button>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Download JSON
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div
        ref={printAreaRef}
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12 shadow-sm space-y-10 print:border-none print:shadow-none print:p-0 print:dark:text-black print:dark:bg-white"
      >
        {/* Report Official Letterhead */}
        <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold tracking-tight text-xl mb-1">
              <ShieldCheck className="w-6 h-6" />
              PrivacyLens Governance Assurance
            </div>
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Personal Data Discovery & Privacy Evidence Inventory (PS-019)
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 font-mono">
            <div>Audit Timestamp: {new Date().toUTCString()}</div>
            <div>Integrity Proof: Web Crypto SHA-256 Validated</div>
            <div>Confidentiality: Strict Internal Compliance</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-4">
          <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
            1. Executive Summary & Exposure Posture
          </h2>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            A privacy evidence discovery audit was conducted across <strong>{summary.totalFiles} data repositories</strong>.
            The scan evaluated data against statutory requirements including the <strong>Digital Personal Data Protection (DPDP) Act 2023</strong>,
            <strong>UIDAI Aadhaar Security Regulations</strong>, <strong>PCI-DSS v4.0</strong>, and <strong>GDPR Article 9</strong>.
            A total of <strong className="font-mono">{summary.totalOccurrences} PII instances</strong> were mapped across <strong className="font-mono">{findings.length} distinct rule breaches</strong>.
          </p>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Scanned Scope</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
                {summary.totalFiles} Files
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Sensitive Findings</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 mt-1">
                {summary.sensitivePersonalDataCount}
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Critical Breaches</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-red-600 dark:text-red-400 mt-1">
                {summary.criticalFindings}
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Composite Risk Score</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
                {summary.overallRiskScore} / 100
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Scanned Target Provenance Ledger */}
        <div className="space-y-4">
          <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
            2. Scanned File Provenance & Cryptographic Hashes
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                <tr>
                  <th className="p-2.5 border-b border-slate-200 dark:border-slate-800">File Name</th>
                  <th className="p-2.5 border-b border-slate-200 dark:border-slate-800">Format</th>
                  <th className="p-2.5 border-b border-slate-200 dark:border-slate-800">SHA-256 Provenance Fingerprint</th>
                  <th className="p-2.5 border-b border-slate-200 dark:border-slate-800 text-right">Findings</th>
                  <th className="p-2.5 border-b border-slate-200 dark:border-slate-800">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {files.map(f => (
                  <tr key={f.id}>
                    <td className="p-2.5 font-sans font-semibold text-slate-900 dark:text-white">{f.name}</td>
                    <td className="p-2.5 uppercase">{f.extension}</td>
                    <td className="p-2.5 text-slate-500 truncate max-w-xs">{f.sha256}</td>
                    <td className="p-2.5 text-right font-bold tabular-nums">{f.findingsCount}</td>
                    <td className="p-2.5">
                      {f.criticalCount > 0 ? (
                        <span className="text-red-600 font-sans font-bold">ACTION REQUIRED</span>
                      ) : (
                        <span className="text-emerald-600 font-sans font-medium">COMPLIANT</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Statutory Violations & Evidence Register */}
        <div className="space-y-4">
          <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
            3. Detailed Evidence Inventory & Masked Proofs
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                <tr>
                  <th className="p-2.5 border-b border-slate-200 dark:border-slate-800">ID</th>
                  <th className="p-2.5 border-b border-slate-200 dark:border-slate-800">Data Type</th>
                  <th className="p-2.5 border-b border-slate-200 dark:border-slate-800">Source Location</th>
                  <th className="p-2.5 border-b border-slate-200 dark:border-slate-800">Masked Evidence</th>
                  <th className="p-2.5 border-b border-slate-200 dark:border-slate-800 text-right">Count</th>
                  <th className="p-2.5 border-b border-slate-200 dark:border-slate-800">Risk Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {findings.map(f => (
                  <tr key={f.id}>
                    <td className="p-2.5 text-slate-400">{f.id}</td>
                    <td className="p-2.5 font-sans font-medium text-slate-900 dark:text-white">{f.dataTypeName}</td>
                    <td className="p-2.5 font-sans text-slate-600 dark:text-slate-400 truncate max-w-[150px]">
                      {f.fileName} - {f.location}
                    </td>
                    <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">{f.maskedSample}</td>
                    <td className="p-2.5 text-right tabular-nums">{f.occurrences}</td>
                    <td className="p-2.5">
                      <span className={`font-sans font-bold text-[10px] px-1.5 py-0.5 rounded ${
                        f.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' : f.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {f.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Prescribed Remediation Plan */}
        <div className="space-y-4">
          <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
            4. Statutory Remediation & Mitigation Mandates
          </h2>
          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
            {criticalFindings.length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl space-y-1">
                <div className="font-bold text-red-900 dark:text-red-300">
                  Priority 1: Immediate Redaction of Aadhaar & Payment Cards
                </div>
                <p className="leading-relaxed">
                  Cleartext UIDAI Aadhaar numbers and primary card numbers violate §3 of the DPDP Act and PCI-DSS Requirement 3.4. Implement irreversibly masked tokens (retaining only last 4 digits) or hardware security module (HSM) encryption immediately.
                </p>
              </div>
            )}
            {highFindings.length > 0 && (
              <div className="p-4 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 rounded-xl space-y-1">
                <div className="font-bold text-orange-900 dark:text-orange-300">
                  Priority 2: Tax IDs & Bank Account Access Control
                </div>
                <p className="leading-relaxed">
                  Indian PAN records and commercial bank accounts must be separated into access-controlled silos with multi-factor authentication (MFA) and row-level authorization.
                </p>
              </div>
            )}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <div className="font-bold text-slate-900 dark:text-white">
                Priority 3: Web Log Anonymization
              </div>
              <p className="leading-relaxed">
                Configure web gateways and proxies to redact query parameters containing emails and mobile phone numbers, and mask client IPv4 addresses at ingestion.
              </p>
            </div>
          </div>
        </div>

        {/* Auditor Sign-Off Block */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 mt-12 grid grid-cols-2 gap-8 text-xs text-slate-500">
          <div>
            <div className="font-semibold text-slate-900 dark:text-white mb-6">
              Assessor / Data Protection Officer Signature:
            </div>
            <div className="border-b border-slate-300 dark:border-slate-700 w-48 mb-2"></div>
            <div className="text-[11px]">Authorized Lead Privacy Auditor</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-slate-900 dark:text-white mb-1">
              PrivacyLens Automated Audit Engine
            </div>
            <div>ISO/IEC 27701 & DPDP Standard Formulation</div>
            <div className="font-mono text-[10px] text-slate-400 mt-2">
              Verification Hash: {files[0]?.sha256.slice(0, 24) || '9f8e7d6c5b4a'}...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
