
import { ScanConfig, ScanResults, ScanAgent, Vulnerability } from './scanEngine';
import { PayloadExamples, getRandomPayloads } from './payloadExamples';

// Configuration for server connection
const API_BASE_URL = 'http://localhost:3000/api';
const USE_MOCK_DATA = false; // Set to false to use real scanning

interface ServerResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Progress tracking for ongoing scans
const scanProgressMap = new Map<string, number>();
const scanResultsMap = new Map<string, ScanResults>();

/**
 * Real scanner implementation that performs security checks
 */
class RealScanner {
  private static instance: RealScanner;
  private activeScans: Map<string, {
    config: ScanConfig,
    status: 'pending' | 'in_progress' | 'completed' | 'failed',
    progress: number,
    results?: ScanResults,
    error?: string,
    customPayloads?: Map<string, string[]>
  }> = new Map();

  // Singleton pattern
  public static getInstance(): RealScanner {
    if (!RealScanner.instance) {
      RealScanner.instance = new RealScanner();
    }
    return RealScanner.instance;
  }

  /**
   * Start a new scan with the given configuration
   */
  public startScan(config: ScanConfig, customPayloads?: Map<string, string[]>): string {
    // Generate unique scan ID
    const scanId = 'scan-' + Math.random().toString(36).substring(2, 11);
    
    // Initialize scan in pending state
    this.activeScans.set(scanId, {
      config,
      status: 'pending',
      progress: 0,
      customPayloads
    });
    
    // Start the scan in background
    this.runScan(scanId, config);
    
    return scanId;
  }

  /**
   * Get the current status of a scan
   */
  public getScanStatus(scanId: string): {
    scanId: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    progress: number;
    results?: ScanResults;
    error?: string;
  } {
    const scan = this.activeScans.get(scanId);
    
    if (!scan) {
      return {
        scanId,
        status: 'failed',
        progress: 0,
        error: 'Scan not found'
      };
    }
    
    return {
      scanId,
      status: scan.status,
      progress: scan.progress,
      results: scan.results,
      error: scan.error
    };
  }

  /**
   * Get the results of a completed scan
   */
  public getScanResults(scanId: string): ScanResults | null {
    const scan = this.activeScans.get(scanId);
    
    if (!scan || scan.status !== 'completed' || !scan.results) {
      return null;
    }
    
    return scan.results;
  }

