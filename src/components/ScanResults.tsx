import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle, ShieldAlert, ShieldCheck, Clock, AlertCircle, Search, ArrowUpRight, FileText, Download, Server, Shield, Database, FileCode } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { toast } from "sonner";

import placeholderScreenshot1 from '../assets/placeholder-screenshot-1.jpg';
import placeholderScreenshot2 from '../assets/placeholder-screenshot-2.jpg';

interface ScanResultsProps {
  results: any;
}

const SeverityBadge = ({ severity }: { severity: string }) => {
  const severityMap: Record<string, { color: string, icon: React.ReactNode }> = {
    critical: { color: "bg-red-600/20 text-red-600 border-red-600/50", icon: <Shield className="h-3 w-3" /> },
    high: { color: "bg-red-500/20 text-red-500 border-red-500/50", icon: <AlertTriangle className="h-3 w-3" /> },
    medium: { color: "bg-amber-500/20 text-amber-500 border-amber-500/50", icon: <AlertCircle className="h-3 w-3" /> },
    low: { color: "bg-green-500/20 text-green-500 border-green-500/50", icon: <ShieldCheck className="h-3 w-3" /> },
    info: { color: "bg-blue-500/20 text-blue-500 border-blue-500/50", icon: <Search className="h-3 w-3" /> },
  };

  const { color, icon } = severityMap[severity] || severityMap.info;

  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${color}`}>
      {icon}
      <span className="capitalize">{severity}</span>
    </Badge>
  );
};

const CodeBlock = ({ code }: { code: string }) => {
  return (
    <div className="code-block mt-2 mb-4 text-sm bg-slate-950 text-slate-50 p-3 rounded-md overflow-x-auto">
      <pre className="whitespace-pre-wrap">{code}</pre>
    </div>
  );
};

const ScanResults: React.FC<ScanResultsProps> = ({ results }) => {
  const [selectedVuln, setSelectedVuln] = useState<number | null>(null);
  const [activeVulnerabilitiesTab, setActiveVulnerabilitiesTab] = useState("all");
  const [filteredVulnerabilities, setFilteredVulnerabilities] = useState<any[]>([]);

  useEffect(() => {
    if (!results?.vulnerabilities) return;

    if (activeVulnerabilitiesTab === "all") {
      setFilteredVulnerabilities(results.vulnerabilities);
    } else {
      setFilteredVulnerabilities(
        results.vulnerabilities.filter((v: any) => v.severity === activeVulnerabilitiesTab)
      );
    }
  }, [activeVulnerabilitiesTab, results]);

  useEffect(() => {
    if (filteredVulnerabilities.length > 0 && selectedVuln === null) {
      setSelectedVuln(filteredVulnerabilities[0].id);
    }
  }, [filteredVulnerabilities, selectedVuln]);

  if (!results) {
    return (
      <Card className="w-full border-dashed">
        <CardContent className="pt-6">
          <div className="text-center p-6">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No Scan Results Available</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Start a new scan to see vulnerability results here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: 'Critical', value: results.summary.critical || 0, color: '#DC2626' },
    { name: 'High', value: results.summary.high || 0, color: '#FF5252' },
    { name: 'Medium', value: results.summary.medium || 0, color: '#FFB74D' },
    { name: 'Low', value: results.summary.low || 0, color: '#4CAF50' },
  ];

  const getVulnerabilityScreenshot = (vuln: any) => {
    if (vuln && vuln.screenshot) {
      return vuln.screenshot;
    }
    const placeholders = [placeholderScreenshot1, placeholderScreenshot2];
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  };

  const getVulnerabilityIcon = (type: string) => {
    if (type.toLowerCase().includes('xss')) return <Shield className="h-4 w-4" />;
    if (type.toLowerCase().includes('sql')) return <Database className="h-4 w-4" />;
    if (type.toLowerCase().includes('csrf')) return <ShieldCheck className="h-4 w-4" />;
    if (type.toLowerCase().includes('header')) return <Server className="h-4 w-4" />;
    if (type.toLowerCase().includes('file')) return <FileCode className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const formatDateTime = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };

  const formatDuration = (ms: number) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-scanner-primary" />
                Vulnerability Scan Results
              </CardTitle>
              <CardDescription>
                Scan completed on {formatDateTime(results.summary.endTime)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Scan Duration: {formatDuration(results.summary.duration)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1">
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => 
                        percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} vulnerabilities`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="col-span-2">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="bg-red-600/10 border-red-600/20">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-red-600">Critical</p>
                        <h4 className="text-2xl font-bold">{results.summary.critical || 0}</h4>
                      </div>
                      <Shield className="h-8 w-8 text-red-600/70" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-red-500/10 border-red-500/20">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-red-500">High</p>
                        <h4 className="text-2xl font-bold">{results.summary.high}</h4>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-500/70" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-amber-500/10 border-amber-500/20">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-amber-500">Medium</p>
                        <h4 className="text-2xl font-bold">{results.summary.medium}</h4>
                      </div>
                      <AlertCircle className="h-8 w-8 text-amber-500/70" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/10 border-green-500/20">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-green-500">Low</p>
                        <h4 className="text-2xl font-bold">{results.summary.low}</h4>
                      </div>
                      <ShieldCheck className="h-8 w-8 text-green-500/70" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card className="border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Target Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">URL</p>
                      <p className="font-medium truncate">{results.summary.url}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Vulnerabilities</p>
                      <p className="font-medium">{results.summary.total} issues found</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Scan Mode</p>
                      <p className="font-medium capitalize">{results.scanConfig?.scanMode || 'Standard'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pages Scanned</p>
                      <p className="font-medium">{results.summary.pagesScanned || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vulnerabilities</CardTitle>
              <CardDescription>
                Found {results.vulnerabilities?.length || 0} security issues
              </CardDescription>
              <Tabs defaultValue="all" value={activeVulnerabilitiesTab} onValueChange={setActiveVulnerabilitiesTab} className="mt-2">
                <TabsList className="grid grid-cols-5 mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="critical">Critical</TabsTrigger>
                  <TabsTrigger value="high">High</TabsTrigger>
                  <TabsTrigger value="medium">Medium</TabsTrigger>
                  <TabsTrigger value="low">Low</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {filteredVulnerabilities.length > 0 ? (
                  filteredVulnerabilities.map((vuln: any) => (
                    <div 
                      key={vuln.id}
                      className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${selectedVuln === vuln.id ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedVuln(vuln.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {getVulnerabilityIcon(vuln.type)}
                          <h3 className="font-medium">{vuln.type}</h3>
                        </div>
                        <SeverityBadge severity={vuln.severity} />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                        {vuln.description}
                      </p>
                      {vuln.parameter && (
                        <div className="text-xs text-muted-foreground">
                          Parameter: <span className="font-mono">{vuln.parameter}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No vulnerabilities found in this category
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedVuln ? (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {getVulnerabilityIcon(results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.type)}
                      {results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.type}
                    </CardTitle>
                    <CardDescription>
                      Detailed vulnerability information
                    </CardDescription>
                  </div>
                  <SeverityBadge severity={results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.severity} />
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details">
                  <TabsList className="mb-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="evidence">Evidence</TabsTrigger>
                    <TabsTrigger value="remediation">Remediation</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.description}
                      </p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">URL</h4>
                        <p className="text-sm font-mono break-all">
                          {results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.url}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Parameter</h4>
                        <p className="text-sm font-mono">
                          {results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.parameter || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">Payload</h4>
                      <CodeBlock code={results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.payload || 'No payload information available'} />
                    </div>

                    <div className="p-4 border rounded-md">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <h4 className="font-medium">CVSS Score & Impact Assessment</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">CVSS Score</p>
                          <p className="font-medium text-amber-500">
                            {results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.cvss || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">CWE ID</p>
                          <p className="font-medium">
                            {results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.cweid || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedVuln && results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.type.toLowerCase().includes('xss') && 
                          "This XSS vulnerability allows attackers to inject client-side scripts into pages viewed by other users, potentially stealing cookies and session information."}
                        {selectedVuln && results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.type.toLowerCase().includes('sql') && 
                          "This SQL injection vulnerability allows attackers to access, modify, or delete data from the database, potentially exposing sensitive user information."}
                        {selectedVuln && results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.type.toLowerCase().includes('csrf') && 
                          "This CSRF vulnerability allows attackers to trick users into performing actions they didn't intend to, potentially changing account settings or making transactions."}
                        {selectedVuln && results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.type.toLowerCase().includes('header') && 
                          "This security header vulnerability could allow various attacks depending on the missing header, such as clickjacking, content sniffing, or SSL downgrade attacks."}
                        {selectedVuln && results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.type.toLowerCase().includes('file') && 
                          "This file upload vulnerability allows attackers to upload malicious files which could lead to remote code execution and complete server compromise."}
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="evidence">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">HTTP Response</h4>
                        <CodeBlock code={results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.evidence || 'No evidence information available'} />
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-1">Screenshot</h4>
                        <div className="mt-2 border rounded-md overflow-hidden">
                          <img 
                            src={getVulnerabilityScreenshot(
                              results.vulnerabilities.find((v: any) => v.id === selectedVuln)
                            )} 
                            alt="Vulnerability screenshot" 
                            className="w-full h-auto object-cover max-h-[500px]"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = placeholderScreenshot1;
                              toast.error("Error loading screenshot", {
                                description: "Using placeholder image instead"
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="remediation">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Remediation Steps</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.remediation}
                        </p>
                        
                        {selectedVuln && results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.type.toLowerCase().includes('xss') && (
                          <div className="mt-4 space-y-2">
                            <h5 className="text-sm font-medium">Implementation Example:</h5>
                            <CodeBlock code={`// Encode output to prevent XSS
const userInput = req.query.search;
const safeOutput = escapeHtml(userInput);

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}`} />
                          </div>
                        )}
                        
                        {selectedVuln && results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.type.toLowerCase().includes('sql') && (
                          <div className="mt-4 space-y-2">
                            <h5 className="text-sm font-medium">Implementation Example:</h5>
                            <CodeBlock code={`// Use parameterized queries
const pool = require('./db');
const userId = req.params.id;

// UNSAFE: 
// const query = \`SELECT * FROM users WHERE id = \${userId}\`;

// SAFE:
const query = 'SELECT * FROM users WHERE id = $1';
const result = await pool.query(query, [userId]);`} />
                          </div>
                        )}
                        
                        {selectedVuln && results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.type.toLowerCase().includes('csrf') && (
                          <div className="mt-4 space-y-2">
                            <h5 className="text-sm font-medium">Implementation Example:</h5>
                            <CodeBlock code={`// Generate CSRF token
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.post('/profile/update', csrfProtection, (req, res) => {
  // Process form with CSRF protection
});

// In your form template
<form action="/profile/update" method="POST">
  <input type="hidden" name="_csrf" value="<%= csrfToken %>">
  <!-- rest of form -->
</form>`} />
                          </div>
                        )}
                        
                        {selectedVuln && results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.type.toLowerCase().includes('header') && (
                          <div className="mt-4 space-y-2">
                            <h5 className="text-sm font-medium">Implementation Example:</h5>
                            <CodeBlock code={`// For Apache, in your httpd.conf or .htaccess:
ServerTokens Prod
ServerSignature Off

// For Nginx, in your nginx.conf:
server_tokens off;

// For Express.js:
const helmet = require('helmet');
app.use(helmet());

// For PHP:
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("Content-Security-Policy: default-src 'self'");`} />
                          </div>
                        )}

                        {selectedVuln && results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.type.toLowerCase().includes('file') && (
                          <div className="mt-4 space-y-2">
                            <h5 className="text-sm font-medium">Implementation Example:</h5>
                            <CodeBlock code={`// Example file upload validation in Node.js
const multer = require('multer');
const path = require('path');

// Define allowed file types
const fileFilter = (req, file, cb) => {
  // Check MIME type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('File type not allowed'), false);
  }
  
  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExt = ['.jpg', '.jpeg', '.png', '.gif'];
  if (!allowedExt.includes(ext)) {
    return cb(new Error('File extension not allowed'), false);
  }
  
  cb(null, true);
};

// Verify file content
const upload = multer({
  storage: multer.diskStorage({
    destination: 'safe/upload/path/with/no/execute/permission',
    filename: (req, file, cb) => {
      // Create safe filename
      const safeFilename = Date.now() + '-' + 
        path.basename(file.originalname).replace(/[^a-z0-9.]/gi, '_');
      cb(null, safeFilename);
    }
  }),
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

app.post('/upload', upload.single('file'), (req, res) => {
  // Handle successful upload
});`} />
                          </div>
                        )}
                      </div>

                      <div className="p-4 border rounded-md bg-card">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-scanner-primary" />
                          References
                        </h4>
                        <ul className="space-y-2">
                          {selectedVuln && results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.type.toLowerCase().includes('xss') && (
                            <>
                              <li>
                                <a href="https://owasp.org/www-community/attacks/xss/" target="_blank" rel="noopener noreferrer" className="text-sm text-scanner-primary hover:underline flex items-center gap-1">
                                  OWASP XSS Prevention Cheat Sheet <ArrowUpRight className="h-3 w-3" />
                                </a>
                              </li>
                              <li>
                                <a href="https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" target="_blank" rel="noopener noreferrer" className="text-sm text-scanner-primary hover:underline flex items-center gap-1">
                                  OWASP XSS Prevention Cheat Sheet <ArrowUpRight className="h-3 w-3" />
                                </a>
                              </li>
                            </>
                          )}
                          {selectedVuln && results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.type.toLowerCase().includes('sql') && (
                            <>
                              <li>
                                <a href="https://owasp.org/www-community/attacks/SQL_Injection" target="_blank" rel="noopener noreferrer" className="text-sm text-scanner-primary hover:underline flex items-center gap-1">
                                  OWASP SQL Injection <ArrowUpRight className="h-3 w-3" />
                                </a>
                              </li>
                              <li>
                                <a href="https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html" target="_blank" rel="noopener noreferrer" className="text-sm text-scanner-primary hover:underline flex items-center gap-1">
                                  SQL Injection Prevention Cheat Sheet <ArrowUpRight className="h-3 w-3" />
                                </a>
                              </li>
                            </>
                          )}
                          {selectedVuln && results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.type.toLowerCase().includes('csrf') && (
                            <>
                              <li>
                                <a href="https://owasp.org/www-community/attacks/csrf" target="_blank" rel="noopener noreferrer" className="text-sm text-scanner-primary hover:underline flex items-center gap-1">
                                  OWASP CSRF <ArrowUpRight className="h-3 w-3" />
                                </a>
                              </li>
                              <li>
                                <a href="https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html" target="_blank" rel="noopener noreferrer" className="text-sm text-scanner-primary hover:underline flex items-center gap-1">
                                  CSRF Prevention Cheat Sheet <ArrowUpRight className="h-3 w-3" />
                                </a>
                              </li>
                            </>
                          )}
                          {selectedVuln && results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.type.toLowerCase().includes('header') && (
                            <>
                              <li>
                                <a href="https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/01-Information_Gathering/08-Fingerprint_Web_Application_Framework" target="_blank" rel="noopener noreferrer" className="text-sm text-scanner-primary hover:underline flex items-center gap-1">
                                  OWASP Information Leakage <ArrowUpRight className="h-3 w-3" />
                                </a>
                              </li>
                              <li>
                                <a href="https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html" target="_blank" rel="noopener noreferrer" className="text-sm text-scanner-primary hover:underline flex items-center gap-1">
                                  Error Handling Cheat Sheet <ArrowUpRight className="h-3 w-3" />
                                </a>
                              </li>
                            </>
                          )}
                          {selectedVuln && results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.type.toLowerCase().includes('file') && (
                            <>
                              <li>
                                <a href="https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload" target="_blank" rel="noopener noreferrer" className="text-sm text-scanner-primary hover:underline flex items-center gap-1">
                                  OWASP Unrestricted File Upload <ArrowUpRight className="h-3 w-3" />
                                </a>
                              </li>
                              <li>
                                <a href="https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html" target="_blank" rel="noopener noreferrer" className="text-sm text-scanner-primary hover:underline flex items-center gap-1">
                                  File Upload Cheat Sheet <ArrowUpRight className="h-3 w-3" />
                                </a>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <FileText className="h-4 w-4" />
                  Export Finding
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-dashed h-full flex items-center justify-center">
              <CardContent className="text-center py-10">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Vulnerability Selected</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                  Select a vulnerability from the list on the left to view detailed information
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Export Full Report
        </Button>
      </div>
    </div>
  );
};

export default ScanResults;
