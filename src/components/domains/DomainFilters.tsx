import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, X, Download, Filter } from "lucide-react";
import { DomainFilter, DomainType, DomainStatus } from "@/types/domain";
import { projects, departments, registrars } from "@/data/mockDomains";

const domainTypes: { value: DomainType; label: string }[] = [
  { value: "landing", label: "Лендинг" },
  { value: "company", label: "Сайт компании" },
  { value: "product", label: "Продукт" },
  { value: "mirror", label: "Зеркало" },
  { value: "seo", label: "SEO-сателлит" },
  { value: "subdomain", label: "Поддомен" },
  { value: "referral", label: "Реферальный" },
  { value: "redirect", label: "Редиректор" },
  { value: "technical", label: "Технический" },
  { value: "b2b", label: "B2B" },
];

const domainStatuses: { value: DomainStatus; label: string }[] = [
  { value: "active", label: "Активен" },
  { value: "expiring", label: "Истекает" },
  { value: "expired", label: "Истёк" },
  { value: "reserved", label: "Резерв" },
];

interface DomainFiltersProps {
  filters: DomainFilter;
  onFiltersChange: (filters: DomainFilter) => void;
  onExport: () => void;
}

export function DomainFilters({ filters, onFiltersChange, onExport }: DomainFiltersProps) {
  const hasActiveFilters = 
    filters.search || 
    filters.types?.length || 
    filters.statuses?.length || 
    filters.projects?.length ||
    filters.registrars?.length;

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
            <SelectValue placeholder="Тип домена" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            {domainTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
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
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            {domainStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
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
            <SelectValue placeholder="Проект" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все проекты</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project} value={project}>
                {project}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.registrars?.[0] || "all"}
          onValueChange={(value) => 
            onFiltersChange({ 
              ...filters, 
              registrars: value === "all" ? undefined : [value] 
            })
          }
        >
          <SelectTrigger className="w-[150px] bg-secondary border-0">
            <SelectValue placeholder="Регистратор" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все регистраторы</SelectItem>
            {registrars.map((registrar) => (
              <SelectItem key={registrar} value={registrar}>
                {registrar}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Сбросить
          </Button>
        )}

        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
            <Download className="h-4 w-4" />
            Экспорт CSV
          </Button>
        </div>
      </div>
    </div>
  );
}
