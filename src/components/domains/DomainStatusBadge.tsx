import { DomainStatus } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<DomainStatus, { label: string; className: string }> = {
  active: { 
    label: "Активен", 
    className: "domain-status-active" 
  },
  expiring: { 
    label: "Истекает", 
    className: "domain-status-expiring" 
  },
  expired: { 
    label: "Истёк", 
    className: "domain-status-expired" 
  },
  reserved: { 
    label: "Резерв", 
    className: "domain-status-reserved" 
  },
};

interface DomainStatusBadgeProps {
  status: DomainStatus;
  className?: string;
}

export function DomainStatusBadge({ status, className }: DomainStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="outline" 
      className={cn("border font-normal flex justify-center items-center", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
