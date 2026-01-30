import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockDomains, mockLabels } from "@/data/mockDomains";
import { DomainTypeBadge } from "@/components/domains/DomainTypeBadge";
import { DomainStatusBadge } from "@/components/domains/DomainStatusBadge";
import { LabelBadge } from "@/components/domains/LabelBadge";
import { LabelSelector } from "@/components/domains/LabelSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  AlertCircle, 
  AlertTriangle, 
  Megaphone, 
  BarChart3, 
  Users, 
  User,
  Layers, 
  Code2, 
  RotateCcw, 
  FileText, 
  ChevronsUpDown,
  CheckCircle,
  Ban,
  Activity,
  Tag
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";
import { useLanguage } from "@/components/language-provider";
import DomainDetailV1 from "./DomainDetailV1";

export default function DomainDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const domain = mockDomains.find((d) => d.id === id);
  
  const [version, setVersion] = useState<'v1' | 'v2'>('v2');
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  
  // Load labels from localStorage or use defaults
  const [labels, setLabels] = useState(() => {
    try {
      const saved = localStorage.getItem('domainLabels');
      return saved ? JSON.parse(saved) : mockLabels;
    } catch {
      return mockLabels;
    }
  });
  
  // Load domain label assignment from localStorage
  const [domainLabelId, setDomainLabelId] = useState(() => {
    try {
      const saved = localStorage.getItem('domainLabelAssignments');
      if (saved && id) {
        const assignments = JSON.parse(saved);
        return assignments[id] || domain?.labelId;
      }
    } catch {
      return domain?.labelId;
    }
    return domain?.labelId;
  });

  // Save labels to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('domainLabels', JSON.stringify(labels));
    } catch (error) {
      console.error('Failed to save labels to localStorage:', error);
    }
  }, [labels]);

  // Save domain label assignment to localStorage whenever it changes
  useEffect(() => {
    if (!id) return;
    
    try {
      const saved = localStorage.getItem('domainLabelAssignments');
      const assignments = saved ? JSON.parse(saved) : {};
      
      if (domainLabelId) {
        assignments[id] = domainLabelId;
      } else {
        delete assignments[id];
      }
      
      localStorage.setItem('domainLabelAssignments', JSON.stringify(assignments));
    } catch (error) {
      console.error('Failed to save domain label assignment to localStorage:', error);
    }
  }, [id, domainLabelId]);

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

  const daysLeft = differenceInDays(parseISO(domain.expirationDate), new Date());

  const statusColors: Record<string, string> = {
    actual: "bg-green-500/20 text-green-700 dark:text-green-300",
    spare: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
    not_actual: "bg-slate-500/20 text-slate-700 dark:text-slate-300",
    not_configured: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
    unknown: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
    expiring: "bg-red-500/20 text-red-700 dark:text-red-300",
    expired: "bg-red-500/20 text-red-700 dark:text-red-300",
    blocked: "bg-red-500/20 text-red-700 dark:text-red-300",
    test: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
  };
  
  const typeColors: Record<string, string> = {
    site: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
    product: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    landing: "bg-violet-500/20 text-violet-700 dark:text-violet-300",
    mirror: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
    seo: "bg-pink-500/20 text-pink-700 dark:text-pink-300",
    referral: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
    redirect: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",
    technical: "bg-slate-500/20 text-slate-700 dark:text-slate-300",
    subdomain: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",
  };

  const statusColorClass = statusColors[domain.status] || "bg-muted/50";
  const typeColorClass = typeColors[domain.type] || "bg-muted/50";

  return (
    <div className="container py-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation & Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/domains")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 
            className="text-3xl font-bold font-mono tracking-tight cursor-pointer hover:text-yellow-400/80 transition-colors"
            onClick={() => {
              try {
                navigator.clipboard.writeText(domain.name);
                toast.success("Домен скопирован в буфер обмена");
              } catch (error) {
                toast.error("Ошибка копирования");
              }
            }}
          >
            {domain.name}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => window.open(`https://${domain.name}`, "_blank")}
          >
            <ExternalLink className="h-5 w-5" />
          </Button>
          {domain.needsUpdate && (
             <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-0 gap-1 h-6">
              <AlertTriangle className="h-3 w-3" /> Требует обновления
            </Badge>
          )}
          {domain.hasGeoBlock && (
            <Badge variant="destructive" className="gap-1 h-6">
              <Globe className="h-3 w-3" /> GEO Block
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <LabelSelector
            currentLabelId={domainLabelId}
            labels={labels}
            onLabelChange={(labelId) => {
              setDomainLabelId(labelId);
            }}
            onCreateLabel={(name, color) => {
              const newLabel = {
                id: `label-${Date.now()}`,
                name,
                color,
                projectId: domain.project,
              };
              setLabels([...labels, newLabel]);
              setDomainLabelId(newLabel.id);
            }}
            onDeleteLabel={(labelId) => {
              setLabels(labels.filter(l => l.id !== labelId));
              if (domainLabelId === labelId) {
                setDomainLabelId(undefined);
              }
            }}
          />
          <Button onClick={() => navigate(`/domains/${id}/edit`)} className="gap-2">
            <Edit className="h-4 w-4" />
            Редактировать
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="general" className="space-y-6 mt-12">
        <TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0 justify-start pl-6 mt-4">
          <TabsTrigger value="general" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/50 border border-border px-4 py-2 rounded-md transition-colors bg-card hover:bg-accent">
            Общая информация
          </TabsTrigger>
          <TabsTrigger value="department" className="data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-600 data-[state=active]:border-purple-500/50 border border-border px-4 py-2 rounded-md transition-colors bg-card hover:bg-accent">
            Отдел
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-600 data-[state=active]:border-orange-500/50 border border-border px-4 py-2 rounded-md transition-colors bg-card hover:bg-accent">
            Интеграции
          </TabsTrigger>
        </TabsList>

        {/* 1. GENERAL TAB (Merged Overview + General) */}
        <TabsContent value="general" className="space-y-4">
          <div className="w-full">
            <div className="p-6 space-y-8">
              {/* Two columns for remaining fields */}
              <div className="grid gap-8 md:grid-cols-2">
                {/* Column 1: Тип, GEO исп, Проект */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Тип
                    </label>
                    <div className={cn("flex items-center h-10 px-3 rounded-md border-none text-sm", typeColorClass)}>
                      {t(`badges.${domain.type}`)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      GEO (используется)
                    </label>
                    <ReadOnlyGeoView selected={domain.geo || []} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Проект
                    </label>
                    <Input value={domain.project} readOnly className="bg-muted/50 text-base border-none focus-visible:ring-0" />
                  </div>
                </div>

                {/* Column 2: Статус, GEO блок, Отдел */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Статус
                    </label>
                     <div className={cn("flex items-center h-10 px-3 rounded-md border-none", statusColorClass)}>
                        <span className="text-sm">
                           {t(`status.${domain.status}`)}
                        </span>
                     </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">
                      <Ban className="h-4 w-4" />
                      GEO (блокировка)
                    </label>
                    <ReadOnlyGeoView 
                        selected={domain.blockedGeo || []} 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Отдел
                    </label>
                    <Input value={domain.department} readOnly className="bg-muted/50 text-base border-none focus-visible:ring-0" />
                  </div>
                </div>
              </div>
              
              <Separator />

              {/* Comment Section */}
              <div className="space-y-2">
                 <div className="flex items-center justify-between mb-2">
                     <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">
                         <FileText className="h-4 w-4" />
                         Комментарий
                     </label>
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       className="h-8 gap-2 text-xs"
                       onClick={() => setIsCommentOpen(!isCommentOpen)}
                     >
                         {isCommentOpen ? 'Свернуть' : 'Развернуть'}
                         <ChevronsUpDown className={cn("h-3 w-3 transition-transform", isCommentOpen && "rotate-180")} />
                     </Button>
                 </div>
                 
                 {/* Single container with conditional content */}
                 <div className={cn(
                   "w-full rounded-md border-none bg-muted/30 px-3 py-2 text-sm shadow-sm transition-all duration-200 flex items-center",
                   isCommentOpen ? "min-h-[100px] whitespace-pre-wrap items-start" : "min-h-10"
                 )}>
                   {domain.description ? (
                     <span className="text-muted-foreground">
                       {isCommentOpen 
                         ? domain.description 
                         : (domain.description.length > 100 
                             ? `${domain.description.substring(0, 100)}...` 
                             : domain.description
                           )
                       }
                     </span>
                   ) : (
                     <span className="text-muted-foreground italic">Комментарий отсутствует</span>
                   )}
                 </div>
              </div>

            </div>
          </div>

          {/* Author and Date - moved to bottom as less important info */}
          <div className="flex flex-wrap justify-between gap-6 text-sm text-muted-foreground px-6">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Автор: </span>
                <span>{domain.owner || "Неизвестен"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Дата добавления: </span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              <span>Последнее изменение: </span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </TabsContent>

        {/* 2. DEPARTMENT TAB (GROUPED) - Kept as is */}
        <TabsContent value="department" className="space-y-6">
          <Tabs defaultValue="marketing" className="space-y-4">
            <div className="flex justify-start pl-6">
              <TabsList className="bg-transparent p-0 gap-2 flex-wrap">
                <TabsTrigger value="marketing" className="gap-2 data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-600 data-[state=active]:border-blue-500/50 border border-border px-4 py-2 rounded-md transition-colors bg-card hover:bg-accent">
                  <Megaphone className="h-4 w-4" /> Маркетинг
                </TabsTrigger>
                <TabsTrigger value="it" className="gap-2 data-[state=active]:bg-slate-500/10 data-[state=active]:text-slate-600 data-[state=active]:border-slate-500/50 border border-border px-4 py-2 rounded-md transition-colors bg-card hover:bg-accent">
                  <Server className="h-4 w-4" /> IT
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-green-500/10 data-[state=active]:text-green-600 data-[state=active]:border-green-500/50 border border-border px-4 py-2 rounded-md transition-colors bg-card hover:bg-accent">
                  <BarChart3 className="h-4 w-4" /> Аналитика
                </TabsTrigger>
                <TabsTrigger value="partnership" className="gap-2 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-600 data-[state=active]:border-amber-500/50 border border-border px-4 py-2 rounded-md transition-colors bg-card hover:bg-accent">
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
                    <InfoRow label="Дата продления" value={domain.expirationDate ? format(parseISO(domain.expirationDate), "dd.MM.yyyy") : "—"} />
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

function ReadOnlyGeoView({ 
  selected,
  limit = 3 
}: { 
  selected: string[];
  limit?: number;
}) {
  const visible = selected.slice(0, limit);
  const hidden = selected.slice(limit);
  const hasHidden = hidden.length > 0;

  // Цветовая схема для континентов/регионов
  const getRegionColor = (country: string) => {
    // Приводим к 2-символьным кодам
    const code = country.substring(0, 2).toUpperCase();
    const europe = ['RU', 'DE', 'FR', 'IT', 'ES', 'GB', 'PL', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI'];
    const asia = ['CN', 'JP', 'KR', 'IN', 'SG', 'TH', 'MY', 'ID', 'PH', 'VN'];
    const americas = ['US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE'];
    
    if (europe.includes(code)) return 'bg-blue-500/30 text-white';
    if (asia.includes(code)) return 'bg-emerald-500/30 text-white';
    if (americas.includes(code)) return 'bg-purple-500/30 text-white';
    return 'bg-orange-500/30 text-white';
  };

  // Форматируем код страны до 2 символов
  const formatCountryCode = (country: string) => {
    return country.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-2">
      {/* Выбранные страны с цветами */}
      <div className="flex flex-wrap items-center gap-1 min-h-10 py-2 px-3 rounded-md border-none bg-muted/30">
        {selected.length > 0 ? (
          <>
            {visible.map((val) => (
              <div 
                key={val}
                className={`${getRegionColor(val)} font-mono text-xs px-2 py-1 min-w-[2rem] text-center rounded-md`}
              >
                {formatCountryCode(val)}
              </div>
            ))}
            {hasHidden && (
              <Popover>
                <PopoverTrigger asChild>
                  <div className="border border-border/50 font-mono text-xs px-2 py-1 rounded-md cursor-pointer">
                    +{hidden.length}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <div className="flex flex-wrap gap-1">
                    {hidden.map((val) => (
                      <div 
                        key={val} 
                        className={`${getRegionColor(val)} font-mono text-xs px-2 py-1 min-w-[2rem] text-center rounded-md`}
                      >
                        {formatCountryCode(val)}
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </>
        ) : (
          <span className="text-muted-foreground/60 text-sm italic">Не выбрано</span>
        )}
      </div>
    </div>
  );
}
