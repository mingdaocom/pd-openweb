import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import LoadDiv from 'ming-ui/components/LoadDiv';
import postEnum from '../../../constants/postEnum';
import { focusUpdater, loadMore } from '../../../redux/postActions';
import PostBody from '../post/postBody';
import PostCard from '../post/postCard';
import PostIReply from '../post/postIReply';
import { HomePostFilter } from '../postListHead';
import PostMoreLoader from './postLoader';
import './postList.css';

class PostList extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    postIds: PropTypes.arrayOf(PropTypes.string),
    postsById: PropTypes.object,
    fontSize: PropTypes.number,
    loading: PropTypes.bool,
    disableLoadMore: PropTypes.bool,
    hasMore: PropTypes.bool,
    loadingMore: PropTypes.bool,
    options: PropTypes.shape({
      listType: PropTypes.string,
      postType: PropTypes.number,
      keywords: PropTypes.string,
      accountId: PropTypes.string,
    }),
  };

  componentWillUnmount() {
    delete window.feedSelectDate;
    delete window.feedCustomDate;
  }

  // 上级触发 dispatch
  // componentDidMount() {
  //   if (!this.props.postIds.length) this.props.dispatch(loading());
  //   this.props.dispatch(reload());
  // }
  render() {
    const postList =
      this.props.options.listType === 'ireply'
        ? _.chain(this.props.ireplyPostIds)
            .map(id => this.props.ireplyPostsById[id])
            .compact()
            .value()
        : _.chain(this.props.postIds)
            .map(id => this.props.postsById[id])
            .compact()
            .value();
    const header = <HomePostFilter />;

    const commonProps = {
      style: { fontSize: this.props.fontSize },
      component: 'li',
      leavingAnimation: {
        css: 'ani400 aniFill zoomOutRight',
        timeout: 400,
      },
    };
    let posts;
    const emptyStatus =
      this.props.options.keywords || (this.props.options.postType && this.props.options.postType !== -1)
        ? 'search'
        : this.props.options.listType === postEnum.LIST_TYPE.fav
          ? 'star'
          : 'normal';
    if (this.props.loading) {
      posts = (
        <PostCard key={0} {...commonProps}>
          {header}
          <LoadDiv size="big" className="pTop20 pBottom20" />
        </PostCard>
      );
    } else if (!postList || !postList.length) {
      posts = (
        <PostCard key={0} {...commonProps}>
          {header}
          <div className={'feedNoData ' + emptyStatus}>
            <div className="focusUpdaterCon InlineBlock" onClick={() => this.props.dispatch(focusUpdater())}>
              <div className="iconCon">
                <span className="statusIcon" />
              </div>
              {this.props.options.accountId && this.props.options.accountId !== md.global.Account.accountId ? (
                <p>暂无可见动态</p>
              ) : (
                <p>
                  {
                    {
                      star: _l('无星标动态'),
                      search: _l('无匹配结果'),
                      normal: '',
                    }[emptyStatus]
                  }
                  <span className="hide">
                    {_l('与团队开放沟通，共享信息')} <br />
                    {_l('快去发表动态吧~')}
                  </span>
                </p>
              )}
            </div>
          </div>
        </PostCard>
      );
    } else {
      posts = this.props.loading
        ? undefined
        : postList.map((postItem, i) => (
            <PostCard
              key={postItem.commentID || postItem.postID}
              {...commonProps}
              className={i !== 0 && postItem._fresh ? 'fadeIn ani' : ''}
            >
              {i === 0 ? header : undefined}
              {postItem.isIReply ? (
                <PostIReply postItem={postItem} />
              ) : (
                <PostBody keywords={this.props.options.keywords} postItem={postItem} />
              )}
            </PostCard>
          ));
    }

    return (
      <div className="postList">
        <ul>{posts}</ul>
        <PostMoreLoader
          className={this.props.hasMore ? undefined : 'hide'}
          loading={this.props.loadingMore}
          onClick={this.props.loadingMore ? undefined : () => this.props.dispatch(loadMore())}
        />
      </div>
    );
  }
}

export default connect(state => state.post)(PostList);
