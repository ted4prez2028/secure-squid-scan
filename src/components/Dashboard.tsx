
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Shield, AlertTriangle, CheckCircle2, Zap, Target, FileType, Clock } from "lucide-react";

interface DashboardProps {
  scanResults: any;
  startNewScan: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ scanResults, startNewScan }) => {
  const recentScans = [
    {
      id: 1,
      url: 'https://example.com',
      date: '2023-10-15',
      vulnerabilities: {
        high: 3,
        medium: 5,
        low: 2
      }
    },
    {
      id: 2,
      url: 'https://testsite.org',
      date: '2023-10-12',
      vulnerabilities: {
        high: 1,
        medium: 6,
        low: 8
      }
    },
    {
      id: 3,
      url: 'https://demo-shop.com',
      date: '2023-10-08',
      vulnerabilities: {
        high: 0,
        medium: 2,
        low: 5
      }
    }
  ];

  const mockVulnData = [
    { name: 'XSS', count: 12 },
    { name: 'SQL Injection', count: 8 },
    { name: 'CSRF', count: 6 },
    { name: 'Insecure Headers', count: 15 },
    { name: 'Information Disclosure', count: 9 }
  ];

  const vulnColors = {
    high: '#FF5252',
    medium: '#FFB74D',
    low: '#4CAF50'
  };

  const pieData = [
    { name: 'High', value: 16, color: vulnColors.high },
    { name: 'Medium', value: 24, color: vulnColors.medium },
    { name: 'Low', value: 36, color: vulnColors.low },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-red-500/20 to-red-500/5 border-red-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  High Risk
                </p>
                <h3 className="text-3xl font-bold mt-1">16</h3>
                <p className="text-xs text-muted-foreground mt-1">+3 from last scan</p>
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
                <h3 className="text-3xl font-bold mt-1">24</h3>
                <p className="text-xs text-muted-foreground mt-1">-2 from last scan</p>
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
                <h3 className="text-3xl font-bold mt-1">36</h3>
                <p className="text-xs text-muted-foreground mt-1">+5 from last scan</p>
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
            <CardTitle>Vulnerability Trends</CardTitle>
            <CardDescription>Distribution of vulnerability types across scans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockVulnData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" />
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
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <CardDescription>Your most recent vulnerability scans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th scope="col" className="px-6 py-3">Target URL</th>
                  <th scope="col" className="px-6 py-3">Scan Date</th>
                  <th scope="col" className="px-6 py-3">Vulnerabilities</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map((scan) => (
                  <tr key={scan.id} className="border-b bg-card">
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>{scan.url}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(scan.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500/50">
                          {scan.vulnerabilities.high} High
                        </Badge>
                        <Badge variant="outline" className="bg-amber-500/20 text-amber-500 border-amber-500/50">
                          {scan.vulnerabilities.medium} Med
                        </Badge>
                        <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50">
                          {scan.vulnerabilities.low} Low
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-green-500/20 text-green-500">Completed</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View</Button>
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
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline">View All Scans</Button>
        </CardFooter>
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
