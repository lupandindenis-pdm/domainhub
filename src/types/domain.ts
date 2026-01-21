export type DomainType =
  | "landing"
  | "seo"
  | "mirror"
  | "site"
  | "subdomain"
  | "referral"
  | "redirect"
  | "technical"
  | "product";

export type DomainStatus = "active" | "expiring" | "expired" | "reserved";

export type DomainPurity = "white" | "grey" | "black";

export type DomainLifespan = "short" | "mid" | "long";

export interface Domain {
  id: string;
  name: string;
  
  // Technical attributes
  registrationDate: string;
  expirationDate: string;
  registrar: string;
  registrarAccount: string;
  renewalCost: number;
  currency: string;
  nsServers: string[];
  ipAddress: string;
  cdn?: string;
  sslStatus: "valid" | "expiring" | "expired" | "none";
  updateMethod: "manual" | "api";
  
  // Business attributes
  project: string;
  department: string;
  owner: string;
  type: DomainType;
  geo: string[];
  status: DomainStatus;
  accessLevel: string;
  description: string;
  purity: DomainPurity;
  lifespan: DomainLifespan;
  
  // Additional metadata
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DomainHistoryEntry {
  id: string;
  domainId: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
}

export interface DomainFilter {
  search?: string;
  types?: DomainType[];
  statuses?: DomainStatus[];
  projects?: string[];
  departments?: string[];
  registrars?: string[];
  geo?: string[];
}
