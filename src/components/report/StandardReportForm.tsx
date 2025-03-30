
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileImage, FileBadge, CheckCircle2, Clipboard, FileText, Shield } from "lucide-react";

interface StandardReportFormProps {
  reportTitle: string;
  setReportTitle: (title: string) => void;
  reportFormat: string;
  setReportFormat: (format: string) => void;
  reportTemplate: string;
  setReportTemplate: (template: string) => void;
  sections: {
    executiveSummary: boolean;
    vulnerabilityDetails: boolean;
    remediation: boolean;
    screenshots: boolean;
    methodology: boolean;
    appendices: boolean;
  };
  handleSectionChange: (section: string, checked: boolean) => void;
}

const StandardReportForm: React.FC<StandardReportFormProps> = ({
  reportTitle,
  setReportTitle,
  reportFormat,
  setReportFormat,
  reportTemplate,
  setReportTemplate,
  sections,
  handleSectionChange
}) => {
  return (
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
  );
};

export default StandardReportForm;
