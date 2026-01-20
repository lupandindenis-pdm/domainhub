import { DomainType } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const typeConfig: Record<DomainType, { label: string; className: string }> = {
  landing: { 
    label: "Лендинг", 
    className: "bg-[hsl(262,83%,58%,0.15)] text-[hsl(262,83%,58%)] border-[hsl(262,83%,58%,0.3)]" 
  },
  company: { 
    label: "Сайт компании", 
    className: "bg-[hsl(187,85%,43%,0.15)] text-[hsl(187,85%,43%)] border-[hsl(187,85%,43%,0.3)]" 
  },
  product: { 
    label: "Продукт", 
    className: "bg-[hsl(142,76%,36%,0.15)] text-[hsl(142,76%,36%)] border-[hsl(142,76%,36%,0.3)]" 
  },
  mirror: { 
    label: "Зеркало", 
    className: "bg-[hsl(38,92%,50%,0.15)] text-[hsl(38,92%,50%)] border-[hsl(38,92%,50%,0.3)]" 
  },
  seo: { 
    label: "SEO-сателлит", 
    className: "bg-[hsl(330,81%,60%,0.15)] text-[hsl(330,81%,60%)] border-[hsl(330,81%,60%,0.3)]" 
  },
  subdomain: { 
    label: "Поддомен", 
    className: "bg-[hsl(215,90%,60%,0.15)] text-[hsl(215,90%,60%)] border-[hsl(215,90%,60%,0.3)]" 
  },
  referral: { 
    label: "Реферальный", 
    className: "bg-[hsl(24,100%,50%,0.15)] text-[hsl(24,100%,50%)] border-[hsl(24,100%,50%,0.3)]" 
  },
  redirect: { 
    label: "Редиректор", 
    className: "bg-[hsl(280,68%,60%,0.15)] text-[hsl(280,68%,60%)] border-[hsl(280,68%,60%,0.3)]" 
  },
  technical: { 
    label: "Технический", 
    className: "bg-[hsl(215,20%,55%,0.15)] text-[hsl(215,20%,55%)] border-[hsl(215,20%,55%,0.3)]" 
  },
  b2b: { 
    label: "B2B", 
    className: "bg-[hsl(172,66%,50%,0.15)] text-[hsl(172,66%,50%)] border-[hsl(172,66%,50%,0.3)]" 
  },
};

interface DomainTypeBadgeProps {
  type: DomainType;
  className?: string;
}

export function DomainTypeBadge({ type, className }: DomainTypeBadgeProps) {
  const config = typeConfig[type];
  
  return (
    <Badge 
      variant="outline" 
      className={cn("border font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
