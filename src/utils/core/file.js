/**
 * 将字节数换算为带精度和单位的可读文件大小文本。
 * @param  {Number} size  文件以 byte 为单位的大小
 * @param  {Array}  accuracy 小数点后保留的位数
 * @param  {String} space 数字和单位间的内容，默认为一个空格
 * @param  {Array}  units 自定义文件大小单位的数组，默认为 ['B', 'KB', 'MB', 'GB', 'TB']
 * @return {String}       可读的格式
 */
export const formatFileSize = (size, accuracy, space, units) => {
  units = units || ['B', 'KB', 'MB', 'GB', 'TB'];
  space = space || ' ';
  accuracy = (accuracy && typeof accuracy === 'number' && accuracy) || 0;
  if (!size) {
    return '0' + space + units[0];
  }

  let i = Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(accuracy) * 1 + space + units[i];
};

/**
 * 将文件扩展名归类为对应的文件图标名称。
 * @param  {string} ext 拓展名
 * @return {string}          背景图片 icon 名
 */
export const getIconNameByExt = ext => {
  let extType = null;

  switch (ext && ext.toLowerCase()) {
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'bmp':
    case 'tif':
    case 'tiff':
      extType = 'img';
      break;
    case 'xls':
    case 'xlsx':
      extType = 'excel';
      break;
    case 'doc':
    case 'docx':
    case 'dot':
      extType = 'word';
      break;
    case 'md':
      extType = 'md';
      break;
    case 'js':
    case 'ts':
    case 'java':
    case 'py':
    case 'rb':
    case 'cpp':
    case 'c':
    case 'html':
    case 'css':
    case 'php':
    case 'swift':
    case 'go':
    case 'rust':
    case 'lua':
    case 'sql':
    case 'pl':
    case 'sh':
    case 'json':
    case 'xml':
    case 'cs':
    case 'vb':
    case 'scala':
    case 'perl':
    case 'r':
    case 'matlab':
    case 'groovy':
    case 'jsp':
    case 'jsx':
    case 'tsx':
    case 'sass':
    case 'less':
    case 'scss':
    case 'coffee':
    case 'asm':
    case 'bat':
    case 'powershell':
    case 'h':
    case 'hpp':
    case 'm':
    case 'mm':
    case 'd':
    case 'kt':
    case 'ini':
    case 'yml':
    case 'yaml':
      extType = 'code';
      break;
    case 'ppt':
    case 'pptx':
    case 'pps':
      extType = 'ppt';
      break;
    case 'mov':
    case 'mp4':
    case 'mpg':
    case 'flv':
    case 'f4v':
    case 'rm':
    case 'rmvb':
    case 'avi':
    case 'mkv':
    case 'wmv':
    case '3gp':
    case '3g2':
    case 'swf':
    case 'm4v':
      extType = 'mp4';
      break;
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'ape':
    case 'alac':
    case 'wavpack':
    case 'm4a':
    case 'aac':
    case 'ogg':
    case 'vorbis':
    case 'opus':
    case 'au':
    case 'mmf':
    case 'aif':
      extType = 'mp3';
      break;
    case 'mmap':
    case 'xmind':
    case 'cal':
    case 'zip':
    case 'rar':
    case '7z':
    case 'pdf':
    case 'txt':
    case 'ai':
    case 'psd':
    case 'vsd':
    case 'aep':
    case 'apk':
    case 'ascx':
    case 'db':
    case 'dmg':
    case 'dwg':
    case 'eps':
    case 'exe':
    case 'indd':
    case 'iso':
    case 'key':
    case 'ma':
    case 'max':
    case 'numbers':
    case 'obj':
    case 'pages':
    case 'prt':
    case 'rp':
    case 'skp':
    case 'xd':
      extType = ext.toLowerCase();
      break;
    case 'url':
      extType = 'link';
      break;
    case 'mdy':
      extType = 'mdy';
      break;
    default:
      extType = 'doc';
  }

  return extType;
};

/**
 * 将常见文件扩展名映射为 MIME 类型，未知类型回退为二进制流。
 * @param  {string} ext 文件扩展名
 * @return {string}     MIME 类型
 */