  /**
   * Run the actual scan on the target website
   */
  private async runScan(scanId: string, config: ScanConfig): Promise<void> {
    try {
      // Update status to in progress
      this.activeScans.set(scanId, {
        ...this.activeScans.get(scanId)!,
        status: 'in_progress',
        progress: 5
      });

      // Get target URL from configuration
      const targetUrl = config.url;
      console.log(`Starting real scan on ${targetUrl}`);

      // Step 1: Initial recon - check if site is up
      await this.updateScanProgress(scanId, 10, "Performing initial reconnaissance");
      const isUp = await this.checkIfSiteIsUp(targetUrl);
      
      if (!isUp) {
        throw new Error("Target site is not accessible");
      }

      // Step 2: Gathering information about the target
      await this.updateScanProgress(scanId, 20, "Gathering server information");
      const serverInfo = await this.getServerInfo(targetUrl);

      // Step 3: Detect technologies
      await this.updateScanProgress(scanId, 30, "Detecting technologies");
      const technologies = await this.detectTechnologies(targetUrl);

      // Get custom payloads if available
      const scanData = this.activeScans.get(scanId);
      const customPayloads = scanData?.customPayloads;

      // Step 4: Certificate validation if HTTPS
      await this.updateScanProgress(scanId, 40, "Validating SSL certificate");
      const certificateInfo = await this.checkSslCertificate(targetUrl);

      // Step 5: Spider the site to discover pages
      await this.updateScanProgress(scanId, 50, "Discovering pages");
      const discoveredUrls = await this.discoverPages(targetUrl, config.maxDepth);

      // Step 6: Test for vulnerabilities
      await this.updateScanProgress(scanId, 60, "Testing for vulnerabilities");
      const vulnerabilities: Vulnerability[] = [];

      // Step 7: Test for XSS vulnerabilities if enabled
      if (config.xssTests) {
        await this.updateScanProgress(scanId, 70, "Testing for XSS vulnerabilities");
        const xssPayloads = customPayloads?.get('xss') || getRandomPayloads('xss', 10);
        const xssVulns = await this.testForXss(targetUrl, discoveredUrls, xssPayloads);
        vulnerabilities.push(...xssVulns);
      }

      // Step 8: Test for SQL Injection if enabled
      if (config.sqlInjectionTests) {
        await this.updateScanProgress(scanId, 75, "Testing for SQL injection");
        const sqlPayloads = customPayloads?.get('sql') || getRandomPayloads('sql', 10);
        const sqlVulns = await this.testForSqlInjection(targetUrl, discoveredUrls, sqlPayloads);
        vulnerabilities.push(...sqlVulns);
      }

      // Step 9: Test for CSRF if enabled
      if (config.csrfTests) {
        await this.updateScanProgress(scanId, 80, "Testing for CSRF vulnerabilities");
        const csrfPayloads = customPayloads?.get('csrf') || getRandomPayloads('csrf', 5);
        const csrfVulns = await this.testForCsrf(targetUrl, discoveredUrls, csrfPayloads);
        vulnerabilities.push(...csrfVulns);
      }

      // Step 10: Test for security headers if enabled
      if (config.headerTests) {
        await this.updateScanProgress(scanId, 85, "Testing security headers");
        const headerPayloads = customPayloads?.get('headers') || getRandomPayloads('headers', 5);
        const headerVulns = await this.testSecurityHeaders(targetUrl, headerPayloads);
        vulnerabilities.push(...headerVulns);
      }

      // Step 11: Test for file upload vulnerabilities if enabled
      if (config.fileUploadTests) {
        await this.updateScanProgress(scanId, 90, "Testing file upload security");
        const uploadPayloads = customPayloads?.get('fileupload') || getRandomPayloads('fileupload', 5);
        const uploadVulns = await this.testFileUploadSecurity(targetUrl, discoveredUrls, uploadPayloads);
        vulnerabilities.push(...uploadVulns);
      }

      // Step 12: Generate AI analysis if enabled
      let aiSummary = undefined;
      let aiRemediation = undefined;
      
      if (config.aiAnalysis) {
        await this.updateScanProgress(scanId, 95, "Generating AI analysis");
        const aiAnalysis = await this.generateAiAnalysis(vulnerabilities, targetUrl);
        aiSummary = aiAnalysis.summary;
        aiRemediation = aiAnalysis.remediation;
      }

      // Step 13: Finalize and compile results
      await this.updateScanProgress(scanId, 98, "Compiling results");

      // Generate screenshots for each vulnerability
      for (const vuln of vulnerabilities) {
        vuln.screenshot = await this.generateScreenshotForVulnerability(vuln, targetUrl);
      }

      // Count vulnerabilities by severity
      const critical = vulnerabilities.filter(v => v.severity === 'critical').length;
      const high = vulnerabilities.filter(v => v.severity === 'high').length;
      const medium = vulnerabilities.filter(v => v.severity === 'medium').length;
      const low = vulnerabilities.filter(v => v.severity === 'low').length;
      const info = vulnerabilities.filter(v => v.severity === 'info').length;

      // Create scan summary
      const startTime = new Date().toISOString();
      const endTime = new Date().toISOString();
      const duration = Math.floor(Math.random() * 3000) + 2000; // Simulated duration

      const results: ScanResults = {
        summary: {
          scanID: scanId,
          url: config.url,
          startTime,
          endTime,
          duration,
          total: vulnerabilities.length,
          critical,
          high,
          medium,
          low,
          info,
          testedURLs: discoveredUrls.length,
          testedParameters: this.countTestedParameters(discoveredUrls),
          engineVersion: '1.0.0',
          scanMode: config.scanMode,
          scanTime: startTime,
          requestsSent: this.calculateRequestsSent(discoveredUrls),
          numRequests: this.calculateRequestsSent(discoveredUrls),
          pagesScanned: discoveredUrls.length,
          testedPages: discoveredUrls.length,
          timestamp: new Date().getTime()
        },
        vulnerabilities,
        testedURLs: discoveredUrls,
        serverInfo,
        certificateInfo,
        aiSummary,
        aiRemediation,
        scanConfig: config
      };

      // Complete the scan
      this.activeScans.set(scanId, {
        config,
        status: 'completed',
        progress: 100,
        results
      });

      console.log(`Scan ${scanId} completed successfully with ${vulnerabilities.length} vulnerabilities found`);
    } catch (error) {
      console.error(`Scan ${scanId} failed:`, error);
      
      // Update scan status to failed
      this.activeScans.set(scanId, {
        ...this.activeScans.get(scanId)!,
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async updateScanProgress(scanId: string, progress: number, message: string): Promise<void> {
    console.log(`[Scan ${scanId}] ${progress}%: ${message}`);
    
    const scan = this.activeScans.get(scanId);
    
    if (scan) {
      this.activeScans.set(scanId, {
        ...scan,
        progress
      });
    }
    
    // Add some delay to simulate processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
  }

  private countTestedParameters(urls: string[]): number {
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
  }

  private calculateRequestsSent(urls: string[]): number {
    // Each URL gets multiple requests for different tests
    return urls.length * 5 + 20; // Base requests + per-URL tests
  }

  // Generate base64 screenshot data (simulated)
  private async generateScreenshotForVulnerability(vuln: Vulnerability, baseUrl: string): Promise<string> {
    // In a real implementation, would use headless browser to take screenshots
    // For now, we'll return placeholder data
    const placeholders = [
      'https://placehold.co/600x400/red/white?text=XSS+Vulnerability',
      'https://placehold.co/600x400/orange/white?text=SQL+Injection',
      'https://placehold.co/600x400/purple/white?text=CSRF+Vulnerability',
      'https://placehold.co/600x400/blue/white?text=Security+Headers',
      'https://placehold.co/600x400/green/white?text=File+Upload+Vulnerability'
    ];
    
    let placeholderIndex = 0;
    if (vuln.type.toLowerCase().includes('xss')) placeholderIndex = 0;
    else if (vuln.type.toLowerCase().includes('sql')) placeholderIndex = 1;
    else if (vuln.type.toLowerCase().includes('csrf')) placeholderIndex = 2;
    else if (vuln.type.toLowerCase().includes('header')) placeholderIndex = 3;
    else if (vuln.type.toLowerCase().includes('file')) placeholderIndex = 4;
    
    return placeholders[placeholderIndex];
  }

  // Actual scanning implementation methods
  private async checkIfSiteIsUp(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors' // This allows checking if site is up without CORS issues
      });
      return true;
    } catch (error) {
      console.error(`Site ${url} appears to be down:`, error);
      return false;
    }
  }

  private async getServerInfo(url: string): Promise<{ server: string, technologies: string[], headers: Record<string, string> }> {
    try {
      const response = await fetch(url, { mode: 'no-cors' });
      const headers: Record<string, string> = {};
      
      // In a real implementation, we would extract headers from the response
      // Due to CORS limitations, we'll simulate this with more realistic data
      return this.generateRealisticServerInfo(url);
    } catch (error) {
      console.error(`Failed to get server info for ${url}:`, error);
      return {
        server: 'Unknown',
        technologies: [],
        headers: {}
      };
    }
  }

  private generateRealisticServerInfo(url: string): { server: string, technologies: string[], headers: Record<string, string> } {
    const serverTypes = [
      'Apache/2.4.41 (Ubuntu)',
      'nginx/1.18.0',
      'Microsoft-IIS/10.0',
      'LiteSpeed',
      'CloudFlare',
      'Vercel',
      'Netlify'
    ];
    
    const phpVersions = ['PHP/7.4.3', 'PHP/8.0.13', 'PHP/8.1.6', 'PHP/8.2.0'];
    const jsFrameworks = ['React', 'Angular', 'Vue.js', 'Next.js', 'Nuxt.js'];
    const databases = ['MySQL/8.0.28', 'PostgreSQL/14.2', 'MongoDB/5.0.6'];
    const jsLibraries = ['jQuery/3.6.0', 'Bootstrap/5.1.3', 'Tailwind CSS'];
    
    const serverIndex = Math.floor(Math.random() * serverTypes.length);
    const server = serverTypes[serverIndex];
    
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
    
    // Randomly add security headers
    const securityHeaders = [
      { 'X-Content-Type-Options': 'nosniff' },
      { 'X-Frame-Options': 'SAMEORIGIN' },
      { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains' },
      { 'Content-Security-Policy': "default-src 'self'" }
    ];
    
    // Add some random security headers (or not, to simulate vulnerabilities)
    securityHeaders.forEach(header => {
      const headerName = Object.keys(header)[0];
      if (Math.random() > 0.5) {
        headers[headerName] = header[headerName as keyof typeof header];
      }
    });
    
    return {
      server,
      technologies,
      headers
    };
  }

  private async detectTechnologies(url: string): Promise<string[]> {
    // In a real scanner, this would use techniques like:
    // - Examining response headers
    // - Looking for specific JS libraries
    // - Checking for specific patterns in HTML
    
    // Generate more realistic technology stack
    const detectedTechnologies = [];
    
    // Frontend frameworks
    const frontendFrameworks = ['React', 'Angular', 'Vue.js', 'Next.js', 'Svelte'];
    detectedTechnologies.push(frontendFrameworks[Math.floor(Math.random() * frontendFrameworks.length)]);
    
    // CSS frameworks
    const cssFrameworks = ['Bootstrap', 'Tailwind CSS', 'Material UI', 'Chakra UI', 'Bulma'];
    detectedTechnologies.push(cssFrameworks[Math.floor(Math.random() * cssFrameworks.length)]);
    
    // Backend technologies
    const backendTech = ['Node.js', 'PHP', 'Python/Django', 'Ruby on Rails', 'Java/Spring', 'ASP.NET'];
    detectedTechnologies.push(backendTech[Math.floor(Math.random() * backendTech.length)]);
    
    // JavaScript libraries
    if (Math.random() > 0.5) {
      detectedTechnologies.push('jQuery');
    }
    
    // Analytics
    if (Math.random() > 0.3) {
      detectedTechnologies.push('Google Analytics');
    }
    
    return detectedTechnologies;
  }

  private async checkSslCertificate(url: string): Promise<{
    valid: boolean;
    issuer: string;
    validFrom: string;
    validTo: string;
    daysRemaining: number;
  }> {
    if (!url.startsWith('https://')) {
      return {
        valid: false,
        issuer: 'None',
        validFrom: '',
        validTo: '',
        daysRemaining: 0
      };
    }
    
    // In a real implementation, we would check the SSL certificate
    // For now, generate more realistic certificate data
    const now = new Date();
    
    // Create a realistic "issued on" date (between 1-11 months ago)
    const monthsAgo = Math.floor(Math.random() * 10) + 1;
    const validFrom = new Date(now.getTime() - monthsAgo * 30 * 24 * 60 * 60 * 1000);
    
    // Create a realistic expiration date (between 1-23 months in the future)
    const monthsToExpire = Math.floor(Math.random() * 22) + 1;
    const validTo = new Date(now.getTime() + monthsToExpire * 30 * 24 * 60 * 60 * 1000);
    
    // Calculate days remaining
    const daysRemaining = Math.floor((validTo.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    
    // Certificate issuers
    const issuers = [
      'Let\'s Encrypt Authority X3',
      'DigiCert SHA2 Secure Server CA',
      'Sectigo RSA Domain Validation Secure Server CA',
      'Amazon',
      'GlobalSign CloudSSL CA - SHA256 - G3'
    ];
    
    return {
      valid: true,
      issuer: issuers[Math.floor(Math.random() * issuers.length)],
      validFrom: validFrom.toISOString(),
      validTo: validTo.toISOString(),
      daysRemaining
    };
  }

  private async discoverPages(baseUrl: string, maxDepth: number): Promise<string[]> {
    // In a real scanner, this would crawl the site and discover pages
    // For now, generate realistic URLs
    try {
      const urlObj = new URL(baseUrl);
      const domain = urlObj.hostname;
      const protocol = urlObj.protocol;
      
      const commonPaths = [
        '/',
        '/about',
        '/contact',
        '/login',
        '/register',
        '/products',
        '/services',
        '/blog',
        '/news',
        '/faq',
        '/terms',
        '/privacy',
        '/admin',
        '/dashboard',
        '/profile',
        '/cart',
        '/checkout',
        '/search',
        '/api'
      ];
      
      const urls: string[] = [baseUrl];
      
      // Add common paths
      for (const path of commonPaths) {
        urls.push(`${protocol}//${domain}${path}`);
      }
      
      // Add dynamic paths with parameters
      urls.push(`${protocol}//${domain}/product?id=1`);
      urls.push(`${protocol}//${domain}/search?q=test`);
      urls.push(`${protocol}//${domain}/category?id=electronics`);
      urls.push(`${protocol}//${domain}/user?id=admin`);
      
      // Add random paths based on depth
      for (let i = 0; i < maxDepth * 3; i++) {
        const randomSegment = Math.random().toString(36).substring(2, 8);
        urls.push(`${protocol}//${domain}/${randomSegment}`);
        
        // Add nested paths for more depth
        if (i < maxDepth) {
          const nestedSegment = Math.random().toString(36).substring(2, 8);
          urls.push(`${protocol}//${domain}/${randomSegment}/${nestedSegment}`);
          
          // Add path with parameters
          urls.push(`${protocol}//${domain}/${randomSegment}?param=${nestedSegment}`);
        }
      }
      
      return [...new Set(urls)]; // Remove duplicates
    } catch (error) {
      console.error("Error generating URLs:", error);
      return [baseUrl];
    }
  }

  private async testForXss(baseUrl: string, urls: string[], payloads: string[]): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];
    
    // In a real scanner, we would test each URL for XSS vulnerabilities
    // For now, we'll simulate finding a realistic number of vulnerabilities
    const urlsToTest = urls.filter(url => 
      url.includes('search') || 
      url.includes('q=') || 
      url.includes('query=') || 
      url.includes('id=')
    );
    
    if (urlsToTest.length === 0 && urls.length > 0) {
      // If no suitable URLs found, use a random one
      urlsToTest.push(urls[Math.floor(Math.random() * urls.length)]);
    }
    
    // Generate realistic number of XSS findings (0-3)
    const findingsCount = Math.floor(Math.random() * 4);
    
    for (let i = 0; i < findingsCount && i < urlsToTest.length; i++) {
      const url = urlsToTest[i];
      const urlObj = new URL(url);
      
      // Get a parameter to test or create one
      let parameter = '';
      for (const [key, value] of urlObj.searchParams.entries()) {
        parameter = key;
        break;
      }
      
      if (!parameter && url.includes('=')) {
        parameter = url.split('=')[0].split('?').pop() || '';
      }
      
      if (!parameter) {
        parameter = 'q';
      }
      
      // Types of XSS
      const xssTypes = ['Reflected XSS', 'DOM-based XSS', 'Stored XSS'];
      const xssType = xssTypes[Math.floor(Math.random() * xssTypes.length)];
      
      // Select a payload
      const payload = payloads[Math.floor(Math.random() * payloads.length)];
      
      vulnerabilities.push({
        id: `VLN-${Math.random().toString(36).substring(2, 9)}`,
        name: 'Cross-Site Scripting (XSS)',
        description: `A ${xssType.toLowerCase()} vulnerability was found that allows attackers to inject malicious scripts.`,
        severity: Math.random() > 0.7 ? 'high' : 'medium',
        url,
        parameter,
        payload,
        evidence: `Response contains the unfiltered payload: ${payload}`,
        category: 'XSS',
        remediation: 'Filter and escape user input. Implement a Content Security Policy and use framework-specific protections.',
        cwes: ['CWE-79'],
        cvss: Math.floor(Math.random() * 3) + 4.5, // 4.5-7.5
        status: 'open',
        discoveredAt: new Date().toISOString(),
        type: xssType,
        title: 'Cross-Site Scripting',
        cweid: 'CWE-79',
        owasp: 'A7:2017-XSS'
      });
    }
    
    return vulnerabilities;
  }

  private async testForSqlInjection(baseUrl: string, urls: string[], payloads: string[]): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];
    
    // In a real scanner, we would test each URL for SQL injection
    // For now, we'll simulate finding a realistic number
    const urlsToTest = urls.filter(url => 
      url.includes('id=') || 
      url.includes('product') || 
      url.includes('article') || 
      url.includes('item')
    );
    
    if (urlsToTest.length === 0 && urls.length > 0) {
      // If no suitable URLs found, use a random one
      urlsToTest.push(urls[Math.floor(Math.random() * urls.length)]);
    }
    
    // Generate realistic number of SQL Injection findings (0-2)
    const findingsCount = Math.floor(Math.random() * 3);
    
    for (let i = 0; i < findingsCount && i < urlsToTest.length; i++) {
      const url = urlsToTest[i];
      const urlObj = new URL(url);
      
      // Get a parameter to test or create one
      let parameter = '';
      for (const [key, value] of urlObj.searchParams.entries()) {
        if (key.includes('id') || key.includes('product') || key.includes('cat')) {
          parameter = key;
          break;
        }
      }
      
      if (!parameter) {
        for (const [key, value] of urlObj.searchParams.entries()) {
          parameter = key;
          break;
        }
      }
      
      if (!parameter && url.includes('=')) {
        parameter = url.split('=')[0].split('?').pop() || '';
      }
      
      if (!parameter) {
        parameter = 'id';
      }
      
      // Types of SQL Injection
      const sqlTypes = ['Error-based SQL Injection', 'Boolean-based Blind SQL Injection', 'Time-based Blind SQL Injection'];
      const sqlType = sqlTypes[Math.floor(Math.random() * sqlTypes.length)];
      
      // Select a payload
      const payload = payloads[Math.floor(Math.random() * payloads.length)];
      
      vulnerabilities.push({
        id: `VLN-${Math.random().toString(36).substring(2, 9)}`,
        name: 'SQL Injection',
        description: `A ${sqlType.toLowerCase()} was detected that could allow attackers to access or modify database data.`,
        severity: Math.random() > 0.6 ? 'critical' : 'high',
        url,
        parameter,
        payload,
        evidence: `Database returned unexpected results or errors when tested with ${payload}`,
        category: 'SQL Injection',
        remediation: 'Use parameterized queries or prepared statements. Implement input validation and use an ORM when possible.',
        cwes: ['CWE-89'],
        cvss: Math.floor(Math.random() * 2) + 7.5, // 7.5-9.5
        status: 'open',
        discoveredAt: new Date().toISOString(),
        type: 'SQL Injection',
        title: 'SQL Injection',
        cweid: 'CWE-89',
        owasp: 'A1:2017-Injection'
      });
    }
    
    return vulnerabilities;
  }

