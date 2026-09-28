import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import filterXSS from 'xss';
import { whiteList } from 'xss/lib/default';
import { Icon } from 'ming-ui';
import { LoadDiv, PreferenceTime, UserHead, UserName } from 'ming-ui';
import { Dropdown, Modal, Tooltip } from 'ming-ui/antd-components';
import discussionAjax from 'src/api/discussion';
import createLinksForMessage from 'src/components/comment/utils/createLinksForMessage';
import UploadFiles from 'src/components/UploadFiles';
import { SOURCE_TYPE } from './config';

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
  };

  static defaultProps = {
    removeDiscussion() {}, // 删除讨论回调
  };

  constructor(props) {
    super(props);
    this.state = {
      replayMsg: null,
      popupVisible: false,
    };
  }

  componentWillUnmount() {
    if (this.ajax && this.ajax.abort) {
      this.ajax.abort();
    }
  }

  delComment() {
    const {
      comment: { discussionId },
      sourceType,
      removeComment,
    } = this.props;

    this.setState({ popupVisible: false });

    Modal.confirm({
      title: <span className="textError">{_l('您确定要删除该讨论吗？')}</span>,
      okButtonProps: { danger: true },
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
              throw new Error();
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

  renderMoreAction() {
    const { popupVisible } = this.state;

    return (
      <Dropdown
        open={popupVisible}
        onOpenChange={visible => this.setState({ popupVisible: visible })}
        trigger={['click']}
        placement="bottomLeft"
        menu={{
          style: { width: 140 },
          items: [
            {
              key: 'delete',
              danger: true,
              label: _l('删除讨论'),
              onClick: () => this.delComment(),
            },
          ],
        }}
      >
        <Icon className="hoverColorPrimary TxtMiddle Font18" icon="more_horiz" />
      </Dropdown>
    );
  }

  render() {
    const { comment, sourceType, children } = this.props;
    const { popupVisible } = this.state;
    const { createAccount = {}, replyAccount = {}, replyId, location, extendsId } = comment;
    const message = createLinksForMessage({
      sourceType,
      message: comment.message,
      rUserList: comment.accountsInMessage,
    });
    const appId = extendsId.split('|')[0];

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
          size={24}
          appId={appId}
          projectId={comment.projectId}
        />
        <div className="talkDiscussion">
          <div className="singleTop">
            <span className="userName textPrimary userMessage">{createAccount.fullname}</span>
            {replyId ? (
              <span>
                <span className="pLeft5">{_l('回复')}</span>
                <UserName
                  className="userName pointer colorPrimary pLeft5 userMessage"
                  user={{
                    userName: replyAccount.fullname,
                    accountId: replyAccount.accountId,
                    isDelete: true,
                  }}
                  projectId={comment.projectId}
                />
                <Tooltip title={this.state.replayMsg ? <span>{this.state.replayMsg}</span> : <LoadDiv />} type="white">
                  <span
                    className="msgTip icon-task-reply-msg colorPrimary pLeft5"
                    onMouseOver={() => !this.ajax && this.fetchReplyMsg()}
                  />
                </Tooltip>
              </span>
            ) : undefined}
            <div className="Right">
              <PreferenceTime className="commentDate" value={comment.createTime} />
            </div>
          </div>
          <div
            className="singeText"
            dangerouslySetInnerHTML={{
              __html: filterXSS(message, {
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
          <div className="actionsWrap">
            <a
              className={cx('replyBtn Bold', { Hidden: !children && !popupVisible })}
              onClick={() => this.props.switchReplyComment(comment.discussionId)}
            >
              {_l('回复')}
            </a>
            {createAccount.accountId === md.global.Account.accountId && (
              <a className={cx('moreBtn', { Hidden: !children && !popupVisible })}>{this.renderMoreAction()}</a>
            )}
          </div>
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
                  href={`http://ditu.amap.com/regeo?lng=${location.longitude}&lat=${location.latitude}&name=${
                    location.name || ''
                  }&src=uriapi`}
                  className="commentLocation Font12 colorPrimary Hand"
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
