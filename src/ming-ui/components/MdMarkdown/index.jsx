import React, { useCallback, useEffect, useRef, useState } from 'react';
import linkifyit from 'linkify-it';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import RegExpValidator from 'src/utils/domain/validation/expression';
import { getToken } from 'src/utils/services/request/authenticated';

let vditorPromise;
const linkify = linkifyit().set({ fuzzyIP: true });
const READONLY_LINK_ATTRIBUTE = 'data-md-readonly-link';
const READONLY_LINK_SKIP_SELECTOR =
  'a, code, [data-type="a"], [data-type="code"], [data-type="code-block"], .vditor-ir__marker, .vditor-ir__preview';
const ALLOWED_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

function loadVditor() {
  if (!vditorPromise) {
    vditorPromise = Promise.all([import('@mdfe/vditor'), import('/staticfiles/vditordist/index.css')]).then(
      ([module]) => module.default || module,
    );
  }

  return vditorPromise;
}

function isAllowedLinkUrl(url) {
  try {
    return ALLOWED_LINK_PROTOCOLS.has(new URL(url, window.location.origin).protocol);
  } catch {
    return false;
  }
}

function linkifyReadonlyIR(vditor) {
  const root = vditor?.vditor?.ir?.element;
  if (!root || root.querySelector(`[${READONLY_LINK_ATTRIBUTE}]`)) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const matchedTextNodes = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.nodeValue || node.parentElement?.closest(READONLY_LINK_SKIP_SELECTOR)) continue;

    const matches = linkify.match(node.nodeValue)?.filter(match => isAllowedLinkUrl(match.url));
    if (matches?.length) matchedTextNodes.push({ node, matches });
  }

  matchedTextNodes.forEach(({ node, matches }) => {
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    matches.forEach(match => {
      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(node.nodeValue.slice(lastIndex, match.index)));
      }

      const link = document.createElement('a');
      link.className = 'vditor-ir__link';
      link.contentEditable = 'false';
      link.href = match.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute(READONLY_LINK_ATTRIBUTE, 'true');
      link.textContent = match.text;
      link.addEventListener('mousedown', event => {
        event.preventDefault();
        event.stopPropagation();
      });
      link.addEventListener('click', event => event.stopPropagation());
      fragment.appendChild(link);
      lastIndex = match.lastIndex;
    });

    if (lastIndex < node.nodeValue.length) {
      fragment.appendChild(document.createTextNode(node.nodeValue.slice(lastIndex)));
    }

    node.replaceWith(fragment);
  });
}

function focusEditorAtPoint(vditor, clientX, clientY) {
  const editor = vditor?.vditor;
  const editorElement = editor?.[editor.currentMode]?.element;
  if (!editorElement) return;

  editorElement.focus({ preventScroll: true });

  let range;

  if (document.caretPositionFromPoint) {
    const position = document.caretPositionFromPoint(clientX, clientY);

    if (position && editorElement.contains(position.offsetNode)) {
      range = document.createRange();
      range.setStart(position.offsetNode, position.offset);
    }
  } else if (document.caretRangeFromPoint) {
    const caretRange = document.caretRangeFromPoint(clientX, clientY);

    if (caretRange && editorElement.contains(caretRange.startContainer)) {
      range = caretRange;
    }
  }

  if (!range) return;

  range.collapse(true);
  const selection = window.getSelection();
  if (!selection) return;

  selection.removeAllRanges();
  selection.addRange(range);
}

