
import { vulnerabilityDefinitions } from './vulnerabilityDefinitions';

export interface ScanConfig {
  url: string;
  scanMode: 'quick' | 'standard' | 'thorough';
  authRequired: boolean;
  username?: string;
  password?: string;
  xssTests: boolean;
  sqlInjectionTests: boolean;
  csrfTests: boolean;
  headerTests: boolean;
  fileUploadTests: boolean;
  threadCount: number;
  captureScreenshots: boolean;
  recordVideos: boolean;
  aiAnalysis: boolean;
  maxDepth: number;
}

export interface VulnerabilityFinding {
  id: number;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  url: string;
  parameter: string;
  payload: string;
  description: string;
  evidence: string;
  screenshot: string;
  remediation: string;
  cweid?: string;
  references?: {
    title: string;
    url: string;
  }[];
}

export interface ScanSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  total: number;
  scanTime: string;
  url: string;
  startedAt: string;
  completedAt: string;
  scanMode: string;
  numRequests: number;
  testedPages: number;
  timestamp: string;
}

export interface ScanResults {
  vulnerabilities: VulnerabilityFinding[];
  summary: ScanSummary;
  scanConfig: ScanConfig;
}

// Mock payloads for different vulnerability types
const mockPayloads = {
  xss: [
    '<script>alert("XSS")</script>',
    '"><script>alert(1)</script>',
    '<img src="x" onerror="alert(1)">',
    '"><svg/onload=alert(1)>'
  ],
  sqlInjection: [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "1' AND (SELECT 1 FROM (SELECT COUNT(*),CONCAT(VERSION(),FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.TABLES GROUP BY x)a); --",
    "' UNION SELECT NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL--"
  ],
  commandInjection: [
    "& ping -c 4 127.0.0.1 &",
    "| cat /etc/passwd",
    "; ls -la",
    "$(cat /etc/passwd)"
  ],
  pathTraversal: [
    "../../../etc/passwd",
    "..\\..\\..\\windows\\win.ini",
    "/var/www/../../etc/passwd",
    "/%2e%2e/%2e%2e/%2e%2e/etc/passwd"
  ],
  csrf: [
    "<form action='https://victim-site.com/transfer' method='POST'>",
    "<img src='https://victim-site.com/transfer?to=attacker&amount=1000'>",
    "<iframe style='display:none' name='csrf-frame'></iframe><form target='csrf-frame' action='https://victim-site.com/change_password' method='POST'>"
  ]
};

