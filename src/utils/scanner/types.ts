
// Importing base types from scanEngine to maintain compatibility
import { ScanConfig, ScanResults, Vulnerability } from '../scanEngine';

// Status types for scans
export type ScanStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

// Interface for scan status response
export interface ScanStatusResponse {
  scanId: string;
  status: ScanStatus;
  progress: number;
  results?: ScanResults;
  error?: string;
}

// Interface for custom payload handling
export interface ScanData {
  config: ScanConfig;
  status: ScanStatus;
  progress: number;
  results?: ScanResults;
  error?: string;
  customPayloads?: Map<string, string[]>;
}

// API configuration
export const API_BASE_URL = 'http://localhost:3000/api';
export const USE_MOCK_DATA = false; // Set to false to use real scanning

// Interface for server responses
export interface ServerResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
