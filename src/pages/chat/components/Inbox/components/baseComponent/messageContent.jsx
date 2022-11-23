import React from 'react';
import 'src/components/emotion/emotion';
import PropTypes from 'prop-types';
import UploadFile from 'src/components/UploadFiles';
import Avatar from './avatar';
import UserLink from './userLink';
import Star from './star';
import ReplyTo from './replyTo';
import CommentArea from './commentArea';
import { SOURCE_TYPE } from '../../constants';
import { cutStringWithHtml } from 'src/util';
import xss from 'xss';

export default class BaseMessageComponent extends React.Component {
  static propTypes = {
    isFavorite: PropTypes.oneOf(['0', '1']),

    typeName: PropTypes.string,
    fullname: PropTypes.string,
    accountId: PropTypes.string,

    message: PropTypes.string,
    sourceId: PropTypes.string,
    replyId: PropTypes.string,
    attachments: PropTypes.array,
    isDeleted: PropTypes.bool,
    canReply: PropTypes.bool,
    // 提到我的动态，评论数据
    comments: PropTypes.array,
    commentsCount: PropTypes.number,
  };

  static defaultProps = {
    isDeleted: false,
    canReply: true,
  };

  constructor(props) {
    super(props);
    const { message } = props;
    const partMsg = cutStringWithHtml(message, 600, 12);
    const remainingMsg = message.replace(partMsg, '');
    if (remainingMsg.length) {
      this.state = {
        showBtn: true,
        expanded: false,
        partMsg,
      };
    } else {
      this.state = {
        showBtn: false,
        expanded: true,
      };
    }
  }

  renderAvatar() {
    const { fullname, accountId, avatar, inboxType } = this.props;
    return (
      <div className="Left">
        <Avatar {...{ fullname, accountId, avatar, inboxType }} />
      </div>
    );
  }

  renderStar() {
    const { isFavorite, inboxId } = this.props;
    return <Star {...{ isFavorite, inboxId }} />;
  }

  renderMsgHeader() {
    const { typeName, fullname, accountId, sourceId, sourceType, replyId } = this.props;
    return (
      <div>
        <UserLink {...{ fullname, accountId }} />
        <span className="mLeft5">{typeName}</span>
        {replyId ? <ReplyTo {...{ sourceId, replyId, sourceType }} /> : null}
        <span>:</span>
        {this.renderStar()}
      </div>
    );
  }

  renderMessage() {
    const { message } = this.props;
    const { showBtn, expanded, partMsg } = this.state;
    if (showBtn) {
      return expanded ? (
        <span className="LineHeight25 WordBreak">
          <span dangerouslySetInnerHTML={{ __html: message }} />
          <a
            href="javascript:void(0);"
            onClick={() => {
              this.setState({ expanded: false });
            }}
          >
            {_l('收起')}
          </a>
        </span>
      ) : (
        <span className="LineHeight25 WordBreak">
          <span dangerouslySetInnerHTML={{ __html: partMsg }} />
          <a
            href="javascript:void(0);"
            onClick={() => {
              this.setState({ expanded: true });
            }}
          >
            {_l('更多...')}
          </a>
        </span>
      );
    } else {
      if (message) {
        return <span className="LineHeight25 WordBreak" dangerouslySetInnerHTML={{ __html: message }} />;
      } else {
        return <span className="LineHeight25 Gray_c">{_l('该评论已被删除')}</span>;
      }
    }
  }

  renderAttachments() {
    const { attachments } = this.props;
    return attachments && attachments.length ? (
      <div className="mTop5">
        <UploadFile isUpload={false} attachmentData={attachments} />
      </div>
    ) : null;
  }

  renderSourceFrom() {
    const { fromLink, fromMessage, fromTitle, sourceId } = this.props;
    if (!fromTitle) return null;
    const msg = $('<span>').html(xss(fromMessage)).text();
    return (
      <div className="mTop5 comeFrom">
        {sourceId ? (
          <a className="fromLink" target="_blank" href={fromLink} data-title={fromTitle}>
            <span className="sourceName Font12" title={msg}>
              {msg}
            </span>
          </a>
        ) : (
          <span className="fromLink cursorDefault" data-title={fromTitle}>
            <span className="sourceName Font12" title={msg}>
              {msg}
            </span>
          </span>
        )}
      </div>
    );
  }

  renderCreateTime() {
    const { fromLink, createTime, sourceId } = this.props;
    return (
      <div className="mTop10 pBottom10">
        {sourceId ? (
          <a href={fromLink} target="_blank" className="Gray_a NoUnderline">
            {createTime}
          </a>
        ) : (
          <span className="Gray_a">{createTime}</span>
        )}
      </div>
    );
  }

  renderCommentArea() {
    const { isDeleted, canReply, fromLink } = this.props;
    const { sourceId, sourceType, discussionId, extendsId, name, projectId, accountId, fullname, avatar } = this.props;
    if (isDeleted) return null;
    if (canReply) {
      const { comments, commentsCount } = this.props;
      const props = {
        commentsProps: {
          comments,
          commentsCount,
        },
        params: {
          sourceId,
          sourceType,
          discussionId,
          extendsId,
          name,
          projectId: projectId || '',
          createAccount: {
            avatar,
            fullname,
            accountId,
          },
        },
      };
      return <CommentArea {...props} />;
    } else {
      switch (sourceType) {
        case SOURCE_TYPE.TASK:
          return (
            <div>
              <a href={fromLink} target="_blank">
                {_l('点击这里')}
              </a>
              <span className="Gray_9 mLeft5">{_l('申请任务查看和回复权限')}</span>
            </div>
          );
        case SOURCE_TYPE.FOLDER:
          return (
            <div>
              <a href={fromLink} target="_blank">
                {_l('点击这里')}
              </a>
              <span className="Gray_9 mLeft5">{_l('申请项目查看和回复权限')}</span>
            </div>
          );
        default:
          return <div className="Gray_9">{_l('没有回复权限')}</div>;
      }
    }
  }

  render() {
    return (
      <div className="messageItem">
        {this.renderAvatar()}
        <div className="itemMain">
          <div className="msgMainContent">
            {this.renderMsgHeader()}
            <div className="mTop5">{this.renderMessage()}</div>
            {this.renderAttachments()}
            {this.props.children ? this.props.children : null}
            {this.renderSourceFrom()}
            {this.renderCreateTime()}
            {this.renderCommentArea()}
          </div>
        </div>
      </div>
    );
  }
}
