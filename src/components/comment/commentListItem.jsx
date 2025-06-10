import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import filterXSS from 'xss';
import { whiteList } from 'xss/lib/default';
import { Icon } from 'ming-ui';
import { LoadDiv, PreferenceTime, Tooltip, UserHead, UserName } from 'ming-ui';
import confirm from 'ming-ui/components/Dialog/Confirm';
import discussionAjax from 'src/api/discussion';
import UploadFiles from 'src/components/UploadFiles';
import createLinksForMessage from 'src/utils/createLinksForMessage';
import { SOURCE_TYPE } from './config';

const Menu = styled.ul`
  width: 140px;
  padding: 5px 0;
  border-radius: 3px;
  background: white;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.13),
    0 2px 6px rgba(0, 0, 0, 0.1);
  li {
    padding: 0 16px;
    height: 36px;
    line-height: 36px;
    width: 100%;
    &:hover {
      background-color: #f2f2f2 !important;
    }
  }
`;

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
              return Promise.reject();
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

  /**
   * 检查是左键点击
   * @param  {object} evt
   */
  checkMouseDownIsLeft(evt) {
    return evt.button === 0;
  }

  renderMoreAction() {
    const { popupVisible } = this.state;

    return (
      <Trigger
        popupVisible={popupVisible}
        onPopupVisibleChange={visible => this.setState({ popupVisible: visible })}
        action={['click']}
        popupAlign={{
          points: ['tl', 'bl'],
          offset: [0, 10],
          overflow: { adjustX: true, adjustY: true },
        }}
        popup={() => (
          <Menu>
            <li
              className="overflow_ellipsis Hand Red"
              onClick={evt => this.checkMouseDownIsLeft(evt) && this.delComment()}
            >
              {_l('删除讨论')}
            </li>
          </Menu>
        )}
      >
        <Icon className="ThemeHoverColor3 TxtMiddle Font18" icon="task-point-more" />
      </Trigger>
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
            <span className="userName Gray userMessage">{createAccount.fullname}</span>
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
                  projectId={comment.projectId}
                />
                <Tooltip
                  text={this.state.replayMsg ? <span>{this.state.replayMsg}</span> : <LoadDiv />}
                  themeColor={'white'}
                >
                  <span
                    className="msgTip icon-task-reply-msg ThemeColor3 pLeft5"
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
              onMouseDown={evt => this.checkMouseDownIsLeft(evt) && this.props.switchReplyComment(comment.discussionId)}
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
