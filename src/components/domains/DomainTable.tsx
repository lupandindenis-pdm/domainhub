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
    <div className="w-full">
      <Table className="table-fixed w-full" role="table" aria-label="Domains list">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[45%]" scope="col">Domain</TableHead>
            <TableHead className="w-[18%]" scope="col">Type</TableHead>
            <TableHead className="w-[12%]" scope="col">Status</TableHead>
            <TableHead scope="col">Project</TableHead>
            <TableHead className="w-[56px]" scope="col" aria-label="Actions"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {domains.map((domain) => {
            return (
              <TableRow 
                key={domain.id} 
                className="hover:bg-muted/50 cursor-pointer transition-colors duration-150"
                onClick={() => navigate(`/domains/${domain.id}`)}
                aria-label={`Domain: ${domain.name}, Type: ${domain.type}, Status: ${domain.status}, Project: ${domain.project}`}
              >
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
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
                      <span className="font-mono text-sm font-normal whitespace-nowrap">{domain.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = `https://${domain.name}`;
                          try {
                            const validatedUrl = new URL(url);
                            if (validatedUrl.protocol === 'https:' || validatedUrl.protocol === 'http:') {
                              window.open(validatedUrl.toString(), "_blank", "noopener,noreferrer");
                            } else {
                              toast.error(t("common.invalid_url"));
                            }
                          } catch (error) {
                            toast.error(t("common.invalid_url"));
                          }
                        }}
                        aria-label={`Open external site: ${domain.name}`}
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
                      <DropdownMenuItem onClick={() => {
                        const url = `https://${domain.name}`;
                        try {
                          const validatedUrl = new URL(url);
                          if (validatedUrl.protocol === 'https:' || validatedUrl.protocol === 'http:') {
                            window.open(validatedUrl.toString(), "_blank", "noopener,noreferrer");
                          } else {
                            toast.error(t("common.invalid_url"));
                          }
                        } catch (error) {
                          toast.error(t("common.invalid_url"));
                        }
                      }}>
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
