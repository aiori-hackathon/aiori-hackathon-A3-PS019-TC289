import React, { createContext, useContext, useEffect, useState } from 'react';
import { Finding, PrivacyScanSummary, ScannedFile } from '../types/privacy';
import { computeSummary, scanFile } from '../utils/fileScanner';
import { createSampleFiles } from '../utils/sampleDataGenerator';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface ScanContextValue {
  files: ScannedFile[];
  findings: Finding[];
  summary: PrivacyScanSummary;
  selectedFinding: Finding | null;
  setSelectedFinding: (finding: Finding | null) => void;
  isScanning: boolean;
  scanProgress: number;
  scanStatusText: string;
  activeTab: 'dashboard' | 'scan' | 'inventory' | 'reports';
  setActiveTab: (tab: 'dashboard' | 'scan' | 'inventory' | 'reports') => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  processFiles: (filesToScan: File[] | FileList) => Promise<void>;
  loadSampleData: () => Promise<void>;
  removeFile: (fileId: string) => void;
  clearAllData: () => void;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const ScanContext = createContext<ScanContextValue | undefined>(undefined);

const INITIAL_SUMMARY: PrivacyScanSummary = {
  totalFiles: 0,
  totalFindings: 0,
  totalOccurrences: 0,
  criticalFindings: 0,
  highFindings: 0,
  mediumFindings: 0,
  lowFindings: 0,
  personalDataCount: 0,
  sensitivePersonalDataCount: 0,
  overallRiskScore: 0,
  overallRiskLevel: 'LOW',
  scannedAt: new Date().toISOString(),
  dataTypeDistribution: {},
  complianceBreakdown: {}
};

export const ScanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<ScannedFile[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [summary, setSummary] = useState<PrivacyScanSummary>(INITIAL_SUMMARY);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStatusText, setScanStatusText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scan' | 'inventory' | 'reports'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const processFiles = async (filesToScan: File[] | FileList) => {
    const fileArray = Array.from(filesToScan);
    if (fileArray.length === 0) return;

    setIsScanning(true);
    setScanProgress(5);
    setScanStatusText(`Initializing scan for ${fileArray.length} file(s)...`);

    const newScannedFiles: ScannedFile[] = [];
    const newFindings: Finding[] = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const basePercent = Math.floor((i / fileArray.length) * 100);
        const fileStep = Math.floor(100 / fileArray.length);

        setScanStatusText(`Scanning ${file.name} (${i + 1}/${fileArray.length})...`);

        const result = await scanFile(file, (percent, msg) => {
          setScanProgress(Math.min(98, basePercent + Math.floor((percent / 100) * fileStep)));
          setScanStatusText(msg);
        });

        newScannedFiles.push(result.scannedFile);
        newFindings.push(...result.findings);
      }

      setScanProgress(100);
      setScanStatusText('Compiling final risk scores...');

      // Update state
      setFiles(prev => {
        // filter out files with same name
        const existingNames = new Set(newScannedFiles.map(f => f.name));
        const filteredPrev = prev.filter(f => !existingNames.has(f.name));
        const combined = [...filteredPrev, ...newScannedFiles];
        return combined;
      });

      setFindings(prev => {
        const existingNames = new Set(newScannedFiles.map(f => f.name));
        const filteredPrev = prev.filter(f => !existingNames.has(f.fileName));
        const combined = [...filteredPrev, ...newFindings];
        return combined;
      });

      // Recalculate summary with the updated items
      setFiles(currentFiles => {
        setFindings(currentFindings => {
          setSummary(computeSummary(currentFiles, currentFindings));
          return currentFindings;
        });
        return currentFiles;
      });

      addToast(
        `Discovered ${newFindings.length} personal data findings across ${newScannedFiles.length} file(s).`,
        'success'
      );
    } catch (err: unknown) {
      console.error('Scan error:', err);
      addToast(
        `File scan failed: ${err instanceof Error ? err.message : 'Unknown parsing error'}`,
        'error'
      );
    } finally {
      setIsScanning(false);
      setScanProgress(0);
      setScanStatusText('');
    }
  };

  const loadSampleData = async () => {
    const samples = createSampleFiles();
    addToast('Generating realistic KYC, payroll, and server access sample datasets...', 'info');
    await processFiles(samples);
  };

  const removeFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    const remainingFiles = files.filter(f => f.id !== fileId);
    const remainingFindings = findings.filter(f => f.fileId !== fileId);

    setFiles(remainingFiles);
    setFindings(remainingFindings);
    setSummary(computeSummary(remainingFiles, remainingFindings));
    if (selectedFinding?.fileId === fileId) {
      setSelectedFinding(null);
    }
    addToast(`Removed ${file.name} from inventory.`, 'info');
  };

  const clearAllData = () => {
    setFiles([]);
    setFindings([]);
    setSelectedFinding(null);
    setSummary(INITIAL_SUMMARY);
    addToast('All scanned evidence and files cleared from local memory.', 'info');
  };

  return (
    <ScanContext.Provider
      value={{
        files,
        findings,
        summary,
        selectedFinding,
        setSelectedFinding,
        isScanning,
        scanProgress,
        scanStatusText,
        activeTab,
        setActiveTab,
        isDarkMode,
        toggleDarkMode,
        processFiles,
        loadSampleData,
        removeFile,
        clearAllData,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </ScanContext.Provider>
  );
};

export function useScan() {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
}
