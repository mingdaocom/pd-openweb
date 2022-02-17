const xss = require('xss');

function warpCode(content) {
  return filerXss(`<pre class="hljs"><code>${content}</code></pre>`);
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
      if (new Blob([text]).size < 100 * 1024) {
        import('highlight.js').then(hljs => {
          import('highlight.js/styles/agate.css');
          cb(null, warpCode(hljs.highlightAuto(text).value));
        });
      } else {
        cb(null, warpCode(text));
      }
    })
    .catch(cb);
}

export function renderMarkdown(src, cb = () => {}) {
  fetch(src)
    .then(res => res.text())
    .then(text => {
      if (new Blob([text]).size < 100 * 1024) {
        require.ensure([], require => {
          const Remarkable = require('remarkable');
          const replaceEntities = require('remarkable/lib/common/utils').replaceEntities;
          const escapeHtml = require('remarkable/lib/common/utils').escapeHtml;
          const hljs = require('highlight.js');
          import('highlight.js/styles/agate.css');
          require('./codeViewer.less');
          const md = new Remarkable({
            highlight(str, lang) {
              if (lang && hljs.getLanguage(lang)) {
                try {
                  return hljs.highlight(lang, str).value;
                } catch (err) {}
              }
              try {
                return hljs.highlightAuto(str).value;
              } catch (err) {}
              return '';
            },
          });
          md.renderer.rules.link_open = function (tokens, idx /* , options, env */) {
            const title = tokens[idx].title ? ' title="' + escapeHtml(replaceEntities(tokens[idx].title)) + '"' : '';
            return '<a target="_blank" href="' + escapeHtml(tokens[idx].href) + '"' + title + '>';
          };
          cb(null, `<div class="markdown-body">${filerXss(md.render(text))}</div>`);
        });
      } else {
        cb(null, filerXss(text));
      }
    })
    .catch(cb);
}

export function renderTxt(src, cb = () => {}) {
  // fetch(src)
  //   .then(res => res.blob())
  //   .then(blob => {
  //     const fr = new FileReader();
  //     fr.onload = () => {
  //       cb(null, fr.result);
  //     };
  //     fr.readAsText(blob, 'gb2312');
  //   })
  //   .catch(cb);
  cb(null, `<iframe  class="txt-viewer" src="${src}" />`);
}
