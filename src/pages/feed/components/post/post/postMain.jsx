import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { UserName } from 'ming-ui';
import { Button, Tooltip } from 'ming-ui/antd-components';
import postAjax from 'src/api/post';
import PostComponent from '../postComponent';
import FastCreateTaskSchedule from './fastCreateTaskSchedule';
import PostMessage from './postMessage';

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
    isOverflowing: false,
    isFastCreate: false,
    left: 0,
    top: 0,
    selectText: '',
    message: '',
  };

  postContentBodyRef = React.createRef();

  componentDidMount() {
    this.updateOverflowState();
    window.addEventListener('resize', this.updateOverflowState);

    if (window.ResizeObserver) {
      this.resizeObserver = new window.ResizeObserver(this.updateOverflowState);
      this.resizeObserver.observe(this.postContentBodyRef.current);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.isFullHeight && !this.state.isFullHeight) {
      this.updateOverflowState();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateOverflowState);
    this.resizeObserver?.disconnect();
  }

  updateOverflowState = () => {
    const postContentBody = this.postContentBodyRef.current;

    if (!postContentBody || this.state.isFullHeight) return;

    const isOverflowing = postContentBody.scrollHeight > postContentBody.clientHeight + 1;

    if (isOverflowing !== this.state.isOverflowing) {
      this.setState({ isOverflowing });
    }
  };

  showMore = () => {
    this.setState({ isFullHeight: true });
  };

  hideMore = () => {
    this.setState({ isFullHeight: false });
  };

  getReplyMessage() {
    const replyID = this.props.postItem.replyID;
    const postID = this.props.postItem.postID;

    postAjax.getReplyMessage({ postID, commentID: replyID }).then(data => {
      if (data.Message) {
        this.setState({ message: data.Message });
      } else {
        this.setState({ message: _l('内容已删除') });
      }
    });
  }

  toggleCreateTaskSchedule = event => {
    const e = event || window.event;
    // Portal 内的预览事件也会沿 React 树冒泡，不能拦截正文 DOM 之外的 mouseup。
    if (!e.currentTarget.contains(e.target)) return;

    if (e.button !== 0 || this.state.isFastCreate) return; // 只左键松开时触发
    const selectedText = document
      .getSelection()
      .toString()
      .trim()
      .replace(/[\n\r]/g, '');

    if (selectedText) {
      const postContentRect = e.currentTarget.getBoundingClientRect();
      this.setState({
        isFastCreate: true,
        selectText: selectedText,
        left: e.clientX - postContentRect.left,
        top: e.clientY - postContentRect.top,
      });
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
        className={cx('postContent', this.props.className)}
        style={{ minHeight: this.props.minHeight }}
        onMouseUp={this.toggleCreateTaskSchedule}
      >
        {fastCreateHtml}
        <div className="postContentBodyContainer">
          <div
            ref={this.postContentBodyRef}
            className={cx('postContentBody', { isFullHeight: this.state.isFullHeight })}
          >
            {postItem.commentID ? (
              <span>
                <UserName user={postItem.user} />
                {postItem.replyMessage ? (
                  <span>
                    <span className=" Green"> {_l('回复')} </span>
                    <UserName user={postItem.replyUser} className="mRight5" />
                    <Tooltip
                      title={this.state.message || _l('加载中...')}
                      onMouseEnter={() => !this.state.message && this.getReplyMessage()}
                    >
                      <i className="colorPrimaryLight icon-replyto replyMessage" />
                    </Tooltip>
                  </span>
                ) : undefined}
                <span key={1}> : </span>
              </span>
            ) : undefined}
            <PostMessage postItem={postItem} keywords={this.props.keywords} inline={this.props.inlineMessage} />
          </div>
          {this.state.isOverflowing && !this.state.isFullHeight && (
            <Button type="link" size="small" className="showMore" onClick={this.showMore}>
              {_l('更多...')}
            </Button>
          )}
        </div>

        {this.state.isOverflowing && this.state.isFullHeight && (
          <Button type="link" size="small" className="hideMore" onClick={this.hideMore}>
            {_l('收起')}
          </Button>
        )}
        {!this.props.isSummary && <PostComponent {...this.props} />}

        {this.props.children /* 转发的动态*/}
      </div>
    );
  }
}

export default PostMain;
