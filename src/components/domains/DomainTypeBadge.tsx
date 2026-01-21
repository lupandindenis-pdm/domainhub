import { DomainType } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

const typeConfig: Record<DomainType, { label: string; className: string }> = {
  site: { 
    label: "badges.site", 
    className: "bg-blue-600/20 text-white border-blue-600/20" 
  },
  product: { 
    label: "badges.product", 
    className: "bg-emerald-600/20 text-white border-emerald-600/20" 
  },
  landing: { 
    label: "badges.landing", 
    className: "bg-violet-600/20 text-white border-violet-600/20" 
  },
  mirror: { 
    label: "badges.mirror", 
    className: "bg-amber-600/20 text-white border-amber-600/20" 
  },
  seo: { 
    label: "badges.seo", 
    className: "bg-pink-600/20 text-white border-pink-600/20" 
  },
  referral: { 
    label: "badges.referral", 
    className: "bg-orange-600/20 text-white border-orange-600/20" 
  },
  redirect: { 
    label: "badges.redirect", 
    className: "bg-indigo-600/20 text-white border-indigo-600/20" 
  },
  technical: { 
    label: "badges.technical", 
    className: "bg-slate-600/20 text-white border-slate-600/20" 
  },
  subdomain: { 
    label: "badges.subdomain", 
    className: "bg-cyan-600/20 text-white border-cyan-600/20" 
  },
};

interface DomainTypeBadgeProps {
  type: DomainType;
  className?: string;
}

export function DomainTypeBadge({ type, className }: DomainTypeBadgeProps) {
  const config = typeConfig[type];
  const { t } = useLanguage();
  
  return (
    <Badge 
      variant="outline" 
      className={cn("border font-normal text-xs flex justify-center items-center h-[22px] px-2 min-w-fit whitespace-nowrap leading-none", config.className, className)}
    >
      {t(config.label)}
    </Badge>
  );
}
