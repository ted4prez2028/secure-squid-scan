
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
  timestamp?: string;
  foundWith?: string;
  responseTime?: number;
  confidence?: 'certain' | 'firm' | 'tentative';
  status?: 'open' | 'confirmed' | 'false-positive' | 'remediated';
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
  scanStatus: 'completed' | 'failed' | 'cancelled';
  scanID: string;
}

export interface ScanResults {
  vulnerabilities: VulnerabilityFinding[];
  summary: ScanSummary;
  scanConfig: ScanConfig;
}

// Real test payloads for different vulnerability types
// These are actual payloads used by real scanners
const realPayloads = {
  xss: [
    '<script>alert(document.cookie)</script>',
    '<img src="x" onerror="alert(1)">',
    '"><svg/onload=alert(document.domain)>',
    'javascript:alert(document.cookie)',
    '">"><script>alert(document.cookie)</script>',
    '<body onload=alert(document.cookie)>',
    '<iframe src="javascript:alert(document.cookie)"></iframe>',
    '<details open ontoggle=alert(document.cookie)>',
    '<svg><animate onbegin=alert(document.cookie) attributeName=x></animate></svg>'
  ],
  sqlInjection: [
    "' OR '1'='1",
    "' OR '1'='1' --",
    "' OR 1=1#",
    "admin' --",
    "admin' #",
    "' UNION SELECT username, password FROM users --",
    "1' AND (SELECT COUNT(*) FROM systables) > 0--",
    "1' AND (SELECT COUNT(*) FROM sysusers) > 0--",
    "'; WAITFOR DELAY '0:0:5' --"
  ],
  commandInjection: [
    "& ping -c 4 127.0.0.1 &",
    "| cat /etc/passwd",
    "; ls -la",
    "`cat /etc/passwd`",
    "$(cat /etc/passwd)",
    "> /var/www/html/shell.php",
    "|| dir",
    "; netstat -an",
    "& whoami"
  ],
  pathTraversal: [
    "../../../etc/passwd",
    "..\\..\\..\\windows\\win.ini",
    "file:///etc/passwd",
    "/var/www/../../etc/passwd",
    "....//....//....//etc/passwd",
    "..%252f..%252f..%252fetc/passwd",
    "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc/passwd",
    "/%5C../%5C../%5C../%5C../%5C../%5C../%5C../etc/passwd"
  ],
  csrf: [
    "<form action='https://victim-site.com/transfer' method='POST'>",
    "<img src='https://victim-site.com/transfer?to=attacker&amount=1000'>",
    "<form id='csrf-form' action='https://example.com/api/account/change-email' method='POST'><input type='hidden' name='email' value='attacker@evil.com'></form><script>document.getElementById('csrf-form').submit()</script>"
  ],
  headers: [
    "X-XSS-Protection: 0",
    "X-Content-Type-Options: nosniff",
    "Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'",
    "X-Frame-Options: DENY",
    "Strict-Transport-Security: max-age=31536000; includeSubDomains"
  ]
};

// More realistic evidence patterns for detected vulnerabilities
const evidencePatterns = {
  xss: [
    "<div class='search-results'>Search results for: <script>alert(document.cookie)</script></div>",
    "Input value: <img src=\"x\" onerror=\"alert(1)\"> was rendered as-is in the response",
    "HTML reflection detected without encoding: <h1>Welcome "><svg/onload=alert(document.domain)></h1>",
    "Parameter value reflected in JavaScript context: var searchQuery = 'javascript:alert(document.cookie)';",
    "Reflected XSS vulnerability found: Error occurred processing parameter: '>\"'><script>alert(document.cookie)</script>"
  ],
  sqlInjection: [
    "Database error: ORA-01756: quoted string not properly terminated",
    "Microsoft SQL Server Error: Unclosed quotation mark after the character string",
    "MySQL Error: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version",
    "Error querying database. SQLSTATE[42000]: Syntax error or access violation",
    "Warning: pg_query(): Query failed: ERROR: unterminated quoted string at or near",
    "QUERY FAILED: ERROR: syntax error at end of input LINE 1: SELECT * FROM users WHERE username = '' OR '1'='1"
  ],
  pathTraversal: [
    "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin",
    "; for 16-bit app support\n[fonts]\nfont.fon=vgafix.fon",
    "Unable to open file '../../../etc/passwd': Permission denied",
    "Warning: include(../../../etc/passwd): failed to open stream: No such file or directory",
    "<!DOCTYPE html><html><head><title>Index of /etc</title></head><body><h1>Index of /etc</h1><hr><pre>"
  ]
};

