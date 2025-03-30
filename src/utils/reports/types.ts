
import { ScanResults as ScanResultsType, Vulnerability as VulnerabilityType } from '../scanEngine';

// Define type augmentation for jsPDF with AutoTable
declare global {
  interface Window {
    jspdf: any;
  }
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: {
      finalY?: number;
    };
  }
}

export interface SeverityBadge {
  text: string;
  color: string;
}

// Re-export types using 'export type' to fix the 'isolatedModules' error
export type ScanResults = ScanResultsType;
export type Vulnerability = VulnerabilityType;
