import { useState, useMemo, useEffect } from "react";
import { DomainTable } from "@/components/domains/DomainTable";
import { DomainFilters } from "@/components/domains/DomainFilters";
import { BulkActionsBar } from "@/components/domains/BulkActionsBar";
import { mockDomains } from "@/data/mockDomains";
import { DomainFilter } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/components/language-provider";
import { useDebounce } from "@/hooks/useDebounce";

export default function Domains() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [filters, setFilters] = useState<DomainFilter>({});
  const debouncedFilters = useDebounce(filters, 300);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedDomainIds, setSelectedDomainIds] = useState<Set<string>>(new Set());
  const [hiddenDomainIds, setHiddenDomainIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('hiddenDomainIds');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [showHidden, setShowHidden] = useState(false);

  const buildShortSha = __BUILD_SHA__ === "dev" ? "dev" : __BUILD_SHA__.slice(0, 7);

  // Save hidden domains to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('hiddenDomainIds', JSON.stringify([...hiddenDomainIds]));
    } catch (error) {
      console.error('Failed to save hidden domains to localStorage:', error);
    }
  }, [hiddenDomainIds]);

  const filteredDomains = useMemo(() => {
    const filtered = mockDomains.filter((domain) => {
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
        if (!domain.name.toLowerCase().includes(searchLower) &&
            !domain.project.toLowerCase().includes(searchLower) &&
            !domain.description.toLowerCase().includes(searchLower)) {
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

      // Label filter
      if (debouncedFilters.labelId) {
        if (domain.labelId !== debouncedFilters.labelId) {
          return false;
        }
      }

      return true;
    });

    // Remove selected domains that are no longer in filtered results
    const filteredIds = new Set(filtered.map(d => d.id));
    setSelectedDomainIds(prev => {
      const newSet = new Set([...prev].filter(id => filteredIds.has(id)));
      return newSet.size !== prev.size ? newSet : prev;
    });

    return filtered;
  }, [debouncedFilters, hiddenDomainIds, showHidden]);

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
    const selectedDomains = mockDomains.filter(d => selectedDomainIds.has(d.id));
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

  const handleMoveSelected = () => {
    toast.info("Перемещение доменов", {
      description: `Будет перемещено доменов: ${selectedDomainIds.size}`,
    });
    // TODO: Implement move logic
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
            {filteredDomains.length} {t("domains.subtitle_prefix")} {mockDomains.length} {t("domains.subtitle_suffix")}
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
      />

      {/* Domain Table */}
      <DomainTable 
        domains={filteredDomains}
        bulkSelectMode={bulkSelectMode}
        selectedDomainIds={selectedDomainIds}
        onToggleDomain={handleToggleDomain}
        showHidden={showHidden}
      />

      {filteredDomains.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">{t("domains.not_found")}</p>
          <p className="text-sm text-muted-foreground">
            {t("domains.try_change_filters")}
          </p>
        </div>
      )}

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
