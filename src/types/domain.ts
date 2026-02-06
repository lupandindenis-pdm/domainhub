export type DomainType =
  | "landing"
  | "seo"
  | "mirror"
  | "site"
  | "subdomain"
  | "referral"
  | "redirect"
  | "technical"
  | "product"
  | "b2b"
  | "unknown";

export type DomainStatus = "spare" | "actual" | "not_actual" | "not_configured" | "unknown" | "expiring" | "expired" | "blocked" | "test";

export type DomainPurity = "white" | "grey" | "black";

export type DomainLifespan = "short" | "mid" | "long";

// New Enums
export type DomainCategory = "Landing" | "Micro-site" | "Promo" | "Blog" | "Support" | "Other";
export type DomainDirection = string;
export type TargetAction = string;
export type TestMethod = "Manual" | "Auto" | "Local" | "Mixed";
export type ProgramStatus = "Active" | "Inactive" | "Moderation" | "Paused";

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
  sslStatus: "valid" | "expiring" | "expired" | "none" | "error";
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

  // New Fields
  // Marketing
  category?: DomainCategory;
  needsUpdate?: string;
  jiraTask?: string;
  direction?: DomainDirection;
  bonus?: string;
  targetAction?: TargetAction;
  
  // IT
  fileHosting?: string;
  techIssues?: string[];
  testMethod?: TestMethod;
  jiraTaskIT?: string[];
  uptimeMonitor?: string;
  lastCheck?: string;
  
  // Analytics
  gaId?: string;
  gtmId?: string;
  uniqueUsers?: number;
  uniqueUsersPeriod?: string;
  
  // Partnership
  isInProgram?: boolean;
  programStatus?: ProgramStatus;
  companyName?: string;
  programLink?: string;
  
  // General
  landingName?: string;
  hasGeoBlock?: boolean;
  blockedGeo?: string[];
  languages?: string[];
  addedDate?: string;
  
  // Integrations
  oneSignalId?: string;
  cloudflareAccount?: string;
  otherIntegrations?: string[];
  
  // Label
  labelId?: string;
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

export interface Label {
  id: string;
  name: string;
  color: string;
  projectId: string;
}

export interface DomainFilter {
  search?: string;
  types?: DomainType[];
  statuses?: DomainStatus[];
  projects?: string[];
  departments?: string[];
  registrars?: string[];
  geo?: string[];
  labelId?: string;
  folders?: string[];
}
