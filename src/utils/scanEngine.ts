
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

export interface Vulnerability {
  id: string;
  name: string;
  description: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  url: string;
  parameter?: string;
  payload?: string;
  evidence: string;
  category: string;
  remediation: string;
  screenshot?: string;
  cwes?: string[];
  cvss?: number;
  status: 'open' | 'confirmed' | 'false-positive' | 'resolved';
  discoveredAt: string;
}

export interface ScanResults {
  summary: {
    scanID: string;
    url: string;
    startTime: string;
    endTime: string;
    duration: number;
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    testedURLs: number;
    testedParameters: number;
    engineVersion: string;
    scanMode: 'quick' | 'standard' | 'thorough';
  };
  vulnerabilities: Vulnerability[];
  testedURLs: string[];
  screenshots?: { url: string, path: string }[];
  videos?: { name: string, path: string }[];
  certificateInfo?: {
    valid: boolean;
    issuer: string;
    validFrom: string;
    validTo: string;
    daysRemaining: number;
  };
  serverInfo?: {
    server: string;
    technologies: string[];
    headers: Record<string, string>;
  };
  aiSummary?: string;
  aiRemediation?: string;
}

// Export this stub for the ScanAgent class as it's no longer needed client-side
// but is referenced in other files
export class ScanAgent {
  static createMockResults(config: ScanConfig): ScanResults {
    const scanId = Math.random().toString(36).substring(2, 11);
    const startTime = new Date().toISOString();
    // Simulate a scan duration between 2-5 seconds
    const duration = Math.floor(Math.random() * 3000) + 2000;
    
    // Calculate an end time by adding the duration
    const endDate = new Date();
    endDate.setMilliseconds(endDate.getMilliseconds() + duration);
    const endTime = endDate.toISOString();
    
    // Generate a random number of vulnerabilities based on scan mode
    let vulnCount;
    switch (config.scanMode) {
      case 'quick':
        vulnCount = Math.floor(Math.random() * 5) + 1; // 1-5 vulnerabilities
        break;
      case 'standard':
        vulnCount = Math.floor(Math.random() * 10) + 5; // 5-15 vulnerabilities
        break;
      case 'thorough':
        vulnCount = Math.floor(Math.random() * 20) + 10; // 10-30 vulnerabilities
        break;
      default:
        vulnCount = Math.floor(Math.random() * 10) + 5; // Default 5-15
    }
    
    // Generate mock vulnerabilities
    const vulnerabilities: Vulnerability[] = [];
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    let infoCount = 0;
    
    for (let i = 0; i < vulnCount; i++) {
      const severities: Array<Vulnerability['severity']> = ['info', 'low', 'medium', 'high', 'critical'];
      const severity: Vulnerability['severity'] = severities[Math.floor(Math.random() * severities.length)];
      
      // Count by severity
      switch (severity) {
        case 'critical': criticalCount++; break;
        case 'high': highCount++; break;
        case 'medium': mediumCount++; break;
        case 'low': lowCount++; break;
        case 'info': infoCount++; break;
      }
      
      // Generate XSS vulnerability
      if (i % 5 === 0 && config.xssTests) {
        vulnerabilities.push({
          id: `VLN-${Math.random().toString(36).substring(2, 9)}`,
          name: 'Cross-Site Scripting (XSS)',
          description: 'A reflected XSS vulnerability was found that allows attackers to inject malicious scripts.',
          severity: severity,
          url: `${config.url}/page${i}.php`,
          parameter: 'search',
          payload: '<script>alert(1);</script>',
          evidence: 'Response contains the unfiltered payload',
          category: 'XSS',
          remediation: 'Filter and escape user input. Consider implementing a Content Security Policy.',
          screenshot: i % 2 === 0 ? `/screenshots/xss${i}.png` : undefined,
          cwes: ['CWE-79'],
          cvss: 6.1,
          status: 'open',
          discoveredAt: new Date().toISOString()
        });
      } 
      // Generate SQL Injection vulnerability
      else if (i % 5 === 1 && config.sqlInjectionTests) {
        vulnerabilities.push({
          id: `VLN-${Math.random().toString(36).substring(2, 9)}`,
          name: 'SQL Injection',
          description: 'A SQL injection vulnerability was detected that could allow attackers to access or modify database data.',
          severity: severity,
          url: `${config.url}/product.php`,
          parameter: 'id',
          payload: "1' OR '1'='1",
          evidence: 'Database returned unexpected results',
          category: 'SQL Injection',
          remediation: 'Use parameterized queries or prepared statements. Implement input validation.',
          screenshot: i % 2 === 0 ? `/screenshots/sqli${i}.png` : undefined,
          cwes: ['CWE-89'],
          cvss: 8.5,
          status: 'open',
          discoveredAt: new Date().toISOString()
        });
      }
      // Generate CSRF vulnerability
      else if (i % 5 === 2 && config.csrfTests) {
        vulnerabilities.push({
          id: `VLN-${Math.random().toString(36).substring(2, 9)}`,
          name: 'Cross-Site Request Forgery (CSRF)',
          description: 'A CSRF vulnerability was found that could allow attackers to perform actions on behalf of authenticated users.',
          severity: severity,
          url: `${config.url}/account/settings`,
          parameter: undefined,
          payload: undefined,
          evidence: 'Form submission lacks anti-CSRF token',
          category: 'CSRF',
          remediation: 'Implement anti-CSRF tokens for all state-changing operations.',
          screenshot: i % 2 === 0 ? `/screenshots/csrf${i}.png` : undefined,
          cwes: ['CWE-352'],
          cvss: 5.8,
          status: 'open',
          discoveredAt: new Date().toISOString()
        });
      }
      // Generate Security Headers vulnerability
      else if (i % 5 === 3 && config.headerTests) {
        vulnerabilities.push({
          id: `VLN-${Math.random().toString(36).substring(2, 9)}`,
          name: 'Missing Security Headers',
          description: 'The application is missing important security headers that help protect against common web vulnerabilities.',
          severity: severity,
          url: config.url,
          parameter: undefined,
          payload: undefined,
          evidence: 'Content-Security-Policy header is not set',
          category: 'Security Headers',
          remediation: 'Implement recommended security headers: Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, etc.',
          screenshot: undefined,
          cwes: ['CWE-693'],
          cvss: 3.7,
          status: 'open',
          discoveredAt: new Date().toISOString()
        });
      }
      // Generate File Upload vulnerability
      else if (i % 5 === 4 && config.fileUploadTests) {
        vulnerabilities.push({
          id: `VLN-${Math.random().toString(36).substring(2, 9)}`,
          name: 'Insecure File Upload',
          description: 'The application allows uploading of potentially dangerous file types without proper validation.',
          severity: severity,
          url: `${config.url}/upload.php`,
          parameter: 'file',
          payload: 'malicious.php.jpg',
          evidence: 'Server accepted file with double extension',
          category: 'File Upload',
          remediation: 'Implement strict file type validation, scan uploads for malware, use a separate domain for storing user uploads.',
          screenshot: i % 2 === 0 ? `/screenshots/upload${i}.png` : undefined,
          cwes: ['CWE-434'],
          cvss: 7.2,
          status: 'open',
          discoveredAt: new Date().toISOString()
        });
      }
    }
    
    // Calculate number of tested URLs and parameters
    const testedURLsCount = config.maxDepth * 5;
    const testedParametersCount = testedURLsCount * 3;
    
    // Generate a list of URLs that were tested
    const testedURLs: string[] = [];
    for (let i = 0; i < testedURLsCount; i++) {
      testedURLs.push(`${config.url}/path${i}/${Math.random().toString(36).substring(2, 11)}`);
    }
    
    // Generate mock screenshots if enabled
    const screenshots = config.captureScreenshots ? vulnerabilities
      .filter(v => v.screenshot)
      .map(v => ({ url: v.url, path: v.screenshot as string })) : undefined;
    
    // Generate mock AI analysis if enabled
    let aiSummary, aiRemediation;
    if (config.aiAnalysis) {
      aiSummary = `The scan identified ${vulnerabilities.length} vulnerabilities with ${criticalCount} critical and ${highCount} high severity issues. The most concerning vulnerabilities include ${criticalCount > 0 ? 'Critical severity XSS' : highCount > 0 ? 'High severity SQL Injection' : 'Medium severity security misconfigurations'}.`;
      
      aiRemediation = `To remediate the most critical issues:
1. Implement input validation and output encoding to prevent XSS attacks
2. Use parameterized queries for all database operations
3. Implement proper CSRF protection with tokens
4. Add recommended security headers to all responses
5. Enhance file upload security with strict validation

We recommend addressing Critical and High severity issues immediately as they pose significant risk to your application.`;
    }
    
    return {
      summary: {
        scanID: scanId,
        url: config.url,
        startTime,
        endTime,
        duration,
        total: vulnerabilities.length,
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
        info: infoCount,
        testedURLs: testedURLsCount,
        testedParameters: testedParametersCount,
        engineVersion: '1.0.0',
        scanMode: config.scanMode
      },
      vulnerabilities,
      testedURLs,
      screenshots,
      certificateInfo: {
        valid: true,
        issuer: 'Let\'s Encrypt Authority X3',
        validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        daysRemaining: 60
      },
      serverInfo: {
        server: 'Apache/2.4.41 (Ubuntu)',
        technologies: ['PHP/7.4.3', 'MySQL/8.0.28', 'jQuery/3.6.0'],
        headers: {
          'Server': 'Apache/2.4.41 (Ubuntu)',
          'X-Powered-By': 'PHP/7.4.3'
        }
      },
      aiSummary,
      aiRemediation
    };
  }
}
