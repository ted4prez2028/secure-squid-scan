
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle, ShieldAlert, ShieldCheck, Clock, AlertCircle, Search, ArrowUpRight, FileText, Download } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface ScanResultsProps {
  results: any;
}

const SeverityBadge = ({ severity }: { severity: string }) => {
  const severityMap: Record<string, { color: string, icon: React.ReactNode }> = {
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
    <div className="code-block mt-2 mb-4 text-sm">
      <pre>{code}</pre>
    </div>
  );
};

const ScanResults: React.FC<ScanResultsProps> = ({ results }) => {
  const [selectedVuln, setSelectedVuln] = useState<number | null>(null);

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
    { name: 'High', value: results.summary.high, color: '#FF5252' },
    { name: 'Medium', value: results.summary.medium, color: '#FFB74D' },
    { name: 'Low', value: results.summary.low, color: '#4CAF50' },
  ];

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
                Scan completed on {new Date(results.summary.timestamp).toLocaleString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Scan Duration: {results.summary.scanTime}</span>
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
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="bg-red-500/10 border-red-500/20">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-red-500">High Severity</p>
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
                        <p className="text-sm font-medium text-amber-500">Medium Severity</p>
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
                        <p className="text-sm font-medium text-green-500">Low Severity</p>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">URL</p>
                      <p className="font-medium truncate">{results.summary.url}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Vulnerabilities</p>
                      <p className="font-medium">{results.summary.total} issues found</p>
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
                Found {results.vulnerabilities.length} security issues
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {results.vulnerabilities.map((vuln: any, index: number) => (
                  <div 
                    key={vuln.id}
                    className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${selectedVuln === vuln.id ? 'bg-muted' : ''}`}
                    onClick={() => setSelectedVuln(vuln.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{vuln.type}</h3>
                      <SeverityBadge severity={vuln.severity} />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                      {vuln.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Parameter: <span className="font-mono">{vuln.parameter}</span>
                    </div>
                  </div>
                ))}
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
                    <CardTitle className="text-xl">
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
                          {results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.parameter}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">Payload</h4>
                      <CodeBlock code={results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.payload} />
                    </div>

                    <div className="p-4 border rounded-md">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <h4 className="font-medium">Impact Assessment</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedVuln === 1 && "This XSS vulnerability allows attackers to inject client-side scripts into pages viewed by other users, potentially stealing cookies and session information."}
                        {selectedVuln === 2 && "This SQL injection vulnerability allows attackers to access, modify, or delete data from the database, potentially exposing sensitive user information."}
                        {selectedVuln === 3 && "This CSRF vulnerability allows attackers to trick users into performing actions they didn't intend to, potentially changing account settings or making transactions."}
                        {selectedVuln === 4 && "This information disclosure vulnerability reveals technical details that could be used by attackers for reconnaissance and targeted attacks."}
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="evidence">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">HTTP Response</h4>
                        <CodeBlock code={results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.evidence} />
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-1">Screenshot</h4>
                        <div className="mt-2 border rounded-md overflow-hidden">
                          <img 
                            src={results.vulnerabilities.find((v: any) => v.id === selectedVuln)?.screenshot} 
                            alt="Vulnerability screenshot" 
                            className="w-full h-auto"
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
                        
                        {selectedVuln === 1 && (
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
                        
                        {selectedVuln === 2 && (
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
                        
                        {selectedVuln === 3 && (
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
                        
                        {selectedVuln === 4 && (
                          <div className="mt-4 space-y-2">
                            <h5 className="text-sm font-medium">Implementation Example:</h5>
                            <CodeBlock code={`// For Apache, in your httpd.conf or .htaccess:
ServerTokens Prod
ServerSignature Off

// For Nginx, in your nginx.conf:
server_tokens off;

// In code, use generic error messages:
try {
  // operation that might fail
} catch (error) {
  // Don't expose: res.status(500).send(error.message);
  // Instead use:
  res.status(500).send("An error occurred");
  // Log the actual error server-side
  console.error(error);
}`} />
                          </div>
                        )}
                      </div>

                      <div className="p-4 border rounded-md bg-card">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-scanner-primary" />
                          References
                        </h4>
                        <ul className="space-y-2">
                          {selectedVuln === 1 && (
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
                          {selectedVuln === 2 && (
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
                          {selectedVuln === 3 && (
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
                          {selectedVuln === 4 && (
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
