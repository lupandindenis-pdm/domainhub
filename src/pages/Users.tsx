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
} from "lucide-react";
import { toast } from "sonner";
import {
  AppUser,
  UserRole,
  UserStatus,
  USER_ROLES,
  USER_STATUS_LABELS,
  getScopeLabel,
} from "@/types/user";
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
          <p className="text-muted-foreground">Управление доступом и ролями</p>
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
          className="pl-9"
        />
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-lg text-center">
          <ShieldCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-1">Нет пользователей</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Создайте первого пользователя в системе
          </p>
          <Button variant="outline" onClick={() => navigate("/users/invite")} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Создать
          </Button>
        </div>
      ) : (
        <div className="w-full">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[25%]">Пользователь</TableHead>
                <TableHead className="w-[13%]">Роль</TableHead>
                <TableHead className="w-[17%]">Доступ</TableHead>
                <TableHead className="w-[15%]">Статус</TableHead>
                <TableHead className="w-[15%]">Создан</TableHead>
                <TableHead className="w-[15%] text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="cursor-pointer" onClick={() => navigate(`/users/${user.id}/edit`)}>
                  <TableCell className="font-medium truncate">{user.username}</TableCell>
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
                    {format(new Date(user.createdAt), "dd MMM yyyy", { locale: ru })}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/users/${user.id}/edit`)}>
                          <SquarePen className="h-4 w-4 mr-2" />
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

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => { setShowDeleteDialog(open); if (!open) setSelectedUser(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
            <AlertDialogDescription>
              Пользователь {selectedUser?.username} будет удалён из системы. Это действие можно отменить через базу данных.
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
