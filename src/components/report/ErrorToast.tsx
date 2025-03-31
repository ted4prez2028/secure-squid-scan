
import React from 'react';
import { AlertCircle } from "lucide-react";

interface ErrorToastProps {
  showErrorToast: boolean;
  errorMessage?: string;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ showErrorToast, errorMessage }) => {
  if (!showErrorToast) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-md shadow-lg z-50 max-w-md animate-in slide-in-from-right-10 fade-in-20">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 mt-0.5" />
        <div>
          <h3 className="font-medium mb-1">Report Generation Failed</h3>
          <p className="text-sm">
            {errorMessage || "There was an error generating the PDF report. The jspdf-autotable plugin is not properly loaded. Try downloading in HTML or CSV format instead."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorToast;
