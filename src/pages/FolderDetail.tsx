import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFolders } from "@/hooks/use-folders";
import { useAllDomains } from "@/hooks/use-all-domains";
import { useUsers } from "@/hooks/use-users";
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
import { ArrowLeft, Plus, Trash2, SquarePen, Check, X, Search, Folder as FolderIcon, Globe, FolderOpen, Tag, Activity, Copy, ExternalLink, Filter, Lock, Users, Shield } from "lucide-react";
import { toast } from "sonner";
import { DomainTypeBadge } from "@/components/domains/DomainTypeBadge";
import { DomainStatusBadge } from "@/components/domains/DomainStatusBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { FOLDER_COLORS, FolderAccessType } from "@/types/folder";
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
  const { users: allUsers, updateUser } = useUsers();

  const folder = getFolderById(id!);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editAccessType, setEditAccessType] = useState<FolderAccessType>('public');
  const [accessSearch, setAccessSearch] = useState("");
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
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-destructive/10 blur-2xl scale-150 animate-pulse" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-muted/80 to-muted/30 border border-white/[0.06] shadow-lg">
            <FolderOpen className="h-10 w-10 text-muted-foreground/40" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2 tracking-tight">Папка не найдена</h2>
        <p className="text-muted-foreground/70 mb-8 max-w-xs">Возможно, она была удалена или перемещена</p>
        <Button variant="outline" onClick={() => navigate("/folders")} className="gap-2 h-10 px-5 border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all">
          <ArrowLeft className="h-4 w-4" />
          К списку папок
        </Button>
      </div>
    );
  }

  const color = folder.color || '#3b82f6';

  // Users who have access to this folder (via privateFolderIds)
  const usersWithAccess = useMemo(() => {
    if (!folder) return [];
    return allUsers.filter(u => u.privateFolderIds?.includes(folder.id));
  }, [allUsers, folder]);

  const handleStartEdit = () => {
    setEditName(folder.name);
    setEditColor(folder.color || '#3b82f6');
    setEditAccessType(folder.accessType || 'public');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const name = editName.trim();
    if (!name) {
      toast.error("Название не может быть пустым");
      return;
    }
    updateFolder(folder.id, { name, color: editColor, accessType: editAccessType });
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
      <div className="relative overflow-visible rounded-2xl border border-white/[0.06] bg-gradient-to-r from-card/80 via-card to-card/80 p-6">
        {/* Background accent glow */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: color }} />
          <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full opacity-10 blur-2xl" style={{ backgroundColor: color }} />
        </div>

        <div className="relative flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => isEditing ? handleCancelEdit() : navigate("/folders")} className="shrink-0 -ml-2 hover:bg-white/[0.06]">
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Folder icon with glow */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-30" style={{ backgroundColor: color }} />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08]" style={{ backgroundColor: `${color}18` }}>
              <FolderIcon className="h-7 w-7" style={{ color }} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-3">
                {/* Name input */}
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                  className="text-lg font-semibold h-9 w-48 shrink-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-white/[0.04] border-white/[0.06]"
                  autoFocus
                />
                {/* Color dots inline */}
                <div className="flex items-center gap-1">
                  {FOLDER_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      className={cn(
                        "h-4 w-4 rounded transition-all",
                        editColor === c.value ? "ring-2 ring-foreground ring-offset-1 ring-offset-background scale-110" : "hover:scale-110 opacity-70 hover:opacity-100"
                      )}
                      style={{ backgroundColor: c.value }}
                      onClick={() => setEditColor(c.value)}
                      title={c.label}
                    />
                  ))}
                </div>
                {/* Separator */}
                <div className="h-5 w-px bg-white/[0.08] shrink-0" />
                {/* Save */}
                <Button variant="outline" onClick={handleSaveEdit} className="h-9 gap-1.5 shrink-0 border-white/[0.08] bg-white/[0.04] text-muted-foreground hover:border-transparent hover:text-green-500 hover:bg-green-500/10">
                  <Check className="h-4 w-4" />
                  Сохранить
                </Button>
                {/* Access type popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-9 gap-2 shrink-0 border-white/[0.08] bg-white/[0.04] transition-all",
                        editAccessType === 'public'
                          ? "text-green-400 hover:bg-green-500/10 hover:border-green-500/20"
                          : "text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500/20"
                      )}
                    >
                      {editAccessType === 'public' ? (
                        <><Globe className="h-3.5 w-3.5" /> Public</>
                      ) : (
                        <><Lock className="h-3.5 w-3.5" /> Private</>
                      )}
                      <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0" align="end">
                    <div className="p-3 border-b border-white/[0.06]">
                      <p className="text-sm font-medium mb-2">Тип доступа</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditAccessType('public')}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border",
                            editAccessType === 'public'
                              ? "bg-green-500/15 text-green-400 border-green-500/30"
                              : "bg-white/[0.02] text-muted-foreground border-white/[0.06] hover:bg-white/[0.04]"
                          )}
                        >
                          <Globe className="h-3.5 w-3.5" /> Public
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditAccessType('private')}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border",
                            editAccessType === 'private'
                              ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                              : "bg-white/[0.02] text-muted-foreground border-white/[0.06] hover:bg-white/[0.04]"
                          )}
                        >
                          <Lock className="h-3.5 w-3.5" /> Private
                        </button>
                      </div>
                    </div>
                    {/* Users with access */}
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-3.5 w-3.5 text-muted-foreground/60" />
                        <p className="text-xs font-medium text-muted-foreground/80">
                          {editAccessType === 'public' ? 'Доступ у всех с проектом' : 'Пользователи с доступом'}
                        </p>
                      </div>
                      {editAccessType === 'public' ? (
                        <div className="flex items-center gap-2 py-2 px-2 rounded-lg bg-green-500/5 border border-green-500/10">
                          <Shield className="h-3.5 w-3.5 text-green-400/60" />
                          <p className="text-[11px] text-green-400/70">Все пользователи с доступом к проекту</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                            <Input
                              placeholder="Поиск пользователей..."
                              value={accessSearch}
                              onChange={(e) => setAccessSearch(e.target.value)}
                              className="pl-8 h-8 text-xs bg-white/[0.04] border-white/[0.06] focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </div>
                          {usersWithAccess.length > 0 && (
                            <div className="space-y-0.5">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/40 px-1 mb-1">Назначены</p>
                              {usersWithAccess
                                .filter(u => !accessSearch.trim() || u.username.toLowerCase().includes(accessSearch.toLowerCase()))
                                .map(user => (
                                <div key={user.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-white/[0.02] border border-white/[0.04] group/user">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary shrink-0">
                                    {user.username.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium truncate">{user.username}</p>
                                    <p className="text-[10px] text-muted-foreground/50">{user.role}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const ids = (user.privateFolderIds || []).filter(fid => fid !== folder.id);
                                      updateUser(user.id, { privateFolderIds: ids });
                                      toast.success(`${user.username} удалён из папки`);
                                    }}
                                    className="opacity-0 group-hover/user:opacity-100 flex h-5 w-5 items-center justify-center rounded text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {(() => {
                            const assignedIds = new Set(usersWithAccess.map(u => u.id));
                            const available = allUsers
                              .filter(u => !assignedIds.has(u.id))
                              .filter(u => !accessSearch.trim() || u.username.toLowerCase().includes(accessSearch.toLowerCase()));
                            if (available.length === 0 && usersWithAccess.length === 0) {
                              return (
                                <div className="flex flex-col items-center py-3 text-center">
                                  <Users className="h-5 w-5 text-muted-foreground/20 mb-1.5" />
                                  <p className="text-[11px] text-muted-foreground/40">Нет пользователей в системе</p>
                                </div>
                              );
                            }
                            if (available.length === 0) return null;
                            return (
                              <div className="space-y-0.5">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/40 px-1 mb-1">Добавить</p>
                                <div className="max-h-[140px] overflow-y-auto space-y-0.5">
                                  {available.map(user => (
                                    <button
                                      key={user.id}
                                      type="button"
                                      onClick={() => {
                                        const ids = [...(user.privateFolderIds || []), folder.id];
                                        updateUser(user.id, { privateFolderIds: ids });
                                        toast.success(`${user.username} добавлен в папку`);
                                      }}
                                      className="w-full flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/[0.04] transition-colors text-left"
                                    >
                                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted/30 text-[10px] font-bold text-muted-foreground shrink-0">
                                        {user.username.charAt(0).toUpperCase()}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium truncate text-muted-foreground/80">{user.username}</p>
                                        <p className="text-[10px] text-muted-foreground/40">{user.role}</p>
                                      </div>
                                      <Plus className="h-3.5 w-3.5 text-muted-foreground/30" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight truncate">{folder.name}</h1>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground/80 bg-white/[0.04] px-2.5 py-1 rounded-lg">
                    <Globe className="h-3.5 w-3.5" />
                    <span className="font-medium">{folderDomains.length}</span> {pluralDomains(folderDomains.length)}
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg",
                      (folder.accessType || 'public') === 'public'
                        ? "bg-green-500/10 text-green-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    )}
                  >
                    {(folder.accessType || 'public') === 'public' ? (
                      <><Globe className="h-3 w-3" /> Public</>
                    ) : (
                      <><Lock className="h-3 w-3" /> Private</>
                    )}
                  </div>
                  {(folder.accessType || 'public') === 'private' && (
                    <span className="text-[11px] text-muted-foreground/50 italic">
                      Доступ настраивается в карточках пользователей
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3 shrink-0">
            {isEditing ? (
              null
            ) : (
              <>
                {/* Edit button — square */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleStartEdit}
                  className="h-9 w-9 border-white/[0.08] bg-white/[0.04] text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all"
                >
                  <SquarePen className="h-4 w-4" />
                </Button>
                <div className="relative w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    placeholder="Поиск доменов..."
                    value={domainSearch}
                    onChange={(e) => setDomainSearch(e.target.value)}
                    className="pl-9 h-9 bg-white/[0.04] border-white/[0.06] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-white/[0.12]"
                  />
                </div>
                <Button variant="outline" onClick={handleOpenAddModal} className="gap-1.5 h-9 border-white/[0.08] bg-white/[0.04] text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all">
                  <Plus className="h-4 w-4" />
                  Добавить
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Domain list */}
      {folderDomains.length === 0 ? (
        <div className="relative flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-white/[0.06] overflow-hidden">
          {/* Animated background dots */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-8 left-[15%] h-1 w-1 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: '0s' }} />
            <div className="absolute top-16 right-[20%] h-1.5 w-1.5 rounded-full bg-primary/15 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-12 left-[25%] h-1 w-1 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-20 right-[30%] h-1.5 w-1.5 rounded-full bg-primary/10 animate-pulse" style={{ animationDelay: '1.5s' }} />
            <div className="absolute top-1/2 left-[10%] h-1 w-1 rounded-full bg-primary/15 animate-pulse" style={{ animationDelay: '0.7s' }} />
            <div className="absolute top-1/3 right-[12%] h-1 w-1 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: '1.2s' }} />
          </div>

          {/* Center glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full blur-3xl opacity-[0.07]" style={{ backgroundColor: color }} />

          {/* Illustration */}
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-20 scale-150" style={{ backgroundColor: color }} />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] shadow-lg">
              <div className="relative">
                <Globe className="h-9 w-9 text-muted-foreground/30" />
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-card border border-white/[0.1]">
                  <Plus className="h-3 w-3 text-muted-foreground/50" />
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-1.5 tracking-tight">В папке пока нет доменов</h3>
          <p className="text-sm text-muted-foreground/50 mb-7 max-w-[280px] leading-relaxed">
            Добавьте домены для группировки и удобного управления
          </p>
          <Button
            variant="outline"
            onClick={handleOpenAddModal}
            className="gap-2 h-10 px-5 border-white/[0.08] bg-white/[0.04] hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]"
          >
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

      {/* Delete folder */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          onClick={() => setShowDeleteDialog(true)}
          className="h-8 gap-1.5 text-xs text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Удалить папку
        </Button>
      </div>

      {/* Add Domains Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col border-white/[0.06] bg-[#0c0e14] backdrop-blur-xl p-0 gap-0 overflow-hidden">
          {/* Header with accent */}
          <div className="relative px-6 pt-6 pb-4">
            <div className="absolute inset-0 opacity-[0.03]" style={{ background: `linear-gradient(135deg, ${color}, transparent 60%)` }} />
            <div className="relative">
              <DialogHeader className="mb-4">
                <DialogTitle className="flex items-center gap-3 text-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08]" style={{ backgroundColor: `${color}18` }}>
                    <FolderIcon className="h-4 w-4" style={{ color }} />
                  </div>
                  <div>
                    <span>Добавить в «{folder.name}»</span>
                    <p className="text-xs font-normal text-muted-foreground/60 mt-0.5">
                      Выберите домены для добавления в папку
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                <Input
                  placeholder="Поиск по имени домена..."
                  value={addSearch}
                  onChange={(e) => setAddSearch(e.target.value)}
                  className="pl-9 h-9 bg-white/[0.04] border-white/[0.06] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30"
                />
              </div>
            </div>
          </div>

          {/* Filters bar */}
          <div className="flex items-center gap-1 px-6 pb-3">
            <Filter className="h-3.5 w-3.5 text-muted-foreground/30 mr-1" />
            <Popover modal={true}>
              <PopoverTrigger asChild>
                <Button variant="ghost" className={cn("h-8 text-xs gap-1.5 px-3 rounded-md", addFilterTypes.size > 0 ? "bg-primary/10 text-primary" : "text-muted-foreground/60")}>
                  {addFilterTypes.size > 0 ? `Тип (${addFilterTypes.size})` : "Тип"}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 border-white/[0.06]" align="start" sideOffset={4}>
                <div className="space-y-1 max-h-[200px] overflow-auto">
                  {Object.entries(DOMAIN_TYPE_LABELS).map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/[0.04] cursor-pointer text-xs">
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
                <Button variant="ghost" className={cn("h-8 text-xs gap-1.5 px-3 rounded-md", addFilterStatuses.size > 0 ? "bg-primary/10 text-primary" : "text-muted-foreground/60")}>
                  {addFilterStatuses.size > 0 ? `Статус (${addFilterStatuses.size})` : "Статус"}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 border-white/[0.06]" align="start" sideOffset={4}>
                <div className="space-y-1 max-h-[200px] overflow-auto">
                  {Object.entries(DOMAIN_STATUS_LABELS).map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/[0.04] cursor-pointer text-xs">
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
                <Button variant="ghost" className={cn("h-8 text-xs gap-1.5 px-3 rounded-md", addFilterProjects.size > 0 ? "bg-primary/10 text-primary" : "text-muted-foreground/60")}>
                  {addFilterProjects.size > 0 ? `Проект (${addFilterProjects.size})` : "Проект"}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 border-white/[0.06]" align="start" sideOffset={4}>
                <div className="space-y-1 max-h-[200px] overflow-auto">
                  {availableProjects.map((p) => (
                    <label key={p} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/[0.04] cursor-pointer text-xs">
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
                className="text-xs text-muted-foreground/40 hover:text-destructive transition-colors ml-auto flex items-center gap-1"
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

          {/* Counter + select all */}
          {filteredAvailable.length > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground/50 px-6 pb-2">
              <span>{filteredAvailable.length} {pluralDomains(filteredAvailable.length)} доступно</span>
              <button
                type="button"
                className="text-primary/70 hover:text-primary transition-colors"
                onClick={handleToggleAll}
              >
                {selectedToAdd.size === filteredAvailable.length ? "Снять все" : "Выбрать все"}
              </button>
            </div>
          )}

          {/* Domain list */}
          <div className="flex-1 overflow-auto min-h-0 border-t border-white/[0.06]">
            {filteredAvailable.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-3">
                  <Globe className="h-5 w-5 text-muted-foreground/20" />
                </div>
                <p className="text-sm text-muted-foreground/50">
                  {availableDomains.length === 0 ? "Все домены уже в папке" : "Ничего не найдено"}
                </p>
                <p className="text-xs text-muted-foreground/30 mt-1">
                  {availableDomains.length === 0 ? "Добавьте новые домены в систему" : "Попробуйте изменить фильтры"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {filteredAvailable.map((domain) => (
                  <label
                    key={domain.id}
                    className={cn(
                      "flex items-center gap-3 px-6 py-3 cursor-pointer transition-all group/item",
                      selectedToAdd.has(domain.id)
                        ? "bg-primary/[0.06]"
                        : "hover:bg-white/[0.02]"
                    )}
                  >
                    <Checkbox
                      checked={selectedToAdd.has(domain.id)}
                      onCheckedChange={() => handleToggleSelect(domain.id)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate transition-colors",
                        selectedToAdd.has(domain.id) ? "text-foreground" : "text-foreground/80 group-hover/item:text-foreground"
                      )}>{domain.name}</p>
                      <p className="text-[11px] text-muted-foreground/40 truncate">{domain.project}</p>
                    </div>
                    <DomainTypeBadge type={domain.type} className="bg-transparent px-0 opacity-60 group-hover/item:opacity-100 transition-opacity" />
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
            <div className="text-sm text-muted-foreground/40">
              {selectedToAdd.size > 0 ? (
                <span>Выбрано <span className="font-medium text-foreground/70">{selectedToAdd.size}</span> {pluralDomains(selectedToAdd.size)}</span>
              ) : (
                <span>Ничего не выбрано</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setShowAddModal(false)} className="h-9 text-sm text-muted-foreground/60 hover:text-foreground">
                Отмена
              </Button>
              <Button onClick={handleAddDomains} disabled={selectedToAdd.size === 0} className="h-9 text-sm gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Добавить{selectedToAdd.size > 0 && ` (${selectedToAdd.size})`}
              </Button>
            </div>
          </div>
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
