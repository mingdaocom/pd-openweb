export const getStrBytesLength = (str = '', bytesLength = 16) => {
  let result = '';
  let strlen = str.length; // 字符串长度
  let chrlen = str.replace(/[^\x00-\xff]/g, '**').length; // 字节长度
  if (chrlen <= bytesLength) {
    return str;
  }
  for (let i = 0, j = 0; i < strlen; i++) {
    let chr = str.charAt(i);
    if (/[\x00-\xff]/.test(chr)) {
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
