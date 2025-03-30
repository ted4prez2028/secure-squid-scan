
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download } from "lucide-react";

interface ReportHistoryProps {
  reportHistory: Array<{
    name: string;
    date: string;
    format: string;
    data: any;
  }>;
  downloadReport: (report: any) => void;
}

const ReportHistory: React.FC<ReportHistoryProps> = ({ reportHistory, downloadReport }) => {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Previous Reports</CardTitle>
        <CardDescription>Reports you've generated for this target</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto rounded-md border">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted">
              <tr>
                <th scope="col" className="px-6 py-3">Report Name</th>
                <th scope="col" className="px-6 py-3">Generated</th>
                <th scope="col" className="px-6 py-3">Format</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reportHistory.map((report, index) => (
                <tr key={index} className="border-b bg-card">
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{report.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{report.date}</td>
                  <td className="px-6 py-4">
                    <Badge>{report.format}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button 
                        variant="download" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => downloadReport(report)}
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportHistory;
