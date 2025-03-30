import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Shield, Database, Download, FileText, ArrowRight, Bug, BarChart } from "lucide-react";
import { motion } from "framer-motion";
import ReportGenerator from "@/components/report";
import ScanConfigurationForm from "@/components/ScanConfigurationForm";
import EnhancedScanConfigurationForm from "@/components/EnhancedScanConfigurationForm";
import ScanResults from "@/components/ScanResults";
import { startScan, getScanResults } from "@/utils/scanner/mockScanner";
import { useToast } from "@/hooks/use-toast";
import { ScanResults as ScanResultsType } from "@/utils/scanner/types";

// Make sure jspdf-autotable is imported at the application level
import 'jspdf-autotable';

const Index = () => {
  const [activeTab, setActiveTab] = useState("scan");
  const [scanning, setScanning] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResultsType | null>(null);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [targetUrl, setTargetUrl] = useState("https://example.com");
  const [scanOptions, setScanOptions] = useState({
    crawlDepth: 2,
    maxPages: 10,
    excludeUrls: [],
    scanMode: "passive",
    scanSpeed: "medium"
  });
  const { toast } = useToast();

  const handleScanButtonClick = async () => {
    setScanning(true);
    setScanCompleted(false);
    
    try {
      toast({
        title: "Scan Started",
        description: `Scanning ${targetUrl} in ${scanOptions.scanMode} mode...`,
      });
      
      const scanId = await startScan({
        url: targetUrl,
        options: scanOptions
      });
      
      // Simulate scan progress
      setTimeout(async () => {
        try {
          const results = await getScanResults(scanId);
          setScanResults(results);
          setScanCompleted(true);
          
          toast({
            title: "Scan Completed",
            description: `Found ${results.summary.total} vulnerabilities.`,
          });
        } catch (error) {
          console.error(error);
          toast({
            variant: "destructive",
            title: "Scan Failed",
            description: "An error occurred while retrieving scan results.",
          });
        } finally {
          setScanning(false);
        }
      }, 5000);
    } catch (error) {
      setScanning(false);
      console.error(error);
      toast({
        variant: "destructive",
        title: "Scan Failed",
        description: "An error occurred while starting the scan.",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">OWASP Vulnerability Scanner</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Detect and analyze web application security vulnerabilities
          </p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Button variant="outline" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Saved Scans</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid grid-cols-3 w-full max-w-3xl mx-auto">
          <TabsTrigger value="scan" className="text-base py-3">
            <Bug className="h-4 w-4 mr-2" />
            Scan
          </TabsTrigger>
          <TabsTrigger value="results" className="text-base py-3">
            <Shield className="h-4 w-4 mr-2" />
            Results
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-base py-3">
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              {!advancedMode ? (
                <ScanConfigurationForm
                  targetUrl={targetUrl}
                  setTargetUrl={setTargetUrl}
                  scanOptions={scanOptions}
                  setScanOptions={setScanOptions}
                  onStartScan={handleScanButtonClick}
                  onAdvancedModeToggle={() => setAdvancedMode(true)}
                  scanning={scanning}
                />
              ) : (
                <EnhancedScanConfigurationForm
                  targetUrl={targetUrl}
                  setTargetUrl={setTargetUrl}
                  scanOptions={scanOptions}
                  setScanOptions={setScanOptions}
                  onStartScan={handleScanButtonClick}
                  onSimpleModeToggle={() => setAdvancedMode(false)}
                  scanning={scanning}
                />
              )}
            </CardContent>
          </Card>
          
          {scanning && (
            <div className="text-center py-10">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  ></motion.div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-1">Scanning {targetUrl}</h3>
                  <p className="text-muted-foreground">
                    This may take a few minutes depending on the target and scan depth
                  </p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-8">
          {scanCompleted && scanResults ? (
            <ScanResults results={scanResults} />
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <BarChart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No Scan Results Available</h3>
              <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                Complete a vulnerability scan first to view detailed results and analysis.
              </p>
              <Button onClick={() => setActiveTab("scan")} variant="purple" className="gap-2">
                <Bug className="mr-2 h-4 w-4" />
                Start Scan
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-8">
          {scanCompleted && scanResults ? (
            <ReportGenerator scanResults={scanResults} />
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No Reports Available</h3>
              <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                Complete a vulnerability scan first to generate detailed PDF reports.
              </p>
              <Button onClick={() => setActiveTab("scan")} variant="purple">
                <Bug className="mr-2 h-4 w-4" />
                Start New Scan
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
