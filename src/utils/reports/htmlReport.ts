
import { ScanResults, Vulnerability } from './types';
import { formatDate, formatDuration } from './utils';

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
