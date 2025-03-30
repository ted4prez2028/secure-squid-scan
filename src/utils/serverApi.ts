
import { ScanConfig, ScanResults, ScanAgent } from './scanEngine';

// Configuration for server connection
const SERVER_API_URL = 'http://teddytechnologies.com:8080/api';
const USE_MOCK_DATA = true; // Set to false to use real server endpoints

interface ServerResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Progress tracking for mocked responses
const scanProgressMap = new Map<string, number>();

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

// Now let's create a real API handler to simulate backend functionality
export async function setupLocalApiEndpoint() {
  // This function sets up a listener for our main app endpoints
  if (USE_MOCK_DATA) {
    // Set up mock API endpoint interceptors for the Scanner UI
    const originalFetch = window.fetch;
    window.fetch = async function(input, init) {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      
      // Handle /api/scan endpoint
      if (url.includes(`${SERVER_API_URL}/scan`) && !url.includes('/status/') && !url.includes('/results/')) {
        console.log('Intercepted scan request to API endpoint');
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const scanConfig = init && init.body ? JSON.parse(init.body.toString()) : {};
        const mockResults = ScanAgent.createMockResults(scanConfig);
        
        // Create a mock response
        return new Response(JSON.stringify({
          success: true,
          data: mockResults
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Handle /api/scan/status/:id endpoint
      if (url.includes(`${SERVER_API_URL}/scan/status/`)) {
        console.log('Intercepted scan status request');
        const scanId = url.split('/').pop() || '';
        
        // Get status data from our mock function
        const statusData = await checkScanStatus(scanId);
        
        return new Response(JSON.stringify(statusData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Handle /api/scan/results/:id endpoint
      if (url.includes(`${SERVER_API_URL}/scan/results/`)) {
        console.log('Intercepted scan results request');
        const scanId = url.split('/').pop() || '';
        
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
        
        const mockResults = ScanAgent.createMockResults(mockConfig);
        
        return new Response(JSON.stringify({
          success: true,
          data: mockResults
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // For any other request, use the original fetch
      return originalFetch(input, init);
    };
    
    console.log('Local API endpoints have been set up for scanner functionality');
  }
}
