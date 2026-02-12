import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Folder as FolderIcon, FolderInput, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Folder } from "@/types/folder";

interface MoveDomainsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  selectedDomainIds: Set<string>;
  folders: Folder[];
  onMove: (folderId: string) => void;
}

function pluralDomains(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "домен";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "домена";
  return "доменов";
}

export function MoveDomainsModal({
  open,
  onOpenChange,
  selectedCount,
  selectedDomainIds,
  folders,
  onMove,
}: MoveDomainsModalProps) {
  const [search, setSearch] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  const filteredFolders = useMemo(() => {
    if (!search.trim()) return folders;
    const q = search.toLowerCase();
    return folders.filter((f) => f.name.toLowerCase().includes(q));
  }, [folders, search]);

  // Count how many selected domains are already in the selected folder
  const alreadyInFolder = useMemo(() => {
    if (!selectedFolderId) return 0;
    const folder = folders.find((f) => f.id === selectedFolderId);
    if (!folder) return 0;
    return [...selectedDomainIds].filter((id) => folder.domainIds.includes(id)).length;
  }, [selectedFolderId, selectedDomainIds, folders]);

  const handleMove = async () => {
    if (!selectedFolderId) return;
    setIsMoving(true);
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 600));
    onMove(selectedFolderId);
    setIsMoving(false);
    handleClose();
  };

  const handleClose = () => {
    setSearch("");
    setSelectedFolderId(null);
    setIsMoving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg h-[70vh] flex flex-col border-none bg-card/80 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <FolderInput className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-base font-semibold">
                Переместить {selectedCount} {pluralDomains(selectedCount)}
              </div>
              <p className="text-xs font-normal text-muted-foreground mt-0.5">
                Выберите папку, в которую будут перемещены выбранные домены
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Найти папку..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        {/* Already in folder warning */}
        {selectedFolderId && alreadyInFolder > 0 && (
          <div className="text-xs text-yellow-500 bg-yellow-500/10 rounded-lg px-3 py-2 animate-in fade-in slide-in-from-top-1 duration-200">
            {alreadyInFolder} {pluralDomains(alreadyInFolder)} уже {alreadyInFolder === 1 ? "находится" : "находятся"} в выбранной папке
          </div>
        )}

        {/* Folder list */}
        <div className="flex-1 overflow-auto min-h-0 border-y border-border/50">
          {folders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-3">
              <Globe className="h-8 w-8 opacity-30" />
              <p>У вас пока нет созданных папок</p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-white/[0.08]"
                onClick={() => {
                  handleClose();
                  window.location.href = "/folders";
                }}
              >
                <FolderIcon className="h-3.5 w-3.5" />
                Перейти в раздел папок
              </Button>
            </div>
          ) : filteredFolders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
              <Globe className="h-6 w-6 mb-2 opacity-40" />
              Ничего не найдено
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {filteredFolders.map((folder) => {
                const isSelected = selectedFolderId === folder.id;
                return (
                  <button
                    key={folder.id}
                    type="button"
                    className={cn(
                      "flex items-center gap-3 w-full px-4 py-3 text-left transition-colors",
                      isSelected
                        ? "bg-primary/10"
                        : "hover:bg-secondary/30"
                    )}
                    onClick={() => setSelectedFolderId(isSelected ? null : folder.id)}
                  >
                    {/* Radio */}
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors flex-shrink-0",
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30"
                      )}
                    >
                      {isSelected && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                      )}
                    </div>

                    {/* Folder icon */}
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
                      style={{ backgroundColor: `${folder.color}15` }}
                    >
                      <FolderIcon
                        className="h-4 w-4"
                        style={{ color: folder.color }}
                      />
                    </div>

                    {/* Name + count */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        isSelected && "text-primary"
                      )}>
                        {folder.name}
                      </p>
                    </div>

                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {folder.domainIds.length} {pluralDomains(folder.domainIds.length)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleClose} className="border-white/[0.08]">
            Отмена
          </Button>
          <Button
            disabled={!selectedFolderId || isMoving}
            onClick={handleMove}
            className="gap-2 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
          >
            {isMoving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Перемещение...
              </>
            ) : (
              <>
                <FolderInput className="h-4 w-4" />
                Переместить
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
