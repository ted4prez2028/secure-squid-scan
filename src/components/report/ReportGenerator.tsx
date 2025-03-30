
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScanResults } from '@/utils/reportGenerator';
import { generatePdfReport, generateHtmlReport, generateCsvReport } from '@/utils/reportGenerator';

// Import refactored components
import ReportHeader from './ReportHeader';
import StandardReportForm from './StandardReportForm';
import AdvancedReportOptions from './AdvancedReportOptions';
import ReportTemplates from './ReportTemplates';
import ReportHistory from './ReportHistory';
import SavedTemplates from './SavedTemplates';
import ErrorToast from './ErrorToast';
import { createDefaultReportTitle, downloadBlob, createReportHistoryEntry, getTemplateSettings } from './reportUtils';

interface ReportGeneratorProps {
  scanResults: ScanResults;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ scanResults }) => {
  const [reportTitle, setReportTitle] = useState<string>(createDefaultReportTitle(scanResults));
  const [reportFormat, setReportFormat] = useState('pdf');
  const [reportTemplate, setReportTemplate] = useState('detailed');
  const [activeTab, setActiveTab] = useState('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const { toast } = useToast();
  
  const [sections, setSections] = useState({
    executiveSummary: true,
    vulnerabilityDetails: true,
    remediation: true,
    screenshots: true,
    methodology: true,
    appendices: true,
  });

  const [reportHistory, setReportHistory] = useState([
    {
      name: `Security Assessment Report - ${scanResults?.summary?.url || 'Example.com'}`,
      date: 'Oct 15, 2023 09:45 AM',
      format: 'PDF',
      data: null
    },
    {
      name: 'Bug Bounty Report - Critical XSS',
      date: 'Oct 10, 2023 02:15 PM',
      format: 'HTML',
      data: null
    }
  ]);

  const handleSectionChange = (section: string, checked: boolean) => {
    setSections({ ...sections, [section]: checked });
  };
  
  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      let reportData = null;
      
      switch (reportFormat.toLowerCase()) {
        case 'pdf':
          try {
            reportData = generatePdfReport(scanResults);
          } catch (error) {
            console.error("Error generating PDF report:", error);
            toast({
              title: "PDF Generation Failed",
              description: "Falling back to HTML format. Please try a different format or check console for details.",
              variant: "destructive",
            });
            reportData = generateHtmlReport(scanResults);
            setReportFormat('html');
          }
          break;
        case 'html':
          reportData = generateHtmlReport(scanResults);
          break;
        case 'markdown':
          reportData = generateCsvReport(scanResults);
          break;
        default:
          reportData = generateHtmlReport(scanResults);
      }
      
      const newReport = createReportHistoryEntry(reportTitle, reportFormat, reportData);
      
      setReportHistory([newReport, ...reportHistory]);
      
      setTimeout(() => {
        setIsGenerating(false);
        
        toast({
          title: "Report Generated",
          description: `Your ${reportFormat.toUpperCase()} report has been generated successfully.`,
        });
      }, 1500);
    } catch (error) {
      console.error("Error generating report:", error);
      setIsGenerating(false);
      
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again with a different format.",
        variant: "destructive",
      });
    }
  };

  const downloadReport = (report: any) => {
    try {
      if (!report.data) {
        let reportData = null;
        
        switch (report.format.toLowerCase()) {
          case 'pdf':
            try {
              reportData = generatePdfReport(scanResults);
              reportData.save(`${report.name.replace(/\s+/g, '_')}.pdf`);
            } catch (error) {
              console.error("Error downloading PDF report:", error);
              toast({
                title: "PDF Download Failed",
                description: "Falling back to HTML format. Please try a different format.",
                variant: "destructive",
              });
              reportData = generateHtmlReport(scanResults);
              downloadBlob(reportData, `${report.name.replace(/\s+/g, '_')}.html`, 'text/html');
            }
            break;
          case 'html':
            reportData = generateHtmlReport(scanResults);
            downloadBlob(reportData, `${report.name.replace(/\s+/g, '_')}.html`, 'text/html');
            break;
          case 'csv':
          case 'markdown':
            reportData = generateCsvReport(scanResults);
            downloadBlob(reportData, `${report.name.replace(/\s+/g, '_')}.csv`, 'text/csv');
            break;
        }
      } else {
        try {
          if (report.format.toLowerCase() === 'pdf' && typeof report.data.save === 'function') {
            report.data.save(`${report.name.replace(/\s+/g, '_')}.pdf`);
          } else {
            const mimeType = report.format.toLowerCase() === 'html' ? 'text/html' : 'text/csv';
            const extension = report.format.toLowerCase() === 'html' ? 'html' : 'csv';
            downloadBlob(report.data, `${report.name.replace(/\s+/g, '_')}.${extension}`, mimeType);
          }
        } catch (error) {
          console.error("Error in report download:", error);
          toast({
            title: "Download Issue",
            description: "There was a problem with the download. Trying alternative format.",
            variant: "destructive",
          });
          
          // Fall back to HTML if PDF fails
          if (report.format.toLowerCase() === 'pdf') {
            const htmlReport = generateHtmlReport(scanResults);
            downloadBlob(htmlReport, `${report.name.replace(/\s+/g, '_')}.html`, 'text/html');
          }
        }
      }
      
      toast({
        title: "Download Started",
        description: `Your report download has started.`,
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      
      toast({
        title: "Download Failed",
        description: "Failed to download the report. Please try again with a different format.",
        variant: "destructive",
      });
      
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 5000);
    }
  };

  const useTemplate = (templateName: string) => {
    const settings = getTemplateSettings(templateName);
    
    setReportTemplate(settings.template);
    setActiveTab('standard');
    
    if (settings.sections) {
      setSections({...settings.sections});
    }
    
    toast({
      title: "Template Applied",
      description: `${templateName} has been applied to your report.`,
    });
  };

  const createTemplate = () => {
    toast({
      title: "Create Template",
      description: "Template creation functionality will be available in the next update.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <ReportHeader />
        
        <CardContent className="space-y-6">
          <Tabs defaultValue="standard" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="standard">Standard Report</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
              <TabsTrigger value="templates">Report Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="standard" className="space-y-6">
              <StandardReportForm 
                reportTitle={reportTitle}
                setReportTitle={setReportTitle}
                reportFormat={reportFormat}
                setReportFormat={setReportFormat}
                reportTemplate={reportTemplate}
                setReportTemplate={setReportTemplate}
                sections={sections}
                handleSectionChange={handleSectionChange}
              />
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-6">
              <AdvancedReportOptions />
            </TabsContent>
            
            <TabsContent value="templates" className="space-y-6">
              <ReportTemplates 
                reportTemplate={reportTemplate}
                setReportTemplate={setReportTemplate}
                scanResults={scanResults}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => toast({ title: "Operation Cancelled" })}>
            Cancel
          </Button>
          <Button 
            variant="purple" 
            onClick={generateReport} 
            disabled={isGenerating} 
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <ErrorToast showErrorToast={showErrorToast} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportHistory 
          reportHistory={reportHistory}
          downloadReport={downloadReport}
        />
        
        <SavedTemplates 
          useTemplate={useTemplate}
          createTemplate={createTemplate}
        />
      </div>
    </div>
  );
};

export default ReportGenerator;
