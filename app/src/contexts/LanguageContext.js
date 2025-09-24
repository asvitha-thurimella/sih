import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();


// Supported languages
const SUPPORTED_LANGS = ["en", "hi", "te", "ta", "bn", "mr"];

export function LanguageProvider({ children }) {
  // Always fallback to English if localStorage value is invalid
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem("lang");
    return saved && SUPPORTED_LANGS.includes(saved) ? saved : "en";
  });

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
