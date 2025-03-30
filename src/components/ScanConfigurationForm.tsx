
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
import { Zap, Shield, AlertTriangle, Database, Lock, FileText, Image, FileBadge } from "lucide-react";

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
});

type ScanFormValues = z.infer<typeof scanFormSchema>;

interface ScanConfigurationFormProps {
  onStartScan: (config: ScanFormValues) => void;
  isScanning: boolean;
}

const ScanConfigurationForm: React.FC<ScanConfigurationFormProps> = ({ 
  onStartScan, 
  isScanning 
}) => {
  const [selectedTab, setSelectedTab] = useState("basic");

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
  };

  const form = useForm<ScanFormValues>({
    resolver: zodResolver(scanFormSchema),
    defaultValues,
  });

  const onSubmit = (data: ScanFormValues) => {
    onStartScan(data);
  };

  const authRequired = form.watch("authRequired");

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
      </CardContent>
    </Card>
  );
};

export default ScanConfigurationForm;
