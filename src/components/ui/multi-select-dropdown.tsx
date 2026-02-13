import { useState, useRef, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

type OptionItem = string | { value: string; label: string };

interface MultiSelectDropdownProps {
  label?: string;
  options: OptionItem[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  allLabel?: string;
  emptyMeansAll?: boolean;
  className?: string;
}

function getOptionValue(opt: OptionItem): string {
  return typeof opt === 'string' ? opt : opt.value;
}

function getOptionLabel(opt: OptionItem): string {
  return typeof opt === 'string' ? opt : opt.label;
}

export function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = "Выберите...",
  allLabel = "Все",
  emptyMeansAll = true,
  className,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const optionValues = options.map(getOptionValue);
  const allSelected = selected.length === optionValues.length && optionValues.length > 0;
  const noneSelected = selected.length === 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange([...optionValues]);
    }
  };

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const getLabel = (val: string) => {
    const opt = options.find(o => getOptionValue(o) === val);
    return opt ? getOptionLabel(opt) : val;
  };

  const displayText = noneSelected
    ? placeholder
    : allSelected
    ? allLabel
    : selected.length <= 2
    ? selected.map(getLabel).join(", ")
    : `Выбрано: ${selected.length}`;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={cn("w-full justify-between font-normal h-10 bg-transparent", !noneSelected ? "pr-14" : "pr-8")}
      >
        <span className="truncate text-sm">
          {displayText}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0 ml-2", open && "rotate-180")} />
      </Button>
      {!noneSelected && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange([]); setOpen(false); }}
          className="absolute right-8 top-1/2 -translate-y-1/2 z-10 p-0.5 rounded hover:bg-white/[0.06] transition-colors"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer" />
        </button>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md bg-popover shadow-md animate-in fade-in-0 zoom-in-95">
          <div className="max-h-[220px] overflow-auto p-1">
            {/* "Все" option */}
            <label className="flex items-center gap-2 px-3 py-2 hover:bg-secondary/50 rounded-sm cursor-pointer">
              <Checkbox
                checked={allSelected || (emptyMeansAll && noneSelected)}
                onCheckedChange={handleToggleAll}
              />
              <span className="text-sm font-medium">{allLabel}</span>
            </label>

            <div className="mx-2 my-1 border-t" />

            {options.map((option) => {
              const val = getOptionValue(option);
              const lbl = getOptionLabel(option);
              return (
                <label
                  key={val}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-secondary/50 rounded-sm cursor-pointer"
                >
                  <Checkbox
                    checked={selected.includes(val)}
                    onCheckedChange={() => handleToggle(val)}
                  />
                  <span className="text-sm">{lbl}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