export const getMimeTypeByExt = ext => {
  if (!ext) return 'application/octet-stream';
  ext = ext.replace(/^\./, '');
  const extLower = ext.toLowerCase();

  switch (extLower) {
    // 图片类型
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'bmp':
      return 'image/bmp';
    case 'tif':
    case 'tiff':
      return 'image/tiff';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';
    case 'ico':
      return 'image/x-icon';

    // 文档类型
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'dot':
      return 'application/msword';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'ppt':
      return 'application/vnd.ms-powerpoint';
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'pps':
      return 'application/vnd.ms-powerpoint';

    // 文本类型
    case 'txt':
      return 'text/plain';
    case 'html':
    case 'htm':
      return 'text/html';
    case 'css':
      return 'text/css';
    case 'js':
      return 'application/javascript';
    case 'json':
      return 'application/json';
    case 'xml':
      return 'application/xml';
    case 'csv':
      return 'text/csv';
    case 'md':
      return 'text/markdown';

    // 代码文件
    case 'ts':
      return 'application/typescript';
    case 'java':
      return 'text/x-java-source';
    case 'py':
      return 'text/x-python';
    case 'rb':
      return 'text/x-ruby';
    case 'cpp':
    case 'c':
      return 'text/x-c';
    case 'php':
      return 'application/x-php';
    case 'swift':
      return 'text/x-swift';
    case 'go':
      return 'text/x-go';
    case 'rust':
      return 'text/x-rust';
    case 'lua':
      return 'text/x-lua';
    case 'sql':
      return 'application/sql';
    case 'pl':
      return 'text/x-perl';
    case 'sh':
      return 'application/x-sh';
    case 'cs':
      return 'text/x-csharp';
    case 'vb':
      return 'text/x-vb';
    case 'scala':
      return 'text/x-scala';
    case 'perl':
      return 'text/x-perl';
    case 'r':
      return 'text/x-r';
    case 'matlab':
      return 'text/x-matlab';
    case 'groovy':
      return 'text/x-groovy';
    case 'jsp':
      return 'application/x-jsp';
    case 'jsx':
      return 'text/jsx';
    case 'tsx':
      return 'text/tsx';
    case 'sass':
      return 'text/x-sass';
    case 'less':
      return 'text/x-less';
    case 'scss':
      return 'text/x-scss';
    case 'coffee':
      return 'text/x-coffeescript';
    case 'asm':
      return 'text/x-asm';
    case 'bat':
      return 'application/x-bat';
    case 'powershell':
      return 'application/x-powershell';
    case 'h':
    case 'hpp':
      return 'text/x-c';
    case 'm':
    case 'mm':
      return 'text/x-objective-c';
    case 'd':
      return 'text/x-d';
    case 'kt':
      return 'text/x-kotlin';
    case 'ini':
      return 'text/plain';
    case 'yml':
    case 'yaml':
      return 'application/x-yaml';

    // 音频类型
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'flac':
      return 'audio/flac';
    case 'ape':
      return 'audio/ape';
    case 'alac':
      return 'audio/alac';
    case 'wavpack':
      return 'audio/wavpack';
    case 'm4a':
      return 'audio/mp4';
    case 'aac':
      return 'audio/aac';
    case 'ogg':
      return 'audio/ogg';
    case 'vorbis':
      return 'audio/vorbis';
    case 'opus':
      return 'audio/opus';
    case 'au':
      return 'audio/basic';
    case 'mmf':
      return 'audio/mmf';
    case 'aif':
      return 'audio/aiff';

    // 视频类型
    case 'mp4':
      return 'video/mp4';
    case 'mov':
      return 'video/quicktime';
    case 'mpg':
    case 'mpeg':
      return 'video/mpeg';
    case 'flv':
      return 'video/x-flv';
    case 'f4v':
      return 'video/x-f4v';
    case 'rm':
    case 'rmvb':
      return 'video/vnd.rn-realvideo';
    case 'avi':
      return 'video/x-msvideo';
    case 'mkv':
      return 'video/x-matroska';
    case 'wmv':
      return 'video/x-ms-wmv';
    case '3gp':
      return 'video/3gpp';
    case '3g2':
      return 'video/3gpp2';
    case 'swf':
      return 'application/x-shockwave-flash';
    case 'm4v':
      return 'video/x-m4v';

    // 压缩文件
    case 'zip':
      return 'application/zip';
    case 'rar':
      return 'application/x-rar-compressed';
    case '7z':
      return 'application/x-7z-compressed';
    case 'tar':
      return 'application/x-tar';
    case 'gz':
      return 'application/gzip';

    // 其他文件类型
    case 'psd':
      return 'image/vnd.adobe.photoshop';
    case 'ai':
      return 'application/postscript';
    case 'eps':
      return 'application/postscript';
    case 'exe':
      return 'application/x-msdownload';
    case 'dmg':
      return 'application/x-apple-diskimage';
    case 'iso':
      return 'application/x-iso9660-image';
    case 'apk':
      return 'application/vnd.android.package-archive';
    case 'db':
      return 'application/x-sqlite3';
    case 'dwg':
      return 'image/vnd.dwg';
    case 'indd':
      return 'application/x-indesign';
    case 'key':
      return 'application/vnd.apple.keynote';
    case 'ma':
    case 'max':
      return 'application/x-3ds-max';
    case 'numbers':
      return 'application/vnd.apple.numbers';
    case 'obj':
      return 'application/x-tgif';
    case 'pages':
      return 'application/vnd.apple.pages';
    case 'prt':
      return 'application/x-prt';
    case 'rp':
      return 'application/x-rp';
    case 'skp':
      return 'application/x-sketchup';
    case 'xd':
      return 'application/vnd.adobe.xd';
    case 'url':
      return 'application/x-url';
    case 'mdy':
      return 'application/x-mdy';

    // 默认类型
    default:
      return 'application/octet-stream';
  }
};

/**
 * 汇总浏览器 File 列表的字节数。
 */
export const getFilesSize = files => files.reduce((totalSize, file) => totalSize + (file.size || 0), 0);

/**
 * 从文件名中取得不带点号的扩展名。
 */
export const getFileExtends = fileName => fileName.substring(fileName.lastIndexOf('.') + 1);

const DOCUMENT_EXTENSIONS = [
  '.doc',
  '.docx',
  '.dotx',
  '.dot',
  '.dotm',
  '.xls',
  '.xlsx',
  '.xlsm',
  '.xlm',
  '.xlsb',
  '.ppt',
  '.pptx',
  '.pps',
  '.ppsx',
  '.potx',
  '.pot',
  '.pptm',
  '.potm',
  '.ppsm',
  '.pdf',
];

/**
 * 判断带点号的扩展名是否属于常见文档类型。
 */
export const isDocument = fileExt => !!fileExt && DOCUMENT_EXTENSIONS.includes(fileExt.toLowerCase());

/**
 * 将媒体时长秒数格式化为 mm:ss 或 h:mm:ss。
 */
export const formatMediaDuration = (seconds = 0) => {
  let minute = parseInt((seconds / 60) % 60);
  const hour = parseInt(seconds / 60 / 60);
  let second = parseInt(seconds % 60);

  minute = minute >= 10 ? minute : `0${minute}`;
  second = second >= 10 ? second : `0${second}`;
  return hour ? `${hour}:${minute}:${second}` : `${minute}:${second}`;
};
