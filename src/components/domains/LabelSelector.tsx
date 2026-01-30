import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label as LabelUI } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tag, Plus, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/types/domain";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LabelSelectorProps {
  currentLabelId?: string;
  labels: Label[];
  onLabelChange: (labelId: string | undefined) => void;
  onCreateLabel: (name: string, color: string) => void;
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
}: LabelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);
  const [selectedLabelId, setSelectedLabelId] = useState<string | undefined>(currentLabelId);

  const currentLabel = labels.find((l) => l.id === currentLabelId);

  const handleSave = () => {
    onLabelChange(selectedLabelId);
    setOpen(false);
    toast.success(selectedLabelId ? "Метка применена" : "Метка удалена");
  };

  const handleCancel = () => {
    setSelectedLabelId(currentLabelId);
    setIsCreating(false);
    setNewLabelName("");
    setNewLabelColor(LABEL_COLORS[0]);
    setOpen(false);
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
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 h-9 border-border/50",
            currentLabel && "border-0"
          )}
          style={
            currentLabel
              ? {
                  backgroundColor: `${currentLabel.color}20`,
                  color: currentLabel.color,
                }
              : undefined
          }
        >
          {currentLabel ? (
            <>
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: currentLabel.color }}
              />
              <span>{currentLabel.name}</span>
            </>
          ) : (
            <>
              <Tag className="h-4 w-4" />
              <span>Метка</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex flex-col">
          <div className="px-4 py-3 border-b">
            <h4 className="font-semibold text-sm">Метка домена</h4>
          </div>

          {!isCreating ? (
            <>
              <div className="p-2 max-h-[300px] overflow-y-auto">
                <RadioGroup
                  value={selectedLabelId || "none"}
                  onValueChange={(value) =>
                    setSelectedLabelId(value === "none" ? undefined : value)
                  }
                >
                  <div className="flex items-center space-x-2 rounded-md px-3 py-2 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="none" id="label-none" />
                    <LabelUI
                      htmlFor="label-none"
                      className="flex-1 cursor-pointer text-sm font-normal"
                    >
                      Без метки
                    </LabelUI>
                  </div>

                  {labels.map((label) => (
                    <div
                      key={label.id}
                      className="flex items-center space-x-2 rounded-md px-3 py-2 hover:bg-accent cursor-pointer"
                    >
                      <RadioGroupItem value={label.id} id={`label-${label.id}`} />
                      <LabelUI
                        htmlFor={`label-${label.id}`}
                        className="flex-1 cursor-pointer flex items-center gap-2 text-sm font-normal"
                      >
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        <span>{label.name}</span>
                      </LabelUI>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
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

          {!isCreating && (
            <div className="border-t p-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleCancel}
              >
                Отмена
              </Button>
              <Button size="sm" className="flex-1" onClick={handleSave}>
                Сохранить
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
