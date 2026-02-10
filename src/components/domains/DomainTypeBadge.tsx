import { DomainType } from "@/types/domain";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";
import { 
  Globe, 
  Package, 
  Target, 
  Repeat, 
  Search, 
  Users, 
  ArrowRightLeft, 
  Settings, 
  Layers,
  Building
} from "lucide-react";

const typeConfig: Record<DomainType, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  site: { 
    label: "badges.site", 
    className: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
    icon: Globe
  },
  product: { 
    label: "badges.product", 
    className: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    icon: Package
  },
  landing: { 
    label: "badges.landing", 
    className: "bg-violet-500/20 text-violet-700 dark:text-violet-300",
    icon: Target
  },
  mirror: { 
    label: "badges.mirror", 
    className: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
    icon: Repeat
  },
  seo: { 
    label: "badges.seo", 
    className: "bg-pink-500/20 text-pink-700 dark:text-pink-300",
    icon: Search
  },
  referral: { 
    label: "badges.referral", 
    className: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
    icon: Users
  },
  redirect: { 
    label: "badges.redirect", 
    className: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",
    icon: ArrowRightLeft
  },
  technical: { 
    label: "badges.technical", 
    className: "bg-slate-500/20 text-slate-700 dark:text-slate-300",
    icon: Settings
  },
  subdomain: { 
    label: "badges.subdomain", 
    className: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",
    icon: Layers
  },
  b2b: { 
    label: "badges.b2b", 
    className: "bg-teal-500/20 text-teal-700 dark:text-teal-300",
    icon: Building
  },
  unknown: { 
    label: "badges.unknown", 
    className: "bg-gray-500/20 text-gray-700 dark:text-gray-300",
    icon: Globe
  },
};

interface DomainTypeBadgeProps {
  type: DomainType;
  className?: string;
}

export function DomainTypeBadge({ type, className }: DomainTypeBadgeProps) {
  const config = typeConfig[type] || typeConfig.unknown;
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
