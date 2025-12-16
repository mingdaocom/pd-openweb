import React, { Component } from 'react';
import { Dialog } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { dialogSelectUser } from 'ming-ui/functions';
import ajaxRequest from 'src/api/taskCenter';
import { expireDialogAsync } from 'src/components/upgradeVersion';
import { errorMessage } from '../../utils/utils';
import './less/copyFolder.less';

const ClickAwayable = createDecoratedComponent(withClickAway);

export default class CopyFolder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accountId: md.global.Account.accountId,
      avatar: md.global.Account.avatar,
      showNetwork: false,
      projectId: props.projectId,
      taskAccountId: 'user-undefined',
      taskAvatar: md.global.FileStoreConfig.pictureHost + '/UserAvatar/undefined.gif?imageView2/1/w/100/h/100/q/90',
    };
  }

  componentDidMount() {
    $('.copyFolder').on('click', '.checkOperation:not(.noClick)', function () {
      let className = 'checkOperation ';
      $(this).toggleClass('checked');

      if ($(this).is($('#copyChargeUser'))) {
        $('#copyChargeUse').siblings('.chargeUserBox').toggleClass('Hidden');
      }

      if ($(this).is($('#copyTaskChargeUser'))) {
        $('#copyTaskChargeUser').siblings('.chargeUserBox').toggleClass('Hidden');
      }

      // 看板信息
      if ($(this).is($('#copyStages'))) {
        className += $(this).hasClass('checked') ? 'checked' : 'noClick';
        $('#copyAllTask, #copyAllTaskMember, #copyAllTaskDesc, #copyAllTaskAtts').removeClass().addClass(className);
      }

      // 项目下所有任务
      if ($(this).is($('#copyAllTask'))) {
        className += $(this).hasClass('checked') ? 'checked' : 'noClick';
        $('#copyAllTaskMember, #copyAllTaskDesc, #copyAllTaskAtts, #copyTaskChargeUser')
          .removeClass()
          .addClass(className);

        if (!$(this).hasClass('checked')) {
          $('#copyTaskChargeUser').siblings('.chargeUserBox').addClass('Hidden');
        }
      }
    });
  }

  chargeTaskUserBtn() {
    const { taskId, projectId } = this.props;
    const { accountId } = this.state;

    dialogSelectUser({
      sourceId: taskId,
      title: _l('选择负责人'),
      showMoreInvite: false,
      fromType: 2,
      SelectUserSettings: {
        selectedAccountIds: [accountId],
        projectId: projectId,
        unique: true,
        callback: users => {
          this.setState({
            taskAccountId: users[0].accountId,
            taskAvatar: users[0].avatar,
          });
        },
      },
    });
  }

  chargeUserBtn() {
    const { taskId, projectId } = this.props;
    const { accountId } = this.state;

    dialogSelectUser({
      sourceId: taskId,
      title: _l('选择负责人'),
      showMoreInvite: false,
      fromType: 2,
      SelectUserSettings: {
        selectedAccountIds: [accountId],
        projectId: projectId,
        unique: true,
        callback: users => {
          this.setState({
            accountId: users[0].accountId,
            avatar: users[0].avatar,
          });
        },
      },
    });
  }

  submit() {
    const folderName = $('#copyFolderName').val().trim();
    if (!folderName) {
      alert('项目标题不能为空');
      return false;
    }

    ajaxRequest
      .duplicateFolder({
        projectId: this.state.projectId,
        folderID: this.props.folderId,
        chargeAccountID: $('#copyChargeUser').hasClass('checked') ? this.props.chargeUser : this.state.accountId,
        taskChargeAccountID: $('#copyTaskChargeUser').hasClass('checked') ? '' : this.state.taskAccountId,
        folderName,
        hasDes: $('#copyDesc').hasClass('checked'),
        hasFolderMember: $('#copyFolderMember').hasClass('checked'),
        hasStage: $('#copyStages').hasClass('checked'),
        hasTask: $('#copyAllTask').hasClass('checked'),
        hasTaskMember: $('#copyAllTaskMember').hasClass('checked'),
        hasTaskDes: $('#copyAllTaskDesc').hasClass('checked'),
        hasTemplate: $('#copyFolderCustomContent').hasClass('checked'),
        hasTaskAtts: $('#copyAllTaskAtts').hasClass('checked'),
        appID: md.global.APPInfo.taskFolderAppID,
      })
      .then(source => {
        if (source.status) {
          this.props.callback(source.data);
          alert(_l('复制成功'));
        } else {
          this.props.onClose();
          errorMessage(source.error);
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

  /**
   * 返回网络名称
   * @return {[type]} [description]
   */
  getNetWorkName() {
    let name = '个人';

    md.global.Account.projects.forEach(project => {
      if (project.projectId === this.state.projectId) {
        name = project.companyName;
      }
    });

    return name;
  }

  switchNetwork(projectId) {
    expireDialogAsync(projectId)
      .then(() => {
        this.setState({ projectId, showNetwork: false });
      })
      .catch(() => {
        this.setState({ projectId: '', showNetwork: false });
      });
  }

  render() {
    return (
      <Dialog
        visible
        className="copyFolder"
        width={560}
        title={_l('复制项目')}
        okText={_l('确定')}
        onOk={() => this.submit()}
        onCancel={this.props.onClose}
      >
        <div className="copyDesc">{_l('通过复制项目，快速复制复杂的项目看板到新项目中')}</div>
        {this.props.isAdmin ? (
          <div className="copyTitleBox">
            <div className="copyTitle copyTitleRight">{_l('归属')}</div>
            <div className="copyNetworkBox">
              <div
                className="copyNetworkTitle pointer ThemeColor3"
                onMouseDown={evt =>
                  this.checkMouseDownIsLeft(evt) && this.setState({ showNetwork: !this.state.showNetwork })
                }
              >
                <span className="copyNetworkName overflow_ellipsis">{this.getNetWorkName()}</span>
                <i className="icon-arrow-down-border" />
              </div>

              {this.state.showNetwork ? (
                <ClickAwayable
                  component="ul"
                  className="copyNetworkList boxShadow5 boderRadAll_3"
                  onClickAway={() => this.setState({ showNetwork: false })}
                >
                  {md.global.Account.projects.map((project, i) => {
                    return (
                      <li
                        key={i}
                        className="overflow_ellipsis ThemeColor3 ThemeBGColor3"
                        onClick={() => this.switchNetwork(project.projectId)}
                      >
                        {project.companyName}
                      </li>
                    );
                  })}
                  <li className="overflow_ellipsis ThemeColor3 ThemeBGColor3" onClick={() => this.switchNetwork('')}>
                    {_l('个人')}
                  </li>
                </ClickAwayable>
              ) : undefined}
            </div>
          </div>
        ) : undefined}

        <div className={this.props.isAdmin ? 'copyTitleBox pTop10' : 'copyTitleBox'}>
          <div className="copyTitle">{_l('项目标题')}</div>
          <input
            type="text"
            id="copyFolderName"
            defaultValue={_l('%0-由%1复制', this.props.folderName, md.global.Account.fullname)}
            className="ThemeBorderColor3"
          />
        </div>

        <div id="copyOperation">
          <ul>
            <li>
              <div className="checked checkOperation" id="copyStages">
                <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                {_l('看板信息')}
              </div>
            </li>
            <li>
              <div className="checkOperation" id="copyChargeUser">
                <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                {_l('负责人')}
              </div>
              <div className="chargeUserBox">
                <img src={this.state.avatar} className="circle chargeAvatar" />
                <i
                  className="icon-task-folder-charge pointer"
                  id="chargeUserBtn"
                  onClick={() => this.chargeUserBtn()}
                />
              </div>
            </li>
            <li>
              <div className="checked checkOperation" id="copyDesc">
                <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                {_l('项目描述')}
              </div>
            </li>
            <li>
              <div className="checkOperation" id="copyFolderMember">
                <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                {_l('项目成员')}
              </div>
            </li>
            <li>
              <div className="checked checkOperation" id="copyFolderCustomContent">
                <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                {_l('全部自定义任务内容')}
                <Tooltip title={_l('项目的字段设置会被复制，每条任务的具体字段值不会被复制')}>
                  <span className="mLeft5 copyTip">
                    <i className="icon-info" />
                  </span>
                </Tooltip>
              </div>
            </li>
          </ul>

          <hr />

          <ul>
            <li>
              <div className="checked checkOperation" id="copyAllTask">
                <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                {_l('项目下所有任务')}
              </div>
            </li>
            <li>
              <div className="checked checkOperation" id="copyAllTaskAtts">
                <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                {_l('任务附件')}
              </div>
            </li>
            <li>
              <div className="checked checkOperation" id="copyAllTaskDesc">
                <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                {_l('任务描述')}
              </div>
            </li>
            <li>
              <div className="checkOperation" id="copyTaskChargeUser">
                <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                {_l('任务负责人')}
              </div>
              <div className="chargeUserBox">
                <img src={this.state.taskAvatar} className="circle chargeAvatar" />
                <i
                  className="icon-task-folder-charge pointer"
                  id="chargeTaskUserBtn"
                  onClick={() => this.chargeTaskUserBtn()}
                />
              </div>
            </li>
            <li>
              <div className="checkOperation" id="copyAllTaskMember">
                <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                {_l('任务参与者')}
              </div>
            </li>
          </ul>
        </div>
      </Dialog>
    );
  }
}
