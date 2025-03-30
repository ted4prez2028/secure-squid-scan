
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileImage, FileBadge, CheckCircle2, Clipboard, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScanResults } from "@/utils/reports/types";
import { Download } from "lucide-react";

interface StandardReportFormProps {
  scanResults: ScanResults;
  onGenerateReport: (reportType: 'pdf' | 'html' | 'csv') => void;
  isLoading: boolean;
}

const StandardReportForm: React.FC<StandardReportFormProps> = ({
  scanResults,
  onGenerateReport,
  isLoading
}) => {
  const [reportFormat, setReportFormat] = useState<'pdf' | 'html' | 'csv'>('pdf');
  const [reportTemplate, setReportTemplate] = useState('detailed');
  const [sections, setSections] = useState({
    executiveSummary: true,
    vulnerabilityDetails: true,
    remediation: true,
    screenshots: true,
    methodology: true,
    appendices: true,
  });

  const handleSectionChange = (section: string, checked: boolean) => {
    setSections({ ...sections, [section]: checked });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label>Report Format</Label>
            <RadioGroup 
              value={reportFormat} 
              onValueChange={(value: 'pdf' | 'html' | 'csv') => setReportFormat(value)} 
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
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="cursor-pointer">CSV</Label>
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
      
      <div className="flex justify-end">
        <Button 
          variant="purple" 
          onClick={() => onGenerateReport(reportFormat)} 
          disabled={isLoading} 
          className="gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Generate {reportFormat.toUpperCase()} Report
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default StandardReportForm;
