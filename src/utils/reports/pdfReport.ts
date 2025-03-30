
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Chart, registerables } from 'chart.js';
import { ScanResults, Vulnerability } from './types';
import { formatDate, formatDuration, getSeverityBadge } from './utils';

// Register Chart.js components
Chart.register(...registerables);

// Generate a PDF report from scan results
export function generatePdfReport(scanResults: ScanResults): jsPDF {
  // Create a new jsPDF instance
  const doc = new jsPDF();
  
  try {
    // Ensure autoTable is available
    if (typeof doc.autoTable !== 'function') {
      console.warn('autoTable function is not available, attempting to add it dynamically');
      
      // Try to load autoTable dynamically if it's available in the window object
      if (window.jspdf && window.jspdf.jsPDF) {
        const autoTable = window.jspdf.autoTable;
        if (typeof autoTable === 'function') {
          doc.autoTable = autoTable;
        }
      }
      
      // If autoTable is still not available, throw an error
      if (typeof doc.autoTable !== 'function') {
        throw new Error('jspdf-autotable is not properly loaded');
      }
    }
    
    // Add title
    doc.setFontSize(22);
    doc.setTextColor(33, 33, 33);
    doc.text('Web Application Security Scan Report', 105, 20, { align: 'center' });
    
    // Add subtitle with date
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 28, { align: 'center' });
    
    // Add horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 32, 190, 32);
    
    // Executive Summary
    doc.setFontSize(16);
    doc.setTextColor(33, 33, 33);
    doc.text('Executive Summary', 20, 42);
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    
    // Target information
    const summaryData = [
      ['Target URL', scanResults.summary.url],
      ['Scan Start Time', formatDate(scanResults.summary.startTime)],
      ['Scan End Time', formatDate(scanResults.summary.endTime)],
      ['Scan Duration', formatDuration(scanResults.summary.duration || 0)],
      ['Scan Mode', scanResults.summary.scanMode.toUpperCase()],
      ['Pages Scanned', scanResults.summary.testedPages?.toString() || scanResults.summary.testedURLs?.toString() || '0'],
      ['Requests Sent', scanResults.summary.requestsSent?.toString() || 'N/A'],
    ];
    
    // Use autoTable for summary data
    doc.autoTable({
      startY: 46,
      head: [['Property', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        cellPadding: 4,
      },
      columnStyles: {
        0: { fontStyle: 'bold' }
      }
    });
    
    // Vulnerability Summary
    doc.setFontSize(16);
    doc.setTextColor(33, 33, 33);
    
    const lastTableY = doc.lastAutoTable?.finalY || 100;
    doc.text('Vulnerability Summary', 20, lastTableY + 15);
    
    // Create vulnerability summary table
    const vulnerabilitySummary = [
      ['Critical', scanResults.summary.critical.toString()],
      ['High', scanResults.summary.high.toString()],
      ['Medium', scanResults.summary.medium.toString()],
      ['Low', scanResults.summary.low.toString()],
      ['Info', scanResults.summary.info.toString()],
      ['Total', scanResults.summary.total.toString()]
    ];
    
    doc.autoTable({
      startY: lastTableY + 20,
      head: [['Severity', 'Count']],
      body: vulnerabilitySummary,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        cellPadding: 4,
      },
      columnStyles: {
        0: { fontStyle: 'bold' }
      },
      bodyStyles: {
        0: { 
          fillColor: function(row: any) {
            const severity = row.raw[0].toLowerCase();
            switch (severity) {
              case 'critical': return [255, 0, 0];
              case 'high': return [255, 82, 82];
              case 'medium': return [255, 165, 0];
              case 'low': return [76, 175, 80];
              case 'info': return [33, 150, 243];
              default: return [255, 255, 255];
            }
          }
        }
      }
    });
    
    // Add a new page for detailed findings
    doc.addPage();
    
    // Detailed Findings
    doc.setFontSize(16);
    doc.setTextColor(33, 33, 33);
    doc.text('Detailed Findings', 20, 20);
    
    // Create vulnerability details table with screenshots if available
    const vulnerabilityDetails = scanResults.vulnerabilities.map((vuln: Vulnerability) => {
      const severity = getSeverityBadge(vuln.severity);
      return [
        severity.text,
        vuln.name || vuln.type || 'Unknown',
        vuln.url || 'N/A',
        vuln.parameter || 'N/A'
      ];
    });
    
    doc.autoTable({
      startY: 25,
      head: [['Severity', 'Vulnerability', 'URL', 'Parameter']],
      body: vulnerabilityDetails,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        cellPadding: 4,
        overflow: 'linebreak',
        fontSize: 9
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 25 },
        2: { cellWidth: 'auto' }
      }
    });
    
    // Add individual vulnerability details with screenshots
    let currentY = doc.lastAutoTable?.finalY || 100 + 15;
    
    scanResults.vulnerabilities.forEach((vuln: Vulnerability, index: number) => {
      // Check if we need a new page
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      
      const severity = getSeverityBadge(vuln.severity);
      
      // Vulnerability title
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      doc.text(`${index + 1}. ${vuln.name || vuln.type || 'Unknown Vulnerability'}`, 20, currentY);
      
      // Severity badge
      doc.setFillColor(severity.color);
      doc.rect(doc.getTextWidth(`${index + 1}. ${vuln.name || vuln.type || 'Unknown Vulnerability'}`) + 25, currentY - 4, 25, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(severity.text, doc.getTextWidth(`${index + 1}. ${vuln.name || vuln.type || 'Unknown Vulnerability'}`) + 37.5, currentY - 1, { align: 'center' });
      
      currentY += 8;
      
      // Description
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      const descriptionLines = doc.splitTextToSize(vuln.description || 'No description available', 170);
      doc.text(descriptionLines, 20, currentY);
      
      currentY += descriptionLines.length * 5 + 5;
      
      // Add screenshot if available
      if (vuln.screenshot) {
        try {
          doc.setFontSize(10);
          doc.setTextColor(33, 33, 33);
          doc.text('Screenshot:', 20, currentY);
          currentY += 5;
          
          // Add the image
          doc.addImage(vuln.screenshot, 'PNG', 20, currentY, 160, 80);
          currentY += 85;
        } catch (err) {
          console.error('Error adding screenshot to PDF:', err);
        }
      }
      
      // Details table
      const vulnData = [
        ['URL', vuln.url || 'N/A'],
        ['Parameter', vuln.parameter || 'N/A'],
        ['Category', vuln.category || 'N/A'],
        ['CWE', vuln.cwes ? vuln.cwes.join(', ') : 'N/A'],
        ['CVSS Score', vuln.cvss ? vuln.cvss.toString() : 'N/A'],
        ['Discovered', formatDate(vuln.discoveredAt)]
      ];
      
      doc.autoTable({
        startY: currentY,
        body: vulnData,
        theme: 'plain',
        styles: {
          cellPadding: 2,
          fontSize: 9
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 30 },
          1: { cellWidth: 'auto' }
        }
      });
      
      currentY = doc.lastAutoTable?.finalY || currentY + 20;
      
      // Remediation
      if (vuln.remediation) {
        doc.setFontSize(10);
        doc.setTextColor(33, 33, 33);
        doc.text('Remediation:', 20, currentY);
        
        currentY += 5;
        
        doc.setTextColor(80, 80, 80);
        const remediationLines = doc.splitTextToSize(vuln.remediation, 170);
        doc.text(remediationLines, 20, currentY);
        
        currentY += remediationLines.length * 5 + 10;
      } else {
        currentY += 10;
      }
    });
    
    // Add AI Analysis if available
    if (scanResults.aiSummary || scanResults.aiRemediation) {
      doc.addPage();
      
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text('AI Analysis', 20, 20);
      
      let aiY = 30;
      
      if (scanResults.aiSummary) {
        doc.setFontSize(12);
        doc.setTextColor(33, 33, 33);
        doc.text('Summary', 20, aiY);
        
        aiY += 8;
        
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        const summaryLines = doc.splitTextToSize(scanResults.aiSummary, 170);
        doc.text(summaryLines, 20, aiY);
        
        aiY += summaryLines.length * 5 + 10;
      }
      
      if (scanResults.aiRemediation) {
        doc.setFontSize(12);
        doc.setTextColor(33, 33, 33);
        doc.text('Recommended Actions', 20, aiY);
        
        aiY += 8;
        
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        const remediationLines = doc.splitTextToSize(scanResults.aiRemediation, 170);
        doc.text(remediationLines, 20, aiY);
      }
    }
    
    // Add footer to all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`OWASP Vulnerability Scanner Report - Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }
    
    return doc;
  } catch (error) {
    console.error('Error generating PDF report:', error);
    
    // Create a simple error page
    doc.setFontSize(16);
    doc.setTextColor(255, 0, 0);
    doc.text('Error Generating PDF Report', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('There was an error generating the PDF report.', 105, 40, { align: 'center' });
    doc.text('Please try downloading in HTML or CSV format instead.', 105, 50, { align: 'center' });
    
    if (error instanceof Error) {
      doc.setFontSize(10);
      doc.text(`Error: ${error.message}`, 105, 70, { align: 'center' });
    }
    
    return doc;
  }
}
