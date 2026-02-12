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
    "common.copied": "Скопировано",
    
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

    "badges.landing": "Лендинг",
    "badges.company": "Сайт компании",
    "badges.product": "Домен продукта",
    "badges.mirror": "Зеркало",
    "badges.seo": "SEO сайт",
    "badges.subdomain": "Поддомен",
    "badges.referral": "Реферальный домен",
    "badges.redirect": "Редирект",
    "badges.technical": "Тех. домен",
    "badges.b2b": "B2B",
    "badges.site": "Сайт",
    "badges.unknown": "Не известно",

    "status.spare": "Запасной",
    "status.actual": "Актуален",
    "status.not_actual": "Не актуален",
    "status.not_configured": "Не настроен",
    "status.unknown": "Не известно",
    "status.expiring": "Истекает",
    "status.expired": "Истёк",
    "status.blocked": "Заблокирован",
    "status.test": "Тестовый",

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
    "app.title": "DCP",
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
    "common.copied": "Copied",

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

    "badges.landing": "Landing",
    "badges.company": "Company Site",
    "badges.product": "Product Domain",
    "badges.mirror": "Mirror",
    "badges.seo": "SEO Site",
    "badges.subdomain": "Subdomain",
    "badges.referral": "Referral Domain",
    "badges.redirect": "Redirect",
    "badges.technical": "Tech Domain",
    "badges.b2b": "B2B",
    "badges.site": "Site",
    "badges.unknown": "Unknown",

    "status.spare": "Spare",
    "status.actual": "Actual",
    "status.not_actual": "Not actual",
    "status.not_configured": "Not configured",
    "status.unknown": "Unknown",
    "status.expiring": "Expiring",
    "status.expired": "Expired",
    "status.blocked": "Blocked",
    "status.test": "Test",

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
    "app.title": "DCP",
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
