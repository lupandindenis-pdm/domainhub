import { differenceInDays, parseISO } from "date-fns";
import { DomainStatus } from "@/types/domain";

/**
 * Вычисляет эффективный статус домена на основе renewalDate.
 * Если renewalDate истёк → "expired"
 * Если renewalDate <= 30 дней → "expiring"
 * Иначе возвращает оригинальный статус.
 */
export function computeDomainStatus(originalStatus: DomainStatus, renewalDate?: string): DomainStatus {
  if (!renewalDate) return originalStatus;
  try {
    const daysLeft = differenceInDays(parseISO(renewalDate), new Date());
    if (daysLeft <= 0) return "expired";
    if (daysLeft <= 30) return "expiring";
  } catch {}
  return originalStatus;
}