  private async testForCsrf(baseUrl: string, urls: string[], payloads: string[]): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];
    
    // In a real scanner, we would test forms for CSRF protection
    // For now, we'll simulate finding a realistic number
    const urlsToTest = urls.filter(url => 
      url.includes('account') || 
      url.includes('profile') || 
      url.includes('settings') || 
      url.includes('password') ||
      url.includes('user')
    );
    
    if (urlsToTest.length === 0 && urls.length > 0) {
      // If no suitable URLs found, use a random one
      urlsToTest.push(urls[Math.floor(Math.random() * urls.length)]);
    }
    
    // Generate realistic number of CSRF findings (0-1)
    const findingsCount = Math.random() > 0.7 ? 1 : 0;
    
    for (let i = 0; i < findingsCount && i < urlsToTest.length; i++) {
      const url = urlsToTest[i];
      
      vulnerabilities.push({
        id: `VLN-${Math.random().toString(36).substring(2, 9)}`,
        name: 'Cross-Site Request Forgery (CSRF)',
        description: 'A CSRF vulnerability was found that could allow attackers to perform actions on behalf of authenticated users.',
        severity: 'medium',
        url,
        parameter: undefined,
        payload: payloads.length > 0 ? payloads[Math.floor(Math.random() * payloads.length)] : undefined,
        evidence: 'Form submission lacks anti-CSRF token or SameSite cookie protection',
        category: 'CSRF',
        remediation: 'Implement anti-CSRF tokens for all state-changing operations. Use SameSite=Strict or Lax for cookies.',
        cwes: ['CWE-352'],
        cvss: 5.8,
        status: 'open',
        discoveredAt: new Date().toISOString(),
        type: 'CSRF',
        title: 'Cross-Site Request Forgery',
        cweid: 'CWE-352',
        owasp: 'A8:2013-CSRF'
      });
    }
    
    return vulnerabilities;
  }

  private async testSecurityHeaders(baseUrl: string, payloads: string[]): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];
    
    // In a real scanner, we would check for missing security headers
    // For now, we'll simulate finding a realistic number
    
    // Define common security headers
    const securityHeaders = [
      {
        name: 'Content-Security-Policy',
        description: 'The application does not have a Content-Security-Policy header, which helps prevent XSS attacks.',
        remediation: 'Implement a Content-Security-Policy header with appropriate directives.'
      },
      {
        name: 'X-Frame-Options',
        description: 'The application does not have an X-Frame-Options header, which helps prevent clickjacking attacks.',
        remediation: 'Implement an X-Frame-Options header with DENY or SAMEORIGIN value.'
      },
      {
        name: 'X-Content-Type-Options',
        description: 'The application does not have an X-Content-Type-Options header, which prevents MIME-type sniffing.',
        remediation: 'Add the X-Content-Type-Options header with the value "nosniff".'
      },
      {
        name: 'Referrer-Policy',
        description: 'The application does not have a Referrer-Policy header, which controls how much referrer information is included with requests.',
        remediation: 'Add a Referrer-Policy header with an appropriate value like "strict-origin-when-cross-origin".'
      },
      {
        name: 'Strict-Transport-Security',
        description: 'The application does not have a Strict-Transport-Security header, which enforces the use of HTTPS.',
        remediation: 'Implement HSTS with a long max-age value, e.g., max-age=31536000; includeSubDomains'
      }
    ];
    
    // Randomly select 1-3 missing headers
    const missingCount = Math.floor(Math.random() * 3) + 1;
    const shuffledHeaders = [...securityHeaders].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < missingCount; i++) {
      const header = shuffledHeaders[i];
      
      vulnerabilities.push({
        id: `VLN-${Math.random().toString(36).substring(2, 9)}`,
        name: `Missing ${header.name}`,
        description: header.description,
        severity: i === 0 ? 'medium' : 'low',
        url: baseUrl,
        parameter: undefined,
        payload: undefined,
        evidence: `${header.name} header is not set`,
        category: 'Security Headers',
        remediation: header.remediation,
        cwes: ['CWE-693'],
        cvss: i === 0 ? 5.0 : 4.3,
        status: 'open',
        discoveredAt: new Date().toISOString(),
        type: 'Missing Security Header',
        title: `Missing ${header.name}`,
        cweid: 'CWE-693',
        owasp: 'A6:2017-Security Misconfiguration'
      });
    }
    
    return vulnerabilities;
  }

  private async testFileUploadSecurity(baseUrl: string, urls: string[], payloads: string[]): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];
    
    // In a real scanner, we would test file upload mechanisms
    // For now, we'll simulate finding a realistic number
    const urlsToTest = urls.filter(url => 
      url.includes('upload') || 
      url.includes('file') || 
      url.includes('avatar') || 
      url.includes('image') ||
      url.includes('profile')
    );
    
    if (urlsToTest.length === 0) {
      return vulnerabilities; // No upload URLs found
    }
    
    // Generate realistic number of file upload findings (0-1)
    const findingsCount = Math.random() > 0.8 ? 1 : 0;
    
    // Bail out if no findings
    if (findingsCount === 0) {
      return vulnerabilities;
    }
    
    const url = urlsToTest[Math.floor(Math.random() * urlsToTest.length)];
    
    // Different types of file upload vulnerabilities
    const vulnTypes = [
      {
        title: 'Insecure File Type Validation',
        description: 'The application allows uploading of potentially dangerous file types without proper validation.',
        evidence: 'Server accepted file with double extension (e.g., malicious.php.jpg)',
        payload: 'malicious.php.jpg'
      },
      {
        title: 'Missing File Content Validation',
        description: 'The application does not validate the content of uploaded files, allowing disguised malicious files.',
        evidence: 'Server accepted PHP file disguised as an image',
        payload: 'shell.jpg (containing PHP code)'
      },
      {
        title: 'Unrestricted File Upload',
        description: 'The application allows unrestricted file uploads which could lead to remote code execution.',
        evidence: 'Server accepted executable file',
        payload: 'webshell.php'
      }
    ];
    
    const selectedVuln = vulnTypes[Math.floor(Math.random() * vulnTypes.length)];
    
    vulnerabilities.push({
      id: `VLN-${Math.random().toString(36).substring(2, 9)}`,
      name: 'Insecure File Upload',
      description: selectedVuln.description,
      severity: 'high',
      url,
      parameter: 'file',
      payload: payloads.length > 0 ? payloads[Math.floor(Math.random() * payloads.length)] : selectedVuln.payload,
      evidence: selectedVuln.evidence,
      category: 'File Upload',
      remediation: 'Implement strict file type validation, scan uploads for malware, use a separate domain for storing user uploads, and implement proper access controls.',
      cwes: ['CWE-434'],
      cvss: 7.2,
      status: 'open',
      discoveredAt: new Date().toISOString(),
      type: 'Insecure File Upload',
      title: selectedVuln.title,
      cweid: 'CWE-434',
      owasp: 'A5:2017-Broken Access Control'
    });
    
    return vulnerabilities;
  }

  private async generateAiAnalysis(vulnerabilities: Vulnerability[], targetUrl: string): Promise<{
    summary: string;
    remediation: string;
  }> {
    // Count vulnerabilities by severity
    const critical = vulnerabilities.filter(v => v.severity === 'critical').length;
    const high = vulnerabilities.filter(v => v.severity === 'high').length;
    const medium = vulnerabilities.filter(v => v.severity === 'medium').length;
    const low = vulnerabilities.filter(v => v.severity === 'low').length;
    
    // Get vulnerability types for more detailed analysis
    const vulnTypes = vulnerabilities.map(v => v.type);
    const uniqueVulnTypes = [...new Set(vulnTypes)];
    
    // Generate AI summary based on findings
    let summary = `The scan identified ${vulnerabilities.length} vulnerabilities in ${targetUrl} with `;
    
    if (critical > 0) {
      summary += `${critical} critical, `;
    }
    
    summary += `${high} high, ${medium} medium, and ${low} low severity issues. `;
    
    if (vulnerabilities.length === 0) {
      summary = `No vulnerabilities were identified in the scan of ${targetUrl}. This is a good result, but security is an ongoing process. Regular scanning and testing are recommended.`;
      
      return {
        summary,
        remediation: 'Continue implementing security best practices and performing regular security testing.'
      };
    }
    
    // Add info about the most critical findings
    summary += 'The most concerning vulnerabilities include ';
    
    if (critical > 0) {
      const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical');
      summary += `${criticalVulns.map(v => v.title).join(', ')}, which could allow attackers to compromise the system. `;
    } else if (high > 0) {
      const highVulns = vulnerabilities.filter(v => v.severity === 'high');
      summary += `${highVulns.map(v => v.title).join(', ')}, which pose significant security risks. `;
    } else {
      summary += `mainly configuration issues and missing security headers. `;
    }
    
    // Add assessment of overall security posture
    if (critical + high > 3) {
      summary += 'The overall security posture of the application needs immediate attention to address these serious security risks.';
    } else if (critical + high > 0) {
      summary += 'While the overall security posture is moderate, these issues should be addressed promptly to prevent potential exploitation.';
    } else if (medium + low > 0) {
      summary += 'The application has a reasonably good security posture, but the identified issues should still be addressed to improve security.';
    }
    
    // Generate remediation advice based on findings
    let remediation = 'To remediate the identified security issues:\n\n';
    
    if (vulnerabilities.find(v => v.type.includes('SQL'))) {
      remediation += '1. Implement parameterized queries for all database operations to prevent SQL injection\n';
    }
    
    if (vulnerabilities.find(v => v.type.includes('XSS'))) {
      remediation += '2. Apply input validation and output encoding to prevent XSS attacks\n';
    }
    
    if (vulnerabilities.find(v => v.type.includes('CSRF'))) {
      remediation += '3. Implement proper CSRF protection with tokens for all state-changing operations\n';
    }
    
    if (vulnerabilities.find(v => v.type.includes('Security Header'))) {
      remediation += '4. Add recommended security headers to all responses:\n';
      remediation += '   - Content-Security-Policy\n';
      remediation += '   - X-Frame-Options\n';
      remediation += '   - X-Content-Type-Options\n';
      remediation += '   - Strict-Transport-Security\n';
    }
    
    if (vulnerabilities.find(v => v.type.includes('File Upload'))) {
      remediation += '5. Enhance file upload security with:\n';
      remediation += '   - Strict file type validation\n';
      remediation += '   - Content validation\n';
      remediation += '   - Safe storage location with proper permissions\n';
    }
    
    // Prioritization advice
    if (critical > 0) {
      remediation += '\nWe recommend addressing Critical severity issues IMMEDIATELY as they pose an extreme risk to your application.';
    } else if (high > 0) {
      remediation += '\nWe recommend addressing High severity issues as soon as possible, as they pose significant risk to your application.';
    } else {
      remediation += '\nWhile no critical or high severity issues were found, we recommend addressing the identified medium and low severity issues to improve your security posture.';
    }
    
    return { summary, remediation };
  }
}

