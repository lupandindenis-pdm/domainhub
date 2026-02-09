import { Domain, Label } from "@/types/domain";
import { DomainTypeBadge } from "./DomainTypeBadge";
import { DomainStatusBadge } from "./DomainStatusBadge";
import { LabelBadge } from "./LabelBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, ExternalLink, Globe, FolderKanban, Tag, Activity, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";
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
} from "@/components/ui/command";
import { projects } from "@/data/mockDomains";
import { DOMAIN_TYPES, DOMAIN_STATUSES } from "@/constants/domainTypes";

interface DomainTableProps {
  domains: Domain[];
  bulkSelectMode: boolean;
  selectedDomainIds: Set<string>;
  onToggleDomain: (domainId: string) => void;
  showHidden?: boolean;
  labels: Label[];
  quickEditMode?: boolean;
  onUpdateDomain?: (domainId: string, updates: Partial<Domain>) => void;
  onToggleQuickEditMode?: () => void;
}

export function DomainTable({ domains, bulkSelectMode, selectedDomainIds, onToggleDomain, showHidden = false, labels, quickEditMode = false, onUpdateDomain, onToggleQuickEditMode }: DomainTableProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Validate domain name
  const validateDomain = (domain: string): string => {
    if (!domain || domain.trim() === '') {
      return 'Домен не может быть пустым';
    }
    
    // Remove protocol and www if present for validation
    let cleanDomain = domain.trim();
    cleanDomain = cleanDomain.replace(/^https?:\/\//, '');
    cleanDomain = cleanDomain.replace(/^www\./, '');
    cleanDomain = cleanDomain.replace(/\/$/, '');
    
    // Check for spaces
    if (cleanDomain.includes(' ')) {
      return 'Домен не может содержать пробелы';
    }
    
    // Check for invalid characters
    const invalidChars = /[^a-zA-Z0-9.\/:#?&=_-]/;
    if (invalidChars.test(cleanDomain)) {
      return 'Домен содержит недопустимые символы';
    }
    
    // Check if domain has at least one dot (unless it's localhost)
    if (!cleanDomain.includes('.') && !cleanDomain.startsWith('localhost')) {
      return 'Домен должен содержать хотя бы одну точку (например: example.com)';
    }
    
    // Check domain length
    if (cleanDomain.length > 253) {
      return 'Домен слишком длинный (максимум 253 символа)';
    }
    
    // Check if domain starts or ends with dash or dot
    const parts = cleanDomain.split('/');
    const domainPart = parts[0];
    if (domainPart.startsWith('-') || domainPart.endsWith('-') || domainPart.startsWith('.') || domainPart.endsWith('.')) {
      return 'Домен не может начинаться или заканчиваться дефисом или точкой';
    }
    
    // Check TLD (top-level domain) - должна состоять только из букв
    const domainSegments = domainPart.split('.');
    if (domainSegments.length > 1) {
      const tld = domainSegments[domainSegments.length - 1];
      // TLD должна содержать только буквы (a-z, A-Z), минимум 2 символа
      if (!/^[a-zA-Z]{2,}$/.test(tld)) {
        return 'Доменная зона должна состоять только из букв (например: .com, .ru, .org)';
      }
    }
    
    return '';
  };

  const handleRowClick = (domainId: string) => {
    // В режиме быстрого редактирования не переходим в карточку
    if (quickEditMode) {
      return;
    }
    
    if (bulkSelectMode) {
      onToggleDomain(domainId);
    } else {
      navigate(`/domains/${domainId}`);
    }
  };

  return (
    <div className="w-full">
      <Table className="table-fixed w-full" role="table" aria-label="Domains list">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[35%]" scope="col">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <span>Domain</span>
              </div>
            </TableHead>
            <TableHead className="w-[20%]" scope="col">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-success" />
                <span>Project</span>
              </div>
            </TableHead>
            <TableHead className="w-[18%]" scope="col">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-chart-4" />
                <span>Type</span>
              </div>
            </TableHead>
            <TableHead className="w-[15%]" scope="col">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-warning" />
                <span>Status</span>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {domains.map((domain) => {
            const isSelected = selectedDomainIds.has(domain.id);
            return (
              <TableRow 
                key={domain.id} 
                className={cn(
                  "hover:bg-muted/50 cursor-pointer transition-colors duration-150",
                  showHidden && !isSelected && "bg-warning/10",
                  isSelected && "bg-primary/10"
                )}
                onClick={() => handleRowClick(domain.id)}
                aria-label={`Domain: ${domain.name}, Type: ${domain.type}, Status: ${domain.status}, Project: ${domain.project}`}
              >
                <TableCell className={cn("py-3", isSelected && "border-l-4 border-l-primary")}>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-yellow-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        try {
                          navigator.clipboard.writeText(domain.name);
                          toast.success(t("common.copied"));
                        } catch (error) {
                          toast.error(t("common.copy_failed"));
                        }
                      }}
                      aria-label={`Copy domain: ${domain.name}`}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {quickEditMode && onUpdateDomain ? (
                          <Input
                            value={domain.name}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              // Разрешаем ввод любых символов, валидация будет при выходе из режима
                              onUpdateDomain(domain.id, { name: newValue });
                              
                              // Обновляем состояние ошибок валидации для реактивного изменения обводки
                              const error = validateDomain(newValue);
                              setValidationErrors(prev => ({
                                ...prev,
                                [domain.id]: error
                              }));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                // Вызываем функцию выхода из режима быстрого редактирования (сохранение)
                                if (onToggleQuickEditMode) {
                                  onToggleQuickEditMode();
                                }
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                              "h-8 font-mono text-sm bg-muted/30 border-none",
                              validationErrors[domain.id]
                                ? "ring-1 ring-yellow-500" 
                                : "focus-visible:ring-1 focus-visible:ring-primary"
                            )}
                          />
                        ) : (
                          <span className="font-mono text-sm font-normal break-all line-clamp-2 max-w-xs" style={{ textWrap: 'balance', display: 'inline-block' }}>
                            {domain.name}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 inline-flex items-center justify-center ml-1 align-middle text-muted-foreground hover:text-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                const url = `https://${domain.name}`;
                                try {
                                  const validatedUrl = new URL(url);
                                  if (validatedUrl.protocol === 'https:' || validatedUrl.protocol === 'http:') {
                                    window.open(validatedUrl.href, "_blank", "noopener,noreferrer");
                                  }
                                } catch (error) {
                                  toast.error(t("common.invalid_url"));
                                }
                              }}
                              aria-label={`Open domain: ${domain.name}`}
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </span>
                        )}
                        {!quickEditMode && domain.labelId && (() => {
                          const label = labels.find(l => l.id === domain.labelId);
                          return label ? <LabelBadge label={label} /> : null;
                        })()}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-sm text-muted-foreground">
                  {quickEditMode && onUpdateDomain ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-full justify-between px-2 hover:bg-muted/50 font-normal text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="truncate">{domain.project}</span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0" align="start" onClick={(e) => e.stopPropagation()}>
                        <Command>
                          <CommandInput placeholder="Поиск проекта..." />
                          <CommandList>
                            <CommandEmpty>Проект не найден</CommandEmpty>
                            <CommandGroup>
                              {projects.map((project) => (
                                <CommandItem
                                  key={project}
                                  onSelect={() => {
                                    onUpdateDomain(domain.id, { project });
                                    toast.success("Проект обновлен", {
                                      description: `${domain.name} → ${project}`,
                                    });
                                  }}
                                >
                                  {project}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    domain.project
                  )}
                </TableCell>
                <TableCell className="py-3">
                  {quickEditMode && onUpdateDomain ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-full justify-between px-2 hover:bg-muted/50 font-normal text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="truncate">{DOMAIN_TYPES.find(t => t.value === domain.type)?.label || domain.type}</span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0" align="start" onClick={(e) => e.stopPropagation()}>
                        <Command>
                          <CommandInput placeholder="Поиск типа..." />
                          <CommandList>
                            <CommandEmpty>Тип не найден</CommandEmpty>
                            <CommandGroup>
                              {DOMAIN_TYPES.map((type) => (
                                <CommandItem
                                  key={type.value}
                                  onSelect={() => {
                                    onUpdateDomain(domain.id, { type: type.value });
                                    toast.success("Тип обновлен", {
                                      description: `${domain.name} → ${type.label}`,
                                    });
                                  }}
                                >
                                  {type.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <div className="flex justify-start">
                      <DomainTypeBadge type={domain.type} />
                    </div>
                  )}
                </TableCell>
                <TableCell className="py-3">
                  {quickEditMode && onUpdateDomain ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-full justify-between px-2 hover:bg-muted/50 font-normal text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="truncate">{DOMAIN_STATUSES.find(s => s.value === domain.status)?.label || domain.status}</span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0" align="start" onClick={(e) => e.stopPropagation()}>
                        <Command>
                          <CommandInput placeholder="Поиск статуса..." />
                          <CommandList>
                            <CommandEmpty>Статус не найден</CommandEmpty>
                            <CommandGroup>
                              {DOMAIN_STATUSES.map((status) => (
                                <CommandItem
                                  key={status.value}
                                  onSelect={() => {
                                    onUpdateDomain(domain.id, { status: status.value });
                                    toast.success("Статус обновлен", {
                                      description: `${domain.name} → ${status.label}`,
                                    });
                                  }}
                                >
                                  {status.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <DomainStatusBadge status={domain.status} />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
