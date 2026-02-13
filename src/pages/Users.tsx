import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  pending: "bg-yellow-500/15 text-yellow-500",
  active: "bg-green-500/15 text-green-500",
  suspended: "bg-red-500/15 text-red-500",
  deleted: "bg-gray-500/15 text-gray-500",
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Пользователи</h1>
          <p className="text-muted-foreground">
            {users.length} {users.length === 1 ? "пользователь" : "пользователей"} в системе
          </p>
        </div>
        <Button onClick={() => navigate("/users/invite")} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Создать пользователя
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск пользователей..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/[0.06] rounded-xl text-center">
          <ShieldCheck className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-1">Нет пользователей</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Создайте первого пользователя в системе
          </p>
          <Button variant="outline" onClick={() => navigate("/users/invite")} className="gap-2 border-white/[0.08]">
            <UserPlus className="h-4 w-4" />
            Создать
          </Button>
        </div>
      ) : (
        <div className="w-full rounded-xl border border-white/[0.06] overflow-hidden">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-white/[0.06]">
                <TableHead className="w-[28%]">Пользователь</TableHead>
                <TableHead className="w-[14%]">Позиция</TableHead>
                <TableHead className="w-[18%]">Доступ</TableHead>
                <TableHead className="w-[14%]">Статус</TableHead>
                <TableHead className="w-[14%]">Создан</TableHead>
                <TableHead className="w-[12%] text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const scopeInfo = getScopeInfo(user.scope);
                return (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer border-white/[0.04] hover:bg-secondary/30 transition-colors"
                    onClick={() => navigate(`/users/${user.id}/edit`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold flex-shrink-0",
                          AVATAR_COLORS[user.role]
                        )}>
                          {getInitials(user.username)}
                        </div>
                        <span className="font-medium truncate">{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs border-0", ROLE_COLORS[user.role])}>
                        {USER_ROLES.find(r => r.value === user.role)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {scopeInfo.isGlobal ? (
                          <Globe className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-yellow-400 flex-shrink-0" />
                        )}
                        <span className={cn(
                          "text-sm",
                          scopeInfo.isGlobal ? "text-green-400" : "text-yellow-400"
                        )}>
                          {scopeInfo.label}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs border-0", STATUS_COLORS[user.status])}>
                        {USER_STATUS_LABELS[user.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(user.createdAt), "dd MMM yyyy", { locale: ru })}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
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
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Ничего не найдено
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
