
import React from 'react';
import { Shield, AlertTriangle, AlertCircle, Info, Check } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  showIcon?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  count?: number;
  showCount?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ 
  severity, 
  showIcon = true,
  className,
  size = 'default',
  count,
  showCount = false
}) => {
  const severityConfig: Record<SeverityLevel, { color: string, icon: React.ReactNode, label: string }> = {
    critical: { 
      color: "bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30", 
      icon: <AlertTriangle className={size === 'sm' ? "h-3 w-3" : "h-4 w-4"} />,
      label: "Critical"
    },
    high: { 
      color: "bg-orange-500/20 text-orange-500 border-orange-500/50 hover:bg-orange-500/30", 
      icon: <AlertTriangle className={size === 'sm' ? "h-3 w-3" : "h-4 w-4"} />,
      label: "High"
    },
    medium: { 
      color: "bg-amber-500/20 text-amber-500 border-amber-500/50 hover:bg-amber-500/30", 
      icon: <AlertCircle className={size === 'sm' ? "h-3 w-3" : "h-4 w-4"} />,
      label: "Medium"
    },
    low: { 
      color: "bg-green-500/20 text-green-500 border-green-500/50 hover:bg-green-500/30", 
      icon: <Check className={size === 'sm' ? "h-3 w-3" : "h-4 w-4"} />,
      label: "Low"
    },
    info: { 
      color: "bg-blue-500/20 text-blue-500 border-blue-500/50 hover:bg-blue-500/30", 
      icon: <Info className={size === 'sm' ? "h-3 w-3" : "h-4 w-4"} />,
      label: "Info"
    }
  };

  const { color, icon, label } = severityConfig[severity];
  
  const sizeClass = size === 'sm' ? 'text-xs py-0 px-2' : 
                   size === 'lg' ? 'text-sm py-1 px-3' : 
                   'py-0.5 px-2.5';

  return (
    <Badge 
      variant="outline" 
      className={cn(`flex items-center gap-1 ${color} ${sizeClass}`, className)}
    >
      {showIcon && icon}
      <span className="capitalize">{label}</span>
      {showCount && count !== undefined && count > 0 && (
        <span className="ml-1 px-1.5 py-0.5 bg-black/20 rounded-full text-xs font-medium">
          {count}
        </span>
      )}
    </Badge>
  );
};

export default SeverityBadge;
