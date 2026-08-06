const PREVIEW_TYPE = {
  OTHER: -1,
  PICTURE: 1,
  IFRAME: 2,
  CODE: 3,
  MARKDOWN: 4,
  LINK: 5, // 链接文件
  VIDEO: 6,
  NEW_PAGE: 7,
  TXT: 8,
  WPS: 9,
};

const FROM_TYPE = {
  POST: 1,
  COMMENT: 2,
  TASK: 3,
  CALENDAR: 4,
  CHAT: 5,
  FOLDER: 6,
  KNOWLEDGE: 7,
};

function createDict(map) {
  const result = {};

  for (const key in map) {
    map[key].forEach(ext => {
      result[ext] = PREVIEW_TYPE[key] || PREVIEW_TYPE.OTHER;
    });
  }

  return result;
}

const extType = {
  PICTURE: ['jpg', 'gif', 'png', 'jpeg', 'bmp', 'webp', 'heic', 'heif', 'tif', 'tiff'],
  VIDEO: ['mov', 'mp4', 'avi', 'mkv', '3gp', '3g2', 'm4v', 'rm', 'rmvb', 'webm'],
  IFRAME: ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'pdf', 'txt', 'ai', 'psd'],
  MARKDOWN: ['md', 'markdown'],
  // 主流编程语言 / 标记 / 配置 / 模板等文本型代码文件，命中即走 CodeViewer 高亮预览
  CODE: [
    // Web / JS / TS
    'js',
    'mjs',
    'cjs',
    'jsx',
    'ts',
    'tsx',
    'coffee',
    'vue',
    'svelte',
    'astro',
    // 样式
    'css',
    'scss',
    'sass',
    'less',
    'styl',
    // 标记 / 数据 / 配置
    'html',
    'htm',
    'shtml',
    'xml',
    'xaml',
    'dtd',
    'json',
    'json5',
    'jsonc',
    'yaml',
    'yml',
    'toml',
    'ini',
    'conf',
    'cfg',
    'config',
    'properties',
    'env',
    'plist',
    'tf',
    'hcl',
    'graphql',
    'gql',
    'proto',
    // 模板
    'jade',
    'pug',
    'ejs',
    'twig',
    'mustache',
    'handlebars',
    'hbs',
    'jsp',
    'jshtm',
    'asp',
    'aspx',
    'ascx',
    'cshtml',
    'ctp',
    // Python
    'py',
    'pyw',
    'pyi',
    // JVM
    'java',
    'jav',
    'kt',
    'kts',
    'groovy',
    'gradle',
    'scala',
    'clj',
    'cljs',
    'cljc',
    'cljx',
    'clojure',
    'edn',
    // C / C++ / C#
    'c',
    'cc',
    'cpp',
    'cxx',
    'h',
    'hh',
    'hpp',
    'hxx',
    'm',
    'mm',
    'cs',
    'csx',
    'csproj',
    // Go / Rust / Swift / Dart
    'go',
    'rs',
    'rust',
    'swift',
    'dart',
    // Ruby / PHP / Perl
    'rb',
    'erb',
    'rake',
    'gemfile',
    'php',
    'phtml',
    'pl',
    'pm',
    'perl',
    'pod',
    // Shell / 脚本
    'sh',
    'bash',
    'zsh',
    'fish',
    'bat',
    'cmd',
    'ps1',
    'psm1',
    'powershell',
    'vim',
    // 函数式 / 其他语言
    'fs',
    'fsx',
    'fsi',
    'ml',
    'hs',
    'lhs',
    'ex',
    'exs',
    'erl',
    'hrl',
    'jl',
    'lua',
    'r',
    'matlab',
    'vb',
    'vbs',
    'lisp',
    'lsp',
    'scm',
    'el',
    'nim',
    'zig',
    'sol',
    'asm',
    'd',
    // SQL / 文档 / 其他
    'sql',
    'md',
    'rst',
    'tex',
    'adoc',
    'dockerfile',
    'makefile',
    'cmake',
    'diff',
    'patch',
    'pp',
    'profile',
    't',
    'xcodeproj',
    'xcworkspace',
  ],
};

const EXT_TYPE_DIC = createDict(extType);

// 代码类文件扩展名白名单（单一数据源），供需要二次判断代码预览的地方复用，避免与 extType.CODE 漂移
const CODE_PREVIEW_EXTENSIONS = extType.CODE;
const HTML_PREVIEW_EXTENSIONS = ['html', 'htm'];

const LOADED_STATUS = {
  DELETED: 0,
};

export { EXT_TYPE_DIC, CODE_PREVIEW_EXTENSIONS, HTML_PREVIEW_EXTENSIONS, PREVIEW_TYPE, FROM_TYPE, LOADED_STATUS };
