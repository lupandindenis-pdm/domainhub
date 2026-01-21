import { useState } from "react"
import { Button } from "@/components/ui/button"

type Language = "ru" | "en"

export function LanguageToggle() {
  const [language, setLanguage] = useState<Language>("ru")

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "ru" ? "en" : "ru"))
    // In a real app, this would trigger i18n change
    console.log(`Language switched to ${language === "ru" ? "en" : "ru"}`)
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleLanguage}
      className="h-9 min-w-[3rem] px-2 font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
    >
      {language.toUpperCase()}
    </Button>
  )
}
