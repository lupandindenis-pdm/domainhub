// Единый источник цветов для GEO кодов
export const geoColors: Record<string, string> = {
  // Специальные регионы
  WW: "#8b5cf6",
  CIS: "#06b6d4",
  EU: "#3b82f6",
  ASIA: "#f97316",
  LATAM: "#10b981",
  
  // Европа
  RU: "#ef4444",
  GB: "#10b981",
  DE: "#f59e0b",
  FR: "#06b6d4",
  IT: "#ec4899",
  ES: "#f97316",
  PL: "#ef4444",
  NL: "#f59e0b",
  SE: "#06b6d4",
  NO: "#3b82f6",
  FI: "#06b6d4",
  DK: "#ef4444",
  CZ: "#3b82f6",
  AT: "#ef4444",
  CH: "#ef4444",
  BE: "#eab308",
  PT: "#10b981",
  GR: "#3b82f6",
  TR: "#ef4444",
  UA: "#3b82f6",
  BY: "#10b981",
  EE: "#3b82f6",
  LV: "#ef4444",
  LT: "#eab308",
  RO: "#3b82f6",
  BG: "#10b981",
  RS: "#ef4444",
  HR: "#3b82f6",
  SI: "#3b82f6",
  SK: "#3b82f6",
  HU: "#10b981",
  IE: "#10b981",
  IS: "#3b82f6",
  LU: "#06b6d4",
  MT: "#ef4444",
  CY: "#f97316",
  
  // Азия
  CN: "#eab308",
  JP: "#ef4444",
  KR: "#3b82f6",
  IN: "#f97316",
  SG: "#ef4444",
  TH: "#3b82f6",
  VN: "#ef4444",
  ID: "#ef4444",
  MY: "#3b82f6",
  PH: "#3b82f6",
  HK: "#ef4444",
  TW: "#3b82f6",
  KZ: "#06b6d4",
  UZ: "#3b82f6",
  GE: "#ef4444",
  AM: "#f97316",
  AZ: "#10b981",
  MD: "#3b82f6",
  IL: "#3b82f6",
  AE: "#10b981",
  SA: "#10b981",
  
  // Америка
  US: "#3b82f6",
  CA: "#14b8a6",
  MX: "#06b6d4",
  BR: "#10b981",
  AR: "#06b6d4",
  CL: "#ef4444",
  CO: "#eab308",
  PE: "#ef4444",
  VE: "#eab308",
  
  // Океания
  AU: "#a855f7",
  NZ: "#3b82f6",
  
  // Африка
  ZA: "#eab308",
  EG: "#eab308",
  MA: "#ef4444",
  NG: "#10b981",
  KE: "#ef4444",
};

// Функция для получения цвета по коду страны
export function getGeoColor(code: string): string {
  return geoColors[code.toUpperCase()] || "#6b7280"; // серый по умолчанию
}
