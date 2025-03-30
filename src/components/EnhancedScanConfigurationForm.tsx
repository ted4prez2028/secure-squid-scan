import React, { useState, useEffect } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { 
  Zap, 
  Shield, 
  AlertTriangle, 
  Database, 
  Lock, 
  FileText, 
  Image, 
  FileBadge,
  Settings, 
  Bug, 
  Code,
  ServerCog,
  Search,
  FileSearch,
  ServerCrash
} from "lucide-react";
import { ScanConfig } from "@/utils/scanEngine";
import { vulnerabilityDefinitions } from "@/utils/vulnerabilityDefinitions";

const scanFormSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL" }),
  scanMode: z.enum(["quick", "standard", "thorough"]),
  authRequired: z.boolean().default(false),
  username: z.string().optional(),
  password: z.string().optional(),
  xssTests: z.boolean().default(true),
  sqlInjectionTests: z.boolean().default(true),
  csrfTests: z.boolean().default(true),
  headerTests: z.boolean().default(true),
  fileUploadTests: z.boolean().default(true),
  threadCount: z.number().min(1).max(10),
  captureScreenshots: z.boolean().default(true),
  recordVideos: z.boolean().default(false),
  aiAnalysis: z.boolean().default(true),
  maxDepth: z.number().min(1).max(10),
  // Additional advanced options
  followRedirects: z.boolean().default(true),
  cookieJar: z.boolean().default(true),
  respectRobotsTxt: z.boolean().default(true),
  customHeaders: z.string().optional(),
  excludeUrls: z.string().optional(),
  scanScope: z.enum(["host-only", "directory", "full"]).default("host-only"),
  bruteforceDepth: z.number().min(0).max(3).default(0),
});

type ScanFormValues = z.infer<typeof scanFormSchema>;

interface EnhancedScanConfigurationFormProps {
  onStartScan: (config: ScanConfig) => void;
  isScanning: boolean;
  scanProgress?: number;
  lastScanConfig?: ScanConfig;
}

