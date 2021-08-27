import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDom from 'react-dom';
import ReactDomServer from 'react-dom/server';
import UserName from '../../userName';
import LoadDiv from 'ming-ui/components/LoadDiv';
import postAjax from 'src/api/post';
import PostMessage from './postMessage';
import PostComponent from '../postComponent';
import FastCreateTaskSchedule from './fastCreateTaskSchedule';

// 减少 store 复杂性，回复消息存在这里
const replyMessages = {};
function getCachedReplyMessage(replyID) {
  return replyMessages[replyID];
}

function getReplyMessagePromise(postID, replyID) {
  if (replyMessages[replyID]) {
    return Promise.resolve(replyMessages[replyID]);
  }
  return postAjax.getReplyMessage({ postID, commentID: replyID }).then((data) => {
    if (data.Message) {
      replyMessages[replyID] = data.Message;
      return data.Message;
    }
    return _l('内容已删除');
  });
}

/**
 * 动态主体内容，包括动态内容和用户头像、姓名和发布到的群组
 */
class PostMain extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.any,
    postItem: PropTypes.object.isRequired,
    keywords: PropTypes.string,
    isSummary: PropTypes.bool,
    isReshare: PropTypes.bool,
    inlineMessage: PropTypes.bool,
    minHeight: PropTypes.number,
  };

  state = {
    isFullHeight: false,
    isFastCreate: false,
    left: 0,
    top: 0,
    selectText: '',
  };

  showMore = () => {
    this.setState({ isFullHeight: true });
  };

  hideMore = () => {
    this.setState({ isFullHeight: false });
    $(".feedAppScroll.nano").nanoScroller();
    $(".feedAppScroll.nano").nanoScroller({
      scrollTop: $(".feedAppScroll.nano .nano-content").scrollTop() - ($(this.postContent).height() - 330),
    });
  };

  showReplyMessage = () => {
    const el = ReactDom.findDOMNode(this.replyMessage);
    const replyID = this.props.postItem.replyID;
    const postID = this.props.postItem.postID;
    require(['poshytip'], () => {
      $(el)
        .poshytip({
          showOn: 'none',
          className: 'tip-white',
          alignTo: 'target',
          alignX: 'center',
          alignY: 'top',
          offsetX: 0,
          offsetY: 10,
          showTimeout: 1,
          showAniDuration: 0,
          zIndex: 1050,
          content(updateCallback) {
            const cached = getCachedReplyMessage(replyID);
            if (cached) {
              return `<div class="pAll10 breakAll">${cached}</div>`;
            }
            setTimeout(() => {
              getReplyMessagePromise(postID, replyID)
                .then(message => `<div class="pAll10 breakAll">${message}</div>`)
                .then(updateCallback);
            }, 0);
            return `<div class="pAll10">${ReactDomServer.renderToString(React.createElement(LoadDiv))}</div>`;
          },
        })
        .poshytip('show');
    });
  };

  hideReplyMessage = () => {
    require(['poshytip'], () => {
      $('.replyMessage').poshytip('destroy');
    });
  };

  toggleCreateTaskSchedule = (event) => {
    const e = event || window.event;
    if (e.button !== 0) return; // 只左键松开时触发
    const even = e.srcElement || e.target;
    if ($(even).hasClass('postContent') || $(even).closest('.postContent').length) {
      let txt = '';
      if (document.selection) {
        txt = document.selection.createRange().text; // IE
      } else {
        txt = document.getSelection();
      }
      txt = txt
        .toString()
        .trim()
        .replace(new RegExp('\n', 'g'), '')
        .replace(new RegExp('\r', 'g'), ''); /* eslint no-control-regex:0*/
      const sh = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const eLeft = e.clientX - 40 < 0 ? e.clientX : e.clientX;
      const eTop = e.clientY < 0 ? e.clientY + sh : e.clientY + sh;
      const pLeft = $(even)
        .closest('.postContent')
        .offset().left;
      const pTop = $(even)
        .closest('.postContent')
        .offset().top;
      if (txt) {
        this.setState({
          isFastCreate: true,
          selectText: txt,
          left: eLeft - pLeft,
          top: eTop - pTop,
        });
      }
    }
    e.stopPropagation();
  };

  handFastCreate = () => {
    this.setState({ isFastCreate: !this.state.isFastCreate });
  };

  render() {
    const postItem = this.props.postItem;
    let fastCreateHtml;
    if (this.state.isFastCreate) {
      fastCreateHtml = (
        <FastCreateTaskSchedule
          selectText={this.state.selectText}
          style={{ left: this.state.left, top: this.state.top }}
          handFastCreate={this.handFastCreate}
        />
      );
    }
    return (
      <div
        className={cx('postContent ', this.props.className)}
        style={{ minHeight: this.props.minHeight }}
        onMouseUp={this.toggleCreateTaskSchedule}
        ref={(postContent) => { this.postContent = postContent; }}
      >
        {fastCreateHtml}
        <div className="postContentBodyContainer" style={{ paddingBottom: 5 }}>
          <div className={cx('postContentBody', { isFullHeight: this.state.isFullHeight })}>
            {postItem.commentID ? (
              <span>
                <UserName user={postItem.user} bindBusinessCard />
                {postItem.replyMessage ? (
                  <span>
                    <span className=" Green"> {_l('回复')} </span>
                    <UserName user={postItem.replyUser} bindBusinessCard />
                    <i
                      ref={(replyMessage) => {
                        this.replyMessage = replyMessage;
                      }}
                      onMouseEnter={this.showReplyMessage}
                      onMouseLeave={this.hideReplyMessage}
                      className="mLeft5 ThemeColor4 icon-replyto replyMessage"
                    />
                  </span>
                ) : (
                  undefined
                )}
                <span key={1}> : </span>
              </span>
            ) : (
              undefined
            )}
            <PostMessage postItem={postItem} keywords={this.props.keywords} inline={this.props.inlineMessage} />
          </div>
          {this.state.isFullHeight ? (
            undefined
          ) : (
            <a className={cx('Hand showMore', { hide: this.state.isFullHeight })} onClick={this.showMore}>
              {_l('更多...')}
            </a>
          )}
        </div>

        {this.state.isFullHeight && (
          <a className="Hand hideMore" onClick={this.hideMore}>
            {_l('收起')}
          </a>
        )}
        {!this.props.isSummary && <PostComponent {...this.props} />}

        {this.props.children /* 转发的动态*/}
      </div>
    );
  }
}

module.exports = PostMain;
