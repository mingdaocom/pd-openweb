import RegExpValidator from 'src/utils/expression';

export function getUrlList(text = '') {
  const array = text.replace(/\n/, ' ').split(' ');
  const result = [];

  for (let i = 0; i < array.length; i++) {
    let content = array[i];
    if (RegExpValidator.isURL(content)) {
      result.push(content);
    }
  }

  return result;
}
