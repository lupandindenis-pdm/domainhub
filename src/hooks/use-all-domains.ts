import { useState, useEffect, useMemo } from "react";
import { mockDomains } from "@/data/mockDomains";
import { computeDomainStatus } from "@/lib/computeDomainStatus";

/**
 * Хук для получения актуального списка доменов (mockDomains + localStorage).
 * Единый источник данных для всех компонентов: Dashboard, Domains, поиск и т.д.
 * Автоматически синхронизируется при изменениях в localStorage.
 */
export function useAllDomains() {
  const [editedDomains, setEditedDomains] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem('editedDomains');
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      const validated: Record<string, any> = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          validated[key] = value;
        }
      }
      return validated;
    } catch {
      return {};
    }
  });

  const [deletedDomainIds, setDeletedDomainIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('deletedDomainIds');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedEditedDomains = localStorage.getItem('editedDomains');
        if (savedEditedDomains) {
          const parsed = JSON.parse(savedEditedDomains);
          const validated: Record<string, any> = {};
          for (const [key, value] of Object.entries(parsed)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
              validated[key] = value;
            }
          }
          setEditedDomains(validated);
        } else {
          setEditedDomains({});
        }

        const savedDeletedIds = localStorage.getItem('deletedDomainIds');
        if (savedDeletedIds) {
          setDeletedDomainIds(new Set(JSON.parse(savedDeletedIds)));
        } else {
          setDeletedDomainIds(new Set());
        }
      } catch (error) {
        console.error('useAllDomains: Failed to load from localStorage:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    window.addEventListener('domains-updated', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
      window.removeEventListener('domains-updated', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const domains = useMemo(() => {
    try {
      // 1. Merge edits into mockDomains, exclude deleted
      const merged = mockDomains
        .filter(domain => !deletedDomainIds.has(domain.id))
        .map(domain => {
          const editedData = editedDomains[domain.id];
          if (editedData && typeof editedData === 'object') {
            return {
              ...domain,
              ...editedData,
              id: domain.id,
              registrationDate: domain.registrationDate,
              expirationDate: editedData.expirationDate || domain.expirationDate,
              createdAt: domain.createdAt,
              updatedAt: editedData.updatedAt || domain.updatedAt,
            };
          }
          return domain;
        });

      // 2. Add newly created domains (id starts with 'new-')
      const newDomains = Object.entries(editedDomains)
        .filter(([id, data]) => id.startsWith('new-') && !deletedDomainIds.has(id) && data && typeof data === 'object')
        .map(([id, data]: [string, any]) => ({
          id,
          name: data.name || '',
          registrationDate: data.createdAt || new Date().toISOString().split('T')[0],
          expirationDate: data.expirationDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          registrar: data.registrar || '',
          registrarAccount: data.registrarAccount || '',
          renewalCost: data.renewalCost || 0,
          currency: data.currency || 'USD',
          nsServers: data.nsServers || [],
          ipAddress: data.ipAddress || '',
          sslStatus: data.sslStatus || 'none' as const,
          updateMethod: data.updateMethod || 'manual' as const,
          project: data.project || 'Не известно',
          department: data.department || 'Other',
          owner: data.owner || 'Неизвестен',
          type: data.type || 'unknown',
          geo: data.geo || [],
          status: data.status || 'unknown',
          accessLevel: data.accessLevel || 'public',
          description: data.description || '',
          purity: data.purity || 'white' as const,
          lifespan: data.lifespan || 'short' as const,
          tags: data.tags || [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          category: data.category,
          bonus: data.bonus,
          direction: data.direction,
          targetAction: data.targetAction,
          labelId: data.labelId,
          blockedGeo: data.blockedGeo || [],
          needsUpdate: data.needsUpdate || 'Нет',
          renewalDate: data.renewalDate || '',
          hasTechIssues: data.hasTechIssues || 'Нет',
          purchaseDate: data.purchaseDate || '',
          jiraTask: data.jiraTask,
          fileHosting: data.fileHosting,
          techIssues: data.techIssues,
          testMethod: data.testMethod,
          jiraTaskIT: data.jiraTaskIT,
          gaId: data.gaId,
          gtmId: data.gtmId,
          isInProgram: data.isInProgram,
          isInProgramStatus: data.isInProgramStatus,
          programStatus: data.programStatus,
          companyName: data.companyName,
          programLink: data.programLink,
          oneSignalId: data.oneSignalId,
          cloudflareAccount: data.cloudflareAccount,
        } as any));

      const all = [...merged, ...newDomains];

      // Auto-compute status based on renewalDate
      return all.map(d => ({
        ...d,
        status: computeDomainStatus(d.status, d.renewalDate),
      }));
    } catch (error) {
      console.error('useAllDomains: Failed to merge domains:', error);
      return [...mockDomains];
    }
  }, [editedDomains, deletedDomainIds]);

  return domains;
}
