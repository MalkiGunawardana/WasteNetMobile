import React, { createContext, useContext, useState, ReactNode } from "react";
import i18n from "../services/i18n";

type LanguageContextType = {
  language: "en" | "si";      //store current langu
  setLanguage: (lang: "en" | "si") => void;  //change langu
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<"en" | "si">("en");

  const setLanguage = (lang: "en" | "si") => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);  //add selected langu
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
