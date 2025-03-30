
import { generatePdfReport } from './pdfReport';
import { generateHtmlReport } from './htmlReport';
import { generateCsvReport } from './csvReport';

// Re-export functions
export {
  generatePdfReport,
  generateHtmlReport,
  generateCsvReport
};

// Re-export types using 'export type' to fix the 'isolatedModules' error
export type { ScanResults, Vulnerability } from './types';
