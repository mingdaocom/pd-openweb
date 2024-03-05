import RegExp from 'src/util/expression';

export function getUrlList(text) {
  const array = text.replace(/\n/, ' ').split(' ');
  const result = [];

  for(let i = 0; i < array.length; i++) {
    let content = array[i];
    if (RegExp.isURL(content)) {
      result.push(content);
    }
  }

  return result;
}
