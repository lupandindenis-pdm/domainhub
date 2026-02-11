import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFolders } from "@/hooks/use-folders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Folder, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Folders() {
  const navigate = useNavigate();
  const { folders, createFolder } = useFolders();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

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
    createFolder(name);
    toast.success("Папка создана", { description: name });
    setNewFolderName("");
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
          {folders.map((folder) => (
            <Card
              key={folder.id}
              className="cursor-pointer transition-colors hover:bg-secondary/30"
              onClick={() => navigate(`/folders/${folder.id}`)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Folder className="h-5 w-5 text-primary" />
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
          <div className="py-4">
            <Input
              placeholder="Название папки"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); setNewFolderName(""); }}>
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
