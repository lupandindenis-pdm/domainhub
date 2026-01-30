import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as LabelUI } from "@/components/ui/label";
import { Plus, X, Check, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/types/domain";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface LabelSelectorProps {
  currentLabelId?: string;
  labels: Label[];
  onLabelChange: (labelId: string | undefined) => void;
  onCreateLabel: (name: string, color: string) => void;
  children?: React.ReactNode;
}

const LABEL_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
];

export function LabelSelector({
  currentLabelId,
  labels,
  onLabelChange,
  onCreateLabel,
  children,
}: LabelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelectLabel = (labelId: string | undefined) => {
    onLabelChange(labelId);
    setOpen(false);
    toast.success(labelId ? "Метка применена" : "Метка удалена");
  };

  const handleRemoveLabel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLabelChange(undefined);
    setOpen(false);
    toast.success("Метка удалена");
  };

  const handleCreateLabel = () => {
    if (!newLabelName.trim()) {
      toast.error("Введите название метки");
      return;
    }

    onCreateLabel(newLabelName.trim(), newLabelColor);
    setIsCreating(false);
    setNewLabelName("");
    setNewLabelColor(LABEL_COLORS[0]);
    toast.success("Метка создана");
    
    // Auto-scroll to new label after creation
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex flex-col">
          <div className="px-4 py-3 border-b">
            <h4 className="font-semibold text-sm">Состояние домена</h4>
          </div>

          {!isCreating ? (
            <>
              <div ref={scrollRef} className="p-2 max-h-[300px] overflow-y-auto">
                {/* No label option */}
                <div
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-2.5 cursor-pointer transition-colors",
                    !currentLabelId
                      ? "bg-accent/50 border border-border"
                      : "hover:bg-accent/50"
                  )}
                  onClick={() => handleSelectLabel(undefined)}
                >
                  <div className="flex items-center gap-2.5">
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Без метки</span>
                  </div>
                  {!currentLabelId && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>

                {/* Label list */}
                {labels.map((label) => {
                  const isSelected = currentLabelId === label.id;
                  return (
                    <div
                      key={label.id}
                      className={cn(
                        "flex items-center justify-between rounded-md px-3 py-2.5 cursor-pointer transition-colors group",
                        isSelected
                          ? "bg-accent/50 border border-border"
                          : "hover:bg-accent/50"
                      )}
                      onClick={() => handleSelectLabel(label.id)}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div
                          className="h-3 w-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="text-sm truncate">{label.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isSelected && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={handleRemoveLabel}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                            <Check className="h-4 w-4 text-primary" />
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator />
              
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsCreating(true)}
                >
                  <Plus className="h-4 w-4" />
                  Создать метку
                </Button>
              </div>
            </>
          ) : (
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <LabelUI htmlFor="label-name" className="text-sm font-medium">
                  Название
                </LabelUI>
                <Input
                  id="label-name"
                  placeholder="Введите название"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newLabelName.trim()) {
                      handleCreateLabel();
                    }
                  }}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <LabelUI className="text-sm font-medium">Цвет</LabelUI>
                <div className="grid grid-cols-8 gap-2">
                  {LABEL_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "h-8 w-8 rounded-md border-2 transition-all",
                        newLabelColor === color
                          ? "border-foreground scale-110"
                          : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewLabelColor(color)}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setIsCreating(false);
                    setNewLabelName("");
                    setNewLabelColor(LABEL_COLORS[0]);
                  }}
                >
                  Отмена
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={handleCreateLabel}
                  disabled={!newLabelName.trim()}
                >
                  Создать
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
