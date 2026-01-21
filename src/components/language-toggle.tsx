import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === "ru" ? "en" : "ru")
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleLanguage}
      className="h-9 min-w-[3rem] px-2 font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
    >
      {(language === "ru" ? "en" : "ru").toUpperCase()}
    </Button>
  )
}
