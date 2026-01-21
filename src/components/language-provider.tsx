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
    "domains.registry": "Реестр доменов",
    "domains.add": "Добавить домен",
    "history": "История изменений",
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
    "domains.registry": "Domain Registry",
    "domains.add": "Add Domain",
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
