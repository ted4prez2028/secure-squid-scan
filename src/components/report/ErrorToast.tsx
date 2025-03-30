
import React from 'react';
import { AlertCircle } from "lucide-react";

interface ErrorToastProps {
  showErrorToast: boolean;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ showErrorToast }) => {
  if (!showErrorToast) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-md shadow-lg z-50 max-w-md animate-in slide-in-from-right-10 fade-in-20">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 mt-0.5" />
        <div>
          <h3 className="font-medium mb-1">Download Failed</h3>
          <p className="text-sm">
            There was an error generating the PDF report. This may be due to issues with jsPDF AutoTable or missing screenshots. 
            Try a different format or check the console for more details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorToast;
