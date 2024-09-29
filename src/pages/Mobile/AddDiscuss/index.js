import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'ming-ui';
import { Popup, ActionSheet } from 'antd-mobile';
import SelectUser from 'mobile/components/SelectUser';
import AttachmentFiles, { UploadFileWrapper } from '../components/AttachmentFiles';
import discussionAjax from 'src/api/discussion';
import cx from 'classnames';
import './index.less';
import externalPortalAjax from 'src/api/externalPortal';
import _ from 'lodash';

const BASE_BUTTONS = [_l('@用户'), _l('输入@')];
const SHEET_AT_ALL = _l('@工作表全体成员');
const ROW_AT_ALL = _l('@记录全体成员');
const ROW_BUTTONS = [ROW_AT_ALL, ...BASE_BUTTONS];
const SHEET_BUTTONS = [SHEET_AT_ALL, ...BASE_BUTTONS];

const formatEmpty = value => {
  if (value === 'undefined' || value === 'null') {
    return '';
  }
  return value || '';
};

@connect(
  state => ({})
)
class AddDiscuss extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      files: [],
      members: [],
      showSelectUser: false,
      allowExAccountDiscuss: false, //允许外部用户讨论
      exAccountDiscussEnum: 0, //外部用户的讨论类型 0：所有讨论 1：不可见内部讨论
    };
  }
  componentDidMount() {
    this.getPortalConfigSet();
  }
  componentWillUnmount() {
    this.actionSheetHandler && this.actionSheetHandler.close();
  }
  getPortalConfigSet = () => {
    const { params } = this.props.match;
    const { appId } = params;

    externalPortalAjax.getConfig({ appId }).then(res => {
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
    this.actionSheetHandler = ActionSheet.show({
      actions: BUTTONS.map((item, index) => {
        return {
          key: index,
          text: (
            <span className="Bold">{item}</span>
          )
        }
      }),
      extra: (
        <div className="flexRow header">
          <span className="Font13">{_l('讨论')}</span>
          <div className="closeIcon" onClick={() => this.actionSheetHandler.close()}>
            <Icon icon="close" />
          </div>
        </div>
      ),
      onAction: (action, index) => {
        if (index === 0) {
          this.handlePushValue(` ${BUTTONS[0]} `);
        }
        if (index === 1) {
          this.setState({ showSelectUser: true });
        }
        if (index === 2) {
          this.handlePushValue('@');
        }
        this.actionSheetHandler.close();
      }
    });
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
    const { replyId, replyName } = discussionInfo;
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
        replyId: replyId || undefined,
        entityType: entityType === 2 ? 2 : 0, //后端接口只区分0 2
      })
      .then(result => {
        if (result.data) {
          this.props.onAdd(result.data);
        }
      });
  }
  renderFiles() {
    const { files } = this.state;
    return (
      <div className="filesScroll">
        <AttachmentFiles
          width={130}
          isRemove={true}
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
    const { value, files, showSelectUser } = this.state;
    const { projectId } = this.props;
    const { appId, discussionInfo } = this.props.match.params;
    const { replyId, replyName } = discussionInfo;
    return (
      <div className="addDiscuss flexColumn h100">
        <div className="flexRow pAll10 pBottom0">
          <div className="flex">{_l('讨论')}</div>
          <Icon icon="closeelement-bg-circle" className="close Font22 Gray_9e" onClick={this.props.onClose} />
        </div>
        <textarea
          placeholder={replyName ? _l('回复%0', replyName) : ''}
          className="contentInput flex"
          value={value}
          onChange={event => {
            this.setState({
              value: event.target.value,
            });
          }}
        />
        {files.length ? <div className="filesWrapper">{this.renderFiles()}</div> : null}
        <div className="handleBar flexRow alignItemsCenter">
          <div className="flexRow flex">
            <UploadFileWrapper
              files={files}
              projectId={projectId}
              appId={appId}
              onChange={files => {
                this.setState({
                  files,
                });
              }}
            >
              <Icon icon="attachment" />
            </UploadFileWrapper>
            {!md.global.Account.isPortal && <Icon icon="chat-at" onClick={this.handleAt.bind(this)} />}
          </div>
          <div className="addRecord" onClick={this.handleSendMessage.bind(this)}>
            {_l('发送')}
          </div>
        </div>
        {showSelectUser && (
          <SelectUser
            visible={true}
            type="user"
            appId={appId}
            projectId={this.props.projectId}
            onSave={(members) => {
              const { value } = this.state;
              this.setState({
                value: `${value} ` + `${members.map(item => `@${item.fullname}`).join(' ')} `,
                members,
              });
            }}
            onClose={() => this.setState({ showSelectUser: false })}
          />
        )}
      </div>
    );
  }
}

export default props => {
  const { appId, worksheetId, viewId, rowId, discussionInfo } = props;
  const { className, visible, onClose, onAdd ,projectId} = props;

  return (
    <Popup
      className={cx('mobileModal minFull topRadius', className)}
      onClose={onClose}
      visible={visible}
    >
      {(rowId || worksheetId) && (
        <AddDiscuss
          match={{ params: { appId, worksheetId, viewId, rowId, discussionInfo } }}
          onAdd={onAdd}
          onClose={onClose}
          projectId={projectId}
        />
      )}
    </Popup>
  );
}

