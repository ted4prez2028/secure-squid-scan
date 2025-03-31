
import { ScanConfig, ScanResults } from './scanEngine';
import { USE_MOCK_DATA } from './scanner/types';
import { RealScanner } from './scanner/realScanner';
import { MockScanner } from './scanner/mockScanner';
import { setupLocalApiEndpoint } from './scanner/apiHandler';
import { getRandomPayloads } from './payloadExamples';

/**
 * Send a scan request to start a real scan
 */
export async function startScan(config: ScanConfig, customPayloads?: Map<string, string[]>): Promise<string> {
  if (!USE_MOCK_DATA) {
    try {
      console.log("Starting a real scan with configuration:", config);
      
      // Use our RealScanner implementation
      const scanner = RealScanner.getInstance();
      const scanId = scanner.startScan(config, customPayloads);
      
      return scanId;
    } catch (error) {
      console.error('Error starting real scan:', error);
      throw error;
    }
  } else {
    console.log('Using mock data instead of performing a real scan');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock results using the MockScanner
    return MockScanner.startScan(config);
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
    // Use the MockScanner implementation for testing
    return MockScanner.checkScanStatus(scanId);
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
    // Use the MockScanner implementation for testing
    return MockScanner.getScanResults(scanId);
  }
}

/**
 * Crawl URLs from a target website
 */
export async function crawlUrls(targetUrl: string, depth: number = 2): Promise<string[]> {
  if (!USE_MOCK_DATA) {
    try {
      console.log(`Crawling URLs from ${targetUrl} with depth ${depth}`);
      
      // Use our RealScanner implementation for crawling
      const scanner = RealScanner.getInstance();
      return scanner.discoverPages(targetUrl, depth);
    } catch (error) {
      console.error('Error crawling URLs:', error);
      throw error;
    }
  } else {
    // Generate some mock URLs
    const mockUrls = [];
    const urlObj = new URL(targetUrl);
    const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;
    
    // Add some common paths
    mockUrls.push(baseUrl);
    mockUrls.push(`${baseUrl}/about`);
    mockUrls.push(`${baseUrl}/contact`);
    mockUrls.push(`${baseUrl}/products`);
    mockUrls.push(`${baseUrl}/services`);
    
    // Add some random paths
    for (let i = 0; i < depth * 3; i++) {
      mockUrls.push(`${baseUrl}/${Math.random().toString(36).substring(2, 8)}`);
    }
    
    return mockUrls;
  }
}

// Export the setupLocalApiEndpoint function
export { setupLocalApiEndpoint };
