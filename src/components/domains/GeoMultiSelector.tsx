import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { getGeoColor } from "@/data/geoColors";

// Список всех стран с кодами
const geoOptions = [
  { code: "WW", name: "Worldwide" },
  { code: "RU", name: "Россия" },
  { code: "US", name: "США" },
  { code: "GB", name: "Великобритания" },
  { code: "DE", name: "Германия" },
  { code: "FR", name: "Франция" },
  { code: "IT", name: "Италия" },
  { code: "ES", name: "Испания" },
  { code: "CA", name: "Канада" },
  { code: "AU", name: "Австралия" },
  { code: "JP", name: "Япония" },
  { code: "CN", name: "Китай" },
  { code: "IN", name: "Индия" },
  { code: "BR", name: "Бразилия" },
  { code: "MX", name: "Мексика" },
  { code: "KR", name: "Южная Корея" },
  { code: "NL", name: "Нидерланды" },
  { code: "SE", name: "Швеция" },
  { code: "NO", name: "Норвегия" },
  { code: "FI", name: "Финляндия" },
  { code: "DK", name: "Дания" },
  { code: "PL", name: "Польша" },
  { code: "CZ", name: "Чехия" },
  { code: "AT", name: "Австрия" },
  { code: "CH", name: "Швейцария" },
  { code: "BE", name: "Бельгия" },
  { code: "PT", name: "Португалия" },
  { code: "GR", name: "Греция" },
  { code: "TR", name: "Турция" },
  { code: "IL", name: "Израиль" },
  { code: "AE", name: "ОАЭ" },
  { code: "SA", name: "Саудовская Аравия" },
  { code: "ZA", name: "ЮАР" },
  { code: "AR", name: "Аргентина" },
  { code: "CL", name: "Чили" },
  { code: "CO", name: "Колумбия" },
  { code: "PE", name: "Перу" },
  { code: "VE", name: "Венесуэла" },
  { code: "TH", name: "Таиланд" },
  { code: "VN", name: "Вьетнам" },
  { code: "ID", name: "Индонезия" },
  { code: "MY", name: "Малайзия" },
  { code: "SG", name: "Сингапур" },
  { code: "PH", name: "Филиппины" },
  { code: "NZ", name: "Новая Зеландия" },
  { code: "HK", name: "Гонконг" },
  { code: "TW", name: "Тайвань" },
  { code: "UA", name: "Украина" },
  { code: "BY", name: "Беларусь" },
  { code: "KZ", name: "Казахстан" },
  { code: "UZ", name: "Узбекистан" },
  { code: "GE", name: "Грузия" },
  { code: "AM", name: "Армения" },
  { code: "AZ", name: "Азербайджан" },
  { code: "MD", name: "Молдова" },
  { code: "EE", name: "Эстония" },
  { code: "LV", name: "Латвия" },
  { code: "LT", name: "Литва" },
  { code: "RO", name: "Румыния" },
  { code: "BG", name: "Болгария" },
  { code: "RS", name: "Сербия" },
  { code: "HR", name: "Хорватия" },
  { code: "SI", name: "Словения" },
  { code: "SK", name: "Словакия" },
  { code: "HU", name: "Венгрия" },
  { code: "IE", name: "Ирландия" },
  { code: "IS", name: "Исландия" },
  { code: "LU", name: "Люксембург" },
  { code: "MT", name: "Мальта" },
  { code: "CY", name: "Кипр" },
  { code: "EG", name: "Египет" },
  { code: "MA", name: "Марокко" },
  { code: "NG", name: "Нигерия" },
  { code: "KE", name: "Кения" },
  { code: "CIS", name: "СНГ" },
  { code: "EU", name: "Европа" },
  { code: "ASIA", name: "Азия" },
  { code: "LATAM", name: "Латинская Америка" },
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
              selectedOptions.map((option) => {
                const color = getGeoColor(option!.code);
                return (
                  <Badge
                    key={option!.code}
                    variant="secondary"
                    style={{ backgroundColor: `${color}20`, color: color }}
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
                );
              })
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
              {filteredOptions.map((option) => {
                const color = getGeoColor(option.code);
                return (
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
                      style={{ backgroundColor: `${color}20`, color: color }}
                      className="mr-2 border-0 font-mono text-xs"
                    >
                      {option.code}
                    </Badge>
                    <span>{option.name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
