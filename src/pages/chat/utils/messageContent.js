const urlReg = /((http|https|ftp):\/\/|w{1,3}\.)[^\s|<|\u4E00-\u9FA5]+/gi;

const encodeHtmlAttribute = value => value.replace(/"/g, '&#34;').replace(/'/g, '&#39;');

export const toLink = str => {
  return str.replace(urlReg, match => {
    const href = match.match(/^w{1,3}/) ? `http://${match}` : match;

    return `<a class="convertLink" target="_blank" rel="noopener noreferrer" href="${encodeHtmlAttribute(href)}">${match}</a>`;
  });
};

export const tagConvert = message => message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
