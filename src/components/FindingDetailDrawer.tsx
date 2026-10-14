import React, { useEffect } from 'react';
import {
  X,
  ShieldAlert,
  FileText,
  Hash,
  MapPin,
  CheckCircle,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { Finding } from '../types/privacy';
import { useScan } from '../context/ScanContext';

interface FindingDetailDrawerProps {
  finding: Finding | null;
  onClose: () => void;
}

export const FindingDetailDrawer: React.FC<FindingDetailDrawerProps> = ({ finding, onClose }) => {
  const { addToast } = useScan();
  const [copiedHash, setCopiedHash] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!finding) return null;

  const copyFileHash = () => {
    navigator.clipboard.writeText(finding.fileHash);
    setCopiedHash(true);
    addToast('Cryptographic SHA-256 integrity hash copied', 'info');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800';
      case 'HIGH':
        return 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800';
      case 'MEDIUM':
        return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
      default:
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end transition-opacity">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col z-10 border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-900">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                {finding.id}
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase ${getRiskBadge(finding.riskLevel)}`}>
                {finding.riskLevel} Risk
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {finding.dataTypeName}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{finding.category === 'SENSITIVE_PERSONAL_DATA' ? 'Sensitive Personal Data' : 'Personal Data'}</span>
              <span aria-hidden="true">·</span>
              <span>Sensitivity Tier: {finding.sensitivity}/5</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Masked Evidence Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Masked Evidence Samples ({finding.occurrences} Instances)
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Redacted in RAM
              </span>
            </div>
            <div className="space-y-1.5">
              {finding.maskedSamplesList.map((sample, idx) => (
                <div
                  key={idx}
                  className="font-mono text-xs font-semibold px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 flex items-center justify-between"
                >
                  <span>{sample}</span>
                  <span className="text-[10px] font-sans text-slate-400 font-normal">Sample #{idx + 1}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Per Privacy by Design mandate, raw unmasked identities are never stored or rendered in client views.
            </p>
          </div>

          {/* Location & File Origin */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              File Provenance & Coordinates
            </h4>
            <div className="grid grid-cols-1 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>Source File:</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">
                  {finding.fileName}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <span>Discovered Location:</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {finding.location}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Hash className="w-4 h-4 text-indigo-500" />
                  <span>SHA-256 Hash:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {finding.fileHash.slice(0, 12)}...{finding.fileHash.slice(-6)}
                  </span>
                  <button
                    onClick={copyFileHash}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                    title="Copy SHA-256 hash"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Detection & Checksum Mechanism */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Detection Rule & Validation Mechanism
            </h4>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {finding.detectionMethod}
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round(finding.confidence * 100)}% Confidence
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Triggered matching rule pattern and passed cryptographic or mathematical checksum tests (such as Verhoeff D5 for Aadhaar or Luhn mod 10 for card numbers).
              </p>
            </div>
          </div>

          {/* Compliance & Regulatory Exposure */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Applicable Regulatory Frameworks
            </h4>
            <div className="flex flex-wrap gap-2">
              {finding.complianceTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Mitigation Guidance */}
          <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 dark:text-indigo-300">
              <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Recommended Mitigation Strategy
            </div>
            <p className="text-xs text-indigo-800 dark:text-indigo-300/90 leading-relaxed">
              {finding.mitigationRecommendation}
            </p>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">
            Detected: {new Date(finding.detectedAt).toLocaleString()}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
