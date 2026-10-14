import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  FileCode,
  FileText,
  Trash2,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Shield,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useScan } from '../context/ScanContext';
import { formatBytes } from '../utils/crypto';

export const ScanView: React.FC = () => {
  const {
    files,
    processFiles,
    loadSampleData,
    removeFile,
    clearAllData,
    isScanning,
    scanProgress,
    scanStatusText,
    setActiveTab,
    addToast
  } = useScan();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    addToast('SHA-256 integrity hash copied to clipboard', 'info');
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getFileIcon = (ext: string) => {
    switch (ext) {
      case 'csv':
      case 'xlsx':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'json':
        return <FileCode className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      default:
        return <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Client-Side Personal Data Discovery
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Drag & drop structured or unstructured files. All scanning occurs in browser RAM without server upload.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadSampleData}
            disabled={isScanning}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Sample KYC & Payroll Data
          </button>
          {files.length > 0 && (
            <button
              onClick={clearAllData}
              disabled={isScanning}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              Clear Scanned
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar when Scanning */}
      {isScanning && (
        <div className="p-5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              {scanStatusText || 'Analyzing file contents...'}
            </span>
            <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
              {scanProgress}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".csv,.xlsx,.xls,.json,.txt"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/60 mx-auto flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div className="text-base font-semibold text-slate-900 dark:text-white">
            Choose files or drag & drop them here
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Supports <strong className="text-slate-700 dark:text-slate-200">.CSV, .XLSX, .XLS, .JSON, and .TXT</strong> files.
            Processes rows and columns locally in browser memory.
          </p>
          <div className="pt-2">
            <button
              type="button"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm pointer-events-none"
            >
              Select Files to Scan
            </button>
          </div>
        </div>
      </div>

      {/* Scanned Files Manifest Table */}
      {files.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Scanned Manifest ({files.length} Files)
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
            >
              Inspect Findings in Inventory
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-medium">File Name</th>
                  <th className="py-3 px-4 font-medium">Format</th>
                  <th className="py-3 px-4 font-medium">Size</th>
                  <th className="py-3 px-4 font-medium">SHA-256 Provenance Hash</th>
                  <th className="py-3 px-4 font-medium">Findings</th>
                  <th className="py-3 px-4 font-medium">Risk Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {files.map(file => (
                  <tr key={file.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white flex items-center gap-2.5">
                      {getFileIcon(file.extension)}
                      <span className="truncate max-w-xs">{file.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono uppercase text-slate-500">
                      {file.extension}
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      {formatBytes(file.size)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {file.sha256.slice(0, 10)}...{file.sha256.slice(-6)}
                        </span>
                        <button
                          onClick={() => copyHash(file.sha256)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                          title="Copy complete SHA-256 Hash"
                        >
                          {copiedHash === file.sha256 ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {file.findingsCount} rules
                    </td>
                    <td className="py-3.5 px-4">
                      {file.criticalCount > 0 ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded border uppercase text-red-700 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800">
                          Critical ({file.criticalCount})
                        </span>
                      ) : file.highCount > 0 ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded border uppercase text-orange-700 bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800">
                          High ({file.highCount})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded border uppercase text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800">
                          Low / Medium
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detection Rules Matrix */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Active Detection & Checksum Validation Engine
          </h3>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="font-semibold text-slate-900 dark:text-white mb-1">
              Indian Aadhaar Number (UIDAI)
            </div>
            <p className="text-[11px] leading-relaxed">
              Regex matching 12-digit patterns validated using the <strong>Verhoeff algorithm</strong> (dihedral D5 multiplication & permutation tables).
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="font-semibold text-slate-900 dark:text-white mb-1">
              Credit / Debit Card (PCI-DSS)
            </div>
            <p className="text-[11px] leading-relaxed">
              13-19 digit card numbers validated with the authentic <strong>Luhn (mod 10) algorithm</strong> + card issuer brand detection.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="font-semibold text-slate-900 dark:text-white mb-1">
              Permanent Account Number (PAN)
            </div>
            <p className="text-[11px] leading-relaxed">
              10-character alphanumeric Indian Tax ID with status character verification (P = Individual, C = Company, etc.).
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="font-semibold text-slate-900 dark:text-white mb-1">
              Indian Phone (+91) & Emails
            </div>
            <p className="text-[11px] leading-relaxed">
              10-digit mobile numbers starting 6-9 with country code prefixing and RFC 5322 email syntax validation.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="font-semibold text-slate-900 dark:text-white mb-1">
              Bank Accounts & IFSC Codes
            </div>
            <p className="text-[11px] leading-relaxed">
              11-char alphanumeric IFSC formats with zero fifth char; commercial bank account columns.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="font-semibold text-slate-900 dark:text-white mb-1">
              IPv4 Addresses & Passports
            </div>
            <p className="text-[11px] leading-relaxed">
              Octet network address boundaries (0-255) and Indian passport standards (1 letter + 7 digits).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
