import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockDomains } from "@/data/mockDomains";
import { DomainTypeBadge } from "@/components/domains/DomainTypeBadge";
import { DomainStatusBadge } from "@/components/domains/DomainStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { projects, departments } from "@/data/mockDomains";
import { 
  ArrowLeft, 
  ExternalLink, 
  Edit, 
  Copy, 
  Globe,
  Server,
  Shield,
  Calendar as CalendarIcon,
  User,
  Building,
  MapPin,
  Tag,
  Clock,
  AlertCircle,
  History as HistoryIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Megaphone,
  BarChart3,
  Users,
  Layers,
  Activity,
  Code2,
  Smartphone,
  Save,
  RotateCcw,
  FileText,
  ChevronDown,
  ChevronsUpDown,
  Check
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";
import DomainDetailV1 from "./DomainDetailV1";

export default function DomainDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [version, setVersion] = useState<'v1' | 'v2'>('v2');
  
  const domain = mockDomains.find((d) => d.id === id);

  if (!domain) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg font-medium">Домен не найден</p>
        <Button variant="link" onClick={() => navigate("/domains")}>
          Вернуться к списку
        </Button>
      </div>
    );
  }

  if (version === 'v1') {
    return (
      <div className="relative">
        <div className="absolute top-0 right-0 p-4 z-50">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setVersion('v2')}
            className="shadow-md border"
          >
            Переключить на V2 (New)
          </Button>
        </div>
        <DomainDetailV1 />
      </div>
    );
  }

  const daysLeft = differenceInDays(parseISO(domain.expirationDate), new Date());

  return (
    <div className="container py-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation & Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/domains")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-mono tracking-tight">{domain.name}</h1>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => window.open(`https://${domain.name}`, "_blank")}
              >
                <ExternalLink className="h-5 w-5" />
              </Button>
              <Badge variant="outline" className="ml-2 font-normal text-xs uppercase tracking-wider">
                v2.1
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <DomainTypeBadge type={domain.type} />
              <DomainStatusBadge status={domain.status} />
              
              {domain.sslStatus === 'valid' ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 gap-1">
                  <Shield className="h-3 w-3" /> SSL OK
                </Badge>
              ) : (
                 <Badge variant="destructive" className="gap-1">
                  <Shield className="h-3 w-3" /> SSL Issue
                </Badge>
              )}

              {domain.needsUpdate && (
                 <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 gap-1">
                  <AlertTriangle className="h-3 w-3" /> Требует обновления
                </Badge>
              )}

              {domain.hasGeoBlock && (
                <Badge variant="destructive" className="gap-1">
                  <Globe className="h-3 w-3" /> GEO Block
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setVersion('v1')}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Версия V1
          </Button>
          <Button onClick={() => navigate(`/domains/${id}/edit`)} className="gap-2">
            <Edit className="h-4 w-4" />
            Редактировать
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex h-auto flex-wrap gap-1 bg-transparent p-0 justify-start">
          <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent data-[state=active]:border-primary px-4 py-2 rounded-md shadow-sm bg-card">
            Общая информация
          </TabsTrigger>
          <TabsTrigger value="department" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white border border-transparent px-4 py-2 rounded-md shadow-sm bg-card">
            Отдел
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white border border-transparent px-4 py-2 rounded-md shadow-sm bg-card">
            Интеграции
          </TabsTrigger>
        </TabsList>

        {/* 1. GENERAL TAB (Merged Overview + General) */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader className="pb-4 border-b bg-muted/20">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Основная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="grid gap-8 md:grid-cols-2">
                {/* Column 1: Core Identifiers */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-muted-foreground">
                      Название домена
                    </label>
                    <Input value={domain.name} readOnly className="font-mono bg-muted/50" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-muted-foreground">
                      Проект
                    </label>
                    <Select defaultValue={domain.project}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите проект" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-muted-foreground">
                      Статус
                    </label>
                     <Select defaultValue={domain.status}>
                      <SelectTrigger>
                         <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                         <SelectItem value="actual">Actual</SelectItem>
                         <SelectItem value="spare">Spare</SelectItem>
                         <SelectItem value="not_actual">Not Actual</SelectItem>
                         <SelectItem value="not_configured">Not Configured</SelectItem>
                         <SelectItem value="unknown">Unknown</SelectItem>
                         <SelectItem value="expiring">Expiring</SelectItem>
                         <SelectItem value="expired">Expired</SelectItem>
                         <SelectItem value="blocked">Blocked</SelectItem>
                         <SelectItem value="test">Test</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-muted-foreground">
                      Отдел
                    </label>
                    <Select defaultValue={domain.department}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите отдел" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Column 2: Details & Dates */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-muted-foreground">
                      GEO (используется)
                    </label>
                    <MultiSelect 
                        options={['WW', 'US', 'EU', 'RU', 'CIS', 'ASIA', 'LATAM', 'CN', 'JP', 'BR'].map(g => ({ label: g, value: g }))} 
                        selected={domain.geo || []} 
                        onChange={() => {}} 
                        placeholder="Выберите GEO"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-muted-foreground">
                      GEO (блокировка)
                    </label>
                    <MultiSelect 
                        options={['WW', 'US', 'EU', 'RU', 'CIS', 'ASIA', 'LATAM', 'CN', 'JP', 'BR'].map(g => ({ label: g, value: g }))} 
                        selected={domain.blockedGeo || []} 
                        onChange={() => {}} 
                        placeholder="Нет блокировок"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-muted-foreground">
                      Дата занесения в админку
                    </label>
                    <Input 
                      value={domain.addedDate || format(parseISO(domain.createdAt), "dd.MM.yyyy")} 
                      readOnly 
                      className="bg-muted/50 text-muted-foreground" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-muted-foreground">
                      Дата следующего продления
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !domain.expirationDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {domain.expirationDate ? format(parseISO(domain.expirationDate), "PPP", { locale: ru }) : <span>Выберите дату</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={parseISO(domain.expirationDate)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              
              <Separator />

              {/* Comment Section */}
              <div className="space-y-2">
                 <Collapsible>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium leading-none text-muted-foreground">Комментарий</label>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs">
                                {domain.description ? "Свернуть / Развернуть" : "Добавить комментарий"}
                                <ChevronsUpDown className="h-3 w-3" />
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                         <Textarea 
                            className="min-h-[100px] resize-y"
                            placeholder="Например: Лендинг для партнера под GEO US, не использовать в других проектах" 
                            defaultValue={domain.description} 
                         />
                    </CollapsibleContent>
                    {!domain.description && (
                        <div className="text-sm text-muted-foreground italic px-1 py-2 border border-dashed rounded bg-muted/30 text-center">
                          Комментарий отсутствует
                        </div>
                    )}
                    {domain.description && (
                         <div className="text-sm text-foreground bg-muted/30 p-3 rounded-md border text-wrap">
                           {domain.description}
                         </div>
                    )}
                 </Collapsible>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. DEPARTMENT TAB (GROUPED) - Kept as is */}
        <TabsContent value="department" className="space-y-6">
          <Tabs defaultValue="marketing" className="space-y-4">
            <div className="flex justify-start">
              <TabsList className="bg-secondary/50">
                <TabsTrigger value="marketing" className="gap-2">
                  <Megaphone className="h-4 w-4" /> Маркетинг
                </TabsTrigger>
                <TabsTrigger value="it" className="gap-2">
                  <Server className="h-4 w-4" /> IT
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2">
                  <BarChart3 className="h-4 w-4" /> Аналитика
                </TabsTrigger>
                <TabsTrigger value="partnership" className="gap-2">
                  <Users className="h-4 w-4" /> Партнёрка
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="marketing" className="space-y-6 mt-2">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-blue-500" /> Категоризация</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InfoRow label="Категория" value={domain.category || "—"} />
                    <InfoRow label="Направление" value={domain.direction || "—"} />
                    <InfoRow label="Целевое действие" value={domain.targetAction || "—"} />
                    <InfoRow label="Бонус" value={domain.bonus || "Нет"} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-blue-500" /> Состояние контента</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                      <span className="font-medium">Требует обновления</span>
                      <Badge variant={domain.needsUpdate ? "destructive" : "secondary"}>
                        {domain.needsUpdate ? "ДА" : "НЕТ"}
                      </Badge>
                    </div>
                    {domain.jiraTask && (
                      <InfoRow label="Задача Jira" value={domain.jiraTask} isLink />
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="it" className="space-y-6 mt-2">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5 text-slate-500" /> Инфраструктура</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InfoRow label="Регистратор" value={domain.registrar} />
                    <InfoRow label="Хостинг файлов" value={domain.fileHosting || "—"} />
                    <InfoRow label="IP-адрес" value={domain.ipAddress} copyable />
                    <InfoRow label="CDN" value={domain.cdn || "Нет"} />
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">NS-записи</span>
                      <div className="bg-secondary p-2 rounded text-xs font-mono">
                        {domain.nsServers.map(ns => <div key={ns}>{ns}</div>)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Code2 className="h-5 w-5 text-slate-500" /> Качество и Мониторинг</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InfoRow label="Метод тестирования" value={domain.testMethod || "—"} />
                    <InfoRow label="SSL статус" value={domain.sslStatus} />
                    <InfoRow label="Последняя проверка" value={domain.lastCheck ? format(parseISO(domain.lastCheck), "dd.MM.yyyy HH:mm") : "—"} />
                    {domain.uptimeMonitor && <InfoRow label="Мониторинг" value={domain.uptimeMonitor} isLink />}
                    
                    {domain.techIssues && domain.techIssues.length > 0 && (
                       <div className="mt-4 p-3 border border-destructive/20 bg-destructive/5 rounded-lg">
                         <span className="text-sm font-semibold text-destructive mb-2 block">Технические проблемы:</span>
                         <ul className="list-disc list-inside text-sm text-destructive/80">
                           {domain.techIssues.map((issue, i) => <li key={i}>{issue}</li>)}
                         </ul>
                       </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6 mt-2">
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Google Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{domain.gaId || "Не подключен"}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">GTM Container</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{domain.gtmId || "Не подключен"}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Уники ({domain.uniqueUsersPeriod || "за период"})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{domain.uniqueUsers?.toLocaleString() || "—"}</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="partnership" className="space-y-6 mt-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-emerald-500" /> Партнёрская программа</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Наличие в ПП</span>
                        <Badge variant={domain.isInProgram ? "default" : "secondary"}>
                           {domain.isInProgram ? "Участвует" : "Не участвует"}
                        </Badge>
                      </div>
                      {domain.isInProgram && (
                        <>
                           <InfoRow label="Статус" value={domain.programStatus || "—"} />
                           <InfoRow label="Имя компании" value={domain.companyName || "—"} />
                        </>
                      )}
                    </div>
                    <div>
                       {domain.programLink && (
                         <div className="p-4 bg-secondary rounded-lg flex flex-col gap-2">
                           <span className="text-sm font-medium">Ссылка на размещение</span>
                           <a href={domain.programLink} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all text-sm">
                             {domain.programLink}
                           </a>
                         </div>
                       )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* 3. INTEGRATIONS TAB */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-orange-500" /> Интеграции</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="OneSignal App ID" value={domain.oneSignalId || "Не настроен"} copyable={!!domain.oneSignalId} />
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-3">Другие сервисы</h4>
                <div className="flex flex-wrap gap-2">
                  {domain.otherIntegrations?.map(int => (
                    <Badge key={int} variant="secondary" className="px-3 py-1">{int}</Badge>
                  )) || <span className="text-sm text-muted-foreground">Нет интеграций</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_1.5fr] items-center py-4 px-6 gap-4 hover:bg-muted/30 transition-colors">
      <div className="text-sm text-muted-foreground font-medium">{label}</div>
      <div className="text-sm font-medium text-foreground flex justify-end md:justify-start">{value}</div>
    </div>
  );
}

function InfoRow({ 
  icon: Icon, 
  label, 
  value, 
  copyable = false,
  isLink = false
}: { 
  icon?: any, 
  label: string, 
  value: React.ReactNode, 
  copyable?: boolean,
  isLink?: boolean 
}) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Скопировано");
  };

  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2 font-medium text-sm text-right">
        {isLink && typeof value === 'string' ? (
           <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
             {value} <ExternalLink className="h-3 w-3" />
           </a>
        ) : (
           <span>{value}</span>
        )}
        {copyable && typeof value === "string" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => copyToClipboard(value)}
          >
            <Copy className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

function MultiSelect({ 
  options, 
  selected, 
  onChange, 
  placeholder = "Выберите...",
  emptyText = "Не найдено."
}: { 
  options: { value: string; label: string }[]; 
  selected: string[]; 
  onChange: (selected: string[]) => void;
  placeholder?: string;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    // In a real app, you would call onChange here.
    // For this mock display, we don't have a setter for the domain object.
    console.log("Selected:", value);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10 py-2"
        >
          <div className="flex flex-wrap gap-1 justify-start">
            {selected.length > 0 ? (
              selected.map((val) => (
                <Badge key={val} variant="secondary" className="mr-1 mb-1">
                  {options.find((opt) => opt.value === val)?.label || val}
                  {/* Read-only view mainly, but keeping structure */}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Поиск..." />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
