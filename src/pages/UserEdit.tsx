import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUsers } from "@/hooks/use-users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import { ArrowLeft, User, KeyRound, Shield, FolderKanban, Building2, Ban, RotateCcw, Trash2, RefreshCw, Eye, EyeOff, Copy } from "lucide-react";
import { toast } from "sonner";
import {
  AppUser,
  UserRole,
  UserScope,
  UserStatus,
  USER_ROLES,
  USER_STATUS_LABELS,
  canAssignRole,
} from "@/types/user";
import { projects, departments } from "@/data/mockDomains";
import { cn } from "@/lib/utils";

const CURRENT_USER_ROLE: UserRole = "super_admin";
const assignableRoles = USER_ROLES.filter(r => canAssignRole(CURRENT_USER_ROLE, r.value));

const STATUS_COLORS: Record<UserStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-500",
  active: "bg-green-500/15 text-green-500",
  suspended: "bg-red-500/15 text-red-500",
  deleted: "bg-gray-500/15 text-gray-500",
};

function generatePassword(length = 16): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export default function UserEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { allUsers, updateUser, suspendUser, reactivateUser, deleteUser } = useUsers();

  const [user, setUser] = useState<AppUser | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("viewer");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const found = allUsers.find(u => u.id === id);
    if (found) {
      setUser(found);
      setUsername(found.username);
      setPassword(found.password || "");
      setRole(found.role);
      setSelectedProjects(found.scope.projectIds || []);
      setSelectedDepartments(found.scope.departmentIds || []);
    }
  }, [id, allUsers]);

  if (!user) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/users")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Пользователь не найден</h1>
        </div>
      </div>
    );
  }

  const handleGeneratePassword = () => {
    const pwd = generatePassword();
    setPassword(pwd);
    setShowPassword(true);
  };

  const handleCopyPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (password) {
      navigator.clipboard.writeText(password).then(() => {
        toast.success("Пароль скопирован");
      });
    }
  };

  const handleSave = () => {
    if (!canAssignRole(CURRENT_USER_ROLE, role)) {
      toast.error("Нельзя назначить роль выше своей");
      return;
    }
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      toast.error("Введите имя пользователя");
      return;
    }
    if (trimmedUsername.length < 3) {
      toast.error("Имя пользователя должно быть не менее 3 символов");
      return;
    }
    if (!password) {
      toast.error("Введите или сгенерируйте пароль");
      return;
    }
    if (password.length < 6) {
      toast.error("Пароль должен быть не менее 6 символов");
      return;
    }
    const scope: UserScope = {
      projectIds: selectedProjects,
      departmentIds: selectedDepartments,
    };
    updateUser(user.id, { role, scope });
    toast.success("Пользователь обновлён");
    navigate("/users");
  };

  const handleSuspend = () => {
    suspendUser(user.id);
    toast.success("Пользователь заблокирован", { description: user.username });
    navigate("/users");
  };

  const handleReactivate = () => {
    reactivateUser(user.id);
    toast.success("Пользователь активирован", { description: user.username });
    navigate("/users");
  };

  const handleDelete = () => {
    deleteUser(user.id);
    toast.success("Пользователь удалён", { description: user.username });
    navigate("/users");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/users")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Редактировать пользователя</h1>
          <p className="text-muted-foreground">{user.username}</p>
        </div>
        <Badge className={cn("text-xs border-0", STATUS_COLORS[user.status])}>
          {USER_STATUS_LABELS[user.status]}
        </Badge>
      </div>

      <div className="p-6 space-y-6">
        {/* 1. Имя пользователя + Роль */}
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4 !text-green-600" />
              Имя пользователя
            </label>
            <Input
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 !text-green-600" />
              Роль
            </label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger className="bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assignableRoles.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 2. Пароль */}
        <div className="space-y-2">
          <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">
            <KeyRound className="h-4 w-4 !text-green-600" />
            Пароль
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent pr-20"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Скрыть" : "Показать"}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
                {password && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onMouseDown={handleCopyPassword}
                    title="Копировать"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleGeneratePassword}
              className="gap-1.5 shrink-0"
            >
              <RefreshCw className="h-4 w-4" />
              Сгенерировать
            </Button>
          </div>
        </div>

        {/* 3. Проекты слева / Отделы справа */}
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">
              <FolderKanban className="h-4 w-4 !text-green-600" />
              Проекты
            </label>
            <p className="text-xs text-muted-foreground/70">Если ничего не выбрано — доступ ко всем проектам</p>
            <MultiSelectDropdown
              options={projects}
              selected={selectedProjects}
              onChange={setSelectedProjects}
              placeholder="Все"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 !text-green-600" />
              Отделы
            </label>
            <p className="text-xs text-muted-foreground/70">Если ничего не выбрано — доступ ко всем отделам</p>
            <MultiSelectDropdown
              options={departments}
              selected={selectedDepartments}
              onChange={setSelectedDepartments}
              placeholder="Все"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" onClick={() => navigate("/users")}>
            Отмена
          </Button>
          <Button onClick={handleSave}>
            Сохранить
          </Button>

          <div className="flex-1" />

          {(user.status === "active" || user.status === "pending") && (
            <Button variant="outline" size="sm" onClick={handleSuspend} className="text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10">
              <Ban className="h-4 w-4 mr-1.5" />
              Заблокировать
            </Button>
          )}
          {user.status === "suspended" && (
            <Button variant="outline" size="sm" onClick={handleReactivate} className="text-green-500 border-green-500/30 hover:bg-green-500/10">
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Активировать
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(true)} className="text-destructive border-destructive/30 hover:bg-destructive/10">
            <Trash2 className="h-4 w-4 mr-1.5" />
            Удалить
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
            <AlertDialogDescription>
              Пользователь {user.username} будет удалён из системы. Это действие можно отменить через базу данных.
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
