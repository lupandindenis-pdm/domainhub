import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, ArrowRight } from "lucide-react";
import { mockDomains } from "@/data/mockDomains";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SimpleSearchProps {
  placeholder?: string;
  className?: string;
}

export function SimpleSearch({ placeholder = "Поиск домена...", className }: SimpleSearchProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [showResults, setShowResults] = React.useState(false);
  const navigate = useNavigate();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const resultsRef = React.useRef<HTMLDivElement>(null);

  // Фильтрация доменов
  const filteredDomains = React.useMemo(() => {
    if (!inputValue) return [];
    
    const query = inputValue.toLowerCase();
    return mockDomains.filter(domain => 
      domain.name.toLowerCase().includes(query) ||
      domain.project.toLowerCase().includes(query) ||
      domain.type.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [inputValue]);

  const handleSelect = (domainName: string) => {
    const domain = mockDomains.find(d => d.name === domainName);
    if (domain) {
      navigate(`/domains/${domain.id}`);
      toast.success(`Открыт домен: ${domain.name}`);
    }
    setShowResults(false);
    setInputValue("");
  };

  // Закрытие при клике вне
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      actual: "bg-green-500/20 text-green-700",
      expiring: "bg-yellow-500/20 text-yellow-700",
      expired: "bg-red-500/20 text-red-700",
      not_configured: "bg-orange-500/20 text-orange-700",
      unknown: "bg-gray-500/20 text-gray-700",
      spare: "bg-blue-500/20 text-blue-700"
    };
    return colors[status] || "bg-gray-500/20 text-gray-700";
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      site: "Сайт",
      product: "Продукт",
      landing: "Лендинг",
      mirror: "Зеркало",
      seo: "SEO",
      subdomain: "Поддомен",
      referral: "Реферал",
      redirect: "Редирект",
      technical: "Технический",
      b2b: "B2B"
    };
    return labels[type] || type;
  };

  const getLabelStyle = (label: string) => {
    const labelStyles: Record<string, { bg: string; text: string }> = {
      frontend: { bg: 'bg-blue-500/20', text: 'text-white/50' },
      backend: { bg: 'bg-green-500/20', text: 'text-white/50' },
      mobile: { bg: 'bg-purple-500/20', text: 'text-white/50' },
      devops: { bg: 'bg-orange-500/20', text: 'text-white/50' },
      design: { bg: 'bg-pink-500/20', text: 'text-white/50' },
      marketing: { bg: 'bg-red-500/20', text: 'text-white/50' },
      analytics: { bg: 'bg-indigo-500/20', text: 'text-white/50' },
      testing: { bg: 'bg-yellow-500/20', text: 'text-white/50' },
      documentation: { bg: 'bg-gray-500/20', text: 'text-white/50' },
      infrastructure: { bg: 'bg-teal-500/20', text: 'text-white/50' }
    };
    
    return labelStyles[label] || { bg: 'bg-gray-500/20', text: 'text-white/50' };
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      actual: "Актуален",
      expiring: "Истекает",
      expired: "Истёк",
      not_configured: "Не настроен",
      unknown: "Не известно",
      spare: "Запасной"
    };
    return labels[status] || status;
  };

  return (
    <div className="relative max-w-md flex-1">
      <div 
        className={cn(
          "flex items-center gap-2 w-full h-10 px-3 py-2 text-sm bg-secondary/50 border-0 rounded-md hover:bg-secondary/80 cursor-text",
          !inputValue && "text-muted-foreground",
          className
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="flex-1 bg-transparent outline-none border-0 text-sm placeholder:text-muted-foreground"
        />
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
      
      {/* Результаты поиска */}
      {showResults && (
        <div 
          ref={resultsRef}
          // ИЗМЕНЕНО: Убрана обводка и сделан сплошной фон
          className="absolute top-full left-0 right-0 mt-2 bg-secondary rounded-md shadow-lg z-50 max-h-80 overflow-auto border-0"
        >
          {filteredDomains.length > 0 ? (
            <div className="p-2">
              {filteredDomains.map((domain) => (
                <div
                  key={domain.id}
                  onClick={() => handleSelect(domain.name)}
                  className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer rounded-md transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium font-mono">{domain.name}</span>
                      {domain.label && (
                        <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs leading-none h-5 ${getLabelStyle(domain.label).bg} ${getLabelStyle(domain.label).text} shrink-0 text-center`}>
                          #{domain.label}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getTypeLabel(domain.type)} • {getStatusLabel(domain.status)} • {domain.project}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          ) : inputValue ? (
            <div className="p-4 text-center">
              <div className="text-sm text-muted-foreground">
                Ничего не найдено для "{inputValue}"
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
