
import { ScanResults, Vulnerability } from '../scanEngine';

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

export { ScanResults, Vulnerability };