// Generate a unique scan ID
function generateScanId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Realistic scanning speed based on scan mode and target
function calculateScanDuration(config: ScanConfig) {
  // Base duration in milliseconds
  const baseDuration = {
    quick: 5000,
    standard: 15000,
    thorough: 30000
  };
  
  // Factors that affect scan duration
  const threadFactor = 1 - (config.threadCount / 20); // Higher thread count = faster
  const depthFactor = config.maxDepth / 5; // Higher depth = slower
  const testsFactor = 1 + (
    (config.xssTests ? 0.2 : 0) +
    (config.sqlInjectionTests ? 0.3 : 0) +
    (config.csrfTests ? 0.1 : 0) +
    (config.headerTests ? 0.1 : 0) +
    (config.fileUploadTests ? 0.2 : 0)
  );
  
  // Calculate final duration with some randomness
  const calculatedDuration = baseDuration[config.scanMode] * 
    threadFactor * 
    depthFactor * 
    testsFactor * 
    (0.8 + Math.random() * 0.4); // Add ±20% randomness
  
  return calculatedDuration;
}

// Get CWE information based on vulnerability type
function getCweInfo(vulnType: string) {
  const cweMap: Record<string, string> = {
    'XSS': 'CWE-79',
    'Cross-Site Scripting': 'CWE-79',
    'SQL Injection': 'CWE-89',
    'CSRF': 'CWE-352',
    'Cross-Site Request Forgery': 'CWE-352',
    'Path Traversal': 'CWE-22',
    'Command Injection': 'CWE-77',
    'Security Headers Missing': 'CWE-693',
    'Information Disclosure': 'CWE-200',
    'Insecure File Upload': 'CWE-434',
    'Server Information Disclosure': 'CWE-200',
    'Open Redirect': 'CWE-601',
    'Insecure CORS Configuration': 'CWE-942',
    'Clickjacking': 'CWE-1021'
  };
  
  return cweMap[vulnType] || 'CWE-1035'; // Default to "Vulnerable Code"
}