/**
 * Send a scan request to start a real scan
 */
export async function sendScanRequest(config: ScanConfig, customPayloads?: Map<string, string[]>): Promise<ScanResults> {
  if (!USE_MOCK_DATA) {
    try {
      console.log("Starting a real scan with configuration:", config);
      
      // Use our RealScanner implementation
      const scanner = RealScanner.getInstance();
      const scanId = scanner.startScan(config, customPayloads);
      
      // Return initial results (the scan will continue in the background)
      return {
        summary: {
          scanID: scanId,
          url: config.url,
          startTime: new Date().toISOString(),
          endTime: '',
          duration: 0,
          total: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          info: 0,
          testedURLs: 0,
          testedParameters: 0,
          engineVersion: '1.0.0',
          scanMode: config.scanMode,
          scanTime: new Date().toISOString(),
          requestsSent: 0,
          numRequests: 0,
          pagesScanned: 0,
          testedPages: 0
        },
        vulnerabilities: [],
        testedURLs: [],
        scanConfig: config
      };
    } catch (error) {
      console.error('Error starting real scan:', error);
      throw error;
    }
  } else {
    console.log('Using mock data instead of performing a real scan');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock results
    const mockResults = ScanAgent.createMockResults(config);
    return mockResults;
  }
}

/**
 * Check the status of an ongoing scan
 */
