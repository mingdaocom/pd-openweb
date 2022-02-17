import React from 'react';
import ReactDom from 'react-dom';
import mdFunction from 'src/components/common/function';
import PropTypes from 'prop-types';
import qs from 'query-string';

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
    require(['mdBusinessCard', 'src/components/group/create/creatGroup'], (card, CreatGroup) => {
      if (!this._isMounted) {
        return;
      }
      $(ReactDom.findDOMNode(this))
        .find('[data-accountid], [data-groupid]')
        .each(function () {
          $(this).mdBusinessCard();
        })
        .end()
        .find('[data-action=createGroup]')
        .on('click', evt => {
          evt.preventDefault();
          CreatGroup.createInit({
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
    });
  };

  render() {
    const postItem = this.props.postItem;
    let message = postItem.message;
    if (!message) {
      return false;
    }
    message = mdFunction.createLinksForMessage({
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

module.exports = PostMessage;
