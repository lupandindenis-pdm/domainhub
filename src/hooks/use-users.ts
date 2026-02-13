import { useState, useEffect, useCallback } from 'react';
import { AppUser, UserRole, UserScope, UserStatus } from '@/types/user';

const STORAGE_KEY = 'appUsers';

function loadUsers(): AppUser[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: AppUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  window.dispatchEvent(new Event('users-updated'));
}

export function useUsers() {
  const [users, setUsers] = useState<AppUser[]>(loadUsers);

  useEffect(() => {
    const handleUpdate = () => setUsers(loadUsers());
    window.addEventListener('users-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('users-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const createUser = useCallback((username: string, password: string, role: UserRole, scope: UserScope, corporateEmail?: string, privateFolderIds?: string[]): AppUser => {
    const now = new Date().toISOString();
    const user: AppUser = {
      id: `user-${Date.now()}`,
      username,
      password,
      role,
      scope,
      corporateEmail,
      privateFolderIds,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...loadUsers(), user];
    saveUsers(updated);
    setUsers(updated);
    return user;
  }, []);

  const updateUser = useCallback((id: string, changes: Partial<Pick<AppUser, 'username' | 'password' | 'role' | 'scope' | 'corporateEmail' | 'privateFolderIds' | 'status'>>) => {
    const current = loadUsers();
    const updated = current.map(u =>
      u.id === id ? { ...u, ...changes, updatedAt: new Date().toISOString() } : u
    );
    saveUsers(updated);
    setUsers(updated);
  }, []);

  const suspendUser = useCallback((id: string) => {
    updateUser(id, { status: 'suspended' });
  }, [updateUser]);

  const reactivateUser = useCallback((id: string) => {
    updateUser(id, { status: 'active' });
  }, [updateUser]);

  const deleteUser = useCallback((id: string) => {
    updateUser(id, { status: 'deleted' });
  }, [updateUser]);

  const getUserById = useCallback((id: string): AppUser | undefined => {
    return users.find(u => u.id === id);
  }, [users]);

  // Only return non-deleted users by default
  const activeUsers = users.filter(u => u.status !== 'deleted');

  return {
    users: activeUsers,
    allUsers: users,
    createUser,
    updateUser,
    suspendUser,
    reactivateUser,
    deleteUser,
    getUserById,
  };
}