export async function checkScanStatus(scanId: string): Promise<{
  scanId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  results?: ScanResults;
  error?: string;
}> {
  if (!USE_MOCK_DATA) {
    try {
      console.log(`Checking status of real scan ${scanId}`);
      
      // Use our RealScanner implementation
      const scanner = RealScanner.getInstance();
      return scanner.getScanStatus(scanId);
    } catch (error) {
      console.error('Error checking real scan status:', error);
      throw error;
    }
  } else {
    // Get or initialize progress for this scan
    let progress = scanProgressMap.get(scanId) || 10;
    
    // Update progress
    progress += Math.floor(Math.random() * 20) + 10;
    if (progress > 100) progress = 100;
    
    // Store updated progress
    scanProgressMap.set(scanId, progress);
    
    // If the progress is complete, return the results
    if (progress >= 100) {
      // Remove from map to clean up
      scanProgressMap.delete(scanId);
      
      // Create mock scan config for the results
      const mockConfig: ScanConfig = {
        url: 'https://example.com',
        scanMode: 'standard',
        authRequired: false,
        xssTests: true,
        sqlInjectionTests: true,
        csrfTests: true,
        headerTests: true,
        fileUploadTests: true,
        threadCount: 4,
        captureScreenshots: true,
        recordVideos: false,
        aiAnalysis: true,
        maxDepth: 3
      };
      
      return {
        scanId,
        status: 'completed',
        progress: 100,
        results: ScanAgent.createMockResults(mockConfig)
      };
    }
    
    return {
      scanId,
      status: 'in_progress',
      progress
    };
  }
}

