
import { ScanResults, Vulnerability } from './scanEngine';

// This is a utility that would be used with a PDF generation library
// Since we can't directly generate PDFs in the browser, we'll simulate the structure

export interface ReportOptions {
  includeScreenshots: boolean;
  includeRemediation: boolean;
  includeCwe: boolean;
  includeReferences: boolean;
  companyName?: string;
  reportTitle?: string;
  includeLogo?: boolean;
  severityFilter: ('critical' | 'high' | 'medium' | 'low' | 'info')[];
}

export interface ReportSection {
  title: string;
  content: string;
  level: number;
}

export interface ReportData {
  title: string;
  date: string;
  targetUrl: string;
  summary: {
    totalVulnerabilities: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    infoCount: number;
    scanDuration: string;
  };
  sections: ReportSection[];
  vulnerabilities: ReportVulnerability[];
}

export interface ReportVulnerability {
  id: string;
  title: string;
  type: string;
  severity: string;
  description: string;
  location: string;
  evidence: string;
  remediation?: string;
  cwe?: string;
  references?: { title: string; url: string }[];
  screenshot?: string;
}

export function generateReportData(scanResults: ScanResults, options: ReportOptions): ReportData {
  // Filter vulnerabilities by severity
  const filteredVulns = scanResults.vulnerabilities.filter(
    vuln => options.severityFilter.includes(vuln.severity)
  );
  
  // Create report sections
  const sections: ReportSection[] = [
    {
      title: "Executive Summary",
      content: `This security assessment identified ${scanResults.summary.total} vulnerabilities in the target application at ${scanResults.summary.url}. The scan was conducted on ${new Date(scanResults.summary.startTime).toLocaleString()} and took ${scanResults.summary.scanTime || (scanResults.summary.duration/1000 + " seconds")} to complete.`,
      level: 1
    },
    {
      title: "Scope",
      content: `The scope of this security assessment included automated scanning of the web application at ${scanResults.summary.url} with ${scanResults.summary.numRequests || scanResults.summary.requestsSent || "multiple"} HTTP requests made to ${scanResults.summary.testedPages || scanResults.summary.pagesScanned || "various"} pages.`,
      level: 1
    },
    {
      title: "Methodology",
      content: "The assessment used the OWASP Top 10 methodology to identify common web application security vulnerabilities. The scan included automated testing for injection flaws, broken authentication, sensitive data exposure, XML External Entities (XXE), broken access control, security misconfiguration, cross-site scripting (XSS), insecure deserialization, using components with known vulnerabilities, and insufficient logging & monitoring.",
      level: 1
    },
    {
      title: "Findings Summary",
      content: `The assessment revealed ${scanResults.summary.critical} critical, ${scanResults.summary.high} high, ${scanResults.summary.medium} medium, and ${scanResults.summary.low} low severity issues.`,
      level: 1
    }
  ];
  
  // Add remediation summary section if included
  if (options.includeRemediation) {
    sections.push({
      title: "Remediation Summary",
      content: "The vulnerabilities identified require attention with priority given to Critical and High severity issues. Implement the specific recommendations provided for each finding in the Detailed Findings section.",
      level: 1
    });
  }
  
  // Transform vulnerabilities for the report
  const vulnerabilities: ReportVulnerability[] = filteredVulns.map((vuln, index) => {
    const reportVuln: ReportVulnerability = {
      id: vuln.id || String(index + 1),
      title: `${vuln.type || vuln.title.split(' ')[0]} in ${vuln.parameter || 'application'}`,
      type: vuln.type || vuln.title.split(' ')[0],
      severity: vuln.severity,
      description: vuln.description,
      location: `${vuln.url || vuln.location} ${vuln.parameter ? `(Parameter: ${vuln.parameter})` : ''}`,
      evidence: vuln.evidence,
    };
    
    if (options.includeRemediation) {
      reportVuln.remediation = vuln.remediation;
    }
    
    if (options.includeCwe && vuln.cweid) {
      reportVuln.cwe = vuln.cweid;
    }
    
    if (options.includeReferences && vuln.owasp) {
      reportVuln.references = [{
        title: "OWASP " + vuln.owasp, 
        url: `https://owasp.org/Top10/${vuln.owasp?.split(':')[0].replace('A', 'A0')}/`
      }];
    }
    
    return reportVuln;
  });
  
  // Create the report data
  const reportData: ReportData = {
    title: options.reportTitle || `Web Application Security Assessment - ${scanResults.summary.url}`,
    date: new Date().toLocaleDateString(),
    targetUrl: scanResults.summary.url,
    summary: {
      totalVulnerabilities: scanResults.summary.total,
      criticalCount: scanResults.summary.critical,
      highCount: scanResults.summary.high,
      mediumCount: scanResults.summary.medium,
      lowCount: scanResults.summary.low,
      infoCount: scanResults.summary.info,
      scanDuration: scanResults.summary.scanTime || (scanResults.summary.duration/1000 + " seconds")
    },
    sections,
    vulnerabilities
  };
  
  return reportData;
}

// Function to simulate generating a PDF
export function simulateGeneratePdf(reportData: ReportData): Blob {
  // In a real implementation, this would use a library like jsPDF or pdfmake
  // For now, we'll just return a placeholder blob
  const jsonString = JSON.stringify(reportData, null, 2);
  return new Blob([jsonString], { type: 'application/json' });
}

// Function to generate CSV data
export function generateCsvData(vulnerabilities: Vulnerability[]): string {
  // Create CSV header
  const header = "ID,Type,Severity,URL,Parameter,Description,Remediation\n";
  
  // Generate rows
  const rows = vulnerabilities.map(vuln => {
    // Escape any commas in fields by wrapping in quotes
    const escapedDescription = `"${vuln.description.replace(/"/g, '""')}"`;
    const escapedRemediation = `"${vuln.remediation.replace(/"/g, '""')}"`;
    const type = vuln.type || vuln.title.split(' ')[0];
    const url = vuln.url || vuln.location;
    const parameter = vuln.parameter || 'N/A';
    
    return `${vuln.id},${type},${vuln.severity},${url},${parameter},${escapedDescription},${escapedRemediation}`;
  }).join("\n");
  
  return header + rows;
}

// Function to download a file
export function downloadFile(data: Blob | string, filename: string): void {
  const blob = typeof data === 'string' ? new Blob([data]) : data;
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}
