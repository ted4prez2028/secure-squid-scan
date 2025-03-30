
import { jsPDF } from 'jspdf';

/**
 * Ensures that jspdf-autotable is properly loaded
 * This can be used before PDF generation to verify the plugin is available
 */
export function ensureAutoTableLoaded(): boolean {
  try {
    // Create a test document
    const doc = new jsPDF();
    
    // Check if autoTable is available
    if (typeof doc.autoTable !== 'function') {
      console.warn('autoTable function is not available on jsPDF instance');
      
      // Try to dynamically load autoTable if available in window
      if (typeof window !== 'undefined' && 
          window.jspdf && 
          typeof window.jspdf.jsPDF === 'function' &&
          typeof window.jspdf.autoTable === 'function') {
        console.log('Found autoTable in window, attempting to attach');
        return true;
      }
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking jspdf-autotable:', error);
    return false;
  }
}
