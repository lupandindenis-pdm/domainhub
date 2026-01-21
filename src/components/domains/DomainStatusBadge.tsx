import { DomainStatus } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

const statusConfig: Record<DomainStatus, { label: string; className: string }> = {
  active: { 
    label: "status.active", 
    className: "domain-status-active" 
  },
  expiring: { 
    label: "status.expiring", 
    className: "domain-status-expiring" 
  },
  expired: { 
    label: "status.expired", 
    className: "domain-status-expired" 
  },
  reserved: { 
    label: "status.reserved", 
    className: "domain-status-reserved" 
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
    <Badge 
      variant="outline" 
      className={cn("border font-normal flex justify-center items-center h-[24px] min-w-[80px]", config.className, className)}
    >
      {t(config.label)}
    </Badge>
  );
}
