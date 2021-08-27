import React from 'react';
import store from 'redux/configureStore';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { addSuccess } from '../../../redux/postActions';
import PostCard from '../post/postCard';
import PostBody from '../post/postBody';

import '../../app/feed.css';
import '../../app/style.css';
import './detailStyle.css';

class PostDetails extends React.Component {
  static propTypes = {
    postItem: PropTypes.object,
    onRemove: PropTypes.func,
  };

  state = { postItem: this.props.postItem };

  componentDidMount() {
    this._mounted = true;
    if (this.props.postItem) {
      store.dispatch(addSuccess(this.props.postItem, false));
      this.listenToRemove(this.props.postItem.postID);
    }
    this.unsubscribeOnUpdate = store.subscribe(() => {
      if (this._mounted && this.props.postItem) {
        const { post } = store.getState();
        this.setState({ postItem: post.postsById[this.props.postItem.postID] });
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.postItem) {
      this.listenToRemove(nextProps.postItem.postID);
    }
  }

  componentWillUnmount() {
    this._mounted = false;
    this.unsubscribeOnUpdate();
  }

  listenToRemove = (postId) => {
    const { onRemove } = this.props;
    if (this.onRemoveListener) {
      store.emitter.removeListener('POST_REMOVE_SUCCESS', this.onRemoveListener);
      delete this.onRemoveListener;
    }
    this.onRemoveListener = function (action) {
      if (action.postId === postId) {
        if (onRemove) {
          onRemove(postId);
        } else {
          setTimeout(() => {
            window.location = '/feed';
          }, 3000);
        }
      }
    };
    store.emitter.addListener('POST_REMOVE_SUCCESS', this.onRemoveListener);
  };

  render() {
    if (!this.state.postItem) {
      return (
        <div>
          <div className="TxtCenter mTop20 Feeddetail">
            <br />
            <div>
              <i className="icon-task-folder-message Font56 postDetail-errorIcon" />
            </div>
            <div className="Font18 mTop20 Gray">{_l('您的权限不足或此动态已被删除，无法查看')}</div>
            <br />
            <br />
            <br />
          </div>
        </div>
      );
    }

    return (
      <Provider store={store}>
        <div>
          <PostCard>
            <PostBody postItem={this.state.postItem} isPostDetail />
          </PostCard>
        </div>
      </Provider>
    );
  }
}

module.exports = PostDetails;
