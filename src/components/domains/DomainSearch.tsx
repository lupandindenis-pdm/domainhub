import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { mockDomains, mockLabels } from "@/data/mockDomains";
import { Domain, Label } from "@/types/domain";
import { LabelBadge } from "./LabelBadge";
import { DomainTypeBadge } from "./DomainTypeBadge";
import { DomainStatusBadge } from "./DomainStatusBadge";
import { cn } from "@/lib/utils";

const MAX_RESULTS = 8;

export function DomainSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Domain[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [domainLabelAssignments, setDomainLabelAssignments] = useState<Record<string, string>>({});
  const [editedDomains, setEditedDomains] = useState<Record<string, any>>({});
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // Merge mockDomains with edited domains from localStorage
  const domains = mockDomains.map(domain => {
    const editedData = editedDomains[domain.id];
    if (editedData) {
      return {
        ...domain,
        ...editedData,
        id: domain.id,
        registrationDate: domain.registrationDate,
        expirationDate: domain.expirationDate,
        createdAt: domain.createdAt,
      };
    }
    return domain;
  });

  // Load labels, assignments, and edited domains from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const savedLabels = localStorage.getItem('domainLabels');
        const savedAssignments = localStorage.getItem('domainLabelAssignments');
        const savedEditedDomains = localStorage.getItem('editedDomains');
        
        if (savedLabels) {
          setLabels(JSON.parse(savedLabels));
        } else {
          setLabels(mockLabels);
        }
        
        if (savedAssignments) {
          setDomainLabelAssignments(JSON.parse(savedAssignments));
        }

        if (savedEditedDomains) {
          setEditedDomains(JSON.parse(savedEditedDomains));
        }
      } catch (error) {
        console.error('Failed to load data from localStorage:', error);
        setLabels(mockLabels);
      }
    };

    loadData();

    // Reload when window gains focus
    window.addEventListener('focus', loadData);
    
    // Check periodically for changes
    const interval = setInterval(loadData, 1000);

    return () => {
      window.removeEventListener('focus', loadData);
      clearInterval(interval);
    };
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 0) {
        const filtered = domains.filter(domain =>
          domain.name.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered.slice(0, MAX_RESULTS));
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, domains]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = (domainId: string) => {
    navigate(`/domains/${domainId}`);
    setIsOpen(false);
    setQuery("");
  };

  const handleShowAll = () => {
    navigate(`/domains?search=${encodeURIComponent(query)}`);
    setIsOpen(false);
    setQuery("");
  };

  const getLabelForDomain = (domainId: string): Label | undefined => {
    const labelId = domainLabelAssignments[domainId];
    return labelId ? labels.find(l => l.id === labelId) : undefined;
  };

  const totalResults = domains.filter(domain =>
    domain.name.toLowerCase().includes(query.toLowerCase())
  ).length;

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Поиск доменов..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length > 0 && setIsOpen(true)}
          className="pl-9 h-9 border-0 bg-secondary/80"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full rounded-lg bg-popover shadow-lg z-50 overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
            {results.map((domain) => {
              const label = getLabelForDomain(domain.id);
              
              return (
                <div
                  key={domain.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors border-b last:border-b-0"
                >
                  {/* Left side: Domain info */}
                  <div className="flex-1 min-w-0">
                    {/* Domain Name - clickable */}
                    <button
                      onClick={() => handleNavigate(domain.id)}
                      className="font-mono font-semibold text-sm text-foreground hover:text-primary transition-colors text-left block w-full truncate"
                    >
                      {domain.name}
                    </button>
                    
                    {/* Metadata line: Type, Status, Label */}
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{domain.type === 'landing' ? 'Лендинг' : domain.type === 'site' ? 'Сайт' : domain.type === 'product' ? 'Домен продукта' : domain.type === 'mirror' ? 'Зеркало' : domain.type === 'seo' ? 'SEO' : domain.type === 'subdomain' ? 'Поддомен' : domain.type === 'referral' ? 'Реферальный' : domain.type === 'redirect' ? 'Редирект' : domain.type === 'technical' ? 'Технический' : domain.type === 'b2b' ? 'B2B' : domain.type}</span>
                      <span>•</span>
                      <span>{domain.status === 'actual' ? 'Активен' : domain.status === 'spare' ? 'Запасной' : domain.status === 'not_actual' ? 'Не актуален' : domain.status === 'not_configured' ? 'Не настроен' : domain.status === 'unknown' ? 'Не известен' : domain.status === 'expiring' ? 'Истекает' : domain.status === 'expired' ? 'Истёк' : domain.status === 'blocked' ? 'Заблокирован' : domain.status === 'test' ? 'Тест' : domain.status}</span>
                      {label && (
                        <>
                          <span>•</span>
                          <span style={{ color: label.color }}>{label.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Navigate Icon - clickable */}
                  <button
                    onClick={() => handleNavigate(domain.id)}
                    className="flex-shrink-0 p-1.5 rounded hover:bg-primary transition-all group"
                    aria-label={`Перейти к ${domain.name}`}
                  >
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                  </button>
                </div>
              );
            })}

            {/* Show All Results */}
            {totalResults > MAX_RESULTS && (
              <button
                onClick={handleShowAll}
                className="w-full px-4 py-3 text-sm text-primary hover:bg-accent/50 transition-colors text-left font-medium"
              >
                Показать все результаты ({totalResults})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {isOpen && query.trim().length > 0 && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full rounded-lg border bg-popover shadow-lg z-50 p-6 text-center">
          <p className="text-sm font-medium text-muted-foreground">Домены не найдены</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Попробуйте изменить поисковый запрос
          </p>
        </div>
      )}
    </div>
  );
}
