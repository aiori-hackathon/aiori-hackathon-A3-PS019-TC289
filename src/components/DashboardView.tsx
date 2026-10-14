import React from 'react';
import {
  ShieldAlert,
  Files,
  Database,
  AlertOctagon,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  FileSpreadsheet,
  Lock,
  ExternalLink
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useScan } from '../context/ScanContext';
import { Finding } from '../types/privacy';

const COLORS = [
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#64748B'  // Slate
];

const RISK_COLORS: Record<string, string> = {
  CRITICAL: '#EF4444',
  HIGH: '#F97316',
  MEDIUM: '#F59E0B',
  LOW: '#10B981'
};

export const DashboardView: React.FC = () => {
  const { files, findings, summary, setActiveTab, setSelectedFinding, loadSampleData, isScanning } = useScan();

  const pieData = Object.entries(summary.dataTypeDistribution).map(([name, value]) => ({
    name,
    value
  }));

  const fileFindingsData = files.map(file => ({
    name: file.name.length > 18 ? `${file.name.slice(0, 16)}...` : file.name,
    fullName: file.name,
    findings: file.findingsCount,
    critical: file.criticalCount + file.highCount
  }));

  const riskBreakdownData = [
    { name: 'Critical', count: summary.criticalFindings, color: '#EF4444' },
    { name: 'High', count: summary.highFindings, color: '#F97316' },
    { name: 'Medium', count: summary.mediumFindings, color: '#F59E0B' },
    { name: 'Low', count: summary.lowFindings, color: '#10B981' }
  ];

  // Critical/High findings for quick review
  const criticalFindings = findings
    .filter(f => f.riskLevel === 'CRITICAL' || f.riskLevel === 'HIGH')
    .slice(0, 5);

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

  if (files.length === 0) {
    return (
      <div className="py-12 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl mb-4 text-indigo-600 dark:text-indigo-400">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            Automated Personal Data Discovery & Evidence Inventory
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Scan files locally in your browser to discover sensitive personal data (Aadhaar, PAN, payment cards, phone, email, and PII). Generate an auditable evidence inventory with zero unmasked data leakage.
          </p>
        </div>

        {/* Quick Launch Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Instant Demo with Realistic Datasets
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Test the scanner immediately with pre-generated sample files: customer KYC CSV (valid Verhoeff Aadhaar & PAN), staff payroll XLSX (Luhn payment cards & IFSC), and web access logs (IPs & emails).
              </p>
            </div>
            <button
              onClick={loadSampleData}
              disabled={isScanning}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {isScanning ? 'Processing Samples...' : 'Load Built-In Sample Datasets'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <UploadCloud className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Upload Custom Organization Files
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Drop your own CSV, Excel (.xlsx, .xls), JSON or TXT files. All data is processed 100% in local memory with cryptographic SHA-256 hashes for proof of compliance.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('scan')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Go to File Upload Scanner
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feature Highlights Strip */}
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            Auditing Capabilities & Verification Algorithms
          </h4>
          <div className="grid sm:grid-cols-3 gap-6 text-sm text-slate-600 dark:text-slate-400">
            <div>
              <div className="font-medium text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Algorithmic Checksums
              </div>
              <p className="text-xs leading-relaxed">
                Verhoeff D5 dihedral algorithm for UIDAI Aadhaar verification; Luhn mod 10 for Visa, MasterCard, and RuPay card sequences.
              </p>
            </div>
            <div>
              <div className="font-medium text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Privacy by Design
              </div>
              <p className="text-xs leading-relaxed">
                Zero raw data storage. Every discovered token is irreversibly masked in memory with sha-256 source provenance hashes.
              </p>
            </div>
            <div>
              <div className="font-medium text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Statutory Compliance
              </div>
              <p className="text-xs leading-relaxed">
                Automatic alignment to India DPDP Act 2023, GDPR Art. 9, and PCI-DSS v4.0 with exportable CSV, JSON, and PDF audit reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Privacy Governance & Evidence Dashboard
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>Audit Scope: {summary.totalFiles} files</span>
            <span aria-hidden="true">·</span>
            <span>Last Scanned: {new Date(summary.scannedAt).toLocaleTimeString()}</span>
            <span aria-hidden="true">·</span>
            <span>100% In-Memory Processing</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('scan')}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            + Add Files
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            Export Compliance Report
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Files Scanned</span>
            <Files className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {summary.totalFiles}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            CSV, XLSX, JSON & Logs verified
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">PII Instances</span>
            <Database className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {summary.totalOccurrences}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2">
            <span className="text-rose-600 dark:text-rose-400 font-semibold">{summary.sensitivePersonalDataCount} Sensitive</span>
            <span aria-hidden="true">·</span>
            <span>{summary.personalDataCount} Personal</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Critical & High Risks</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
            {summary.criticalFindings + summary.highFindings}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Requires immediate masking or tokenization
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Overall Risk Index</span>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase ${getRiskBadge(summary.overallRiskLevel)}`}>
              {summary.overallRiskLevel}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {summary.overallRiskScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                summary.overallRiskLevel === 'CRITICAL'
                  ? 'bg-red-500'
                  : summary.overallRiskLevel === 'HIGH'
                  ? 'bg-orange-500'
                  : summary.overallRiskLevel === 'MEDIUM'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${summary.overallRiskScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Privacy Data Types Found */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            Data Types Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Instances discovered by category
          </p>
          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#F8FAFC'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Findings per File */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            Discovered Findings per File
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Total unique privacy rules triggered
          </p>
          <div className="h-64">
            {fileFindingsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fileFindingsData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#F8FAFC'
                    }}
                  />
                  <Bar dataKey="findings" fill="#6366F1" radius={[4, 4, 0, 0]} name="Total Findings" />
                  <Bar dataKey="critical" fill="#EF4444" radius={[4, 4, 0, 0]} name="Critical/High" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No files scanned
              </div>
            )}
          </div>
        </div>

        {/* Chart 3: Risk Breakdown */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            Risk Tier Classification
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Findings segmented by severity
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskBreakdownData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} tickLine={false} width={65} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F8FAFC'
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {riskBreakdownData.map((entry, index) => (
                    <Cell key={`risk-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical & High Priority Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              High-Exposure Sensitive Findings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Identities, financial accounts and statutory identifiers requiring immediate redaction
            </p>
          </div>
          <button
            onClick={() => setActiveTab('inventory')}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            View All ({findings.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {criticalFindings.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {criticalFindings.map(finding => (
              <div
                key={finding.id}
                onClick={() => setSelectedFinding(finding)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      {finding.dataTypeName}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase ${getRiskBadge(finding.riskLevel)}`}>
                      {finding.riskLevel}
                    </span>
                    <span className="text-xs text-slate-400 font-mono tabular-nums">
                      {finding.occurrences} instances
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>File: {finding.fileName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{finding.location}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-600 dark:text-slate-300">
                      Sample: {finding.maskedSample}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-mono font-semibold text-slate-900 dark:text-white">
                      Score: {finding.riskScore}/100
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {finding.detectionMethod.split(' ')[0]} verified
                    </div>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedFinding(finding);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                    title="Inspect evidence details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No critical or high risk findings detected. All items are in low or medium categories.
          </div>
        )}
      </div>
    </div>
  );
};
