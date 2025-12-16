const prettier = require('eslint-plugin-prettier');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const js = require('@eslint/js');
const globals = require('globals');
const babelParser = require('@babel/eslint-parser');

module.exports = [
  js.configs.recommended,
  {
    ignores: [
      'src/library/*',
      'src/pages/calendar/modules/calendarControl/**',
      'src/pages/integration/svgIcon.js',
      'src/pages/workflow/api/*',
      'src/pages/workflow/apiV2/*',
      'src/pages/Statistics/api/*',
      'src/pages/integration/api/*',
      'src/pages/widgetConfig/widgetSetting/components/DevelopWithAI/examples/**',
      'src/components/Mingo/ChatBot/components/Recorder/lib.js',
      'src/pages/widgetConfig/widgetSetting/components/FunctionEditorDialog/Func/lib/**',
      'src/pages/widgetConfig/widgetSetting/components/FunctionEditorDialog/Func/test/**',
    ],
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      prettier,
    },
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        File: false,
        _l: false,
        delCookie: false,
        getCookie: false,
        md: false,
        setCookie: false,
        wx: false,
        safeParse: false,
        safeLocalStorageSetItem: false,
        getCurrentLang: false,
        translations: false,
        __api_server__: false,
        $: false,
        createTimeSpan: false,
        getCurrentLangCode: false,
        jQuery: false,
        IM: false,
        dd: false,
        mdyAPI: false,
        AMap: false,
        destroyAlert: false,
        blobStream: false,
        moxie: false,
        plupload: false,
        ActiveXObject: false,
        HWH5: false,
        WeixinJSBridge: false,
        google: false,
        TencentCaptcha: false,
        VConsole: false,
      },
    },

    rules: {
      // React rules
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/react-in-jsx-scope': 'error',

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',

      // Prettier integration
      'prettier/prettier': 'error',

      'no-extra-boolean-cast': 'warn',
      'no-async-promise-executor': 'off',
      'no-loss-of-precision': 'off',
      'no-case-declarations': 'off',
      'no-control-regex': 'off',
      'no-useless-escape': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
