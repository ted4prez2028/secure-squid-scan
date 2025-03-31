
// Define common types used throughout the application

export interface CrawlWebsiteConfig {
  targetUrl: string;
  crawlDepth: number;
}

// Helper function for generating simple UUIDs (used when crypto.randomUUID is not available)
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
