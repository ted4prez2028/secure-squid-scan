
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SavedTemplatesProps {
  useTemplate: (templateName: string) => void;
  createTemplate: () => void;
}

const SavedTemplates: React.FC<SavedTemplatesProps> = ({ useTemplate, createTemplate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Templates</CardTitle>
        <CardDescription>Custom and shared templates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-md border p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-scanner-primary" />
              <div>
                <p className="font-medium text-sm">HackerOne Template</p>
                <p className="text-xs text-muted-foreground">Optimized for H1 submissions</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => useTemplate('HackerOne Template')}
            >
              Use
            </Button>
          </div>
          
          <div className="rounded-md border p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-scanner-primary" />
              <div>
                <p className="font-medium text-sm">PCI Compliance</p>
                <p className="text-xs text-muted-foreground">PCI DSS control mappings</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => useTemplate('PCI Compliance')}
            >
              Use
            </Button>
          </div>
          
          <div className="rounded-md border p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-scanner-primary" />
              <div>
                <p className="font-medium text-sm">My Custom Template</p>
                <p className="text-xs text-muted-foreground">Last edited: 3 days ago</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => useTemplate('My Custom Template')}
            >
              Use
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={createTemplate}
        >
          Create Template
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SavedTemplates;
