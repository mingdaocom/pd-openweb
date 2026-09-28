import React from 'react';
import _ from 'lodash';
import filterXss from 'xss';
import calendarAjaxRequest from 'src/api/calendar';
import ajaxRequest from 'src/api/taskCenter';
import createRoot from 'src/common/theme/createRootWithAntdConfig';
import createShare from 'src/components/createShare/createShare';
import { addTask } from 'src/pages/task/redux/actions';
import Store from 'src/redux/configureStore';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { CreateTaskDialog } from './CreateTaskContent';
import './css/createTask.css';

const getDefaultSettings = () => ({
  frameid: 'createTask',
  TaskName: '',
  Description: '',
  FolderID: '',
  ProjectID: null,
  folderName: '',
  PostID: '',
  CalenderID: '',
  recurTime: '',
  worksheetAndRowId: '',
  DialogName: _l('创建新任务'),
  Deadlines: '',
  StartTime: '',
  Deadline: '',
  StageID: '',
  StageName: '',
  createShare: null, // 给chat用，是否弹出层
  isFromPost: false, // 是否从动态添加
  taskTreeView: false,
  ChargeArray: [
    {
      accountId: md.global.Account.accountId,
      fullname: md.global.Account.fullname,
      avatar: md.global.Account.avatar,
    },
  ], // 示例：[{accountId:'9b0480ad-cdb3-4833-9d64-cdbef48f2785',fullname:'lio.wang'，avatar："头像"}] 任务负责人
  MemberArray: [], // 示例：[{accountId:'9b0480ad-cdb3-4833-9d64-cdbef48f2785',fullname:'lio.wang'，avatar}]//任务成员
  createTaskAttachments: {
    attachmentData: [],
    kcAttachmentData: [],
  },
  callback: null, // 创建完任务后回调函数
  shareCallback: null,
  relationCallback: null,
  itemId: '', // 检查项id
});

export function getCreateTaskSettings(opts) {
  const settings = $.extend(getDefaultSettings(), opts);
  let projectExists = false;

  // 任务中心打开
  if (location.href.indexOf('task') >= 0 || location.href.indexOf('application') >= 0) {
    const $tasks = $('#tasks');

    if ($tasks.attr('data-fid')) {
      settings.ProjectID = $tasks.attr('data-pid');
      settings.FolderID = $tasks.attr('data-fid');
      settings.folderName =
        $('.folderList li[data-id=' + settings.FolderID + '] .folderName:first').text() ||
        $('.taskToolbar .folderName').text();
    }
  }

  if (settings.ProjectID === null) {
    const lastProjectId = window.localStorage.getItem('lastProjectId');

    if (lastProjectId !== null) {
      settings.ProjectID = lastProjectId;
    } else if ((md.global.Account.projects || []).length) {
      settings.ProjectID = md.global.Account.projects[0].projectId;
    } else {
      settings.ProjectID = '';
    }
  }

  // 监测网络是否过期
  _.forEach(md.global.Account.projects, project => {
    if (settings.ProjectID === project.projectId) {
      projectExists = true;
      if (project.licenseType === 0) {
        settings.ProjectID = '';
      }
    }
  });

  if (!md.global.Account.projects.length || !projectExists) {
    settings.ProjectID = '';
  }

  return settings;
}

var CreateTask = function (opts) {
  this.settings = getCreateTaskSettings(opts);
  this.init();
};

$.extend(CreateTask.prototype, {
  // 初始化
  init: function () {
    var _this = this;
    var settings = _this.settings;

    _this.modalContainer = document.createElement('div');
    document.body.appendChild(_this.modalContainer);
    _this.modalRoot = createRoot(_this.modalContainer);
    settings.dialog = {
      destroy: () => _this.closeDialog(),
    };
    _this.renderDialog(true);
  },

  renderDialog: function (open) {
    var _this = this;

    if (!_this.modalRoot || _this.dialogDestroyed) return;

    _this.dialogOpen = open;
    _this.modalRoot.render(
      <CreateTaskDialog
        open={open}
        settings={_this.settings}
        onAfterClose={() => _this.destroyDialog()}
        onClose={() => _this.closeDialog()}
        onSubmit={() => submitCreateTask(_this.settings)}
      />,
    );
  },

  closeDialog: function () {
    if (!this.dialogOpen || this.dialogDestroyed) return;

    this.dialogOpen = false;
    this.renderDialog(false);
  },

  destroyDialog: function () {
    if (this.dialogDestroyed) return;

    this.dialogDestroyed = true;
    window.setTimeout(() => {
      this.modalRoot?.unmount();
      this.modalContainer?.remove();
      this.modalRoot = null;
      this.modalContainer = null;
    });
  },
});

