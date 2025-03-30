
import { ScanConfig, ScanResults, ScanAgent } from '../scanEngine';

// Progress tracking for ongoing scans
const scanProgressMap = new Map<string, number>();
const scanResultsMap = new Map<string, ScanResults>();

/**
 * Mock scanner implementation for testing
 */
export class MockScanner {
  /**
   * Start a new mock scan
   */
  public static startScan(config: ScanConfig): ScanResults {
    console.log('Using mock data instead of performing a real scan');
    
    // Generate mock results
    const mockResults = ScanAgent.createMockResults(config);
    return mockResults;
  }

  /**
   * Check the status of an ongoing mock scan
   */
  public static checkScanStatus(scanId: string): {
    scanId: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    progress: number;
    results?: ScanResults;
    error?: string;
  } {
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

  /**
   * Get the results of a completed mock scan
   */
  public static getScanResults(scanId: string): ScanResults {
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
