/**
 * PrivacyLens - Personal Data Discovery and Privacy Evidence Inventory
 * Hackathon PS-019
 */

import React from 'react';
import { ScanProvider, useScan } from './context/ScanContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ScanView } from './components/ScanView';
import { InventoryView } from './components/InventoryView';
import { ReportsView } from './components/ReportsView';
import { FindingDetailDrawer } from './components/FindingDetailDrawer';
import { ToastContainer } from './components/ToastContainer';

const AppContent: React.FC = () => {
  const { activeTab, selectedFinding, setSelectedFinding } = useScan();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'scan' && <ScanView />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'reports' && <ReportsView />}
      </main>

      {/* Footer */}
      <footer className="print:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">PrivacyLens</span>
            <span>·</span>
            <span>Personal Data Discovery & Privacy Evidence Inventory</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Client-side Web Crypto Verification</span>
            <span>·</span>
            <span>Zero Server Transmission</span>
          </div>
        </div>
      </footer>

      {/* Slide-over Detail Drawer */}
      <FindingDetailDrawer
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
      />

      {/* Feedback Toasts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ScanProvider>
      <AppContent />
    </ScanProvider>
  );
}
