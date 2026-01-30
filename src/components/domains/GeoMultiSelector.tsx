import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// Список всех стран с кодами и цветами
const geoOptions = [
  { code: "WW", name: "Worldwide", color: "#8b5cf6" },
  { code: "RU", name: "Россия", color: "#ef4444" },
  { code: "US", name: "США", color: "#3b82f6" },
  { code: "GB", name: "Великобритания", color: "#10b981" },
  { code: "DE", name: "Германия", color: "#f59e0b" },
  { code: "FR", name: "Франция", color: "#06b6d4" },
  { code: "IT", name: "Италия", color: "#ec4899" },
  { code: "ES", name: "Испания", color: "#f97316" },
  { code: "CA", name: "Канада", color: "#14b8a6" },
  { code: "AU", name: "Австралия", color: "#a855f7" },
  { code: "JP", name: "Япония", color: "#ef4444" },
  { code: "CN", name: "Китай", color: "#eab308" },
  { code: "IN", name: "Индия", color: "#f97316" },
  { code: "BR", name: "Бразилия", color: "#10b981" },
  { code: "MX", name: "Мексика", color: "#06b6d4" },
  { code: "KR", name: "Южная Корея", color: "#3b82f6" },
  { code: "NL", name: "Нидерланды", color: "#f59e0b" },
  { code: "SE", name: "Швеция", color: "#06b6d4" },
  { code: "NO", name: "Норвегия", color: "#3b82f6" },
  { code: "FI", name: "Финляндия", color: "#06b6d4" },
  { code: "DK", name: "Дания", color: "#ef4444" },
  { code: "PL", name: "Польша", color: "#ef4444" },
  { code: "CZ", name: "Чехия", color: "#3b82f6" },
  { code: "AT", name: "Австрия", color: "#ef4444" },
  { code: "CH", name: "Швейцария", color: "#ef4444" },
  { code: "BE", name: "Бельгия", color: "#eab308" },
  { code: "PT", name: "Португалия", color: "#10b981" },
  { code: "GR", name: "Греция", color: "#3b82f6" },
  { code: "TR", name: "Турция", color: "#ef4444" },
  { code: "IL", name: "Израиль", color: "#3b82f6" },
  { code: "AE", name: "ОАЭ", color: "#10b981" },
  { code: "SA", name: "Саудовская Аравия", color: "#10b981" },
  { code: "ZA", name: "ЮАР", color: "#eab308" },
  { code: "AR", name: "Аргентина", color: "#06b6d4" },
  { code: "CL", name: "Чили", color: "#ef4444" },
  { code: "CO", name: "Колумбия", color: "#eab308" },
  { code: "PE", name: "Перу", color: "#ef4444" },
  { code: "VE", name: "Венесуэла", color: "#eab308" },
  { code: "TH", name: "Таиланд", color: "#3b82f6" },
  { code: "VN", name: "Вьетнам", color: "#ef4444" },
  { code: "ID", name: "Индонезия", color: "#ef4444" },
  { code: "MY", name: "Малайзия", color: "#3b82f6" },
  { code: "SG", name: "Сингапур", color: "#ef4444" },
  { code: "PH", name: "Филиппины", color: "#3b82f6" },
  { code: "NZ", name: "Новая Зеландия", color: "#3b82f6" },
  { code: "HK", name: "Гонконг", color: "#ef4444" },
  { code: "TW", name: "Тайвань", color: "#3b82f6" },
  { code: "UA", name: "Украина", color: "#3b82f6" },
  { code: "BY", name: "Беларусь", color: "#10b981" },
  { code: "KZ", name: "Казахстан", color: "#06b6d4" },
  { code: "UZ", name: "Узбекистан", color: "#3b82f6" },
  { code: "GE", name: "Грузия", color: "#ef4444" },
  { code: "AM", name: "Армения", color: "#f97316" },
  { code: "AZ", name: "Азербайджан", color: "#10b981" },
  { code: "MD", name: "Молдова", color: "#3b82f6" },
  { code: "EE", name: "Эстония", color: "#3b82f6" },
  { code: "LV", name: "Латвия", color: "#ef4444" },
  { code: "LT", name: "Литва", color: "#eab308" },
  { code: "RO", name: "Румыния", color: "#3b82f6" },
  { code: "BG", name: "Болгария", color: "#10b981" },
  { code: "RS", name: "Сербия", color: "#ef4444" },
  { code: "HR", name: "Хорватия", color: "#3b82f6" },
  { code: "SI", name: "Словения", color: "#3b82f6" },
  { code: "SK", name: "Словакия", color: "#3b82f6" },
  { code: "HU", name: "Венгрия", color: "#10b981" },
  { code: "IE", name: "Ирландия", color: "#10b981" },
  { code: "IS", name: "Исландия", color: "#3b82f6" },
  { code: "LU", name: "Люксембург", color: "#06b6d4" },
  { code: "MT", name: "Мальта", color: "#ef4444" },
  { code: "CY", name: "Кипр", color: "#f97316" },
  { code: "EG", name: "Египет", color: "#eab308" },
  { code: "MA", name: "Марокко", color: "#ef4444" },
  { code: "NG", name: "Нигерия", color: "#10b981" },
  { code: "KE", name: "Кения", color: "#ef4444" },
  { code: "CIS", name: "СНГ", color: "#06b6d4" },
  { code: "EU", name: "Европа", color: "#3b82f6" },
  { code: "ASIA", name: "Азия", color: "#f97316" },
  { code: "LATAM", name: "Латинская Америка", color: "#10b981" },
];

interface GeoMultiSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
}

export function GeoMultiSelector({ selected, onChange, disabled }: GeoMultiSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return geoOptions;
    
    const query = searchQuery.toLowerCase();
    return geoOptions.filter(
      (option) =>
        option.code.toLowerCase().includes(query) ||
        option.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelect = (code: string) => {
    const newSelected = selected.includes(code)
      ? selected.filter((c) => c !== code)
      : [...selected, code];
    onChange(newSelected);
  };

  const handleRemove = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((c) => c !== code));
  };

  const selectedOptions = selected
    .map((code) => geoOptions.find((opt) => opt.code === code))
    .filter(Boolean);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between bg-muted/50 border-none hover:bg-muted/70 min-h-10 h-auto py-2"
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <Badge
                  key={option!.code}
                  variant="secondary"
                  style={{ backgroundColor: `${option!.color}20`, color: option!.color }}
                  className="gap-1 border-0"
                >
                  {option!.code}
                  {!disabled && (
                    <X
                      className="h-3 w-3 cursor-pointer hover:opacity-70"
                      onClick={(e) => handleRemove(option!.code, e)}
                    />
                  )}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">Выберите GEO...</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Поиск GEO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none border-none focus-visible:ring-0 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList className="max-h-[300px]">
            <CommandEmpty>GEO не найдено</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.code}
                  value={option.code}
                  onSelect={() => handleSelect(option.code)}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selected.includes(option.code)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </div>
                  <Badge
                    variant="secondary"
                    style={{ backgroundColor: `${option.color}20`, color: option.color }}
                    className="mr-2 border-0 font-mono text-xs"
                  >
                    {option.code}
                  </Badge>
                  <span>{option.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
