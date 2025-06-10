import React from 'react';
import createLinksForMessage from 'src/utils/createLinksForMessage';
import { MSGTYPES } from '../../constants';
import { formatInboxItem } from '../../util';
import BaseMessageComponent from '../baseComponent/messageContent';

/**
 * 动态提到我的
 * @export
 * @class PostMention
 * @extends {React.Component}
 */
export default class PostMention extends React.Component {
  constructor(props) {
    super(props);

    if (
      props.inboxType === MSGTYPES.PostCommentMentionedUser ||
      props.inboxType === MSGTYPES.PostCommentMentionedGroup
    ) {
      // 动态回复 mentioned
      this.state = {
        ...this.mergeTopicState(false),
        ...this.mergeFromSourceState(false),
        // 获取createUser信息和typeName
        ...formatInboxItem(props),
      };
    } else if (props.inboxType === MSGTYPES.PostMentionedGroup || props.inboxType === MSGTYPES.PostMentionedUser) {
      // 动态直接 提到
      this.state = {
        ...this.mergeTopicState(true),
        ...this.mergeFromSourceState(true),
        // 获取createUser信息和typeName
        ...formatInboxItem(props),
      };
    }
  }
  /**
   * 获取 message的state, 直接动态中提到的消息 不从 comment中取数据
   * @param {any} fromPost
   * @returns
   * @memberof PostMention
   */
  mergeTopicState(fromPost) {
    const inboxItem = this.props;
    const createTime = inboxItem.createTime;
    let item = null,
      comments,
      commentsCount;
    if (fromPost) {
      // 动态直接提到我，从Post中取
      item = inboxItem.Post;
      comments = item.comments;
      commentsCount = parseInt(item.commentCount, 10);
    } else {
      // 动态回复提到我，从Post的第一条评论中取
      const {
        Post: {
          comments: [comment], // inbox显示的这一条
        },
      } = inboxItem;
      item = comment;
    }
    // 消息 @的人和群组 #话题
    const { message, rUserList, rGroupList, categories, attachments, postID, commentID, replyID, replyAccountId } =
      item;
    if (fromPost) {
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
        comments,
        commentsCount,
      };
    } else {
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
  }

  mergeFromSourceState(fromPost) {
    const inboxItem = this.props;
    const {
      Post: { postID, message, rUserList, rGroupList, categories },
    } = inboxItem;

    if (fromPost) {
      return {
        fromLink: '/feeddetail?itemID=' + postID,
      };
    } else {
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
      };
    }
  }

  renderAccessory() {
    if (
      this.props.inboxType !== MSGTYPES.PostCommentMentionedUser &&
      this.props.inboxType !== MSGTYPES.PostCommentMentionedGroup
    )
      return null;

    const inboxItem = this.props;
    const post = inboxItem.Post;

    switch (post.postType) {
      case 0:
        const medal = post.MedalPost,
          medalName = medal.MedalName,
          medalPath = medal.MedalPath,
          description = medal.MedalDescription,
          sendRemark = medal.SendRemark;
        return (
          <div className="mTop20 mBottom20 clearfix">
            <div className="Left">
              <img className="lazy" src={medalPath} />
            </div>
            <div>
              <p className="ThemeColor3 mTop20" style={{ 'font-size': '12px', 'line-height': '20px' }}>
                {medalName}
              </p>
              <p className={{ color: '#777', 'font-size': '12px', 'line-height': '20px' }}>{description}</p>
            </div>
          </div>
        );
        break;
      case 1:
        const { linkTitle, linkUrl, linkThumb, linkDesc } = post;
        return (
          <div>
            <a target="_blank" href={linkUrl} class="WordBreak">
              {linkTitle}
            </a>
            {linkThumb ? <img className="lazy" src={linkThumb} /> : null}
            {linkDesc ? <div className="mTop5 Gray">{linkDesc.toLowerCase()}</div> : null}
          </div>
        );
        break;
      case 4:
      case 7:
        const className = postType == 4 ? 'icon-qa' : 'icon-votenobg';
        const from = this.mergeFromSourceState();
        const fromLink = from.fromLink;

        return (
          <div className="messageDetailContainer">
            <div className="Left logoContainer">
              <i className={'Font24 Gray_9' + className}></i>
            </div>
            <div className="textContainer">{message.substring(0, 25) + (message.length > 25 ? '...' : '')}</div>
            <div class="viewDetail">
              <a target="_blank" href={fromLink} class="detailBtn boderRadAll_3">
                {_l('查看详情')}
              </a>
            </div>
          </div>
        );
        break;
      default:
        break;
    }
  }

  render() {
    return <BaseMessageComponent {...this.state}>{this.renderAccessory()}</BaseMessageComponent>;
  }
}
