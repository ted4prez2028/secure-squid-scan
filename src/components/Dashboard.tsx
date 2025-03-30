
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Shield, AlertTriangle, CheckCircle2, Zap, Target, FileType, Clock } from "lucide-react";
import { SeverityBadge } from "@/utils/severityBadge";
import { ScanResults } from "@/utils/scanEngine";

interface DashboardProps {
  scanResults: ScanResults | null;
  scanHistory: Array<{id: string, url: string, date: string, results: ScanResults}>;
  startNewScan: () => void;
  viewHistoricalScan: (scanId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  scanResults, 
  scanHistory = [], 
  startNewScan, 
  viewHistoricalScan 
}) => {
  // Prepare data for dashboard based on the most recent scan or history
  const latestScan = scanResults || (scanHistory.length > 0 ? scanHistory[0].results : null);
  
  // Process vulnerability types for the bar chart
  const getVulnTypeData = () => {
    if (!latestScan) return [];
    
    // Count vulnerability occurrences by type
    const vulnTypes: Record<string, number> = {};
    latestScan.vulnerabilities.forEach(vuln => {
      if (vulnTypes[vuln.type]) {
        vulnTypes[vuln.type]++;
      } else {
        vulnTypes[vuln.type] = 1;
      }
    });
    
    // Convert to array format for chart
    return Object.entries(vulnTypes)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Take top 6 for readability
  };
  
  // Process severity distribution for pie chart
  const getSeverityData = () => {
    if (!latestScan) {
      return [
        { name: 'High', value: 0, color: '#FF5252' },
        { name: 'Medium', value: 0, color: '#FFB74D' },
        { name: 'Low', value: 0, color: '#4CAF50' },
      ];
    }
    
    return [
      { name: 'Critical', value: latestScan.summary.critical, color: '#FF5252' },
      { name: 'High', value: latestScan.summary.high, color: '#FF7752' },
      { name: 'Medium', value: latestScan.summary.medium, color: '#FFB74D' },
      { name: 'Low', value: latestScan.summary.low, color: '#4CAF50' },
      { name: 'Info', value: latestScan.summary.info, color: '#2196F3' }
    ].filter(item => item.value > 0); // Only show non-zero values
  };

  const vulnData = getVulnTypeData();
  const pieData = getSeverityData();

  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Security Dashboard</h2>
          <p className="text-muted-foreground">Overview of your security scans and vulnerabilities</p>
        </div>
        <Button onClick={startNewScan} className="shrink-0 gap-2">
          <Zap className="h-4 w-4" />
          Start New Scan
        </Button>
      </header>

      {latestScan ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-red-500/20 to-red-500/5 border-red-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Critical + High Risk
                    </p>
                    <h3 className="text-3xl font-bold mt-1">{latestScan.summary.critical + latestScan.summary.high}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {latestScan.summary.critical > 0 && (
                        <span className="text-red-500">{latestScan.summary.critical} critical</span>
                      )}
                      {latestScan.summary.critical > 0 && latestScan.summary.high > 0 && ", "}
                      {latestScan.summary.high > 0 && (
                        <span className="text-orange-500">{latestScan.summary.high} high</span>
                      )}
                    </p>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="h-7 w-7 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-500 flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      Medium Risk
                    </p>
                    <h3 className="text-3xl font-bold mt-1">{latestScan.summary.medium}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Needs attention
                    </p>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Shield className="h-7 w-7 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-500 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Low Risk
                    </p>
                    <h3 className="text-3xl font-bold mt-1">{latestScan.summary.low + latestScan.summary.info}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {latestScan.summary.low > 0 && (
                        <span>{latestScan.summary.low} low</span>
                      )}
                      {latestScan.summary.low > 0 && latestScan.summary.info > 0 && ", "}
                      {latestScan.summary.info > 0 && (
                        <span>{latestScan.summary.info} info</span>
                      )}
                    </p>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Vulnerability Types</CardTitle>
                <CardDescription>Distribution of vulnerability types in {new URL(latestScan.scanConfig.url).hostname}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {vulnData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={vulnData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 50,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                        <YAxis />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(240, 17%, 20%)', 
                            borderColor: 'hsl(240, 5%, 26%)',
                            color: 'white'
                          }} 
                        />
                        <Legend />
                        <Bar dataKey="count" name="Occurrences" fill="#9b87f5" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No vulnerability data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Severity Breakdown</CardTitle>
                <CardDescription>Distribution by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value} vulnerabilities`, 'Count']}
                          contentStyle={{ 
                            backgroundColor: 'hsl(240, 17%, 20%)', 
                            borderColor: 'hsl(240, 5%, 26%)',
                            color: 'white'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No severity data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="bg-scanner-bg-highlight border-scanner-primary/10">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-full bg-scanner-primary/10">
                <Shield className="h-12 w-12 text-scanner-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">No Scan Data Available</h3>
                <p className="text-muted-foreground max-w-lg">
                  Start your first vulnerability scan to discover security issues in your web application. 
                  The dashboard will display comprehensive analytics once scan data is available.
                </p>
              </div>
              <Button onClick={startNewScan} size="lg" className="mt-2">Start Your First Scan</Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <CardDescription>Your most recent vulnerability scans</CardDescription>
        </CardHeader>
        <CardContent>
          {scanHistory.length > 0 ? (
            <div className="relative overflow-x-auto rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted">
                  <tr>
                    <th scope="col" className="px-6 py-3">Target URL</th>
                    <th scope="col" className="px-6 py-3">Scan Date</th>
                    <th scope="col" className="px-6 py-3">Vulnerabilities</th>
                    <th scope="col" className="px-6 py-3">Scan Type</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scanHistory.map((scan) => (
                    <tr key={scan.id} className="border-b bg-card">
                      <td className="px-6 py-4 font-medium">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span>{new URL(scan.results.scanConfig.url).hostname}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(scan.date)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          <SeverityBadge severity="critical" size="sm" count={scan.results.summary.critical} showCount />
                          <SeverityBadge severity="high" size="sm" count={scan.results.summary.high} showCount />
                          <SeverityBadge severity="medium" size="sm" count={scan.results.summary.medium} showCount />
                          <SeverityBadge severity="low" size="sm" count={scan.results.summary.low + scan.results.summary.info} showCount />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="capitalize bg-scanner-primary/10 text-scanner-primary border-scanner-primary/30">
                          {scan.results.scanConfig.scanMode}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => viewHistoricalScan(scan.id)}>View</Button>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <FileType className="h-3 w-3" />
                            Report
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <div className="mb-4">
                <FileSearch className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              </div>
              <p>No scan history available yet.</p>
              <p className="mt-2">Complete your first scan to see it here.</p>
            </div>
          )}
        </CardContent>
        {scanHistory.length > 0 && (
          <CardFooter className="flex justify-center">
            <Button variant="outline">View All Scans</Button>
          </CardFooter>
        )}
      </Card>
      
      <Card className="bg-scanner-primary/10 border-scanner-primary/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-16 w-full flex justify-center">
              <div className="h-16 w-16 rounded-full bg-scanner-primary/20 flex items-center justify-center">
                <Shield className="h-8 w-8 text-scanner-primary" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold mb-2">Ready to enhance your security posture?</h3>
              <p className="text-muted-foreground mb-4">
                Start a comprehensive scan to identify vulnerabilities in your web applications before attackers do.
              </p>
            </div>
            <div>
              <Button onClick={startNewScan} size="lg" className="gap-2">
                <Zap className="h-4 w-4" />
                Start New Scan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
