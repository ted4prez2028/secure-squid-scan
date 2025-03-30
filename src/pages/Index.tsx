
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, FileType, PieChart, AlertTriangle, Zap, Book, Download, ServerCog, Bug, Database, FileSearch } from "lucide-react";
import EnhancedScanConfigurationForm from "@/components/EnhancedScanConfigurationForm";
import ScanResults from "@/components/ScanResults";
import Dashboard from "@/components/Dashboard";
import ReportGenerator from "@/components/ReportGenerator";
import { performScan, ScanConfig, ScanResults as ScanResultsType } from "@/utils/scanEngine";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResultsType | null>(null);
  const [lastScanConfig, setLastScanConfig] = useState<ScanConfig | undefined>(undefined);
  const { toast } = useToast();

  const startScan = async (config: ScanConfig) => {
    setIsScanning(true);
    setLastScanConfig(config);
    
    toast({
      title: "Scan Started",
      description: "Vulnerability scan has been initiated. This may take a few minutes.",
    });
    
    try {
      // Use the new scan engine instead of setTimeout
      const results = await performScan(config);
      
      setScanResults(results);
      setIsScanning(false);
      setActiveTab("results");
      
      toast({
        title: "Scan Complete",
        description: `Found ${results.summary.total} vulnerabilities.`,
      });
    } catch (error) {
      setIsScanning(false);
      
      toast({
        title: "Scan Error",
        description: "An error occurred during the vulnerability scan.",
        variant: "destructive",
      });
      
      console.error("Scan error:", error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <header className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <Shield className="h-10 w-10 text-scanner-primary" />
          <h1 className="text-4xl font-bold tracking-tight gradient-text">OWASP Vulnerability Scanner</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Advanced web application security testing platform with automated vulnerability detection and comprehensive reporting
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="scan" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            <span>New Scan</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Results</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileSearch className="h-4 w-4" />
            <span>Reports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <Dashboard scanResults={scanResults} startNewScan={() => setActiveTab("scan")} />
        </TabsContent>

        <TabsContent value="scan" className="space-y-6">
          <EnhancedScanConfigurationForm onStartScan={startScan} isScanning={isScanning} lastScanConfig={lastScanConfig} />
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {scanResults ? (
            <ScanResults results={scanResults} />
          ) : (
            <Card className="border-dashed text-center py-12">
              <CardContent>
                <div className="flex flex-col items-center gap-2">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium">No Scan Results</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-4">
                    You haven't performed any scans yet. Start a new scan to detect vulnerabilities.
                  </p>
                  <Button onClick={() => setActiveTab("scan")}>Start New Scan</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {scanResults ? (
            <ReportGenerator scanResults={scanResults} />
          ) : (
            <Card className="border-dashed text-center py-12">
              <CardContent>
                <div className="flex flex-col items-center gap-2">
                  <FileType className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium">No Reports Available</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-4">
                    Complete a vulnerability scan first to generate detailed PDF reports.
                  </p>
                  <Button onClick={() => setActiveTab("scan")}>Start New Scan</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Book className="h-4 w-4" />
          <span>Based on OWASP Top 10 vulnerability testing methodology</span>
        </div>
        <p>© {new Date().getFullYear()} OWASP Vulnerability Scanner</p>
      </footer>
    </div>
  );
};

export default Index;
