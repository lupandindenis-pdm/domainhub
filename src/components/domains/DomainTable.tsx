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
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[520px]">{t("table.domain")}</TableHead>
            <TableHead className="w-[88px]"></TableHead>
            <TableHead className="w-[180px]">{t("table.type")}</TableHead>
            <TableHead className="w-[140px]">{t("table.status")}</TableHead>
            <TableHead>{t("table.project")}</TableHead>
            <TableHead className="w-[50px]"></TableHead>
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
                <TableCell className="pr-2">
                  <span className="font-mono text-sm font-normal whitespace-nowrap">{domain.name}</span>
                </TableCell>
                <TableCell className="px-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(domain.name);
                        toast.success(t("common.copied"));
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://${domain.name}`, "_blank");
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <DomainTypeBadge type={domain.type} />
                  </div>
                </TableCell>
                <TableCell>
                  <DomainStatusBadge status={domain.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {domain.project}
                </TableCell>
                <TableCell>
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
