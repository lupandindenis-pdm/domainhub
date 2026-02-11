import { StatsCard } from "@/components/domains/StatsCard";
import { DomainTable } from "@/components/domains/DomainTable";
import { mockDomains, mockLabels } from "@/data/mockDomains";
import { Globe, AlertTriangle, Clock, CheckCircle, TrendingUp, ShieldAlert } from "lucide-react";
import { DOMAIN_TYPE_LABELS } from "@/constants/domainTypes";
import { DomainType } from "@/types/domain";
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
          needsUpdate: data.needsUpdate || 'Нет',
          renewalDate: data.renewalDate || '',
          hasTechIssues: data.hasTechIssues || 'Нет',
        } as any));

      return [...merged, ...newDomains];
    } catch (error) {
      console.error('Dashboard: Failed to merge domains:', error);
      return [...mockDomains];
    }
  }, [editedDomains, deletedDomainIds]);
  
  // Active filter for stat cards
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'expiring' | 'ssl' | null>(null);

  const handleFilterClick = (filter: 'all' | 'active' | 'expiring' | 'ssl') => {
    setActiveFilter(prev => prev === filter ? null : filter);
  };

  // Calculate stats from actual domain list
  const totalDomains = domains.length;
  const activeDomains = domains.filter(d => d.status === "actual");
  const expiringDomains = domains.filter(d => {
    if (!d.renewalDate) return false;
    try {
      const daysLeft = differenceInDays(parseISO(d.renewalDate), new Date());
      return daysLeft <= 30 && daysLeft > 0;
    } catch {
      return false;
    }
  });
  const sslIssues = domains.filter(d => d.sslStatus === "expired" || d.sslStatus === "none");

  // Get domains requiring attention:
  // 1. renewalDate < 30 days → "Истекает (<30 дней)"
  // 2. renewalDate expired → "Истёк"
  // 3. needsUpdate === "Да" → "Требует обновления" (yellow)
  const attentionDomains = useMemo(() => {
    const items: { domain: any; reason: 'expiring' | 'expired' | 'needs_update'; daysLeft?: number }[] = [];

    for (const d of domains) {
      // Check only renewalDate (NOT expirationDate — that's registration date, present on all domains)
      if (d.renewalDate) {
        try {
          const daysLeft = differenceInDays(parseISO(d.renewalDate), new Date());
          if (daysLeft <= 0) {
            items.push({ domain: d, reason: 'expired', daysLeft });
          } else if (daysLeft <= 30) {
            items.push({ domain: d, reason: 'expiring', daysLeft });
          }
        } catch {}
      }

      // Check needsUpdate or hasTechIssues
      if (d.needsUpdate === 'Да' || (d.needsUpdate && d.needsUpdate !== 'Нет') || d.hasTechIssues === 'Да') {
        // Avoid duplicates — only add if not already added by renewalDate
        if (!items.some(item => item.domain.id === d.id)) {
          items.push({ domain: d, reason: 'needs_update' });
        }
      }
    }

    // Sort: expired first, then expiring (by daysLeft asc), then needs_update
    items.sort((a, b) => {
      const order = { expired: 0, expiring: 1, needs_update: 2 };
      if (order[a.reason] !== order[b.reason]) return order[a.reason] - order[b.reason];
      if (a.daysLeft !== undefined && b.daysLeft !== undefined) return a.daysLeft - b.daysLeft;
      return 0;
    });

    return items;
  }, [domains]);

  // Filtered domains based on active stat card
  const tableDomains = useMemo(() => {
    let filtered = domains;
    if (activeFilter === 'all') {
      filtered = domains;
    } else if (activeFilter === 'active') {
      filtered = activeDomains;
    } else if (activeFilter === 'expiring') {
      filtered = expiringDomains;
    } else if (activeFilter === 'ssl') {
      filtered = sslIssues;
    }
    return [...filtered]
      .sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, activeFilter ? 50 : 5);
  }, [domains, activeFilter, activeDomains, expiringDomains, sslIssues]);

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
          onClick={() => handleFilterClick('all')}
          active={activeFilter === 'all'}
        />
        <StatsCard
          title="Активных"
          value={activeDomains.length}
          icon={CheckCircle}
          iconColor="text-success"
          onClick={() => handleFilterClick('active')}
          active={activeFilter === 'active'}
        />
        <StatsCard
          title="Истекают (<30 дней)"
          value={expiringDomains.length}
          change={expiringDomains.length > 0 ? "Требуют продления" : undefined}
          changeType="negative"
          icon={Clock}
          iconColor="text-warning"
          onClick={() => handleFilterClick('expiring')}
          active={activeFilter === 'expiring'}
        />
        <StatsCard
          title="Проблемы SSL"
          value={sslIssues.length}
          icon={ShieldAlert}
          iconColor="text-destructive"
          onClick={() => handleFilterClick('ssl')}
          active={activeFilter === 'ssl'}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Urgent Domains */}
        <Card className="lg:col-span-2 border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Требуют внимания</CardTitle>
            <Badge variant="outline" className="domain-status-expiring">
              {attentionDomains.length} доменов
            </Badge>
          </CardHeader>
          <CardContent>
            {attentionDomains.length > 0 ? (
              <div className="space-y-3">
                {attentionDomains.map(({ domain, reason, daysLeft }) => {
                  const isExpired = reason === 'expired';
                  const isExpiring = reason === 'expiring';
                  const isNeedsUpdate = reason === 'needs_update';
                  return (
                    <div 
                      key={`${domain.id}-${reason}`}
                      className="flex items-center justify-between rounded-lg bg-secondary/30 p-3 transition-colors hover:bg-secondary/50 cursor-pointer"
                      onClick={() => navigate(`/domains/${domain.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`h-4 w-4 ${isNeedsUpdate ? "text-yellow-500" : isExpired ? "text-destructive" : "text-warning"}`} />
                        <div>
                          <p className="font-mono text-sm font-medium">{domain.name}</p>
                          <p className="text-xs text-muted-foreground">{DOMAIN_TYPE_LABELS[domain.type as DomainType] || 'Не известно'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm ${isNeedsUpdate ? "text-yellow-500" : isExpired ? "text-destructive" : "text-warning"}`}>
                          {isExpired && "Истёк"}
                          {isExpiring && `Истекает (<30 дней)`}
                          {isNeedsUpdate && "Требует обновления"}
                        </p>
                        <p className="text-xs text-muted-foreground">{domain.department || '—'}</p>
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
        <Card className="border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">По типам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {([
                { type: "landing" as DomainType, color: "bg-chart-4" },
                { type: "seo" as DomainType, color: "bg-pink-500" },
                { type: "mirror" as DomainType, color: "bg-warning" },
                { type: "site" as DomainType, color: "bg-primary" },
                { type: "subdomain" as DomainType, color: "bg-cyan-500" },
                { type: "referral" as DomainType, color: "bg-violet-500" },
                { type: "redirect" as DomainType, color: "bg-orange-500" },
                { type: "technical" as DomainType, color: "bg-muted-foreground" },
                { type: "product" as DomainType, color: "bg-success" },
                { type: "b2b" as DomainType, color: "bg-blue-500" },
                { type: "unknown" as DomainType, color: "bg-gray-400" },
              ] as { type: DomainType; color: string }[]).map(({ type, color }) => {
                const label = DOMAIN_TYPE_LABELS[type];
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
          domains={tableDomains} 
          bulkSelectMode={false}
          selectedDomainIds={new Set()}
          onToggleDomain={() => {}}
          labels={labels}
        />
      </div>
    </div>
  );
}
