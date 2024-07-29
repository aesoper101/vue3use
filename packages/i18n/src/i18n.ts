import { getCurrentInstance, type App } from 'vue';
import { createI18n, useI18n as useOfficeI18n } from 'vue-i18n';
import type {
  I18nInterface,
  I18nOptions,
  Locale,
  LocaleMessage,
} from './interface';

class I18n implements I18nInterface {
  public readonly innerI18n = createI18n({
    locale: 'zh_CN',
    messages: {},
    legacy: false,
    globalInjection: true,
    allowComposition: true,
  });

  constructor(options?: I18nOptions) {
    if (options) {
      const { locale, messages } = options;
      if (locale) {
        this.setLocale(locale);
      }
      if (messages) {
        this.setLocaleMessages(messages);
      }
    }
  }

  getLocale(): Locale {
    return this.innerI18n.global.locale.value;
  }

  getLocaleMessage(locale: Locale): LocaleMessage {
    return this.innerI18n.global.getLocaleMessage(locale);
  }

  setLocale(locale: Locale): void {
    this.innerI18n.global.locale.value = locale;
  }

  setLocaleMessage(locale: Locale, message: LocaleMessage): void {
    const messages = this.innerI18n.global.getLocaleMessage(locale);
    if (messages) {
      this.innerI18n.global.mergeLocaleMessage(locale, message);
    } else {
      this.innerI18n.global.setLocaleMessage(locale, message);
    }
  }

  setLocaleMessages(messages: Record<Locale, LocaleMessage>): void {
    Object.keys(messages).forEach((locale) => {
      this.setLocaleMessage(locale, messages[locale]);
    });
  }

  t(key: string, options?: any): string {
    return this.innerI18n.global.t(key, options);
  }
}

let i18nInstance = new I18n();
let isInstalled = false;
export const createI18nInstance = (options?: I18nOptions) => {
  if (!isInstalled) {
    i18nInstance = new I18n(options);
    isInstalled = true;
  }
  return {
    i18n: i18nInstance,
    install: (app: App) => {
      console.log('install i18n');
      app.use(i18nInstance.innerI18n);
    },
  };
};

export const useI18n = () => {
  const instance = getCurrentInstance();
  if (!instance) {
    return {
      i18n: i18nInstance.innerI18n,
      t: i18nInstance.innerI18n.global.t,
      tm: i18nInstance.innerI18n.global.tm,
      rt: i18nInstance.innerI18n.global.rt,
      te: i18nInstance.innerI18n.global.te,
      d: i18nInstance.innerI18n.global.d,
      n: i18nInstance.innerI18n.global.n,
      getLocale: i18nInstance.getLocale.bind(i18nInstance),
      getLocaleMessage: i18nInstance.getLocaleMessage.bind(i18nInstance),
      setLocale: i18nInstance.setLocale.bind(i18nInstance),
      setLocaleMessage: i18nInstance.setLocaleMessage.bind(i18nInstance),
      setLocaleMessages: i18nInstance.setLocaleMessages.bind(i18nInstance),
    };
  }

  const { t, tm, rt, te, d, n } = useOfficeI18n();
  return {
    i18n: i18nInstance.innerI18n,
    t,
    tm,
    rt,
    te,
    d,
    n,
    getLocale: i18nInstance.getLocale.bind(i18nInstance),
    getLocaleMessage: i18nInstance.getLocaleMessage.bind(i18nInstance),
    setLocale: i18nInstance.setLocale.bind(i18nInstance),
    setLocaleMessage: i18nInstance.setLocaleMessage.bind(i18nInstance),
    setLocaleMessages: i18nInstance.setLocaleMessages.bind(i18nInstance),
  };
};

export type UseI18nInstance = ReturnType<typeof useI18n>;

export const g_t = useI18n().t;
export const g_tm = useI18n().tm;
export const g_rt = useI18n().rt;
export const g_te = useI18n().te;
export const g_d = useI18n().d;
export const g_n = useI18n().n;
export const g_getLocale = useI18n().getLocale;
export const g_getLocaleMessage = useI18n().getLocaleMessage;
export const g_setLocaleMessage = useI18n().setLocaleMessage;
export const g_setLocaleMessages = useI18n().setLocaleMessages;
