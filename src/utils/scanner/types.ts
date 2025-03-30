
// Importing base types from scanEngine to maintain compatibility
import { ScanConfig, ScanResults as ScanResultsBase, Vulnerability } from '../scanEngine';

// Status types for scans
export type ScanStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

// Interface for scan status response
export interface ScanStatusResponse {
  scanId: string;
  status: ScanStatus;
  progress: number;
  progressMessage?: string; // Add description of current scan step
  results?: ScanResults;
  error?: string;
}

// Re-export the ScanResults type from scanEngine
export type ScanResults = ScanResultsBase;

// Interface for custom payload handling
export interface ScanData {
  config: ScanConfig;
  status: ScanStatus;
  progress: number;
  progressMessage?: string;
  results?: ScanResults;
  error?: string;
  customPayloads?: Map<string, string[]>;
  startTime?: string;
  endTime?: string;
  targetInfo?: {
    serverName?: string;
    technologies?: string[];
    operatingSystem?: string;
    openPorts?: number[];
  };
  requestsSent: number;
  responsesReceived: number;
  vulnerabilitiesFound: number;
}

// API configuration
export const API_BASE_URL = 'http://localhost:3000/api';
export const USE_MOCK_DATA = false; // Set to false to use real scanning

// Interface for server responses
export interface ServerResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorDetails?: any;
}

// Detection accuracy levels
export type DetectionAccuracy = 'low' | 'medium' | 'high';

// Scan context for maintaining state
export interface ScanContext {
  url: string;
  parameters: Map<string, string[]>;
  cookies: Map<string, string>;
  headers: Map<string, string>;
  forms: any[];
  scripts: string[];
  technologies: string[];
}

// Enhanced payload type
export interface TestPayload {
  payload: string;
  type: string;
  description: string;
  expectedResponse?: string;
  accuracy: DetectionAccuracy;
}
