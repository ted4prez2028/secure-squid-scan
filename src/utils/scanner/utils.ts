
export class ScannerUtils {
  /**
   * Count parameters that were tested in the scan
   */
  static countTestedParameters(urls: string[]): number {
    // Roughly estimate 3 parameters per URL
    return urls.length * 3;
  }

  /**
   * Calculate total requests sent based on scan configuration
   */
  static calculateRequestsSent(urls: string[], testTypes: string[]): number {
    // Base request count - 1 request per URL for discovery
    let requestCount = urls.length;
    
    // Add additional requests based on test types
    for (const type of testTypes) {
      switch (type) {
        case 'xss':
          requestCount += urls.length * 3; // Approx 3 requests per URL for XSS
          break;
        case 'sql':
          requestCount += urls.length * 4; // Approx 4 requests per URL for SQL
          break;
        case 'csrf':
          requestCount += urls.length * 2; // Approx 2 requests per URL for CSRF
          break;
        case 'headers':
          requestCount += 1; // Just 1 request for headers
          break;
        case 'fileupload':
          requestCount += urls.length * 1.5; // Approx 1.5 requests per URL for upload
          break;
      }
    }
    
    return Math.floor(requestCount);
  }

  /**
   * Generate realistic server info for a website
   * This function creates simulated server information for demo purposes
   */
  static generateRealisticServerInfo(url: string): { server: string, technologies: string[], headers: Record<string, string> } {
    // Generate a pseudo-random number based on the URL string
    const getHashCode = (str: string): number => {
      let hash = 0;
      if (str.length === 0) return hash;
      
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      
      return Math.abs(hash);
    };
    
    const urlHash = getHashCode(url);
    
    // Use the hash to deterministically select server information
    const serverOptions = [
      'Apache/2.4.51 (Unix)',
      'nginx/1.21.3',
      'Microsoft-IIS/10.0',
      'LiteSpeed',
      'CloudFlare',
      'Apache/2.4.41 (Ubuntu)',
      'nginx/1.18.0 (Ubuntu)',
      'Apache/2.4.46 (Win64)',
      'Varnish',
      'Caddy'
    ];
    
    const serverIndex = urlHash % serverOptions.length;
    const server = serverOptions[serverIndex];
    
    // Generate technology stack based on server
    const technologies: string[] = [];
    
    // PHP is common on Apache
    if (server.includes('Apache')) {
      technologies.push(`PHP/${7 + (urlHash % 3)}.${urlHash % 10}`);
      
      // MySQL often pairs with PHP
      if (urlHash % 2 === 0) {
        technologies.push(`MySQL/${5 + (urlHash % 4)}.${urlHash % 10}.${urlHash % 30}`);
      }
    }
    
    // ASP.NET on IIS
    if (server.includes('IIS')) {
      technologies.push(`ASP.NET ${4 + (urlHash % 4)}.${urlHash % 8}`);
      // SQL Server often pairs with ASP.NET
      technologies.push(`MS-SQL-Server/${urlHash % 2 === 0 ? '2019' : '2016'}`);
    }
    
    // Common technologies on nginx
    if (server.includes('nginx')) {
      const nodeMajor = 12 + (urlHash % 8); // Node.js versions 12-19
      const nodeMinor = urlHash % 15;
      technologies.push(`Node.js/${nodeMajor}.${nodeMinor}.0`);
      
      // MongoDB often pairs with Node.js
      if (urlHash % 3 === 0) {
        technologies.push(`MongoDB/${4 + (urlHash % 2)}.${urlHash % 10}`);
      }
    }
    
    // Common frontend frameworks
    const frontendFrameworks = ['React', 'Angular', 'Vue.js', 'jQuery', 'Bootstrap'];
    const numFrameworks = (urlHash % 3) + 1; // 1-3 frameworks
    
    for (let i = 0; i < numFrameworks; i++) {
      const frameworkIndex = (urlHash + i) % frontendFrameworks.length;
      technologies.push(frontendFrameworks[frameworkIndex]);
    }
    
    // Unique ID for mock header values that doesn't use crypto.randomUUID
    const generateUniqueId = () => {
      return 'id-' + Math.random().toString(36).substring(2, 15) + 
             Math.random().toString(36).substring(2, 15);
    };
    
    // Generate mock response headers
    const headers: Record<string, string> = {
      'Server': server
    };
    
    // Add X-Powered-By for PHP/ASP.NET
    if (technologies.some(t => t.includes('PHP'))) {
      headers['X-Powered-By'] = technologies.find(t => t.includes('PHP')) || 'PHP';
    } else if (technologies.some(t => t.includes('ASP.NET'))) {
      headers['X-Powered-By'] = technologies.find(t => t.includes('ASP.NET')) || 'ASP.NET';
    }
    
    // Add some common security headers with a 50% chance each
    if (urlHash % 2 === 0) {
      headers['X-Frame-Options'] = 'SAMEORIGIN';
    }
    
    if ((urlHash >> 1) % 2 === 0) {
      headers['X-XSS-Protection'] = '1; mode=block';
    }
    
    if ((urlHash >> 2) % 2 === 0) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }
    
    // Add some custom headers to make it look more realistic
    headers['ETag'] = `"${generateUniqueId()}"`;
    headers['CF-Cache-Status'] = urlHash % 3 === 0 ? 'HIT' : 'MISS';
    
    if (urlHash % 4 === 0) {
      headers['Cache-Control'] = 'max-age=3600, must-revalidate';
    }
    
    return {
      server,
      technologies,
      headers
    };
  }
}
