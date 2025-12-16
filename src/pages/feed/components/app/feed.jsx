import React from 'react';
import PropTypes from 'prop-types';
import { ScrollView } from 'ming-ui';
import FeedLeftNav from '../feed/feedLeftNav';
import { PostList } from '../post';
import { TopPostList } from '../post/topPostList';
import { Updater } from '../updater';
import './feed.css';
import './style.css';

class Feed extends React.Component {
  static propTypes = {
    defaultExpandedGroup: PropTypes.array, // 群组加入 store
  };

  render() {
    return (
      <ScrollView className="feedApp clearfix feedAppScroll" scrollContentClassName="feedAppScrollContent">
        <div className="mdLeftNav feedLeftNav ThemeBG  feedLeftNavGlass" />
        <FeedLeftNav defaultGroups={this.props.defaultExpandedGroup} />
        <div className="left feedContainer relative">
          <div className="contentLeft clearfix">
            <div className="feedContainerMain Left">
              <Updater />
              <TopPostList />
              <PostList />
            </div>
          </div>
        </div>
      </ScrollView>
    );
  }
}

export default Feed;
