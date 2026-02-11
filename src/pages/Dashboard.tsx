import { StatsCard } from "@/components/domains/StatsCard";
import { DomainTable } from "@/components/domains/DomainTable";
import { mockDomains, mockLabels } from "@/data/mockDomains";
import { Globe, AlertTriangle, Clock, CheckCircle, TrendingUp, ShieldAlert } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Load labels from localStorage
  const [labels, setLabels] = useState(() => {
    try {
      const saved = localStorage.getItem('domainLabels');
      return saved ? JSON.parse(saved) : mockLabels;
    } catch {
      return mockLabels;
    }
  });

  // Load edited domains from localStorage
  const [editedDomains, setEditedDomains] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem('editedDomains');
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      const validated: Record<string, any> = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          validated[key] = value;
        }
      }
      return validated;
    } catch {
      return {};
    }
  });

  // Load deleted domain IDs from localStorage
  const [deletedDomainIds, setDeletedDomainIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('deletedDomainIds');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Listen for localStorage changes to sync all data in real time
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedLabels = localStorage.getItem('domainLabels');
        if (savedLabels) {
          setLabels(JSON.parse(savedLabels));
        }

        const savedEditedDomains = localStorage.getItem('editedDomains');
        if (savedEditedDomains) {
          const parsed = JSON.parse(savedEditedDomains);
          const validated: Record<string, any> = {};
          for (const [key, value] of Object.entries(parsed)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
              validated[key] = value;
            }
          }
          setEditedDomains(validated);
        } else {
          setEditedDomains({});
        }

        const savedDeletedIds = localStorage.getItem('deletedDomainIds');
        if (savedDeletedIds) {
          setDeletedDomainIds(new Set(JSON.parse(savedDeletedIds)));
        } else {
          setDeletedDomainIds(new Set());
        }
      } catch (error) {
        console.error('Failed to load data from localStorage:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Merge mockDomains with edited/created/deleted domains from localStorage
  const domains = useMemo(() => {
    try {
      // 1. Start with mockDomains, merge edits, exclude deleted
      const merged = mockDomains
        .filter(domain => !deletedDomainIds.has(domain.id))
        .map(domain => {
          const editedData = editedDomains[domain.id];
          if (editedData && typeof editedData === 'object') {
            return {
              ...domain,
              ...editedData,
              id: domain.id,
              registrationDate: domain.registrationDate,
              expirationDate: editedData.expirationDate || domain.expirationDate,
              createdAt: domain.createdAt,
              updatedAt: editedData.updatedAt || domain.updatedAt,
            };
          }
          return domain;
        });

      // 2. Add newly created domains (id starts with 'new-')
      const newDomains = Object.entries(editedDomains)
        .filter(([id, data]) => id.startsWith('new-') && !deletedDomainIds.has(id) && data && typeof data === 'object')
        .map(([id, data]: [string, any]) => ({
          id,
          name: data.name || '',
          registrationDate: data.createdAt || new Date().toISOString().split('T')[0],
          expirationDate: data.expirationDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          registrar: data.registrar || '',
          registrarAccount: data.registrarAccount || '',
          renewalCost: data.renewalCost || 0,
          currency: data.currency || 'USD',
          nsServers: data.nsServers || [],
          ipAddress: data.ipAddress || '',
          sslStatus: data.sslStatus || 'none' as const,
          updateMethod: data.updateMethod || 'manual' as const,
          project: data.project || 'Не известно',
          department: data.department || 'Other',
          owner: data.owner || 'Неизвестен',
          type: data.type || 'unknown',
          geo: data.geo || [],
          status: data.status || 'unknown',
          accessLevel: data.accessLevel || 'public',
          description: data.description || '',
          purity: data.purity || 'white' as const,
          lifespan: data.lifespan || 'short' as const,
          tags: data.tags || [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          category: data.category,
          bonus: data.bonus,
          direction: data.direction,
          targetAction: data.targetAction,
          labelId: data.labelId,
          blockedGeo: data.blockedGeo || [],
        } as any));

      return [...merged, ...newDomains];
    } catch (error) {
      console.error('Dashboard: Failed to merge domains:', error);
      return [...mockDomains];
    }
  }, [editedDomains, deletedDomainIds]);
  
  // Calculate stats from actual domain list
  const totalDomains = domains.length;
  const activeDomains = domains.filter(d => d.status === "actual").length;
  const expiringDomains = domains.filter(d => {
    if (!d.expirationDate) return false;
    try {
      const daysLeft = differenceInDays(parseISO(d.expirationDate), new Date());
      return daysLeft <= 30 && daysLeft > 0;
    } catch {
      return false;
    }
  });
  const sslIssues = domains.filter(d => d.sslStatus === "expired" || d.sslStatus === "none");

  // Get domains requiring attention
  const urgentDomains = domains
    .filter(d => {
      if (!d.expirationDate) return false;
      try {
        const daysLeft = differenceInDays(parseISO(d.expirationDate), new Date());
        return daysLeft <= 30;
      } catch {
        return false;
      }
    })
    .sort((a, b) => 
      differenceInDays(parseISO(a.expirationDate), new Date()) - 
      differenceInDays(parseISO(b.expirationDate), new Date())
    )
    .slice(0, 5);

  // Recent domains — sorted by updatedAt descending
  const recentDomains = useMemo(() => {
    return [...domains]
      .sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [domains]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Обзор всех доменов компании</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Всего доменов"
          value={totalDomains}
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
          change={expiringDomains.length > 0 ? "Требуют продления" : undefined}
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
                          <p className="text-xs text-muted-foreground">{domain.project || 'Не известно'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${daysLeft <= 7 ? "text-destructive" : "text-warning"}`}>
                          {daysLeft > 0 ? `${daysLeft} дней` : "Истёк"}
                        </p>
                        <p className="text-xs text-muted-foreground">{domain.registrar || '—'}</p>
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
                { type: "site", label: "Сайты", color: "bg-primary" },
                { type: "product", label: "Продукты", color: "bg-success" },
                { type: "landing", label: "Лендинги", color: "bg-chart-4" },
                { type: "technical", label: "Технические", color: "bg-muted-foreground" },
                { type: "mirror", label: "Зеркала", color: "bg-warning" },
                { type: "seo", label: "SEO", color: "bg-pink-500" },
                { type: "unknown", label: "Не известно", color: "bg-gray-400" },
              ].map(({ type, label, color }) => {
                const count = domains.filter(d => d.type === type).length;
                const percentage = totalDomains > 0 ? Math.round((count / totalDomains) * 100) : 0;
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
        <DomainTable 
          domains={recentDomains} 
          bulkSelectMode={false}
          selectedDomainIds={new Set()}
          onToggleDomain={() => {}}
          labels={labels}
        />
      </div>
    </div>
  );
}
