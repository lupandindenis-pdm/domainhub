import { DomainType } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

const typeConfig: Record<DomainType, { label: string; className: string }> = {
  landing: { 
    label: "badges.landing", 
    className: "bg-[hsl(262,83%,58%,0.15)] text-[hsl(262,83%,58%)] border-[hsl(262,83%,58%,0.3)]" 
  },
  company: { 
    label: "badges.company", 
    className: "bg-[hsl(187,85%,43%,0.15)] text-[hsl(187,85%,43%)] border-[hsl(187,85%,43%,0.3)]" 
  },
  product: { 
    label: "badges.product", 
    className: "bg-[hsl(142,76%,36%,0.15)] text-[hsl(142,76%,36%)] border-[hsl(142,76%,36%,0.3)]" 
  },
  mirror: { 
    label: "badges.mirror", 
    className: "bg-[hsl(38,92%,50%,0.15)] text-[hsl(38,92%,50%)] border-[hsl(38,92%,50%,0.3)]" 
  },
  seo: { 
    label: "badges.seo", 
    className: "bg-[hsl(330,81%,60%,0.15)] text-[hsl(330,81%,60%)] border-[hsl(330,81%,60%,0.3)]" 
  },
  subdomain: { 
    label: "badges.subdomain", 
    className: "bg-[hsl(215,90%,60%,0.15)] text-[hsl(215,90%,60%)] border-[hsl(215,90%,60%,0.3)]" 
  },
  referral: { 
    label: "badges.referral", 
    className: "bg-[hsl(24,100%,50%,0.15)] text-[hsl(24,100%,50%)] border-[hsl(24,100%,50%,0.3)]" 
  },
  redirect: { 
    label: "badges.redirect", 
    className: "bg-[hsl(280,68%,60%,0.15)] text-[hsl(280,68%,60%)] border-[hsl(280,68%,60%,0.3)]" 
  },
  technical: { 
    label: "badges.technical", 
    className: "bg-[hsl(215,20%,55%,0.15)] text-[hsl(215,20%,55%)] border-[hsl(215,20%,55%,0.3)]" 
  },
  b2b: { 
    label: "badges.b2b", 
    className: "bg-[hsl(172,66%,50%,0.15)] text-[hsl(172,66%,50%)] border-[hsl(172,66%,50%,0.3)]" 
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
      className={cn("border font-normal flex justify-center items-center h-[26px] px-3 min-w-fit whitespace-nowrap", config.className, className)}
    >
      {t(config.label)}
    </Badge>
  );
}
