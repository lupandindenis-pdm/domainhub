import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFolders } from "@/hooks/use-folders";
import { useAllDomains } from "@/hooks/use-all-domains";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Plus, Trash2, Pencil, Check, X, Search } from "lucide-react";
import { toast } from "sonner";
import { DomainTypeBadge } from "@/components/domains/DomainTypeBadge";
import { DomainStatusBadge } from "@/components/domains/DomainStatusBadge";
import { Checkbox } from "@/components/ui/checkbox";

export default function FolderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFolderById, updateFolder, deleteFolder, addDomainsToFolder, removeDomainFromFolder } = useFolders();
  const allDomains = useAllDomains();

  const folder = getFolderById(id!);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [selectedToAdd, setSelectedToAdd] = useState<Set<string>>(new Set());

  const folderDomains = useMemo(() => {
    if (!folder) return [];
    return allDomains.filter(d => folder.domainIds.includes(d.id));
  }, [folder, allDomains]);

  const availableDomains = useMemo(() => {
    if (!folder) return [];
    const inFolder = new Set(folder.domainIds);
    return allDomains.filter(d => !inFolder.has(d.id));
  }, [folder, allDomains]);

  const filteredAvailable = useMemo(() => {
    if (!addSearch.trim()) return availableDomains;
    const q = addSearch.toLowerCase();
    return availableDomains.filter(d =>
      (d.name || "").toLowerCase().includes(q) ||
      (d.project || "").toLowerCase().includes(q)
    );
  }, [availableDomains, addSearch]);

  if (!folder) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-medium mb-2">Папка не найдена</h2>
        <p className="text-muted-foreground mb-4">Возможно, она была удалена</p>
        <Button variant="outline" onClick={() => navigate("/folders")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          К списку папок
        </Button>
      </div>
    );
  }

  const handleStartEdit = () => {
    setEditName(folder.name);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const name = editName.trim();
    if (!name) {
      toast.error("Название не может быть пустым");
      return;
    }
    updateFolder(folder.id, { name });
    setIsEditing(false);
    toast.success("Название обновлено");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName("");
  };

  const handleDelete = () => {
    deleteFolder(folder.id);
    toast.success("Папка удалена", { description: folder.name });
    navigate("/folders");
  };

  const handleOpenAddModal = () => {
    setSelectedToAdd(new Set());
    setAddSearch("");
    setShowAddModal(true);
  };

  const handleToggleSelect = (domainId: string) => {
    setSelectedToAdd(prev => {
      const next = new Set(prev);
      if (next.has(domainId)) {
        next.delete(domainId);
      } else {
        next.add(domainId);
      }
      return next;
    });
  };

  const handleAddDomains = () => {
    if (selectedToAdd.size === 0) return;
    addDomainsToFolder(folder.id, [...selectedToAdd]);
    toast.success(`Добавлено ${selectedToAdd.size} ${selectedToAdd.size === 1 ? "домен" : "доменов"}`);
    setShowAddModal(false);
    setSelectedToAdd(new Set());
  };

  const handleRemoveDomain = (domainId: string, domainName: string) => {
    removeDomainFromFolder(folder.id, domainId);
    toast.success("Домен удалён из папки", { description: domainName });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/folders")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") handleCancelEdit();
                }}
                className="text-2xl font-bold h-auto py-1 max-w-md"
                autoFocus
              />
              <Button size="icon" variant="ghost" onClick={handleSaveEdit}>
                <Check className="h-4 w-4 text-green-500" />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{folder.name}</h1>
              <Button size="icon" variant="ghost" onClick={handleStartEdit} className="h-8 w-8">
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          )}
          <p className="text-muted-foreground">
            {folderDomains.length}{" "}
            {folderDomains.length === 1 ? "домен" : folderDomains.length >= 2 && folderDomains.length <= 4 ? "домена" : "доменов"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleOpenAddModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Добавить домены
          </Button>
          <Button variant="destructive" size="icon" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {folderDomains.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">В папке пока нет доменов</p>
          <Button variant="outline" onClick={handleOpenAddModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Добавить домены
          </Button>
        </div>
      ) : (
        <div className="w-full">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40%]">Домен</TableHead>
                <TableHead className="w-[20%]">Проект</TableHead>
                <TableHead className="w-[15%]">Тип</TableHead>
                <TableHead className="w-[15%]">Статус</TableHead>
                <TableHead className="w-[10%] text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {folderDomains.map((domain) => (
                <TableRow
                  key={domain.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/domains/${domain.id}`)}
                >
                  <TableCell className="font-medium">{domain.name}</TableCell>
                  <TableCell className="text-muted-foreground">{domain.project}</TableCell>
                  <TableCell>
                    <DomainTypeBadge type={domain.type} />
                  </TableCell>
                  <TableCell>
                    <DomainStatusBadge status={domain.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveDomain(domain.id, domain.name);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Domains Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Добавить домены в «{folder.name}»</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск доменов..."
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex-1 overflow-auto min-h-0 max-h-[400px] border rounded-md">
            {filteredAvailable.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                {availableDomains.length === 0 ? "Все домены уже в папке" : "Ничего не найдено"}
              </div>
            ) : (
              <div className="divide-y">
                {filteredAvailable.map((domain) => (
                  <label
                    key={domain.id}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/30 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedToAdd.has(domain.id)}
                      onCheckedChange={() => handleToggleSelect(domain.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{domain.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{domain.project}</p>
                    </div>
                    <DomainTypeBadge type={domain.type} />
                  </label>
                ))}
              </div>
            )}
          </div>
          {selectedToAdd.size > 0 && (
            <p className="text-sm text-muted-foreground">
              Выбрано: {selectedToAdd.size}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddDomains} disabled={selectedToAdd.size === 0}>
              Добавить ({selectedToAdd.size})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить папку «{folder.name}»?</AlertDialogTitle>
            <AlertDialogDescription>
              Папка будет удалена. Домены останутся в системе.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
