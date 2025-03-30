
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
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, CheckCircle2, FileImage, FileBadge, Clipboard, Clock, Shield, User } from "lucide-react";

interface ReportGeneratorProps {
  scanResults: any;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ scanResults }) => {
  const [reportFormat, setReportFormat] = useState('pdf');
  const [reportTemplate, setReportTemplate] = useState('detailed');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const [sections, setSections] = useState({
    executiveSummary: true,
    vulnerabilityDetails: true,
    remediation: true,
    screenshots: true,
    appendices: true,
    methodology: true,
  });

  const handleSectionChange = (section: string, checked: boolean) => {
    setSections({ ...sections, [section]: checked });
  };
  
  const generateReport = () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      
      toast({
        title: "Report Generated",
        description: `Your ${reportFormat.toUpperCase()} report has been generated successfully.`,
      });
    }, 3000);
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
          <Tabs defaultValue="standard" className="space-y-4">
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
                      defaultValue={`Vulnerability Scan Report - ${scanResults?.summary?.url || 'Target Website'}`}
                    />
                  </div>
                  
                  <div>
                    <Label>Report Format</Label>
                    <RadioGroup defaultValue="pdf" className="mt-2 flex gap-4" onValueChange={setReportFormat}>
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
                    <Select defaultValue="detailed" onValueChange={setReportTemplate}>
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
          <Button variant="outline">Cancel</Button>
          <Button onClick={generateReport} disabled={isGenerating} className="gap-2">
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
                  <tr className="border-b bg-card">
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>Security Assessment Report - {scanResults?.summary?.url || 'Example.com'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">Oct 15, 2023 09:45 AM</td>
                    <td className="px-6 py-4">
                      <Badge>PDF</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b bg-card">
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>Bug Bounty Report - Critical XSS</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">Oct 10, 2023 02:15 PM</td>
                    <td className="px-6 py-4">
                      <Badge>HTML</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      </div>
                    </td>
                  </tr>
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
                <Button variant="outline" size="sm">Use</Button>
              </div>
              
              <div className="rounded-md border p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-scanner-primary" />
                  <div>
                    <p className="font-medium text-sm">PCI Compliance</p>
                    <p className="text-xs text-muted-foreground">PCI DSS control mappings</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Use</Button>
              </div>
              
              <div className="rounded-md border p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-scanner-primary" />
                  <div>
                    <p className="font-medium text-sm">My Custom Template</p>
                    <p className="text-xs text-muted-foreground">Last edited: 3 days ago</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Use</Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Create Template</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ReportGenerator;
