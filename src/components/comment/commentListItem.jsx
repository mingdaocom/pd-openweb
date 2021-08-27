import React from 'react';
import PropTypes from 'prop-types';
import UserHead from 'src/pages/feed/components/userHead';
import UserName from 'src/pages/feed/components/userName';
import { SOURCE_TYPE } from './config';
import mdFunction from 'mdFunction';
import 'mdDialog';
import UploadFiles from 'src/components/UploadFiles';
import ToolTip from 'ming-ui/components/Tooltip';
import LoadDiv from 'ming-ui/components/LoadDiv';
import confirm from 'ming-ui/components/Dialog/Confirm';
import filterXSS from 'xss';
import { whiteList } from 'xss/lib/default';
import discussionAjax from 'src/api/discussion';

const newWhiteList = Object.assign({}, whiteList, { img: ['src', 'alt', 'title', 'width', 'height', 'class'] });

// 评论内容列表
export default class CommentListItem extends React.Component {
  static propTypes = {
    children: PropTypes.element,
    comment: PropTypes.shape({
      discussionId: PropTypes.string,
      isDeleted: PropTypes.bool,
      message: PropTypes.string,
      attachments: PropTypes.array,
      newAccounts: PropTypes.array,
      accountsInMessage: PropTypes.array,
      projectId: PropTypes.string,
      replyId: PropTypes.string,
      sourceId: PropTypes.string,
    }).isRequired,
    sourceType: PropTypes.oneOf(_.values(SOURCE_TYPE)),
    switchReplyComment: PropTypes.func,
    removeComment: PropTypes.func,
    updateComment: PropTypes.func,
    bindBusinessCard: PropTypes.bool,
  };

  static defaultProps = {
    removeDiscussion() {}, // 删除讨论回调
    bindBusinessCard: true, // 绑定名片层
  };

  constructor(props) {
    super(props);
    this.state = {
      replayMsg: null,
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

  delComment() {
    const {
      comment: { discussionId },
      sourceType,
      removeComment,
    } = this.props;

    confirm({
      title: _l('您确定要删除该讨论吗？'),
      onOk: () => {
        return discussionAjax
          .removeDiscussion({
            discussionId,
            sourceType,
          })
          .then(res => {
            if (res && res.code === 1) {
              removeComment(discussionId);
            } else {
              alert(_l('删除讨论失败'), 2);
              return $.Deferred()
                .reject()
                .promise();
            }
          });
      },
    });
  }

  fetchReplyMsg() {
    const {
      comment: { replyId },
      sourceType,
    } = this.props;

    if (this.state.replayMsg) return false;

    this.abortRequest();

    this.ajax = discussionAjax.getDiscussionMsg({
      discussionId: replyId,
      sourceType,
    });
    this.ajax.then(source => {
      if (source.code === 1) {
        this.setState({
          replayMsg: source.data,
        });
      } else {
        alert(_l('获取回复内容失败'), 2);
      }
    });
  }

  /**
   * 检查是左键点击
   * @param  {object} evt
   */
  checkMouseDownIsLeft(evt) {
    return evt.button === 0;
  }

  render() {
    const { comment, bindBusinessCard, sourceType, children } = this.props;
    const { createAccount, replyAccount, replyId, location } = comment;
    const message = mdFunction.createLinksForMessage({
      sourceType,
      message: comment.message,
      rUserList: comment.accountsInMessage,
    });

    return (
      <div
        className="singleTalk boxSizing"
        ref={singleTalk => {
          this.singleTalk = singleTalk;
        }}
      >
        <UserHead
          className="createHeadImg circle userAvarar pointer userMessage"
          user={{
            userHead: createAccount.avatar,
            accountId: createAccount.accountId,
          }}
          bindBusinessCard={bindBusinessCard}
          lazy={'false'}
          size={24}
        />
        <div className="talkDiscussion">
          <div className="singleTop">
            <UserName
              className="userName pointer ThemeColor3 userMessage"
              user={{
                userName: createAccount.fullname,
                accountId: createAccount.accountId,
                isDelete: true,
              }}
              bindBusinessCard={bindBusinessCard}
            />
            {replyId ? (
              <span>
                <span className="pLeft5">{_l('回复')}</span>
                <UserName
                  className="userName pointer ThemeColor3 pLeft5 userMessage"
                  user={{
                    userName: replyAccount.fullname,
                    accountId: replyAccount.accountId,
                    isDelete: true,
                  }}
                  bindBusinessCard={bindBusinessCard}
                />
                <ToolTip
                  text={this.state.replayMsg ? <span>{this.state.replayMsg}</span> : <LoadDiv />}
                  themeColor={'white'}
                >
                  <span
                    className="msgTip icon-task-reply-msg ThemeColor3 pLeft5"
                    onMouseOver={() => this.fetchReplyMsg()}
                  />
                </ToolTip>
              </span>
            ) : (
              undefined
            )}
            <div className="Right">
              {createAccount.accountId === md.global.Account.accountId ? (
                <a
                  className="Hidden mRight10 ThemeColor3"
                  onMouseDown={evt => this.checkMouseDownIsLeft(evt) && this.delComment()}
                >
                  {_l('删除')}
                </a>
              ) : (
                undefined
              )}
              <a
                className="Hidden ThemeColor3"
                onMouseDown={evt =>
                  this.checkMouseDownIsLeft(evt) && this.props.switchReplyComment(comment.discussionId)
                }
              >
                {_l('回复')}
              </a>
              <span className="commentDate">{createTimeSpan(comment.createTime)}</span>
            </div>
          </div>
          <div
            className="singeText"
            dangerouslySetInnerHTML={{
              __html: filterXSS(message, {
                stripIgnoreTag: true,
                whiteList: newWhiteList,
              }),
            }}
          />

          <UploadFiles
            isUpload={false}
            attachmentData={comment.attachments}
            onDeleteAttachmentData={attachments => {
              this.props.updateComment(Object.assign(comment, { attachments }));
            }}
          />
          {location && location.name && location.address ? (
            <div className="mTop5 mBottom5">
              <span
                onClick={e => {
                  if (!location.longitude || !location.latitude) {
                    alert(_l('对不起，没有获取到该地点详细信息'), 3);
                    e.preventDefault();
                  }
                }}
              >
                <a
                  href={`http://ditu.amap.com/regeo?lng=${location.longitude}&lat=${
                    location.latitude
                  }&name=${location.name || ''}&src=uriapi`}
                  className="commentLocation Font12 ThemeColor3 Hand"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span className="icon icon-locate" />
                  {location.name}
                </a>
              </span>
            </div>
          ) : null}
          {children ? this.props.children : undefined}
        </div>
      </div>
    );
  }
}
