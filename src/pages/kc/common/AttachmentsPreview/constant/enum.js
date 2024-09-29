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
  CODE: [
    'ascx',
    'asp',
    'aspx',
    'bat',
    'c',
    'cc',
    'clj',
    'cljs',
    'cljx',
    'clojure',
    'cmd',
    'coffee',
    'config',
    'cpp',
    'cs',
    'cshtml',
    'csproj',
    'css',
    'csx',
    'ctp',
    'cxx',
    'dtd',
    'fs',
    'go',
    'h',
    'handlebars',
    'hbs',
    'hh',
    'hpp',
    'htm',
    'html',
    'hxx',
    'ini',
    'jade',
    'jav',
    'java',
    'js',
    'jshtm',
    'json',
    'jsp',
    'less',
    'lua',
    'm',
    'md',
    'ml',
    'php',
    'pl',
    'pod',
    'pp',
    'profile',
    'properties',
    'ps1',
    'py',
    'r',
    'rb',
    'scss',
    'sh',
    'shtml',
    'sql',
    't',
    'ts',
    'vb',
    'xaml',
    'xcodeproj',
    'xcworkspace',
    'xml',
    'yaml',
    'yml',
  ],
};

const EXT_TYPE_DIC = createDict(extType);

const LOADED_STATUS = {
  DELETED: 0,
};

export { EXT_TYPE_DIC, PREVIEW_TYPE, FROM_TYPE, LOADED_STATUS };
