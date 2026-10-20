/**
 * 动态正文里「用户多敲的空行」的统一表示。
 *
 * Markdown 没有空行的表示法：连续空行会被解析器合并，发布框（Vditor 内置的 Lute）和正文渲染（markdown-it）
 * 都会把它们丢掉。存储态里段落之间就是原样的连续换行，头一个空行是段落分隔本身，之后每多一个空行，
 * 在载入编辑器或渲染正文前都换成一个只含占位字符的段落，两边结构一致，显示也就一致。
 *
 * 占位字符用 U+2060（Word Joiner）：零宽不可见、不属于空白（不会被当成空行），Lute 源码与编辑区互转时也会保留。
 * 不能用 U+200B：Vditor 把它当光标占位，Lute 转换时会过滤掉，空行段落随之消失。
 */
export const BLANK_LINE_MARK = '⁠';

/** 围栏代码块的起止行（``` 或 ~~~，允许最多三个前导空格），块内的空行属于代码内容，不做处理 */
const FENCE_REG = /^ {0,3}(`{3,}|~{3,})/;
const BLANK_LINE_MARK_REG = new RegExp(BLANK_LINE_MARK, 'g');

/** 逐行遍历，围栏代码块内的行直接交给 onFenceLine，其余行交给 onLine */
function walkLines(text, { onLine, onFenceLine }) {
  let fence = '';

  String(text)
    .split('\n')
    .forEach(line => {
      const match = line.match(FENCE_REG);

      if (fence) {
        // 已在围栏内：遇到同种且不短于起始的围栏才算结束
        if (match && match[1][0] === fence[0] && match[1].length >= fence.length) fence = '';
        onFenceLine(line);
        return;
      }

      onLine(line, () => {
        if (match) fence = match[1];
      });
    });
}

/**
 * 存储态 → 展示态：多出来的空行换成占位段落，供编辑器载入与正文渲染使用。
 * @param {string} markdown 存储态源码
 * @returns {string}
 */
export function expandBlankLines(markdown) {
  if (!markdown) return markdown;

  const output = [];
  let blankRun = 0;

  const flushBlankLines = () => {
    if (!blankRun) return;

    // 第一个空行是段落分隔，之后每个空行变成「占位段落 + 段落分隔」
    output.push('');
    for (let i = 1; i < blankRun; i += 1) output.push(BLANK_LINE_MARK, '');
    blankRun = 0;
  };

  walkLines(markdown, {
    onFenceLine: line => output.push(line),
    onLine: (line, enterFence) => {
      if (!line.trim()) {
        blankRun += 1;
        return;
      }

      flushBlankLines();
      enterFence();
      output.push(line);
    },
  });
  flushBlankLines();

  return output.join('\n');
}

/**
 * 会被 Markdown 当成结构的行：标题、列表、引用、表格、HTML、围栏、缩进代码、分隔线 / setext 下划线。
 * 这些结构前后的空行是语法需要的分隔，粘贴时不能当成用户想要的空行。
 */
const STRUCTURE_LINE_REG =
  /^(?: {4}|\t| {0,3}(?:[#>|<]|[-*+](?:\s|$)|\d+[.)](?:\s|$)|`{3,}|~{3,}|[-*_=](?:\s*[-*_=]){2,}\s*$))/;

/**
 * 粘贴的纯文本 → 展示态。
 *
 * 粘贴进来的文本多是聊天、文档里的普通分段文字，用户敲的每个空行都想保留；
 * 而 expandBlankLines 按存储态处理，第一个空行会被当成段落分隔，显示上就少了一行。
 * 这里对两侧都是普通文字的空行，每个空行都展开成占位段落；
 * 只要有一侧是 Markdown 结构（或在文本首尾），仍按 expandBlankLines 的规则处理，粘贴 Markdown 源码时排版不变。
 * @param {string} text 剪贴板纯文本
 * @returns {string}
 */
export function expandPastedBlankLines(text) {
  if (!text) return text;

  const output = [];
  let blankRun = 0;
  let prevPlain = false;

  const flushBlankLines = nextPlain => {
    if (!blankRun) return;

    const placeholders = prevPlain && nextPlain ? blankRun : blankRun - 1;

    output.push('');
    for (let i = 0; i < placeholders; i += 1) output.push(BLANK_LINE_MARK, '');
    blankRun = 0;
  };

  walkLines(text, {
    onFenceLine: line => {
      output.push(line);
      prevPlain = false;
    },
    onLine: (line, enterFence) => {
      if (!line.trim()) {
        blankRun += 1;
        return;
      }

      const plain = !STRUCTURE_LINE_REG.test(line);

      flushBlankLines(plain);
      enterFence();
      output.push(line);
      prevPlain = plain;
    },
  });
  // 末尾的空行没有下文，按段落分隔处理
  flushBlankLines(false);

  return output.join('\n');
}

/** 表格首行：| 开头且整行只有单元格分隔与内容 */
const TABLE_ROW_REG = /^ {0,3}\|.*\|\s*$/;
/** 表格的分隔行：| --- | :-: | 这类 */
const TABLE_DELIMITER_REG = /^ {0,3}\|[\s:|-]+\|\s*$/;

/**
 * Lute 把文档转回 Markdown 源码时会在表格前多补一个空行（只有表格有这个行为，
 * 代码块、引用、列表都没有）。它在编辑器里画成表格的上边距看不出来，
 * 但存进后端后就成了「用户多敲的一个空行」，正文渲染时会多出一个空行段落。
 *
 * 必须在收占位段落之前判断：用户真敲的空行此时是占位段落（非空行），
 * 只有纯粹连着两个空行才是 Lute 补的，这样两者不会混淆。
 */
function dropTableLeadingBlankLine(markdown) {
  if (markdown.indexOf('|') === -1) return markdown;

  const lines = markdown.split('\n');
  const output = [];
  let fence = '';

  lines.forEach((line, index) => {
    const fenceMatch = line.match(FENCE_REG);

    if (fence) {
      if (fenceMatch && fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length) fence = '';
      output.push(line);
      return;
    }

    if (fenceMatch) fence = fenceMatch[1];

    // 空行 + 表格首行 + 分隔行，且空行前面还有一个空行（段落分隔）时，这个空行是 Lute 补的
    const isRedundant =
      !line.trim() &&
      !fence &&
      TABLE_ROW_REG.test(lines[index + 1] || '') &&
      TABLE_DELIMITER_REG.test(lines[index + 2] || '') &&
      output.length > 0 &&
      !output[output.length - 1].trim();

    if (!isRedundant) output.push(line);
  });

  return output.join('\n');
}

/**
 * 展示态 → 存储态：去掉占位段落还原成空行，是 expandBlankLines 的逆运算。
 * 用户在占位段落里继续输入时，占位字符会留在行首，一并去掉。
 * @param {string} markdown 编辑器输出的源码
 * @returns {string}
 */
export function collapseBlankLines(markdown) {
  if (!markdown) return markdown;

  const output = [];
  // 先收 Lute 补在表格前的空行：此时用户敲的空行还是占位段落，不会被误判
  const source = dropTableLeadingBlankLine(markdown);

  walkLines(source, {
    onFenceLine: line => output.push(line),
    onLine: (line, enterFence) => {
      enterFence();

      if (line.indexOf(BLANK_LINE_MARK) === -1) {
        output.push(line);
        return;
      }

      const rest = line.replace(BLANK_LINE_MARK_REG, '');

      // 只有占位字符的行就是占位段落本身：删掉它，它前后的段落分隔合起来正好还原成原来的空行数
      if (rest.trim()) output.push(rest);
    },
  });

  return output.join('\n');
}
