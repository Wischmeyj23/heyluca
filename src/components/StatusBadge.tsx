import { Badge } from "@/components/ui/badge";
import { NoteStatus } from "@/types";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, AlertCircle, FileText } from "lucide-react";

interface StatusBadgeProps {
  status: NoteStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    ready: {
      icon: CheckCircle2,
      label: "Ready",
      className: "bg-status-ready/20 text-status-ready border-status-ready/30",
    },
    processing: {
      icon: Loader2,
      label: "Processing",
      className: "bg-status-processing/20 text-status-processing border-status-processing/30",
    },
    error: {
      icon: AlertCircle,
      label: "Error",
      className: "bg-status-error/20 text-status-error border-status-error/30",
    },
    draft: {
      icon: FileText,
      label: "Draft",
      className: "bg-status-draft/20 text-status-draft border-status-draft/30",
    },
  };

  const { icon: Icon, label, className: statusClass } = config[status];

  return (
    <Badge 
      variant="outline" 
      className={cn(statusClass, className)}
    >
      <Icon className={cn("w-3 h-3 mr-1", status === "processing" && "animate-spin")} />
      {label}
    </Badge>
  );
}
