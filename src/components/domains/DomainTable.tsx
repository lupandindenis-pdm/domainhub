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
import { Copy, ExternalLink, Globe, FolderKanban, Tag, Activity } from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

interface DomainTableProps {
  domains: Domain[];
  bulkSelectMode: boolean;
  selectedDomainIds: Set<string>;
  onToggleDomain: (domainId: string) => void;
  showHidden?: boolean;
  labels: Label[];
}

export function DomainTable({ domains, bulkSelectMode, selectedDomainIds, onToggleDomain, showHidden = false, labels }: DomainTableProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleRowClick = (domainId: string) => {
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
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-sm font-normal whitespace-nowrap">
                        {domain.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary"
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
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      {domain.labelId && (() => {
                        const label = labels.find(l => l.id === domain.labelId);
                        return label ? <LabelBadge label={label} /> : null;
                      })()}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-sm text-muted-foreground">
                  {domain.project}
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex justify-start">
                    <DomainTypeBadge type={domain.type} />
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <DomainStatusBadge status={domain.status} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
