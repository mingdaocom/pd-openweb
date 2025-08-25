export const getStrBytesLength = (str = '', bytesLength = 16) => {
  let result = '';
  let strlen = str.length; // 字符串长度
  let chrlen = str.replace(/[^\u0020-\u007F]/g, '**').length;
  if (chrlen <= bytesLength) {
    return str;
  }
  for (let i = 0, j = 0; i < strlen; i++) {
    let chr = str.charAt(i);
    if (/[\u0020-\u007F]/.test(chr)) {
      j++;
    } else {
      j += 2;
    }
    if (j <= bytesLength) {
      result += chr;
    } else {
      return result;
    }
  }
};
