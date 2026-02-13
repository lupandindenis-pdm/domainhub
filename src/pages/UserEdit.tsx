import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUsers } from "@/hooks/use-users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import { useFolders } from "@/hooks/use-folders";
import { ArrowLeft, User, KeyRound, Shield, FolderKanban, Building2, Ban, RotateCcw, Trash2, RefreshCw, Eye, EyeOff, Copy, MoreHorizontal, AlertTriangle, Globe, Lock, FolderLock } from "lucide-react";
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

const AVATAR_COLORS: Record<UserRole, string> = {
  super_admin: "bg-purple-500/20 text-purple-400",
  admin: "bg-blue-500/20 text-blue-400",
  manager: "bg-cyan-500/20 text-cyan-400",
  editor: "bg-emerald-500/20 text-emerald-400",
  viewer: "bg-gray-500/20 text-gray-400",
};

function generatePassword(length = 16): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/[\s._-]+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function UserEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { allUsers, updateUser, suspendUser, reactivateUser, deleteUser } = useUsers();
  const { folders } = useFolders();
  const privateFolders = useMemo(() => folders.filter(f => f.accessType === 'private'), [folders]);

  const [user, setUser] = useState<AppUser | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("viewer");
  const [showPassword, setShowPassword] = useState(false);
  const [corporateEmail, setCorporateEmail] = useState("");
  const [position, setPosition] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedPrivateFolders, setSelectedPrivateFolders] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const folderOptions = useMemo(() => {
    const privateOpts = privateFolders.map(f => ({ value: f.id, label: f.name }));
    const privateIds = new Set(privateFolders.map(f => f.id));
    const extraOpts = selectedPrivateFolders
      .filter(fid => !privateIds.has(fid))
      .map(fid => {
        const f = folders.find(fl => fl.id === fid);
        return { value: fid, label: f ? f.name : fid };
      });
    return [...privateOpts, ...extraOpts];
  }, [privateFolders, folders, selectedPrivateFolders]);

  useEffect(() => {
    const found = allUsers.find(u => u.id === id);
    if (found) {
      setUser(found);
      setUsername(found.username);
      setPassword(found.password || "");
      setRole(found.role);
      setSelectedProjects(found.scope.projectIds || []);
      setSelectedDepartments(found.scope.departmentIds || []);
      setCorporateEmail(found.corporateEmail || "");
      setPosition(found.position || "");
      setSelectedPrivateFolders(found.privateFolderIds || []);
    }
  }, [id, allUsers]);

  const hasChanges = useMemo(() => {
    if (!user) return false;
    return (
      username !== user.username ||
      password !== (user.password || "") ||
      role !== user.role ||
      corporateEmail !== (user.corporateEmail || "") ||
      position !== (user.position || "") ||
      JSON.stringify(selectedProjects) !== JSON.stringify(user.scope.projectIds || []) ||
      JSON.stringify(selectedDepartments) !== JSON.stringify(user.scope.departmentIds || []) ||
      JSON.stringify(selectedPrivateFolders) !== JSON.stringify(user.privateFolderIds || [])
    );
  }, [user, username, password, role, corporateEmail, position, selectedProjects, selectedDepartments, selectedPrivateFolders]);

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
    updateUser(user.id, { username: trimmedUsername, password, role, scope, corporateEmail: corporateEmail.trim() || undefined, position: position.trim() || undefined, privateFolderIds: selectedPrivateFolders });
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

  const scopeIsGlobal = selectedProjects.length === 0 && selectedDepartments.length === 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-r from-card/80 via-card to-card/80 p-6">
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-purple-500 opacity-[0.07] blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-blue-500 opacity-[0.05] blur-2xl" />
        </div>
        <div className="relative flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/users")} className="flex-shrink-0 -ml-2 hover:bg-white/[0.06]">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold flex-shrink-0",
            AVATAR_COLORS[user.role]
          )}>
            {getInitials(user.username)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight truncate">Редактирование пользователя</h1>
            <p className="text-sm text-muted-foreground/60 truncate">{user.username}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className={cn(
              "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg",
              STATUS_COLORS[user.status]
            )}>
              {USER_STATUS_LABELS[user.status]}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 border-white/[0.08]">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 border-white/[0.06]">
                {(user.status === "active" || user.status === "pending") && (
                  <DropdownMenuItem onClick={handleSuspend} className="text-yellow-500 focus:text-yellow-500">
                    <Ban className="h-4 w-4 mr-2" />
                    Заблокировать
                  </DropdownMenuItem>
                )}
                {user.status === "suspended" && (
                  <DropdownMenuItem onClick={handleReactivate} className="text-green-500 focus:text-green-500">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Активировать
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-white/[0.06]" />
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>


      {/* Block 1: Basic Info */}
      <Card className="border-white/[0.06] bg-card/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Основные данные
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Имя пользователя
              </label>
              <Input
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-muted/30 border-white/[0.06]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Позиция
              </label>
              <Input
                placeholder="Например: Маркетолог, Разработчик..."
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="bg-muted/30 border-white/[0.06]"
              />
              <p className="text-[11px] text-muted-foreground/60">Должность или роль коллеги в компании</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Block 2: Security */}
      <Card className="border-white/[0.06] bg-card/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            Безопасность <span className="text-muted-foreground/40 font-normal">(Креды)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Корпоративный Email
              </label>
              <Input
                type="email"
                placeholder="user@company.com"
                value={corporateEmail}
                onChange={(e) => setCorporateEmail(e.target.value)}
                className="bg-muted/30 border-white/[0.06]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Пароль
              </label>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-muted/30 border-white/[0.06] pr-16"
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
                  size="icon"
                  onClick={handleGeneratePassword}
                  className="h-10 w-10 shrink-0 border-white/[0.08]"
                  title="Сгенерировать пароль"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Block 3: Access Scope */}
      <Card className="border-white/[0.06] bg-card/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Область доступа
            </CardTitle>
            <div className="flex items-center gap-1.5">
              {scopeIsGlobal ? (
                <>
                  <Globe className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-xs text-green-400">Глобальный</span>
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5 text-yellow-400" />
                  <span className="text-xs text-yellow-400">Ограниченный</span>
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Определяет роль, проекты, отделы и закрытые папки пользователя
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role + Private Folders row */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" />
                Роль
              </label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger className="bg-muted/30 border-white/[0.06]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assignableRoles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground/60">Роль определяет базовый уровень доступа</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <FolderLock className="h-3.5 w-3.5" />
                Закрытые папки
              </label>
              <MultiSelectDropdown
                options={folderOptions}
                selected={selectedPrivateFolders}
                onChange={setSelectedPrivateFolders}
                placeholder="Нет доступа"
                allLabel="Все закрытые"
                emptyMeansAll={false}
              />
              <p className="text-[11px] text-muted-foreground/60">
                {selectedPrivateFolders.length === 0
                  ? "Нет доступа к закрытым папкам"
                  : selectedPrivateFolders.length === folderOptions.length && folderOptions.length > 0
                  ? "Доступ ко всем закрытым папкам"
                  : `${selectedPrivateFolders.length} закрыт${selectedPrivateFolders.length > 1 ? 'ых папок' : 'ая папка'} выбрано`}
              </p>
            </div>
          </div>

          {/* Projects + Departments row */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <FolderKanban className="h-3.5 w-3.5" />
                Проекты
              </label>
              <MultiSelectDropdown
                options={projects}
                selected={selectedProjects}
                onChange={setSelectedProjects}
                placeholder="Все"
              />
              <p className="text-[11px] text-muted-foreground/60">
                {selectedProjects.length === 0
                  ? "Доступ ко всем проектам"
                  : `${selectedProjects.length} проект${selectedProjects.length > 1 ? 'а' : ''} выбрано`}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5" />
                Отделы
              </label>
              <MultiSelectDropdown
                options={departments}
                selected={selectedDepartments}
                onChange={setSelectedDepartments}
                placeholder="Все"
              />
              <p className="text-[11px] text-muted-foreground/60">
                {selectedDepartments.length === 0
                  ? "Доступ ко всем отделам"
                  : `${selectedDepartments.length} отдел${selectedDepartments.length > 1 ? 'а' : ''} выбрано`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate("/users")} className="border-white/[0.08]">
          Отмена
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="gap-2 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
        >
          Сохранить
        </Button>
        {hasChanges && (
          <span className="flex items-center gap-1.5 text-xs text-yellow-500 animate-in fade-in duration-200">
            <AlertTriangle className="h-3.5 w-3.5" />
            Есть несохранённые изменения
          </span>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border-white/[0.06]">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
            <AlertDialogDescription>
              Пользователь <span className="font-medium text-foreground">{user.username}</span> будет удалён из системы. Это действие можно отменить через базу данных.
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
