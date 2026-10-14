import React, { useState } from 'react';
import { ShieldCheck, Moon, Sun, Lock, FileSpreadsheet, AlertTriangle, FileText, LayoutDashboard } from 'lucide-react';
import { useScan } from '../context/ScanContext';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, isDarkMode, toggleDarkMode, findings, isScanning } = useScan();
  const [showSecurityTooltip, setShowSecurityTooltip] = useState(false);

  const criticalCount = findings.filter(f => f.riskLevel === 'CRITICAL' || f.riskLevel === 'HIGH').length;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                PrivacyLens
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-1">
                Data Discovery & Evidence
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard'
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('scan')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'scan'
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>File Scanner</span>
            {isScanning && (
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'inventory'
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Evidence Inventory</span>
            {findings.length > 0 && (
              <span className="text-xs font-mono tabular-nums px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold">
                {findings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'reports'
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Reports</span>
          </button>
        </nav>

        {/* Zone 3: Security Badge & Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Privacy By Design: Zero Data Leaves Device Badge */}
          <div className="relative">
            <button
              onClick={() => setShowSecurityTooltip(prev => !prev)}
              onMouseEnter={() => setShowSecurityTooltip(true)}
              onMouseLeave={() => setShowSecurityTooltip(false)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors whitespace-nowrap shrink-0"
              title="Click for privacy architecture details"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">No data leaves your device</span>
              <span className="sm:hidden">Local only</span>
            </button>

            {showSecurityTooltip && (
              <div className="absolute right-0 mt-2 w-72 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl text-xs z-50 text-slate-700 dark:text-slate-300 leading-relaxed">
                <div className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  100% Client-Side Privacy Architecture
                </div>
                <p>
                  Files are tokenized and scanned locally in your browser’s JavaScript memory using Web Crypto SHA-256. Zero file bytes or unmasked personal data are transmitted to any remote server.
                </p>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle color theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Quick Scan CTA */}
          <button
            onClick={() => setActiveTab('scan')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            + Scan Files
          </button>
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('scan')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'scan' ? 'text-indigo-600 font-bold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Scan
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'inventory' ? 'text-indigo-600 font-bold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Inventory ({findings.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'reports' ? 'text-indigo-600 font-bold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Reports
        </button>
      </div>
    </header>
  );
};
