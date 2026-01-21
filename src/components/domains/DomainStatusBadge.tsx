import { DomainStatus } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

const statusConfig: Record<DomainStatus, { label: string; className: string }> = {
  actual: {
    label: "status.actual",
    className: "bg-emerald-200 text-emerald-900",
  },
  not_actual: {
    label: "status.not_actual",
    className: "bg-rose-200 text-rose-950",
  },
  unknown: {
    label: "status.unknown",
    className: "bg-amber-200 text-amber-950",
  },
  not_configured: {
    label: "status.not_configured",
    className: "bg-slate-200 text-slate-800",
  },
  spare: {
    label: "status.spare",
    className: "bg-indigo-200 text-indigo-950",
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
      variant="secondary"
      className={cn(
        "border-0 px-3 py-1 text-sm font-medium leading-none",
        config.className,
        className,
      )}
    >
      {t(config.label)}
    </Badge>
  );
}
