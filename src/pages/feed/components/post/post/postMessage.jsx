import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import qs from 'query-string';
import { UserCard } from 'ming-ui';
import { renderCodeHighlight } from 'ming-ui/components/MdMarkdown';
import createRoot from 'src/common/theme/createRootWithAntdConfig';
import createLinksForMessage from 'src/components/comment/utils/createLinksForMessage';
import highlightKeywords from 'src/components/comment/utils/highlightKeywords';
import renderPostMarkdown, {
  ensureMarkdownEngine,
  isMarkdownEngineReady,
} from 'src/components/comment/utils/renderPostMarkdown';
import createGroup from 'src/pages/Group/createGroup/load';
import { sanitizePostMessageHtml } from 'src/utils/core/sanitizeHtml';
import { copyTextToClipboard } from 'src/utils/platform/browser/clipboard';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import './postMarkdown.less';

const CODE_BLOCK_CLASS = 'postMarkdownCodeBlock';

/** 取代码块的纯文本：高亮后的行号是 code 内的空占位节点，去掉后再取，避免混进复制内容 */
function getCodeText(pre) {
  const code = pre.querySelector(':scope > code').cloneNode(true);

  code.querySelectorAll('.vditor-linenumber__rows').forEach(node => node.remove());

  return code.textContent.replace(/\n$/, '');
}

/**
 * 给正文里的代码块补上复制按钮。正文是 innerHTML 注入的，内容重建后按钮随之消失，
 * 每次渲染后重新检查，已包过的代码块跳过。按钮放在包裹层上而不是 pre 内，
 * 代码横向滚动时按钮固定在右上角。
 */
function appendCodeCopyButtons(container) {
  container.querySelectorAll('pre').forEach(pre => {
    if (!pre.querySelector(':scope > code') || pre.parentElement.classList.contains(CODE_BLOCK_CLASS)) return;

    const wrapper = document.createElement('div');
    const button = document.createElement('button');

    wrapper.className = CODE_BLOCK_CLASS;
    button.type = 'button';
    button.className = 'postMarkdownCodeCopy';
    button.title = _l('复制');
    button.setAttribute('aria-label', _l('复制'));
    button.innerHTML = '<i class="icon icon-copy"></i>';
    button.addEventListener('click', event => {
      event.stopPropagation();
      // 剪贴板写入要求处于点击的同步调用栈，取文本与发起复制都不能放到异步回调之后
      copyTextToClipboard(getCodeText(pre)).then(copied => {
        if (copied) {
          alert(_l('复制成功'));
        } else {
          alert(_l('复制失败'), 2);
        }
      });
    });

    pre.replaceWith(wrapper);
    wrapper.appendChild(pre);
    wrapper.appendChild(button);
  });
}

/**
 * 动态内容
 */
class PostMessage extends React.Component {
  static propTypes = {
    postItem: PropTypes.object,
    renderFace: PropTypes.bool, // 是否渲染表情
    inline: PropTypes.bool, // true: 显示为inline false: 显示为block
    keywords: PropTypes.string,
    plainText: PropTypes.bool, // true: 按纯文本渲染，不走 Markdown（回复不支持 Markdown）
  };

  static defaultProps = {
    renderFace: true,
  };

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    this.bindEvents();
    this.upgradeToMarkdownEngine();
  }

  /**
   * 首屏若 Lute 尚未加载，正文先由 markdown-it 兜底渲染，加载完成后按 Lute 重新渲染一次，
   * 保证最终显示与发布框一致。已就绪时不会产生任何额外渲染。
   */
  upgradeToMarkdownEngine = () => {
    if (isMarkdownEngineReady()) return;

    ensureMarkdownEngine().then(ready => {
      if (ready && this._isMounted) this.forceUpdate();
    });
  };

  componentDidUpdate() {
    this.bindEvents();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  bindEvents = () => {
    if (!this._isMounted) {
      return;
    }

    // 代码块与编辑器预览使用同一套高亮配置；纯文本正文不会产生代码块
    if (!this.props.plainText) {
      renderCodeHighlight(this.messageNode);
      appendCodeCopyButtons(this.messageNode);
    }

    $(this.messageNode)
      .find('[data-accountid]')
      .each((i, ele) => {
        const accountId = $(ele).attr('data-accountid');
        $(ele).removeAttr('data-accountid');

        const root = createRoot(ele);

        root.render(
          <UserCard sourceId={accountId}>
            <span>{ele.innerHTML}</span>
          </UserCard>,
        );
      });

    $(this.messageNode)
      .find('[data-groupid]')
      .each((i, ele) => {
        const groupid = $(ele).attr('data-groupid');
        $(ele).removeAttr('data-groupid');

        const root = createRoot(ele);

        root.render(
          <UserCard sourceId={groupid} type={2}>
            <span>{ele.innerHTML}</span>
          </UserCard>,
        );
      })
      .end()
      .find('[data-action=createGroup]')
      .on('click', evt => {
        evt.preventDefault();
        createGroup({
          callback(group) {
            window.location.href = pathCompletion(
              'group/groupValidate?' +
                qs.stringify({
                  projectId: group.projectId,
                  gID: group.groupId,
                }),
            );
          },
        });
      });
  };

  render() {
    const { postItem, renderFace, keywords, inline, plainText } = this.props;
    const message = postItem.message;

    if (!message) {
      return false;
    }

    // 回复只支持纯文本，按 @人、话题、表情和自动链接的既有规则渲染；
    // 动态正文按 Markdown 渲染，私有标记在渲染前会被保护，不受 Markdown 语法影响
    let html = plainText
      ? sanitizePostMessageHtml(
          createLinksForMessage({
            message,
            rUserList: postItem.rUserList,
            rGroupList: postItem.rGroupList,
            categories: postItem.categories,
            filterFace: !renderFace,
            doNotEscapeHTML: true,
          }),
        )
      : renderPostMarkdown(message, {
          rUserList: postItem.rUserList,
          rGroupList: postItem.rGroupList,
          categories: postItem.categories,
          filterFace: !renderFace,
        });

    html = highlightKeywords(html, keywords);

    return React.createElement(inline ? 'span' : 'div', {
      className: plainText ? undefined : cx('postMarkdownBody', { postMarkdownInline: inline }),
      ref: node => {
        this.messageNode = node;
      },
      dangerouslySetInnerHTML: { __html: html },
    });
  }
}

export default PostMessage;
