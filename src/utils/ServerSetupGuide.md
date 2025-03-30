
# Server-Side Vulnerability Scanner Setup Guide

This document provides instructions for setting up the server-side component of the vulnerability scanner on your personal server.

## Requirements

- Node.js (v14+)
- npm or yarn
- A server with the ability to make outbound HTTP requests

## Server Implementation

Create a new directory for your server implementation:

```bash
mkdir vulnerability-scanner-server
cd vulnerability-scanner-server
npm init -y
```

Install the required dependencies:

```bash
npm install express cors uuid axios cheerio puppeteer morgan winston dotenv
```

Create a `.env` file:

```
PORT=3000
SCAN_TIMEOUT=300000
MAX_CONCURRENT_REQUESTS=10
USER_AGENT="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
```

Create a file named `server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Store ongoing scans
const ongoingScans = new Map();
const completedScans = new Map();

// Scanner functions (implement these based on the scan requirements)
const vulnerabilityScanner = require('./scanner');

// API Routes
app.post('/api/scan', async (req, res) => {
  try {
    const scanConfig = req.body;
    const scanID = uuidv4();
    
    // Validate the scan config
    if (!scanConfig.url || !scanConfig.vulnerabilityTypes) {
      return res.status(400).json({
        success: false,
        error: 'Invalid scan configuration. URL and vulnerability types are required.'
      });
    }
    
    // Initialize scan in the tracking map
    ongoingScans.set(scanID, {
      scanId: scanID,
      status: 'pending',
      progress: 0,
      config: scanConfig,
      startTime: new Date().toISOString(),
    });
    
    // Start the scan process asynchronously
    setTimeout(() => {
      performScan(scanID, scanConfig);
    }, 0);
    
    // Return immediate response with scan ID
    return res.json({
      success: true,
      data: {
        summary: {
          scanID,
          url: scanConfig.url,
          startTime: new Date().toISOString(),
          endTime: null,
          duration: 0,
          scanType: scanConfig.scanType,
          pagesScanned: 0,
          requestsSent: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          info: 0,
          total: 0
        },
        vulnerabilities: []
      }
    });
  } catch (error) {
    console.error('Error starting scan:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error starting scan'
    });
  }
});

app.get('/api/scan/status/:scanId', (req, res) => {
  const { scanId } = req.params;
  
  // Check if the scan is ongoing
  if (ongoingScans.has(scanId)) {
    return res.json(ongoingScans.get(scanId));
  }
  
  // Check if the scan is completed
  if (completedScans.has(scanId)) {
    return res.json({
      scanId,
      status: 'completed',
      progress: 100,
      results: completedScans.get(scanId)
    });
  }
  
  // Scan not found
  return res.status(404).json({
    success: false,
    error: 'Scan not found'
  });
});

app.get('/api/scan/results/:scanId', (req, res) => {
  const { scanId } = req.params;
  
  if (completedScans.has(scanId)) {
    return res.json({
      success: true,
      data: completedScans.get(scanId)
    });
  }
  
  return res.status(404).json({
    success: false,
    error: 'Scan results not found'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Vulnerability Scanner Server running on port ${PORT}`);
});

