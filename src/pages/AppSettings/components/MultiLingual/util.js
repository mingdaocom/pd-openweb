
export const filterHtmlTag = (value = '') => value.replace(/<[^>]*>/g, '').replace(/&nbsp;/ig, '');
