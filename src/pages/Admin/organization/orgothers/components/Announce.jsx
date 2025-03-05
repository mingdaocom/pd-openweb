import React, { Component, Fragment } from 'react';
import Config from '../../../config';
import { Checkbox } from 'ming-ui';
import { Input } from 'antd';
import cx from 'classnames';
import messageController from 'src/api/message';
import { dialogSelectUser } from 'ming-ui/functions';
import 'src/components/uploadAttachment/uploadAttachment';
import styled from 'styled-components';
const { TextArea } = Input;

const WrapCom = styled.div`
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
  .toolItem {
    width: 100%;
    padding: 23px 0;
    border-bottom: 1px solid #eaeaea;
    display: flex;
    &:nth-child(3) {
      border-bottom: none;
    }
    .toolItemLabel {
      width: 155px;
      font-size: 13px;
      color: #151515;
    }
    .toolItemRight {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      #txtNotice {
        width: 50%;
      }
      .mesDescribe {
        display: flex;
        align-items: center;
        font-size: 13px;
        .color_g {
          color: #757575;
        }
      }
      .ming.Checkbox {
        margin-top: 10px;
        display: flex;
        align-items: center;
        color: #151515;
        font-size: 13px;
      }
    }
  }
  .saveBtn {
    padding-left: 155px;
    button {
      width: 90px;
      height: 36px;
      border-radius: 18px;
    }
  }
`;

export default class Announce extends Component {
  constructor(props) {
    super(props);
    this.state = {
      announceVisible: false,
      content: '',
      projectBalance: 0, //充值金额
      projectEffectUserCount: 0, // 全组织用户
      projectAdminUserCount: 0, // 所有管理员
      projectDepartmentChargeUserCount: 0, // 所有部门负责人
      sendEmail: false,
      sendMessage: false,
      sendMobileMessage: false,
      allProject: false,
      allAdmin: false,
      allDepartmentChargeUser: false,
      users: [],
      groups: [],
      attachments: [],
    };
  }
  componentDidMount() {
    this.getAnnounce();
    this.uploadFiled();
  }

  getAnnounce = () => {
    Config.AdminController.announcement({
      projectId: Config.projectId,
    }).then(data => {
      this.setState({
        projectBalance: data.projectBalance,
        projectEffectUserCount: data.projectEffectUserCount,
        projectAdminUserCount: data.projectAdminUserCount,
        projectDepartmentChargeUserCount: data.projectDepartmentChargeUserCount,
      });
    });
  };
  uploadFiled = () => {
    const _this = this;
    _this.uploadAttachmentObj = $('#hidUploadAttachment').uploadAttachment({
      checkDocVersionUrl: '',
      pluploadID: '#uploadAttachment',
      folder: 'Accessories',
      showDownload: false,
      checkProjectLimitFileSizeUrl: '',
      bucketType: 1,
      callback: function (attachments, totalSize) {
        _this.setState({
          attachments,
        });
      },
    });
  };

  handleTextChange = e => {
    this.setState({
      content: e.target.value,
    });
  };

  handleRemove = (list, idName, id) => {
    this.setState({
      [list]: this.state[list].filter(x => x[idName] !== id),
    });
  };

  //选择用户
  selectUser = () => {
    const _this = this;
    dialogSelectUser({
      fromAdmin: true,
      SelectUserSettings: {
        projectId: Config.projectId,
        filterAll: true,
        filterFriend: true,
        filterOthers: true,
        filterOtherProject: true,
        filterResigned: true,
        dataRange: 2,
        callback: function (userArr) {
          _this.setState({
            users: userArr,
          });
        },
      },
    });
  };

  handleCheck = (value, key) => {
    this.setState({
      [key]: !value,
    });
  };

  handleSubmit = () => {
    const {
      content,
      sendEmail,
      sendMessage,
      sendMobileMessage,
      allProject,
      allAdmin,
      allDepartmentChargeUser,
      attachments,
      groups,
      users,
    } = this.state;
    if (!content) {
      alert(_l('请输入内容'), 3);
      return false;
    }
    if (content.length > 500) {
      alert(_l('您输入的通告内容过长，不能超过500字'), 3);
      return false;
    }
    if (!sendEmail && !sendMessage && !sendMobileMessage) {
      alert(_l('请选择发送方式'), 3);
      return false;
    }
    if (sendMobileMessage && content.length > 60) {
      alert(_l('短信内容的长度不能超过60个字符'), 3);
      return false;
    }
    if (!allProject && !allAdmin && !allDepartmentChargeUser && !groups.length && !users.length) {
      alert(_l('请选择要发送的人'), 3);
      return false;
    }

    let groupIds = [];
    if (groups.length) {
      groupIds = groups.map(x => x.groupId);
    }
    let accountIds = [];
    if (users.length) {
      accountIds = users.map(x => x.accountId);
    }
    let attachmentStr = '';
    if (attachments.length > 0) {
      attachmentStr = JSON.stringify(attachments);
    }

    alert(_l('正在发送...'));

    messageController
      .sendNotice({
        projectId: Config.projectId,
        content,
        attachments: attachmentStr,
        groupIds,
        accountIds,
        allAdmin,
        allProject,
        allDepartmentChargeUser,
        sendEmail,
        sendMessage,
        sendMobileMessage,
      })
      .then(data => {
        if (data.actionResult == 1) {
          const failCount = data.failCount;
          if (failCount === 0) {
            alert(_l('发布成功'));
          } else if (failCount) {
            const message = '<div className="Font12 Gray_c">' + _l('%0人发送失败', failCount) + '</div>';
            alert(message, 3);
          }
          this.setState({
            content: '',
            attachments: [],
            sendEmail: false,
            sendMessage: false,
            sendMobileMessage: false,
            allAdmin: false,
            allProject: false,
            allDepartmentChargeUser: false,
            groups: [],
            users: [],
          });
          this.uploadAttachmentObj.clearAttachment();
        } else if (data.actionResult == 2) {
          alert(_l('你发送的信息过长'), 3);
        } else if (data.actionResult == 3) {
          alert(_l('余额不足,请前去充值'), 3);
        } else {
          alert(_l('发送失败'), 2);
        }
      });
  };

