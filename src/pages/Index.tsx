
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Shield, FileType, PieChart, AlertTriangle, Bug, FileSearch } from "lucide-react";
import EnhancedScanConfigurationForm from "@/components/EnhancedScanConfigurationForm";
import ScanResults from "@/components/ScanResults";
import Dashboard from "@/components/Dashboard";
import ReportGenerator from "@/components/ReportGenerator";
import { ScanConfig, ScanResults as ScanResultsType } from "@/utils/scanEngine";
import { sendScanRequest, checkScanStatus } from "@/utils/serverApi";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState<ScanResultsType | null>(null);
  const [scanHistory, setScanHistory] = useState<Array<{id: string, url: string, date: string, results: ScanResultsType}>>([]);
  const [lastScanConfig, setLastScanConfig] = useState<ScanConfig | undefined>(undefined);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const { toast } = useToast();

  // Function to check the status of an ongoing scan
  useEffect(() => {
    let statusInterval: NodeJS.Timeout | null = null;
    
    if (isScanning && currentScanId) {
      statusInterval = setInterval(async () => {
        try {
          const statusResponse = await checkScanStatus(currentScanId);
          
          setScanProgress(statusResponse.progress);
          
          if (statusResponse.status === 'completed' && statusResponse.results) {
            clearInterval(statusInterval!);
            setIsScanning(false);
            setScanProgress(100);
            setCurrentScanId(null);
            
            // Add to scan history
            const newScanHistory = [{
              id: statusResponse.results.summary.scanID,
              url: statusResponse.results.summary.url,
              date: new Date().toISOString(),
              results: statusResponse.results
            }, ...scanHistory];
            
            // Limit history to 10 items
            if (newScanHistory.length > 10) {
              newScanHistory.pop();
            }
            
            setScanHistory(newScanHistory);
            setScanResults(statusResponse.results);
            setActiveTab("results");
            
            toast({
              title: "Scan Complete",
              description: `Found ${statusResponse.results.summary.total} vulnerabilities (${statusResponse.results.summary.critical} critical, ${statusResponse.results.summary.high} high).`,
            });
          } else if (statusResponse.status === 'failed') {
            clearInterval(statusInterval!);
            setIsScanning(false);
            setScanProgress(0);
            setCurrentScanId(null);
            
            toast({
              title: "Scan Failed",
              description: statusResponse.error || "An unknown error occurred",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error checking scan status:", error);
        }
      }, 3000); // Check every 3 seconds
    }
    
    return () => {
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, [isScanning, currentScanId, scanHistory, toast]);

  const startScan = async (config: ScanConfig) => {
    setIsScanning(true);
    setScanProgress(0);
    setLastScanConfig(config);
    
    toast({
      title: "Scan Started",
      description: "Vulnerability scan request sent to the server. This may take several minutes.",
    });
    
    try {
      // Send the scan request to your server
      const results = await sendScanRequest(config);
      
      // Set the current scan ID to monitor progress
      setCurrentScanId(results.summary.scanID);
    } catch (error) {
      setIsScanning(false);
      setScanProgress(0);
      
      toast({
        title: "Scan Error",
        description: "An error occurred while starting the scan.",
        variant: "destructive",
      });
      
      console.error("Scan error:", error);
    }
  };

  const viewHistoricalScan = (scanId: string) => {
    const historicalScan = scanHistory.find(scan => scan.id === scanId);
    if (historicalScan) {
      setScanResults(historicalScan.results);
      setActiveTab("results");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <header className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <Shield className="h-10 w-10 text-primary" />
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
            {scanResults && (
              <span className="ml-1.5 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium">
                {scanResults.summary.total}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileSearch className="h-4 w-4" />
            <span>Reports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <Dashboard 
            scanResults={scanResults} 
            startNewScan={() => setActiveTab("scan")} 
            scanHistory={scanHistory}
            viewHistoricalScan={viewHistoricalScan}
          />
        </TabsContent>

        <TabsContent value="scan" className="space-y-6">
          <EnhancedScanConfigurationForm 
            onStartScan={startScan} 
            isScanning={isScanning} 
            scanProgress={scanProgress}
            lastScanConfig={lastScanConfig} 
          />
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
        <p>© {new Date().getFullYear()} OWASP Vulnerability Scanner</p>
        <p className="mt-2">Running in server-side scanning mode</p>
      </footer>
    </div>
  );
};

export default Index;
