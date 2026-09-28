import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import filterXss from 'xss';
import { RichText } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';
import EditableCellCon from '../EditableCellCon';

/**
 * regexFilter 正则方式过滤 html标签
 * 优点：快
 * 缺点：转义后的字符没有处理 (可以用 https://github.com/mathiasbynens/he 处理)
 */
export function regexFilterHtmlScript(str) {
  return filterXss(str).replace(/(<([^>]+)>)/gi, '');
}

const SEMANTIC_TAGS = { strong: 'strong', b: 'b', i: 'i', em: 'em', u: 'u', s: 's', strike: 's', del: 's' };
// CKEditor highlight 插件用 class 标记颜色，样式只在编辑器容器作用域内生效，单元格内需转成内联样式
const MARKER_CLASS_STYLES = {
  'marker-yellow': { 'background-color': '#fdfd77' },
  'marker-green': { 'background-color': '#62f962' },
  'marker-pink': { 'background-color': '#fc7899' },
  'marker-blue': { 'background-color': '#72ccfd' },
  'pen-red': { color: '#e71313' },
  'pen-green': { color: '#128a00' },
};
const SKIP_CONTENT_TAGS = ['script', 'style', 'noscript', 'template', 'iframe', 'svg'];

function getKeptStyles(el) {
  const styles = {};

  (el.getAttribute('class') || '').split(/\s+/).forEach(cls => Object.assign(styles, MARKER_CLASS_STYLES[cls]));

  if (el.tagName.toLowerCase() === 'font' && el.getAttribute('color')) {
    styles.color = el.getAttribute('color');
  }

  const color = el.style.getPropertyValue('color');

  if (color) {
    styles.color = color;
  }

  const backgroundColor = el.style.getPropertyValue('background-color');

  if (backgroundColor) {
    styles['background-color'] = backgroundColor;
  }

  if (/^(bold|bolder|[6-9]00)$/.test(el.style.getPropertyValue('font-weight'))) {
    styles['font-weight'] = 'bold';
  }

  if (/^(italic|oblique)$/.test(el.style.getPropertyValue('font-style'))) {
    styles['font-style'] = 'italic';
  }

  const decorations = (
    el.style.getPropertyValue('text-decoration-line') || el.style.getPropertyValue('text-decoration')
  )
    .split(/\s+/)
    .filter(item => _.includes(['underline', 'line-through'], item));

  if (decorations.length) {
    styles['text-decoration'] = decorations.join(' ');
  }

  return styles;
}

// 单元格最多按行高裁 6 行，超出部分渲染无意义，解析前后都做截断兜底
const MAX_SOURCE_LENGTH = 51200;
const MAX_TEXT_LENGTH = 2000;
// 富文本里的换行有两种来源：<br> 和块级标签的边界（如 </p><p>），都转成 \n 由单元格按行高展示
const LINE_BREAK_BLOCK_TAGS = [
  'p',
  'div',
  'li',
  'ul',
  'ol',
  'tr',
  'td',
  'th',
  'table',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'pre',
  'section',
  'article',
  'dt',
  'dd',
  'figure',
  'hr',
];

function appendLineBreak(target, doc, budget) {
  budget.pendingBreak = false;

  // 内容开头的换行没有展示意义；预算用尽后也不再补
  if (!budget.textLength || budget.textLength >= MAX_TEXT_LENGTH) return;

  budget.textLength += 1;
  target.appendChild(doc.createTextNode('\n'));
}

function appendFilteredNodes(source, target, doc, budget) {
  for (const node of source.childNodes) {
    if (budget.textLength >= MAX_TEXT_LENGTH) return;

    if (node.nodeType === 3) {
      // 源码里的换行和缩进按 HTML 语义折叠成空格，避免保留换行后把排版空白也显示出来
      const raw = node.nodeValue.replace(/\s+/g, ' ');

      if (!raw || (budget.pendingBreak && !raw.trim())) continue;

      if (budget.pendingBreak) {
        appendLineBreak(target, doc, budget);
      }

      const text = raw.slice(0, MAX_TEXT_LENGTH - budget.textLength);

      budget.textLength += text.length;
      target.appendChild(doc.createTextNode(text));
      continue;
    }

    if (node.nodeType !== 1) continue;

    const tag = node.tagName.toLowerCase();

    if (_.includes(SKIP_CONTENT_TAGS, tag)) continue;

    if (tag === 'br') {
      appendLineBreak(target, doc, budget);
      continue;
    }

    const styles = getKeptStyles(node);
    const semanticTag = SEMANTIC_TAGS[tag];

    if (!semanticTag && _.isEmpty(styles)) {
      appendFilteredNodes(node, target, doc, budget);
    } else {
      const el = doc.createElement(semanticTag || 'span');

      Object.keys(styles).forEach(key => el.style.setProperty(key, styles[key]));
      target.appendChild(el);
      appendFilteredNodes(node, el, doc, budget);
    }

    // 块级标签的结尾先记下换行，真正插入要等到后面还有内容时，
    // 这样嵌套块（如 <div><p>…</p></div>）和结尾的空块都不会多出空行
    if (_.includes(LINE_BREAK_BLOCK_TAGS, tag)) {
      budget.pendingBreak = true;
    }
  }
}

