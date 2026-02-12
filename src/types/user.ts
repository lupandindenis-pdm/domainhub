export type UserRole = 'super_admin' | 'admin' | 'manager' | 'editor' | 'viewer';

export type UserStatus = 'pending' | 'active' | 'suspended' | 'deleted';

export type Permission =
  | 'domain:create'
  | 'domain:edit'
  | 'domain:delete'
  | 'folder:create'
  | 'folder:delete'
  | 'user:manage';

export interface UserScope {
  projectIds: string[];
  departmentIds: string[];
}

export interface AppUser {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  scope: UserScope;
  status: UserStatus;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
];

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  pending: 'Ожидает активации',
  active: 'Активен',
  suspended: 'Заблокирован',
  deleted: 'Удалён',
};

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: ['domain:create', 'domain:edit', 'domain:delete', 'folder:create', 'folder:delete', 'user:manage'],
  admin: ['domain:create', 'domain:edit', 'folder:create', 'folder:delete', 'user:manage'],
  manager: ['domain:edit', 'folder:create'],
  editor: ['domain:edit'],
  viewer: [],
};

export function getScopeLabel(scope: UserScope): string {
  const parts: string[] = [];
  if (scope.projectIds?.length) parts.push(`Проекты (${scope.projectIds.length})`);
  if (scope.departmentIds?.length) parts.push(`Отделы (${scope.departmentIds.length})`);
  return parts.length > 0 ? parts.join(' + ') : 'Глобальный';
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAssignRole(currentRole: UserRole, targetRole: UserRole): boolean {
  const hierarchy: UserRole[] = ['super_admin', 'admin', 'manager', 'editor', 'viewer'];
  const currentIdx = hierarchy.indexOf(currentRole);
  const targetIdx = hierarchy.indexOf(targetRole);
  // Can only assign roles below own level
  // Super admin can assign admin, admin cannot assign admin or super_admin
  if (currentRole === 'super_admin') return targetIdx > 0; // can assign admin and below
  return targetIdx > currentIdx;
}
