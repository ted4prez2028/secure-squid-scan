
import { ScanResults } from '@/utils/reports';

// Helper to create default report title
export const createDefaultReportTitle = (scanResults?: ScanResults): string => {
  return `Vulnerability Scan Report - ${scanResults?.summary?.url || 'Target Website'}`;
};

// Helper to download a blob
export const downloadBlob = (content: string, filename: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Creates a new report history entry
export const createReportHistoryEntry = (reportTitle: string, format: string, data: any) => {
  return {
    name: reportTitle,
    date: new Date().toLocaleString(),
    format: format.toUpperCase(),
    data: data
  };
};

// Default template settings
export const getTemplateSettings = (templateName: string) => {
  switch (templateName) {
    case 'HackerOne Template':
      return {
        template: 'bugbounty',
        sections: {
          executiveSummary: true,
          vulnerabilityDetails: true,
          remediation: true,
          screenshots: true,
          methodology: false,
          appendices: false
        }
      };
    case 'PCI Compliance':
      return {
        template: 'compliance',
        sections: {
          executiveSummary: true,
          vulnerabilityDetails: true,
          remediation: true,
          screenshots: true,
          methodology: true,
          appendices: true
        }
      };
    case 'My Custom Template':
      return {
        template: 'detailed',
        sections: null // Use current sections
      };
    default:
      return {
        template: 'detailed',
        sections: null
      };
  }
};
