
import { ScanConfig, ScanResults } from './scanEngine';

// Configuration for your server
const SERVER_API_URL = 'http://teddytechnologies.com:8080/api';

interface ServerResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Send a scan request to your personal server
 */
export async function sendScanRequest(config: ScanConfig): Promise<ScanResults> {
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
 * Check the status of an ongoing scan
 */
export async function checkScanStatus(scanId: string): Promise<{
  scanId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  results?: ScanResults;
  error?: string;
}> {
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
