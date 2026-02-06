import { Button } from "@/components/ui/button";
import { X, Download, Check, ChevronDown, CheckSquare, Square, EyeOff, Edit } from "lucide-react";
import { SingleSelectFilter } from "./SingleSelectFilter";
import { DomainFilter, DomainType, DomainStatus, Label } from "@/types/domain";
import { LabelBadge } from "./LabelBadge";
import { projects, folders } from "@/data/mockDomains";
import { useLanguage } from "@/components/language-provider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { DOMAIN_TYPES, DOMAIN_STATUSES } from "@/constants/domainTypes";

interface DomainFiltersProps {
  filters: DomainFilter;
  onFiltersChange: (filters: DomainFilter) => void;
  onExport: () => void;
  bulkSelectMode: boolean;
  onToggleBulkMode: () => void;
  showHidden: boolean;
  onToggleShowHidden: () => void;
  hiddenCount: number;
  labels: Label[];
  quickEditMode?: boolean;
  onToggleQuickEditMode?: () => void;
}

interface MultiSelectProps {
  title: string;
  options: { value: string; label: string }[];
  selectedValues?: string[];
  onChange: (values: string[]) => void;
}

function MultiSelectFilter({ title, options, selectedValues = [], onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  const handleSelect = (value: string) => {
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(newSelected);
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="h-10 justify-between bg-secondary/50 border-0 hover:bg-secondary/80">
          <div className="flex items-center gap-2">
            <span>{title}</span>
            {selectedValues.length > 0 && (
              <Badge variant="secondary" className="rounded-sm px-1 font-normal bg-primary/20 text-primary-foreground">
                {selectedValues.length}
              </Badge>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    <span>{t(option.label) === option.label ? option.label : t(option.label)}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleClear}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function DomainFilters({ filters, onFiltersChange, onExport, bulkSelectMode, onToggleBulkMode, showHidden, onToggleShowHidden, hiddenCount, labels, quickEditMode = false, onToggleQuickEditMode }: DomainFiltersProps) {
  const { t } = useLanguage();
  const hasActiveFilters = 
    filters.search || 
    filters.types?.length || 
    filters.statuses?.length || 
    filters.projects?.length ||
    filters.folders?.length ||
    filters.labelId;

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={bulkSelectMode ? "default" : "outline"}
          size="icon"
          onClick={onToggleBulkMode}
          disabled={quickEditMode}
          className={cn(
            "h-10 w-10 transition-colors",
            bulkSelectMode ? "bg-primary text-primary-foreground" : "bg-secondary/50 border-0 hover:bg-secondary/80",
            quickEditMode && "opacity-50 cursor-not-allowed"
          )}
          aria-label="Toggle bulk select mode"
        >
          {bulkSelectMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
        </Button>

        {onToggleQuickEditMode && (
          <Button
            variant={quickEditMode ? "default" : "outline"}
            size="icon"
            onClick={onToggleQuickEditMode}
            disabled={bulkSelectMode}
            className={cn(
              "h-10 w-10 transition-colors",
              quickEditMode ? "bg-primary text-primary-foreground" : "bg-secondary/50 border-0 hover:bg-secondary/80",
              bulkSelectMode && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Toggle quick edit mode"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}

        <MultiSelectFilter
          title={t("filters.all_projects")}
          options={projects.map(p => ({ value: p, label: p }))}
          selectedValues={filters.projects}
          onChange={(values) => onFiltersChange({ ...filters, projects: values })}
        />

        <MultiSelectFilter
          title="Папки"
          options={folders.map(f => ({ value: f, label: f }))}
          selectedValues={filters.folders}
          onChange={(values) => onFiltersChange({ ...filters, folders: values })}
        />

        <SingleSelectFilter
          title="Метки"
          options={labels.map(l => ({ value: l.id, label: l.name, color: l.color }))}
          selectedValue={filters.labelId}
          onChange={(value) => onFiltersChange({ ...filters, labelId: value })}
          renderOption={(option) => {
            const label = labels.find(l => l.id === option.value);
            return label ? <LabelBadge label={label} /> : option.label;
          }}
        />

        <MultiSelectFilter
          title={t("filters.all_types")}
          options={DOMAIN_TYPES}
          selectedValues={filters.types}
          onChange={(values) => onFiltersChange({ ...filters, types: values as DomainType[] })}
        />

        <MultiSelectFilter
          title={t("filters.all_statuses")}
          options={DOMAIN_STATUSES}
          selectedValues={filters.statuses}
          onChange={(values) => onFiltersChange({ ...filters, statuses: values as DomainStatus[] })}
        />

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 h-10">
            <X className="h-4 w-4" />
            {t("filters.reset")}
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          {hiddenCount > 0 && (
            <Button
              variant={showHidden ? "default" : "outline"}
              size="icon"
              onClick={onToggleShowHidden}
              className={cn(
                "h-10 w-10 transition-colors",
                showHidden 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary/50 border-0 hover:bg-secondary/80 text-yellow-500 hover:text-yellow-400"
              )}
              aria-label="Toggle show hidden domains"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