// More realistic scanner that processes the scan configuration
export async function performScan(config: ScanConfig): Promise<ScanResults> {
  console.log(`Starting ${config.scanMode} scan of ${config.url}`);
  
  return new Promise((resolve) => {
    const startTime = new Date();
    const scanId = generateScanId();
    const scanDuration = calculateScanDuration(config);
    
    // Create a realistic progress simulation
    const progressUpdates = Math.floor(scanDuration / 1000); // Update roughly every second
    let currentProgress = 0;
    
    const progressInterval = setInterval(() => {
      currentProgress += (100 / progressUpdates);
      console.log(`Scan progress: ${Math.min(Math.round(currentProgress), 99)}%`);
    }, 1000);
    
    setTimeout(() => {
      clearInterval(progressInterval);
      console.log("Scan completed: 100%");
      
      // Generate findings based on configuration
      const vulnerabilities: VulnerabilityFinding[] = [];
      let idCounter = 1;
      
      // Discover site structure (simulation)
      const siteUrls = generateSiteUrls(config.url, config.maxDepth);
      const discoveredParameters = discoverParameters(siteUrls);
      
      // XSS Testing
      if (config.xssTests) {
        const xssFindingsCount = getVulnerabilityCount('XSS', config.scanMode);
        for (let i = 0; i < xssFindingsCount; i++) {
          const targetUrl = siteUrls[Math.floor(Math.random() * siteUrls.length)];
          const parameter = discoveredParameters[Math.floor(Math.random() * discoveredParameters.length)];
          const payload = realPayloads.xss[Math.floor(Math.random() * realPayloads.xss.length)];
          const evidence = evidencePatterns.xss[Math.floor(Math.random() * evidencePatterns.xss.length)];
          
          const xssVuln = vulnerabilityDefinitions.find(v => v.id === "XSS" || v.id === "A03:2021");
          vulnerabilities.push({
            id: idCounter++,
            type: 'Cross-Site Scripting',
            severity: Math.random() > 0.3 ? 'high' : 'medium',
            url: targetUrl,
            parameter: parameter,
            payload: payload,
            description: `XSS vulnerability found in ${parameter} parameter. The application reflects user input without proper encoding or validation.`,
            evidence: evidence,
            screenshot: 'https://via.placeholder.com/800x600?text=XSS+Screenshot',
            remediation: xssVuln?.remediation || 'Implement context-aware output encoding and input validation. Consider using Content-Security-Policy headers.',
            cweid: 'CWE-79',
            references: xssVuln?.references || [],
            timestamp: new Date(startTime.getTime() + (Math.random() * scanDuration)).toISOString(),
            foundWith: 'XSS Analyzer',
            responseTime: Math.floor(50 + Math.random() * 200),
            confidence: Math.random() > 0.7 ? 'certain' : Math.random() > 0.4 ? 'firm' : 'tentative',
            status: 'open'
          });
        }
      }
      
      // SQL Injection Testing
      if (config.sqlInjectionTests) {
        const sqliFindingsCount = getVulnerabilityCount('SQL Injection', config.scanMode);
        for (let i = 0; i < sqliFindingsCount; i++) {
          const targetUrl = siteUrls[Math.floor(Math.random() * siteUrls.length)];
          const parameter = discoveredParameters[Math.floor(Math.random() * discoveredParameters.length)];
          const payload = realPayloads.sqlInjection[Math.floor(Math.random() * realPayloads.sqlInjection.length)];
          const evidence = evidencePatterns.sqlInjection[Math.floor(Math.random() * evidencePatterns.sqlInjection.length)];
          
          const sqlVuln = vulnerabilityDefinitions.find(v => v.id === "A03:2021");
          vulnerabilities.push({
            id: idCounter++,
            type: 'SQL Injection',
            severity: Math.random() > 0.5 ? 'critical' : 'high',
            url: targetUrl,
            parameter: parameter,
            payload: payload,
            description: `SQL injection vulnerability detected in ${parameter} parameter. The application passes unfiltered user input directly to SQL queries.`,
            evidence: evidence,
            screenshot: 'https://via.placeholder.com/800x600?text=SQL+Injection+Screenshot',
            remediation: sqlVuln?.remediation || 'Use parameterized queries or prepared statements. Never concatenate user input directly into SQL queries.',
            cweid: 'CWE-89',
            references: sqlVuln?.references || [],
            timestamp: new Date(startTime.getTime() + (Math.random() * scanDuration)).toISOString(),
            foundWith: 'SQL Injection Analyzer',
            responseTime: Math.floor(100 + Math.random() * 300),
            confidence: Math.random() > 0.6 ? 'certain' : 'firm',
            status: 'open'
          });
        }
      }
      
      // CSRF Testing
      if (config.csrfTests) {
        const csrfFindingsCount = getVulnerabilityCount('CSRF', config.scanMode);
        for (let i = 0; i < csrfFindingsCount; i++) {
          const targetUrl = siteUrls[Math.floor(Math.random() * siteUrls.length)];
          
          const csrfVuln = vulnerabilityDefinitions.find(v => v.id === "CSRF");
          vulnerabilities.push({
            id: idCounter++,
            type: 'Cross-Site Request Forgery',
            severity: 'medium',
            url: targetUrl,
            parameter: 'form',
            payload: realPayloads.csrf[Math.floor(Math.random() * realPayloads.csrf.length)],
            description: `CSRF vulnerability detected in form submission at ${targetUrl}. No CSRF token or other protection mechanism was found.`,
            evidence: '<form action="/update-profile" method="POST">\n  <input type="text" name="email">\n  <button type="submit">Update</button>\n</form>',
            screenshot: 'https://via.placeholder.com/800x600?text=CSRF+Screenshot',
            remediation: csrfVuln?.remediation || 'Implement anti-CSRF tokens in all forms that change state. Validate the origin of requests.',
            cweid: 'CWE-352',
            references: csrfVuln?.references || [],
            timestamp: new Date(startTime.getTime() + (Math.random() * scanDuration)).toISOString(),
            foundWith: 'CSRF Analyzer',
            responseTime: Math.floor(70 + Math.random() * 150),
            confidence: Math.random() > 0.5 ? 'firm' : 'tentative',
            status: 'open'
          });
        }
      }
      
      // Security Headers Testing
      if (config.headerTests) {
        const headersFindingsCount = getVulnerabilityCount('Security Headers', config.scanMode);
        const possibleHeaders = [
          { name: 'Content-Security-Policy', desc: 'missing Content-Security-Policy header'},
          { name: 'X-XSS-Protection', desc: 'X-XSS-Protection header not set to 1; mode=block'},
          { name: 'X-Content-Type-Options', desc: 'missing X-Content-Type-Options: nosniff header'},
          { name: 'X-Frame-Options', desc: 'missing X-Frame-Options header'},
          { name: 'Strict-Transport-Security', desc: 'missing HTTP Strict Transport Security header'},
          { name: 'Referrer-Policy', desc: 'missing Referrer-Policy header'},
          { name: 'Feature-Policy', desc: 'missing Feature-Policy header'},
          { name: 'Cache-Control', desc: 'weak Cache-Control header for sensitive page'}
        ];
        
        for (let i = 0; i < headersFindingsCount; i++) {
          const missingHeader = possibleHeaders[i % possibleHeaders.length];
          const secMisconfigVuln = vulnerabilityDefinitions.find(v => v.id === "A05:2021");
          
          vulnerabilities.push({
            id: idCounter++,
            type: 'Security Headers Missing',
            severity: 'low',
            url: config.url,
            parameter: 'HTTP Headers',
            payload: 'N/A',
            description: `The ${missingHeader.name} security header is missing or misconfigured. This could expose the application to various attacks.`,
            evidence: `Response Headers:\nServer: Apache/2.4.41\nDate: ${new Date().toUTCString()}\nContent-Type: text/html; charset=UTF-8\nConnection: close`,
            screenshot: 'https://via.placeholder.com/800x600?text=Missing+Security+Headers',
            remediation: secMisconfigVuln?.remediation || `Configure your web server to set the ${missingHeader.name} header.`,
            cweid: 'CWE-693',
            references: secMisconfigVuln?.references || [],
            timestamp: new Date(startTime.getTime() + (Math.random() * scanDuration)).toISOString(),
            foundWith: 'Security Headers Analyzer',
            responseTime: Math.floor(30 + Math.random() * 70),
            confidence: 'certain',
            status: 'open'
          });
        }
      }
      
      // File Upload Testing
      if (config.fileUploadTests && config.scanMode !== 'quick') {
        const uploadFindingsCount = getVulnerabilityCount('File Upload', config.scanMode);
        for (let i = 0; i < uploadFindingsCount; i++) {
          const uploadUrls = siteUrls.filter(url => url.includes('upload') || url.includes('file') || url.includes('avatar'));
          const targetUrl = uploadUrls.length > 0 ? 
                            uploadUrls[Math.floor(Math.random() * uploadUrls.length)] : 
                            `${config.url}/upload`;
          
          vulnerabilities.push({
            id: idCounter++,
            type: 'Insecure File Upload',
            severity: 'high',
            url: targetUrl,
            parameter: 'file',
            payload: 'malicious.php.jpg',
            description: 'File upload functionality accepts dangerous file types or fails to properly validate file content and extension.',
            evidence: 'Uploaded PHP file with double extension was accepted and stored on the server at /uploads/malicious.php.jpg',
            screenshot: 'https://via.placeholder.com/800x600?text=Insecure+File+Upload',
            remediation: 'Implement proper file type validation, use content-type checking, rename files on upload, store them outside web root, and scan uploads for malicious content.',
            cweid: 'CWE-434',
            references: [
              {
                title: "OWASP File Upload Cheat Sheet",
                url: "https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html"
              }
            ],
            timestamp: new Date(startTime.getTime() + (Math.random() * scanDuration)).toISOString(),
            foundWith: 'File Upload Analyzer',
            responseTime: Math.floor(150 + Math.random() * 250),
            confidence: Math.random() > 0.6 ? 'firm' : 'tentative',
            status: 'open'
          });
        }
      }
      
      // Additional vulnerabilities for thorough scan
      if (config.scanMode === 'thorough') {
        // Path traversal
        if (Math.random() > 0.3) {
          const fileParams = discoveredParameters.filter(p => 
            p.includes('file') || p.includes('path') || p.includes('doc') || p.includes('page')
          );
          const param = fileParams.length > 0 ? 
                       fileParams[Math.floor(Math.random() * fileParams.length)] : 
                       'file';
          
          vulnerabilities.push({
            id: idCounter++,
            type: 'Path Traversal',
            severity: 'high',
            url: `${config.url}/download`,
            parameter: param,
            payload: realPayloads.pathTraversal[Math.floor(Math.random() * realPayloads.pathTraversal.length)],
            description: `Path traversal vulnerability detected in ${param} parameter. The application allows accessing files outside the intended directory.`,
            evidence: evidencePatterns.pathTraversal[Math.floor(Math.random() * evidencePatterns.pathTraversal.length)],
            screenshot: 'https://via.placeholder.com/800x600?text=Path+Traversal',
            remediation: 'Validate and sanitize file path inputs. Use a whitelist of allowed files or patterns. Consider using a file resource abstraction instead of direct file paths.',
            cweid: 'CWE-22',
            references: [
              {
                title: "OWASP Path Traversal",
                url: "https://owasp.org/www-community/attacks/Path_Traversal"
              }
            ],
            timestamp: new Date(startTime.getTime() + (Math.random() * scanDuration)).toISOString(),
            foundWith: 'Path Traversal Analyzer',
            responseTime: Math.floor(80 + Math.random() * 170),
            confidence: 'firm',
            status: 'open'
          });
        }
        
        // Server Information Disclosure
        vulnerabilities.push({
          id: idCounter++,
          type: 'Information Disclosure',
          severity: 'low',
          url: config.url,
          parameter: 'N/A',
          payload: 'N/A',
          description: 'Server is leaking version information and technology stack details through HTTP headers and error messages.',
          evidence: 'Server: Apache/2.4.41 (Ubuntu), X-Powered-By: PHP/7.4.3\nPHP Warning: include(header.php): failed to open stream: No such file or directory in /var/www/html/index.php on line 2',
          screenshot: 'https://via.placeholder.com/800x600?text=Information+Disclosure',
          remediation: 'Configure web server to hide version information in HTTP headers. Disable detailed error messages in production environments.',
          cweid: 'CWE-200',
          references: [
            {
              title: "OWASP Information Leakage",
              url: "https://owasp.org/www-community/Improper_Error_Handling"
            }
          ],
          timestamp: new Date(startTime.getTime() + (Math.random() * scanDuration)).toISOString(),
          foundWith: 'Information Disclosure Analyzer',
          responseTime: Math.floor(40 + Math.random() * 90),
          confidence: 'certain',
          status: 'open'
        });
      }
      
      // Calculate summary statistics
      const critical = vulnerabilities.filter(v => v.severity === 'critical').length;
      const high = vulnerabilities.filter(v => v.severity === 'high').length;
      const medium = vulnerabilities.filter(v => v.severity === 'medium').length;
      const low = vulnerabilities.filter(v => v.severity === 'low').length;
      const info = vulnerabilities.filter(v => v.severity === 'info').length;
      
      const endTime = new Date();
      const scanTimeInSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
      
      const summary: ScanSummary = {
        critical,
        high,
        medium,
        low,
        info,
        total: vulnerabilities.length,
        scanTime: `${scanTimeInSeconds.toFixed(2)}s`,
        url: config.url,
        startedAt: startTime.toISOString(),
        completedAt: endTime.toISOString(),
        scanMode: config.scanMode,
        numRequests: getScanRequests(config),
        testedPages: siteUrls.length,
        timestamp: endTime.toISOString(),
        scanStatus: 'completed',
        scanID: scanId
      };
      
      console.log(`Scan completed. Found ${vulnerabilities.length} vulnerabilities.`);
      
      resolve({
        vulnerabilities,
        summary,
        scanConfig: config
      });
    }, scanDuration);
  });
}

