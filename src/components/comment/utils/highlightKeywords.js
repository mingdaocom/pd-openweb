const SKIP_SELECTOR = 'a, code, pre';
const HIGHLIGHT_STYLE = 'background-color: var(--color-warning-border);';

/**
 * 给正文 HTML 里的搜索关键词打高亮。
 *
 * 逐个文本节点处理，因此 Markdown 渲染出的标题、列表项、表格单元格同样能命中；
 * 链接与代码块内部跳过，避免破坏已生成的 @人链接或代码示例。
 *
 * @param {string} html 正文 HTML
 * @param {string} keywords 空格分隔的关键词
 * @returns {string} 打过高亮的 HTML
 */
export default function highlightKeywords(html, keywords) {
  if (!html || !keywords) return html;

  const words = keywords
    .replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
    .split(' ')
    .filter(word => word);

  if (!words.length) return html;

  const host = document.createElement('div');
  host.innerHTML = html;

  const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
  const matchedNodes = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.nodeValue || node.parentElement?.closest(SKIP_SELECTOR)) continue;

    const testReg = new RegExp(`(${words.join('|')})`, 'gi');
    if (testReg.test(node.nodeValue)) matchedNodes.push(node);
  }

  matchedNodes.forEach(node => {
    const value = node.nodeValue;
    const fragment = document.createDocumentFragment();
    const reg = new RegExp(`(${words.join('|')})`, 'gi');
    let lastIndex = 0;
    let match;

    while ((match = reg.exec(value))) {
      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(value.slice(lastIndex, match.index)));
      }

      const highlight = document.createElement('font');
      highlight.setAttribute('style', HIGHLIGHT_STYLE);
      highlight.textContent = match[0];
      fragment.appendChild(highlight);

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < value.length) {
      fragment.appendChild(document.createTextNode(value.slice(lastIndex)));
    }

    node.replaceWith(fragment);
  });

  return host.innerHTML;
}
