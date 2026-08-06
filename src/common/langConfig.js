const config = [
  {
    key: 'en',
    value: 'English',
    languageTeam: 'English',
    language: 'en_US',
    path: '/staticfiles/lang/en/mdTranslation.js',
    code: 1,
  },
  {
    key: 'zh-Hans',
    value: '简体中文',
    languageTeam: 'Chinese Simplified',
    language: 'zh_CN',
    path: '/staticfiles/lang/zh_Hans/mdTranslation.js',
    code: 0,
  },
  {
    key: 'zh-Hant',
    value: '繁體中文',
    languageTeam: 'Chinese Traditional',
    language: 'zh_TW',
    path: '/staticfiles/lang/zh_Hant/mdTranslation.js',
    code: 3,
  },
  {
    key: 'ja',
    value: '日本語',
    languageTeam: 'Japanese',
    language: 'ja',
    path: '/staticfiles/lang/ja/mdTranslation.js',
    code: 2,
  },
  {
    key: 'th',
    value: 'ภาษาไทย',
    languageTeam: 'Thai',
    language: 'th',
    path: '/staticfiles/lang/th/mdTranslation.js',
    code: 4,
  },
  {
    key: 'ms',
    value: 'Bahasa Melayu',
    languageTeam: 'Malay',
    language: 'ms',
    path: '/staticfiles/lang/ms/mdTranslation.js',
    code: 5,
  },
];

export default config;

const APP_LANG_TO_SYSTEM_LANG = {
  zh_hans: 'zh-Hans',
  zh_hant: 'zh-Hant',
};

const SYSTEM_LANG_TO_APP_LANG = {
  'zh-Hans': 'zh_hans',
  'zh-Hant': 'zh_hant',
};

export const getSystemLangKey = lang => APP_LANG_TO_SYSTEM_LANG[lang] || lang;

export const getAppLangCode = lang => SYSTEM_LANG_TO_APP_LANG[lang] || lang;
