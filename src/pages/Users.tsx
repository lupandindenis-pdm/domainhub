import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserPlus,
  Search,
  MoreHorizontal,
  ShieldCheck,
  SquarePen,
  Ban,
  RotateCcw,
  Trash2,
  Globe,
  Lock,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  AppUser,
  UserRole,
  UserStatus,
  USER_ROLES,
  USER_STATUS_LABELS,
} from "@/types/user";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const STATUS_COLORS: Record<UserStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-400/70",
  active: "bg-green-500/10 text-green-400/70",
  suspended: "bg-red-500/10 text-red-400/70",
  deleted: "bg-gray-500/10 text-gray-400/70",
};

const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: "bg-purple-500/15 text-purple-400",
  admin: "bg-blue-500/15 text-blue-400",
  manager: "bg-cyan-500/15 text-cyan-400",
  editor: "bg-emerald-500/15 text-emerald-400",
  viewer: "bg-gray-500/15 text-gray-400",
};

const AVATAR_COLORS: Record<UserRole, string> = {
  super_admin: "bg-purple-500/20 text-purple-400",
  admin: "bg-blue-500/20 text-blue-400",
  manager: "bg-cyan-500/20 text-cyan-400",
  editor: "bg-emerald-500/20 text-emerald-400",
  viewer: "bg-gray-500/20 text-gray-400",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/[\s._-]+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getScopeInfo(scope: { projectIds: string[]; departmentIds: string[] }) {
  const hasProjects = scope.projectIds?.length > 0;
  const hasDepartments = scope.departmentIds?.length > 0;
  if (!hasProjects && !hasDepartments) {
    return { label: "Глобальный", isGlobal: true };
  }
  const parts: string[] = [];
  if (hasProjects) parts.push(`${scope.projectIds.length} проект${scope.projectIds.length > 1 ? 'а' : ''}`);
  if (hasDepartments) parts.push(`${scope.departmentIds.length} отдел${scope.departmentIds.length > 1 ? 'а' : ''}`);
  return { label: parts.join(", "), isGlobal: false };
}

export default function Users() {
  const navigate = useNavigate();
  const { users, suspendUser, reactivateUser, deleteUser } = useUsers();

  const [search, setSearch] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(u =>
      u.username.toLowerCase().includes(q) ||
      USER_ROLES.find(r => r.value === u.role)?.label.toLowerCase().includes(q)
    );
  }, [users, search]);

  const handleSuspend = (user: AppUser) => {
    suspendUser(user.id);
    toast.success("Пользователь заблокирован", { description: user.username });
  };

  const handleReactivate = (user: AppUser) => {
    reactivateUser(user.id);
    toast.success("Пользователь активирован", { description: user.username });
  };

  const handleOpenDelete = (user: AppUser) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    deleteUser(selectedUser.id);
    toast.success("Пользователь удалён", { description: selectedUser.username });
    setShowDeleteDialog(false);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-r from-card/80 via-card to-card/80 p-6">
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-purple-500 opacity-[0.07] blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-blue-500 opacity-[0.05] blur-2xl" />
        </div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-purple-500 blur-xl opacity-20" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-purple-500/10">
                <ShieldCheck className="h-7 w-7 text-purple-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Пользователи</h1>
              <p className="text-sm text-muted-foreground/60 mt-0.5">
                {users.length} {users.length === 1 ? "пользователь" : users.length >= 2 && users.length <= 4 ? "пользователя" : "пользователей"} в системе
              </p>
            </div>
          </div>
          <Button onClick={() => navigate("/users/invite")} className="gap-2 h-10">
            <UserPlus className="h-4 w-4" />
            Создать пользователя
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
        <Input
          placeholder="Поиск пользователей..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 bg-white/[0.03] border-white/[0.06] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30"
        />
      </div>

      {users.length === 0 ? (
        <div className="relative flex flex-col items-center justify-center py-20 border border-dashed border-white/[0.06] rounded-2xl text-center overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-8 left-[15%] h-1 w-1 rounded-full bg-purple-500/20 animate-pulse" style={{ animationDelay: '0s' }} />
            <div className="absolute top-16 right-[20%] h-1.5 w-1.5 rounded-full bg-blue-500/15 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-12 left-[25%] h-1 w-1 rounded-full bg-purple-500/20 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-2xl bg-purple-500 blur-xl opacity-20" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-purple-500/10">
              <ShieldCheck className="h-8 w-8 text-purple-400/60" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Нет пользователей</h3>
          <p className="text-sm text-muted-foreground/50 mb-5 max-w-xs">
            Создайте первого пользователя для управления доступом к системе
          </p>
          <Button onClick={() => navigate("/users/invite")} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Создать пользователя
          </Button>
        </div>
      ) : (
        <div className="w-full rounded-xl border border-white/[0.06] overflow-hidden bg-card/30">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-white/[0.06] bg-white/[0.02]">
                <TableHead className="w-[28%] text-xs uppercase tracking-wider text-muted-foreground/50 font-medium">Пользователь</TableHead>
                <TableHead className="w-[14%] text-xs uppercase tracking-wider text-muted-foreground/50 font-medium">Роль</TableHead>
                <TableHead className="w-[18%] text-xs uppercase tracking-wider text-muted-foreground/50 font-medium">Доступ</TableHead>
                <TableHead className="w-[14%] text-xs uppercase tracking-wider text-muted-foreground/50 font-medium">Статус</TableHead>
                <TableHead className="w-[14%] text-xs uppercase tracking-wider text-muted-foreground/50 font-medium">Создан</TableHead>
                <TableHead className="w-[12%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const scopeInfo = getScopeInfo(user.scope);
                return (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer border-white/[0.04] hover:bg-white/[0.03] transition-all group/row"
                    onClick={() => navigate(`/users/${user.id}/edit`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold flex-shrink-0 transition-transform group-hover/row:scale-105",
                          AVATAR_COLORS[user.role]
                        )}>
                          {getInitials(user.username)}
                        </div>
                        <span className="font-medium truncate group-hover/row:text-foreground transition-colors">{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground/80">
                      {USER_ROLES.find(r => r.value === user.role)?.label}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-foreground/80">
                        {scopeInfo.isGlobal ? (
                          <Globe className="h-3.5 w-3.5 flex-shrink-0 text-green-400/70" />
                        ) : (
                          <Lock className="h-3.5 w-3.5 flex-shrink-0 text-yellow-400/70" />
                        )}
                        {scopeInfo.label}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-foreground/80">
                        {user.status === 'active' && <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-green-400/70" />}
                        {user.status === 'pending' && <Clock className="h-3.5 w-3.5 flex-shrink-0 text-yellow-400/70" />}
                        {user.status === 'suspended' && <Ban className="h-3.5 w-3.5 flex-shrink-0 text-red-400/70" />}
                        {user.status === 'deleted' && <XCircle className="h-3.5 w-3.5 flex-shrink-0 text-gray-400/70" />}
                        {USER_STATUS_LABELS[user.status]}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground/50">
                      {format(new Date(user.createdAt), "dd MMM yyyy", { locale: ru })}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 border-white/[0.06]">
                          <DropdownMenuItem onClick={() => navigate(`/users/${user.id}/edit`)}>
                            <SquarePen className="h-4 w-4 mr-2" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/[0.06]" />
                          {user.status === "active" || user.status === "pending" ? (
                            <DropdownMenuItem onClick={() => handleSuspend(user)} className="text-yellow-500 focus:text-yellow-500">
                              <Ban className="h-4 w-4 mr-2" />
                              Заблокировать
                            </DropdownMenuItem>
                          ) : user.status === "suspended" ? (
                            <DropdownMenuItem onClick={() => handleReactivate(user)} className="text-green-500 focus:text-green-500">
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
                );
              })}
              {filteredUsers.length === 0 && users.length > 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <Search className="h-5 w-5 text-muted-foreground/20 mb-2" />
                      <p className="text-sm text-muted-foreground/50">Ничего не найдено</p>
                      <p className="text-xs text-muted-foreground/30 mt-0.5">Попробуйте изменить запрос</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => { setShowDeleteDialog(open); if (!open) setSelectedUser(null); }}>
        <AlertDialogContent className="border-white/[0.06]">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
            <AlertDialogDescription>
              Пользователь <span className="font-medium text-foreground">{selectedUser?.username}</span> будет удалён из системы. Это действие можно отменить через базу данных.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/[0.08]">Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
