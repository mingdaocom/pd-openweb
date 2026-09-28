import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import Remarkable, { escapeHtml, replaceEntities } from 'ming-ui/components/Remarkable';
import { sanitizeMarkdownPreviewHtml, sanitizePostMessageHtml } from 'src/utils/core/sanitizeHtml';

const filerXss = sanitizePostMessageHtml;

function warpCode(content) {
  return filerXss(`<pre class="mdcode"><code class="language-">${content}</code></pre>`);
}

function enableTaskLists(md) {
  md.core.ruler.after('inline', 'task-lists', state => {
    const tokens = state.tokens;

    for (let index = 2; index < tokens.length; index++) {
      const inlineToken = tokens[index];

      if (
        inlineToken.type !== 'inline' ||
        tokens[index - 1].type !== 'paragraph_open' ||
        tokens[index - 2].type !== 'list_item_open'
      ) {
        continue;
      }

      const firstChild = inlineToken.children && inlineToken.children[0];
      if (!firstChild || firstChild.type !== 'text') continue;

      const matched = /^\[([ xX])\]\s+/.exec(firstChild.content);
      if (!matched) continue;

      firstChild.content = firstChild.content.slice(matched[0].length);
      const checked = matched[1] !== ' ';

      inlineToken.children.unshift({
        type: 'htmltag',
        content: `<input class="task-list-checkbox" type="checkbox" disabled${checked ? ' checked' : ''}>`,
        level: firstChild.level,
      });
    }
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
      if (new Blob([text]).size < 5 * 1024 * 1024) {
        const md = new Remarkable({
          highlight(str) {
            return `<div class="mdcode"><code class="language-">${highlight(str, languages.js)}</code></div>`;
          },
        });

        enableTaskLists(md);

        // mermaid 围栏：不做代码高亮，输出占位 div（内含原始源码），由预览层注入 DOM 后异步渲染成图
        const defaultFence = md.renderer.rules.fence;

        md.renderer.rules.fence = function (tokens, idx, options, env, instance) {
          const lang = (tokens[idx].params || '').trim().split(/\s+/)[0];

          if (lang === 'mermaid') {
            return `<div class="md-mermaid">${escapeHtml(tokens[idx].content)}</div>`;
          }

          return defaultFence.call(this, tokens, idx, options, env, instance);
        };

        md.renderer.rules.link_open = function (tokens, idx /* , options, env */) {
          const title = tokens[idx].title ? ' title="' + escapeHtml(replaceEntities(tokens[idx].title)) + '"' : '';
          return (
            '<a target="_blank" rel="noopener noreferrer" href="' + escapeHtml(tokens[idx].href) + '"' + title + '>'
          );
        };

        cb(null, `<div class="markdown-body">${sanitizeMarkdownPreviewHtml(md.render(text))}</div>`);
      } else {
        cb(null, filerXss(text));
      }
    })
    .catch(cb);
}

function decode(arrayBuffer) {
  const encodings = ['utf-8', 'gbk', 'iso-8859-1']; // 常见的编码列表

  for (let encoding of encodings) {
    try {
      const decoder = new TextDecoder(encoding, { fatal: true });
      const text = decoder.decode(arrayBuffer);
      return { encoding, text };
    } catch (e) {
      console.log(e);
    }
  }

  return null;
}

export function renderTxt(src, cb = () => {}) {
  fetch(src)
    .then(res => res.arrayBuffer())
    .then(arrayBuffer => {
      const result = decode(arrayBuffer);
      cb(null, result.text);
    })
    .catch(cb);
}
