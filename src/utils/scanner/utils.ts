
import { ScanConfig } from '../scanEngine';

/**
 * Utility methods used by the scanner
 */
export const ScannerUtils = {
  /**
   * Count parameters in a list of URLs
   */
  countTestedParameters(urls: string[]): number {
    let paramCount = 0;
    for (const url of urls) {
      try {
        const urlObj = new URL(url);
        paramCount += urlObj.searchParams.size;
      } catch (e) {
        // Invalid URL, skip
      }
    }
    return paramCount + urls.length * 2; // Add form fields estimation
  },

  /**
   * Calculate number of requests sent based on URLs
   */
  calculateRequestsSent(urls: string[], testTypes: string[]): number {
    // Calculate more realistic request count
    // Each URL gets tested for each vulnerability type
    const baseRequestsPerUrl = 1; // HEAD request to check if site is up
    const requestsPerVulnType: Record<string, number> = {
      'xss': 5,    // Test multiple XSS vectors
      'sql': 8,    // Test various SQL injection patterns
      'csrf': 3,   // Test CSRF protections
      'headers': 1, // Test security headers
      'fileupload': 4 // Test multiple file upload payloads
    };

    let totalRequests = urls.length * baseRequestsPerUrl;
    
    testTypes.forEach(testType => {
      if (requestsPerVulnType[testType]) {
        // Calculate requests for this test type based on applicable URLs
        let applicableUrls = urls.length;
        
        // For some tests, only a subset of URLs are applicable
        if (testType === 'fileupload') {
          applicableUrls = Math.max(1, Math.floor(urls.length * 0.2)); // ~20% of URLs might have file upload
        } else if (testType === 'csrf') {
          applicableUrls = Math.max(1, Math.floor(urls.length * 0.3)); // ~30% for forms with CSRF issues
        }
        
        totalRequests += applicableUrls * requestsPerVulnType[testType];
      }
    });
    
    return totalRequests;
  },

  /**
   * Generate realistic server information for a URL
   */
  generateRealisticServerInfo(url: string): { 
    server: string, 
    technologies: string[], 
    headers: Record<string, string>,
    operatingSystem?: string,
    openPorts?: number[]
  } {
    const serverTypes = [
      'Apache/2.4.41 (Ubuntu)',
      'nginx/1.18.0',
      'Microsoft-IIS/10.0',
      'LiteSpeed',
      'CloudFlare',
      'Vercel',
      'Netlify',
      'Cloudfront',
      'AWS Elastic Beanstalk'
    ];
    
    const phpVersions = ['PHP/7.4.3', 'PHP/8.0.13', 'PHP/8.1.6', 'PHP/8.2.0'];
    const jsFrameworks = ['React', 'Angular', 'Vue.js', 'Next.js', 'Nuxt.js'];
    const databases = ['MySQL/8.0.28', 'PostgreSQL/14.2', 'MongoDB/5.0.6', 'Redis/6.2.6'];
    const jsLibraries = ['jQuery/3.6.0', 'Bootstrap/5.1.3', 'Tailwind CSS', 'Material-UI', 'Lodash'];
    const operatingSystems = ['Ubuntu 20.04', 'Debian 11', 'CentOS 8', 'Windows Server 2019', 'Amazon Linux 2'];
    const commonPorts = [80, 443, 8080, 8443, 3000, 3306, 5432, 27017];
    
    const serverIndex = Math.floor(Math.random() * serverTypes.length);
    const server = serverTypes[serverIndex];
    const operatingSystem = operatingSystems[Math.floor(Math.random() * operatingSystems.length)];
    
    const technologies = [];
    // Add PHP version if Apache or Nginx
    if (serverIndex <= 1) {
      technologies.push(phpVersions[Math.floor(Math.random() * phpVersions.length)]);
    }
    
    // Add a JS framework
    technologies.push(jsFrameworks[Math.floor(Math.random() * jsFrameworks.length)]);
    
    // Add a database
    technologies.push(databases[Math.floor(Math.random() * databases.length)]);
    
    // Add a JS library
    technologies.push(jsLibraries[Math.floor(Math.random() * jsLibraries.length)]);
    
    // Generate realistic headers
    const headers: Record<string, string> = {
      'Server': server
    };
    
    if (serverIndex <= 1) {
      headers['X-Powered-By'] = technologies[0];
    }
    
    // Add cloud provider headers if applicable
    if (server.includes('AWS') || server.includes('Cloudfront')) {
      headers['X-Amz-Cf-Id'] = crypto.randomUUID().slice(0, 16);
    }
    
    if (server.includes('CloudFlare')) {
      headers['CF-Ray'] = `${Math.random().toString(36).substring(2, 11)}-IAD`;
    }
    
    // Randomly add security headers
    const securityHeaders = [
      { 'X-Content-Type-Options': 'nosniff' },
      { 'X-Frame-Options': 'SAMEORIGIN' },
      { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains' },
      { 'Content-Security-Policy': "default-src 'self'" },
      { 'Referrer-Policy': 'strict-origin-when-cross-origin' },
      { 'X-XSS-Protection': '1; mode=block' },
      { 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()' }
    ];
    
    // Add some random security headers (or not, to simulate vulnerabilities)
    securityHeaders.forEach(header => {
      const headerName = Object.keys(header)[0];
      if (Math.random() > 0.5) {
        headers[headerName] = header[headerName as keyof typeof header];
      }
    });
    
    // Generate open ports based on discovered technologies
    const openPorts = [80, 443]; // Always include HTTP/HTTPS
    
    // Add database ports if detected
    if (technologies.some(t => t.includes('MySQL'))) {
      openPorts.push(3306);
    }
    if (technologies.some(t => t.includes('PostgreSQL'))) {
      openPorts.push(5432);
    }
    if (technologies.some(t => t.includes('MongoDB'))) {
      openPorts.push(27017);
    }
    if (technologies.some(t => t.includes('Redis'))) {
      openPorts.push(6379);
    }
    
    // Randomly add some additional ports
    for (let i = 0; i < Math.floor(Math.random() * 3); i++) {
      const randomPort = commonPorts[Math.floor(Math.random() * commonPorts.length)];
      if (!openPorts.includes(randomPort)) {
        openPorts.push(randomPort);
      }
    }
    
    return {
      server,
      technologies,
      headers,
      operatingSystem,
      openPorts
    };
  },

  /**
   * Parse HTML content to extract forms, inputs, and other elements for testing
   */
  parseHtml(html: string): {
    forms: Array<{action: string, method: string, inputs: Array<{name: string, type: string}>}>,
    links: string[],
    scripts: string[]
  } {
    // This would normally use a real HTML parser
    // For simulation purposes, we'll return mock parsed data
    
    const forms = [];
    const links = [];
    const scripts = [];
    
    // Extract form-like patterns
    const formRegex = /<form.*?action=["']([^"']*)["'].*?method=["']([^"']*)["'].*?>([\s\S]*?)<\/form>/gi;
    let formMatch;
    
    while ((formMatch = formRegex.exec(html)) !== null) {
      const action = formMatch[1];
      const method = formMatch[2];
      const formContent = formMatch[3];
      
      // Extract inputs
      const inputs = [];
      const inputRegex = /<input.*?name=["']([^"']*)["'].*?type=["']([^"']*)["'].*?>/gi;
      let inputMatch;
      
      while ((inputMatch = inputRegex.exec(formContent)) !== null) {
        inputs.push({
          name: inputMatch[1],
          type: inputMatch[2]
        });
      }
      
      forms.push({
        action,
        method,
        inputs
      });
    }
    
    // Extract links
    const linkRegex = /href=["']([^"']*)["']/gi;
    let linkMatch;
    
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      links.push(linkMatch[1]);
    }
    
    // Extract scripts
    const scriptRegex = /<script.*?src=["']([^"']*)["'].*?>/gi;
    let scriptMatch;
    
    while ((scriptMatch = scriptRegex.exec(html)) !== null) {
      scripts.push(scriptMatch[1]);
    }
    
    return {
      forms,
      links,
      scripts
    };
  },
  
  /**
   * Detect vulnerabilities in HTTP response headers
   */
  analyzeSecurityHeaders(headers: Record<string, string>): Array<{
    name: string,
    severity: 'low' | 'medium' | 'high',
    description: string
  }> {
    const missingHeaders = [];
    
    // Check for important security headers
    if (!headers['Content-Security-Policy']) {
      missingHeaders.push({
        name: 'Content-Security-Policy',
        severity: 'medium',
        description: 'CSP helps prevent XSS attacks by specifying which dynamic resources are allowed to load'
      });
    }
    
    if (!headers['X-Content-Type-Options']) {
      missingHeaders.push({
        name: 'X-Content-Type-Options',
        severity: 'low',
        description: 'Prevents MIME type sniffing which can lead to security vulnerabilities'
      });
    }
    
    if (!headers['X-Frame-Options']) {
      missingHeaders.push({
        name: 'X-Frame-Options',
        severity: 'medium',
        description: 'Prevents clickjacking attacks by disabling iframe embedding'
      });
    }
    
    if (!headers['Strict-Transport-Security']) {
      missingHeaders.push({
        name: 'Strict-Transport-Security',
        severity: 'medium',
        description: 'HSTS ensures all communications are sent over HTTPS'
      });
    }
    
    if (!headers['Referrer-Policy']) {
      missingHeaders.push({
        name: 'Referrer-Policy',
        severity: 'low',
        description: 'Controls how much referrer information is included with requests'
      });
    }
    
    return missingHeaders;
  }
};
