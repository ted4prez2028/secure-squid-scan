
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
        
        try {
          // Try to attach the autoTable plugin manually
          window.jspdf.autoTable(jsPDF.prototype);
          
          // Verify it worked
          return typeof doc.autoTable === 'function';
        } catch (e) {
          console.error('Failed to attach autoTable plugin:', e);
          return false;
        }
      }
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking jspdf-autotable:', error);
    return false;
  }
}

/**
 * Function to verify if the jspdf-autotable plugin can create tables
 * This does a more thorough check by actually trying to create a simple table
 */
export function verifyAutoTableWorks(): boolean {
  try {
    const doc = new jsPDF();
    
    if (typeof doc.autoTable !== 'function') {
      return false;
    }
    
    // Try to create a simple table
    try {
      doc.autoTable({
        head: [['Test']],
        body: [['Data']]
      });
      return true;
    } catch (e) {
      console.error('Error creating test table with autoTable:', e);
      return false;
    }
  } catch (error) {
    console.error('Error verifying autoTable functionality:', error);
    return false;
  }
}
