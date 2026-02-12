import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "@/hooks/use-users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import { ArrowLeft, User, KeyRound, Shield, FolderKanban, Building2, RefreshCw, Eye, EyeOff, Copy } from "lucide-react";
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

    createUser(trimmedUsername, password, role, scope);
    toast.success("Пользователь создан", { description: trimmedUsername });
    navigate("/users");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/users")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Создать пользователя</h1>
          <p className="text-muted-foreground">Заполните данные нового пользователя</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 1. Имя пользователя + Пароль */}
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
              className="bg-muted/50"
              autoFocus
            />
          </div>

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
                  className="bg-muted/50 pr-20"
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
        </div>

        {/* 2. Роль */}
        <div className="max-w-sm space-y-2">
          <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 !text-green-600" />
            Роль
          </label>
          <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
            <SelectTrigger className="bg-muted/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assignableRoles.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={() => navigate("/users")}>
            Отмена
          </Button>
          <Button onClick={handleCreate} disabled={!username.trim() || !password}>
            Создать пользователя
          </Button>
        </div>
      </div>
    </div>
  );
}
