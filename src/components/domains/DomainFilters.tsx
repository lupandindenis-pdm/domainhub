import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Download } from "lucide-react";
import { DomainFilter, DomainType, DomainStatus } from "@/types/domain";
import { projects } from "@/data/mockDomains";
import { useLanguage } from "@/components/language-provider";

const domainTypes: { value: DomainType; label: string }[] = [
  { value: "landing", label: "badges.landing" },
  { value: "seo", label: "badges.seo" },
  { value: "mirror", label: "badges.mirror" },
  { value: "site", label: "badges.site" },
  { value: "subdomain", label: "badges.subdomain" },
  { value: "referral", label: "badges.referral" },
  { value: "redirect", label: "badges.redirect" },
  { value: "technical", label: "badges.technical" },
  { value: "product", label: "badges.product" },
];

const domainStatuses: { value: DomainStatus; label: string }[] = [
  { value: "actual", label: "status.actual" },
  { value: "not_actual", label: "status.not_actual" },
  { value: "not_configured", label: "status.not_configured" },
  { value: "unknown", label: "status.unknown" },
  { value: "expiring", label: "status.expiring" },
  { value: "expired", label: "status.expired" },
  { value: "spare", label: "status.spare" },
];

interface DomainFiltersProps {
  filters: DomainFilter;
  onFiltersChange: (filters: DomainFilter) => void;
  onExport: () => void;
}

export function DomainFilters({ filters, onFiltersChange, onExport }: DomainFiltersProps) {
  const { t } = useLanguage();
  const hasActiveFilters = 
    filters.search || 
    filters.types?.length || 
    filters.statuses?.length || 
    filters.projects?.length;

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={filters.types?.[0] || "all"}
          onValueChange={(value) => 
            onFiltersChange({ 
              ...filters, 
              types: value === "all" ? undefined : [value as DomainType] 
            })
          }
        >
          <SelectTrigger className="w-[160px] bg-secondary border-0">
            <SelectValue placeholder={t("filters.type")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.all_types")}</SelectItem>
            {domainTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {t(type.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.statuses?.[0] || "all"}
          onValueChange={(value) => 
            onFiltersChange({ 
              ...filters, 
              statuses: value === "all" ? undefined : [value as DomainStatus] 
            })
          }
        >
          <SelectTrigger className="w-[140px] bg-secondary border-0">
            <SelectValue placeholder={t("filters.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.all_statuses")}</SelectItem>
            {domainStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {t(status.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.projects?.[0] || "all"}
          onValueChange={(value) => 
            onFiltersChange({ 
              ...filters, 
              projects: value === "all" ? undefined : [value] 
            })
          }
        >
          <SelectTrigger className="w-[180px] bg-secondary border-0">
            <SelectValue placeholder={t("filters.project")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.all_projects")}</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project} value={project}>
                {project}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            {t("filters.reset")}
          </Button>
        )}

        <div>
          <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
            <Download className="h-4 w-4" />
            {t("domains.export")}
          </Button>
        </div>
      </div>
    </div>
  );
}
