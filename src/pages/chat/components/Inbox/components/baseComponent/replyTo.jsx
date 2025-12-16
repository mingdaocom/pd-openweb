import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Tooltip } from 'ming-ui/antd-components';
import LoadDiv from 'ming-ui/components/LoadDiv';
import DiscussionController from 'src/api/discussion';
import PostController from 'src/api/post';
import { SOURCE_TYPE } from '../../constants';

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
      loading: false,
    };
  }

  componentWillUnmount() {
    this.abortRequest();
  }

  abortRequest() {
    if (this.ajax && this.ajax.abort) {
      this.ajax.abort();
    }
  }

  fetchReplyMsg() {
    if (this.state.replayMsg || this.state.loading) return false;
    const { sourceType, sourceId, replyId } = this.props;
    const callback = msg => {
      this.setState({
        replayMsg: msg,
        loading: false,
      });
    };
    this.setState({ loading: true });
    if (sourceType === SOURCE_TYPE.POST) {
      this.ajax = PostController.getReplyMessage({
        commentID: replyId,
        postID: sourceId,
      });

      this.ajax.then(function (data) {
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
      this.ajax.then(function (result) {
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
      <Tooltip title={this.state.replayMsg || <LoadDiv />} type="white" mouseEnterDelay={0.3}>
        <i
          className="mLeft2 mRight2 ThemeColor4 icon-replyto Hand ThemeColor4"
          onMouseOver={this.fetchReplyMsg.bind(this)}
        />
      </Tooltip>
    );
  }
}
