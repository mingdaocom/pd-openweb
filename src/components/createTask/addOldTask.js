import '@mdfe/jquery-ui';
import './css/addOldTask.css';
import { htmlEncodeReg } from 'src/util';
import doT from '@mdfe/dot';
import taskHtml from './tpl/addOldTask.html';
import 'src/components/mdDialog/dialog';
import mdAutocomplete from 'src/components/mdAutocomplete/mdAutocomplete';
import ajaxRequest from 'src/api/taskCenter';

var AddOldTask = function (opts) {
  var defaults = {
    frameid: 'divaddtask',
    TaskID: '',
    PostID: '',
    ProjectID: 'all',
  };
  this.settings = $.extend(defaults, opts);
  this.settings.$el = $(this);
  this.init();
};

$.extend(AddOldTask.prototype, {
  init: function() {
    var _this = this;
    var settings = this.settings;

    var dialogOpts = {
      dialogBoxID: settings.frameid,
      container: {
        header: _l('加入任务'),
        yesText: _l('确认'),
        content: doT.template(taskHtml)(_this.settings),
        yesFn: function() {
          return _this.send();
        },
      },
      width: 460,
      readyFn: function() {
        _this.eventInit();
        $('#txtOldTaskName').focus();
      },
      callback: null,
    };

    settings.dialog = $.DialogLayer(dialogOpts);
    settings.dialog.dialogCenter();
  },
  eventInit: function() {
    var _this = this;
    var settings = _this.settings;

    mdAutocomplete({
      element: 'txtOldTaskName',
      appendTo: '.oldTaskContainer',
      source: ajaxRequest,
      op: 'getMyTaskList',
      data: {
        keywords: '',
        projectId: settings.ProjectID,
      },
      beforeSearch: function(data) {
        data.keywords = $('#txtOldTaskName')
          .val()
          .trim();
      },
      clearBtn: false,
      autoUlStyle: {
        zIndex: 1000,
        width: 370,
        y: 10,
      },
      render: function(source) {
        var list = source;
        var count = source.length;
        if (count > 0) {
          var sb = '';
          $.each(list, function(i, item) {
            sb =
              sb +
              `<li data-id="${item.taskID}" data-name="${htmlEncodeReg(item.taskName)}">
              <span>
              ${htmlEncodeReg(item.taskName)}
              (<font class="ThemeColor3">${htmlEncodeReg(item.userName)}</font>)
              </span></li>
            `;
          });
          return sb;
        }

        return `<li class="searching">${_l('没有搜索到结果')}</li>`;
      },
      select: function($li) {
        $('#txtOldTaskName').val($li.data('name'));
        settings.TaskID = $li.data('id');
      },
    });
  },
  send: function() {
    var settings = this.settings;
    var taskID = settings.TaskID;
    var postID = settings.PostID;
    if (!taskID) {
      alert(_l('请输入并选择一个要加入的任务名称'), 3);
      $('#txtOldTaskName').focus();
      return false;
    }

    ajaxRequest
      .addTaskTopicFromPost({
        taskID: taskID,
        postID: postID,
      })
      .then(function(source) {
        if (source.status) {
          window.location = 'apps/task/task_' + taskID;
        }
      })
      .fail(function() {
        alert(_l('操作失败，请稍后再试'), 2);
      });
  },
});

export default function(opts) {
  return new AddOldTask(opts);
};
