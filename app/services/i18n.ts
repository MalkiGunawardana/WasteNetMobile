import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en";
import si from "../locales/si";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    si: { translation: si },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export const setLanguage = (lang: "en" | "si"): void => {
  i18n.changeLanguage(lang);
};

export default i18n;