  render() {
    const {
      content,
      sendEmail,
      sendMessage,
      allAdmin,
      allProject,
      allDepartmentChargeUser,
      groups = [],
      users,
      projectEffectUserCount,
      projectAdminUserCount,
      projectDepartmentChargeUserCount,
    } = this.state;

    return (
      <Fragment>
        <div className="orgManagementHeader">
          <i className="icon-backspace Hand mRight10 TxtMiddle Font22 ThemeHoverColor3" onClick={this.props.onClose} />
          {_l('群发通告')}
          <div className="flex"></div>
        </div>
        <WrapCom className="orgManagementContent">
          <div className="toolItem">
            <div className="toolItemLabel">{_l('通告内容')}</div>
            <div className="toolItemRight">
              <TextArea id="txtNotice" value={content} onChange={this.handleTextChange} autoSize={{ minRows: 5 }} />
              <div className="ThemeHoverColor3 pointer mTop5 mBottom10 Font13 Gray_75">
                <span className="InlineBlock ThemeColor3 Hand adminHoverColor" id="uploadAttachment">
                  <i className="icon-attachment" />
                  {_l('添加附件')}
                </span>
                <input type="hidden" id="hidUploadAttachment" />
              </div>
            </div>
          </div>
          <div className="toolItem">
            <div className="toolItemLabel">{_l('群发方式')}</div>
            <div className="toolItemRight">
              <Checkbox checked={sendEmail} onClick={value => this.handleCheck(value, 'sendEmail')}>
                Email
              </Checkbox>
              <Checkbox checked={sendMessage} onClick={value => this.handleCheck(value, 'sendMessage')}>
                {_l('私信')}
              </Checkbox>
              {/* <Checkbox
                checked={sendMobileMessage}
                onClick={value => this.handleCheck(value, 'sendMobileMessage')}
                disabled={projectBalance <= 0}
              >
                <span className="mesDescribe">
                  <span>{_l('手机短信')}</span>
                  <span className="color_g">{_l('（仅限付费版使用，并确保有足够的余额，当前余额：）')}</span>
                  <a href={`/admin/billinfo/${Config.projectId}`} className="mRight5">
                    {projectBalance}
                  </a>
                  <a href={`/admin/valueaddservice/${Config.projectId}`}>{_l('充值')}</a>
                </span>
              </Checkbox> */}
            </div>
          </div>
          <div className="toolItem">
            <div className="toolItemLabel">{_l('发送范围')}</div>
            <div className="toolItemRight">
              <Checkbox checked={allProject} onClick={value => this.handleCheck(value, 'allProject')}>
                {_l('全组织用户 %0 人', projectEffectUserCount)}
              </Checkbox>
              <Checkbox checked={allAdmin} onClick={value => this.handleCheck(value, 'allAdmin')}>
                {_l('所有管理员 %0 人', projectAdminUserCount)}
              </Checkbox>
              <Checkbox
                checked={allDepartmentChargeUser}
                onClick={value => this.handleCheck(value, 'allDepartmentChargeUser')}
              >
                {_l('所有部门负责人 %0 人', projectDepartmentChargeUserCount)}
              </Checkbox>

              <div className={cx('FlexRow mLeft20', { hidden: !groups.length })}>
                {groups.map(item => {
                  return (
                    <span className="announceLabel" key={item.groupId}>
                      {item.avatar && <img src={item.avatar} className="circle avatar" />}
                      <span className="announceLabelName">{item.name}</span>
                      <span
                        className="mLeft5 icon-closeelement-bg-circle Font14 removeBtn"
                        onClick={() => this.handleRemove('groups', 'groupId', item.groupId)}
                      />
                    </span>
                  );
                })}
              </div>

              <div className="mLeft20 mTop10">
                <button
                  type="button"
                  className="ming Button Button--link ThemeColor3 adminHoverColor"
                  onClick={this.selectUser}
                >
                  {_l('选择具体成员')}
                </button>
              </div>

              <div className={cx('FlexRow mLeft20', { hidden: !users.length })}>
                {users.map(item => {
                  return (
                    <span className="announceLabel" key={item.accountId}>
                      {item.avatar && <img src={item.avatar} className="circle avatar" />}
                      <span className="announceLabelName">{item.fullname}</span>
                      <span
                        className="mLeft5 icon-closeelement-bg-circle Font14 removeBtn"
                        onClick={() => this.handleRemove('users', 'accountId', item.accountId)}
                      />
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mTop32 saveBtn">
            <button className="ming Button Button--primary" onClick={this.handleSubmit}>
              {_l('发送')}
            </button>
          </div>
        </WrapCom>
      </Fragment>
    );
  }
}
