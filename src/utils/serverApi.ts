
import { ScanConfig, ScanResults, ScanAgent } from './scanEngine';

// Since the external server isn't available, we'll use mock data instead
const USE_MOCK_DATA = true;
const SERVER_API_URL = 'http://teddytechnologies.com:8080/api';

interface ServerResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Send a scan request to the server or generate mock data
 */
export async function sendScanRequest(config: ScanConfig): Promise<ScanResults> {
  if (USE_MOCK_DATA) {
    console.log('Using mock data instead of sending request to server');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock results
    const mockResults = ScanAgent.createMockResults(config);
    return mockResults;
  }
  
  try {
    const response = await fetch(`${SERVER_API_URL}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server returned ${response.status}: ${errorText}`);
    }
    
    const result: ServerResponse<ScanResults> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Unknown server error');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error sending scan request to server:', error);
    throw error;
  }
}

/**
 * Check the status of an ongoing scan or simulate progress
 */
export async function checkScanStatus(scanId: string): Promise<{
  scanId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  results?: ScanResults;
  error?: string;
}> {
  if (USE_MOCK_DATA) {
    // Store the progress in a static variable
    if (!checkScanStatus._progress) {
      checkScanStatus._progress = 10;
    } else {
      checkScanStatus._progress += Math.floor(Math.random() * 20) + 10;
      if (checkScanStatus._progress > 100) checkScanStatus._progress = 100;
    }
    
    const progress = checkScanStatus._progress;
    
    // If the progress is complete, return the results
    if (progress >= 100) {
      // Reset for next scan
      checkScanStatus._progress = 0;
      
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
  
  try {
    const response = await fetch(`${SERVER_API_URL}/scan/status/${scanId}`);
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking scan status:', error);
    throw error;
  }
}

/**
 * Retrieve the results of a completed scan
 */
export async function getScanResults(scanId: string): Promise<ScanResults> {
  if (USE_MOCK_DATA) {
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
  
  try {
    const response = await fetch(`${SERVER_API_URL}/scan/results/${scanId}`);
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    const result: ServerResponse<ScanResults> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Unknown server error');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error retrieving scan results:', error);
    throw error;
  }
}

// For TypeScript - define a static property to store progress
declare namespace checkScanStatus {
  let _progress: number;
}
checkScanStatus._progress = 0;
