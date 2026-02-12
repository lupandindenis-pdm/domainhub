import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFolders } from "@/hooks/use-folders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Folder, FolderOpen, Search, Globe, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { FOLDER_COLORS } from "@/types/folder";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

function pluralDomains(n: number) {
  if (n === 1) return "домен";
  if (n >= 2 && n <= 4) return "домена";
  return "доменов";
}

export default function Folders() {
  const navigate = useNavigate();
  const { folders, createFolder } = useFolders();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0].value);
  const [search, setSearch] = useState("");

  const filteredFolders = folders.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalDomains = folders.reduce((sum, f) => sum + f.domainIds.length, 0);

  const handleCreate = () => {
    const name = newFolderName.trim();
    if (!name) {
      toast.error("Введите название папки");
      return;
    }
    const existing = folders.find(f => f.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      toast.error("Папка с таким названием уже существует");
      return;
    }
    createFolder(name, newFolderColor);
    toast.success("Папка создана", { description: name });
    setNewFolderName("");
    setNewFolderColor(FOLDER_COLORS[0].value);
    setShowCreateDialog(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Папки</h1>
        <p className="text-muted-foreground">Логическая группировка доменов</p>
      </div>

      {/* Stats bar */}
      {folders.length > 0 && (
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            <span>{folders.length} {folders.length === 1 ? "папка" : folders.length >= 2 && folders.length <= 4 ? "папки" : "папок"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>{totalDomains} {pluralDomains(totalDomains)} в папках</span>
          </div>
        </div>
      )}

      {/* Search */}
      {folders.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск папок..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 max-w-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      )}

      {/* Empty state */}
      {folders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 mb-6">
            <FolderOpen className="h-10 w-10 text-muted-foreground/60" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Нет папок</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Создайте папки для удобной группировки и организации ваших доменов
          </p>
          <Button
            variant="outline"
            onClick={() => setShowCreateDialog(true)}
            className="gap-2 border-dashed border-primary text-primary bg-transparent hover:bg-primary/5"
          >
            <Plus className="h-4 w-4" />
            Создать первую папку
          </Button>
        </div>
      ) : (
        /* Folder grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFolders.length === 0 ? (
            <div className="col-span-full text-sm text-muted-foreground text-center py-12">
              Ничего не найдено
            </div>
          ) : filteredFolders.map((folder) => {
            const color = folder.color || '#3b82f6';
            const count = folder.domainIds.length;
            let dateStr = "";
            try {
              dateStr = format(parseISO(folder.createdAt), "d MMM yyyy", { locale: ru });
            } catch {}

            return (
              <div
                key={folder.id}
                className="group relative rounded-xl border-none overflow-hidden cursor-pointer transition-all hover:shadow-md"
                style={{ backgroundColor: `${color}08` }}
                onClick={() => navigate(`/folders/${folder.id}`)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl transition-colors" style={{ backgroundColor: `${color}15` }}>
                      <Folder className="h-5.5 w-5.5" style={{ color }} />
                    </div>
                    <div
                      className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${color}15`, color }}
                    >
                      <Globe className="h-3 w-3" />
                      {count}
                    </div>
                  </div>

                  <h3 className="font-semibold text-base mb-1 truncate group-hover:text-foreground/90">
                    {folder.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {count} {pluralDomains(count)}
                  </p>

                  {dateStr && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 mt-3 pt-3 border-t border-border/50">
                      <Calendar className="h-3 w-3" />
                      {dateStr}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Create folder card */}
          <div
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-primary/40 cursor-pointer transition-all hover:border-primary hover:bg-primary/5 min-h-[160px]"
            onClick={() => setShowCreateDialog(true)}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-3">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-primary">Создать папку</p>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="border-none">
          <DialogHeader>
            <DialogTitle>Создать папку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Название</label>
              <Input
                placeholder="Например: SEO-домены"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Цвет</label>
              <div className="flex flex-wrap gap-2">
                {FOLDER_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={cn(
                      "h-8 w-8 rounded-md transition-all border-2",
                      newFolderColor === c.value ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                    )}
                    style={{ backgroundColor: c.value }}
                    onClick={() => setNewFolderColor(c.value)}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); setNewFolderName(""); setNewFolderColor(FOLDER_COLORS[0].value); }}>
              Отмена
            </Button>
            <Button onClick={handleCreate} disabled={!newFolderName.trim()}>
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
