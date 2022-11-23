import React, { Component } from 'react';
import DialogLayer from 'src/components/mdDialog/dialog';
import ajaxRequest from 'src/api/taskCenter';
import 'src/components/dialogSelectUser/dialogSelectUser';
import './less/copyTask.less';

export default class CopyTask extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accountId: md.global.Account.accountId,
      avatar: md.global.Account.avatar,
    };
  }

  componentDidMount() {
    const that = this;
    $('#copyTask_container').on('click', '.checkOperation:not(.noClick)', function () {
      $(this).toggleClass('checked');
      if ($(this).is($('#copyChargeUser'))) {
        $('#copyOperation .chargeUserBox').toggleClass('Hidden');
      }

      if ($(this).is($('#copySubTask'))) {
        $('#hasSubTasksChargeUser')
          .toggleClass('noClick')
          .removeClass('checked');
      }
    });

    $('#copyTask_container').on('click', '#chargeUserBtn', function () {
      $(this).dialogSelectUser({
        sourceId: that.props.taskId,
        title: '选择负责人',
        showMoreInvite: false,
        fromType: 2,
        SelectUserSettings: {
          includeUndefinedAndMySelf: true,
          filterAccountIds: [that.state.accountId],
          projectId: that.props.projectId,
          unique: true,
          callback: (users) => {
            that.setState({
              accountId: users[0].accountId,
              avatar: users[0].avatar,
            });
          },
        },
      });
    });
  }

  submit() {
    ajaxRequest
      .duplicateTask({
        taskID: this.props.taskId,
        taskName: $('#copyTaskName').val(),
        chargeUser: $('#copyChargeUser').hasClass('checked') ? this.props.chargeUser : this.state.accountId,
        folderID: $('#copyFolderID').hasClass('checked'),
        taskDesc: $('#copyTaskDesc').hasClass('checked'),
        taskAtts: $('#copyTaskAtts').hasClass('checked'),
        tag: $('#copyCategory').hasClass('checked'),
        members: $('#copyMembers').hasClass('checked'),
        time: $('#copyDeadline').hasClass('checked'),
        subTask: $('#copySubTask').hasClass('checked'),
        checklist: $('#copyChecklist').hasClass('checked'),
        hasSubTasksChargeUser: $('#hasSubTasksChargeUser').hasClass('checked'),
      })
      .then((source) => {
        if (source.status) {
          alert(_l('复制成功'));
        } else {
          errorMessage(source.error);
        }
      });
  }

  render() {
    const settings = {
      dialogBoxID: 'copyTask',
      width: 560,
      container: {
        header: _l('复制任务'),
        yesText: _l('保存并复制'),
        yesFn: () => {
          this.submit();
        },
      },
    };

    return (
      <DialogLayer {...settings}>
        <div className="copyDesc">{_l('通过复制任务，您可以将日常的任务计划快速复用')}</div>
        <div className="copyTitleBox">
          <div className="copyTitle">{_l('任务标题')}</div>
          <input type="text" id="copyTaskName" defaultValue={this.props.name} className="ThemeBorderColor3" />
        </div>
        <div id="copyOperation">
          <div className="copyTitle">{_l('同步复制')}</div>
          <ul>
            <li>
              <div className={this.props.folderID ? 'checked checkOperation' : 'noClick checkOperation'} id="copyFolderID">
                <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                {_l('所属项目')}
              </div>
            </li>
            <li>
              <div className="checked checkOperation" id="copyChecklist">
                <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                {_l('清单')}
              </div>
            </li>
            <li>
              <div className="checked checkOperation" id="copyTaskDesc">
                <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                {_l('描述')}
              </div>
            </li>
            <li>
              <div className="checkOperation" id="copyChargeUser">
                <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                {_l('负责人')}
              </div>
              <div className="chargeUserBox">
                <img src={this.state.avatar} className="circle chargeAvatar" />
                <i className="icon-task-folder-charge pointer" id="chargeUserBtn" />
              </div>
            </li>
            <li>
              <div className="checked checkOperation" id="copyTaskAtts">
                <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                {_l('附件')}
              </div>
            </li>
            <li>
              <div className="checkOperation" id="copyMembers">
                <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                {_l('任务参与者')}
              </div>
            </li>
            <li>
              <div className="checked checkOperation" id="copyCategory">
                <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                {_l('标签')}
              </div>
            </li>
            <li>
              <div className="checkOperation" id="copyDeadline">
                <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                {_l('计划起止时间')}
              </div>
            </li>
          </ul>

          <hr />

          <ul>
            <li>
              <div className="checked checkOperation" id="copySubTask">
                <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                {_l('子任务')}
                <span className="mLeft5 copyTip" data-tip={_l('子任务将包含以上所选的复制内容')}>
                  <i className="icon-knowledge-message" />
                </span>
              </div>
            </li>
            <li>
              <div className="checkOperation" id="hasSubTasksChargeUser">
                <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                {_l('子任务负责人')}
              </div>
            </li>
          </ul>
        </div>
      </DialogLayer>
    );
  }
}
