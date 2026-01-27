import * as React from "react";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, Clock, Globe, Star, Hash, ExternalLink, ArrowRight } from "lucide-react";
import { mockDomains } from "@/data/mockDomains";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSearchHotkey } from "@/hooks/use-search-hotkey";

interface SearchModalProps {
  placeholder?: string;
  trigger?: React.ReactNode;
}

export function SearchModal({ placeholder = "Поиск домена...", trigger }: SearchModalProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [searchHistory, setSearchHistory] = React.useState<string[]>([]);
  const navigate = useNavigate();
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Используем горячие клавиши
  useSearchHotkey(() => setOpen(true));

  // Фокус на input при открытии
  React.useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

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
    return mockDomains.filter(domain => 
      domain.name.toLowerCase().includes(query) ||
      domain.project.toLowerCase().includes(query) ||
      domain.department.toLowerCase().includes(query) ||
      domain.type.toLowerCase().includes(query) ||
      domain.status.toLowerCase().includes(query) ||
      (domain.label && domain.label.toLowerCase().includes(query))
    ).slice(0, 8);
  }, [inputValue]);

  // Категории результатов
  const categories = React.useMemo(() => {
    if (!inputValue) return [];
    
    const query = inputValue.toLowerCase();
    const cats = [];
    
    // Проверяем типы доменов
    const types = [...new Set(mockDomains.filter(d => 
      d.type.toLowerCase().includes(query)
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
    const projects = [...new Set(mockDomains.filter(d => 
      d.project.toLowerCase().includes(query)
    ).map(d => d.project))];
    
    if (projects.length > 0) {
      cats.push({
        title: "Проекты",
        items: projects.slice(0, 3).map(project => ({
          id: `project-${project}`,
          title: project,
          type: "project",
          icon: Star,
          description: `Домены проекта ${project}`
        }))
      });
    }
    
    return cats;
  }, [inputValue]);

  const handleSelect = (value: string, type: string = "domain") => {
    setInputValue(value);
    setOpen(false);
    
    if (type === "domain") {
      // Ищем домен и переходим на его страницу
      const domain = mockDomains.find(d => d.name === value);
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

  // Кастомный триггер
  const TriggerComponent = trigger || (
    <Button
      variant="outline"
      className="w-full justify-between text-left font-normal h-10 bg-secondary/50 border-0 hover:bg-secondary/80"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate">Поиск домена...</span>
      </div>
      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {TriggerComponent}
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-0 shadow-lg">
          <div className="flex flex-col">
            {/* Header - ИЗМЕНЕНО: Убрана обводка и сделан сплошной фон */}
            <div className="flex items-center gap-3 px-4 py-3 bg-secondary">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Поиск домена, проекта или типа..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground border-0 focus:ring-0"
              />
            </div>
            
            {/* Results - ИЗМЕНЕНО: Убрана обводка и сделан сплошной фон */}
            <Command className="w-full rounded-none border-0 bg-secondary">
              <CommandList className="max-h-96">
                {!inputValue && searchHistory.length > 0 && (
                  <CommandGroup heading="Недавние запросы">
                    {searchHistory.map((item) => (
                      <CommandItem
                        key={item}
                        value={item}
                        onSelect={() => handleSelect(item)}
                      >
                        <Clock className="mr-3 h-4 w-4 text-muted-foreground" />
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

                {inputValue && categories.length > 0 && (
                  <>
                    {categories.map((category) => (
                      <CommandGroup key={category.title} heading={category.title}>
                        {category.items.map((item) => {
                          const IconComponent = item.icon;
                          return (
                            <CommandItem
                              key={item.id}
                              value={item.title}
                              onSelect={() => handleSelect(item.title, item.type)}
                            >
                              <IconComponent className="mr-3 h-4 w-4 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">{item.title}</div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {item.description}
                                </div>
                              </div>
                              <Badge variant="secondary" className="ml-2">
                                {item.type === 'type' ? 'Тип' : 'Проект'}
                              </Badge>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    ))}
                  </>
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
                          <IconComponent className="mr-3 h-4 w-4 text-muted-foreground" />
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

                {inputValue && filteredDomains.length === 0 && categories.length === 0 && (
                  <CommandEmpty className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Search className="h-12 w-12 text-muted-foreground" />
                      <div className="text-lg font-medium">Ничего не найдено</div>
                      <div className="text-sm text-muted-foreground max-w-md">
                        Попробуйте изменить поисковый запрос или проверьте правильность написания домена
                      </div>
                    </div>
                  </CommandEmpty>
                )}
              </CommandList>
            </Command>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
