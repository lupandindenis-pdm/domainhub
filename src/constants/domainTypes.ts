import { DomainType, DomainStatus } from "@/types/domain";
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Pause, 
  Timer,
  Ban,
  FlaskConical,
  LucideIcon,
  Zap,
  Search,
  Copy,
  Globe,
  Network,
  Gift,
  ArrowRight,
  Wrench,
  Package,
  Briefcase,
  HelpCircle
} from "lucide-react";

/**
 * Единый источник названий типов доменов
 * Используется в форме редактирования, фильтрах и таблице
 */
export const DOMAIN_TYPE_LABELS: Record<DomainType, string> = {
  landing: "Лендинг",
  seo: "SEO",
  mirror: "Зеркало продукта",
  site: "Сайт",
  subdomain: "Поддомен",
  referral: "Реферальный домен",
  redirect: "Редиректор",
  technical: "Технический",
  product: "Домен продукта",
  b2b: "B2B",
  unknown: "Не известно",
};

/**
 * Конфигурация типов доменов с иконками
 */
export const DOMAIN_TYPE_CONFIG: Record<DomainType, { label: string; icon: LucideIcon }> = {
  landing: {
    label: DOMAIN_TYPE_LABELS.landing,
    icon: Zap
  },
  seo: {
    label: DOMAIN_TYPE_LABELS.seo,
    icon: Search
  },
  mirror: {
    label: DOMAIN_TYPE_LABELS.mirror,
    icon: Copy
  },
  site: {
    label: DOMAIN_TYPE_LABELS.site,
    icon: Globe
  },
  subdomain: {
    label: DOMAIN_TYPE_LABELS.subdomain,
    icon: Network
  },
  referral: {
    label: DOMAIN_TYPE_LABELS.referral,
    icon: Gift
  },
  redirect: {
    label: DOMAIN_TYPE_LABELS.redirect,
    icon: ArrowRight
  },
  technical: {
    label: DOMAIN_TYPE_LABELS.technical,
    icon: Wrench
  },
  product: {
    label: DOMAIN_TYPE_LABELS.product,
    icon: Package
  },
  b2b: {
    label: DOMAIN_TYPE_LABELS.b2b,
    icon: Briefcase
  },
  unknown: {
    label: DOMAIN_TYPE_LABELS.unknown,
    icon: HelpCircle
  },
};

/**
 * Массив типов для использования в фильтрах и селектах
 */
export const DOMAIN_TYPES: { value: DomainType; label: string }[] = [
  { value: "unknown", label: DOMAIN_TYPE_LABELS.unknown },
  { value: "landing", label: DOMAIN_TYPE_LABELS.landing },
  { value: "seo", label: DOMAIN_TYPE_LABELS.seo },
  { value: "mirror", label: DOMAIN_TYPE_LABELS.mirror },
  { value: "site", label: DOMAIN_TYPE_LABELS.site },
  { value: "subdomain", label: DOMAIN_TYPE_LABELS.subdomain },
  { value: "referral", label: DOMAIN_TYPE_LABELS.referral },
  { value: "redirect", label: DOMAIN_TYPE_LABELS.redirect },
  { value: "technical", label: DOMAIN_TYPE_LABELS.technical },
  { value: "product", label: DOMAIN_TYPE_LABELS.product },
  { value: "b2b", label: DOMAIN_TYPE_LABELS.b2b },
];

/**
 * Единый источник названий статусов доменов
 */
export const DOMAIN_STATUS_LABELS: Record<DomainStatus, string> = {
  spare: "Запасной",
  actual: "Актуальный",
  not_actual: "Неактуальный",
  not_configured: "Не настроен",
  unknown: "Не известно",
  expiring: "Истекает",
  expired: "Истек",
  blocked: "Заблокирован",
  test: "Тестовый",
};

/**
 * Массив статусов для использования в фильтрах и селектах
 */
export const DOMAIN_STATUSES: { value: DomainStatus; label: string }[] = [
  { value: "actual", label: DOMAIN_STATUS_LABELS.actual },
  { value: "not_actual", label: DOMAIN_STATUS_LABELS.not_actual },
  { value: "not_configured", label: DOMAIN_STATUS_LABELS.not_configured },
  { value: "unknown", label: DOMAIN_STATUS_LABELS.unknown },
  { value: "expiring", label: DOMAIN_STATUS_LABELS.expiring },
  { value: "expired", label: DOMAIN_STATUS_LABELS.expired },
  { value: "spare", label: DOMAIN_STATUS_LABELS.spare },
];

/**
 * Конфигурация статусов с иконками
 * Используется в селекте статусов для отображения иконок
 */
export const DOMAIN_STATUS_CONFIG: Record<DomainStatus, { label: string; icon: LucideIcon }> = {
  actual: {
    label: DOMAIN_STATUS_LABELS.actual,
    icon: CheckCircle
  },
  not_actual: {
    label: DOMAIN_STATUS_LABELS.not_actual,
    icon: XCircle
  },
  unknown: {
    label: DOMAIN_STATUS_LABELS.unknown,
    icon: AlertCircle
  },
  not_configured: {
    label: DOMAIN_STATUS_LABELS.not_configured,
    icon: Clock
  },
  spare: {
    label: DOMAIN_STATUS_LABELS.spare,
    icon: Pause
  },
  expiring: {
    label: DOMAIN_STATUS_LABELS.expiring,
    icon: Timer
  },
  expired: {
    label: DOMAIN_STATUS_LABELS.expired,
    icon: XCircle
  },
  blocked: {
    label: DOMAIN_STATUS_LABELS.blocked,
    icon: Ban
  },
  test: {
    label: DOMAIN_STATUS_LABELS.test,
    icon: FlaskConical
  },
};
