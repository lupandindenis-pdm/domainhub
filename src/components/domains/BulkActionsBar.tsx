import { Button } from "@/components/ui/button";
import { Download, EyeOff, FolderInput, Trash2, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

interface BulkActionsBarProps {
  selectedCount: number;
  onExportSelected: () => void;
  onHideSelected: () => void;
  onMoveSelected: () => void;
  onDeleteSelected: () => void;
  onClose: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onExportSelected,
  onHideSelected,
  onMoveSelected,
  onDeleteSelected,
  onClose,
}: BulkActionsBarProps) {
  const { t } = useLanguage();

  if (selectedCount === 0) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      "bg-secondary shadow-lg",
      "animate-in slide-in-from-bottom-5 duration-300"
    )}>
      <div className="container max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Выбрано доменов:</span>
            <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-medium min-w-[24px]">{selectedCount}</span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExportSelected}
              className="gap-2 hover:bg-transparent"
            >
              <Download className="h-4 w-4" />
              Скачать CSV
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onHideSelected}
              className="gap-2 hover:bg-transparent"
            >
              <EyeOff className="h-4 w-4" />
              Скрыть
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveSelected}
              className="gap-2 hover:bg-transparent"
            >
              <FolderInput className="h-4 w-4" />
              Переместить
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onDeleteSelected}
              className="gap-2 text-destructive hover:text-destructive hover:bg-transparent"
            >
              <Trash2 className="h-4 w-4" />
              Удалить
            </Button>

            <div className="w-px h-6 bg-border mx-2" />

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="gap-2 hover:bg-transparent"
            >
              <X className="h-4 w-4" />
              Закрыть
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