const TOOLBAR = [
  { name: 'emoji', tip: _l('表情'), hotkey: '⌘E' },
  { name: 'headings', tip: _l('标题'), hotkey: '⌘H' },
  { name: 'bold', tip: _l('粗体'), hotkey: '⌘B' },
  { name: 'italic', tip: _l('斜体'), hotkey: '⌘I' },
  { name: 'strike', tip: _l('删除线'), hotkey: '⌘D' },
  { name: 'link', tip: _l('链接'), hotkey: '⌘K' },
  '|',
  { name: 'list', tip: _l('无序列表'), hotkey: '⌘L' },
  { name: 'ordered-list', tip: _l('有序列表'), hotkey: '⌘O' },
  { name: 'check', tip: _l('任务列表'), hotkey: '⌘J' },
  { name: 'outdent', tip: _l('列表反向缩进'), hotkey: '⇧⌘I' },
  { name: 'indent', tip: _l('列表缩进'), hotkey: '⇧⌘O' },
  '|',
  { name: 'line', tip: _l('分隔线'), hotkey: '⇧⌘H' },
  { name: 'quote', tip: _l('引用'), hotkey: '⌘;' },
  { name: 'code', tip: _l('代码块'), hotkey: '⌘U' },
  { name: 'inline-code', tip: _l('行内代码'), hotkey: '⌘G' },
  { name: 'insert-before', tip: _l('起始插入行'), hotkey: '⇧⌘B' },
  { name: 'insert-after', tip: _l('末尾插入行'), hotkey: '⇧⌘E' },
  '|',
  { name: 'upload', tip: _l('上传图片') },
  // 'record',
  { name: 'table', tip: _l('表格'), hotkey: '⌘M' },
  '|',
  { name: 'undo', tip: _l('撤销'), hotkey: '⌘Z' },
  { name: 'redo', tip: _l('重做'), hotkey: '⌘Y' },
  // '|',
  // 'edit-mode',
  // {
  //   name: 'more',
  //   toolbar: ['both', 'code-theme', 'content-theme', 'export', 'outline', 'preview', 'devtools', 'info', 'help'],
  // },
];

const Wrap = styled.div`
  height: ${props => (props.$isFullScreen ? '100%' : 'auto')};
  ${props => (props.$maxHeight && !props.$isFullScreen ? `max-height: ${props.$maxHeight}px` : '')};
  .vditor {
    max-height: inherit;
  }
  .vditor--dark {
    .vditor-preview {
      background-color: var(--color-background-secondary) !important;
      border-left-color: var(--color-border-primary);
    }
    .vditor-reset table tr {
      background-color: var(--color-background-secondary) !important;
    }
  }
  .vditor-toolbar {
    background: var(--color-background-secondary);
    padding: 0 5px !important;
    border: 1px solid var(--color-border-primary) !important;
  }
  .vditor-reset {
    ${props => (props.$isFullScreen ? 'padding: 10px !important;' : '')}
    font-size: 13px;
    color: var(--color-text-primary);
    font-family:
      'Helvetica Neue', Helvetica, Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'WenQuanYi Micro Hei',
      sans-serif !important;

    & > div[data-block='0'] {
      min-height: 24px;
    }

    &:before {
      color: var(--color-text-disabled) !important;
    }
    &:focus {
      background-color: var(--color-background-primary) !important;
    }

    ul,
    ol {
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0px;
      margin-inline-end: 0px;
      padding-inline-start: 40px;
      li {
        display: list-item !important;
        list-style: inherit;
        text-align: -webkit-match-parent !important;
      }
    }
    ol {
      list-style-type: decimal;
      ol {
        list-style-type: lower-latin;
        ol {
          list-style-type: lower-roman;
          ol {
            list-style-type: upper-latin;
            ol {
              list-style-type: upper-roman;
            }
          }
        }
      }
    }
    ul {
      list-style-type: disc;
      ul {
        list-style-type: circle;
        ul {
          list-style-type: square;
          ul {
            list-style-type: square;
          }
        }
      }
    }
  }

  .vditor-reset[contenteditable='true']:not(:focus) {
    background-color: var(--color-background-secondary) !important;
  }
  .vditor-ir pre.vditor-reset[contenteditable='false'] {
    opacity: 1 !important;
  }

  .vditor-toolbar--hide {
    display: none;
  }
`;

