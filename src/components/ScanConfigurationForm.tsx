
import React, { useState } from 'react';
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
import { Zap, Shield, AlertTriangle, Database, Lock, FileText, Image, FileBadge, Sparkles, AlertCircle, Globe } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { crawlUrls } from "@/utils/serverApi";

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
  crawlBeforeScan: z.boolean().default(false),
});

type ScanFormValues = z.infer<typeof scanFormSchema>;

interface ScanConfigurationFormProps {
  onStartScan: (config: ScanFormValues, customPayloads?: Map<string, string[]>, crawledUrls?: string[]) => void;
  isScanning: boolean;
}

const ScanConfigurationForm: React.FC<ScanConfigurationFormProps> = ({ 
  onStartScan, 
  isScanning 
}) => {
  const [selectedTab, setSelectedTab] = useState("basic");
  const [isGeneratingPayloads, setIsGeneratingPayloads] = useState(false);
  const [showPayloadsDialog, setShowPayloadsDialog] = useState(false);
  const [generatedPayloads, setGeneratedPayloads] = useState<string[]>([]);
  const [payloadType, setPayloadType] = useState<string>("xss");
  const [payloadCount, setPayloadCount] = useState<number>(100);
  const [openAIKey, setOpenAIKey] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawledUrls, setCrawledUrls] = useState<string[]>([]);
  const [showCrawlResultsDialog, setShowCrawlResultsDialog] = useState(false);
  const [customPayloads, setCustomPayloads] = useState<Map<string, string[]>>(new Map());

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
    crawlBeforeScan: false,
  };

  const form = useForm<ScanFormValues>({
    resolver: zodResolver(scanFormSchema),
    defaultValues,
  });

  const onSubmit = (data: ScanFormValues) => {
    // Pass custom payloads if they exist
    const hasCustomPayloads = customPayloads.size > 0;
    
    // If crawlBeforeScan is enabled but we haven't crawled yet, do it now
    if (data.crawlBeforeScan && crawledUrls.length === 0) {
      toast.info("Crawling website before scan...");
      handleCrawlWebsite().then(() => {
        onStartScan(data, hasCustomPayloads ? customPayloads : undefined, crawledUrls);
      });
    } else {
      onStartScan(data, hasCustomPayloads ? customPayloads : undefined, 
                 data.crawlBeforeScan ? crawledUrls : undefined);
    }
  };

  const authRequired = form.watch("authRequired");
  const targetUrl = form.watch("url");
  const maxDepth = form.watch("maxDepth");
  const crawlBeforeScan = form.watch("crawlBeforeScan");

  const generatePayloads = async () => {
    if (!openAIKey) {
      setShowApiKeyInput(true);
      return;
    }

    setIsGeneratingPayloads(true);
    toast.info(`Generating ${payloadCount} ${payloadType.toUpperCase()} payloads...`);

    try {
      // Define the system prompt based on the payload type
      let systemPrompt = "";
      switch (payloadType) {
        case "xss":
          systemPrompt = "You are a security researcher generating XSS payloads for ethical testing. Generate diverse XSS payloads that bypass different kinds of filters.";
          break;
        case "sql":
          systemPrompt = "You are a security researcher generating SQL injection payloads for ethical testing. Generate diverse SQL injection payloads that target different database systems.";
          break;
        case "csrf":
          systemPrompt = "You are a security researcher generating CSRF payload examples for ethical testing. Generate diverse CSRF HTML/JavaScript examples.";
          break;
        case "headers":
          systemPrompt = "You are a security researcher generating security header bypass payloads for ethical testing. Generate diverse examples that could bypass security headers.";
          break;
        case "fileupload":
          systemPrompt = "You are a security researcher generating file upload bypass payloads for ethical testing. Generate diverse file names and MIME types that could bypass upload restrictions.";
          break;
        default:
          systemPrompt = "You are a security researcher generating security test payloads for ethical testing. Generate diverse security test payloads.";
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAIKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: `Generate ${payloadCount} unique ${payloadType} payloads for security testing. Return ONLY the payloads, one per line, with NO additional text, explanations, numbering, or formatting. These will be directly used in a testing tool.`
            }
          ],
          temperature: 0.8,
          top_p: 1,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to generate payloads");
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Split the content by line and filter out empty lines
      const payloads = content.split('\n').filter((line: string) => line.trim() !== '');
      
      setGeneratedPayloads(payloads);
      
      // Add the generated payloads to our customPayloads Map
      setCustomPayloads(prevPayloads => {
        const newPayloads = new Map(prevPayloads);
        newPayloads.set(payloadType, payloads);
        return newPayloads;
      });
      
      setShowPayloadsDialog(true);
      toast.success(`Generated ${payloads.length} ${payloadType.toUpperCase()} payloads and added to scan configuration`);
    } catch (error) {
      console.error("Error generating payloads:", error);
      toast.error(`Failed to generate payloads: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsGeneratingPayloads(false);
    }
  };

  const handleCrawlWebsite = async () => {
    if (!targetUrl) {
      toast.error("Please enter a valid URL first");
      return;
    }

    setIsCrawling(true);
    try {
      toast.info(`Crawling ${targetUrl} with depth ${maxDepth}...`);
      const urls = await crawlUrls(targetUrl, maxDepth);
      setCrawledUrls(urls);
      toast.success(`Discovered ${urls.length} URLs on ${targetUrl}`);
      setShowCrawlResultsDialog(true);
    } catch (error) {
      console.error("Error crawling website:", error);
      toast.error(`Failed to crawl website: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsCrawling(false);
    }
  };

  const downloadPayloads = () => {
    const blob = new Blob([generatedPayloads.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${payloadType}_payloads.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${generatedPayloads.length} payloads`);
  };

  const downloadCrawledUrls = () => {
    const blob = new Blob([crawledUrls.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crawled_urls.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${crawledUrls.length} URLs`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPayloads.join('\n'));
    toast.success("Payloads copied to clipboard");
  };

  const copyCrawledUrls = () => {
    navigator.clipboard.writeText(crawledUrls.join('\n'));
    toast.success("URLs copied to clipboard");
  };

  // Display which payload types have been generated
  const getPayloadBadges = () => {
    return Array.from(customPayloads.keys()).map(type => (
      <Badge key={type} className="mr-1 bg-scanner-primary">
        {type.toUpperCase()}: {customPayloads.get(type)?.length || 0}
      </Badge>
    ));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Zap className="h-6 w-6 text-scanner-primary" />
          New Vulnerability Scan
        </CardTitle>
        <CardDescription>
          Configure your scan parameters to detect security vulnerabilities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="basic" className="text-sm">Basic Configuration</TabsTrigger>
                <TabsTrigger value="advanced" className="text-sm">Advanced Options</TabsTrigger>
                <TabsTrigger value="tests" className="text-sm">Test Selection</TabsTrigger>
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
                  name="crawlBeforeScan"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Crawl Website</FormLabel>
                        <FormDescription>
                          Discover and scan all pages on the target website
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

                {crawlBeforeScan && crawledUrls.length > 0 && (
                  <div className="bg-muted p-3 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        {crawledUrls.length} URLs discovered
                      </span>
                      <Button variant="outline" size="sm" onClick={() => setShowCrawlResultsDialog(true)}>
                        View URLs
                      </Button>
                    </div>
                  </div>
                )}

                {crawlBeforeScan && crawledUrls.length === 0 && (
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCrawlWebsite}
                      className="flex items-center gap-2"
                      disabled={isCrawling || !targetUrl}
                    >
                      {isCrawling ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                          Crawling...
                        </>
                      ) : (
                        <>
                          <Globe className="h-4 w-4" />
                          Crawl Now
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="authRequired"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Authentication Required</FormLabel>
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

                <div className="flex justify-between">
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

                <div className="grid grid-cols-2 gap-4">
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

                {customPayloads.size > 0 && (
                  <div className="p-4 border rounded-md">
                    <h3 className="text-sm font-medium mb-2">Generated Payloads:</h3>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {getPayloadBadges()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      These payloads will be used in the scan
                    </p>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setSelectedTab("basic")}
                  >
                    Back: Basic Configuration
                  </Button>
                  <Button 
                    type="button"
                    variant="payloads"
                    onClick={() => {
                      if (!openAIKey) {
                        setShowApiKeyInput(true);
                      } else {
                        setShowPayloadsDialog(true);
                      }
                    }}
                    className="mx-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate AI Payloads
                  </Button>
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
                            <Shield className="h-4 w-4 text-scanner-primary" />
                            Cross-Site Scripting (XSS)
                          </FormLabel>
                          <FormDescription>
                            Test for reflected, stored, and DOM-based XSS vulnerabilities
                          </FormDescription>
                          {customPayloads.has('xss') && (
                            <Badge variant="outline" className="mt-1">
                              Using {customPayloads.get('xss')?.length || 0} custom payloads
                            </Badge>
                          )}
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
                          {customPayloads.has('sql') && (
                            <Badge variant="outline" className="mt-1">
                              Using {customPayloads.get('sql')?.length || 0} custom payloads
                            </Badge>
                          )}
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
                          {customPayloads.has('csrf') && (
                            <Badge variant="outline" className="mt-1">
                              Using {customPayloads.get('csrf')?.length || 0} custom payloads
                            </Badge>
                          )}
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
                          {customPayloads.has('headers') && (
                            <Badge variant="outline" className="mt-1">
                              Using {customPayloads.get('headers')?.length || 0} custom payloads
                            </Badge>
                          )}
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
                          {customPayloads.has('fileupload') && (
                            <Badge variant="outline" className="mt-1">
                              Using {customPayloads.get('fileupload')?.length || 0} custom payloads
                            </Badge>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

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
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
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

        {/* OpenAI API Key Dialog */}
        <Dialog open={showApiKeyInput} onOpenChange={setShowApiKeyInput}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Enter OpenAI API Key</DialogTitle>
              <DialogDescription>
                Your API key is required to generate payloads. It's only used for this request and not stored permanently.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Input
                  id="apiKey"
                  placeholder="sk-..."
                  value={openAIKey}
                  onChange={(e) => setOpenAIKey(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3 inline mr-1" />
                  Your API key will only be used in this browser session and will not be stored on our servers.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowApiKeyInput(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowApiKeyInput(false);
                  setShowPayloadsDialog(true);
                }}
                disabled={!openAIKey || openAIKey.length < 10}
              >
                Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payloads Generation Dialog */}
        <Dialog open={showPayloadsDialog} onOpenChange={setShowPayloadsDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Generate Security Test Payloads</DialogTitle>
              <DialogDescription>
                Use AI to generate security test payloads for your scanning tests.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormLabel>Payload Type</FormLabel>
                  <Select 
                    value={payloadType}
                    onValueChange={setPayloadType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Payload Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xss">XSS</SelectItem>
                      <SelectItem value="sql">SQL Injection</SelectItem>
                      <SelectItem value="csrf">CSRF</SelectItem>
                      <SelectItem value="headers">Security Headers</SelectItem>
                      <SelectItem value="fileupload">File Upload</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <FormLabel>Payload Count</FormLabel>
                  <Select 
                    value={payloadCount.toString()}
                    onValueChange={(value) => setPayloadCount(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Number of Payloads" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 Payloads</SelectItem>
                      <SelectItem value="50">50 Payloads</SelectItem>
                      <SelectItem value="100">100 Payloads</SelectItem>
                      <SelectItem value="200">200 Payloads</SelectItem>
                      <SelectItem value="500">500 Payloads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {generatedPayloads.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <FormLabel>Generated Payloads ({generatedPayloads.length})</FormLabel>
                    <div className="space-x-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={copyToClipboard}
                      >
                        Copy All
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={downloadPayloads}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="h-[300px] border rounded-md p-4">
                    <pre className="text-xs font-mono overflow-auto">
                      {generatedPayloads.join('\n')}
                    </pre>
                  </ScrollArea>
                </div>
              ) : null}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowPayloadsDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={generatePayloads}
                disabled={isGeneratingPayloads || !openAIKey}
                className="gap-2"
              >
                {isGeneratingPayloads ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Payloads
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Crawled URLs Dialog */}
        <Dialog open={showCrawlResultsDialog} onOpenChange={setShowCrawlResultsDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Discovered URLs</DialogTitle>
              <DialogDescription>
                {crawledUrls.length} URLs were discovered on {targetUrl}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <FormLabel>URLs ({crawledUrls.length})</FormLabel>
                  <div className="space-x-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={copyCrawledUrls}
                    >
                      Copy All
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={downloadCrawledUrls}
                    >
                      Download
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-[300px] border rounded-md p-4">
                  <ul className="text-xs space-y-1">
                    {crawledUrls.map((url, index) => (
                      <li key={index} className="truncate hover:text-blue-500">
                        {url}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                onClick={() => setShowCrawlResultsDialog(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ScanConfigurationForm;
