import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "@/hooks/use-users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import { ArrowLeft, User, KeyRound, Shield, FolderKanban, Building2, RefreshCw, Eye, EyeOff, Copy, UserPlus, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  UserRole,
  UserScope,
  USER_ROLES,
  canAssignRole,
} from "@/types/user";
import { projects, departments } from "@/data/mockDomains";

const CURRENT_USER_ROLE: UserRole = "super_admin";
const assignableRoles = USER_ROLES.filter(r => canAssignRole(CURRENT_USER_ROLE, r.value));

function generatePassword(length = 16): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export default function UserInvite() {
  const navigate = useNavigate();
  const { users, createUser } = useUsers();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [corporateEmail, setCorporateEmail] = useState("");
  const [role, setRole] = useState<UserRole>("viewer");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

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

  const handleCreate = () => {
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
    const existing = users.find(u => u.username.toLowerCase() === trimmedUsername.toLowerCase());
    if (existing) {
      toast.error("Пользователь с таким именем уже существует");
      return;
    }
    if (!canAssignRole(CURRENT_USER_ROLE, role)) {
      toast.error("Нельзя назначить роль выше своей");
      return;
    }

    const scope: UserScope = {
      projectIds: selectedProjects,
      departmentIds: selectedDepartments,
    };

    createUser(trimmedUsername, password, role, scope, corporateEmail.trim() || undefined);
    toast.success("Пользователь создан", { description: trimmedUsername });
    navigate("/users");
  };

  const scopeIsGlobal = selectedProjects.length === 0 && selectedDepartments.length === 0;

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/users")} className="flex-shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Создать пользователя</h1>
            <p className="text-sm text-muted-foreground">Заполните данные нового пользователя</p>
          </div>
        </div>
      </div>

      {/* Block 1: Basic Info */}
      <Card className="border-white/[0.06]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Основные данные
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
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
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
          </div>
        </CardContent>
      </Card>

      {/* Block 2: Security */}
      <Card className="border-white/[0.06]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            Безопасность
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
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
          </div>
        </CardContent>
      </Card>

      {/* Block 3: Access Scope */}
      <Card className="border-white/[0.06]">
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
            Определяет, к каким проектам и отделам пользователь имеет доступ
          </p>
        </CardHeader>
        <CardContent>
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
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/users")} className="border-white/[0.08]">
          Отмена
        </Button>
        <Button
          onClick={handleCreate}
          disabled={!username.trim() || !password}
          className="gap-2 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
        >
          <UserPlus className="h-4 w-4" />
          Создать пользователя
        </Button>
      </div>
    </div>
  );
}
