import { DomainStatus } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

const statusConfig: Record<DomainStatus, { label: string; className: string }> = {
  active: { 
    label: "status.active", 
    className: "text-[hsl(142,76%,36%)]" 
  },
  expiring: { 
    label: "status.expiring", 
    className: "text-[hsl(38,92%,50%)]" 
  },
  expired: { 
    label: "status.expired", 
    className: "text-[hsl(0,85%,75%)]" 
  },
  reserved: { 
    label: "status.reserved", 
    className: "text-muted-foreground" 
  },
};

interface DomainStatusBadgeProps {
  status: DomainStatus;
  className?: string;
}

export function DomainStatusBadge({ status, className }: DomainStatusBadgeProps) {
  const config = statusConfig[status];
  const { t } = useLanguage();
  
  return (
    <span className={cn("text-sm font-normal", config.className, className)}>
      {t(config.label)}
    </span>
  );
}
