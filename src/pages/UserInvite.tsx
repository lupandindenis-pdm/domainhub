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
import { ArrowLeft } from "lucide-react";
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
const projectOptions = projects.filter(p => p !== "Не известно");

export default function UserInvite() {
  const navigate = useNavigate();
  const { users, inviteUser } = useUsers();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("viewer");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  const handleInvite = () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      toast.error("Введите email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("Некорректный email");
      return;
    }
    const existing = users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      toast.error("Пользователь с таким email уже существует");
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

    inviteUser(trimmedEmail, role, scope);
    toast.success("Приглашение отправлено", { description: trimmedEmail });
    navigate("/users");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/users")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Пригласить пользователя</h1>
          <p className="text-muted-foreground">Заполните данные для приглашения нового пользователя</p>
        </div>
      </div>

      <div className="max-w-lg space-y-5">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Email</label>
          <Input
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoFocus
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Роль</label>
          <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
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
          <label className="text-sm font-medium mb-1.5 block">Проекты</label>
          <p className="text-xs text-muted-foreground mb-1.5">Если ничего не выбрано — доступ ко всем проектам</p>
          <MultiSelectDropdown
            options={projectOptions}
            selected={selectedProjects}
            onChange={setSelectedProjects}
            placeholder="Все проекты"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Отделы</label>
          <p className="text-xs text-muted-foreground mb-1.5">Если ничего не выбрано — доступ ко всем отделам</p>
          <MultiSelectDropdown
            options={departments}
            selected={selectedDepartments}
            onChange={setSelectedDepartments}
            placeholder="Все отделы"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => navigate("/users")}>
            Отмена
          </Button>
          <Button onClick={handleInvite} disabled={!email.trim()}>
            Отправить приглашение
          </Button>
        </div>
      </div>
    </div>
  );
}