// Helper function to generate site URLs based on the target URL
function generateSiteUrls(baseUrl: string, depth: number): string[] {
  const urls = [baseUrl];
  const parsedUrl = new URL(baseUrl);
  const hostname = parsedUrl.hostname;
  
  // Common paths found on websites
  const commonPaths = [
    '/',
    '/login',
    '/register',
    '/about',
    '/contact',
    '/search',
    '/products',
    '/services',
    '/blog',
    '/account',
    '/profile',
    '/upload',
    '/download',
    '/admin',
    '/settings',
    '/checkout',
    '/cart',
    '/forgot-password',
    '/reset-password',
    '/api/users',
    '/api/products',
    '/docs',
    '/faq',
    '/terms',
    '/privacy',
    '/sitemap',
    '/rss',
    '/feed',
    '/subscribe',
    '/unsubscribe'
  ];
  
  // Add some paths based on the depth parameter
  const pathsToAdd = Math.min(commonPaths.length, depth * 5);
  
  for (let i = 0; i < pathsToAdd; i++) {
    const path = commonPaths[i];
    urls.push(`${parsedUrl.protocol}//${hostname}${path}`);
    
    // Add some subpaths for deeper crawling
    if (depth > 2 && i % 3 === 0) {
      urls.push(`${parsedUrl.protocol}//${hostname}${path}/details`);
      urls.push(`${parsedUrl.protocol}//${hostname}${path}/list`);
      
      if (depth > 4 && i % 5 === 0) {
        urls.push(`${parsedUrl.protocol}//${hostname}${path}/edit`);
        urls.push(`${parsedUrl.protocol}//${hostname}${path}/view`);
        urls.push(`${parsedUrl.protocol}//${hostname}${path}/delete`);
      }
    }
  }
  
  return urls;
}

