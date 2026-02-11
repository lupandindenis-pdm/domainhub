import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFolders } from "@/hooks/use-folders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Folder, ChevronRight, Search } from "lucide-react";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Папки</h1>
          <p className="text-muted-foreground">Логическая группировка доменов</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Создать папку
        </Button>
      </div>

      {folders.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск папок..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 max-w-sm"
          />
        </div>
      )}

      {folders.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Folder className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">Нет папок</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Создайте первую папку для группировки доменов
            </p>
            <Button variant="outline" onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Создать папку
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredFolders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Ничего не найдено</p>
          ) : filteredFolders.map((folder) => (
            <Card
              key={folder.id}
              className="cursor-pointer transition-colors hover:bg-secondary/30"
              onClick={() => navigate(`/folders/${folder.id}`)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${folder.color || '#3b82f6'}20` }}>
                    <Folder className="h-5 w-5" style={{ color: folder.color || '#3b82f6' }} />
                  </div>
                  <div>
                    <h3 className="font-medium">{folder.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {folder.domainIds.length}{" "}
                      {folder.domainIds.length === 1 ? "домен" : folder.domainIds.length >= 2 && folder.domainIds.length <= 4 ? "домена" : "доменов"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать папку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Название папки"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Цвет</p>
              <div className="flex flex-wrap gap-2">
                {FOLDER_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={cn(
                      "h-8 w-8 rounded-full transition-all border-2",
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
