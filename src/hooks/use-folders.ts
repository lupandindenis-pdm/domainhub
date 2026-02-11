import { useState, useEffect, useCallback } from 'react';
import { Folder } from '@/types/folder';

const STORAGE_KEY = 'domainFolders';

function loadFolders(): Folder[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveFolders(folders: Folder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
  window.dispatchEvent(new Event('folders-updated'));
}

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>(loadFolders);

  useEffect(() => {
    const handleUpdate = () => setFolders(loadFolders());
    window.addEventListener('folders-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('folders-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const createFolder = useCallback((name: string, color: string = '#3b82f6'): Folder => {
    const now = new Date().toISOString();
    const folder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      color,
      domainIds: [],
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...loadFolders(), folder];
    saveFolders(updated);
    setFolders(updated);
    return folder;
  }, []);

  const updateFolder = useCallback((id: string, changes: Partial<Pick<Folder, 'name' | 'color'>>) => {
    const current = loadFolders();
    const updated = current.map(f =>
      f.id === id ? { ...f, ...changes, updatedAt: new Date().toISOString() } : f
    );
    saveFolders(updated);
    setFolders(updated);
  }, []);

  const deleteFolder = useCallback((id: string) => {
    const current = loadFolders();
    const updated = current.filter(f => f.id !== id);
    saveFolders(updated);
    setFolders(updated);
  }, []);

  const addDomainsToFolder = useCallback((folderId: string, domainIds: string[]) => {
    const current = loadFolders();
    const updated = current.map(f => {
      if (f.id !== folderId) return f;
      const existingIds = new Set(f.domainIds);
      domainIds.forEach(id => existingIds.add(id));
      return { ...f, domainIds: [...existingIds], updatedAt: new Date().toISOString() };
    });
    saveFolders(updated);
    setFolders(updated);
  }, []);

  const removeDomainFromFolder = useCallback((folderId: string, domainId: string) => {
    const current = loadFolders();
    const updated = current.map(f => {
      if (f.id !== folderId) return f;
      return { ...f, domainIds: f.domainIds.filter(id => id !== domainId), updatedAt: new Date().toISOString() };
    });
    saveFolders(updated);
    setFolders(updated);
  }, []);

  const getFolderById = useCallback((id: string): Folder | undefined => {
    return folders.find(f => f.id === id);
  }, [folders]);

  const getFoldersForDomain = useCallback((domainId: string): Folder[] => {
    return folders.filter(f => f.domainIds.includes(domainId));
  }, [folders]);

  return {
    folders,
    createFolder,
    updateFolder,
    deleteFolder,
    addDomainsToFolder,
    removeDomainFromFolder,
    getFolderById,
    getFoldersForDomain,
  };
}
