import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { LanguageProvider } from "./components/language-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <LanguageProvider defaultLanguage="ru" storageKey="vite-ui-language">
      <App />
    </LanguageProvider>
  </ThemeProvider>
);
