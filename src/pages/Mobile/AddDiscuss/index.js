import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'ming-ui';
import plupload from 'plupload';
import { Flex, ActionSheet, ActivityIndicator, WhiteSpace } from 'antd-mobile';
import AttachmentFiles, { UploadFileWrapper } from '../Discuss/AttachmentFiles';
import discussionAjax from 'src/api/discussion';
import './index.less';
import { getDiscussConfig } from 'src/api/externalPortal';

const BASE_BUTTONS = [_l('@用户'), _l('输入@'), _l('取消')];
const SHEET_AT_ALL = _l('@工作表全体成员');
const ROW_AT_ALL = _l('@记录全体成员');
const ROW_BUTTONS = [ROW_AT_ALL, ...BASE_BUTTONS];
const SHEET_BUTTONS = [SHEET_AT_ALL, ...BASE_BUTTONS];
const attachmentFilesHeight = 140;
const bottomHeight = 60;

const formatEmpty = value => {
  if (value === 'undefined' || value === 'null') {
    return '';
  }
  return value || '';
};

class AddDiscuss extends Component {
  constructor(props) {
    super(props);
    this.state = {
      height: document.documentElement.clientHeight - attachmentFilesHeight - bottomHeight,
      value: '',
      files: [],
      members: [],
      allowExAccountDiscuss: false, //允许外部用户讨论
      exAccountDiscussEnum: 0, //外部用户的讨论类型 0：所有讨论 1：不可见内部讨论
    };
  }
  componentDidMount() {
    this.getPortalDiscussSet();
  }
  componentWillUnmount() {
    ActionSheet.close();
  }
  getPortalDiscussSet = () => {
    const { params } = this.props.match;
    const { appId } = params;

    getDiscussConfig({ appId }).then(res => {
      const {
        allowExAccountDiscuss, //允许外部用户讨论
        exAccountDiscussEnum,
      } = res;
      this.setState({
        allowExAccountDiscuss, //允许外部用户讨论
        exAccountDiscussEnum,
      });
    });
  };
  handleAt() {
    const { params } = this.props.match;
    const { rowId } = params;
    const newRowId = formatEmpty(rowId);
    const BUTTONS = _.isEmpty(newRowId) ? SHEET_BUTTONS : ROW_BUTTONS;

    ActionSheet.showActionSheetWithOptions(
      {
        options: BUTTONS,
        cancelButtonIndex: BUTTONS.length - 1,
      },
      buttonIndex => {
        // buttonIndex = _.isEmpty(newRowId) ? buttonIndex : buttonIndex + 1;
        if (buttonIndex === 0) {
          this.handlePushValue(BUTTONS[0]);
        }
        if (buttonIndex === 1) {
          import('dialogSelectUser').then(() => {
            $({}).dialogSelectUser({
              showMoreInvite: false,
              isMobile: true,
              SelectUserSettings: {
                projectId: '',
                filterAccountIds: [],
                callback: members => {
                  const { value } = this.state;
                  this.setState({
                    value: `${value} ` + members.map(item => `@${item.fullname}`).join(' '),
                    members,
                  });
                },
              },
            });
          });
        }
        if (buttonIndex === 2) {
          this.handlePushValue('@');
        }
      },
    );
  }
  handlePushValue(text) {
    const { value } = this.state;
    this.setState({
      value: value + text,
    });
  }
  handleSendMessage() {
    const {
      value,
      files,
      members,
      allowExAccountDiscuss, //允许外部用户讨论
      exAccountDiscussEnum,
    } = this.state;
    const { params } = this.props.match;
    const { worksheetId, rowId, discussionInfo } = params;
    const newRowId = formatEmpty(rowId);
    const [replyId, replyName] = formatEmpty(discussionInfo).split('|');
    if (!value) return;
    let newValue = value.replace(_.isEmpty(newRowId) ? SHEET_AT_ALL : ROW_AT_ALL, '[all]atAll[/all]');
    if (members.length) {
      members.forEach(item => {
        newValue = newValue.replace(`@${item.fullname}`, `[aid]${item.accountId}[/aid]`);
      });
    }
    let entityType = 0;
    //外部用户且未开启讨论 不能内部讨论
    if (md.global.Account.isPortal && allowExAccountDiscuss && exAccountDiscussEnum === 1) {
      entityType = 2;
    }
    discussionAjax
      .addDiscussion({
        sourceId: newRowId ? `${worksheetId}|${newRowId}` : worksheetId,
        sourceType: newRowId ? 8 : 7,
        message: newValue,
        attachments: JSON.stringify(files),
        appId: md.global.APPInfo.worksheetAppID,
        extendsId: `${formatEmpty(params.appId)}|${formatEmpty(params.viewId)}`,
        replyId: discussionInfo ? replyId : null,
        entityType: entityType === 2 ? 2 : 0, //后端接口只区分0 2
      })
      .then(result => {
        if (result.data) {
          history.back();
        }
      });
  }
  renderFiles() {
    const { files } = this.state;
    return (
      <div className="filesScroll">
        <AttachmentFiles
          width={130}
          attachments={files}
          onChange={files => {
            this.setState({
              files,
            });
          }}
        />
      </div>
    );
  }
  render() {
    const { height, value, files } = this.state;
    const { discussionInfo } = this.props.match.params;
    const [replyId, replyName] = formatEmpty(discussionInfo).split('|');
    return (
      <div className="addDiscuss">
        <textarea
          placeholder={replyName ? _l('回复%0', replyName) : ''}
          className="contentInput"
          style={{ height: files.length ? height : height + attachmentFilesHeight }}
          value={value}
          onChange={event => {
            this.setState({
              value: event.target.value,
            });
          }}
        />
        {files.length ? <div className="filesWrapper">{this.renderFiles()}</div> : null}
        <Flex className="handleBar">
          <Flex.Item className="flexRow">
            <UploadFileWrapper
              files={files}
              onChange={files => {
                this.setState({
                  files,
                });
              }}
            >
              <Icon icon="attachment" />
            </UploadFileWrapper>
            {!md.global.Account.isPortal && <Icon icon="chat-at" onClick={this.handleAt.bind(this)} />}
          </Flex.Item>
          <div className="addRecord" onClick={this.handleSendMessage.bind(this)}>
            {_l('发送')}
          </div>
        </Flex>
      </div>
    );
  }
}

export default connect(state => {
  return {};
})(AddDiscuss);
