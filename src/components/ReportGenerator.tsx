
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, CheckCircle2, FileImage, FileBadge, Clipboard, Clock, Shield, User, AlertCircle } from "lucide-react";
import { ScanResults } from '@/utils/scanEngine';
import { generatePdfReport, generateHtmlReport, generateCsvReport } from '@/utils/reportGenerator';

interface ReportGeneratorProps {
  scanResults: ScanResults;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ scanResults }) => {
  const [reportTitle, setReportTitle] = useState(`Vulnerability Scan Report - ${scanResults?.summary?.url || 'Target Website'}`);
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
      
      const newReport = {
        name: reportTitle,
        date: new Date().toLocaleString(),
        format: reportFormat.toUpperCase(),
        data: reportData
      };
      
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

  const downloadBlob = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const useTemplate = (templateName: string) => {
    switch (templateName) {
      case 'HackerOne Template':
        setReportTemplate('bugbounty');
        setActiveTab('standard');
        setSections({
          ...sections,
          executiveSummary: true,
          vulnerabilityDetails: true,
          remediation: true,
          screenshots: true,
          methodology: false,
          appendices: false
        });
        break;
      case 'PCI Compliance':
        setReportTemplate('compliance');
        setActiveTab('standard');
        setSections({
          ...sections,
          executiveSummary: true,
          vulnerabilityDetails: true,
          remediation: true,
          screenshots: true,
          methodology: true,
          appendices: true
        });
        break;
      case 'My Custom Template':
        setReportTemplate('detailed');
        setActiveTab('standard');
        break;
      default:
        break;
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

  const renderScreenshotPlaceholder = () => {
    if (!scanResults?.vulnerabilities || scanResults.vulnerabilities.length === 0) {
      return (
        <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground">
          No vulnerability screenshots available
        </div>
      );
    }

    const hasScreenshots = scanResults.vulnerabilities.some(v => v.screenshot);
    
    if (!hasScreenshots) {
      return (
        <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4" />
          No screenshots available for the detected vulnerabilities
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 gap-4">
        {scanResults.vulnerabilities.map((vuln, idx) => 
          vuln.screenshot && (
            <div key={idx} className="border rounded-md overflow-hidden">
              <img 
                src={vuln.screenshot} 
                alt={`Screenshot of ${vuln.name || 'vulnerability'}`}
                className="w-full h-auto object-contain"
              />
              <div className="p-2 bg-background text-xs">
                {vuln.name || `Vulnerability #${idx+1}`}
              </div>
            </div>
          )
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <FileText className="h-6 w-6 text-scanner-primary" />
            Generate Vulnerability Report
          </CardTitle>
          <CardDescription>
            Create a detailed report for your bug bounty submissions or security documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="standard" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="standard">Standard Report</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
              <TabsTrigger value="templates">Report Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="standard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reportTitle">Report Title</Label>
                    <Input
                      id="reportTitle"
                      placeholder="Security Assessment Report"
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label>Report Format</Label>
                    <RadioGroup 
                      value={reportFormat} 
                      onValueChange={setReportFormat} 
                      className="mt-2 flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pdf" id="pdf" />
                        <Label htmlFor="pdf" className="cursor-pointer">PDF</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="html" id="html" />
                        <Label htmlFor="html" className="cursor-pointer">HTML</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="markdown" id="markdown" />
                        <Label htmlFor="markdown" className="cursor-pointer">Markdown</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label>Report Template</Label>
                    <Select value={reportTemplate} onValueChange={setReportTemplate}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="detailed">Detailed Technical Report</SelectItem>
                        <SelectItem value="executive">Executive Summary</SelectItem>
                        <SelectItem value="compliance">Compliance Focused</SelectItem>
                        <SelectItem value="bugbounty">Bug Bounty Submission</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Include Sections</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="executiveSummary" 
                        checked={sections.executiveSummary}
                        onCheckedChange={(checked) => handleSectionChange('executiveSummary', checked as boolean)}
                      />
                      <Label htmlFor="executiveSummary" className="cursor-pointer flex items-center gap-2">
                        <FileBadge className="h-4 w-4 text-scanner-primary" />
                        Executive Summary
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="vulnerabilityDetails" 
                        checked={sections.vulnerabilityDetails}
                        onCheckedChange={(checked) => handleSectionChange('vulnerabilityDetails', checked as boolean)}
                      />
                      <Label htmlFor="vulnerabilityDetails" className="cursor-pointer flex items-center gap-2">
                        <Shield className="h-4 w-4 text-scanner-primary" />
                        Vulnerability Details
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remediation" 
                        checked={sections.remediation}
                        onCheckedChange={(checked) => handleSectionChange('remediation', checked as boolean)}
                      />
                      <Label htmlFor="remediation" className="cursor-pointer flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-scanner-primary" />
                        Remediation Steps
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="screenshots" 
                        checked={sections.screenshots}
                        onCheckedChange={(checked) => handleSectionChange('screenshots', checked as boolean)}
                      />
                      <Label htmlFor="screenshots" className="cursor-pointer flex items-center gap-2">
                        <FileImage className="h-4 w-4 text-scanner-primary" />
                        Screenshots & Evidence
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="methodology" 
                        checked={sections.methodology}
                        onCheckedChange={(checked) => handleSectionChange('methodology', checked as boolean)}
                      />
                      <Label htmlFor="methodology" className="cursor-pointer flex items-center gap-2">
                        <Clipboard className="h-4 w-4 text-scanner-primary" />
                        Testing Methodology
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="appendices" 
                        checked={sections.appendices}
                        onCheckedChange={(checked) => handleSectionChange('appendices', checked as boolean)}
                      />
                      <Label htmlFor="appendices" className="cursor-pointer flex items-center gap-2">
                        <FileText className="h-4 w-4 text-scanner-primary" />
                        Technical Appendices
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="author">Report Author</Label>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="h-10 w-10 rounded-full bg-scanner-primary/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-scanner-primary" />
                      </div>
                      <Input
                        id="author"
                        placeholder="Your Name"
                        defaultValue="Security Researcher"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="Company Name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="companyLogo">Company Logo URL</Label>
                    <Input
                      id="companyLogo"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customCSS">Custom CSS (for HTML reports)</Label>
                    <textarea
                      id="customCSS"
                      className="w-full h-32 p-3 rounded-md border bg-background text-sm font-mono"
                      placeholder="/* Add your custom CSS here */"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="includeRawData" />
                    <Label htmlFor="includeRawData" className="cursor-pointer">
                      Include raw scan data in appendix
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="watermark" defaultChecked />
                    <Label htmlFor="watermark" className="cursor-pointer">
                      Add "Confidential" watermark
                    </Label>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Additional Notes</Label>
                <textarea
                  className="w-full h-24 p-3 mt-2 rounded-md border bg-background"
                  placeholder="Add any additional notes or context for the report..."
                />
              </div>
            </TabsContent>
            
            <TabsContent value="templates" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={`border-2 cursor-pointer hover:bg-card/60 transition-colors ${reportTemplate === 'detailed' ? 'border-scanner-primary' : 'border-transparent'}`}
                  onClick={() => setReportTemplate('detailed')}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-scanner-primary" />
                        <h3 className="font-medium">Detailed Technical Report</h3>
                      </div>
                      {reportTemplate === 'detailed' && (
                        <CheckCircle2 className="h-5 w-5 text-scanner-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive technical report with detailed vulnerability information, evidence, and remediation steps.
                    </p>
                    <div className="mt-4 flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      ~20-30 pages
                    </div>
                  </CardContent>
                </Card>
                
                <Card className={`border-2 cursor-pointer hover:bg-card/60 transition-colors ${reportTemplate === 'executive' ? 'border-scanner-primary' : 'border-transparent'}`}
                  onClick={() => setReportTemplate('executive')}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <FileBadge className="h-5 w-5 text-scanner-primary" />
                        <h3 className="font-medium">Executive Summary</h3>
                      </div>
                      {reportTemplate === 'executive' && (
                        <CheckCircle2 className="h-5 w-5 text-scanner-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      High-level summary focused on business impact, risk assessment, and key findings.
                    </p>
                    <div className="mt-4 flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      ~5-10 pages
                    </div>
                  </CardContent>
                </Card>
                
                <Card className={`border-2 cursor-pointer hover:bg-card/60 transition-colors ${reportTemplate === 'compliance' ? 'border-scanner-primary' : 'border-transparent'}`}
                  onClick={() => setReportTemplate('compliance')}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <Clipboard className="h-5 w-5 text-scanner-primary" />
                        <h3 className="font-medium">Compliance Focused</h3>
                      </div>
                      {reportTemplate === 'compliance' && (
                        <CheckCircle2 className="h-5 w-5 text-scanner-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Report structured around compliance frameworks (OWASP, NIST, ISO) with control mappings.
                    </p>
                    <div className="mt-4 flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      ~15-25 pages
                    </div>
                  </CardContent>
                </Card>
                
                <Card className={`border-2 cursor-pointer hover:bg-card/60 transition-colors ${reportTemplate === 'bugbounty' ? 'border-scanner-primary' : 'border-transparent'}`}
                  onClick={() => setReportTemplate('bugbounty')}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-scanner-primary" />
                        <h3 className="font-medium">Bug Bounty Submission</h3>
                      </div>
                      {reportTemplate === 'bugbounty' && (
                        <CheckCircle2 className="h-5 w-5 text-scanner-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Concise report focused on reproducible steps, evidence, and impact for bug bounty programs.
                    </p>
                    <div className="mt-4 flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      ~3-5 pages
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Preview</h3>
                <div className="border rounded-md p-4 bg-muted/30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Vulnerability Report - Example.com</h3>
                    <Badge variant="outline">CONFIDENTIAL</Badge>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-muted-foreground">Generated: {new Date().toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Target: {scanResults?.summary?.url || 'example.com'}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium">Executive Summary</h4>
                      <div className="h-4 w-1/2 bg-muted rounded mt-2"></div>
                      <div className="h-4 w-3/4 bg-muted rounded mt-1"></div>
                      <div className="h-4 w-2/3 bg-muted rounded mt-1"></div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium">Vulnerability Details</h4>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="h-8 bg-muted rounded"></div>
                        <div className="h-8 bg-muted rounded"></div>
                        <div className="h-8 bg-muted rounded"></div>
                      </div>
                      <div className="h-4 w-full bg-muted rounded mt-2"></div>
                      <div className="h-4 w-full bg-muted rounded mt-1"></div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium">Screenshots</h4>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="h-16 bg-muted rounded"></div>
                        <div className="h-16 bg-muted rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
      
      {showErrorToast && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-md shadow-lg z-50 max-w-md animate-in slide-in-from-right-10 fade-in-20">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">Download Failed</h3>
              <p className="text-sm">
                There was an error generating the PDF report. This may be due to issues with jsPDF AutoTable or missing screenshots. 
                Try a different format or check the console for more details.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Previous Reports</CardTitle>
            <CardDescription>Reports you've generated for this target</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted">
                  <tr>
                    <th scope="col" className="px-6 py-3">Report Name</th>
                    <th scope="col" className="px-6 py-3">Generated</th>
                    <th scope="col" className="px-6 py-3">Format</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportHistory.map((report, index) => (
                    <tr key={index} className="border-b bg-card">
                      <td className="px-6 py-4 font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{report.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{report.date}</td>
                      <td className="px-6 py-4">
                        <Badge>{report.format}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="download" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => downloadReport(report)}
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Report Templates</CardTitle>
            <CardDescription>Custom and shared templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md border p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-scanner-primary" />
                  <div>
                    <p className="font-medium text-sm">HackerOne Template</p>
                    <p className="text-xs text-muted-foreground">Optimized for H1 submissions</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => useTemplate('HackerOne Template')}
                >
                  Use
                </Button>
              </div>
              
              <div className="rounded-md border p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-scanner-primary" />
                  <div>
                    <p className="font-medium text-sm">PCI Compliance</p>
                    <p className="text-xs text-muted-foreground">PCI DSS control mappings</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => useTemplate('PCI Compliance')}
                >
                  Use
                </Button>
              </div>
              
              <div className="rounded-md border p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-scanner-primary" />
                  <div>
                    <p className="font-medium text-sm">My Custom Template</p>
                    <p className="text-xs text-muted-foreground">Last edited: 3 days ago</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => useTemplate('My Custom Template')}
                >
                  Use
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={createTemplate}
            >
              Create Template
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ReportGenerator;
