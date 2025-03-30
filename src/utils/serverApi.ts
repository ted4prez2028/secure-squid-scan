
import { ScanConfig, ScanResults } from './scanEngine';
import { USE_MOCK_DATA } from './scanner/types';
import { RealScanner } from './scanner/realScanner';
import { MockScanner } from './scanner/mockScanner';
import { setupLocalApiEndpoint } from './scanner/apiHandler';
import { getRandomPayloads } from './payloadExamples';

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
          testedPages: 0,
          timestamp: Date.now()
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

// Export the setupLocalApiEndpoint function
export { setupLocalApiEndpoint };
