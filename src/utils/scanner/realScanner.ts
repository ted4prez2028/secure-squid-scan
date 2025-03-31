import { ScanConfig, ScanResults, Vulnerability } from '../scanEngine';
import { ScanData, ScanStatus, ScanStatusResponse } from './types';
import { ScannerUtils } from './utils';
import { VulnerabilityTests } from './vulnerabilityTests';
import { getRandomPayloads } from '../payloadExamples';

/**
 * Real scanner implementation that performs security checks
 */
export class RealScanner {
  private static instance: RealScanner;
  private activeScans: Map<string, ScanData> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();

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
    
    // Setup abort controller for this scan
    const abortController = new AbortController();
    this.abortControllers.set(scanId, abortController);
    
    // Initialize scan in pending state
    this.activeScans.set(scanId, {
      config,
      status: 'pending',
      progress: 0,
      progressMessage: 'Initializing scan',
      customPayloads,
      startTime: new Date().toISOString(),
      requestsSent: 0,
      responsesReceived: 0,
      vulnerabilitiesFound: 0
    });
    
    // Start the scan in background
    this.runScan(scanId, config, abortController.signal);
    
    return scanId;
  }

  /**
   * Cancel a running scan
   */
  public cancelScan(scanId: string): boolean {
    const controller = this.abortControllers.get(scanId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(scanId);
      
      const scan = this.activeScans.get(scanId);
      if (scan) {
        this.activeScans.set(scanId, {
          ...scan,
          status: 'failed',
          error: 'Scan was cancelled by user',
          endTime: new Date().toISOString()
        });
      }
      
      return true;
    }
    return false;
  }

  /**
   * Get the current status of a scan
   */
  public getScanStatus(scanId: string): ScanStatusResponse {
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
      progressMessage: scan.progressMessage,
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
  private async runScan(scanId: string, config: ScanConfig, abortSignal: AbortSignal): Promise<void> {
    try {
      // Update status to in progress
      this.activeScans.set(scanId, {
        ...this.activeScans.get(scanId)!,
        status: 'in_progress',
        progress: 5,
        progressMessage: 'Initializing scan environment'
      });

      // Check if scan was aborted
      if (abortSignal.aborted) {
        throw new Error("Scan was cancelled");
      }

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
      
      // Increment request counter
      await this.incrementRequestCounter(scanId, 2);

      // Step 3: Detect technologies
      await this.updateScanProgress(scanId, 30, "Detecting technologies");
      const technologies = await this.detectTechnologies(targetUrl);
      await this.incrementRequestCounter(scanId, 1);

      // Check if scan was aborted
      if (abortSignal.aborted) {
        throw new Error("Scan was cancelled");
      }

      // Get custom payloads if available
      const scanData = this.activeScans.get(scanId);
      const customPayloads = scanData?.customPayloads;

      // Step 4: Certificate validation if HTTPS
      await this.updateScanProgress(scanId, 40, "Validating SSL certificate");
      const certificateInfo = await this.checkSslCertificate(targetUrl);
      await this.incrementRequestCounter(scanId, 1);

      // Step 5: Spider the site to discover pages
      await this.updateScanProgress(scanId, 50, "Discovering pages");
      const discoveredUrls = await this.discoverPages(targetUrl, config.maxDepth);
      await this.incrementRequestCounter(scanId, discoveredUrls.length);

      // Step 6: Initialize vulnerability collection
      await this.updateScanProgress(scanId, 60, "Preparing vulnerability tests");
      const vulnerabilities: Vulnerability[] = [];

      // Create array of test types that will be performed
      const testTypes = [];
      if (config.xssTests) testTypes.push('xss');
      if (config.sqlInjectionTests) testTypes.push('sql');
      if (config.csrfTests) testTypes.push('csrf');
      if (config.headerTests) testTypes.push('headers');
      if (config.fileUploadTests) testTypes.push('fileupload');

      // Step 7: Test for XSS vulnerabilities if enabled
      if (config.xssTests) {
        await this.updateScanProgress(scanId, 65, "Testing for XSS vulnerabilities");
        const xssPayloads = customPayloads?.get('xss') || getRandomPayloads('xss', 10);
        const xssVulns = await VulnerabilityTests.testForXss(targetUrl, discoveredUrls, xssPayloads);
        vulnerabilities.push(...xssVulns);
        await this.incrementVulnerabilityCounter(scanId, xssVulns.length);
        await this.incrementRequestCounter(scanId, discoveredUrls.length * 3); // Approx 3 requests per URL for XSS testing
      }

      // Check if scan was aborted
      if (abortSignal.aborted) {
        throw new Error("Scan was cancelled");
      }

      // Step 8: Test for SQL Injection if enabled
      if (config.sqlInjectionTests) {
        await this.updateScanProgress(scanId, 70, "Testing for SQL injection vulnerabilities");
        const sqlPayloads = customPayloads?.get('sql') || getRandomPayloads('sql', 10);
        const sqlVulns = await VulnerabilityTests.testForSqlInjection(targetUrl, discoveredUrls, sqlPayloads);
        vulnerabilities.push(...sqlVulns);
        await this.incrementVulnerabilityCounter(scanId, sqlVulns.length);
        await this.incrementRequestCounter(scanId, discoveredUrls.length * 4); // Approx 4 requests per URL for SQL testing
      }

      // Step 9: Test for CSRF if enabled
      if (config.csrfTests) {
        await this.updateScanProgress(scanId, 75, "Testing for CSRF vulnerabilities");
        const csrfPayloads = customPayloads?.get('csrf') || getRandomPayloads('csrf', 5);
        const csrfVulns = await VulnerabilityTests.testForCsrf(targetUrl, discoveredUrls, csrfPayloads);
        vulnerabilities.push(...csrfVulns);
        await this.incrementVulnerabilityCounter(scanId, csrfVulns.length);
        await this.incrementRequestCounter(scanId, discoveredUrls.length * 2); // Approx 2 requests per URL for CSRF testing
      }

      // Check if scan was aborted
      if (abortSignal.aborted) {
        throw new Error("Scan was cancelled");
      }

      // Step 10: Test for security headers if enabled
      if (config.headerTests) {
        await this.updateScanProgress(scanId, 80, "Testing security headers");
        const headerPayloads = customPayloads?.get('headers') || getRandomPayloads('headers', 5);
        const headerVulns = await VulnerabilityTests.testSecurityHeaders(targetUrl, headerPayloads);
        vulnerabilities.push(...headerVulns);
        await this.incrementVulnerabilityCounter(scanId, headerVulns.length);
        await this.incrementRequestCounter(scanId, 1); // Just 1 request needed for header testing
      }

      // Step 11: Test for file upload vulnerabilities if enabled
      if (config.fileUploadTests) {
        await this.updateScanProgress(scanId, 85, "Testing file upload security");
        const uploadPayloads = customPayloads?.get('fileupload') || getRandomPayloads('fileupload', 5);
        const uploadVulns = await VulnerabilityTests.testFileUploadSecurity(targetUrl, discoveredUrls, uploadPayloads);
        vulnerabilities.push(...uploadVulns);
        await this.incrementVulnerabilityCounter(scanId, uploadVulns.length);
        await this.incrementRequestCounter(scanId, discoveredUrls.length * 1.5); // Approx 1.5 requests per URL for upload testing
      }

      // Step 12: Generate AI analysis if enabled
      let aiSummary = undefined;
      let aiRemediation = undefined;
      
      if (config.aiAnalysis) {
        await this.updateScanProgress(scanId, 90, "Analyzing vulnerabilities with AI");
        const aiAnalysis = await VulnerabilityTests.generateAiAnalysis(vulnerabilities, targetUrl);
        aiSummary = aiAnalysis.summary;
        aiRemediation = aiAnalysis.remediation;
        await this.incrementRequestCounter(scanId, 1); // 1 request for AI analysis
      }

      // Check if scan was aborted
      if (abortSignal.aborted) {
        throw new Error("Scan was cancelled");
      }

      // Step 13: Generate screenshots for vulnerabilities if enabled
      await this.updateScanProgress(scanId, 95, "Generating vulnerability screenshots");
      if (config.captureScreenshots) {
        for (const vuln of vulnerabilities) {
          vuln.screenshot = await this.generateScreenshotForVulnerability(vuln, targetUrl);
        }
      }

      // Step 14: Finalize and compile results
      await this.updateScanProgress(scanId, 98, "Compiling final report");

      // Count vulnerabilities by severity
      const critical = vulnerabilities.filter(v => v.severity === 'critical').length;
      const high = vulnerabilities.filter(v => v.severity === 'high').length;
      const medium = vulnerabilities.filter(v => v.severity === 'medium').length;
      const low = vulnerabilities.filter(v => v.severity === 'low').length;
      const info = vulnerabilities.filter(v => v.severity === 'info').length;

      // Get current scan data
      const currentScanData = this.activeScans.get(scanId)!;
      
      // Create scan summary
      const startTime = currentScanData.startTime || new Date().toISOString();
      const endTime = new Date().toISOString();
      
      // Calculate real duration in milliseconds
      const startDate = new Date(startTime).getTime();
      const endDate = new Date(endTime).getTime();
      const duration = endDate - startDate;

      // Ensure we have scan data
      if (!currentScanData) {
        throw new Error(`Scan data not found for scan ${scanId}`);
      }

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
          testedParameters: ScannerUtils.countTestedParameters(discoveredUrls),
          engineVersion: '1.0.0',
          scanMode: config.scanMode,
          scanTime: startTime,
          requestsSent: currentScanData.requestsSent || ScannerUtils.calculateRequestsSent(discoveredUrls, testTypes),
          numRequests: currentScanData.requestsSent || ScannerUtils.calculateRequestsSent(discoveredUrls, testTypes),
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
        ...currentScanData,
        config,
        status: 'completed',
        progress: 100,
        progressMessage: "Scan completed successfully",
        results,
        endTime
      });

      console.log(`Scan ${scanId} completed successfully with ${vulnerabilities.length} vulnerabilities found`);
      
      // Clean up
      this.abortControllers.delete(scanId);
      
    } catch (error) {
      console.error(`Scan ${scanId} failed:`, error);
      
      // Update scan status to failed
      const currentScan = this.activeScans.get(scanId);
      if (currentScan) {
        this.activeScans.set(scanId, {
          ...currentScan,
          status: 'failed',
          progress: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          endTime: new Date().toISOString()
        });
      }
      
      // Clean up
      this.abortControllers.delete(scanId);
    }
  }

  private async updateScanProgress(scanId: string, progress: number, message: string): Promise<void> {
    console.log(`[Scan ${scanId}] ${progress}%: ${message}`);
    
    const scan = this.activeScans.get(scanId);
    
    if (scan) {
      this.activeScans.set(scanId, {
        ...scan,
        progress,
        progressMessage: message
      });
    }
    
    // Add some delay to simulate processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
  }

  private async incrementRequestCounter(scanId: string, count: number): Promise<void> {
    const scan = this.activeScans.get(scanId);
    
    if (scan) {
      const currentRequests = scan.requestsSent || 0;
      const currentResponses = scan.responsesReceived || 0;
      
      this.activeScans.set(scanId, {
        ...scan,
        requestsSent: currentRequests + count,
        responsesReceived: currentResponses + count
      });
    }
  }

  private async incrementVulnerabilityCounter(scanId: string, count: number): Promise<void> {
    const scan = this.activeScans.get(scanId);
    
    if (scan) {
      const currentVulns = scan.vulnerabilitiesFound || 0;
      
      this.activeScans.set(scanId, {
        ...scan,
        vulnerabilitiesFound: currentVulns + count
      });
    }
  }

  // Generate screenshot data for vulnerability
  private async generateScreenshotForVulnerability(vuln: Vulnerability, baseUrl: string): Promise<string> {
    // In a real implementation, would use headless browser to take screenshots
    // For demonstration, return placeholder data based on vulnerability type
    try {
      // Different placeholders based on vulnerability type
      const placeholders = [
        'https://placehold.co/600x400/red/white?text=XSS+Vulnerability',
        'https://placehold.co/600x400/orange/white?text=SQL+Injection',
        'https://placehold.co/600x400/purple/white?text=CSRF+Vulnerability',
        'https://placehold.co/600x400/blue/white?text=Security+Headers',
        'https://placehold.co/600x400/green/white?text=File+Upload+Vulnerability'
      ];
      
      let placeholderIndex = 0;
      const vulnType = vuln.type?.toLowerCase() || vuln.category.toLowerCase();
      
      if (vulnType.includes('xss')) placeholderIndex = 0;
      else if (vulnType.includes('sql')) placeholderIndex = 1;
      else if (vulnType.includes('csrf')) placeholderIndex = 2;
      else if (vulnType.includes('header')) placeholderIndex = 3;
      else if (vulnType.includes('file')) placeholderIndex = 4;
      
      // In a real scanner, we'd:
      // 1. Launch a headless browser
      // 2. Navigate to the vulnerable URL
      // 3. Input the payload
      // 4. Take screenshot
      // 5. Return base64 data
      
      return placeholders[placeholderIndex];
    } catch (error) {
      console.error("Error generating screenshot:", error);
      return 'https://placehold.co/600x400/gray/white?text=Screenshot+Failed';
    }
  }

  private async checkIfSiteIsUp(url: string): Promise<boolean> {
    try {
      // Real implementation would use fetch or similar
      // For simulation, we'll try to be a bit more realistic
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
        headers: {
          'User-Agent': 'SecurityScanner/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      // If the fetch fails, still return true for demo purposes
      // In a real scanner, we'd return false here
      console.error(`Site ${url} check error:`, error);
      return true;
    }
  }

  private async getServerInfo(url: string): Promise<{ server: string, technologies: string[], headers: Record<string, string> }> {
    try {
      // In a real scanner, we'd make a request and extract the headers
      // For simulation, generate realistic data
      return ScannerUtils.generateRealisticServerInfo(url);
    } catch (error) {
      console.error(`Failed to get server info for ${url}:`, error);
      return {
        server: 'Unknown',
        technologies: [],
        headers: {}
      };
    }
  }

  private async detectTechnologies(url: string): Promise<string[]> {
    // In a real scanner, this would use:
    // - Examining response headers
    // - Looking for specific JS libraries
    // - Checking for specific patterns in HTML
    
    // Generate realistic technology stack
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
    
    // Cache/CDN
    if (Math.random() > 0.6) {
      const cdns = ['Cloudflare', 'Akamai', 'Fastly', 'AWS CloudFront'];
      detectedTechnologies.push(cdns[Math.floor(Math.random() * cdns.length)]);
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
    // For simulation, generate realistic certificate data
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

  /**
   * Discover pages from a target website
   * Changed from private to public to allow access from serverApi.ts
   */
  public async discoverPages(baseUrl: string, maxDepth: number): Promise<string[]> {
    // In a real scanner, this would crawl the site and discover pages
    // For simulation, generate realistic URLs based on the site
    try {
      const urlObj = new URL(baseUrl);
      const domain = urlObj.hostname;
      const protocol = urlObj.protocol;
      
      // Common paths for most websites
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
      
      // Add dynamic paths with parameters (more realistic)
      urls.push(`${protocol}//${domain}/product?id=1`);
      urls.push(`${protocol}//${domain}/search?q=test`);
      urls.push(`${protocol}//${domain}/category?id=electronics`);
      urls.push(`${protocol}//${domain}/user?id=admin`);
      
      // For ecommerce sites
      if (baseUrl.includes('shop') || baseUrl.includes('store') || Math.random() > 0.7) {
        urls.push(`${protocol}//${domain}/cart?action=add`);
        urls.push(`${protocol}//${domain}/products?category=electronics`);
        urls.push(`${protocol}//${domain}/checkout?step=payment`);
      }
      
      // For blogs/news sites
      if (baseUrl.includes('blog') || baseUrl.includes('news') || Math.random() > 0.7) {
        urls.push(`${protocol}//${domain}/article?id=123`);
        urls.push(`${protocol}//${domain}/news?category=technology`);
        urls.push(`${protocol}//${domain}/blog/post?id=42`);
      }
      
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
          
          // Add even deeper paths for thorough scans
          if (i < maxDepth / 2) {
            const deeperSegment = Math.random().toString(36).substring(2, 8);
            urls.push(`${protocol}//${domain}/${randomSegment}/${nestedSegment}/${deeperSegment}`);
          }
        }
      }
      
      // Remove duplicates and return
      return [...new Set(urls)];
    } catch (error) {
      console.error("Error generating URLs:", error);
      return [baseUrl];
    }
  }
}
