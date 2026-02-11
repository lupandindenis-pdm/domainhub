import { useState, useMemo } from "react";
import { useUsers } from "@/hooks/use-users";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  UserPlus,
  Search,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Pencil,
  Ban,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AppUser,
  UserRole,
  UserStatus,
  ScopeType,
  UserScope,
  USER_ROLES,
  USER_STATUS_LABELS,
  SCOPE_TYPE_LABELS,
  canAssignRole,
} from "@/types/user";
import { projects, departments } from "@/data/mockDomains";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const STATUS_COLORS: Record<UserStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  active: "bg-green-500/15 text-green-500 border-green-500/30",
  suspended: "bg-red-500/15 text-red-500 border-red-500/30",
  deleted: "bg-gray-500/15 text-gray-500 border-gray-500/30",
};

const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  admin: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  manager: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  editor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  viewer: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

// Current user is super_admin for demo
const CURRENT_USER_ROLE: UserRole = "super_admin";

export default function Users() {
  const { users, inviteUser, updateUser, suspendUser, reactivateUser, deleteUser } = useUsers();

  const [search, setSearch] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("viewer");
  const [inviteScopeType, setInviteScopeType] = useState<ScopeType>("global");
  const [inviteProjects, setInviteProjects] = useState<string[]>([]);
  const [inviteDepartments, setInviteDepartments] = useState<string[]>([]);

  // Edit form
  const [editRole, setEditRole] = useState<UserRole>("viewer");
  const [editScopeType, setEditScopeType] = useState<ScopeType>("global");
  const [editProjects, setEditProjects] = useState<string[]>([]);
  const [editDepartments, setEditDepartments] = useState<string[]>([]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(u =>
      u.email.toLowerCase().includes(q) ||
      USER_ROLES.find(r => r.value === u.role)?.label.toLowerCase().includes(q)
    );
  }, [users, search]);

  const resetInviteForm = () => {
    setInviteEmail("");
    setInviteRole("viewer");
    setInviteScopeType("global");
    setInviteProjects([]);
    setInviteDepartments([]);
  };

  const handleInvite = () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email) {
      toast.error("Введите email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Некорректный email");
      return;
    }
    const existing = users.find(u => u.email.toLowerCase() === email);
    if (existing) {
      toast.error("Пользователь с таким email уже существует");
      return;
    }
    if (!canAssignRole(CURRENT_USER_ROLE, inviteRole)) {
      toast.error("Нельзя назначить роль выше своей");
      return;
    }

    const scope: UserScope = {
      type: inviteScopeType,
      ...(inviteScopeType === "project" ? { projectIds: inviteProjects } : {}),
      ...(inviteScopeType === "department" ? { departmentIds: inviteDepartments } : {}),
    };

    inviteUser(email, inviteRole, scope);
    toast.success("Приглашение отправлено", { description: email });
    resetInviteForm();
    setShowInviteDialog(false);
  };

  const handleOpenEdit = (user: AppUser) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditScopeType(user.scope.type);
    setEditProjects(user.scope.projectIds || []);
    setEditDepartments(user.scope.departmentIds || []);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!selectedUser) return;
    if (!canAssignRole(CURRENT_USER_ROLE, editRole)) {
      toast.error("Нельзя назначить роль выше своей");
      return;
    }
    const scope: UserScope = {
      type: editScopeType,
      ...(editScopeType === "project" ? { projectIds: editProjects } : {}),
      ...(editScopeType === "department" ? { departmentIds: editDepartments } : {}),
    };
    updateUser(selectedUser.id, { role: editRole, scope });
    toast.success("Пользователь обновлён");
    setShowEditDialog(false);
    setSelectedUser(null);
  };

  const handleSuspend = (user: AppUser) => {
    suspendUser(user.id);
    toast.success("Пользователь заблокирован", { description: user.email });
  };

  const handleReactivate = (user: AppUser) => {
    reactivateUser(user.id);
    toast.success("Пользователь активирован", { description: user.email });
  };

  const handleOpenDelete = (user: AppUser) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    deleteUser(selectedUser.id);
    toast.success("Пользователь удалён", { description: selectedUser.email });
    setShowDeleteDialog(false);
    setSelectedUser(null);
  };

  const getScopeLabel = (scope: UserScope) => {
    if (scope.type === "global") return "Глобальный";
    if (scope.type === "project") return `Проекты (${scope.projectIds?.length || 0})`;
    if (scope.type === "department") return `Отделы (${scope.departmentIds?.length || 0})`;
    return "—";
  };

  const assignableRoles = USER_ROLES.filter(r => canAssignRole(CURRENT_USER_ROLE, r.value));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Пользователи</h1>
          <p className="text-muted-foreground">Управление доступом и ролями</p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Пригласить пользователя
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск пользователей..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-lg text-center">
          <ShieldCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-1">Нет пользователей</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Пригласите первого пользователя в систему
          </p>
          <Button variant="outline" onClick={() => setShowInviteDialog(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Пригласить
          </Button>
        </div>
      ) : (
        <div className="w-full">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[25%]">Email</TableHead>
                <TableHead className="w-[13%]">Роль</TableHead>
                <TableHead className="w-[17%]">Доступ</TableHead>
                <TableHead className="w-[15%]">Статус</TableHead>
                <TableHead className="w-[15%]">Приглашён</TableHead>
                <TableHead className="w-[15%] text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium truncate">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", ROLE_COLORS[user.role])}>
                      {USER_ROLES.find(r => r.value === user.role)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {getScopeLabel(user.scope)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", STATUS_COLORS[user.status])}>
                      {USER_STATUS_LABELS[user.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(user.invitedAt), "dd MMM yyyy", { locale: ru })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(user)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === "active" || user.status === "pending" ? (
                          <DropdownMenuItem onClick={() => handleSuspend(user)}>
                            <Ban className="h-4 w-4 mr-2" />
                            Заблокировать
                          </DropdownMenuItem>
                        ) : user.status === "suspended" ? (
                          <DropdownMenuItem onClick={() => handleReactivate(user)}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Активировать
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem
                          onClick={() => handleOpenDelete(user)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && users.length > 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Ничего не найдено
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={(open) => { setShowInviteDialog(open); if (!open) resetInviteForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Пригласить пользователя</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
              <Input
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                type="email"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Роль</label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assignableRoles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Тип доступа</label>
              <Select value={inviteScopeType} onValueChange={(v) => setInviteScopeType(v as ScopeType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SCOPE_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {inviteScopeType === "project" && (
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Проекты</label>
                <div className="border rounded-md max-h-[200px] overflow-auto">
                  {projects.filter(p => p !== "Не известно").map((p) => (
                    <label key={p} className="flex items-center gap-2 px-3 py-2 hover:bg-secondary/30 cursor-pointer">
                      <Checkbox
                        checked={inviteProjects.includes(p)}
                        onCheckedChange={(checked) => {
                          setInviteProjects(prev =>
                            checked ? [...prev, p] : prev.filter(x => x !== p)
                          );
                        }}
                      />
                      <span className="text-sm">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {inviteScopeType === "department" && (
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Отделы</label>
                <div className="border rounded-md max-h-[200px] overflow-auto">
                  {departments.map((d) => (
                    <label key={d} className="flex items-center gap-2 px-3 py-2 hover:bg-secondary/30 cursor-pointer">
                      <Checkbox
                        checked={inviteDepartments.includes(d)}
                        onCheckedChange={(checked) => {
                          setInviteDepartments(prev =>
                            checked ? [...prev, d] : prev.filter(x => x !== d)
                          );
                        }}
                      />
                      <span className="text-sm">{d}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowInviteDialog(false); resetInviteForm(); }}>
              Отмена
            </Button>
            <Button onClick={handleInvite} disabled={!inviteEmail.trim()}>
              Отправить приглашение
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => { setShowEditDialog(open); if (!open) setSelectedUser(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
                <Input value={selectedUser.email} disabled />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Роль</label>
                <Select value={editRole} onValueChange={(v) => setEditRole(v as UserRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableRoles.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Тип доступа</label>
                <Select value={editScopeType} onValueChange={(v) => setEditScopeType(v as ScopeType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SCOPE_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editScopeType === "project" && (
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Проекты</label>
                  <div className="border rounded-md max-h-[200px] overflow-auto">
                    {projects.filter(p => p !== "Не известно").map((p) => (
                      <label key={p} className="flex items-center gap-2 px-3 py-2 hover:bg-secondary/30 cursor-pointer">
                        <Checkbox
                          checked={editProjects.includes(p)}
                          onCheckedChange={(checked) => {
                            setEditProjects(prev =>
                              checked ? [...prev, p] : prev.filter(x => x !== p)
                            );
                          }}
                        />
                        <span className="text-sm">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {editScopeType === "department" && (
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Отделы</label>
                  <div className="border rounded-md max-h-[200px] overflow-auto">
                    {departments.map((d) => (
                      <label key={d} className="flex items-center gap-2 px-3 py-2 hover:bg-secondary/30 cursor-pointer">
                        <Checkbox
                          checked={editDepartments.includes(d)}
                          onCheckedChange={(checked) => {
                            setEditDepartments(prev =>
                              checked ? [...prev, d] : prev.filter(x => x !== d)
                            );
                          }}
                        />
                        <span className="text-sm">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); setSelectedUser(null); }}>
              Отмена
            </Button>
            <Button onClick={handleSaveEdit}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => { setShowDeleteDialog(open); if (!open) setSelectedUser(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
            <AlertDialogDescription>
              Пользователь {selectedUser?.email} будет удалён из системы. Это действие можно отменить через базу данных.
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
