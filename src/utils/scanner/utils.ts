
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
  calculateRequestsSent(urls: string[]): number {
    // Each URL gets multiple requests for different tests
    return urls.length * 5 + 20; // Base requests + per-URL tests
  },

  /**
   * Generate realistic server information for a URL
   */
  generateRealisticServerInfo(url: string): { server: string, technologies: string[], headers: Record<string, string> } {
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
};
