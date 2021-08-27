import React from 'react';
import BaseMessageComponent from '../baseComponent/messageContent';

import { createLinksForMessage } from 'mdFunction';
import { formatInboxItem } from '../../util';

/**
 * 动态回复我的
 * @export
 * @class PostReply
 * @extends {React.Component}
 */
export default class PostReply extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ...this.mergeTopicState(),
      ...this.mergeFromSourceState(),
      // 获取createUser信息和typeName
      ...formatInboxItem(props),
    }
  }

  mergeTopicState() {
    const inboxItem = this.props;
    const { Post: {
      comments: [comment], // inbox显示的这一条
    }, createTime } = inboxItem;
    // 消息 @的人和群组 #话题
    const {
      message,
      rUserList,
      rGroupList,
      categories,
      attachments,
      postID,
      commentID,
      replyID,
      replyAccountId,
    } = comment;
    // 转成html
    return {
      message: createLinksForMessage({
        message: message || '',
        rUserList,
        rGroupList,
        categories,
      }),
      attachments,
      createTime,
      sourceId: postID,
      discussionId: commentID,
      replyId: replyID,
      replyAccountId,
    };
  }

  mergeFromSourceState() {
    const inboxItem = this.props;
    const { Post: {
      postID,
      message,
      rUserList,
      rGroupList,
      categories,
    } } = inboxItem;
    // source
    const fromMessage = createLinksForMessage({
      message: message || '',
      rUserList,
      rGroupList,
      categories,
    });

    return {
      fromMessage,
      fromTitle: _l('来自动态'),
      fromLink: '/feeddetail?itemID=' + postID,
    }
  }

  render() {
    return (
      <BaseMessageComponent
        {...this.state}
      />
    )
  }
}
