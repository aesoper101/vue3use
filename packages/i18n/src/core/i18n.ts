import {
  createI18n as createOfficeI18n,
  useI18n as useOfficeI18n,
  type CompileError,
  type ComponentI18nScope,
  type ComposerAdditionalOptions,
  type ComposerOptions,
  type FallbackLocale,
  type I18n,
  type I18nOptions,
  type Locale,
  type LocaleMessageDictionary,
  type LocaleMessageObject,
  type LocaleMessages,
  type LocaleMessageType,
  type LocaleMessageValue,
  type MessageCompiler,
  type MessageContext,
  type MessageFunction,
  type MessageResolver,
  type UseI18nOptions,
} from 'vue-i18n';

export const useI18n = (options?: UseI18nOptions) => {
  return useOfficeI18n(options);
};

let i18n = createOfficeI18n({
  locale: 'zh_CN',
  fallbackLocale: 'en_US',
  globalInjection: true,
  legacy: false,
  messages: {},
});

export function createI18n(
  options: Partial<Omit<I18nOptions, 'legacy'>> = {
    locale: 'zh_CN',
    fallbackLocale: 'en_US',
    globalInjection: true,
  },
) {
  i18n = createOfficeI18n(
    Object.assign(
      {
        locale: 'zh_CN',
        fallbackLocale: 'en_US',
        globalInjection: true,
        legacy: false,
      },
      options || {},
    ),
  );
  return i18n;
}

export const setLocale = (locale: Locale) => {
  i18n.global.locale.value = locale;
};

export const getLocale = (): Locale => {
  return i18n.global.locale.value;
};

export type {
  Locale,
  I18nOptions,
  FallbackLocale,
  LocaleMessageDictionary,
  LocaleMessages,
  LocaleMessageObject,
  LocaleMessageValue,
  MessageCompiler,
  MessageFunction,
  LocaleMessageType,
  ComponentI18nScope,
  MessageContext,
  ComposerAdditionalOptions,
  CompileError,
  I18n,
  ComposerOptions,
  MessageResolver,
};

export default i18n;
