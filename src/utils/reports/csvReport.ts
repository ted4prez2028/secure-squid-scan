
import { ScanResults, Vulnerability } from './types';

// Generate a CSV report from scan results
export function generateCsvReport(scanResults: ScanResults): string {
  let csv = 'Severity,Name,Description,URL,Parameter,Category,CWE,CVSS,Status,Discovered\n';
  
  scanResults.vulnerabilities.forEach((vuln: Vulnerability) => {
    // Escape fields that might contain commas
    const escapeCsv = (field: string) => {
      if (!field) return '';
      return `"${field.replace(/"/g, '""')}"`;
    };
    
    csv += [
      vuln.severity || '',
      escapeCsv(vuln.name || vuln.type || ''),
      escapeCsv(vuln.description || ''),
      escapeCsv(vuln.url || ''),
      escapeCsv(vuln.parameter || ''),
      escapeCsv(vuln.category || ''),
      escapeCsv(vuln.cwes ? vuln.cwes.join(';') : ''),
      vuln.cvss || '',
      vuln.status || '',
      vuln.discoveredAt || ''
    ].join(',') + '\n';
  });
  
  return csv;
}
