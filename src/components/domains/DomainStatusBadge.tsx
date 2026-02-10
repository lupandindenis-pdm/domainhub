import { DomainStatus } from "@/types/domain";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Pause, 
  Timer,
  Ban,
  FlaskConical
} from "lucide-react";

const statusConfig: Record<DomainStatus, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  actual: {
    label: "status.actual",
    className: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    icon: CheckCircle
  },
  not_actual: {
    label: "status.not_actual",
    className: "bg-rose-500/20 text-rose-700 dark:text-rose-300",
    icon: XCircle
  },
  unknown: {
    label: "status.unknown",
    className: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
    icon: AlertCircle
  },
  not_configured: {
    label: "status.not_configured",
    className: "bg-slate-500/20 text-slate-700 dark:text-slate-300",
    icon: Clock
  },
  spare: {
    label: "status.spare",
    className: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",
    icon: Pause
  },
  expiring: {
    label: "status.expiring",
    className: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
    icon: Timer
  },
  expired: {
    label: "status.expired",
    className: "bg-red-500/20 text-red-700 dark:text-red-300",
    icon: XCircle
  },
  blocked: {
    label: "status.blocked",
    className: "bg-red-500/20 text-red-700 dark:text-red-300",
    icon: Ban
  },
  test: {
    label: "status.test",
    className: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
    icon: FlaskConical
  },
};

interface DomainStatusBadgeProps {
  status: DomainStatus;
  className?: string;
}

export function DomainStatusBadge({ status, className }: DomainStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.unknown;
  const { t } = useLanguage();
  const Icon = config.icon;
  
  return (
    <div className={cn(
      "inline-flex items-center h-10 px-3 rounded-md border-none text-sm min-w-fit whitespace-nowrap gap-2",
      config.className,
      className
    )}>
      <Icon className="h-4 w-4" />
      {t(config.label)}
    </div>
  );
}
