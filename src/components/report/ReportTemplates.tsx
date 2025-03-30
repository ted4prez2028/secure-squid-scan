
import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, FileBadge, Clipboard, FileText, CheckCircle2, Clock } from "lucide-react";

interface ReportTemplatesProps {
  reportTemplate: string;
  setReportTemplate: (template: string) => void;
  scanResults?: any;
}

const ReportTemplates: React.FC<ReportTemplatesProps> = ({
  reportTemplate,
  setReportTemplate,
  scanResults
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className={`border-2 cursor-pointer hover:bg-card/60 transition-colors ${reportTemplate === 'detailed' ? 'border-scanner-primary' : 'border-transparent'}`}
          onClick={() => setReportTemplate('detailed')}
        >
          <div className="p-4">
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
          </div>
        </Card>
        
        <Card 
          className={`border-2 cursor-pointer hover:bg-card/60 transition-colors ${reportTemplate === 'executive' ? 'border-scanner-primary' : 'border-transparent'}`}
          onClick={() => setReportTemplate('executive')}
        >
          <div className="p-4">
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
          </div>
        </Card>
        
        <Card 
          className={`border-2 cursor-pointer hover:bg-card/60 transition-colors ${reportTemplate === 'compliance' ? 'border-scanner-primary' : 'border-transparent'}`}
          onClick={() => setReportTemplate('compliance')}
        >
          <div className="p-4">
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
          </div>
        </Card>
        
        <Card 
          className={`border-2 cursor-pointer hover:bg-card/60 transition-colors ${reportTemplate === 'bugbounty' ? 'border-scanner-primary' : 'border-transparent'}`}
          onClick={() => setReportTemplate('bugbounty')}
        >
          <div className="p-4">
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
          </div>
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
    </div>
  );
};

export default ReportTemplates;
