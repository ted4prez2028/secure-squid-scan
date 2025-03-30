
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReportHeaderProps {
  title: string;
  setTitle: (title: string) => void;
  subtitle: string;
  setSubtitle: (subtitle: string) => void;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ 
  title, 
  setTitle, 
  subtitle, 
  setSubtitle 
}) => {
  return (
    <CardHeader>
      <CardTitle className="text-2xl flex items-center gap-2">
        <FileText className="h-6 w-6 text-scanner-primary" />
        Generate Vulnerability Report
      </CardTitle>
      <CardDescription>
        Create a detailed report for your bug bounty submissions or security documentation
      </CardDescription>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <Label htmlFor="reportTitle">Report Title</Label>
          <Input
            id="reportTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="reportSubtitle">Report Subtitle</Label>
          <Input
            id="reportSubtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
    </CardHeader>
  );
};

export default ReportHeader;
