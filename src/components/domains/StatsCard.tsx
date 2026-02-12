import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  glowColor?: string;
  onClick?: () => void;
  active?: boolean;
  children?: React.ReactNode;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-primary",
  bgColor,
  glowColor,
  onClick,
  active = false,
  children,
}: StatsCardProps) {
  return (
    <div 
      className={cn(
        "stat-card group transition-all duration-300 overflow-hidden",
        onClick && "cursor-pointer",
      )}
      onClick={onClick}
      style={{
        background: active && bgColor
          ? `linear-gradient(135deg, ${bgColor} 0%, hsl(224 71% 8%) 100%)`
          : undefined,
      }}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{title}</span>
          <span className="text-3xl font-bold tracking-tight">{value}</span>
          {change && (
            <span className={cn(
              "text-xs font-medium",
              changeType === "positive" && "text-success",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              {change}
            </span>
          )}
        </div>
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg bg-background/50",
          iconColor
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      {children}

      {/* Subtle glow on hover */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-60"
        style={{
          background: glowColor
            ? `radial-gradient(ellipse at 20% 50%, ${glowColor} 0%, transparent 70%)`
            : 'radial-gradient(ellipse at 20% 50%, hsl(210 100% 52% / 0.06) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
