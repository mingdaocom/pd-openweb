import React from 'react';
import { findDOMNode } from 'react-dom';
import { createRoot } from 'react-dom/client';
import createLinksForMessage from 'src/util/createLinksForMessage';
import PropTypes from 'prop-types';
import qs from 'query-string';
import CreateGroup from 'src/components/group/create/creatGroup';
import { UserCard } from 'ming-ui';

/**
 * 动态内容
 */
class PostMessage extends React.Component {
  static propTypes = {
    postItem: PropTypes.object,
    renderFace: PropTypes.bool, // 是否渲染表情
    inline: PropTypes.bool, // true: 显示为inline false: 显示为block
    keywords: PropTypes.string,
  };

  static defaultProps = {
    renderFace: true,
  };

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    this.bindEvents();
  }

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
    $(findDOMNode(this))
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

    $(findDOMNode(this))
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
        CreateGroup.createInit({
          callback(group) {
            window.location.href =
              'group/groupValidate?' +
              qs.stringify({
                projectId: group.projectId,
                gID: group.groupId,
              });
          },
        });
      });
  };

  render() {
    const postItem = this.props.postItem;
    let message = postItem.message;
    if (!message) {
      return false;
    }

    message = createLinksForMessage({
      message,
      rUserList: postItem.rUserList,
      rGroupList: postItem.rGroupList,
      categories: postItem.categories,
      filterFace: !this.props.renderFace,
    });

    if (this.props.keywords) {
      const regex = new RegExp(
        '(' +
          this.props.keywords
            .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
            .split(' ')
            .filter(s => s)
            .join('|') +
          ')',
        'gi',
      );
      const parent = document.createElement('div');
      parent.innerHTML = message;
      const children = parent.childNodes;
      for (let i = children.length - 1; i >= 0; i--) {
        if (children[i] && children[i].nodeType === 3 && children[i].nodeValue) {
          const text = children[i].nodeValue.replace(regex, '<font class="HighLightColor">$1</font>');
          const node = document.createElement('span');
          node.innerHTML = text;
          parent.replaceChild(node, children[i]);
        }
      }
      message = parent.innerHTML;
    }

    return React.createElement(this.props.inline ? 'span' : 'div', {
      dangerouslySetInnerHTML: { __html: message },
    });
  }
}

export default PostMessage;
