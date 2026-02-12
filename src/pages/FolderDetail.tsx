import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFolders } from "@/hooks/use-folders";
import { useAllDomains } from "@/hooks/use-all-domains";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ArrowLeft, Plus, Trash2, SquarePen, Check, X, Search, Folder as FolderIcon, Globe, FolderOpen, Tag, Activity, Copy, ExternalLink, Filter } from "lucide-react";
import { toast } from "sonner";
import { DomainTypeBadge } from "@/components/domains/DomainTypeBadge";
import { DomainStatusBadge } from "@/components/domains/DomainStatusBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { FOLDER_COLORS } from "@/types/folder";
import { cn } from "@/lib/utils";
import { DOMAIN_TYPE_LABELS } from "@/constants/domainTypes";
import { DOMAIN_STATUS_LABELS } from "@/constants/domainTypes";
import { DomainType, DomainStatus } from "@/types/domain";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";

function pluralDomains(n: number) {
  if (n === 1) return "домен";
  if (n >= 2 && n <= 4) return "домена";
  return "доменов";
}

export default function FolderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFolderById, updateFolder, deleteFolder, addDomainsToFolder, removeDomainFromFolder } = useFolders();
  const allDomains = useAllDomains();

  const folder = getFolderById(id!);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [selectedToAdd, setSelectedToAdd] = useState<Set<string>>(new Set());
  const [domainSearch, setDomainSearch] = useState("");
  const [addFilterTypes, setAddFilterTypes] = useState<Set<string>>(new Set());
  const [addFilterStatuses, setAddFilterStatuses] = useState<Set<string>>(new Set());
  const [addFilterProjects, setAddFilterProjects] = useState<Set<string>>(new Set());

  const folderDomains = useMemo(() => {
    if (!folder) return [];
    return allDomains.filter(d => folder.domainIds.includes(d.id));
  }, [folder, allDomains]);

  const filteredFolderDomains = useMemo(() => {
    if (!domainSearch.trim()) return folderDomains;
    const q = domainSearch.toLowerCase();
    return folderDomains.filter(d =>
      (d.name || "").toLowerCase().includes(q) ||
      (d.project || "").toLowerCase().includes(q)
    );
  }, [folderDomains, domainSearch]);

  const availableDomains = useMemo(() => {
    if (!folder) return [];
    const inFolder = new Set(folder.domainIds);
    return allDomains.filter(d => !inFolder.has(d.id));
  }, [folder, allDomains]);

  const availableProjects = useMemo(() => {
    const projects = new Set(availableDomains.map(d => d.project).filter(Boolean));
    return Array.from(projects).sort();
  }, [availableDomains]);

  const filteredAvailable = useMemo(() => {
    return availableDomains.filter(d => {
      if (addSearch.trim()) {
        const q = addSearch.toLowerCase();
        if (!(d.name || "").toLowerCase().includes(q) && !(d.project || "").toLowerCase().includes(q)) return false;
      }
      if (addFilterTypes.size > 0 && !addFilterTypes.has(d.type)) return false;
      if (addFilterStatuses.size > 0 && !addFilterStatuses.has(d.status)) return false;
      if (addFilterProjects.size > 0 && !addFilterProjects.has(d.project)) return false;
      return true;
    });
  }, [availableDomains, addSearch, addFilterTypes, addFilterStatuses, addFilterProjects]);

  if (!folder) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
          <FolderOpen className="h-8 w-8 text-muted-foreground/60" />
        </div>
        <h2 className="text-xl font-medium mb-2">Папка не найдена</h2>
        <p className="text-muted-foreground mb-6">Возможно, она была удалена</p>
        <Button variant="outline" onClick={() => navigate("/folders")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          К списку папок
        </Button>
      </div>
    );
  }

  const color = folder.color || '#3b82f6';

  const handleStartEdit = () => {
    setEditName(folder.name);
    setEditColor(folder.color || '#3b82f6');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const name = editName.trim();
    if (!name) {
      toast.error("Название не может быть пустым");
      return;
    }
    updateFolder(folder.id, { name, color: editColor });
    setIsEditing(false);
    toast.success("Папка обновлена");
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
    setAddFilterTypes(new Set());
    setAddFilterStatuses(new Set());
    setAddFilterProjects(new Set());
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

  const handleToggleAll = () => {
    if (selectedToAdd.size === filteredAvailable.length) {
      setSelectedToAdd(new Set());
    } else {
      setSelectedToAdd(new Set(filteredAvailable.map(d => d.id)));
    }
  };

  const handleAddDomains = () => {
    if (selectedToAdd.size === 0) return;
    addDomainsToFolder(folder.id, [...selectedToAdd]);
    toast.success(`Добавлено ${selectedToAdd.size} ${pluralDomains(selectedToAdd.size)}`);
    setShowAddModal(false);
    setSelectedToAdd(new Set());
  };

  const handleRemoveDomain = (domainId: string, domainName: string) => {
    removeDomainFromFolder(folder.id, domainId);
    toast.success("Домен удалён из папки", { description: domainName });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/folders")} className="shrink-0 -ml-2 mt-0.5">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15` }}>
              <FolderIcon className="h-6 w-6" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit();
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      className="text-xl font-bold h-auto py-1.5 max-w-md focus-visible:ring-0 focus-visible:ring-offset-0"
                      autoFocus
                    />
                    <Button variant="outline" onClick={handleSaveEdit} className="h-9 gap-1.5 border-border/50 text-muted-foreground hover:border-transparent hover:text-green-500 hover:bg-green-500/10">
                      <Check className="h-4 w-4" />
                      Сохранить
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setShowDeleteDialog(true)} className="h-9 w-9 border-border/50 text-muted-foreground hover:border-transparent hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    {FOLDER_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        className={cn(
                          "h-6 w-6 rounded-md transition-all border-2",
                          editColor === c.value ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: c.value }}
                        onClick={() => setEditColor(c.value)}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight truncate">{folder.name}</h1>
                    <Button size="icon" variant="ghost" onClick={handleStartEdit} className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary">
                      <SquarePen className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Globe className="h-3.5 w-3.5" />
                      {folderDomains.length} {pluralDomains(folderDomains.length)}
                    </div>
                  </div>
                </>
              )}
            </div>
            {!isEditing && (
              <>
                {/* Search in header */}
                <div className="relative shrink-0 w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск доменов..."
                    value={domainSearch}
                    onChange={(e) => setDomainSearch(e.target.value)}
                    className="pl-9 h-9 border-border/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" onClick={handleOpenAddModal} className="gap-1.5 h-9 border-border/50 text-muted-foreground hover:text-primary hover:border-border/50 hover:bg-primary/10">
                    <Plus className="h-4 w-4" />
                    Добавить
                  </Button>
                </div>
              </>
            )}
          </div>
      </div>

      {/* Domain list */}
      {folderDomains.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted/50 mb-4">
            <Globe className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground mb-1 font-medium">В папке пока нет доменов</p>
          <p className="text-sm text-muted-foreground/70 mb-5">Добавьте домены для группировки</p>
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
                <TableHead className="w-[35%]">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <span>Домен</span>
                  </div>
                </TableHead>
                <TableHead className="w-[20%]">
                  <div className="flex items-center gap-2">
                    <FolderIcon className="h-4 w-4 text-green-500" />
                    <span>Проект</span>
                  </div>
                </TableHead>
                <TableHead className="w-[18%]">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-chart-4" />
                    <span>Тип</span>
                  </div>
                </TableHead>
                <TableHead className="w-[15%]">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-warning" />
                    <span>Статус</span>
                  </div>
                </TableHead>
                <TableHead className="w-[12%] text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFolderDomains.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Ничего не найдено
                  </TableCell>
                </TableRow>
              ) : filteredFolderDomains.map((domain) => (
                <TableRow
                  key={domain.id}
                  className="hover:bg-muted/50 cursor-pointer transition-colors duration-150 group/row"
                  onDoubleClick={() => navigate(`/domains/${domain.id}`)}
                >
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-yellow-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          try {
                            navigator.clipboard.writeText(domain.name).then(() => {
                              toast.success("Скопировано");
                            }).catch(() => {
                              const ta = document.createElement("textarea");
                              ta.value = domain.name;
                              ta.style.position = "fixed";
                              ta.style.opacity = "0";
                              document.body.appendChild(ta);
                              ta.select();
                              document.execCommand("copy");
                              document.body.removeChild(ta);
                              toast.success("Скопировано");
                            });
                          } catch {
                            const ta = document.createElement("textarea");
                            ta.value = domain.name;
                            ta.style.position = "fixed";
                            ta.style.opacity = "0";
                            document.body.appendChild(ta);
                            ta.select();
                            document.execCommand("copy");
                            document.body.removeChild(ta);
                            toast.success("Скопировано");
                          }
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <span className="font-mono text-sm truncate">{domain.name}</span>
                    </div>
                  </TableCell>
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
                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover/row:opacity-100 transition-opacity"
                      onClick={() => handleRemoveDomain(domain.id, domain.name)}
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
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col border-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded" style={{ backgroundColor: `${color}15` }}>
                <FolderIcon className="h-3.5 w-3.5" style={{ color }} />
              </div>
              Добавить в «{folder.name}»
            </DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск доменов..."
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
              className="pl-9 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <Popover modal={true}>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="h-8 text-xs gap-1.5">
                  {addFilterTypes.size > 0 ? `Тип (${addFilterTypes.size})` : "Все типы"}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start" sideOffset={4}>
                <div className="space-y-1 max-h-[200px] overflow-auto">
                  {Object.entries(DOMAIN_TYPE_LABELS).map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary/50 cursor-pointer text-xs">
                      <Checkbox
                        checked={addFilterTypes.has(value)}
                        onCheckedChange={() => {
                          setAddFilterTypes(prev => {
                            const next = new Set(prev);
                            next.has(value) ? next.delete(value) : next.add(value);
                            return next;
                          });
                        }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Popover modal={true}>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="h-8 text-xs gap-1.5">
                  {addFilterStatuses.size > 0 ? `Статус (${addFilterStatuses.size})` : "Все статусы"}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start" sideOffset={4}>
                <div className="space-y-1 max-h-[200px] overflow-auto">
                  {Object.entries(DOMAIN_STATUS_LABELS).map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary/50 cursor-pointer text-xs">
                      <Checkbox
                        checked={addFilterStatuses.has(value)}
                        onCheckedChange={() => {
                          setAddFilterStatuses(prev => {
                            const next = new Set(prev);
                            next.has(value) ? next.delete(value) : next.add(value);
                            return next;
                          });
                        }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Popover modal={true}>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="h-8 text-xs gap-1.5">
                  {addFilterProjects.size > 0 ? `Проект (${addFilterProjects.size})` : "Все проекты"}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start" sideOffset={4}>
                <div className="space-y-1 max-h-[200px] overflow-auto">
                  {availableProjects.map((p) => (
                    <label key={p} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary/50 cursor-pointer text-xs">
                      <Checkbox
                        checked={addFilterProjects.has(p)}
                        onCheckedChange={() => {
                          setAddFilterProjects(prev => {
                            const next = new Set(prev);
                            next.has(p) ? next.delete(p) : next.add(p);
                            return next;
                          });
                        }}
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {(addFilterTypes.size > 0 || addFilterStatuses.size > 0 || addFilterProjects.size > 0) && (
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-destructive transition-colors ml-1 flex items-center gap-1"
                onClick={() => {
                  setAddFilterTypes(new Set());
                  setAddFilterStatuses(new Set());
                  setAddFilterProjects(new Set());
                }}
              >
                <X className="h-3 w-3" />
                Сбросить
              </button>
            )}
          </div>
          {filteredAvailable.length > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>{filteredAvailable.length} {pluralDomains(filteredAvailable.length)} доступно</span>
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={handleToggleAll}
              >
                {selectedToAdd.size === filteredAvailable.length ? "Снять все" : "Выбрать все"}
              </button>
            </div>
          )}
          <div className="flex-1 overflow-auto min-h-0 max-h-[400px] border-y border-border/50">
            {filteredAvailable.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm">
                <Globe className="h-6 w-6 mb-2 opacity-40" />
                {availableDomains.length === 0 ? "Все домены уже в папке" : "Ничего не найдено"}
              </div>
            ) : (
              <div className="divide-y">
                {filteredAvailable.map((domain) => (
                  <label
                    key={domain.id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors",
                      selectedToAdd.has(domain.id) ? "bg-primary/5" : "hover:bg-secondary/30"
                    )}
                  >
                    <Checkbox
                      checked={selectedToAdd.has(domain.id)}
                      onCheckedChange={() => handleToggleSelect(domain.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{domain.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{domain.project}</p>
                    </div>
                    <DomainTypeBadge type={domain.type} className="bg-transparent px-0" />
                  </label>
                ))}
              </div>
            )}
          </div>
          {selectedToAdd.size > 0 && (
            <p className="text-sm text-muted-foreground">
              Выбрано: <span className="font-medium text-foreground">{selectedToAdd.size}</span>
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
              Папка будет удалена безвозвратно. Домены останутся в системе.
              {folderDomains.length > 0 && (
                <span className="block mt-1">
                  В папке {folderDomains.length} {pluralDomains(folderDomains.length)}.
                </span>
              )}
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
