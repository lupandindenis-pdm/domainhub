import { StatsCard } from "@/components/domains/StatsCard";
import { DomainTable } from "@/components/domains/DomainTable";
import { mockDomains, mockLabels, projects } from "@/data/mockDomains";
import { Globe, AlertTriangle, Clock, CheckCircle, TrendingUp, AlertCircle } from "lucide-react";
import { DOMAIN_TYPE_LABELS, DOMAIN_STATUS_LABELS } from "@/constants/domainTypes";
import { DomainType, DomainStatus } from "@/types/domain";
import { differenceInDays, parseISO } from "date-fns";
import { computeDomainStatus } from "@/lib/computeDomainStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  
  // Active tab for stat cards — always one is active, default = 'all'
  const [activeFilter, setActiveFilter] = useState<'all' | 'attention' | 'expiring' | 'inactive'>('all');

  // Project filter for "По типам" card
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // Use projects from mockDomains (excluding "Все")
  const availableProjects = projects.filter(p => p !== "Все");

  // Filter domains by selected project for type statistics
  const filteredDomainsForTypes = useMemo(() => {
    if (selectedProject === 'all') return domains;
    return domains.filter(d => d.project === selectedProject);
  }, [domains, selectedProject]);

  // Calculate stats from actual domain list
  const totalDomains = domains.length;

  // Card 2: Требуют внимания — badge "требует внимания" + статусы unknown, not_configured, test
  const needAttentionDomains = useMemo(() => domains.filter(d => {
    if (d.status === 'unknown' || d.status === 'not_configured' || d.status === 'test') return true;
    if (d.needsUpdate === 'Да' || (d.needsUpdate && d.needsUpdate !== 'Нет')) return true;
    if (d.hasTechIssues === 'Да') return true;
    return false;
  }), [domains]);

  // Card 3: Истекают — статус expiring ИЛИ renewalDate < 30 дней
  const expiringDomains = useMemo(() => domains.filter(d => {
    if (d.status === 'expiring') return true;
    if (!d.renewalDate) return false;
    try {
      const daysLeft = differenceInDays(parseISO(d.renewalDate), new Date());
      return daysLeft <= 30 && daysLeft > 0;
    } catch {
      return false;
    }
  }), [domains]);

  // Card 4: Не актуален / Истёк — статусы not_actual, expired
  const inactiveDomains = useMemo(() => domains.filter(d => {
    if (d.status === 'not_actual' || d.status === 'expired') return true;
    if (d.renewalDate) {
      try {
        const daysLeft = differenceInDays(parseISO(d.renewalDate), new Date());
        if (daysLeft <= 0) return true;
      } catch {}
    }
    return false;
  }), [domains]);

  // Recent domains — sorted by updatedAt descending
  const recentDomains = useMemo(() => {
    return [...domains]
      .sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 20);
  }, [domains]);

  // Displayed domains based on active tab
  const displayedDomains = useMemo(() => {
    switch (activeFilter) {
      case 'all': return recentDomains;
      case 'attention': return needAttentionDomains;
      case 'expiring': return expiringDomains;
      case 'inactive': return inactiveDomains;
      default: return recentDomains;
    }
  }, [activeFilter, recentDomains, needAttentionDomains, expiringDomains, inactiveDomains]);

  const cardConfig = useMemo(() => {
    switch (activeFilter) {
      case 'all': return { title: 'Последние обновления', Icon: Globe, iconColor: 'text-primary', iconBg: 'bg-primary/10' };
      case 'attention': return { title: 'Требуют внимания', Icon: AlertTriangle, iconColor: 'text-yellow-500', iconBg: 'bg-yellow-500/10' };
      case 'expiring': return { title: 'Истекают', Icon: Clock, iconColor: 'text-orange-400', iconBg: 'bg-orange-500/10' };
      case 'inactive': return { title: 'Не актуален / Истёк', Icon: AlertCircle, iconColor: 'text-destructive', iconBg: 'bg-destructive/10' };
      default: return { title: 'Последние обновления', Icon: Globe, iconColor: 'text-primary', iconBg: 'bg-primary/10' };
    }
  }, [activeFilter]);

  const CardIcon = cardConfig.Icon;

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
          title="Последние обновления"
          value={recentDomains.length}
          icon={Globe}
          bgColor="hsl(210 60% 18%)"
          glowColor="hsla(210, 100%, 50%, 0.15)"
          onClick={() => setActiveFilter('all')}
          active={activeFilter === 'all'}
        />
        <StatsCard
          title="Требуют внимания"
          value={needAttentionDomains.length}
          icon={AlertTriangle}
          iconColor="text-yellow-500"
          bgColor="hsl(50 50% 14%)"
          glowColor="hsla(50, 90%, 50%, 0.12)"
          onClick={() => setActiveFilter('attention')}
          active={activeFilter === 'attention'}
        />
        <StatsCard
          title="Истекают (<30 дней)"
          value={expiringDomains.length}
          change={expiringDomains.length > 0 ? "Требуют продления" : undefined}
          changeType="negative"
          icon={Clock}
          iconColor="text-orange-400"
          bgColor="hsl(25 55% 16%)"
          glowColor="hsla(25, 90%, 50%, 0.15)"
          onClick={() => setActiveFilter('expiring')}
          active={activeFilter === 'expiring'}
        />
        <StatsCard
          title="Не актуален / Истёк"
          value={inactiveDomains.length}
          icon={AlertCircle}
          iconColor="text-destructive"
          bgColor="hsl(0 50% 17%)"
          glowColor="hsla(0, 85%, 60%, 0.15)"
          onClick={() => setActiveFilter('inactive')}
          active={activeFilter === 'inactive'}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Domain List — driven by active tab */}
        <Card className="lg:col-span-2 border border-white/[0.06] rounded-2xl bg-gradient-to-br from-card/80 to-card/40 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", cardConfig.iconBg)}>
                <CardIcon className={cn("h-4 w-4", cardConfig.iconColor)} />
              </div>
              <CardTitle className="text-base font-semibold tracking-tight">
                {cardConfig.title}
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground/60">
              <span className="font-semibold text-foreground">{displayedDomains.length}</span> из <span className="font-semibold text-foreground">{totalDomains}</span> доменов
            </p>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {displayedDomains.length > 0 ? (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {displayedDomains.map((domain) => {
                  const statusLabel = DOMAIN_STATUS_LABELS[domain.status as DomainStatus] || domain.status;
                  const statusColor = domain.status === 'actual' ? 'text-success'
                    : domain.status === 'expired' || domain.status === 'not_actual' ? 'text-destructive'
                    : domain.status === 'expiring' ? 'text-orange-400'
                    : domain.status === 'unknown' || domain.status === 'not_configured' || domain.status === 'test' ? 'text-yellow-500'
                    : 'text-muted-foreground';
                  const StatusIcon = domain.status === 'actual' ? CheckCircle
                    : domain.status === 'expired' || domain.status === 'not_actual' ? AlertCircle
                    : domain.status === 'expiring' ? Clock
                    : domain.status === 'unknown' || domain.status === 'not_configured' || domain.status === 'test' ? AlertTriangle
                    : Globe;
                  return (
                    <div 
                      key={domain.id}
                      className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/[0.04] p-3.5 transition-all hover:bg-white/[0.05] hover:border-white/[0.08] cursor-pointer group/row"
                      onClick={() => navigate(`/domains/${domain.id}`)}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shrink-0", cardConfig.iconBg)}>
                          <StatusIcon className={cn("h-4 w-4", statusColor)} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-sm font-medium group-hover/row:text-primary transition-colors truncate">{domain.name}</p>
                          <p className="text-xs text-muted-foreground/60">{DOMAIN_TYPE_LABELS[domain.type as DomainType] || 'Не известно'}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className={cn("text-xs", statusColor)}>{statusLabel}</p>
                        <p className="text-[11px] text-muted-foreground/40">{domain.department || '—'}</p>
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
                <p className="text-sm font-medium text-muted-foreground/70">Всё в порядке</p>
                <p className="text-xs text-muted-foreground/40 mt-1">Нет доменов в этой категории</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border border-white/[0.06] rounded-2xl bg-gradient-to-br from-card/80 to-card/40 overflow-hidden">
          <CardHeader className="pb-3 pt-5 px-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base font-semibold tracking-tight">По типам</CardTitle>
            </div>
            {/* Project filter dropdown */}
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="bg-muted/30 border-white/[0.06] h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все проекты</SelectItem>
                {availableProjects.map(project => (
                  <SelectItem key={project} value={project}>{project}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                const count = filteredDomainsForTypes.filter(d => d.type === type).length;
                const filteredTotal = filteredDomainsForTypes.length;
                const percentage = filteredTotal > 0 ? Math.round((count / filteredTotal) * 100) : 0;
                if (count === 0) return null;
                return (
                  <div key={type} className="group space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm text-muted-foreground/80 group-hover:text-muted-foreground transition-colors">{label}</span>
                        <span className="text-xs font-medium text-muted-foreground/50 group-hover:text-muted-foreground/70 transition-colors">({percentage}%)</span>
                      </div>
                      <span className="text-xs font-semibold tabular-nums bg-white/[0.06] px-2 py-0.5 rounded-md group-hover:bg-white/[0.1] transition-colors">{count}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-gradient-to-r from-white/[0.03] to-white/[0.06] overflow-hidden relative shadow-inner">
                      <div 
                        className={`h-full rounded-full ${color} transition-all duration-700 ease-out relative overflow-hidden`} 
                        style={{ width: `${Math.max(percentage, 4)}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
