import { StatsCard } from "@/components/domains/StatsCard";
import { DomainTable } from "@/components/domains/DomainTable";
import { mockDomains } from "@/data/mockDomains";
import { Globe, AlertTriangle, Clock, CheckCircle, TrendingUp, ShieldAlert } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Calculate stats
  const totalDomains = mockDomains.length;
  const activeDomains = mockDomains.filter(d => d.status === "active").length;
  const expiringDomains = mockDomains.filter(d => {
    const daysLeft = differenceInDays(parseISO(d.expirationDate), new Date());
    return daysLeft <= 30 && daysLeft > 0;
  });
  const expiredDomains = mockDomains.filter(d => d.status === "expired");
  const sslIssues = mockDomains.filter(d => d.sslStatus === "expired" || d.sslStatus === "none");

  // Get domains requiring attention
  const urgentDomains = mockDomains
    .filter(d => {
      const daysLeft = differenceInDays(parseISO(d.expirationDate), new Date());
      return daysLeft <= 30;
    })
    .sort((a, b) => 
      differenceInDays(parseISO(a.expirationDate), new Date()) - 
      differenceInDays(parseISO(b.expirationDate), new Date())
    )
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Дашборд</h1>
        <p className="text-muted-foreground">Обзор всех доменов компании</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Всего доменов"
          value={totalDomains}
          change="+2 за месяц"
          changeType="positive"
          icon={Globe}
        />
        <StatsCard
          title="Активных"
          value={activeDomains}
          icon={CheckCircle}
          iconColor="text-success"
        />
        <StatsCard
          title="Истекают (<30 дней)"
          value={expiringDomains.length}
          change="Требуют продления"
          changeType="negative"
          icon={Clock}
          iconColor="text-warning"
        />
        <StatsCard
          title="Проблемы SSL"
          value={sslIssues.length}
          icon={ShieldAlert}
          iconColor="text-destructive"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Urgent Domains */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Требуют внимания</CardTitle>
            <Badge variant="outline" className="domain-status-expiring">
              {urgentDomains.length} доменов
            </Badge>
          </CardHeader>
          <CardContent>
            {urgentDomains.length > 0 ? (
              <div className="space-y-3">
                {urgentDomains.map((domain) => {
                  const daysLeft = differenceInDays(parseISO(domain.expirationDate), new Date());
                  return (
                    <div 
                      key={domain.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:bg-secondary/50 cursor-pointer"
                      onClick={() => navigate(`/domains/${domain.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`h-4 w-4 ${daysLeft <= 7 ? "text-destructive" : "text-warning"}`} />
                        <div>
                          <p className="font-mono text-sm font-medium">{domain.name}</p>
                          <p className="text-xs text-muted-foreground">{domain.project}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${daysLeft <= 7 ? "text-destructive" : "text-warning"}`}>
                          {daysLeft > 0 ? `${daysLeft} дней` : "Истёк"}
                        </p>
                        <p className="text-xs text-muted-foreground">{domain.registrar}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-12 w-12 text-success/30" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Все домены в порядке
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">По типам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: "company", label: "Сайты компании", color: "bg-primary" },
                { type: "product", label: "Продукты", color: "bg-success" },
                { type: "landing", label: "Лендинги", color: "bg-chart-4" },
                { type: "technical", label: "Технические", color: "bg-muted-foreground" },
                { type: "mirror", label: "Зеркала", color: "bg-warning" },
              ].map(({ type, label, color }) => {
                const count = mockDomains.filter(d => d.type === type).length;
                const percentage = Math.round((count / totalDomains) * 100);
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary">
                      <div 
                        className={`h-full rounded-full ${color}`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Domains */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Последние обновления</h2>
          <button 
            onClick={() => navigate("/domains")}
            className="text-sm text-primary hover:underline"
          >
            Все домены →
          </button>
        </div>
        <DomainTable domains={mockDomains.slice(0, 5)} />
      </div>
    </div>
  );
}
