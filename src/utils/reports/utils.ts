
import { SeverityBadge } from './types';

// Helper function to create a severity badge
export function getSeverityBadge(severity: string): SeverityBadge {
  switch (severity.toLowerCase()) {
    case 'critical':
      return { text: 'CRITICAL', color: '#FF0000' };
    case 'high':
      return { text: 'HIGH', color: '#FF5252' };
    case 'medium':
      return { text: 'MEDIUM', color: '#FFA500' };
    case 'low':
      return { text: 'LOW', color: '#4CAF50' };
    case 'info':
      return { text: 'INFO', color: '#2196F3' };
    default:
      return { text: 'UNKNOWN', color: '#9E9E9E' };
  }
}

// Helper function to format date
export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Helper function to format duration
export function formatDuration(milliseconds: number): string {
  if (!milliseconds || isNaN(milliseconds)) return 'N/A';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}
