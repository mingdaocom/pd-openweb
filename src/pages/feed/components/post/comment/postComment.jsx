import React from 'react';
import cx from 'classnames';
import roleController from 'src/api/role';
import { removeComment } from '../../../redux/postActions';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PostMain from '../post/postMain';
import PostFooter from '../post/postFooter';
import PostCommentInput from './postCommentInput';
import UploadFiles from 'src/components/UploadFiles';
import { Dialog, UserHead } from 'ming-ui';
import { checkPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';

/**
 * 动态的单条回复
 */
class PostComment extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    className: PropTypes.string,
    last: PropTypes.bool,
    commentItem: PropTypes.object.isRequired,
    categories: PropTypes.array,
    projectIds: PropTypes.array,
  };

  constructor(props) {
    super(props);
    const { commentItem } = props;

    this.state = {
      allowOperate:
        commentItem && (commentItem.allowOperate || commentItem.user.accountId === md.global.Account.accountId),
      leaving: false,
      checkIsProjectAdmin: false,
      commentBox: {
        el: null,
        show: false,
      },
    };
  }

  handleMouseEnter = () => {
    if (this.state.allowOperate || this.state.checkIsProjectAdmin) return;
    const { projectIds } = this.props;
    if (!projectIds || !projectIds.length) return;

    Promise.all(projectIds.map(projectId => checkPermission(projectId, PERMISSION_ENUM.MANAGE_TREND))).then(results => {
      if (!results.some(result => !result)) {
        this.setState({ allowOperate: true });
      }

      this.setState({ checkIsProjectAdmin: true });
    });
  };

  clearCommentBox = () => {
    this.setState({ commentBox: { el: null, show: false } });
  };

  handleToggleCommentBox = () => {
    const commentBox = this.state.commentBox;
    if (!commentBox.el) {
      commentBox.el = <PostCommentInput focus postItem={this.props.commentItem} onPublished={this.clearCommentBox} />;
    }
    commentBox.show = !commentBox.show;
    this.setState({ commentBox });
  };

  handleRemoveComment = () => {
    const { commentItem, dispatch } = this.props;
    Dialog.confirm({
      width: 420,
      title: _l('确认删除此条回复') + '?',
      buttonType: 'primary',
      onOk: () => {
        const deleteAttachment = $(`#isDeleteAttachmentOf${commentItem.commentID}`).prop('checked');
        this.clearCommentBox();
        dispatch(removeComment(commentItem.postID, commentItem.commentID));
      },
    });
  };

  componentWillLeave = cb => {
    this.setState({ leaving: true });
    setTimeout(cb, 400);
  };

  render() {
    const { categories } = this.props;
    const commentItem = Object.assign({ categories }, this.props.commentItem);
    if (categories && categories.length && commentItem.message && commentItem.message.indexOf('#') !== -1) {
      categories.forEach(cat => {
        commentItem.message = commentItem.message.replace(`#${cat.catName}#`, `[cid]${cat.catID}[/cid]`);
      });
    }

    return (
      <li
        className={cx(
          this.props.className,
          'commentContainer ani400',
          { last: this.props.last },
          this.state.leaving ? 'fadeOut aniFill' : 'fadeIn',
        )}
        onMouseEnter={() => this.handleMouseEnter()}
      >
        <UserHead
          className="userHead left"
          user={{ ...commentItem.user, userHead: commentItem.user.userMiddleHead }}
          size={28}
        />

        <PostMain postItem={commentItem} inlineMessage minHeight={0} />

        {!!(commentItem.attachments && commentItem.attachments.length) && (
          <div className="commentAttachments mTop10">
            <UploadFiles isUpload={false} attachmentData={commentItem.attachments} />
          </div>
        )}

        <PostFooter
          createTime={commentItem.createTime}
          source={commentItem.source}
          location={commentItem.location}
          detailUrl={'/feeddetail?itemID=' + commentItem.postID}
        >
          {this.state.allowOperate ? (
            <a className="mRight10 commentDeleteLink hide" onClick={this.handleRemoveComment}>
              {_l('删除')}
            </a>
          ) : undefined}
          <a className="" onClick={this.handleToggleCommentBox}>
            {_l('回复')}
          </a>
        </PostFooter>
        {this.state.commentBox.show ? this.state.commentBox.el : undefined}
        {this.props.last ? undefined : <hr className="commentSpliter" />}
      </li>
    );
  }
}

export default connect(state => ({}))(PostComment);
