import { ScanResults } from './scanEngine';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Chart, registerables } from 'chart.js';
import { Vulnerability } from './scanEngine';

// Register Chart.js components
Chart.register(...registerables);

// Helper function to create a severity badge
function getSeverityBadge(severity: string): { text: string, color: string } {
  switch (severity.toLowerCase()) {
    case 'critical':
      return { text: 'CRITICAL', color: '#FF0000' };
    case 'high':
      return { text: 'HIGH', color: '#FF5252' };
    case 'medium':
      return { text: 'MEDIUM', color: '#FFA500' };
    case 'low':
      return { text: 'LOW', color: '#4CAF50' };
    case 'info':
      return { text: 'INFO', color: '#2196F3' };
    default:
      return { text: 'UNKNOWN', color: '#9E9E9E' };
  }
}

// Helper function to format date
function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Helper function to format duration
function formatDuration(milliseconds: number): string {
  if (!milliseconds || isNaN(milliseconds)) return 'N/A';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// Generate a PDF report from scan results
export function generatePdfReport(scanResults: ScanResults): jsPDF {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(22);
  doc.setTextColor(33, 33, 33);
  doc.text('Web Application Security Scan Report', 105, 20, { align: 'center' });
  
  // Add subtitle with date
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 28, { align: 'center' });
  
  // Add horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 32, 190, 32);
  
  // Executive Summary
  doc.setFontSize(16);
  doc.setTextColor(33, 33, 33);
  doc.text('Executive Summary', 20, 42);
  
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  
  // Target information
  const summaryData = [
    ['Target URL', scanResults.summary.url],
    ['Scan Start Time', formatDate(scanResults.summary.startTime)],
    ['Scan End Time', formatDate(scanResults.summary.endTime)],
    ['Scan Duration', formatDuration(scanResults.summary.duration)],
    ['Scan Mode', scanResults.summary.scanMode.toUpperCase()],
    ['Pages Scanned', scanResults.summary.testedPages?.toString() || scanResults.summary.testedURLs.toString()],
    ['Requests Sent', scanResults.summary.requestsSent?.toString() || 'N/A'],
  ];
  
  (doc as any).autoTable({
    startY: 46,
    head: [['Property', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      cellPadding: 4,
    },
    columnStyles: {
      0: { fontStyle: 'bold' }
    }
  });
  
  // Vulnerability Summary
  doc.setFontSize(16);
  doc.setTextColor(33, 33, 33);
  doc.text('Vulnerability Summary', 20, (doc as any).lastAutoTable.finalY + 15);
  
  // Create vulnerability summary table
  const vulnerabilitySummary = [
    ['Critical', scanResults.summary.critical.toString()],
    ['High', scanResults.summary.high.toString()],
    ['Medium', scanResults.summary.medium.toString()],
    ['Low', scanResults.summary.low.toString()],
    ['Info', scanResults.summary.info.toString()],
    ['Total', scanResults.summary.total.toString()]
  ];
  
  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['Severity', 'Count']],
    body: vulnerabilitySummary,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      cellPadding: 4,
    },
    columnStyles: {
      0: { fontStyle: 'bold' }
    },
    bodyStyles: {
      0: { 
        fillColor: function(row: any) {
          const severity = row.raw[0].toLowerCase();
          switch (severity) {
            case 'critical': return [255, 0, 0];
            case 'high': return [255, 82, 82];
            case 'medium': return [255, 165, 0];
            case 'low': return [76, 175, 80];
            case 'info': return [33, 150, 243];
            default: return [255, 255, 255];
          }
        }
      }
    }
  });
  
  // Add a new page for detailed findings
  doc.addPage();
  
  // Detailed Findings
  doc.setFontSize(16);
  doc.setTextColor(33, 33, 33);
  doc.text('Detailed Findings', 20, 20);
  
  // Create vulnerability details table
  const vulnerabilityDetails = scanResults.vulnerabilities.map((vuln: Vulnerability) => {
    const severity = getSeverityBadge(vuln.severity);
    return [
      severity.text,
      vuln.name || vuln.type || 'Unknown',
      vuln.url || 'N/A',
      vuln.parameter || 'N/A'
    ];
  });
  
  (doc as any).autoTable({
    startY: 25,
    head: [['Severity', 'Vulnerability', 'URL', 'Parameter']],
    body: vulnerabilityDetails,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      cellPadding: 4,
      overflow: 'linebreak',
      fontSize: 9
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 25 },
      2: { cellWidth: 'auto' }
    }
  });
  
  // Add individual vulnerability details
  let currentY = (doc as any).lastAutoTable.finalY + 15;
  
  scanResults.vulnerabilities.forEach((vuln: Vulnerability, index: number) => {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    const severity = getSeverityBadge(vuln.severity);
    
    // Vulnerability title
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    doc.text(`${index + 1}. ${vuln.name || vuln.type || 'Unknown Vulnerability'}`, 20, currentY);
    
    // Severity badge
    doc.setFillColor(severity.color);
    doc.rect(doc.getTextWidth(`${index + 1}. ${vuln.name || vuln.type || 'Unknown Vulnerability'}`) + 25, currentY - 4, 25, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(severity.text, doc.getTextWidth(`${index + 1}. ${vuln.name || vuln.type || 'Unknown Vulnerability'}`) + 37.5, currentY - 1, { align: 'center' });
    
    currentY += 8;
    
    // Description
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const descriptionLines = doc.splitTextToSize(vuln.description || 'No description available', 170);
    doc.text(descriptionLines, 20, currentY);
    
    currentY += descriptionLines.length * 5 + 5;
    
    // Details table
    const vulnData = [
      ['URL', vuln.url || 'N/A'],
      ['Parameter', vuln.parameter || 'N/A'],
      ['Category', vuln.category || 'N/A'],
      ['CWE', vuln.cwes ? vuln.cwes.join(', ') : 'N/A'],
      ['CVSS Score', vuln.cvss ? vuln.cvss.toString() : 'N/A'],
      ['Discovered', formatDate(vuln.discoveredAt)]
    ];
    
    (doc as any).autoTable({
      startY: currentY,
      body: vulnData,
      theme: 'plain',
      styles: {
        cellPadding: 2,
        fontSize: 9
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 30 },
        1: { cellWidth: 'auto' }
      }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 5;
    
    // Remediation
    if (vuln.remediation) {
      doc.setFontSize(10);
      doc.setTextColor(33, 33, 33);
      doc.text('Remediation:', 20, currentY);
      
      currentY += 5;
      
      doc.setTextColor(80, 80, 80);
      const remediationLines = doc.splitTextToSize(vuln.remediation, 170);
      doc.text(remediationLines, 20, currentY);
      
      currentY += remediationLines.length * 5 + 10;
    } else {
      currentY += 10;
    }
  });
  
  // Add AI Analysis if available
  if (scanResults.aiSummary || scanResults.aiRemediation) {
    doc.addPage();
    
    doc.setFontSize(16);
    doc.setTextColor(33, 33, 33);
    doc.text('AI Analysis', 20, 20);
    
    let aiY = 30;
    
    if (scanResults.aiSummary) {
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      doc.text('Summary', 20, aiY);
      
      aiY += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      const summaryLines = doc.splitTextToSize(scanResults.aiSummary, 170);
      doc.text(summaryLines, 20, aiY);
      
      aiY += summaryLines.length * 5 + 10;
    }
    
    if (scanResults.aiRemediation) {
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      doc.text('Recommended Actions', 20, aiY);
      
      aiY += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      const remediationLines = doc.splitTextToSize(scanResults.aiRemediation, 170);
      doc.text(remediationLines, 20, aiY);
    }
  }
  
  // Add footer to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`OWASP Vulnerability Scanner Report - Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }
  
  return doc;
}

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

// Generate an HTML report from scan results
export function generateHtmlReport(scanResults: ScanResults): string {
  // Calculate scan duration
  const duration = new Date(scanResults.summary.endTime).getTime() - new Date(scanResults.summary.startTime).getTime();
  
  let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Security Scan Report - ${scanResults.summary.url}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        h1, h2, h3 {
          color: #2c3e50;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        .summary-box {
          background-color: #f8f9fa;
          border-radius: 5px;
          padding: 20px;
          margin-bottom: 30px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }
        .summary-item {
          padding: 10px;
        }
        .summary-item h4 {
          margin: 0 0 5px 0;
          color: #7f8c8d;
        }
        .summary-item p {
          margin: 0;
          font-size: 1.2em;
          font-weight: bold;
        }
        .severity-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
        }
        .severity-badge {
          padding: 8px 15px;
          border-radius: 20px;
          color: white;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .severity-critical { background-color: #FF0000; }
        .severity-high { background-color: #FF5252; }
        .severity-medium { background-color: #FFA500; }
        .severity-low { background-color: #4CAF50; }
        .severity-info { background-color: #2196F3; }
        
        .vulnerability-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .vulnerability-table th {
          background-color: #2980b9;
          color: white;
          text-align: left;
          padding: 12px;
        }
        .vulnerability-table td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        .vulnerability-table tr:nth-child(even) {
          background-color: #f2f2f2;
        }
        
        .vulnerability-detail {
          background-color: #f8f9fa;
          border-radius: 5px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .vulnerability-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .vulnerability-name {
          font-size: 1.2em;
          font-weight: bold;
        }
        .vulnerability-meta {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
          margin-bottom: 15px;
          font-size: 0.9em;
        }
        .vulnerability-meta-item {
          display: flex;
        }
        .vulnerability-meta-label {
          font-weight: bold;
          margin-right: 5px;
        }
        .vulnerability-description, .vulnerability-remediation {
          margin-bottom: 15px;
        }
        .ai-analysis {
          background-color: #e8f4fd;
          border-radius: 5px;
          padding: 20px;
          margin-top: 30px;
        }
        .footer {
          text-align: center;
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #7f8c8d;
          font-size: 0.9em;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Web Application Security Scan Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>
      
      <h2>Executive Summary</h2>
      <div class="summary-box">
        <div class="summary-grid">
          <div class="summary-item">
            <h4>Target URL</h4>
            <p>${scanResults.summary.url}</p>
          </div>
          <div class="summary-item">
            <h4>Scan Start Time</h4>
            <p>${formatDate(scanResults.summary.startTime)}</p>
          </div>
          <div class="summary-item">
            <h4>Scan End Time</h4>
            <p>${formatDate(scanResults.summary.endTime)}</p>
          </div>
          <div class="summary-item">
            <h4>Scan Duration</h4>
            <p>${formatDuration(duration)}</p>
          </div>
          <div class="summary-item">
            <h4>Scan Mode</h4>
            <p>${scanResults.summary.scanMode.toUpperCase()}</p>
          </div>
          <div class="summary-item">
            <h4>Pages Scanned</h4>
            <p>${scanResults.summary.testedPages || scanResults.summary.testedURLs}</p>
          </div>
          <div class="summary-item">
            <h4>Requests Sent</h4>
            <p>${scanResults.summary.requestsSent || 'N/A'}</p>
          </div>
          <div class="summary-item">
            <h4>Total Vulnerabilities</h4>
            <p>${scanResults.summary.total}</p>
          </div>
        </div>
        
        <h3>Vulnerability Summary</h3>
        <div class="severity-badges">
          <div class="severity-badge severity-critical">
            Critical: ${scanResults.summary.critical}
          </div>
          <div class="severity-badge severity-high">
            High: ${scanResults.summary.high}
          </div>
          <div class="severity-badge severity-medium">
            Medium: ${scanResults.summary.medium}
          </div>
          <div class="severity-badge severity-low">
            Low: ${scanResults.summary.low}
          </div>
          <div class="severity-badge severity-info">
            Info: ${scanResults.summary.info}
          </div>
        </div>
      </div>
      
      <h2>Vulnerability Overview</h2>
      <table class="vulnerability-table">
        <thead>
          <tr>
            <th>Severity</th>
            <th>Name</th>
            <th>URL</th>
            <th>Parameter</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  scanResults.vulnerabilities.forEach((vuln: Vulnerability) => {
    html += `
      <tr>
        <td><div class="severity-badge severity-${vuln.severity}">${vuln.severity.toUpperCase()}</div></td>
        <td>${vuln.name || vuln.type || 'Unknown'}</td>
        <td>${vuln.url || 'N/A'}</td>
        <td>${vuln.parameter || 'N/A'}</td>
        <td>${vuln.category || 'N/A'}</td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
      
      <h2>Detailed Findings</h2>
  `;
  
  scanResults.vulnerabilities.forEach((vuln: Vulnerability, index: number) => {
    html += `
      <div class="vulnerability-detail">
        <div class="vulnerability-header">
          <div class="vulnerability-name">${index + 1}. ${vuln.name || vuln.type || 'Unknown Vulnerability'}</div>
          <div class="severity-badge severity-${vuln.severity}">${vuln.severity.toUpperCase()}</div>
        </div>
        
        <div class="vulnerability-description">
          <p>${vuln.description || 'No description available'}</p>
        </div>
        
        <div class="vulnerability-meta">
          <div class="vulnerability-meta-item">
            <div class="vulnerability-meta-label">URL:</div>
            <div>${vuln.url || 'N/A'}</div>
          </div>
          <div class="vulnerability-meta-item">
            <div class="vulnerability-meta-label">Parameter:</div>
            <div>${vuln.parameter || 'N/A'}</div>
          </div>
          <div class="vulnerability-meta-item">
            <div class="vulnerability-meta-label">Category:</div>
            <div>${vuln.category || 'N/A'}</div>
          </div>
          <div class="vulnerability-meta-item">
            <div class="vulnerability-meta-label">CWE:</div>
            <div>${vuln.cwes ? vuln.cwes.join(', ') : 'N/A'}</div>
          </div>
          <div class="vulnerability-meta-item">
            <div class="vulnerability-meta-label">CVSS:</div>
            <div>${vuln.cvss || 'N/A'}</div>
          </div>
          <div class="vulnerability-meta-item">
            <div class="vulnerability-meta-label">Discovered:</div>
            <div>${formatDate(vuln.discoveredAt)}</div>
          </div>
        </div>
        
        ${vuln.remediation ? `
        <div class="vulnerability-remediation">
          <h4>Remediation:</h4>
          <p>${vuln.remediation}</p>
        </div>
        ` : ''}
      </div>
    `;
  });
  
  // Add AI Analysis if available
  if (scanResults.aiSummary || scanResults.aiRemediation) {
    html += `
      <div class="ai-analysis">
        <h2>AI Analysis</h2>
        
        ${scanResults.aiSummary ? `
        <div>
          <h3>Summary</h3>
          <p>${scanResults.aiSummary}</p>
        </div>
        ` : ''}
        
        ${scanResults.aiRemediation ? `
        <div>
          <h3>Recommended Actions</h3>
          <p>${scanResults.aiRemediation.replace(/\n/g, '<br>')}</p>
        </div>
        ` : ''}
      </div>
    `;
  }
  
  html += `
      <div class="footer">
        <p>OWASP Vulnerability Scanner Report - Generated on ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;
  
  return html;
}
