
// Re-export all functionalities from the reports directory
export * from './reports';

// Import required modules for direct usage
import { generatePdfReport, generateHtmlReport, generateCsvReport } from './reports';
import { ensureAutoTableLoaded, verifyAutoTableWorks } from './reports/ensureAutoTable';
import { ScanResults } from './reports/types';

/**
 * Wrapper function to safely generate a PDF report with proper error handling
 */
export async function safeGeneratePdfReport(scanResults: ScanResults): Promise<{success: boolean, data: any, error?: string}> {
  try {
    // First verify that autoTable is properly loaded
    if (!ensureAutoTableLoaded()) {
      console.warn('jspdf-autotable is not properly loaded, PDF generation may fail');
      
      // Try to load jspdf-autotable explicitly
      try {
        await import('jspdf-autotable');
        // After importing, check again if it's available
        if (!verifyAutoTableWorks()) {
          return {
            success: false,
            data: null,
            error: 'Failed to load jspdf-autotable plugin after explicit import'
          };
        }
      } catch (err) {
        console.error('Failed to dynamically import jspdf-autotable:', err);
        return {
          success: false,
          data: null,
          error: 'Failed to load jspdf-autotable plugin'
        };
      }
    }
    
    // If we got here, we can try to generate the PDF
    const pdfDoc = generatePdfReport(scanResults);
    
    return {
      success: true,
      data: pdfDoc
    };
  } catch (error) {
    console.error('Error in safeGeneratePdfReport:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error generating PDF'
    };
  }
}
