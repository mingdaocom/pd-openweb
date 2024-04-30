import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import { LoadDiv, UserName } from 'ming-ui';
import postAjax from 'src/api/post';
import { loadMoreComments } from '../../../redux/postActions';
import { connect } from 'react-redux';
import PostComment from './postComment';
import PostCommentInput from './postCommentInput';

/**
 * 动态回复列表
 */
class PostCommentList extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    postItem: PropTypes.object.isRequired,
    defaultCount: PropTypes.number, // 默认呈现回复条数
    focusCommentBox: PropTypes.bool, // 是否自动聚焦
    showLikedUsers: PropTypes.bool, // 是否显示点赞的人
    isPostDetail: PropTypes.bool, // 是否动态详情页
  };

  constructor(props) {
    super(props);
    const postItem = props.postItem;
    const defaultCount = props.defaultCount;
    const totalCount = parseInt(postItem.commentCount, 10);

    this.state = {
      isExpand:
        (postItem.comments && postItem.comments.length === totalCount) || (defaultCount && totalCount <= defaultCount),
      loading: false,
    };
  }

  componentDidMount() {
    if (this.props.showLikedUsers && !this.state.likedUsers) {
      this.fetchLikedUsers();
    }
  }

  componentWillReceiveProps(nextProps) {
    const postItem = nextProps.postItem;
    const defaultCount = nextProps.defaultCount;
    const totalCount = parseInt(postItem.commentCount, 10);
    const isExpand =
      (postItem.comments && postItem.comments.length === totalCount) || (defaultCount && totalCount <= defaultCount);
    this.setState({
      isExpand,
      loading: false,
      likedUsers:
        postItem.postID === this.props.postItem.postID && postItem.likeCount === this.props.postItem.likeCount
          ? this.state.likedUsers
          : null,
    });
  }

  componentDidUpdate() {
    if (this.props.showLikedUsers && !this.state.likedUsers) {
      this.fetchLikedUsers();
    }
  }

  fetchLikedUsers = () => {
    postAjax.getLikeUsers({ postID: this.props.postItem.postID }).then(likedUsers => {
      this.setState({ likedUsers });
    });
  };

  toggleViewAll = () => {
    let isExpand = this.state.isExpand;
    isExpand = !isExpand;
    this.setState({ loading: true });
    this.props.dispatch(loadMoreComments(this.props.postItem.postID));
  };

  render() {
    const postItem = this.props.postItem;
    const totalCount = parseInt(postItem.commentCount, 10);
    const comments = postItem.comments || [];
    const count =
      this.state.isExpand || !this.props.defaultCount
        ? comments.length
        : _.min([this.props.defaultCount, comments.length]);
    const commentElements = _(comments)
      .slice(0, count)
      .map((c, i) => (
        <PostComment
          last={i === count - 1 && this.state.isExpand}
          key={c.commentID}
          commentItem={c}
          categories={postItem.categories}
          projectIds={postItem.projectIds}
        />
      ))
      .value();
    return (
      <div className="commentListContainer fadeIn ani600">
        {this.props.showLikedUsers && this.state.likedUsers && this.state.likedUsers.length ? (
          <div className="likedUsers">
            {_.map(this.state.likedUsers, (user, i) => (
              <span key={user.accountId}>
                <UserName key={user.accountId} user={user} />
                {i === this.state.likedUsers.length - 1 ? undefined : '、'}
              </span>
            ))}
            <span>{_l('赞了此条')}</span>
          </div>
        ) : undefined}
        <PostCommentInput
          postItem={postItem}
          focus={this.props.focusCommentBox}
          isPostDetail={this.props.isPostDetail}
        />
        {!!commentElements.length && <ul className="commentList">{commentElements}</ul>}
        {(() => {
          if (totalCount) {
            if (this.state.loading) {
              return <LoadDiv className="pBottom15 pTop5" />;
            }
            if (!(this.state.isExpand || totalCount - count <= 0)) {
              return (
                <a className="loadMoreComments" onClick={this.toggleViewAll}>
                  {_l('展开其余 %0 条回复', totalCount - count)}
                  &nbsp;
                  <i className="icon-arrow-down-border" />
                </a>
              );
            }
          }
        })()}
      </div>
    );
  }
}

export default connect(state => ({}))(PostCommentList);
