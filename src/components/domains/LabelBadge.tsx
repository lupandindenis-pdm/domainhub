import { Label } from "@/types/domain";
import { cn } from "@/lib/utils";

interface LabelBadgeProps {
  label: Label;
  className?: string;
}

export function LabelBadge({ label, className }: LabelBadgeProps) {
  // Calculate text color based on background brightness
  const getTextColor = (hexColor: string) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155 ? "#000000" : "#ffffff";
  };

  // Make color less contrasty by adding opacity
  const softColor = `${label.color}33`; // 20% opacity
  
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2.5 rounded-full text-xs font-medium whitespace-nowrap text-white/70 h-6",
        className
      )}
      style={{
        backgroundColor: softColor,
      }}
    >
      {label.name}
    </span>
  );
}
