// Import necessary types
import { ScanResults, Vulnerability, ScanSummary } from './scanEngine';

// Generate a detailed HTML report from scan results
export function generateHtmlReport(results: ScanResults): string {
  if (!results || !results.summary || !results.vulnerabilities) {
    return '<div class="error">Invalid scan results data</div>';
  }
  
  const { summary, vulnerabilities } = results;
  
  // Generate HTML for the report
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Security Scan Report: ${summary.url}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            .report-header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
            .title {
                font-size: 28px;
                font-weight: 600;
                margin-bottom: 5px;
            }
            .subtitle {
                font-size: 18px;
                color: #666;
            }
            .summary-box {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 30px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .summary-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 15px;
            }
            .summary-item {
                padding: 10px;
            }
            .summary-item h3 {
                margin: 0 0 5px 0;
                font-size: 14px;
                color: #666;
            }
            .summary-item p {
                margin: 0;
                font-size: 22px;
                font-weight: 600;
            }
            .severity-chart {
                width: 100%;
                height: 200px;
                background: #f1f1f1;
                border-radius: 8px;
                margin-bottom: 30px;
            }
            .severity-distribution {
                display: flex;
                margin-bottom: 20px;
            }
            .severity-bar {
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
            }
            .critical { background-color: #d9534f; }
            .high { background-color: #f0ad4e; }
            .medium { background-color: #5bc0de; }
            .low { background-color: #5cb85c; }
            .info { background-color: #777; }
            .findings {
                margin-bottom: 30px;
            }
            .finding {
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                margin-bottom: 20px;
                overflow: hidden;
            }
            .finding-header {
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .finding-title {
                font-size: 18px;
                font-weight: 600;
                margin: 0;
            }
            .finding-severity {
                padding: 4px 12px;
                border-radius: 20px;
                color: white;
                font-size: 14px;
                font-weight: bold;
            }
            .finding-body {
                padding: 0 20px 20px;
            }
            .finding-section {
                margin-bottom: 15px;
            }
            .finding-section-title {
                font-size: 14px;
                font-weight: 600;
                margin: 0 0 5px 0;
                color: #666;
            }
            .finding-section-content {
                font-size: 15px;
                margin: 0;
                line-height: 1.5;
            }
            .code-block {
                background: #f8f9fa;
                border-radius: 4px;
                padding: 10px 15px;
                font-family: monospace;
                overflow-x: auto;
                white-space: pre-wrap;
                word-wrap: break-word;
                font-size: 13px;
                margin: 10px 0;
            }
            .recommendations {
                background-color: #f0f7ff;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 30px;
            }
            .tags {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 10px;
            }
            .tag {
                background: #e9ecef;
                border-radius: 16px;
                padding: 4px 12px;
                font-size: 13px;
                color: #495057;
            }
            @media print {
                body {
                    padding: 0;
                    font-size: 12px;
                }
                .finding {
                    page-break-inside: avoid;
                    break-inside: avoid;
                }
            }
        </style>
    </head>
    <body>
        <div class="report-header">
            <div class="title">Web Application Security Scan Report</div>
            <div class="subtitle">Scan completed on ${new Date(summary.endTime).toLocaleString()}</div>
        </div>
        
        <div class="summary-box">
            <h2>Scan Summary</h2>
            <div class="summary-grid">
                <div class="summary-item">
                    <h3>Target URL</h3>
                    <p>${summary.url}</p>
                </div>
                <div class="summary-item">
                    <h3>Scan Duration</h3>
                    <p>${formatDuration(summary.duration || (summary.scanTime || 0) * 1000)}</p>
                </div>
                <div class="summary-item">
                    <h3>Total Vulnerabilities</h3>
                    <p>${summary.total}</p>
                </div>
                <div class="summary-item">
                    <h3>Requests Sent</h3>
                    <p>${summary.requestsSent || summary.numRequests || 0}</p>
                </div>
                <div class="summary-item">
                    <h3>Pages Crawled</h3>
                    <p>${summary.pagesScanned || summary.testedPages || 0}</p>
                </div>
            </div>
        </div>
        
        <h2>Vulnerabilities by Severity</h2>
        
        <div class="severity-distribution">
            ${renderSeverityBar('critical', summary.critical, summary.total)}
            ${renderSeverityBar('high', summary.high, summary.total)}
            ${renderSeverityBar('medium', summary.medium, summary.total)}
            ${renderSeverityBar('low', summary.low, summary.total)}
            ${renderSeverityBar('info', summary.info, summary.total)}
        </div>
        
        <div class="findings">
            <h2>Detailed Findings</h2>
            ${vulnerabilities.map(renderVulnerability).join('')}
        </div>
        
        <div class="recommendations">
            <h2>Next Steps</h2>
            <p>This report provides a detailed analysis of the security vulnerabilities found in your web application. We recommend addressing the critical and high severity issues first, as they pose the most significant risk to your application and data.</p>
            <p>For each vulnerability, follow the provided remediation advice to fix the issue. After implementing the fixes, we recommend running another scan to verify that the vulnerabilities have been successfully mitigated.</p>
        </div>
        
        <footer>
            <p>Scan performed using Web Security Scanner</p>
            <p>Scan ID: ${summary.scanID}</p>
            <p>Report generated: ${new Date().toLocaleString()}</p>
        </footer>
    </body>
    </html>
  `;
}

// Fix the arithmetic operation issue (line 198)
export function generatePDF(scanResults: ScanResults): string {
  const { summary } = scanResults;
  const date = new Date(summary.endTime);
  
  // When generating the PDF, ensure string concatenation instead of arithmetic
  // Replace the problematic line with proper string concatenation
  const dateString = `Report generated on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  
  return 'report.pdf';
}

// Helper function to format duration in ms to a readable string
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
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

// Render a severity bar with appropriate width based on count
function renderSeverityBar(severity: string, count: number, total: number): string {
  if (total === 0) return '';
  const percentage = (count / total) * 100;
  
  return `
    <div class="severity-bar ${severity}" style="width: ${percentage}%">
      ${count > 0 ? `${count} ${severity}` : ''}
    </div>
  `;
}

// Render a single vulnerability as HTML
function renderVulnerability(vuln: Vulnerability): string {
  return `
    <div class="finding">
      <div class="finding-header" style="background-color: ${getSeverityColor(vuln.severity)}20;">
        <h3 class="finding-title">${vuln.title}</h3>
        <span class="finding-severity" style="background-color: ${getSeverityColor(vuln.severity)}">
          ${vuln.severity.toUpperCase()}
        </span>
      </div>
      <div class="finding-body">
        <div class="finding-section">
          <div class="finding-section-title">Description</div>
          <div class="finding-section-content">${vuln.description}</div>
        </div>
        
        <div class="finding-section">
          <div class="finding-section-title">Location</div>
          <div class="finding-section-content">${vuln.location}</div>
        </div>
        
        <div class="finding-section">
          <div class="finding-section-title">Evidence</div>
          <div class="code-block">${vuln.evidence}</div>
        </div>
        
        ${vuln.request ? `
        <div class="finding-section">
          <div class="finding-section-title">HTTP Request</div>
          <div class="code-block">${vuln.request}</div>
        </div>
        ` : ''}
        
        ${vuln.response ? `
        <div class="finding-section">
          <div class="finding-section-title">HTTP Response</div>
          <div class="code-block">${vuln.response}</div>
        </div>
        ` : ''}
        
        <div class="finding-section">
          <div class="finding-section-title">Remediation</div>
          <div class="finding-section-content">${vuln.remediation}</div>
        </div>
        
        <div class="finding-section">
          <div class="finding-section-title">Risk Information</div>
          <div class="finding-section-content">
            ${vuln.cweid ? `CWE ID: ${vuln.cweid}<br>` : ''}
            ${vuln.owasp ? `OWASP: ${vuln.owasp}<br>` : ''}
            ${vuln.cvssScore ? `CVSS Score: ${vuln.cvssScore.toFixed(1)}/10` : ''}
          </div>
        </div>
        
        <div class="tags">
          ${vuln.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
}

// Get appropriate color for severity level
function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical': return '#d9534f';
    case 'high': return '#f0ad4e';
    case 'medium': return '#5bc0de';
    case 'low': return '#5cb85c';
    case 'info': return '#777';
    default: return '#777';
  }
}

// Generate a JSON report
export function generateJsonReport(results: ScanResults): string {
  return JSON.stringify(results, null, 2);
}

// Generate a CSV report of vulnerabilities
export function generateCsvReport(results: ScanResults): string {
  if (!results || !results.vulnerabilities || !results.vulnerabilities.length) {
    return 'No vulnerabilities found';
  }
  
  const headers = ['ID', 'Title', 'Severity', 'Description', 'Location', 'CWE ID', 'OWASP', 'CVSS Score', 'Timestamp'];
  const rows = results.vulnerabilities.map(v => [
    v.id,
    `"${v.title.replace(/"/g, '""')}"`, // Escape quotes in CSV
    v.severity,
    `"${v.description.replace(/"/g, '""')}"`,
    `"${v.location.replace(/"/g, '""')}"`,
    v.cweid,
    v.owasp || '',
    v.cvssScore?.toString() || '',
    v.timestamp
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}