function MdMarkdown(props) {
  const {
    mode = 'ir',
    maxHeight,
    minHeight = 90,
    placeholder = '',
    data = '',
    disabled = false,
    analysisLink = false,
    isFullScreen = false,
    projectId,
    appId,
    bucket,
    worksheetId,
    hideToolbar = false,
    registerRef = () => {},
    handleFocus,
    handleChange = () => {},
    handleBlur,
  } = props;
  const [isFocus, setFocus] = useState(false);
  const isFocusRef = useRef(false);
  const vditorRef = useRef(null);
  const vditorInstance = useRef(null);
  const destroyedRef = useRef(false);
  const latestDataRef = useRef(data);

  const syncReadonlyLinks = useCallback(() => {
    const vditor = vditorInstance.current;
    const root = vditor?.vditor?.ir?.element;
    if (!root) return;

    if (analysisLink && !isFocusRef.current && !isFullScreen && mode === 'ir') {
      linkifyReadonlyIR(vditor);
    } else if (root.querySelector(`[${READONLY_LINK_ATTRIBUTE}]`)) {
      vditor.setValue(latestDataRef.current);
    }
  }, [analysisLink, isFullScreen, mode]);

  // 只读态保留滚动和链接交互，仅阻止 Vditor 展开 Markdown 源码标记
  const handleReadonlyClick = useCallback(event => {
    if (event.target.closest('a, [data-type="a"], .vditor-ir__link')) return;

    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleReadonlyMouseDown = useCallback(
    event => {
      const vditor = vditorInstance.current;
      const root = vditor?.vditor?.ir?.element;

      if (
        !analysisLink ||
        isFullScreen ||
        mode !== 'ir' ||
        !root?.querySelector(`[${READONLY_LINK_ATTRIBUTE}]`) ||
        event.target.closest(`[${READONLY_LINK_ATTRIBUTE}], [data-type="a"]`)
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const { clientX, clientY } = event;
      vditor.setValue(latestDataRef.current);
      requestAnimationFrame(() => focusEditorAtPoint(vditor, clientX, clientY));
    },
    [analysisLink, isFullScreen, mode],
  );

  useEffect(() => {
    latestDataRef.current = data;
  }, [data]);

  useEffect(() => {
    destroyedRef.current = false;
    createEditor();
    return () => {
      destroyedRef.current = true;
      vditorInstance.current && vditorInstance.current.destroy();
      vditorInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (vditorInstance.current) {
      if (disabled) {
        vditorInstance.current.disabled();
      } else {
        vditorInstance.current.enable();
      }

      syncReadonlyLinks();
    }
  }, [disabled, syncReadonlyLinks]);

  useEffect(() => {
    if (!isFocusRef.current && vditorInstance.current && vditorInstance.current.getValue() !== data) {
      vditorInstance.current.setValue(data);
    }

    if (vditorInstance.current) syncReadonlyLinks();

    // 初始化还没加载完就赋值处理
    if (!isFocusRef.current && data && !vditorInstance.current) {
      setTimeout(() => {
        if (!isFocusRef.current && vditorInstance.current) {
          vditorInstance.current.setValue(data);
          syncReadonlyLinks();
        }
      }, 100);
    }
  }, [data, syncReadonlyLinks]);

  useEffect(() => {
    syncReadonlyLinks();
  }, [isFocus, syncReadonlyLinks]);

  const customUpload = files => {
    return new Promise((resolve, reject) => {
      const urlList = [];
      const showList = [];

      files.forEach(file => {
        const formData = new FormData();
        const fileExt = `.${RegExpValidator.getExtOfFileName(file.name)}`;
        const isPic = RegExpValidator.fileIsPicture(fileExt);

        getToken([{ bucket: bucket || (isPic ? 4 : 2), ext: fileExt }], 9, {
          projectId,
          appId,
          worksheetId,
        })
          .then(res => {
            formData.append('token', res[0].uptoken);
            formData.append('file', file);
            formData.append('key', res[0].key);
            formData.append('x:serverName', res[0].serverName);
            formData.append('x:filePath', res[0].key.replace(res[0].fileName, ''));
            formData.append('x:fileName', res[0].fileName);
            formData.append(
              'x:originalFileName',
              encodeURIComponent(
                res[0].fileName.indexOf('.') > -1 ? res[0].fileName.split('.').slice(0, -1).join('.') : res[0].fileName,
              ),
            );
            formData.append('x:fileExt', '.' + RegExpValidator.getExtOfFileName(res[0].fileName));

            return window.mdyAPI('', '', formData, {
              ajaxOptions: {
                url: md.global.FileStoreConfig.uploadHost,
              },
              customParseResponse: true,
            });
          })
          .then(res => {
            if (res) {
              const urlImg = res.url || (res.serverName && res.key) ? res.serverName + res.key : '';
              urlList.push(urlImg);
              showList.push(`${(file.type || '').includes('image') ? '!' : ''}[${file.name}](${urlImg})`);
              if (urlList.length === files.length) {
                resolve(urlList);
                if (vditorInstance.current) {
                  const markdownText = showList.join('\n');
                  vditorInstance.current.insertValue(markdownText);
                }
              }
            }
          })
          .catch(error => {
            console.error('上传失败:', error);
            reject(error);
          });
      });
    });
  };

  const createEditor = () => {
    if (!vditorRef.current) return;

    loadVditor().then(Vditor => {
      if (destroyedRef.current || !vditorRef.current) return;

      const vditor = new Vditor(vditorRef.current, {
        mode,
        ...(isFullScreen ? { height: '100%' } : { minHeight }),
        ...(window.themeMode === 'dark' ? { theme: 'dark' } : {}),
        cdn: `${window.__customSubPath__}/staticfiles`,
        placeholder,
        toolbar: TOOLBAR,
        toolbarConfig: {
          hide: hideToolbar,
        },
        lazyLoadImage: 'loading',
        preview: {
          delay: 0,
          actions: [],
          hljs: {
            style: 'monokai',
            lineNumber: true,
          },
          math: {
            inlineDigit: true,
            macros: {
              bf: '{\\boldsymbol f}',
              bu: '{\\boldsymbol u}',
              bv: '{\\boldsymbol v}',
              bw: '{\\boldsymbol w}',
            },
          },
        },
        tab: '',
        typewriterMode: true,
        cache: {
          enable: false,
        },
        upload: {
          accept: 'image/*',
          handler: customUpload,
        },
        after() {
          vditor.setValue(latestDataRef.current);
          vditorInstance.current = vditor;
          registerRef(vditor);

          if (isFullScreen) {
            vditorRef.current?.closest('[role="dialog"]')?.focus({ preventScroll: true });
          }

          if (vditorInstance.current) {
            if (disabled) vditorInstance.current.disabled();
            syncReadonlyLinks();
          }
        },
        input(val) {
          handleChange(val);
        },
        focus(val) {
          isFocusRef.current = true;
          setFocus(true);
          if (_.isFunction(handleFocus)) {
            handleFocus(val);
          }
        },
        blur(val) {
          isFocusRef.current = false;
          setFocus(false);
          if (_.isFunction(handleBlur)) {
            handleBlur(val);
          }
        },
      });
    });
  };

  return (
    <Wrap
      $isFullScreen={isFullScreen}
      $maxHeight={maxHeight}
      onClickCapture={disabled ? handleReadonlyClick : undefined}
      onMouseDownCapture={disabled ? undefined : handleReadonlyMouseDown}
    >
      <div ref={vditorRef} />
    </Wrap>
  );
}

export default MdMarkdown;

MdMarkdown.propTypes = {
  maxHeight: PropTypes.number,
  minHeight: PropTypes.number,
  placeholder: PropTypes.string,
  data: PropTypes.string,
  disabled: PropTypes.bool,
  analysisLink: PropTypes.bool,
  hideToolbar: PropTypes.bool,
  /**
   * 编辑模式：所见即所得（wysiwyg）、即时渲染（ir）、分屏预览（sv）
   */
  mode: PropTypes.string,
  isFullScreen: PropTypes.bool,
  handleChange: PropTypes.func,
};