// Function to perform the actual scanning
async function performScan(scanId, config) {
  try {
    // Update status to in_progress
    ongoingScans.set(scanId, {
      ...ongoingScans.get(scanId),
      status: 'in_progress',
      progress: 5
    });
    
    // This would be replaced with your actual scanning implementation
    // Here we're just simulating the scan with increasing progress
    const totalSteps = 20;
    
    for (let step = 1; step <= totalSteps; step++) {
      // Update progress
      const progress = Math.floor((step / totalSteps) * 100);
      
      ongoingScans.set(scanId, {
        ...ongoingScans.get(scanId),
        progress
      });
      
      // Simulate work for each step
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Generate the scan results
    const scanResults = await vulnerabilityScanner.generateScanResults(config);
    
    // Store completed scan results
    completedScans.set(scanId, scanResults);
    
    // Remove from ongoing scans
    ongoingScans.delete(scanId);
    
    console.log(`Scan ${scanId} completed.`);
  } catch (error) {
    console.error(`Error performing scan ${scanId}:`, error);
    
    // Update scan status to failed
    ongoingScans.set(scanId, {
      ...ongoingScans.get(scanId),
      status: 'failed',
      error: error.message
    });
    
    // Remove from ongoing scans after some time
    setTimeout(() => {
      if (ongoingScans.has(scanId)) {
        ongoingScans.delete(scanId);
      }
    }, 3600000); // Keep failed scans for 1 hour
  }
}
```

Create a file named `scanner.js` to implement your actual scanning logic:

```javascript
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

// Import your vulnerability detection modules here
// This is a simplified implementation

module.exports = {
  async generateScanResults(config) {
    const startTime = new Date();
    
    // Actual scanning would happen here
    // This is a simplified mock implementation
    
    const vulnerabilities = await generateMockVulnerabilities(config);
    
    const critical = vulnerabilities.filter(v => v.severity === 'critical').length;
    const high = vulnerabilities.filter(v => v.severity === 'high').length;
    const medium = vulnerabilities.filter(v => v.severity === 'medium').length;
    const low = vulnerabilities.filter(v => v.severity === 'low').length;
    const info = vulnerabilities.filter(v => v.severity === 'info').length;
    
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    return {
      summary: {
        scanID: uuidv4(),
        url: config.url,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        scanType: config.scanType,
        pagesScanned: Math.floor(Math.random() * 50) + 10,
        requestsSent: Math.floor(Math.random() * 200) + 50,
        critical,
        high,
        medium,
        low,
        info,
        total: vulnerabilities.length,
        scanTime: `${Math.round(duration / 1000)} seconds`,
      },
      vulnerabilities,
      scanConfig: config
    };
  }
};

async function generateMockVulnerabilities(config) {
  // In a real implementation, you would perform actual vulnerability detection here
  // This is just generating mock data similar to the client-side simulation
  
  // Import or recreate your vulnerability templates here
  // (similar to the ones in the client-side scanEngine.ts)
  
  const vulnerabilities = [];
  
  // Example generation code (simplified)
  for (const vulnType of config.vulnerabilityTypes) {
    // Generate 1-3 vulnerabilities of each type
    const count = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < count; i++) {
      vulnerabilities.push({
        id: uuidv4(),
        title: `Sample ${vulnType.toUpperCase()} vulnerability`,
        severity: ['critical', 'high', 'medium', 'low', 'info'][Math.floor(Math.random() * 5)],
        description: `This is a sample ${vulnType} vulnerability description.`,
        location: `${config.url}/sample-path-${i}`,
        evidence: `Sample evidence for ${vulnType}`,
        remediation: `Fix the ${vulnType} vulnerability by following security best practices.`,
        cweid: `CWE-${Math.floor(Math.random() * 1000)}`,
        owasp: 'A3:2021-Injection',
        timestamp: new Date().toISOString(),
        tags: [vulnType, 'security', 'sample'],
        type: vulnType
      });
    }
  }
  
  return vulnerabilities;
}
```

## Running the Server

Start your server:

```bash
node server.js
```

## Configuring the Client

In the client application, update the `SERVER_API_URL` in `serverApi.ts` to point to your personal server:

```typescript
const SERVER_API_URL = 'http://your-server-ip:3000/api';
```

## Security Considerations

1. This server should be run in a secure environment.
2. Only allow authorized access to the API endpoints.
3. Consider implementing rate limiting and authentication.
4. Be aware that vulnerability scanning might be against the terms of service of some websites.
5. Only scan websites you own or have explicit permission to test.

## Extending the Scanner

To implement actual vulnerability scanning:

1. Develop modules for each vulnerability type (XSS, SQL injection, etc.)
2. Use libraries like Puppeteer for browser-based testing
3. Implement crawling functionality to discover all pages
4. Add proper logging and error handling