// Function to generate realistic scan results based on configuration
export async function performScan(config: ScanConfig): Promise<ScanResults> {
  // This is a simulation function that mimics a real scan
  return new Promise((resolve) => {
    // Simulate scan duration based on scan mode
    const scanDurations = {
      quick: 3000, // 3 seconds for quick scan simulation
      standard: 5000, // 5 seconds for standard scan
      thorough: 8000 // 8 seconds for thorough scan
    };
    
    const startTime = new Date();
    
    setTimeout(() => {
      // Generate mock findings based on scan config
      const vulnerabilities: VulnerabilityFinding[] = [];
      let idCounter = 1;
      
      // Add XSS findings if enabled
      if (config.xssTests) {
        // The complexity of findings depends on scan mode
        const numFindings = config.scanMode === 'quick' ? 1 : 
                           (config.scanMode === 'standard' ? 2 : 3);
        
        for (let i = 0; i < numFindings; i++) {
          const xssVuln = vulnerabilityDefinitions.find(v => v.id === "XSS");
          vulnerabilities.push({
            id: idCounter++,
            type: 'XSS',
            severity: 'high',
            url: `${config.url}${Math.random() > 0.5 ? '/search' : '/products'}`,
            parameter: Math.random() > 0.5 ? 'search' : 'q',
            payload: mockPayloads.xss[i % mockPayloads.xss.length],
            description: 'Cross-site scripting vulnerability detected in search parameter',
            evidence: `<div class="search-results">Search results for: ${mockPayloads.xss[i % mockPayloads.xss.length]}</div>`,
            screenshot: 'https://via.placeholder.com/800x600',
            remediation: xssVuln?.remediation || 'Implement proper input validation and output encoding',
            cweid: 'CWE-79',
            references: xssVuln?.references || []
          });
        }
      }
      
      // Add SQL Injection findings if enabled
      if (config.sqlInjectionTests) {
        const numFindings = config.scanMode === 'quick' ? 1 : 
                          (config.scanMode === 'standard' ? 1 : 2);
        
        for (let i = 0; i < numFindings; i++) {
          const sqlVuln = vulnerabilityDefinitions.find(v => v.id === "A03:2021");
          vulnerabilities.push({
            id: idCounter++,
            type: 'SQL Injection',
            severity: 'critical',
            url: `${config.url}/product?id=1`,
            parameter: 'id',
            payload: mockPayloads.sqlInjection[i % mockPayloads.sqlInjection.length],
            description: 'SQL injection vulnerability detected in id parameter',
            evidence: 'Database error: syntax error at or near "OR"',
            screenshot: 'https://via.placeholder.com/800x600',
            remediation: sqlVuln?.remediation || 'Use parameterized queries or prepared statements',
            cweid: 'CWE-89',
            references: sqlVuln?.references || []
          });
        }
      }
      
      // Add CSRF findings if enabled
      if (config.csrfTests) {
        const csrfVuln = vulnerabilityDefinitions.find(v => v.id === "CSRF");
        vulnerabilities.push({
          id: idCounter++,
          type: 'CSRF',
          severity: 'medium',
          url: `${config.url}/account/settings`,
          parameter: 'form',
          payload: 'N/A',
          description: 'No CSRF token detected in form submission',
          evidence: '<form action="/update" method="POST">...</form>',
          screenshot: 'https://via.placeholder.com/800x600',
          remediation: csrfVuln?.remediation || 'Implement anti-CSRF tokens in all forms',
          cweid: 'CWE-352',
          references: csrfVuln?.references || []
        });
      }
      
      // Add header findings if enabled
      if (config.headerTests) {
        const secMisconfigVuln = vulnerabilityDefinitions.find(v => v.id === "A05:2021");
        vulnerabilities.push({
          id: idCounter++,
          type: 'Security Headers Missing',
          severity: 'low',
          url: config.url,
          parameter: 'N/A',
          payload: 'N/A',
          description: 'Missing security headers: Content-Security-Policy, X-Content-Type-Options, X-Frame-Options',
          evidence: 'Response Headers: Server: Apache/2.4.41 (Ubuntu)',
          screenshot: 'https://via.placeholder.com/800x600',
          remediation: secMisconfigVuln?.remediation || 'Configure proper security headers in your web server',
          cweid: 'CWE-693',
          references: secMisconfigVuln?.references || []
        });
      }
      
      // Add file upload findings if enabled
      if (config.fileUploadTests && config.scanMode !== 'quick') {
        vulnerabilities.push({
          id: idCounter++,
          type: 'Insecure File Upload',
          severity: 'high',
          url: `${config.url}/upload`,
          parameter: 'file',
          payload: 'malicious.php',
          description: 'File upload functionality does not validate file types properly',
          evidence: 'Uploaded PHP file was accepted and executable',
          screenshot: 'https://via.placeholder.com/800x600',
          remediation: 'Implement proper file type validation, use content-type checking, and scan uploads for malicious content',
          cweid: 'CWE-434',
          references: [
            {
              title: "OWASP File Upload Cheat Sheet",
              url: "https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html"
            }
          ]
        });
      }
      
      // For thorough scans, add more complex vulnerabilities
      if (config.scanMode === 'thorough') {
        // Add path traversal
        vulnerabilities.push({
          id: idCounter++,
          type: 'Path Traversal',
          severity: 'high',
          url: `${config.url}/download?file=report.pdf`,
          parameter: 'file',
          payload: mockPayloads.pathTraversal[0],
          description: 'Path traversal vulnerability allows reading arbitrary files',
          evidence: 'File contents were displayed instead of the intended file',
          screenshot: 'https://via.placeholder.com/800x600',
          remediation: 'Validate and sanitize file path inputs. Use a whitelist of allowed files.',
          cweid: 'CWE-22',
          references: [
            {
              title: "OWASP Path Traversal",
              url: "https://owasp.org/www-community/attacks/Path_Traversal"
            }
          ]
        });
        
        // Add server information disclosure
        vulnerabilities.push({
          id: idCounter++,
          type: 'Information Disclosure',
          severity: 'low',
          url: config.url,
          parameter: 'N/A',
          payload: 'N/A',
          description: 'Server version and technology stack disclosed in HTTP headers',
          evidence: 'Server: Apache/2.4.41 (Ubuntu), X-Powered-By: PHP/7.4.3',
          screenshot: 'https://via.placeholder.com/800x600',
          remediation: 'Configure web server to hide version information in HTTP headers',
          cweid: 'CWE-200',
          references: [
            {
              title: "OWASP Information Leakage",
              url: "https://owasp.org/www-community/Improper_Error_Handling"
            }
          ]
        });
      }
      
      // Calculate summary statistics
      const summary: ScanSummary = {
        critical: vulnerabilities.filter(v => v.severity === 'critical').length,
        high: vulnerabilities.filter(v => v.severity === 'high').length,
        medium: vulnerabilities.filter(v => v.severity === 'medium').length,
        low: vulnerabilities.filter(v => v.severity === 'low').length,
        info: vulnerabilities.filter(v => v.severity === 'info').length,
        total: vulnerabilities.length,
        scanTime: `${(new Date().getTime() - startTime.getTime()) / 1000}s`,
        url: config.url,
        startedAt: startTime.toISOString(),
        completedAt: new Date().toISOString(),
        scanMode: config.scanMode,
        numRequests: config.scanMode === 'quick' ? 50 : (config.scanMode === 'standard' ? 150 : 300),
        testedPages: config.scanMode === 'quick' ? 5 : (config.scanMode === 'standard' ? 15 : 30),
        timestamp: new Date().toISOString()
      };
      
      resolve({
        vulnerabilities,
        summary,
        scanConfig: config
      });
    }, scanDurations[config.scanMode]);
  });
}

// Helper to generate PDF scan report data
export function generateReportData(results: ScanResults) {
  const reportData = {
    title: "OWASP Vulnerability Scan Report",
    timestamp: new Date().toLocaleString(),
    target: results.scanConfig.url,
    summary: results.summary,
    findings: results.vulnerabilities.map(v => ({
      id: v.id,
      type: v.type,
      severity: v.severity,
      description: v.description,
      url: v.url,
      parameter: v.parameter,
      payload: v.payload,
      evidence: v.evidence,
      remediation: v.remediation
    }))
  };
  
  return reportData;
}
