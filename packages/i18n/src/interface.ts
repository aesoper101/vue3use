export type LocaleMessage = Record<string, any>;

export type Locale = string;

export interface I18nOptions {
  locale?: Locale;
  messages?: Record<Locale, LocaleMessage>;
}

export interface I18nInterface {
  setLocale: (locale: Locale) => void;
  getLocale: () => Locale;

  setLocaleMessage: (locale: Locale, message: LocaleMessage) => void;
  setLocaleMessages: (messages: Record<Locale, LocaleMessage>) => void;
  getLocaleMessage: (locale: Locale) => LocaleMessage;
}
