import React from 'react';
import PropTypes from 'prop-types';
import { SOURCE_TYPE } from '../../constants';
import ToolTip from 'ming-ui/components/Tooltip';
import LoadDiv from 'ming-ui/components/LoadDiv';

const DiscussionController = require('src/api/discussion');
const PostController = require('src/api/post');

export default class ReplyTo extends React.Component {
  static propTypes = {
    sourceType: PropTypes.oneOf(_.values(SOURCE_TYPE)),

    sourceId: PropTypes.string,
    replyId: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      binded: false,
      replayMsg: null,
      loading: false
    };
  }

  componentWillUnmount() {
    this.abortRequest();
  }

  abortRequest() {
    if (this.ajax && this.ajax.state() === 'pending' && this.ajax.abort) {
      this.ajax.abort();
    }
  }

  fetchReplyMsg() {
    if (this.state.replayMsg || this.state.loading) return false;
    const { sourceType, sourceId, replyId } = this.props;
    const callback = msg => {
      this.setState({
        replayMsg: msg,
        loading: false
      });
    };
    this.setState({ loading: true });
    if (sourceType === SOURCE_TYPE.POST) {
      this.ajax = PostController.getReplyMessage({
        commentID: replyId,
        postID: sourceId,
      });

      this.ajax.done(function(data) {
        var message = data.Message;
        if (message) {
          callback(message);
        } else {
          callback(_l('内容已删除'));
        }
      });
    } else {
      this.ajax = DiscussionController.getDiscussionMsg({
        discussionId: replyId,
        sourceType,
      });
      this.ajax.done(function(result) {
        if (result.code) {
          callback(result.data);
        } else {
          callback(_l('内容已删除'));
        }
      });
    }
  }

  render() {
    return (
      <ToolTip text={this.state.replayMsg ? <span>{this.state.replayMsg}</span> : <LoadDiv />} themeColor={'white'}>
        <i className="mLeft2 mRight2 ThemeColor4 icon-replyto Hand ThemeColor4" onMouseOver={this.fetchReplyMsg.bind(this)} />
      </ToolTip>
    );
  }
}
