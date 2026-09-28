const GOOGLE_MAP_LANGUAGE = {
  en: 'en',
  ja: 'ja',
  'zh-Hans': 'zh-CN',
  zh_hans: 'zh-CN',
  'zh-Hant': 'zh-TW',
  zh_hant: 'zh-TW',
};

export const getGoogleMapLanguage = () => {
  const appLang = new URL(window.location.href).searchParams.get('app_lang');
  const accountAppLang = md.global.Account.appLang;
  const language =
    appLang === '_base_' ? window.getCurrentLang() : appLang || accountAppLang || window.getCurrentLang();

  return GOOGLE_MAP_LANGUAGE[language] || 'zh-CN';
};
