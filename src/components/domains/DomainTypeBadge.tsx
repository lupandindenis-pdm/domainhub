import { DomainType } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

const typeConfig: Record<DomainType, { label: string; className: string }> = {
  landing: { 
    label: "badges.landing", 
    className: "bg-[hsl(262,83%,58%,0.15)] text-[hsl(262,83%,58%)] border-[hsl(262,83%,58%,0.3)]" 
  },
  seo: { 
    label: "badges.seo", 
    className: "bg-[hsl(262,83%,58%,0.15)] text-[hsl(262,83%,58%)] border-[hsl(262,83%,58%,0.3)]" 
  },
  mirror: { 
    label: "badges.mirror", 
    className: "bg-[hsl(262,83%,58%,0.15)] text-[hsl(262,83%,58%)] border-[hsl(262,83%,58%,0.3)]" 
  },
  site: { 
    label: "badges.site", 
    className: "bg-[hsl(262,83%,58%,0.15)] text-[hsl(262,83%,58%)] border-[hsl(262,83%,58%,0.3)]" 
  },
  subdomain: { 
    label: "badges.subdomain", 
    className: "bg-[hsl(262,83%,58%,0.15)] text-[hsl(262,83%,58%)] border-[hsl(262,83%,58%,0.3)]" 
  },
  referral: { 
    label: "badges.referral", 
    className: "bg-[hsl(262,83%,58%,0.15)] text-[hsl(262,83%,58%)] border-[hsl(262,83%,58%,0.3)]" 
  },
  redirect: { 
    label: "badges.redirect", 
    className: "bg-[hsl(262,83%,58%,0.15)] text-[hsl(262,83%,58%)] border-[hsl(262,83%,58%,0.3)]" 
  },
  technical: { 
    label: "badges.technical", 
    className: "bg-[hsl(262,83%,58%,0.15)] text-[hsl(262,83%,58%)] border-[hsl(262,83%,58%,0.3)]" 
  },
  product: { 
    label: "badges.product", 
    className: "bg-[hsl(262,83%,58%,0.15)] text-[hsl(262,83%,58%)] border-[hsl(262,83%,58%,0.3)]" 
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
      className={cn("border font-normal text-sm flex justify-center items-center h-[28px] px-2.5 min-w-fit whitespace-nowrap", config.className, className)}
    >
      {t(config.label)}
    </Badge>
  );
}