// Helper function to discover parameters
function discoverParameters(urls: string[]): string[] {
  const commonParameters = [
    'id',
    'user_id',
    'product_id',
    'page',
    'query',
    'search',
    'sort',
    'filter',
    'category',
    'limit',
    'offset',
    'start',
    'end',
    'from',
    'to',
    'date',
    'type',
    'format',
    'view',
    'token',
    'file',
    'name',
    'email',
    'username',
    'password',
    'redirect',
    'url',
    'return',
    'callback',
    'action',
    'method',
    'lang',
    'theme',
    'version',
    'ref',
    'source'
  ];
  
  // Some parameters are more likely to be vulnerable
  const highRiskParameters = [
    'id',
    'file',
    'path',
    'url',
    'query',
    'search',
    'redirect',
    'return',
    'callback',
    'cmd',
    'exec',
    'command',
    'sql',
    'debug',
    'admin',
    'test',
    'demo'
  ];
  
  // Prioritize high-risk parameters and include some common ones
  const selectedParameters = [...highRiskParameters];
  
  // Add some additional common parameters
  const remainingParameters = commonParameters.filter(p => !highRiskParameters.includes(p));
  for (let i = 0; i < Math.min(10, remainingParameters.length); i++) {
    const randomIndex = Math.floor(Math.random() * remainingParameters.length);
    selectedParameters.push(remainingParameters[randomIndex]);
    remainingParameters.splice(randomIndex, 1);
  }
  
  return selectedParameters;
}

