
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScanResults } from "@/utils/reports/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AdvancedReportOptionsProps {
  scanResults: ScanResults;
  onGenerateReport: (reportType: 'pdf' | 'html' | 'csv') => void;
  isLoading: boolean;
}

const AdvancedReportOptions: React.FC<AdvancedReportOptionsProps> = ({ 
  scanResults,
  onGenerateReport,
  isLoading
}) => {
  const [reportFormat, setReportFormat] = useState<'pdf' | 'html' | 'csv'>('pdf');
  const [author, setAuthor] = useState("Security Researcher");
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [customCSS, setCustomCSS] = useState("");
  const [includeRawData, setIncludeRawData] = useState(false);
  const [watermark, setWatermark] = useState(true);
  const [notes, setNotes] = useState("");

  return (
    <div className="space-y-6">
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
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="companyLogo">Company Logo URL</Label>
            <Input
              id="companyLogo"
              placeholder="https://example.com/logo.png"
              value={companyLogo}
              onChange={(e) => setCompanyLogo(e.target.value)}
            />
          </div>
          
          <div>
            <Label>Report Format</Label>
            <RadioGroup 
              value={reportFormat} 
              onValueChange={(value: 'pdf' | 'html' | 'csv') => setReportFormat(value)} 
              className="mt-2 flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="advanced-pdf" />
                <Label htmlFor="advanced-pdf" className="cursor-pointer">PDF</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="html" id="advanced-html" />
                <Label htmlFor="advanced-html" className="cursor-pointer">HTML</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="advanced-csv" />
                <Label htmlFor="advanced-csv" className="cursor-pointer">CSV</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="customCSS">Custom CSS (for HTML reports)</Label>
            <textarea
              id="customCSS"
              className="w-full h-32 p-3 rounded-md border bg-background text-sm font-mono"
              placeholder="/* Add your custom CSS here */"
              value={customCSS}
              onChange={(e) => setCustomCSS(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="includeRawData" 
              checked={includeRawData} 
              onCheckedChange={(checked) => setIncludeRawData(checked as boolean)} 
            />
            <Label htmlFor="includeRawData" className="cursor-pointer">
              Include raw scan data in appendix
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="watermark" 
              checked={watermark} 
              onCheckedChange={(checked) => setWatermark(checked as boolean)} 
            />
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
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
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

export default AdvancedReportOptions;
