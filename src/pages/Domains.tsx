import { useState, useMemo, useEffect, useRef } from "react";
import { DomainTable } from "@/components/domains/DomainTable";
import { DomainFilters } from "@/components/domains/DomainFilters";
import { BulkActionsBar } from "@/components/domains/BulkActionsBar";
import { mockDomains, mockLabels } from "@/data/mockDomains";
import { DomainFilter } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/components/language-provider";
import { useDebounce } from "@/hooks/useDebounce";
import { useFolders } from "@/hooks/use-folders";
import { computeDomainStatus } from "@/lib/computeDomainStatus";
import { MoveDomainsModal } from "@/components/domains/MoveDomainsModal";

export default function Domains() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { folders } = useFolders();
  const [filters, setFilters] = useState<DomainFilter>({});
  const debouncedFilters = useDebounce(filters, 300);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedDomainIds, setSelectedDomainIds] = useState<Set<string>>(new Set());
  const [quickEditMode, setQuickEditMode] = useState(false);
  const [hiddenDomainIds, setHiddenDomainIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('hiddenDomainIds');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [showHidden, setShowHidden] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const editedDomainsSnapshot = useRef<Record<string, any> | null>(null);
  
  // Load labels from localStorage
  const [labels, setLabels] = useState(() => {
    try {
      const saved = localStorage.getItem('domainLabels');
      return saved ? JSON.parse(saved) : mockLabels;
    } catch {
      return mockLabels;
    }
  });
  
  // Load domain label assignments from localStorage
  const [domainLabelAssignments, setDomainLabelAssignments] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('domainLabelAssignments');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Load edited domains from localStorage (with validation)
  const [editedDomains, setEditedDomains] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem('editedDomains');
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      // Validate: remove entries that are not objects
      const validated: Record<string, any> = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          validated[key] = value;
        }
      }
      return validated;
    } catch {
      localStorage.removeItem('editedDomains');
      return {};
    }
  });

  // Listen for localStorage changes to sync labels, assignments, and edited domains across tabs/components
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedLabels = localStorage.getItem('domainLabels');
        if (savedLabels) {
          setLabels(JSON.parse(savedLabels));
        }
        
        const savedAssignments = localStorage.getItem('domainLabelAssignments');
        if (savedAssignments) {
          setDomainLabelAssignments(JSON.parse(savedAssignments));
        }

        const savedEditedDomains = localStorage.getItem('editedDomains');
        if (savedEditedDomains) {
          setEditedDomains(JSON.parse(savedEditedDomains));
        }

        const savedDeletedIds = localStorage.getItem('deletedDomainIds');
        if (savedDeletedIds) {
          setDeletedDomainIds(new Set(JSON.parse(savedDeletedIds)));
        }
      } catch (error) {
        console.error('Failed to load data from localStorage:', error);
      }
    };

    // Load immediately on mount
    handleStorageChange();

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for changes within the same tab
    const interval = setInterval(handleStorageChange, 1000);

    // Reload when window gains focus
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const buildShortSha = __BUILD_SHA__ === "dev" ? "dev" : __BUILD_SHA__.slice(0, 7);

  // Save hidden domains to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('hiddenDomainIds', JSON.stringify([...hiddenDomainIds]));
    } catch (error) {
      console.error('Failed to save hidden domains to localStorage:', error);
    }
  }, [hiddenDomainIds]);

  // Load deleted domain IDs from localStorage
  const [deletedDomainIds, setDeletedDomainIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('deletedDomainIds');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Merge mockDomains with edited domains from localStorage
  const domains = useMemo(() => {
    try {
    // 1. Start with mockDomains, merge edits, exclude deleted
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
            expirationDate: domain.expirationDate,
            createdAt: domain.createdAt,
            updatedAt: editedData.updatedAt || new Date().toISOString(),
          };
        }
        return domain;
      });

    // 2. Add newly created domains (id starts with 'new-')
    const newDomains = Object.entries(editedDomains)
      .filter(([id, data]) => id.startsWith('new-') && !deletedDomainIds.has(id) && data && typeof data === 'object')
      .map(([id, data]: [string, any]) => ({
        // Provide required Domain fields with defaults
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
        // Optional fields
        category: data.category,
        needsUpdate: data.needsUpdate,
        direction: data.direction,
        bonus: data.bonus,
        targetAction: data.targetAction,
        jiraTask: data.jiraTask,
        fileHosting: data.fileHosting,
        techIssues: data.techIssues,
        testMethod: data.testMethod,
        jiraTaskIT: data.jiraTaskIT ? (Array.isArray(data.jiraTaskIT) ? data.jiraTaskIT : data.jiraTaskIT.split(',').map((s: string) => s.trim()).filter(Boolean)) : undefined,
        gaId: data.gaId,
        gtmId: data.gtmId,
        isInProgram: data.isInProgram,
        isInProgramStatus: data.isInProgramStatus,
        programStatus: data.programStatus,
        companyName: data.companyName,
        programLink: data.programLink,
        purchaseDate: data.purchaseDate,
        renewalDate: data.renewalDate,
        oneSignalId: data.oneSignalId,
        cloudflareAccount: data.cloudflareAccount,
        blockedGeo: data.blockedGeo || [],
        labelId: data.labelId,
      } as any));

    const all = [...merged, ...newDomains];

    // Auto-compute status based on renewalDate
    return all.map(d => ({
      ...d,
      status: computeDomainStatus(d.status, d.renewalDate),
    }));
    } catch (error) {
      console.error('Failed to merge domains:', error);
      return [...mockDomains];
    }
  }, [editedDomains, deletedDomainIds]);

  const filteredDomains = useMemo(() => {
    const filtered = domains.filter((domain) => {
      // Hidden filter - show only hidden or only visible based on showHidden toggle
      if (showHidden) {
        if (!hiddenDomainIds.has(domain.id)) {
          return false;
        }
      } else {
        if (hiddenDomainIds.has(domain.id)) {
          return false;
        }
      }

      // Search filter
      if (debouncedFilters.search) {
        const searchLower = debouncedFilters.search.toLowerCase();
        if (!(domain.name || '').toLowerCase().includes(searchLower) &&
            !(domain.project || '').toLowerCase().includes(searchLower) &&
            !(domain.description || '').toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Type filter
      if (debouncedFilters.types?.length && !debouncedFilters.types.includes(domain.type)) {
        return false;
      }

      // Status filter
      if (debouncedFilters.statuses?.length && !debouncedFilters.statuses.includes(domain.status)) {
        return false;
      }

      // Project filter
      if (debouncedFilters.projects?.length && !debouncedFilters.projects.includes(domain.project)) {
        return false;
      }

      // Registrar filter
      if (debouncedFilters.registrars?.length && !debouncedFilters.registrars.includes(domain.registrar)) {
        return false;
      }

      // Label filter - use localStorage assignments
      if (debouncedFilters.labelId) {
        const assignedLabelId = domainLabelAssignments[domain.id] || domain.labelId;
        if (assignedLabelId !== debouncedFilters.labelId) {
          return false;
        }
      }

      // Folder filter
      if (debouncedFilters.folders?.length) {
        const domainFolderIds = folders
          .filter(f => f.domainIds.includes(domain.id))
          .map(f => f.id);
        const hasNone = debouncedFilters.folders.includes('__none__');
        const folderFilterIds = debouncedFilters.folders.filter(id => id !== '__none__');
        const inSelectedFolder = folderFilterIds.some(fid => domainFolderIds.includes(fid));
        const isWithoutFolder = domainFolderIds.length === 0;
        if (!(inSelectedFolder || (hasNone && isWithoutFolder))) {
          return false;
        }
      }

      return true;
    });

    // Map domains with their assigned labels from localStorage
    const domainsWithLabels = filtered.map(domain => ({
      ...domain,
      labelId: domainLabelAssignments[domain.id] || domain.labelId,
    }));

    // Remove selected domains that are no longer in filtered results
    const filteredIds = new Set(domainsWithLabels.map(d => d.id));
    setSelectedDomainIds(prev => {
      const newSet = new Set([...prev].filter(id => filteredIds.has(id)));
      return newSet.size !== prev.size ? newSet : prev;
    });

    return domainsWithLabels;
  }, [domains, debouncedFilters, hiddenDomainIds, showHidden, domainLabelAssignments]);

  const handleToggleBulkMode = () => {
    const newMode = !bulkSelectMode;
    setBulkSelectMode(newMode);
    if (!newMode) {
      setSelectedDomainIds(new Set());
    } else {
      toast.success("Множественный выбор включен", {
        description: "Кликайте по строкам для выбора доменов",
      });
    }
  };

  const handleToggleQuickEditMode = () => {
    const newMode = !quickEditMode;
    
    // При выходе из режима редактирования - валидируем все домены
    if (!newMode && quickEditMode) {
      const invalidDomains: string[] = [];
      
      // Проверяем все домены на валидность
      domains.forEach(domain => {
        const validationError = validateDomain(domain.name);
        if (validationError) {
          invalidDomains.push(domain.name);
        }
      });
      
      if (invalidDomains.length > 0) {
        toast.error("Обнаружены ошибки валидации", {
          description: `Невалидные домены: ${invalidDomains.slice(0, 3).join(', ')}${invalidDomains.length > 3 ? '...' : ''}`,
          style: {
            color: '#EAB308', // yellow-500
          },
        });
        return; // Не выходим из режима редактирования
      }

      // Проверяем на дубликаты URL
      const nameCount = new Map<string, string[]>();
      domains.forEach(domain => {
        const normalized = domain.name.trim().toLowerCase();
        if (!normalized) return;
        const ids = nameCount.get(normalized) || [];
        ids.push(domain.id);
        nameCount.set(normalized, ids);
      });
      const duplicates = [...nameCount.entries()]
        .filter(([, ids]) => ids.length > 1)
        .map(([name]) => name);

      if (duplicates.length > 0) {
        toast.error("Обнаружены дубликаты доменов", {
          description: `Такой URL уже есть в системе: ${duplicates.slice(0, 3).join(', ')}${duplicates.length > 3 ? '...' : ''}`,
        });
        return; // Не выходим из режима редактирования
      }
    }
    
    setQuickEditMode(newMode);
    if (newMode) {
      // Сохраняем снапшот для возможности отмены
      editedDomainsSnapshot.current = JSON.parse(JSON.stringify(editedDomains));
      // Отключаем режим множественного выбора при включении быстрого редактирования
      setBulkSelectMode(false);
      setSelectedDomainIds(new Set());
      toast.success("Режим быстрого редактирования включен", {
        description: "Кликайте по полям Project и Type для редактирования",
      });
    } else {
      toast.info("Режим быстрого редактирования выключен");
    }
  };
  
  // Validate domain name
  const validateDomain = (domain: string): string => {
    if (!domain || domain.trim() === '') {
      return 'Домен не может быть пустым';
    }
    
    // Remove protocol and www if present for validation
    let cleanDomain = domain.trim();
    cleanDomain = cleanDomain.replace(/^https?:\/\//, '');
    cleanDomain = cleanDomain.replace(/^www\./, '');
    cleanDomain = cleanDomain.replace(/\/$/, '');
    
    // Check for spaces
    if (cleanDomain.includes(' ')) {
      return 'Домен не может содержать пробелы';
    }
    
    // Check for invalid characters
    const invalidChars = /[^a-zA-Z0-9.\/:#?&=_-]/;
    if (invalidChars.test(cleanDomain)) {
      return 'Домен содержит недопустимые символы';
    }
    
    // Check if domain has at least one dot (unless it's localhost)
    if (!cleanDomain.includes('.') && !cleanDomain.startsWith('localhost')) {
      return 'Домен должен содержать хотя бы одну точку';
    }
    
    // Check domain length
    if (cleanDomain.length > 253) {
      return 'Домен слишком длинный (максимум 253 символа)';
    }
    
    // Check if domain starts or ends with dash or dot
    const parts = cleanDomain.split('/');
    const domainPart = parts[0];
    if (domainPart.startsWith('-') || domainPart.endsWith('-') || domainPart.startsWith('.') || domainPart.endsWith('.')) {
      return 'Домен не может начинаться или заканчиваться дефисом или точкой';
    }
    
    // Check TLD (top-level domain) - должна состоять только из букв
    const domainSegments = domainPart.split('.');
    if (domainSegments.length > 1) {
      const tld = domainSegments[domainSegments.length - 1];
      // TLD должна содержать только буквы (a-z, A-Z), минимум 2 символа
      if (!/^[a-zA-Z]{2,}$/.test(tld)) {
        return 'Доменная зона должна состоять только из букв (например: .com, .ru, .org)';
      }
    }
    
    return '';
  };

  const handleCancelQuickEdit = () => {
    if (editedDomainsSnapshot.current !== null) {
      setEditedDomains(editedDomainsSnapshot.current);
      localStorage.setItem('editedDomains', JSON.stringify(editedDomainsSnapshot.current));
      window.dispatchEvent(new Event('domains-updated'));
      editedDomainsSnapshot.current = null;
    }
    setQuickEditMode(false);
    toast.info("Изменения отменены");
  };

  const handleToggleDomain = (domainId: string) => {
    setSelectedDomainIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(domainId)) {
        newSet.delete(domainId);
      } else {
        newSet.add(domainId);
      }
      return newSet;
    });
  };

  const handleCloseBulkActions = () => {
    setBulkSelectMode(false);
    setSelectedDomainIds(new Set());
  };

  const handleExportSelected = () => {
    const selectedDomains = domains.filter(d => selectedDomainIds.has(d.id));
    const headers = [
      t("export.domain"),
      t("export.type"),
      t("export.status"),
      t("export.project"),
      t("export.department"),
      t("export.registrar"),
      t("export.expiration_date"),
      t("export.ssl_status"),
    ];

    const rows = selectedDomains.map((d) => [
      d.name,
      d.type,
      d.status,
      d.project,
      d.department,
      d.registrar,
      d.expirationDate,
      d.sslStatus,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `domains-selected-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast.success("Экспорт завершён", {
      description: `Экспортировано доменов: ${selectedDomains.length}`,
    });
  };

  const handleHideSelected = () => {
    if (showHidden) {
      // Убираем из скрытых (возвращаем в основной список)
      setHiddenDomainIds(prev => {
        const newSet = new Set(prev);
        selectedDomainIds.forEach(id => newSet.delete(id));
        
        // Если после удаления не осталось скрытых доменов, выключаем режим просмотра скрытых
        if (newSet.size === 0) {
          setShowHidden(false);
        }
        
        return newSet;
      });
      setSelectedDomainIds(new Set());
      setBulkSelectMode(false);
      toast.success("Домены возвращены", {
        description: `Возвращено доменов: ${selectedDomainIds.size}`,
      });
    } else {
      // Скрываем домены
      setHiddenDomainIds(prev => {
        const newSet = new Set(prev);
        selectedDomainIds.forEach(id => newSet.add(id));
        return newSet;
      });
      setSelectedDomainIds(new Set());
      setBulkSelectMode(false);
      toast.success("Домены скрыты", {
        description: `Скрыто доменов: ${selectedDomainIds.size}`,
      });
    }
  };

  const handleToggleShowHidden = () => {
    setShowHidden(!showHidden);
  };

  const handleUpdateDomain = (domainId: string, updates: Partial<any>) => {
    setEditedDomains(prev => {
      const newEditedDomains = {
        ...prev,
        [domainId]: {
          ...prev[domainId],
          ...updates,
        },
      };
      // Сохраняем в localStorage для сквозной синхронизации
      localStorage.setItem('editedDomains', JSON.stringify(newEditedDomains));
      window.dispatchEvent(new Event('domains-updated'));
      return newEditedDomains;
    });
  };

  const handleMoveSelected = () => {
    setShowMoveModal(true);
  };

  const handleMoveTofolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    const domainIdsArray = [...selectedDomainIds];
    const alreadyIn = domainIdsArray.filter(id => folder.domainIds.includes(id));
    const toMove = domainIdsArray.filter(id => !folder.domainIds.includes(id));

    if (toMove.length > 0) {
      // Remove from all other folders first
      const currentFolders = JSON.parse(localStorage.getItem('domainFolders') || '[]');
      const updated = currentFolders.map((f: any) => {
        if (f.id === folderId) {
          const existingIds = new Set(f.domainIds || []);
          toMove.forEach((id: string) => existingIds.add(id));
          return { ...f, domainIds: [...existingIds], updatedAt: new Date().toISOString() };
        }
        return f;
      });
      localStorage.setItem('domainFolders', JSON.stringify(updated));
      window.dispatchEvent(new Event('folders-updated'));
    }

    const movedCount = toMove.length;
    const skippedCount = alreadyIn.length;

    if (movedCount > 0) {
      toast.success(`${movedCount} ${movedCount === 1 ? 'домен перемещён' : 'доменов перемещено'} в «${folder.name}»`, {
        description: skippedCount > 0 ? `${skippedCount} уже были в этой папке` : undefined,
      });
    } else {
      toast.info("Все выбранные домены уже находятся в этой папке");
    }

    setSelectedDomainIds(new Set());
    setBulkSelectMode(false);
  };

  const handleDeleteSelected = () => {
    toast.warning("Удаление доменов", {
      description: `Будет удалено доменов: ${selectedDomainIds.size}. Требуется подтверждение.`,
    });
    // TODO: Implement delete with confirmation
  };

  const handleExport = () => {
    // Generate CSV content with internationalized headers
    const headers = [
      t("export.domain"),
      t("export.type"),
      t("export.status"),
      t("export.project"),
      t("export.department"),
      t("export.registrar"),
      t("export.expiration_date"),
      t("export.ssl_status"),
    ];

    const rows = filteredDomains.map((d) => [
      d.name,
      d.type,
      d.status,
      d.project,
      d.department,
      d.registrar,
      d.expirationDate,
      d.sslStatus,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `domains-export-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast.success(t("export.completed"), {
      description: `${t("export.exported_count")}: ${filteredDomains.length}`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("domains.title")}</h1>
          <p className="text-muted-foreground">
            {filteredDomains.length} {t("domains.subtitle_prefix")} {domains.length} {t("domains.subtitle_suffix")}
          </p>
          <p className="text-xs text-muted-foreground">build {buildShortSha}</p>
        </div>
        <Button onClick={() => navigate("/domains/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("domains.add")}
        </Button>
      </div>

      {/* Filters */}
      <DomainFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        onExport={handleExport}
        bulkSelectMode={bulkSelectMode}
        onToggleBulkMode={handleToggleBulkMode}
        showHidden={showHidden}
        onToggleShowHidden={handleToggleShowHidden}
        hiddenCount={hiddenDomainIds.size}
        labels={labels}
        quickEditMode={quickEditMode}
        onToggleQuickEditMode={handleToggleQuickEditMode}
        onCancelQuickEdit={handleCancelQuickEdit}
      />

      {/* Domain Table */}
      <DomainTable 
        domains={filteredDomains}
        bulkSelectMode={bulkSelectMode}
        selectedDomainIds={selectedDomainIds}
        onToggleDomain={handleToggleDomain}
        showHidden={showHidden}
        labels={labels}
        quickEditMode={quickEditMode}
        onUpdateDomain={handleUpdateDomain}
        onToggleQuickEditMode={handleToggleQuickEditMode}
      />

      {filteredDomains.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">{t("domains.not_found")}</p>
          <p className="text-sm text-muted-foreground">
            {t("domains.try_change_filters")}
          </p>
        </div>
      )}

      {/* Move Domains Modal */}
      <MoveDomainsModal
        open={showMoveModal}
        onOpenChange={setShowMoveModal}
        selectedCount={selectedDomainIds.size}
        selectedDomainIds={selectedDomainIds}
        folders={folders}
        onMove={handleMoveTofolder}
      />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedDomainIds.size}
        onExportSelected={handleExportSelected}
        onHideSelected={handleHideSelected}
        onMoveSelected={handleMoveSelected}
        onDeleteSelected={handleDeleteSelected}
        onClose={handleCloseBulkActions}
        showHidden={showHidden}
      />
    </div>
  );
}
