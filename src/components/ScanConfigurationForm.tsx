import React, { useState, useCallback } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CrawlWebsiteConfig } from "@/types";
import { crawlUrls } from "@/utils/serverApi";
import { toast } from "@/components/ui/use-toast"

interface ScanConfigurationFormProps {
  onStartScan: (formData: any, customPayloads?: Map<string, string[]>, crawledUrls?: string[]) => void;
  isScanning: boolean;
}

const ScanConfigurationForm: React.FC<ScanConfigurationFormProps> = ({ onStartScan, isScanning }) => {
  const [formData, setFormData] = useState({
    url: "https://example.com",
    scanMode: "standard",
    authRequired: false,
    username: "",
    password: "",
    xssTests: true,
    sqlInjectionTests: true,
    csrfTests: true,
    headerTests: true,
    fileUploadTests: true,
    threadCount: 5,
    captureScreenshots: false,
    recordVideos: false,
    aiAnalysis: false,
    maxDepth: 3
  });
  const [customPayloads, setCustomPayloads] = useState<Map<string, string[]> | undefined>(undefined);
  const [crawledUrls, setCrawledUrls] = useState<string[]>([]);
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlWebsiteConfig, setCrawlWebsiteConfig] = useState<CrawlWebsiteConfig>({
    targetUrl: "https://example.com",
    crawlDepth: 3,
  });
  const [showCrawledUrls, setShowCrawledUrls] = useState(false);
  const [showPayloads, setShowPayloads] = useState(false);
  const [payloadText, setPayloadText] = useState('');
  const [payloadType, setPayloadType] = useState('xss');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleCrawlConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCrawlWebsiteConfig({
      ...crawlWebsiteConfig,
      [name]: value,
    });
  };

  const handleCrawlWebsite = async () => {
    setIsCrawling(true);
    try {
      const urls = await crawlUrls(crawlWebsiteConfig.targetUrl, Number(crawlWebsiteConfig.crawlDepth));
      setCrawledUrls(urls);
      toast({
        title: "URLs Crawled",
        description: `Successfully crawled ${urls.length} URLs from ${crawlWebsiteConfig.targetUrl}.`,
      });
    } catch (error) {
      console.error("Error crawling website:", error);
      toast({
        variant: "destructive",
        title: "Crawl Failed",
        description: "Failed to crawl URLs from the website.",
      });
    } finally {
      setIsCrawling(false);
    }
  };

  const handleAddPayload = () => {
    if (!payloadText.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Payload text cannot be empty.",
      });
      return;
    }

    setCustomPayloads((prevPayloads) => {
      const updatedPayloads = new Map(prevPayloads || []);
      const existingPayloads = updatedPayloads.get(payloadType) || [];
      updatedPayloads.set(payloadType, [...existingPayloads, payloadText]);
      return updatedPayloads;
    });

    setPayloadText('');
    toast({
      title: "Payload Added",
      description: `Successfully added payload to ${payloadType}.`,
    });
  };

  // Function to copy text to clipboard safely
  const copyToClipboard = (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .then(() => {
            toast({
              title: "Copied to clipboard",
              description: "URLs copied to clipboard successfully",
            });
          })
          .catch((err) => {
            console.error("Failed to copy: ", err);
            toast({
              variant: "destructive",
              title: "Failed to copy",
              description: "Please copy the text manually",
            });
          });
      } else {
        // Fallback for browsers without clipboard API
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';  // Prevent scrolling to bottom
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            toast({
              title: "Copied to clipboard",
              description: "URLs copied to clipboard successfully",
            });
          } else {
            throw new Error("Copy command was unsuccessful");
          }
        } catch (err) {
          console.error("Failed to copy: ", err);
          toast({
            variant: "destructive",
            title: "Failed to copy",
            description: "Please copy the text manually",
          });
        }
        
        document.body.removeChild(textarea);
      }
    } catch (err) {
      console.error("Clipboard error:", err);
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please copy the text manually",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Scan Configuration</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="url">Target URL</Label>
          <Input
            type="url"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://example.com"
            disabled={isScanning}
          />
        </div>
        <div>
          <Label htmlFor="scanMode">Scan Mode</Label>
          <Select onValueChange={(value) => setFormData({ ...formData, scanMode: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select scan mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quick">Quick</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="thorough">Thorough</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          <Checkbox
            checked={formData.authRequired}
            onChange={(e) => setFormData({ ...formData, authRequired: e.target.checked })}
            disabled={isScanning}
          />
          <span className="ml-2">Authentication Required</span>
        </Label>
        {formData.authRequired && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={isScanning}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isScanning}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>
          <Checkbox
            checked={formData.xssTests}
            onChange={(e) => setFormData({ ...formData, xssTests: e.target.checked })}
            disabled={isScanning}
          />
          <span className="ml-2">XSS Tests</span>
        </Label>
        <Label>
          <Checkbox
            checked={formData.sqlInjectionTests}
            onChange={(e) => setFormData({ ...formData, sqlInjectionTests: e.target.checked })}
            disabled={isScanning}
          />
          <span className="ml-2">SQL Injection Tests</span>
        </Label>
        <Label>
          <Checkbox
            checked={formData.csrfTests}
            onChange={(e) => setFormData({ ...formData, csrfTests: e.target.checked })}
            disabled={isScanning}
          />
          <span className="ml-2">CSRF Tests</span>
        </Label>
        <Label>
          <Checkbox
            checked={formData.headerTests}
            onChange={(e) => setFormData({ ...formData, headerTests: e.target.checked })}
            disabled={isScanning}
          />
          <span className="ml-2">Header Tests</span>
        </Label>
        <Label>
          <Checkbox
            checked={formData.fileUploadTests}
            onChange={(e) => setFormData({ ...formData, fileUploadTests: e.target.checked })}
            disabled={isScanning}
          />
          <span className="ml-2">File Upload Tests</span>
        </Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="threadCount">Thread Count</Label>
          <Input
            type="number"
            id="threadCount"
            name="threadCount"
            value={formData.threadCount}
            onChange={handleChange}
            min="1"
            max="10"
            disabled={isScanning}
          />
        </div>
        <div>
          <Label htmlFor="maxDepth">Max Crawl Depth</Label>
          <Input
            type="number"
            id="maxDepth"
            name="maxDepth"
            value={formData.maxDepth}
            onChange={handleChange}
            min="1"
            max="10"
            disabled={isScanning}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          <Checkbox
            checked={formData.captureScreenshots}
            onChange={(e) => setFormData({ ...formData, captureScreenshots: e.target.checked })}
            disabled={isScanning}
          />
          <span className="ml-2">Capture Screenshots</span>
        </Label>
        <Label>
          <Checkbox
            checked={formData.recordVideos}
            onChange={(e) => setFormData({ ...formData, recordVideos: e.target.checked })}
            disabled={isScanning}
          />
          <span className="ml-2">Record Videos</span>
        </Label>
        <Label>
          <Checkbox
            checked={formData.aiAnalysis}
            onChange={(e) => setFormData({ ...formData, aiAnalysis: e.target.checked })}
            disabled={isScanning}
          />
          <span className="ml-2">AI Analysis</span>
        </Label>
      </div>

      <div className="border rounded p-4">
        <h3 className="text-lg font-semibold mb-2">Crawl Website</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="targetUrl">Target URL</Label>
            <Input
              type="url"
              id="targetUrl"
              name="targetUrl"
              value={crawlWebsiteConfig.targetUrl}
              onChange={handleCrawlConfigChange}
              placeholder="https://example.com"
              disabled={isCrawling}
            />
          </div>
          <div>
            <Label htmlFor="crawlDepth">Crawl Depth</Label>
            <Input
              type="number"
              id="crawlDepth"
              name="crawlDepth"
              value={crawlWebsiteConfig.crawlDepth}
              onChange={handleCrawlConfigChange}
              min="1"
              max="5"
              disabled={isCrawling}
            />
          </div>
        </div>
        <Button type="button" onClick={handleCrawlWebsite} disabled={isCrawling}>
          {isCrawling ? "Crawling..." : "Crawl Website"}
        </Button>
      </div>

      <div className="border rounded p-4">
        <h3 className="text-lg font-semibold mb-2">Custom Payloads</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="payloadType">Payload Type</Label>
            <Select onValueChange={(value) => setPayloadType(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select payload type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xss">XSS</SelectItem>
                <SelectItem value="sql">SQL Injection</SelectItem>
                <SelectItem value="csrf">CSRF</SelectItem>
                <SelectItem value="headers">Headers</SelectItem>
                <SelectItem value="fileupload">File Upload</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="payloadText">Payload Text</Label>
            <Input
              type="text"
              id="payloadText"
              name="payloadText"
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              placeholder="Enter payload"
            />
          </div>
        </div>
        <Button type="button" onClick={handleAddPayload}>
          Add Payload
        </Button>
      </div>

      <div className="flex justify-between">
        <Button disabled={isScanning} onClick={() => onStartScan(formData, customPayloads, crawledUrls)}>
          {isScanning ? "Scanning..." : "Start Scan"}
        </Button>
        <div>
          {crawledUrls.length > 0 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                copyToClipboard(crawledUrls.join('\n'));
              }}
            >
              Copy URLs
            </Button>
          )}
        </div>
      </div>

      {showCrawledUrls && crawledUrls.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Crawled URLs</h3>
            <Textarea
              value={crawledUrls.join('\n')}
              readOnly
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>
      )}

      {showPayloads && customPayloads && customPayloads.size > 0 && (
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Custom Payloads</h3>
            {Array.from(customPayloads.entries()).map(([type, payloads]) => (
              <div key={type} className="mb-4">
                <h4 className="font-semibold">{type}</h4>
                <ul>
                  {payloads.map((payload, index) => (
                    <li key={index}>{payload}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScanConfigurationForm;