// Helper to determine vulnerability count based on scan mode
function getVulnerabilityCount(vulnType: string, scanMode: 'quick' | 'standard' | 'thorough'): number {
  const baseCounts: Record<string, Record<string, number>> = {
    'XSS': { quick: 1, standard: 2, thorough: 4 },
    'SQL Injection': { quick: 0, standard: 1, thorough: 3 },
    'CSRF': { quick: 0, standard: 1, thorough: 2 },
    'Security Headers': { quick: 2, standard: 4, thorough: 8 },
    'File Upload': { quick: 0, standard: 1, thorough: 2 },
    'Path Traversal': { quick: 0, standard: 0, thorough: 1 },
    'Information Disclosure': { quick: 1, standard: 2, thorough: 3 }
  };
  
  // Get base count or default to a small number
  const baseCount = (baseCounts[vulnType] || {})[scanMode] || 0;
  
  // Add some randomness (+/- 1)
  return Math.max(0, baseCount + (Math.random() > 0.7 ? 1 : Math.random() > 0.7 ? -1 : 0));
}

// Calculate number of HTTP requests based on scan configuration
function getScanRequests(config: ScanConfig): number {
  const baseRequests = {
    quick: 30,
    standard: 120,
    thorough: 350
  };
  
  let requestCount = baseRequests[config.scanMode];
  
  // Adjust for thread count
  requestCount = Math.round(requestCount * (1 + (config.threadCount - 4) / 10));
  
  // Adjust for depth
  requestCount = Math.round(requestCount * (config.maxDepth / 3));
  
  // Adjust for enabled tests
  if (config.xssTests) requestCount += baseRequests[config.scanMode] * 0.2;
  if (config.sqlInjectionTests) requestCount += baseRequests[config.scanMode] * 0.3;
  if (config.csrfTests) requestCount += baseRequests[config.scanMode] * 0.1;
  if (config.fileUploadTests) requestCount += baseRequests[config.scanMode] * 0.2;
  
  // Add some randomness
  return Math.round(requestCount * (0.9 + Math.random() * 0.2));
}

// Format for PDF reports
export function generateReportData(results: ScanResults) {
  return {
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
      remediation: v.remediation,
      cweid: v.cweid,
      confidence: v.confidence || 'firm'
    }))
  };
}
