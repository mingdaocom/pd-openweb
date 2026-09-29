import React, { Component } from 'react';
import { Checkbox, Modal, Tooltip } from 'ming-ui/antd-components';
import { dialogSelectUser } from 'ming-ui/functions';
import ajaxRequest from 'src/api/taskCenter';
import { errorMessage } from '../../../utils/utils';
import './less/copyTask.less';

export default class CopyTask extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accountId: md.global.Account.accountId,
      avatar: md.global.Account.avatar,
      visible: true,
      taskName: props.name,
      copyChargeUser: false,
      folderID: !!props.folderID,
      taskDesc: true,
      taskAtts: true,
      tag: true,
      members: false,
      time: false,
      subTask: true,
      checklist: true,
      hasSubTasksChargeUser: false,
    };
  }

  selectChargeUser = () => {
    dialogSelectUser({
      sourceId: this.props.taskId,
      title: _l('选择负责人'),
      showMoreInvite: false,
      fromType: 2,
      SelectUserSettings: {
        includeUndefinedAndMySelf: true,
        selectedAccountIds: [this.state.accountId],
        projectId: this.props.projectId,
        unique: true,
        callback: users => {
          this.setState({
            accountId: users[0].accountId,
            avatar: users[0].avatar,
          });
        },
      },
    });
  };

  submit() {
    ajaxRequest
      .duplicateTask({
        taskID: this.props.taskId,
        taskName: this.state.taskName,
        chargeUser: this.state.copyChargeUser ? this.props.chargeUser : this.state.accountId,
        folderID: this.state.folderID,
        taskDesc: this.state.taskDesc,
        taskAtts: this.state.taskAtts,
        tag: this.state.tag,
        members: this.state.members,
        time: this.state.time,
        subTask: this.state.subTask,
        checklist: this.state.checklist,
        hasSubTasksChargeUser: this.state.hasSubTasksChargeUser,
      })
      .then(source => {
        if (source.status) {
          alert(_l('复制成功'));
        } else {
          errorMessage(source.error);
        }
      });
  }

  render() {
    return (
      <Modal
        open={this.state.visible}
        mask={{ closable: true }}
        keyboard
        onCancel={() => this.setState({ visible: false })}
        className="copyTask"
        width={560}
        title={_l('复制任务')}
        okText={_l('保存并复制')}
        onOk={() => {
          this.submit();
          this.setState({ visible: false });
        }}
      >
        <div className="copyDesc">{_l('通过复制任务，您可以将日常的任务计划快速复用')}</div>
        <div className="copyTitleBox">
          <div className="copyTitle">{_l('任务标题')}</div>
          <input
            type="text"
            id="copyTaskName"
            value={this.state.taskName}
            onChange={event => this.setState({ taskName: event.target.value })}
            className="borderColorPrimary"
          />
        </div>
        <div id="copyOperation">
          <div className="copyTitle">{_l('同步复制')}</div>
          <ul>
            <li>
              <Checkbox
                className="checkOperation"
                id="copyFolderID"
                checked={this.state.folderID}
                disabled={!this.props.folderID}
                onChange={event => this.setState({ folderID: event.target.checked })}
              >
                {_l('所属项目')}
              </Checkbox>
            </li>
            <li>
              <Checkbox
                className="checkOperation"
                id="copyChecklist"
                checked={this.state.checklist}
                onChange={event => this.setState({ checklist: event.target.checked })}
              >
                {_l('清单')}
              </Checkbox>
            </li>
            <li>
              <Checkbox
                className="checkOperation"
                id="copyTaskDesc"
                checked={this.state.taskDesc}
                onChange={event => this.setState({ taskDesc: event.target.checked })}
              >
                {_l('描述')}
              </Checkbox>
            </li>
            <li>
              <Checkbox
                className="checkOperation"
                id="copyChargeUser"
                checked={this.state.copyChargeUser}
                onChange={event => this.setState({ copyChargeUser: event.target.checked })}
              >
                {_l('负责人')}
              </Checkbox>
              {!this.state.copyChargeUser && (
                <div className="chargeUserBox">
                  <img src={this.state.avatar} className="circle chargeAvatar" />
                  <i className="icon-task-folder-charge pointer" id="chargeUserBtn" onClick={this.selectChargeUser} />
                </div>
              )}
            </li>
            <li>
              <Checkbox
                className="checkOperation"
                id="copyTaskAtts"
                checked={this.state.taskAtts}
                onChange={event => this.setState({ taskAtts: event.target.checked })}
              >
                {_l('附件')}
              </Checkbox>
            </li>
            <li>
              <Checkbox
                className="checkOperation"
                id="copyMembers"
                checked={this.state.members}
                onChange={event => this.setState({ members: event.target.checked })}
              >
                {_l('任务参与者')}
              </Checkbox>
            </li>
            <li>
              <Checkbox
                className="checkOperation"
                id="copyCategory"
                checked={this.state.tag}
                onChange={event => this.setState({ tag: event.target.checked })}
              >
                {_l('标签')}
              </Checkbox>
            </li>
            <li>
              <Checkbox
                className="checkOperation"
                id="copyDeadline"
                checked={this.state.time}
                onChange={event => this.setState({ time: event.target.checked })}
              >
                {_l('计划起止时间')}
              </Checkbox>
            </li>
          </ul>

          <hr />

          <ul>
            <li>
              <Checkbox
                className="checkOperation"
                id="copySubTask"
                checked={this.state.subTask}
                onChange={event => this.setState({ subTask: event.target.checked, hasSubTasksChargeUser: false })}
              >
                {_l('子任务')}
                <Tooltip title={_l('子任务将包含以上所选的复制内容')}>
                  <span className="mLeft5 copyTip">
                    <i className="icon-info" />
                  </span>
                </Tooltip>
              </Checkbox>
            </li>
            <li>
              <Checkbox
                className="checkOperation"
                id="hasSubTasksChargeUser"
                checked={this.state.hasSubTasksChargeUser}
                disabled={!this.state.subTask}
                onChange={event => this.setState({ hasSubTasksChargeUser: event.target.checked })}
              >
                {_l('子任务负责人')}
              </Checkbox>
            </li>
          </ul>
        </div>
      </Modal>
    );
  }
}
