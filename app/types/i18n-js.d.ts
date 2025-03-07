declare module "i18n-js" {
  interface I18n {
    fallbacks: boolean;
    translations: { [key: string]: any };
    locale: string;
    t(key: string): string;
  }

  const i18n: I18n;
  export default i18n;
}
