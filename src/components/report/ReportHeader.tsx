
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";

const ReportHeader: React.FC = () => {
  return (
    <CardHeader>
      <CardTitle className="text-2xl flex items-center gap-2">
        <FileText className="h-6 w-6 text-scanner-primary" />
        Generate Vulnerability Report
      </CardTitle>
      <CardDescription>
        Create a detailed report for your bug bounty submissions or security documentation
      </CardDescription>
    </CardHeader>
  );
};

export default ReportHeader;