const EnhancedScanConfigurationForm: React.FC<EnhancedScanConfigurationFormProps> = ({ 
  onStartScan, 
  isScanning,
  scanProgress = 0,
  lastScanConfig 
}) => {
  const [selectedTab, setSelectedTab] = useState("basic");
  const [showScanProfiles, setShowScanProfiles] = useState(false);

  const defaultValues: Partial<ScanFormValues> = {
    scanMode: "standard",
    authRequired: false,
    xssTests: true,
    sqlInjectionTests: true,
    csrfTests: true,
    headerTests: true,
    fileUploadTests: true,
    threadCount: 4,
    captureScreenshots: true,
    recordVideos: false,
    aiAnalysis: true,
    maxDepth: 3,
    followRedirects: true,
    cookieJar: true,
    respectRobotsTxt: true,
    scanScope: "host-only",
    bruteforceDepth: 0,
  };

  const form = useForm<ScanFormValues>({
    resolver: zodResolver(scanFormSchema),
    defaultValues: lastScanConfig || defaultValues,
  });

  const onSubmit = (data: ScanFormValues) => {
    const scanConfig: ScanConfig = {
      url: data.url,
      scanMode: data.scanMode,
      authRequired: data.authRequired,
      username: data.username,
      password: data.password,
      xssTests: data.xssTests,
      sqlInjectionTests: data.sqlInjectionTests,
      csrfTests: data.csrfTests,
      headerTests: data.headerTests,
      fileUploadTests: data.fileUploadTests,
      threadCount: data.threadCount,
      captureScreenshots: data.captureScreenshots,
      recordVideos: data.recordVideos,
      aiAnalysis: data.aiAnalysis,
      maxDepth: data.maxDepth,
    };
    
    onStartScan(scanConfig);
  };

  const authRequired = form.watch("authRequired");
  const scanMode = form.watch("scanMode");

  const applyScanProfile = (profile: string) => {
    switch(profile) {
      case "passive":
        form.setValue("scanMode", "quick");
        form.setValue("threadCount", 2);
        form.setValue("maxDepth", 2);
        form.setValue("captureScreenshots", true);
        form.setValue("recordVideos", false);
        form.setValue("xssTests", false);
        form.setValue("sqlInjectionTests", false);
        form.setValue("fileUploadTests", false);
        form.setValue("csrfTests", true);
        form.setValue("headerTests", true);
        form.setValue("bruteforceDepth", 0);
        toast({
          title: "Passive Scan Profile Applied",
          description: "Non-intrusive tests only. Safe for production environments.",
        });
        break;
      case "balanced":
        form.setValue("scanMode", "standard");
        form.setValue("threadCount", 4);
        form.setValue("maxDepth", 3);
        form.setValue("captureScreenshots", true);
        form.setValue("recordVideos", false);
        form.setValue("xssTests", true);
        form.setValue("sqlInjectionTests", true);
        form.setValue("fileUploadTests", true);
        form.setValue("csrfTests", true);
        form.setValue("headerTests", true);
        form.setValue("bruteforceDepth", 1);
        toast({
          title: "Balanced Scan Profile Applied",
          description: "Mix of passive and active tests with moderate intensity.",
        });
        break;
      case "aggressive":
        form.setValue("scanMode", "thorough");
        form.setValue("threadCount", 8);
        form.setValue("maxDepth", 5);
        form.setValue("captureScreenshots", true);
        form.setValue("recordVideos", true);
        form.setValue("xssTests", true);
        form.setValue("sqlInjectionTests", true);
        form.setValue("fileUploadTests", true);
        form.setValue("csrfTests", true);
        form.setValue("headerTests", true);
        form.setValue("bruteforceDepth", 2);
        toast({
          title: "Aggressive Scan Profile Applied",
          description: "Maximum test coverage and intensity. Use with caution.",
        });
        break;
      case "bugbounty":
        form.setValue("scanMode", "thorough");
        form.setValue("threadCount", 6);
        form.setValue("maxDepth", 8);
        form.setValue("captureScreenshots", true);
        form.setValue("recordVideos", true);
        form.setValue("xssTests", true);
        form.setValue("sqlInjectionTests", true);
        form.setValue("fileUploadTests", true);
        form.setValue("csrfTests", true);
        form.setValue("headerTests", true);
        form.setValue("bruteforceDepth", 3);
        toast({
          title: "Bug Bounty Profile Applied",
          description: "Comprehensive testing optimized for bug bounty hunting with detailed reporting.",
        });
        break;
    }
    setShowScanProfiles(false);
  };

  const getExpectedScanTime = () => {
    const baseTime = scanMode === 'quick' ? 5 : (scanMode === 'standard' ? 15 : 30);
    const depthMultiplier = form.watch("maxDepth") / 3;
    const threadDivisor = form.watch("threadCount") / 4;
    
    let totalTime = baseTime * depthMultiplier / threadDivisor;
    
    if (form.watch("xssTests")) totalTime += baseTime * 0.2;
    if (form.watch("sqlInjectionTests")) totalTime += baseTime * 0.3;
    if (form.watch("fileUploadTests")) totalTime += baseTime * 0.15;
    if (form.watch("bruteforceDepth") > 0) totalTime += baseTime * form.watch("bruteforceDepth") * 0.4;
    
    if (totalTime < 60) {
      return `${Math.ceil(totalTime)} minutes`;
    } else {
      const hours = Math.floor(totalTime / 60);
      const minutes = Math.ceil(totalTime % 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Zap className="h-6 w-6 text-scanner-primary" />
              New Vulnerability Scan
            </CardTitle>
            <CardDescription>
              Configure your scan parameters to detect security vulnerabilities
            </CardDescription>
          </div>
          <div>
            <Popover open={showScanProfiles} onOpenChange={setShowScanProfiles}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Scan Profiles
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">Select Scan Profile</h4>
                  <p className="text-sm text-muted-foreground">Choose a predefined configuration:</p>
                  <div className="grid gap-2">
                    <Button variant="outline" onClick={() => applyScanProfile("passive")} className="justify-start">
                      <Shield className="mr-2 h-4 w-4 text-blue-500" />
                      Passive Analysis
                    </Button>
                    <Button variant="outline" onClick={() => applyScanProfile("balanced")} className="justify-start">
                      <Bug className="mr-2 h-4 w-4 text-green-500" />
                      Balanced Scan
                    </Button>
                    <Button variant="outline" onClick={() => applyScanProfile("aggressive")} className="justify-start">
                      <ServerCrash className="mr-2 h-4 w-4 text-amber-500" />
                      Aggressive Scan
                    </Button>
                    <Button variant="outline" onClick={() => applyScanProfile("bugbounty")} className="justify-start">
                      <FileSearch className="mr-2 h-4 w-4 text-purple-500" />
                      Bug Bounty Hunter
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="basic" className="text-sm">Target</TabsTrigger>
                <TabsTrigger value="tests" className="text-sm">Test Selection</TabsTrigger>
                <TabsTrigger value="advanced" className="text-sm">Advanced Options</TabsTrigger>
                <TabsTrigger value="reporting" className="text-sm">Reporting</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-6">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the full URL of the website you want to scan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scanMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scan Mode</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select scan mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="quick">Quick Scan (5-10 minutes)</SelectItem>
                          <SelectItem value="standard">Standard Scan (15-30 minutes)</SelectItem>
                          <SelectItem value="thorough">Thorough Scan (1+ hours)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Determines the depth and intensity of the vulnerability scan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scanScope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scan Scope</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select scan scope" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="host-only">Host Only (Same domain)</SelectItem>
                          <SelectItem value="directory">Directory (Current path and subdirectories)</SelectItem>
                          <SelectItem value="full">Full (Follow all links including external)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Defines the boundaries of the scan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="authRequired"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                          <Lock className="h-4 w-4 text-scanner-primary" />
                          Authentication Required
                        </FormLabel>
                        <FormDescription>
                          Enable if the target website requires login
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {authRequired && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="excludeUrls"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excluded URLs (one per line)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="/logout&#10;/admin&#10;/dangerous-action" 
                          {...field} 
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormDescription>
                        URLs to exclude from scanning (useful for logout links or destructive actions)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setSelectedTab("tests")}
                  >
                    Next: Test Selection
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="tests" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="xssTests"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Code className="h-4 w-4 text-scanner-primary" />
                            Cross-Site Scripting (XSS)
                          </FormLabel>
                          <FormDescription>
                            Test for reflected, stored, and DOM-based XSS vulnerabilities
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sqlInjectionTests"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Database className="h-4 w-4 text-scanner-primary" />
                            SQL Injection
                          </FormLabel>
                          <FormDescription>
                            Test for SQL injection vulnerabilities in parameters
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="csrfTests"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base flex items-center gap-2">
                            <FileBadge className="h-4 w-4 text-scanner-primary" />
                            CSRF Vulnerabilities
                          </FormLabel>
                          <FormDescription>
                            Check for missing or weak CSRF protections in forms
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="headerTests"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4 text-scanner-primary" />
                            Security Headers
                          </FormLabel>
                          <FormDescription>
                            Check for missing security headers and misconfigurations
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fileUploadTests"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Image className="h-4 w-4 text-scanner-primary" />
                            File Upload Vulnerabilities
                          </FormLabel>
                          <FormDescription>
                            Test for insecure file upload handling
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <Card className="bg-muted/40 border-dashed">
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bug className="h-5 w-5 text-scanner-primary" />
                      OWASP Top 10 Coverage
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <ScrollArea className="h-52 pr-4">
                      <div className="space-y-4">
                        {vulnerabilityDefinitions.slice(0, 10).map((vuln) => (
                          <div key={vuln.id} className="border rounded-md p-3">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-sm">{vuln.name}</h4>
                              <div className={`text-xs px-2 py-0.5 rounded-full ${
                                vuln.severity === 'critical' ? 'bg-red-500/20 text-red-500' :
                                vuln.severity === 'high' ? 'bg-orange-500/20 text-orange-500' :
                                vuln.severity === 'medium' ? 'bg-amber-500/20 text-amber-500' :
                                'bg-green-500/20 text-green-500'
                              }`}>
                                {vuln.severity}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{vuln.description}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setSelectedTab("basic")}
                  >
                    Back: Target
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setSelectedTab("advanced")}
                  >
                    Next: Advanced Options
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="threadCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thread Count: {field.value}</FormLabel>
                          <FormControl>
                            <Slider
                              min={1}
                              max={10}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="py-4"
                            />
                          </FormControl>
                          <FormDescription>
                            Higher thread counts speed up scanning but may increase server load
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxDepth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Crawl Depth: {field.value}</FormLabel>
                          <FormControl>
                            <Slider
                              min={1}
                              max={10}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="py-4"
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum link depth to crawl from the starting URL
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bruteforceDepth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brute Force Intensity: {field.value}</FormLabel>
                          <FormControl>
                            <Slider
                              min={0}
                              max={3}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="py-4"
                            />
                          </FormControl>
                          <FormDescription>
                            Level of brute force testing (0 = off, 3 = aggressive)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="followRedirects"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Follow Redirects</FormLabel>
                            <FormDescription>
                              Automatically follow HTTP redirects
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cookieJar"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Use Cookie Jar</FormLabel>
                            <FormDescription>
                              Maintain session cookies between requests
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="respectRobotsTxt"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Respect robots.txt</FormLabel>
                            <FormDescription>
                              Honor robots.txt exclusions during crawling
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="customHeaders"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom HTTP Headers (JSON format)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder='{"X-Custom-Header": "value", "Authorization": "Bearer token"}'
                          {...field} 
                          className="min-h-[100px] font-mono text-sm"
                        />
                      </FormControl>
                      <FormDescription>
                        Additional HTTP headers to send with each request
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setSelectedTab("tests")}
                  >
                    Back: Test Selection
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setSelectedTab("reporting")}
                  >
                    Next: Reporting Options
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="reporting" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="captureScreenshots"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Capture Screenshots</FormLabel>
                          <FormDescription>
                            Take screenshots of detected vulnerabilities
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recordVideos"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Record Videos</FormLabel>
                          <FormDescription>
                            Record exploitation proof-of-concept videos
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="aiAnalysis"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">AI Analysis</FormLabel>
                        <FormDescription>
                          Use AI to analyze results and provide remediation advice
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Card className="bg-muted/30 border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Scan Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Scan Mode</p>
                          <p className="text-sm">{scanMode.charAt(0).toUpperCase() + scanMode.slice(1)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Thread Count</p>
                          <p className="text-sm">{form.watch("threadCount")}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Active Tests</p>
                          <p className="text-sm">
                            {[
                              form.watch("xssTests") ? "XSS" : null,
                              form.watch("sqlInjectionTests") ? "SQL Injection" : null,
                              form.watch("csrfTests") ? "CSRF" : null,
                              form.watch("fileUploadTests") ? "File Upload" : null,
                              form.watch("headerTests") ? "Security Headers" : null
                            ].filter(Boolean).join(", ") || "None"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Estimated Duration</p>
                          <p className="text-sm">{getExpectedScanTime()}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="border rounded-md p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <h3 className="font-medium">Important Notes</h3>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 pl-7 list-disc">
                    <li>Only scan websites you own or have explicit permission to test</li>
                    <li>Some tests may trigger intrusion detection systems or WAFs</li>
                    <li>The scanner creates real attack payloads that could modify site data</li>
                    <li>Consider running scans in development/staging environments first</li>
                  </ul>
                </div>

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setSelectedTab("advanced")}
                  >
                    Back: Advanced Options
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isScanning}
                    className="gap-2"
                  >
                    {isScanning ? (
                      <>
                        <div className="relative h-4 w-4">
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                          {scanProgress > 0 && scanProgress < 100 && (
                            <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold">
                              {scanProgress}%
                            </div>
                          )}
                        </div>
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Start Scan
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EnhancedScanConfigurationForm;
