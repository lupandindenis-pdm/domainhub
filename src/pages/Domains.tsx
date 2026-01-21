import { useState, useMemo } from "react";
import { DomainTable } from "@/components/domains/DomainTable";
import { DomainFilters } from "@/components/domains/DomainFilters";
import { mockDomains } from "@/data/mockDomains";
import { DomainFilter } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/components/language-provider";

export default function Domains() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [filters, setFilters] = useState<DomainFilter>({});

  const buildShortSha = __BUILD_SHA__ === "dev" ? "dev" : __BUILD_SHA__.slice(0, 7);

  const filteredDomains = useMemo(() => {
    return mockDomains.filter((domain) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!domain.name.toLowerCase().includes(searchLower) &&
            !domain.project.toLowerCase().includes(searchLower) &&
            !domain.description.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Type filter
      if (filters.types?.length && !filters.types.includes(domain.type)) {
        return false;
      }

      // Status filter
      if (filters.statuses?.length && !filters.statuses.includes(domain.status)) {
        return false;
      }

      // Project filter
      if (filters.projects?.length && !filters.projects.includes(domain.project)) {
        return false;
      }

      // Registrar filter
      if (filters.registrars?.length && !filters.registrars.includes(domain.registrar)) {
        return false;
      }

      return true;
    });
  }, [filters]);

  const handleExport = () => {
    // Generate CSV content
    const headers = [
      "Домен",
      "Тип",
      "Статус",
      "Проект",
      "Отдел",
      "Регистратор",
      "Дата окончания",
      "SSL",
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

    toast.success("Экспорт завершён", {
      description: `Экспортировано ${filteredDomains.length} доменов`,
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
      />

      {/* Domain Table */}
      <DomainTable domains={filteredDomains} />

      {filteredDomains.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">{t("domains.not_found")}</p>
          <p className="text-sm text-muted-foreground">
            {t("domains.try_change_filters")}
          </p>
        </div>
      )}
    </div>
  );
}
