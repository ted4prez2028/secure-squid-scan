
import { API_BASE_URL, ServerResponse } from './types';
import { RealScanner } from './realScanner';
import { ScanConfig, ScanResults } from '../scanEngine';

/**
 * Setup local API endpoint handler
 */
export function setupLocalApiEndpoint() {
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
