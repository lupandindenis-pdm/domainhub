import * as React from "react";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, Clock, Globe, Star, Hash, ExternalLink, ArrowRight } from "lucide-react";
import { useAllDomains } from "@/hooks/use-all-domains";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSearchHotkey } from "@/hooks/use-search-hotkey";

interface SmartSearchProps {
  placeholder?: string;
  className?: string;
}

export function SmartSearch({ placeholder = "Поиск домена...", className }: SmartSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [searchHistory, setSearchHistory] = React.useState<string[]>([]);
  const navigate = useNavigate();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const allDomains = useAllDomains();

  // Используем горячие клавиши
  useSearchHotkey(() => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  });

  // Получаем историю поиска из localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem("searchHistory");
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  // Сохраняем историю поиска
  const saveToHistory = (query: string) => {
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  // Фильтрация доменов
  const filteredDomains = React.useMemo(() => {
    if (!inputValue) return [];
    
    const query = inputValue.toLowerCase();
    const results = allDomains.filter(domain => 
      (domain.name || '').toLowerCase().includes(query) ||
      (domain.project || '').toLowerCase().includes(query) ||
      (domain.department || '').toLowerCase().includes(query) ||
      (domain.type || '').toLowerCase().includes(query) ||
      (domain.status || '').toLowerCase().includes(query) ||
      (domain.label && domain.label.toLowerCase().includes(query))
    ).slice(0, 6);
    
    return results;
  }, [inputValue, allDomains]);

  // Категории результатов
  const categories = React.useMemo(() => {
    if (!inputValue) return [];
    
    const query = inputValue.toLowerCase();
    const cats = [];
    
    // Проверяем типы доменов
    const types = [...new Set(allDomains.filter(d => 
      (d.type || '').toLowerCase().includes(query)
    ).map(d => d.type))];
    
    if (types.length > 0) {
      cats.push({
        title: "Типы",
        items: types.map(type => ({
          id: `type-${type}`,
          title: type,
          type: "type",
          icon: Globe,
          description: `Найти все ${type} домены`
        }))
      });
    }
    
    // Проверяем проекты
    const projects = [...new Set(allDomains.filter(d => 
      (d.project || '').toLowerCase().includes(query)
    ).map(d => d.project))];
    
    if (projects.length > 0) {
      cats.push({
        title: "Проекты",
        items: projects.slice(0, 2).map(project => ({
          id: `project-${project}`,
          title: project,
          type: "project",
          icon: Star,
          description: `Домены проекта ${project}`
        }))
      });
    }
    
    return cats;
  }, [inputValue, allDomains]);

  const handleSelect = (value: string, type: string = "domain") => {
    setInputValue(value);
    setOpen(false);
    
    if (type === "domain") {
      // Ищем домен и переходим на его страницу
      const domain = allDomains.find(d => d.name === value);
      if (domain) {
        navigate(`/domains/${domain.id}`);
        toast.success(`Открыт домен: ${domain.name}`);
      }
    } else if (type === "type") {
      // Фильтруем по типу
      navigate(`/domains?type=${value}`);
      toast.success(`Фильтр по типу: ${value}`);
    } else if (type === "project") {
      // Фильтруем по проекту
      navigate(`/domains?project=${value}`);
      toast.success(`Фильтр по проекту: ${value}`);
    }
    
    saveToHistory(value);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
    toast.success("История поиска очищена");
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      actual: "bg-green-500/20 text-green-700",
      expiring: "bg-yellow-500/20 text-yellow-700",
      expired: "bg-red-500/20 text-red-700",
      not_configured: "bg-orange-500/20 text-orange-700",
      unknown: "bg-gray-500/20 text-gray-700"
    };
    return colors[status] || "bg-gray-500/20 text-gray-700";
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      site: Globe,
      product: Star,
      landing: Hash,
      mirror: ExternalLink
    };
    return icons[type] || Globe;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative max-w-md flex-1">
        <div 
          className={cn(
            "flex items-center gap-2 w-full h-10 px-3 py-2 text-sm bg-secondary/50 border-0 rounded-md hover:bg-secondary/80 cursor-text",
            !inputValue && "text-muted-foreground",
            className
          )}
          onClick={() => {
            console.log('Search clicked');
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className="flex-1 bg-transparent outline-none border-0 text-sm placeholder:text-muted-foreground"
          />
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
        
        {/* ИЗМЕНЕНО: Убрана обводка и сделан сплошной фон */}
        <PopoverContent className="w-[400px] p-0 border-0 bg-secondary shadow-lg" align="start" sideOffset={4} collisionPadding={10}>
          <Command className="w-full">
            <CommandList className="max-h-80">
              {!inputValue && searchHistory.length > 0 && (
                <CommandGroup heading="Недавние запросы">
                  {searchHistory.map((item) => (
                    <CommandItem
                      key={item}
                      value={item}
                      onSelect={() => handleSelect(item)}
                    >
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{item}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </CommandItem>
                  ))}
                  {searchHistory.length > 0 && (
                    <CommandItem
                      onSelect={handleClearHistory}
                      className="text-center justify-center text-muted-foreground"
                    >
                      Очистить историю
                    </CommandItem>
                  )}
                </CommandGroup>
              )}

              {inputValue && filteredDomains.length > 0 && (
                <CommandGroup heading="Домены">
                  {filteredDomains.map((domain) => {
                    const IconComponent = getTypeIcon(domain.type);
                    return (
                      <CommandItem
                        key={domain.id}
                        value={domain.name}
                        onSelect={() => handleSelect(domain.name, "domain")}
                      >
                        <IconComponent className="mr-2 h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium font-mono">{domain.name}</span>
                            <Badge className={cn("text-xs", getStatusColor(domain.status))}>
                              {domain.status}
                            </Badge>
                            {domain.label && (
                              <Badge variant="outline" className="text-xs">
                                #{domain.label}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {domain.project} • {domain.type}
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {inputValue && filteredDomains.length === 0 && (
                <CommandEmpty className="py-6 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 text-muted-foreground" />
                    <div className="text-sm font-medium">Ничего не найдено</div>
                    <div className="text-xs text-muted-foreground">
                      Попробуйте изменить поисковый запрос
                    </div>
                  </div>
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </div>
    </Popover>
  );
}