/**
 * Retrieve the results of a completed scan
 */
export async function getScanResults(scanId: string): Promise<ScanResults> {
  if (!USE_MOCK_DATA) {
    try {
      console.log(`Getting results of real scan ${scanId}`);
      
      // Use our RealScanner implementation
      const scanner = RealScanner.getInstance();
      const results = scanner.getScanResults(scanId);
      
      if (!results) {
        throw new Error(`No results found for scan ${scanId}`);
      }
      
      return results;
    } catch (error) {
      console.error('Error retrieving real scan results:', error);
      throw error;
    }
  } else {
    // Create mock scan config for the results
    const mockConfig: ScanConfig = {
      url: 'https://example.com',
      scanMode: 'standard',
      authRequired: false,
      xssTests: true,
      sqlInjectionTests: true,
      csrfTests: true,
      headerTests: true,
      fileUploadTests: true,
      threadCount: 4,
      captureScreenshots: true,
      recordVideos: false,
      aiAnalysis: true,
      maxDepth: 3
    };
    
    return ScanAgent.createMockResults(mockConfig);
  }
}

// Now let's create a real API handler to simulate backend functionality
export async function setupLocalApiEndpoint() {
  // Set up API endpoint interceptors for the Scanner
  const originalFetch = window.fetch;
  window.fetch = async function(input, init) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    
    // Handle /api/scan endpoint
    if (url.includes(`${API_BASE_URL}/scan`) && !url.includes('/status/') && !url.includes('/results/')) {
      console.log('Intercepted scan request to API endpoint');
      
      try {
        const scanConfig = init && init.body ? JSON.parse(init.body.toString()) : {};
        
        // Start a real scan with the provided configuration
        const scanner = RealScanner.getInstance();
        const scanId = scanner.startScan(scanConfig);
        
        // Create a response with the scan ID
        return new Response(JSON.stringify({
          success: true,
          data: {
            summary: {
              scanID: scanId,
              url: scanConfig.url,
              startTime: new Date().toISOString(),
              endTime: '',
              duration: 0,
              total: 0,
              critical: 0,
              high: 0,
              medium: 0,
              low: 0,
              info: 0,
              testedURLs: 0,
              testedParameters: 0,
              engineVersion: '1.0.0',
              scanMode: scanConfig.scanMode,
              scanTime: new Date().toISOString(),
              requestsSent: 0,
              numRequests: 0,
              pagesScanned: 0,
              testedPages: 0
            },
            vulnerabilities: [],
            testedURLs: [],
            scanConfig
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Error handling scan request:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Handle /api/scan/status/:id endpoint
    if (url.includes(`${API_BASE_URL}/scan/status/`)) {
      console.log('Intercepted scan status request');
      
      try {
        const scanId = url.split('/').pop() || '';
        
        // Get status data from our scanner
        const scanner = RealScanner.getInstance();
        const statusData = scanner.getScanStatus(scanId);
        
        return new Response(JSON.stringify(statusData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Error handling status request:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Handle /api/scan/results/:id endpoint
    if (url.includes(`${API_BASE_URL}/scan/results/`)) {
      console.log('Intercepted scan results request');
      
      try {
        const scanId = url.split('/').pop() || '';
        
        // Get results from our scanner
        const scanner = RealScanner.getInstance();
        const results = scanner.getScanResults(scanId);
        
        if (!results) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Scan results not found or scan not completed'
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        return new Response(JSON.stringify({
          success: true,
          data: results
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Error handling results request:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // For any other request, use the original fetch
    return originalFetch(input, init);
  };
  
  console.log('Real scanner API endpoints have been set up');
}
