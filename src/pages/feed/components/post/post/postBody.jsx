import PropTypes from 'prop-types';
import React from 'react';
import ReactDom from 'react-dom';
import _ from 'lodash';
import cx from 'classnames';
import UserHead from 'src/components/userHead';
import postEnum from '../../../constants/postEnum';
import { addFavorite, removeFavorite, addLike, removeLike } from '../../../redux/postActions';
import { connect } from 'react-redux';
import PostUsernameGroup from './postUsernameGroup';
import PostMain from './postMain';
import PostFooter from './postFooter';
import { navigateTo } from 'src/router/navigateTo';
import PostCommentList from '../comment/postCommentList';
import PostOperator from './postOperator';

/**
 * 动态卡片内部内容, 包括动态、相应类型动态的附加信息、操作项、回复/标签等
 */
class PostBody extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    postItem: PropTypes.object.isRequired,
    keywords: PropTypes.string,
    isSummary: PropTypes.bool,
    isShowOperate: PropTypes.bool,
    isPostDetail: PropTypes.bool, // 是否动态详情页
    className: PropTypes.string,
  };

  state = {
    selectedOperation: !this.props.isSummary ? postEnum.OPERATE_TYPE.comment : undefined,
    changeJoinOpera: false,
  };

  setTriangleStyle = el => {
    const $el = $(el);
    let button;
    if (this.state.selectedOperation === postEnum.OPERATE_TYPE.comment) {
      button = ReactDom.findDOMNode(this.commentButton);
      if (!button) {
        return;
      }
    } else {
      return;
    }

    const $button = $(button);
    const $buttonWrapper = $button.offsetParent();
    const $op = $buttonWrapper.offsetParent();
    // const triangleMarginRight = $op.width()
    //   - (parseInt($op.css('padding-left'), 10) || 0)
    //   - $buttonWrapper.position().left
    //   - ($button.width() / 2)
    //   + ((parseInt($el.css('border-bottom-width'), 10) || 0) / 2);
    const triangleMarginRight =
      $op.width() -
      $buttonWrapper.position().left -
      $button.position().left -
      $button.width() / 2 +
      (parseInt($el.css('border-bottom-width'), 10) || 0) / 2;
    $el.css({ marginRight: triangleMarginRight });
  };

  toggleLike = () => {
    const { dispatch } = this.props;
    if (this.props.postItem.liked) {
      dispatch(removeLike({ postId: this.props.postItem.postID }));
    } else {
      dispatch(addLike({ postId: this.props.postItem.postID }));
    }
  };

  toggleCommentBox = () => {
    if (this.state.selectedOperation === postEnum.OPERATE_TYPE.comment) {
      this.setState({
        selectedOperation: undefined,
      });
      return;
    }
    this.setState({
      selectedOperation: postEnum.OPERATE_TYPE.comment,
      focusCommentBox: true,
      showLikedUsers: false,
    });
  };

  toggleJoinOperator = () => {
    if (!this.state.changeJoinOpera) {
      this.setState({
        changeJoinOpera: true,
      });
      return;
    }

    this.setState({ changeJoinOpera: false });
  };

  showLikedUsers = () => {
    this.setState({
      selectedOperation: postEnum.OPERATE_TYPE.comment,
      showLikedUsers: !this.state.showLikedUsers,
    });
  };

  handleFavorite = () => {
    this.props.dispatch(addFavorite({ postId: this.props.postItem.postID }));
  };

  handleRemoveFavorite = () => {
    this.props.dispatch(removeFavorite({ postId: this.props.postItem.postID }));
  };

  gotoPostDetail = () => {
    navigateTo(`/feeddetail?itemID=${this.props.postItem.postID}`);
  };

  render() {
    const postItem = this.props.postItem;
    if (!postItem) {
      return false;
    }

    const { commentCount } = postItem;

    let viewDetail;
    if (this.props.isSummary) {
      viewDetail = (
        <a href={'/feeddetail?itemID=' + postItem.postID} className="topPostViewDetailLink">
          {(() => {
            switch (postItem.postType) {
              case '1':
                return _l('查看链接详情');
              case '7':
                return _l('查看投票详情');
              case '8':
                return _l('查看音视频详情');
              case '2':
              case '3':
              case '9':
                return _l('查看附件详情');
              default:
                return _l('查看动态详情');
            }
          })() + ' >'}
        </a>
      );
    }

    return (
      <div className={cx('postContainer', this.props.className)} data-post-id={postItem.postID}>
        <UserHead className="userHead left" user={postItem.user} size={46} />
        <div className="userMain">
          <PostUsernameGroup className="userNameGroup" postItem={postItem} />
          <PostOperator postItem={postItem} isShowOperate={this.props.isShowOperate} />
          <PostMain postItem={postItem} keywords={this.props.keywords} isSummary={this.props.isSummary}>
            {(() => {
              if (postItem.rPostisDelete) {
                return (
                  <div className="rPostItem">
                    <div className="rPostItemTriangle" />
                    {_l('原动态已被删除')}
                  </div>
                );
              } else if (postItem.rPostItem) {
                let rPostItem = postItem.rPostItem;
                if (parseInt(rPostItem.postType, 10) === 8) {
                  // 音视频的详情被写在主动态里了
                  rPostItem = _.assign({}, rPostItem, {
                    documentID: postItem.documentID,
                    isFollowed: postItem.isFollowed,
                    ThumbUrl: postItem.ThumbUrl,
                    allowDown: postItem.allowDown,
                  });
                }
                return (
                  <div className="rPostItem">
                    <div className="rPostItemTriangle" />
                    <UserHead className="userHead left" user={rPostItem.user} size={34} />
                    <PostUsernameGroup className="userNameGroup" postItem={rPostItem} />
                    <PostMain postItem={rPostItem} isReshare />
                    <PostFooter
                      createTime={rPostItem.createTime}
                      updateTime={rPostItem.updateTime}
                      location={rPostItem.location}
                      source={rPostItem.source}
                      detailUrl={'/feeddetail?itemID=' + rPostItem.postID}
                    />
                  </div>
                );
              }
            })()}
          </PostMain>
        </div>

        {this.props.isSummary && viewDetail}

        <PostFooter
          createTime={postItem.createTime}
          updateTime={postItem.updateTime}
          source={postItem.source}
          location={postItem.location}
          detailUrl={'/feeddetail?itemID=' + postItem.postID}
          showFullCompanyName={this.props.isSummary}
        >
          <span
            className={cx(
              'postActionIcon ThemeBorderColor5 Hand',
              this.state.selectedOperation === postEnum.OPERATE_TYPE.comment ? 'ThemeColor3' : 'ThemeColor4',
            )}
            onClick={this.props.isSummary ? this.gotoPostDetail : this.toggleCommentBox}
            data-tip={_l('回复')}
          >
            <i
              ref={commentButton => {
                this.commentButton = commentButton;
              }}
              className={'icon-replyto'}
            />
            <span>{commentCount || 0}</span>
            {this.state.selectedOperation === postEnum.OPERATE_TYPE.comment && (
              <div className="commentListContainerTriangle" />
            )}
          </span>

          {!postItem.Secretary && postItem.user ? (
            <span className={cx('postActionIcon ThemeBorderColor5', postItem.liked ? 'ThemeColor3' : 'ThemeColor4')}>
              <span data-tip={postItem.liked ? _l('取消点赞') : _l('点赞')}>
                <i className={cx('Hand icon-some-praise')} onClick={this.toggleLike} />
              </span>
              {postItem.likeCount ? (
                <span
                  className="Hand"
                  data-tip={_l('点赞人员')}
                  onClick={this.props.isSummary ? this.gotoPostDetail : this.showLikedUsers}
                >
                  {postItem.likeCount}
                </span>
              ) : (
                false
              )}
            </span>
          ) : undefined}
          <div
            className={cx(
              'postActionIcon ThemeBorderColor5 Hand postOperatorFavBtn',
              this.props.postItem.isFav ? 'favorited' : 'ThemeColor4',
            )}
            onClick={this.props.postItem.isFav ? this.handleRemoveFavorite : this.handleFavorite}
            ref={favBtn => {
              this.favBtn = favBtn;
            }}
            data-tip={this.props.postItem.isFav ? _l('取消收藏') : _l('收藏')}
          >
            <i className="icon-task-star Hand" />
          </div>
        </PostFooter>

        {this.state.selectedOperation === postEnum.OPERATE_TYPE.comment ? (
          <PostCommentList
            postItem={postItem}
            // setTriangleStyle={this.setTriangleStyle} // 该方法比较耗时，写到图标上看看效果
            isPostDetail={this.props.isPostDetail}
            focusCommentBox={this.state.focusCommentBox}
            showLikedUsers={this.state.showLikedUsers}
          />
        ) : undefined}
      </div>
    );
  }
}
export default connect(state => ({}))(PostBody);
