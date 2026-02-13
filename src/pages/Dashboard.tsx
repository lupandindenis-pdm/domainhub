import { StatsCard } from "@/components/domains/StatsCard";
import { DomainTable } from "@/components/domains/DomainTable";
import { mockDomains, mockLabels } from "@/data/mockDomains";
import { Globe, AlertTriangle, Clock, CheckCircle, TrendingUp, ShieldAlert, AlertCircle } from "lucide-react";
import { DOMAIN_TYPE_LABELS, DOMAIN_STATUS_LABELS } from "@/constants/domainTypes";
import { DomainType, DomainStatus } from "@/types/domain";
import { differenceInDays, parseISO } from "date-fns";
import { computeDomainStatus } from "@/lib/computeDomainStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

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

      const all = [...merged, ...newDomains];

      // Auto-compute status based on renewalDate
      return all.map(d => ({
        ...d,
        status: computeDomainStatus(d.status, d.renewalDate),
      }));
    } catch (error) {
      console.error('Dashboard: Failed to merge domains:', error);
      return [...mockDomains];
    }
  }, [editedDomains, deletedDomainIds]);
  
  // Active filter for stat cards
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'expiring' | 'inactive' | null>(null);

  const handleFilterClick = (filter: 'all' | 'active' | 'expiring' | 'inactive') => {
    setActiveFilter(prev => prev === filter ? null : filter);
  };

  // Calculate stats from actual domain list
  const totalDomains = domains.length;
  const activeDomains = useMemo(() => domains.filter(d => d.status === "actual"), [domains]);
  const expiringDomains = useMemo(() => domains.filter(d => {
    if (!d.renewalDate) return false;
    try {
      const daysLeft = differenceInDays(parseISO(d.renewalDate), new Date());
      return daysLeft <= 30 && daysLeft > 0;
    } catch {
      return false;
    }
  }), [domains]);
  const inactiveDomains = useMemo(() => domains.filter(d => {
    // Status: not_actual, unknown
    if (d.status === "not_actual" || d.status === "unknown") return true;
    // Expired renewalDate
    if (d.renewalDate) {
      try {
        const daysLeft = differenceInDays(parseISO(d.renewalDate), new Date());
        if (daysLeft <= 0) return true;
      } catch {}
    }
    return false;
  }), [domains]);

  // Get domains requiring attention:
  // 1. renewalDate < 30 days → "Истекает (<30 дней)"
  // 2. renewalDate expired → "Истёк"
  // 3. needsUpdate === "Да" → "Требует обновления" (yellow)
  const attentionDomains = useMemo(() => {
    const items: { domain: any; reason: 'expiring' | 'expired' | 'needs_update' | 'inactive'; daysLeft?: number }[] = [];

    for (const d of domains) {
      // Check only renewalDate (NOT expirationDate — that's registration date, present on all domains)
      if (d.renewalDate) {
        try {
          const daysLeft = differenceInDays(parseISO(d.renewalDate), new Date());
          if (daysLeft <= 0) {
            items.push({ domain: d, reason: 'expired', daysLeft });
            continue;
          } else if (daysLeft <= 30) {
            items.push({ domain: d, reason: 'expiring', daysLeft });
            continue;
          }
        } catch {}
      }

      // Check status: not_actual / unknown
      if (d.status === 'not_actual' || d.status === 'unknown') {
        items.push({ domain: d, reason: 'inactive' });
        continue;
      }

      // Check needsUpdate or hasTechIssues
      if (d.needsUpdate === 'Да' || (d.needsUpdate && d.needsUpdate !== 'Нет') || d.hasTechIssues === 'Да') {
        items.push({ domain: d, reason: 'needs_update' });
      }
    }

    // Sort: expired first, then inactive, then expiring (by daysLeft asc), then needs_update
    items.sort((a, b) => {
      const order = { expired: 0, inactive: 1, expiring: 2, needs_update: 3 };
      if (order[a.reason] !== order[b.reason]) return order[a.reason] - order[b.reason];
      if (a.daysLeft !== undefined && b.daysLeft !== undefined) return a.daysLeft - b.daysLeft;
      return 0;
    });

    return items;
  }, [domains]);

  // Filtered attention domains based on active stat card
  const filteredAttentionDomains = useMemo(() => {
    if (!activeFilter) return attentionDomains;
    if (activeFilter === 'all') {
      return attentionDomains;
    } else if (activeFilter === 'active') {
      return attentionDomains.filter(item => activeDomains.some(d => d.id === item.domain.id));
    } else if (activeFilter === 'expiring') {
      return attentionDomains.filter(item => item.reason === 'expiring');
    } else if (activeFilter === 'inactive') {
      return attentionDomains.filter(item => inactiveDomains.some(d => d.id === item.domain.id));
    }
    return attentionDomains;
  }, [activeFilter, attentionDomains, activeDomains, expiringDomains, inactiveDomains]);

  // Recent domains — sorted by updatedAt descending (always independent of filter)
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
      <div className="relative">
        <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground/60 mt-1">Обзор всех доменов компании</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Всего доменов"
          value={totalDomains}
          icon={Globe}
          bgColor="hsl(210 60% 18%)"
          glowColor="hsla(210, 100%, 50%, 0.15)"
          onClick={() => handleFilterClick('all')}
          active={activeFilter === 'all'}
        />
        <StatsCard
          title="Актуальные"
          value={activeDomains.length}
          icon={CheckCircle}
          iconColor="text-success"
          bgColor="hsl(142 50% 16%)"
          glowColor="hsla(142, 76%, 36%, 0.15)"
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
          bgColor="hsl(38 55% 16%)"
          glowColor="hsla(38, 92%, 50%, 0.15)"
          onClick={() => handleFilterClick('expiring')}
          active={activeFilter === 'expiring'}
        />
        <StatsCard
          title="Не актуален / Истёк"
          value={inactiveDomains.length}
          icon={AlertCircle}
          iconColor="text-destructive"
          bgColor="hsl(0 50% 17%)"
          glowColor="hsla(0, 85%, 60%, 0.15)"
          onClick={() => handleFilterClick('inactive')}
          active={activeFilter === 'inactive'}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Urgent Domains */}
        <Card className="lg:col-span-2 border border-white/[0.06] rounded-2xl bg-gradient-to-br from-card/80 to-card/40 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
                <AlertTriangle className="h-4 w-4 text-warning" />
              </div>
              <CardTitle className="text-base font-semibold tracking-tight">
                {activeFilter === 'active' ? 'Активные домены' : activeFilter === 'all' ? 'Все домены' : 'Требуют внимания'}
              </CardTitle>
            </div>
            <Badge variant="outline" className="rounded-lg border-white/[0.08] bg-white/[0.04] text-xs font-medium px-2.5 py-1">
              {activeFilter === 'active' ? activeDomains.length : activeFilter === 'all' ? domains.length : filteredAttentionDomains.length} доменов
            </Badge>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {activeFilter === 'active' || activeFilter === 'all' ? (
              <div className="space-y-3">
                {(activeFilter === 'active' ? activeDomains : domains).map((domain) => {
                  const statusLabel = DOMAIN_STATUS_LABELS[domain.status as DomainStatus] || domain.status;
                  const statusColor = domain.status === 'actual' ? 'text-success'
                    : domain.status === 'expired' || domain.status === 'not_actual' ? 'text-destructive'
                    : domain.status === 'expiring' ? 'text-warning'
                    : 'text-muted-foreground';
                  const StatusIcon = domain.status === 'actual' ? CheckCircle
                    : domain.status === 'expired' || domain.status === 'not_actual' ? AlertCircle
                    : domain.status === 'expiring' ? Clock
                    : Globe;
                  return (
                    <div 
                      key={domain.id}
                      className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/[0.04] p-3.5 transition-all hover:bg-white/[0.05] hover:border-white/[0.08] cursor-pointer group/row"
                      onClick={() => navigate(`/domains/${domain.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] shrink-0">
                          <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                        </div>
                        <div>
                          <p className="font-mono text-sm font-medium group-hover/row:text-primary transition-colors">{domain.name}</p>
                          <p className="text-xs text-muted-foreground/60">{DOMAIN_TYPE_LABELS[domain.type as DomainType] || 'Не известно'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${statusColor}`}>{statusLabel}</p>
                        <p className="text-xs text-muted-foreground/50">{domain.department || '—'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : filteredAttentionDomains.length > 0 ? (
              <div className="space-y-3">
                {filteredAttentionDomains.map(({ domain, reason, daysLeft }) => {
                  const isExpired = reason === 'expired';
                  const isExpiring = reason === 'expiring';
                  const isNeedsUpdate = reason === 'needs_update';
                  const isInactive = reason === 'inactive';
                  return (
                    <div 
                      key={`${domain.id}-${reason}`}
                      className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/[0.04] p-3.5 transition-all hover:bg-white/[0.05] hover:border-white/[0.08] cursor-pointer group/row"
                      onClick={() => navigate(`/domains/${domain.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                          isExpired ? "bg-destructive/10" : isNeedsUpdate ? "bg-yellow-500/10" : isInactive ? "bg-muted/30" : "bg-warning/10"
                        )}>
                          <AlertTriangle className={`h-4 w-4 ${isInactive ? "text-muted-foreground" : isNeedsUpdate ? "text-yellow-500" : isExpired ? "text-destructive" : "text-warning"}`} />
                        </div>
                        <div>
                          <p className="font-mono text-sm font-medium group-hover/row:text-primary transition-colors">{domain.name}</p>
                          <p className="text-xs text-muted-foreground/60">{DOMAIN_TYPE_LABELS[domain.type as DomainType] || 'Не известно'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${isInactive ? "text-muted-foreground" : isNeedsUpdate ? "text-yellow-500" : isExpired ? "text-destructive" : "text-warning"}`}>
                          {isExpired && "Истёк"}
                          {isExpiring && `Истекает (<30 дней)`}
                          {isNeedsUpdate && "Требует обновления"}
                          {isInactive && (domain.status === 'not_actual' ? "Не актуален" : "Не известно")}
                        </p>
                        <p className="text-xs text-muted-foreground/50">{domain.department || '—'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 rounded-full bg-success/10 blur-2xl scale-150" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-success/5 border border-success/10">
                    <CheckCircle className="h-8 w-8 text-success/40" />
                  </div>
                </div>
                <p className="text-sm font-medium text-muted-foreground/70">
                  Все домены в порядке
                </p>
                <p className="text-xs text-muted-foreground/40 mt-1">Нет проблем, требующих внимания</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border border-white/[0.06] rounded-2xl bg-gradient-to-br from-card/80 to-card/40 overflow-hidden">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base font-semibold tracking-tight">По типам</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-3.5">
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
                if (count === 0) return null;
                return (
                  <div key={type} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground/80">{label}</span>
                      <span className="font-semibold text-xs bg-white/[0.06] px-2 py-0.5 rounded-md">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${color} transition-all duration-500`} 
                        style={{ width: `${Math.max(percentage, 4)}%` }}
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
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-base font-semibold tracking-tight">Последние обновления</h2>
          </div>
          <button 
            onClick={() => navigate("/domains")}
            className="text-xs font-medium text-muted-foreground/60 hover:text-primary transition-colors"
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
