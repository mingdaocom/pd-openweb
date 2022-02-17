import './feeddetail.css';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import qs from 'query-string';
import { navigateTo } from 'src/router/navigateTo';
import LoadDiv from 'ming-ui/components/LoadDiv';
import ScrollView from 'ming-ui/components/ScrollView';
import { changePostDetailId, clearPostDetail } from './redux/postDetailActions';
import PostDetails from '../components/post/postDetails/postDetails';

@connect(state => ({
  postItem: state.post.postsById[state.postDetail.postId],
  error: state.postDetail.errors[state.postDetail.postId],
}))
export default class FeedDetailEntrypoint extends Component {
  componentDidMount() {
    $('html').addClass('AppFeed AppFeedDetail');

    this.handleQueryChange(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.location.search !== nextProps.location.search) {
      this.handleQueryChange(nextProps);
    }
  }
  componentWillUnmount() {
    $('html').removeClass('AppFeed AppFeedDetail');
    this.props.dispatch(clearPostDetail());
  }

  handleQueryChange(props) {
    const data = qs.parse(props.location.search.slice(1));
    const { itemID, knowledgeId, knowledgeID, projectId } = data;
    if (!itemID) {
      navigateTo('/feed', true);
    }

    props.dispatch(changePostDetailId(itemID, knowledgeId || knowledgeID, projectId));
  }
  renderError() {
    return (
      <div className="TxtCenter mTop20 Feeddetail">
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <div>
          <i className="icon-task-folder-message Font56 Feeddetail-errorIcon" />
        </div>
        <div className="Font18 mTop20 Gray">{this.props.error}</div>
        <br />
        <br />
        <br />
      </div>
    );
  }
  renderPostDetail() {
    return this.props.postItem ? (
      <PostDetails postItem={this.props.postItem} />
    ) : (
      <div className="TxtCenter TxtMiddle mTop10 mBottom10 w100">
        <LoadDiv />
      </div>
    );
  }
  render() {
    return (
      <ScrollView className="relativeContainer">
        <div id="postDetail" className={this.props.error ? 'card' : ''}>
          {this.props.error ? this.renderError() : this.renderPostDetail()}
        </div>
      </ScrollView>
    );
  }
}
