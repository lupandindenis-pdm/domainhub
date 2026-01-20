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
import { ExternalLink, MoreHorizontal, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

interface DomainTableProps {
  domains: Domain[];
}

export function DomainTable({ domains }: DomainTableProps) {
  const navigate = useNavigate();

  const getDaysUntilExpiry = (expirationDate: string) => {
    return differenceInDays(parseISO(expirationDate), new Date());
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "dd.MM.yyyy", { locale: ru });
  };

  const getSslIcon = (status: Domain["sslStatus"]) => {
    switch (status) {
      case "valid":
        return <ShieldCheck className="h-4 w-4 text-success" />;
      case "expiring":
        return <Shield className="h-4 w-4 text-warning" />;
      case "expired":
      case "none":
        return <ShieldAlert className="h-4 w-4 text-destructive" />;
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[250px]">Домен</TableHead>
            <TableHead>Тип</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Проект</TableHead>
            <TableHead>Регистратор</TableHead>
            <TableHead>Истекает</TableHead>
            <TableHead className="w-[50px]">SSL</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {domains.map((domain) => {
            const daysLeft = getDaysUntilExpiry(domain.expirationDate);
            
            return (
              <TableRow 
                key={domain.id} 
                className="table-row-hover cursor-pointer"
                onClick={() => navigate(`/domains/${domain.id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">{domain.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://${domain.name}`, "_blank");
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <DomainTypeBadge type={domain.type} />
                </TableCell>
                <TableCell>
                  <DomainStatusBadge status={domain.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {domain.project}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {domain.registrar}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{formatDate(domain.expirationDate)}</span>
                    <span className={`text-xs ${
                      daysLeft <= 30 ? "text-destructive" : 
                      daysLeft <= 90 ? "text-warning" : 
                      "text-muted-foreground"
                    }`}>
                      {daysLeft > 0 ? `${daysLeft} дней` : "Истёк"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {getSslIcon(domain.sslStatus)}
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
                        Открыть
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/domains/${domain.id}/edit`)}>
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => window.open(`https://${domain.name}`, "_blank")}>
                        Открыть сайт
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Удалить
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
