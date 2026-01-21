import { Domain } from "@/types/domain";
import { DomainTypeBadge } from "./DomainTypeBadge";
import { DomainStatusBadge } from "./DomainStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/language-provider";

interface DomainTableProps {
  domains: Domain[];
}

export function DomainTable({ domains }: DomainTableProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[45%]">{t("table.domain")}</TableHead>
            <TableHead className="w-[18%]">{t("table.type")}</TableHead>
            <TableHead className="w-[12%]">{t("table.status")}</TableHead>
            <TableHead>{t("table.project")}</TableHead>
            <TableHead className="w-[56px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {domains.map((domain) => {
            return (
              <TableRow 
                key={domain.id} 
                className="table-row-hover cursor-pointer"
                onClick={() => navigate(`/domains/${domain.id}`)}
              >
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(domain.name);
                        toast.success(t("common.copied"));
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-sm font-normal whitespace-nowrap">{domain.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://${domain.name}`, "_blank");
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex justify-start">
                    <DomainTypeBadge type={domain.type} />
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <DomainStatusBadge status={domain.status} />
                </TableCell>
                <TableCell className="py-3 text-sm text-muted-foreground">
                  {domain.project}
                </TableCell>
                <TableCell className="py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/domains/${domain.id}`)}>
                        {t("actions.open")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/domains/${domain.id}/edit`)}>
                        {t("actions.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => window.open(`https://${domain.name}`, "_blank")}>
                        {t("actions.open_site")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        {t("actions.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
