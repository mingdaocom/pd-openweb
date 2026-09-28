import { getIconNameByExt } from 'src/utils/core/file';
import RegExpValidator from 'src/utils/domain/validation/expression';

/**
 * 根据文件扩展名生成文件图标的 CSS 类名，支持文件夹类型。
 * @param  {string} ext 文件扩展名
 * @return {string}          背景图片 css 类名
 */
export const getClassNameByExt = ext => {
  if (ext === false) {
    return 'fileIcon-folder';
  }

  /*
   * 之前方法针对的是普通附件，普通附件的 ext 属性是带 "." 的，知识文件不带点，这里简单的加个匹配判断
   * 传入的参数没有 "." 时，直接把它用作拓展名
   */
  ext = ext || '';
  ext = /^\w+$/.test(ext) ? ext.toLowerCase() : RegExpValidator.getExtOfFileName(ext).toLowerCase();
  return 'fileIcon-' + getIconNameByExt(ext);
};