CreateTask.Motheds = {
  // 创建
  send: async function (settings) {
    // 附件是否上传完成
    if (!settings.isComplete) {
      alert(_l('文件上传中，请稍等'), 3);
      return false;
    }

    var taskName = settings.TaskName.trim();

    // 名称是否为空
    if (taskName === '') {
      alert(_l('请输入任务名称'), 3);
      document.getElementById('txtTaskName')?.focus();
      return false;
    }

    var startTime = settings.StartTime || undefined;
    var deadline = settings.Deadline || undefined;
    var description = filterXss(settings.Description.replace(/\n/g, '<br/>'));
    var folderID = settings.FolderID === 1 || settings.FolderID === '1' ? '' : settings.FolderID;
    var folderName = (settings.folderName || '').trim();
    var toUserID = settings.ChargeArray[0].accountId;
    var stageId = settings.StageID || '';
    var members = [];
    var specialAccounts = {};

    // 成员
    settings.MemberArray.forEach(function (member) {
      var accountId = member.accountId;
      if (!accountId) return;
      if (accountId.indexOf('MD_SpecialAccounts') >= 0) {
        accountId = accountId.split('MD_SpecialAccounts');
        specialAccounts[accountId[0]] = accountId[1];
      } else {
        members.push(accountId);
      }
    });

    try {
      // 日程转任务
      if (settings.CalenderID) {
        const source = await calendarAjaxRequest.convertCalendarToTask({
          calendarId: settings.CalenderID,
          recurTime: settings.recurTime,
          projectId: settings.ProjectID,
          folderId: folderID,
          folderName: folderName,
          stageId,
          chargeAccountId: toUserID,
          specialAccounts: specialAccounts,
          members: members.join(','),
          taskName,
          summary: description,
          startTime,
          deadline,
          attachments: JSON.stringify(settings.createTaskAttachments.attachmentData),
          knowledgeAtt: JSON.stringify(settings.createTaskAttachments.kcAttachmentData),
        });

        if (source.code === 1) {
          createShare({
            linkURL: pathCompletion('/apps/task/task_' + source.data.taskId),
            content: _l('已转为任务'),
          });
        }

        settings.dialog.destroy();
        return true;
      }

      const source = await ajaxRequest.addTask({
        taskName: taskName,
        stageID: stageId,
        summary: description,
        folderName: folderName,
        folderID,
        chargeAccountID: toUserID,
        specialAccounts: specialAccounts,
        members: members.join(','),
        startTime: startTime,
        deadline: deadline,
        postID: settings.PostID,
        worksheetAndRowId: settings.worksheetAndRowId,
        projectId: settings.ProjectID,
        attachments: JSON.stringify(settings.createTaskAttachments.attachmentData),
        knowledgeAtt: JSON.stringify(settings.createTaskAttachments.kcAttachmentData),
        itemId: settings.itemId,
      });

      if (!source.status || !source.data) throw new Error();

      safeLocalStorageSetItem('lastProjectId', settings.ProjectID);

      source.data.taskName = source.data.name;
      source.data.star = false;
      source.data.stageID = stageId;
      source.data.projectId = settings.ProjectID;
      source.data.projectID = settings.ProjectID;
      source.data.actualStartTime = '';
      source.data.completeTime = '';
      source.data.isNotice = false;
      source.data.stageName = stageId ? settings.StageName : _l('未完成');

      if (settings.relationCallback && _.isFunction(settings.relationCallback)) {
        settings.relationCallback(source.data);
        settings.dialog.destroy();
        return true;
      }

      // 转化任务成功
      if (settings.itemId) {
        createShare({
          linkURL: pathCompletion('/apps/task/task_' + source.data.taskID),
          content: _l('已转为任务'),
        });

        if (settings.callback && _.isFunction(settings.callback)) {
          settings.callback();
        }
      }

      if (location.href.indexOf('task') >= 0) {
        Store.dispatch(addTask(source.data));
        settings.dialog.destroy();
        return true;
      }

      if (settings.callback && _.isFunction(settings.callback)) {
        settings.callback(source);
        if (settings.createShare === true) {
          if (source.data.limitedCount) {
            alert(_l('有%0位外部用户邀请失败，外部用户短信邀请用量达到上限', source.data.limitedCount));
          }

          createShare({
            linkURL: pathCompletion('/apps/task/task_' + source.data.taskID),
            content: _l('任务创建成功'),
          });
        }
      } else if (settings.shareCallback && _.isFunction(settings.shareCallback)) {
        settings.shareCallback(source);
      } else if (!settings.itemId) {
        if (source.data.limitedCount) {
          alert(_l('有%0位外部用户邀请失败，外部用户短信邀请用量达到上限', source.data.limitedCount));
        }

        createShare({
          linkURL: pathCompletion('/apps/task/task_' + source.data.taskID),
          content: _l('任务创建成功'),
        });
      }

      settings.dialog.destroy();
      return true;
    } catch (_requestError) {
      alertIfNotUnauthorized(_requestError, _l('操作失败，请稍后再试'), 2);
      return false;
    }
  },
};

export function submitCreateTask(settings) {
  return CreateTask.Motheds.send(settings);
}

// 导出
export default function (opts) {
  return new CreateTask(opts);
}
