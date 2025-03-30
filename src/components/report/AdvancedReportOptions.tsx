
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "lucide-react";

const AdvancedReportOptions: React.FC = () => {
  return (
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
      
      <div className="md:col-span-2">
        <Label>Additional Notes</Label>
        <textarea
          className="w-full h-24 p-3 mt-2 rounded-md border bg-background"
          placeholder="Add any additional notes or context for the report..."
        />
      </div>
    </div>
  );
};

export default AdvancedReportOptions;
