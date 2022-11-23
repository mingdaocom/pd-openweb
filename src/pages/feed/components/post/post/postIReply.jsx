import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import UserHead from '../../userHead';
import UserName from '../../userName';
import PostMain from './postMain';
import PostMessage from './postMessage';
import PostFooter from './postFooter';
import postEnum from '../../../constants/postEnum';

/**
 * 动态卡片内部内容, 包括动态、相应类型动态的附加信息、操作项、回复/标签等
 */
class PostIReply extends React.Component {
  static propTypes = {
    postItem: PropTypes.any.isRequired,
    className: PropTypes.string,
    isSummary: PropTypes.bool,
  };

  state = {
    selectedOperation:
      !this.props.isSummary && parseInt(this.props.postItem.commentCount, 10)
        ? postEnum.OPERATE_TYPE.comment
        : undefined,
  };

  toggleCommentBox = () => {
    if (this.state.selectedOperation === postEnum.OPERATE_TYPE.comment) {
      this.setState({
        selectedOperation: undefined,
      });
      return;
    }
    this.setState({ selectedOperation: postEnum.OPERATE_TYPE.comment, focusCommentBox: true });
  };

  gotoPostDetail = () => {
    window.location = '/feeddetail?itemID=' + this.props.postItem.postID;
  };

  render() {
    const postItem = this.props.postItem;
    const commentCount = parseInt(postItem.commentCount, 10);
    const sourceType = postItem.forComment === 'True' ? _l('回复') : _l('动态');

    return (
      <div className={cx('postContainer', this.props.className)}>
        <UserHead className="userHead left" user={postItem.user} size={48} />
        <div className="userMain">
          <PostMain postItem={postItem} isSummary={this.props.isSummary} />
          <div className="postContent mTop10" style={{ minHeight: 0 }}>
            {postItem.reply.invalid ? (
              _l('原内容已被删除')
            ) : (
              <span>
                回复
                <UserName
                  user={{
                    userName: postItem.reply.replyUserName,
                    accountId: postItem.reply.replyAccountId,
                  }}
                />
                的{sourceType}: <PostMessage postItem={postItem.reply} inline />
              </span>
            )}
          </div>
        </div>

        <PostFooter
          createTime={postItem.createTime}
          source={postItem.source}
          location={postItem.location}
          detailUrl={'/feeddetail?itemID=' + postItem.postID}
        />
      </div>
    );
  }
}

export default PostIReply;
