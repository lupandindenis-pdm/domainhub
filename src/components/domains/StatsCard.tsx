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
        "stat-card group relative transition-all duration-300 overflow-hidden rounded-2xl border border-white/[0.06]",
        onClick && "cursor-pointer hover:border-white/[0.1] hover:translate-y-[-2px] hover:shadow-lg",
        active && "border-white/[0.12] shadow-lg",
      )}
      onClick={onClick}
      style={{
        background: active && bgColor
          ? `linear-gradient(135deg, ${bgColor} 0%, hsl(224 71% 8%) 100%)`
          : undefined,
      }}
    >
      {/* Top accent line */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-[2px] opacity-40 transition-opacity duration-300",
          active ? "opacity-60" : "group-hover:opacity-60"
        )}
        style={{
          background: glowColor
            ? `linear-gradient(90deg, transparent 0%, ${glowColor.replace(/[\d.]+\)$/, '0.8)')} 50%, transparent 100%)`
            : 'linear-gradient(90deg, transparent 0%, hsl(210 100% 52% / 0.4) 50%, transparent 100%)',
        }}
      />

      <div className="flex items-start justify-between relative z-10 p-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">{title}</span>
          <span className="text-3xl font-bold tracking-tight">{value}</span>
          {change && (
            <span className={cn(
              "text-xs font-medium mt-0.5",
              changeType === "positive" && "text-success",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              {change}
            </span>
          )}
        </div>
        <div className="relative">
          <div
            className={cn(
              "absolute inset-0 rounded-xl blur-xl opacity-0 transition-opacity duration-300",
              active ? "opacity-40" : "group-hover:opacity-30"
            )}
            style={{ backgroundColor: glowColor?.replace(/[\d.]+\)$/, '0.6)') }}
          />
          <div className={cn(
            "relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.06] transition-colors duration-300 group-hover:bg-white/[0.08]",
            iconColor
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
      
      {children}

      {/* Subtle glow on hover */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl transition-opacity duration-300",
          active ? "opacity-40" : "opacity-0 group-hover:opacity-50"
        )}
        style={{
          background: glowColor
            ? `radial-gradient(ellipse at 20% 80%, ${glowColor} 0%, transparent 70%)`
            : 'radial-gradient(ellipse at 20% 80%, hsl(210 100% 52% / 0.06) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
