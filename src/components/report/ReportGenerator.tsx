
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportHeader from './ReportHeader';
import StandardReportForm from './StandardReportForm';
import AdvancedReportOptions from './AdvancedReportOptions';
import ReportTemplates from './ReportTemplates';
import SavedTemplates from './SavedTemplates';
import ReportHistory from './ReportHistory';
import { generatePdfReport, generateHtmlReport, generateCsvReport } from '@/utils/reports';
import { Button } from "@/components/ui/button";
import { Download, FileText, FileType } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScanResults } from "@/utils/reports/types";
import ErrorToast from './ErrorToast';

interface ReportGeneratorProps {
  scanResults: ScanResults;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ scanResults }) => {
  const [activeTab, setActiveTab] = useState("standard");
  const [reportTitle, setReportTitle] = useState(`Security Scan Report - ${scanResults.summary.url}`);
  const [reportSubtitle, setReportSubtitle] = useState(`Generated on ${new Date().toLocaleDateString()}`);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [generatedHtmlContent, setGeneratedHtmlContent] = useState<string | null>(null);
  const [generatedCsvContent, setGeneratedCsvContent] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateReport = async (reportType: 'pdf' | 'html' | 'csv') => {
    setIsLoading(true);
    
    try {
      if (reportType === 'pdf') {
        const pdfBlob = await generatePdfReport(scanResults);
        
        // Convert jsPDF output to Blob
        const pdfBlobData = new Blob([pdfBlob.output('blob')], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlobData);
        setGeneratedPdfUrl(pdfUrl);
        
        // Auto download
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${reportTitle.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "PDF Report Generated",
          description: "Your PDF report has been generated and downloaded."
        });
      } else if (reportType === 'html') {
        const htmlContent = generateHtmlReport(scanResults);
        
        setGeneratedHtmlContent(htmlContent);
        
        toast({
          title: "HTML Report Generated",
          description: "Your HTML report has been generated and is ready for preview."
        });
      } else if (reportType === 'csv') {
        const csvContent = generateCsvReport(scanResults);
        setGeneratedCsvContent(csvContent);
        
        // Auto download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportTitle.replace(/\s+/g, '_')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "CSV Report Generated",
          description: "Your CSV report has been generated and downloaded."
        });
      }
    } catch (error) {
      console.error("Error generating report:", error);
      
      toast({
        variant: "destructive",
        title: `Failed to generate ${reportType.toUpperCase()} report`,
        description: error instanceof Error ? error.message : "An unknown error occurred",
        action: <ErrorToast showErrorToast={true} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadGeneratedReport = (type: 'pdf' | 'html' | 'csv') => {
    if (type === 'pdf' && generatedPdfUrl) {
      window.open(generatedPdfUrl, '_blank');
    } else if (type === 'html' && generatedHtmlContent) {
      const blob = new Blob([generatedHtmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportTitle.replace(/\s+/g, '_')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (type === 'csv' && generatedCsvContent) {
      const blob = new Blob([generatedCsvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportTitle.replace(/\s+/g, '_')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <ReportHeader 
        title={reportTitle}
        setTitle={setReportTitle}
        subtitle={reportSubtitle}
        setSubtitle={setReportSubtitle}
      />

      <Tabs defaultValue="standard" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="standard">Standard Report</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="standard" className="space-y-4 pt-4">
          <StandardReportForm 
            scanResults={scanResults}
            onGenerateReport={handleGenerateReport}
            isLoading={isLoading}
          />
          
          {generatedPdfUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generated Report</CardTitle>
                <CardDescription>Your report is ready to download or view</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    variant="purple" 
                    className="w-full"
                    onClick={() => window.open(generatedPdfUrl, '_blank')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View PDF Report
                  </Button>
                  
                  <Button 
                    variant="download" 
                    className="w-full"
                    onClick={() => downloadGeneratedReport('pdf')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {generatedHtmlContent && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">HTML Report Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-md p-4 bg-white">
                  <div className="max-h-[400px] overflow-auto">
                    <iframe
                      srcDoc={generatedHtmlContent}
                      title="HTML Report"
                      className="w-full h-[400px] border-0"
                    />
                  </div>
                </div>
                <Button 
                  variant="download" 
                  onClick={() => downloadGeneratedReport('html')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download HTML Report
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4 pt-4">
          <AdvancedReportOptions 
            scanResults={scanResults}
            onGenerateReport={handleGenerateReport}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-6 pt-4">
          <SavedTemplates 
            useTemplate={() => {}} 
            createTemplate={() => {}}
          />
          <ReportTemplates 
            reportTemplate=""
            setReportTemplate={() => {}}
          />
          <ReportHistory 
            reportHistory={[]}
            downloadReport={() => {}}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportGenerator;