/**
 * 单元格内展示富文本：仅保留文字颜色、背景色、加粗、下划线、中划线、斜体，其余标签与样式过滤为纯文本；
 * 内容按 MAX_TEXT_LENGTH 截断，返回 { html: 渲染用, text: title 提示用 }
 */
export function filterRichTextKeepStyles(html) {
  try {
    const doc = new DOMParser().parseFromString(html.slice(0, MAX_SOURCE_LENGTH), 'text/html');
    const result = doc.createElement('div');

    appendFilteredNodes(doc.body, result, doc, { textLength: 0, pendingBreak: false });

    return { html: result.innerHTML, text: result.textContent };
  } catch (err) {
    console.log(err);

    const text = regexFilterHtmlScript(
      html
        .slice(0, MAX_SOURCE_LENGTH)
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(new RegExp(`</(${LINE_BREAK_BLOCK_TAGS.join('|')})>`, 'gi'), '\n'),
    );

    return { html: text, text };
  }
}

export default class Text extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.shape({}),
    editable: PropTypes.bool,
    isediting: PropTypes.bool,
    updateCell: PropTypes.func,
    cell: PropTypes.shape({ value: PropTypes.string }),
    value: PropTypes.string,
    needLineLimit: PropTypes.bool,
    updateEditingStatus: PropTypes.func,
    onClick: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      value: props.cell.value,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.cell.value !== prevProps.cell.value) {
        this.setState({
          value: this.props.cell.value,
        });
      }
    }
  }

  handleTableKeyDown = e => {
    const { updateEditingStatus } = this.props;

    switch (e.key) {
      case 'Escape':
        this.handleChange();
        updateEditingStatus(false);
        break;
      default:
        break;
    }
  };

  handleChange = () => {
    const { cell, updateCell } = this.props;

    if ((cell.value || '') === this.state.value) {
      return;
    }

    if (cell.required && !this.state.value) {
      alert(_l('保存失败，%0为必填字段', cell.controlName), 2);
      return;
    }

    updateCell({
      value: this.state.value,
    });
  };

  renderEditDialog() {
    const { cell, updateEditingStatus } = this.props;
    return (
      <Modal
        open
        mask={{ closable: true }}
        keyboard
        title={cell.controlName}
        width={800}
        footer={null}
        onCancel={() => {
          this.handleChange();
          updateEditingStatus(false);
        }}
      >
        <RichText
          autoFocus
          data={this.state.value || ''}
          minHeight={document.documentElement.clientHeight - 180}
          onSave={value => {
            this.setState({
              value,
            });
          }}
          className={cx('cellControlRichTextDialog')}
        />
      </Modal>
    );
  }

  render() {
    const { className, style, needLineLimit, singleLine, editable, isediting, updateEditingStatus } = this.props;
    const { value } = this.state;
    const content = value ? filterRichTextKeepStyles(value) : { html: '', text: '' };
    return (
      <EditableCellCon
        onClick={this.props.onClick}
        className={cx(className, { canedit: editable })}
        style={style}
        iconName="hr_edit"
        isediting={isediting}
        onIconClick={() => {
          updateEditingStatus(true);
        }}
      >
        {isediting && this.renderEditDialog()}
        {!!value && (
          <div
            // 紧凑行高只有一行，换行按普通空白折叠展示；行高放开后按原样保留 <br> 与段落换行
            className={cx('worksheetCellPureString', { linelimit: needLineLimit, keepLineBreak: !singleLine })}
            title={content.text}
            dangerouslySetInnerHTML={{ __html: content.html }}
          />
        )}
      </EditableCellCon>
    );
  }
}
