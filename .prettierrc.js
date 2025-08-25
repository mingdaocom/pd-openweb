module.exports = {
  printWidth: 120,
  trailingComma: 'all',
  singleQuote: true,
  arrowParens: 'avoid',
  jsxSingleQuote: false,
  semi: true,
  jsxBracketSameLine: false,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: [
    // react相关，支持子模块导入
    '^(react|react-dom|react-router-dom)(/.+)?$',
    // redux相关，支持子模块导入
    '^(redux|react-redux|redux-thunk)(/.+)?$',
    // react-库
    '^(@?react-).+',
    // 第三方组件库，支持子模块导入
    '^(antd|antd-mobile|@ant-design|@fullcalendar/react)(/.+)?$',
    'remarkable',
    'prismjs/components/prism-core',
    'prismjs/components/prism-clike',
    'prismjs/components/prism-javascript',
    // 剩余第三方库
    '<THIRD_PARTY_MODULES>',
    // ming-ui组件库，支持子模块导入
    '^(ming-ui)(/.+)?$',
    // API
    '.*/api/.*',
    // 指定业务模块
    '^(worksheet|mobile|statistics)',
    // 业务模块
    '^src/',
    // 父级导入，排除样式文件
    '^(../)+(?!.*.(?:css|less)$).*$',
    // 同级导入，排除样式文件
    '^./(?!.*.(?:css|less)$).*$',
    // 第三方样式（非相对路径）
    '^[^./].*\\.(css|less)$',
    // 样式文件
    '^.+.(?:css|less)$',
  ],
  // importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,
  importOrderParserPlugins: ['classProperties', 'decorators-legacy', 'jsx'],
};
