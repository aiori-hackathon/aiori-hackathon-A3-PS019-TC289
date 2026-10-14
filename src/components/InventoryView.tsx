import React, { useMemo, useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useScan } from '../context/ScanContext';
import { Finding, RiskLevel } from '../types/privacy';
import { exportFindingsToCsv, exportInventoryToJson } from '../utils/reportExporter';

type SortField = 'id' | 'fileName' | 'dataTypeName' | 'sensitivity' | 'occurrences' | 'riskScore' | 'detectedAt';

export const InventoryView: React.FC = () => {
  const { findings, files, summary, setSelectedFinding, setActiveTab, addToast } = useScan();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDataType, setSelectedDataType] = useState<string>('ALL');
  const [selectedFile, setSelectedFile] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('riskScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Unique data types for dropdown
  const uniqueDataTypes = useMemo(() => {
    return Array.from(new Set(findings.map(f => f.dataTypeName))).sort();
  }, [findings]);

  // Unique file names
  const uniqueFileNames = useMemo(() => {
    return Array.from(new Set(findings.map(f => f.fileName))).sort();
  }, [findings]);

  // Filtered & Sorted findings
  const filteredFindings = useMemo(() => {
    return findings
      .filter(f => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            f.id.toLowerCase().includes(q) ||
            f.fileName.toLowerCase().includes(q) ||
            f.dataTypeName.toLowerCase().includes(q) ||
            f.location.toLowerCase().includes(q) ||
            f.maskedSample.toLowerCase().includes(q) ||
            f.complianceTags.some(t => t.toLowerCase().includes(q));
          if (!match) return false;
        }

        // Risk level filter
        if (selectedRisk !== 'ALL' && f.riskLevel !== selectedRisk) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'ALL' && f.category !== selectedCategory) {
          return false;
        }

        // Data type filter
        if (selectedDataType !== 'ALL' && f.dataTypeName !== selectedDataType) {
          return false;
        }

        // File filter
        if (selectedFile !== 'ALL' && f.fileName !== selectedFile) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: string | number = a[sortField];
        let valB: string | number = b[sortField];

        if (typeof valA === 'string') {
          return sortDirection === 'asc'
            ? valA.localeCompare(valB as string)
            : (valB as string).localeCompare(valA);
        } else {
          return sortDirection === 'asc'
            ? (valA as number) - (valB as number)
            : (valB as number) - (valA as number);
        }
      });
  }, [
    findings,
    searchQuery,
    selectedRisk,
    selectedCategory,
    selectedDataType,
    selectedFile,
    sortField,
    sortDirection
  ]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredFindings.length / itemsPerPage));
  const paginatedFindings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFindings.slice(start, start + itemsPerPage);
  }, [filteredFindings, currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getRiskBadge = (level: RiskLevel) => {
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

  const handleExportCsv = () => {
    exportFindingsToCsv(filteredFindings);
    addToast(`Exported ${filteredFindings.length} findings to CSV`, 'success');
  };

  const handleExportJson = () => {
    exportInventoryToJson(summary, files, filteredFindings);
    addToast('Exported auditable JSON manifest bundle', 'success');
  };

  if (findings.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Evidence Inventory is Empty
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Scan structured CSV/Excel files or plain text logs to discover personal and sensitive data.
        </p>
        <button
          onClick={() => setActiveTab('scan')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
        >
          Go to File Scanner
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Personal Data Evidence Inventory
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Auditable register of discovered identities, masked samples, coordinates, and risk tiers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Live Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, rule, file, sample, or compliance tag..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Data Type Filter */}
          <div>
            <select
              value={selectedDataType}
              onChange={e => {
                setSelectedDataType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Data Types</option>
              {uniqueDataTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* File Filter */}
          <div>
            <select
              value={selectedFile}
              onChange={e => {
                setSelectedFile(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Files ({files.length})</option>
              {uniqueFileNames.map(name => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Segmented Filter Buttons (Risk & Category) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Risk Level Segmented Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(risk => (
              <button
                key={risk}
                onClick={() => {
                  setSelectedRisk(risk);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  selectedRisk === risk
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {risk === 'ALL' ? 'All Severities' : risk}
              </button>
            ))}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Categories
            </button>
            <button
              onClick={() => {
                setSelectedCategory('SENSITIVE_PERSONAL_DATA');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === 'SENSITIVE_PERSONAL_DATA'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sensitive Personal Data
            </button>
            <button
              onClick={() => {
                setSelectedCategory('PERSONAL_DATA');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === 'PERSONAL_DATA'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Personal Data
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono tabular-nums">
            Showing {filteredFindings.length} of {findings.length} findings
          </div>
        </div>
      </div>

      {/* Main Evidence Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-semibold select-none">
              <tr>
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    ID
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('fileName')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Source File
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3.5">Location / Column</th>
                <th
                  onClick={() => handleSort('dataTypeName')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Data Type
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('sensitivity')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    Sensitivity
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('occurrences')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    Count
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3.5">Masked Evidence Sample</th>
                <th
                  onClick={() => handleSort('riskScore')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Risk Level
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedFindings.length > 0 ? (
                paginatedFindings.map(finding => (
                  <tr
                    key={finding.id}
                    onClick={() => setSelectedFinding(finding)}
                    className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3.5 font-mono text-slate-500 dark:text-slate-400 font-medium">
                      {finding.id}
                    </td>
                    <td className="py-3 px-3.5 font-medium text-slate-900 dark:text-white max-w-[150px] truncate">
                      {finding.fileName}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 dark:text-slate-300 max-w-[180px] truncate">
                      {finding.location}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {finding.dataTypeName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {finding.category === 'SENSITIVE_PERSONAL_DATA' ? 'Sensitive Personal' : 'Personal'}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-center font-mono tabular-nums font-semibold">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                        finding.sensitivity >= 4 ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        Tier {finding.sensitivity}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {finding.occurrences}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                        {finding.maskedSample}
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase ${getRiskBadge(finding.riskLevel)}`}>
                        {finding.riskLevel} ({finding.riskScore})
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedFinding(finding);
                        }}
                        className="p-1 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 rounded transition-colors"
                        title="View complete evidence drawer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-slate-400">
                    No findings match the current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredFindings.length)} of {filteredFindings.length} items
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono tabular-nums">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
