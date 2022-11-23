import xss from 'xss';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import Remarkable from 'remarkable';
import { replaceEntities, escapeHtml } from 'remarkable/lib/common/utils';

function warpCode(content) {
  return filerXss(`<pre class="mdcode"><code class="language-">${content}</code></pre>`);
}

function filerXss(str) {
  return xss(str, {
    whiteList: Object.assign({}, xss.whiteList, {
      span: ['class'],
      div: ['class'],
      code: ['class'],
      pre: ['class'],
    }),
  });
}

export function renderCode(src, cb = () => {}) {
  fetch(src)
    .then(res => res.text())
    .then(text => {
      cb(null, warpCode(highlight(text, languages.js)));
    })
    .catch(cb);
}

export function renderMarkdown(src, cb = () => {}) {
  fetch(src)
    .then(res => res.text())
    .then(text => {
      if (new Blob([text]).size < 100 * 1024) {
        const md = new Remarkable({
          highlight(str, lang) {
            return `<div class="mdcode"><code class="language-">${highlight(str, languages.js)}</code></div>`;
          },
        });
        md.renderer.rules.link_open = function (tokens, idx /* , options, env */) {
          const title = tokens[idx].title ? ' title="' + escapeHtml(replaceEntities(tokens[idx].title)) + '"' : '';
          return '<a target="_blank" href="' + escapeHtml(tokens[idx].href) + '"' + title + '>';
        };
        cb(null, `<div class="markdown-body">${filerXss(md.render(text))}</div>`);
      } else {
        cb(null, filerXss(text));
      }
    })
    .catch(cb);
}

export function renderTxt(src, cb = () => {}) {
  cb(null, `<iframe  class="txt-viewer" src="${src}" />`);
}
