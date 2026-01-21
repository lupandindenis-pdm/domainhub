import { createContext, useContext, useEffect, useState } from "react"

export type Language = "ru" | "en"

type Translations = {
  [key in Language]: {
    [key: string]: string
  }
}

const translations: Translations = {
  ru: {
    "dashboard": "Дашборд",
    "domains.registry": "Реестр",
    "domains.add": "Добавить домен",
    "domains.title": "Реестр доменов",
    "domains.subtitle_prefix": "из",
    "domains.subtitle_suffix": "доменов",
    "domains.export": "Экспорт CSV",
    "domains.not_found": "Домены не найдены",
    "domains.try_change_filters": "Попробуйте изменить параметры фильтрации",
    
    "filters.all_types": "Все типы",
    "filters.all_statuses": "Все статусы",
    "filters.all_projects": "Все проекты",
    "filters.all_registrars": "Все регистраторы",
    "filters.reset": "Сбросить",
    "filters.type": "Тип домена",
    "filters.status": "Статус",
    "filters.project": "Проект",
    "filters.registrar": "Регистратор",

    "table.domain": "Домен",
    "table.type": "Тип",
    "table.status": "Статус",
    "table.project": "Проект",
    "table.registrar": "Регистратор",
    "table.expires": "Истекает",
    "table.ssl": "SSL",
    "table.days_left": "дней",
    "table.expired": "Истёк",

    "actions.open": "Открыть",
    "actions.edit": "Редактировать",
    "actions.open_site": "Открыть сайт",
    "actions.delete": "Удалить",

    "badges.landing": "Лендинги",
    "badges.company": "Сайт компании",
    "badges.product": "Домены продукта",
    "badges.mirror": "Зеркало",
    "badges.seo": "SEO сайты",
    "badges.subdomain": "Поддомены сайтов",
    "badges.referral": "Реферальные домены",
    "badges.redirect": "Реддиректоры",
    "badges.technical": "Тех. домены",
    "badges.b2b": "B2B",
    "badges.site": "Сайты",

    "status.active": "Активен",
    "status.expiring": "Истекает",
    "status.expired": "Истёк",
    "status.reserved": "Резерв",

    "history": "История",
    "alerts": "Алерты",
    "reports": "Отчёты",
    "users": "Пользователи",
    "roles": "Роли и доступ",
    "settings": "Настройки",
    "search.placeholder": "Поиск домена...",
    "main": "Главное",
    "management": "Управление",
    "admin": "Администрирование",
    "admin.role": "Администратор",
    "app.title": "DMS",
    "app.subtitle": "Domain Management",
  },
  en: {
    "dashboard": "Dashboard",
    "domains.registry": "Registry",
    "domains.add": "Add Domain",
    "domains.title": "Domain Registry",
    "domains.subtitle_prefix": "of",
    "domains.subtitle_suffix": "domains",
    "domains.export": "Export CSV",
    "domains.not_found": "No domains found",
    "domains.try_change_filters": "Try changing filter parameters",

    "filters.all_types": "All types",
    "filters.all_statuses": "All statuses",
    "filters.all_projects": "All projects",
    "filters.all_registrars": "All registrars",
    "filters.reset": "Reset",
    "filters.type": "Domain Type",
    "filters.status": "Status",
    "filters.project": "Project",
    "filters.registrar": "Registrar",

    "table.domain": "Domain",
    "table.type": "Type",
    "table.status": "Status",
    "table.project": "Project",
    "table.registrar": "Registrar",
    "table.expires": "Expires",
    "table.ssl": "SSL",
    "table.days_left": "days",
    "table.expired": "Expired",

    "actions.open": "Open",
    "actions.edit": "Edit",
    "actions.open_site": "Open Site",
    "actions.delete": "Delete",

    "badges.landing": "Landings",
    "badges.company": "Company Site",
    "badges.product": "Product Domains",
    "badges.mirror": "Mirror",
    "badges.seo": "SEO Sites",
    "badges.subdomain": "Subdomains",
    "badges.referral": "Referral Domains",
    "badges.redirect": "Redirects",
    "badges.technical": "Tech Domains",
    "badges.b2b": "B2B",
    "badges.site": "Sites",

    "status.active": "Active",
    "status.expiring": "Expiring",
    "status.expired": "Expired",
    "status.reserved": "Reserved",

    "history": "History",
    "alerts": "Alerts",
    "reports": "Reports",
    "users": "Users",
    "roles": "Roles & Access",
    "settings": "Settings",
    "search.placeholder": "Search domain...",
    "main": "Main",
    "management": "Management",
    "admin": "Administration",
    "admin.role": "Administrator",
    "app.title": "DMS",
    "app.subtitle": "Domain Management",
  }
}

type LanguageProviderProps = {
  children: React.ReactNode
  defaultLanguage?: Language
  storageKey?: string
}

type LanguageProviderState = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const initialState: LanguageProviderState = {
  language: "ru",
  setLanguage: () => null,
  t: (key) => key,
}

const LanguageProviderContext = createContext<LanguageProviderState>(initialState)

export function LanguageProvider({
  children,
  defaultLanguage = "ru",
  storageKey = "vite-ui-language",
  ...props
}: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem(storageKey) as Language) || defaultLanguage
  )

  useEffect(() => {
    localStorage.setItem(storageKey, language)
  }, [language, storageKey])

  const t = (key: string) => {
    return translations[language][key] || key
  }

  const value = {
    language,
    setLanguage,
    t,
  }

  return (
    <LanguageProviderContext.Provider value={value} {...props}>
      {children}
    </LanguageProviderContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageProviderContext)

  if (context === undefined)
    throw new Error("useLanguage must be used within a LanguageProvider")

  return context
}
