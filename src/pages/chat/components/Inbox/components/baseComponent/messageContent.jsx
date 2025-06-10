import React from 'react';
import { createRoot } from 'react-dom/client';
import PropTypes from 'prop-types';
import xss from 'xss';
import { whiteList } from 'xss/lib/default';
import { UserCard } from 'ming-ui';
import 'src/components/emotion/emotion';
import UploadFile from 'src/components/UploadFiles';
import { formatMsgDate } from 'src/pages/chat/utils';
import { cutStringWithHtml } from 'src/utils/common';
import { addBehaviorLog, dateConvertToUserZone } from 'src/utils/project';
import { SOURCE_TYPE } from '../../constants';
import Avatar from './avatar';
import CommentArea from './commentArea';
import ReplyTo from './replyTo';
import Star from './star';
import UserLink from './userLink';

const xssOptions = {
  whiteList: Object.assign({}, whiteList, { img: ['src', 'alt', 'title', 'width', 'height', 'class'] }),
};

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

  componentDidMount() {
    const { inboxId } = this.props;

    $(`.inboxBox .messageItem-${inboxId}`)
      .find('[data-accountid],[data-groupid]')
      .each((i, ele) => {
        if ($(ele).attr('bindUserCard')) return;
        $(ele).attr('bindUserCard', true);
        let accountId = $(ele).attr('data-accountid');
        let groupId = $(ele).attr('data-groupid');
        const root = createRoot(ele);

        root.render(
          <UserCard sourceId={accountId || groupId} type={groupId ? 2 : 1}>
            <span>{ele.innerHTML}</span>
          </UserCard>,
        );
      });
  }

  renderAvatar() {
    const { fullname, accountId, avatar, inboxType, appId } = this.props;

    return (
      <div className="Left">
        <Avatar {...{ fullname, accountId, avatar, inboxType, appId }} />
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
          <span dangerouslySetInnerHTML={{ __html: xss(message, xssOptions) }} />
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
          <span dangerouslySetInnerHTML={{ __html: xss(partMsg, xssOptions) }} />
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
        return (
          <span className="LineHeight25 WordBreak" dangerouslySetInnerHTML={{ __html: xss(message, xssOptions) }} />
        );
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
          <a
            className="fromLink"
            target="_blank"
            href={fromLink}
            data-title={fromTitle}
            onClick={() => {
              const worksheetId = sourceId.split('|')[0];
              const rowId = sourceId.split('|')[1];
              addBehaviorLog('worksheetRecord', worksheetId, { rowId }); // 埋点
            }}
          >
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
            {formatMsgDate(dateConvertToUserZone(createTime))}
          </a>
        ) : (
          <span className="Gray_a">{formatMsgDate(dateConvertToUserZone(createTime))}</span>
        )}
      </div>
    );
  }

  renderCommentArea() {
    const { isDeleted, canReply, fromLink } = this.props;
    const { sourceId, sourceType, discussionId, extendsId, name, projectId, accountId, fullname, avatar, appId } =
      this.props;
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
          appId,
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
      <div className={`messageItem messageItem-${this.props.inboxId}`}>
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
