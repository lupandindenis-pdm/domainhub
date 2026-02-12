import { useParams, useNavigate } from "react-router-dom";
import { mockDomains, mockHistory } from "@/data/mockDomains";
import { DomainTypeBadge } from "@/components/domains/DomainTypeBadge";
import { DomainStatusBadge } from "@/components/domains/DomainStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  ExternalLink, 
  Edit, 
  Copy, 
  Globe,
  Server,
  Shield,
  Calendar,
  User,
  Building,
  MapPin,
  Tag,
  Clock,
  AlertCircle,
  History as HistoryIcon
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";
import { computeDomainStatus } from "@/lib/computeDomainStatus";

export default function DomainDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const rawDomain = mockDomains.find((d) => d.id === id);
  const domain = rawDomain ? { ...rawDomain, status: computeDomainStatus(rawDomain.status, rawDomain.renewalDate) } : undefined;
  const history = mockHistory.filter((h) => h.domainId === id);

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} скопирован`);
  };

  const InfoRow = ({ 
    icon: Icon, 
    label, 
    value, 
    copyable = false 
  }: { 
    icon: React.ElementType; 
    label: string; 
    value: React.ReactNode; 
    copyable?: boolean;
  }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2">
          {typeof value === "string" ? (
            <p className="text-sm font-medium truncate">{value}</p>
          ) : (
            value
          )}
          {copyable && typeof value === "string" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0"
              onClick={() => copyToClipboard(value, label)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/domains")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono">{domain.name}</h1>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => window.open(`https://${domain.name}`, "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <DomainTypeBadge type={domain.type} />
              <DomainStatusBadge status={domain.status} />
              {daysLeft <= 30 && daysLeft > 0 && (
                <Badge variant="outline" className="domain-status-expiring gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {daysLeft} дней до окончания
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button onClick={() => navigate(`/domains/${id}/edit`)} className="gap-2">
          <Edit className="h-4 w-4" />
          Редактировать
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="technical">Технические данные</TabsTrigger>
          <TabsTrigger value="business">Бизнес-данные</TabsTrigger>
          <TabsTrigger value="history">История изменений</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Quick Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Основная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoRow 
                  icon={Calendar} 
                  label="Зарегистрирован" 
                  value={format(parseISO(domain.registrationDate), "dd MMMM yyyy", { locale: ru })} 
                />
                <InfoRow 
                  icon={Clock} 
                  label="Истекает" 
                  value={format(parseISO(domain.expirationDate), "dd MMMM yyyy", { locale: ru })} 
                />
                <InfoRow 
                  icon={Building} 
                  label="Регистратор" 
                  value={`${domain.registrar} (${domain.registrarAccount})`} 
                />
                <InfoRow 
                  icon={Tag} 
                  label="Стоимость продления" 
                  value={`${domain.renewalCost} ${domain.currency}`} 
                />
              </CardContent>
            </Card>

            {/* Technical Quick View */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  Технические параметры
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoRow 
                  icon={Server} 
                  label="IP-адрес" 
                  value={domain.ipAddress}
                  copyable 
                />
                <InfoRow 
                  icon={Shield} 
                  label="SSL статус" 
                  value={
                    <Badge variant="outline" className={
                      domain.sslStatus === "valid" ? "domain-status-active" :
                      domain.sslStatus === "expiring" ? "domain-status-expiring" :
                      "domain-status-expired"
                    }>
                      {domain.sslStatus === "valid" ? "Действителен" :
                       domain.sslStatus === "expiring" ? "Истекает" :
                       domain.sslStatus === "expired" ? "Истёк" : "Нет"}
                    </Badge>
                  } 
                />
                <InfoRow 
                  icon={Globe} 
                  label="CDN" 
                  value={domain.cdn || "Не используется"} 
                />
                <InfoRow 
                  icon={Server} 
                  label="NS-серверы" 
                  value={domain.nsServers.join(", ")} 
                />
              </CardContent>
            </Card>

            {/* Business Quick View */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  Бизнес-контекст
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoRow icon={Tag} label="Проект" value={domain.project} />
                <InfoRow icon={Building} label="Отдел" value={domain.department} />
                <InfoRow icon={User} label="Владелец" value={domain.owner} />
                <InfoRow 
                  icon={MapPin} 
                  label="Регионы" 
                  value={domain.geo.join(", ")} 
                />
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Описание</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{domain.description}</p>
              {domain.tags && domain.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {domain.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Техническая информация</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Сетевые параметры</h4>
                  <div className="space-y-1 rounded-lg bg-secondary p-3">
                    <InfoRow icon={Server} label="IP-адрес" value={domain.ipAddress} copyable />
                    <Separator className="my-2" />
                    <InfoRow icon={Globe} label="CDN" value={domain.cdn || "Не используется"} />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">NS-серверы</h4>
                  <div className="space-y-1 rounded-lg bg-secondary p-3">
                    {domain.nsServers.map((ns, i) => (
                      <div key={ns} className="flex items-center justify-between py-1">
                        <span className="text-xs text-muted-foreground">NS{i + 1}</span>
                        <span className="font-mono text-sm">{ns}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">SSL/TLS</h4>
                  <div className="rounded-lg bg-secondary p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Статус сертификата</span>
                      <Badge variant="outline" className={
                        domain.sslStatus === "valid" ? "domain-status-active" :
                        domain.sslStatus === "expiring" ? "domain-status-expiring" :
                        "domain-status-expired"
                      }>
                        {domain.sslStatus === "valid" ? "Действителен" :
                         domain.sslStatus === "expiring" ? "Истекает" :
                         domain.sslStatus === "expired" ? "Истёк" : "Отсутствует"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Обновление</h4>
                  <div className="rounded-lg bg-secondary p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Метод обновления</span>
                      <Badge variant="outline">
                        {domain.updateMethod === "api" ? "Автоматически (API)" : "Вручную"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Бизнес-информация</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <InfoRow icon={Tag} label="Проект" value={domain.project} />
                <InfoRow icon={Building} label="Отдел" value={domain.department} />
                <InfoRow icon={User} label="Владелец" value={domain.owner} />
                <InfoRow icon={MapPin} label="Регионы" value={domain.geo.join(", ")} />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Уровень доступа</p>
                  <Badge variant="outline">{domain.accessLevel}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Чистота</p>
                  <Badge variant="outline" className={
                    domain.purity === "white" ? "domain-status-active" :
                    domain.purity === "grey" ? "domain-status-expiring" :
                    "domain-status-expired"
                  }>
                    {domain.purity === "white" ? "Белый" :
                     domain.purity === "grey" ? "Серый" : "Чёрный"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Срок жизни</p>
                  <Badge variant="outline">
                    {domain.lifespan === "short" ? "Краткосрочный" :
                     domain.lifespan === "mid" ? "Среднесрочный" : "Долгосрочный"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HistoryIcon className="h-4 w-4" />
                История изменений
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((entry) => (
                    <div 
                      key={entry.id} 
                      className="flex items-start gap-4 rounded-lg border border-border p-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs">
                        {entry.changedBy.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{entry.changedBy}</p>
                          <span className="text-xs text-muted-foreground">
                            {format(parseISO(entry.changedAt), "dd.MM.yyyy HH:mm", { locale: ru })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Изменено поле <span className="font-medium text-foreground">{entry.field}</span>
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span className="rounded bg-destructive/20 px-2 py-0.5 text-destructive">
                            {entry.oldValue || "(пусто)"}
                          </span>
                          <span>→</span>
                          <span className="rounded bg-success/20 px-2 py-0.5 text-success">
                            {entry.newValue}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <HistoryIcon className="h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    История изменений пуста
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
