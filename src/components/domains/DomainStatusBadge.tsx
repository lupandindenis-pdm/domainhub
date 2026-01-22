import { DomainStatus } from "@/types/domain";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

const statusConfig: Record<DomainStatus, { label: string; className: string }> = {
  actual: {
    label: "status.actual",
    className: "text-emerald-500",
  },
  not_actual: {
    label: "status.not_actual",
    className: "text-rose-500",
  },
  unknown: {
    label: "status.unknown",
    className: "text-amber-500",
  },
  not_configured: {
    label: "status.not_configured",
    className: "text-slate-500",
  },
  spare: {
    label: "status.spare",
    className: "text-indigo-500",
  },
  expiring: {
    label: "status.expiring",
    className: "text-orange-500",
  },
  expired: {
    label: "status.expired",
    className: "text-red-500",
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
    <span
      className={cn(
        "text-sm font-medium",
        config.className,
        className,
      )}
    >
      {t(config.label)}
    </span>
  );
}
