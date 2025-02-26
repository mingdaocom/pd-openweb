import './css/batchTask.less';
import { quickSelectUser, dialogSelectUser } from 'ming-ui/functions';
import '@mdfe/selectize';
import doT from 'dot';
import config from '../../config/config';
import batchTaskTpl from './tpl/batchTask.html';
import { htmlEncodeReg } from 'src/util';
import ajaxRequest from 'src/api/taskCenter';
import Store from 'redux/configureStore';
import { errorMessage, checkIsProject, taskStatusDialog } from '../../utils/utils';
import { afterDeleteTask, afterUpdateTaskDate } from '../../utils/taskComm';
import tagController from 'src/api/tag';
import _ from 'lodash';
import moment from 'moment';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import styled from 'styled-components';
import { LoadDiv, Dialog, Checkbox } from 'ming-ui';
import { renderToString } from 'react-dom/server';

const SearchFolderCon = styled.ul`
  width: 438px;
  background: #fff;
  max-height: 400px;
  padding: 6px 0;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.13), 0 2px 6px rgba(0, 0, 0, 0.1);
  -webkit-box-shadow: 0 4px 20px rgba(0, 0, 0, 0.13), 0 2px 6px rgba(0, 0, 0, 0.1);
  background: #fff;
  padding: 6px 0;
  z-index: 9999;
  position: absolute;
  li {
    cursor: pointer;
    height: 40px;
    line-height: 40px;
    overflow: hidden;
    padding-left: 15px;
    padding-right: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
    position: relative;
    img {
      height: 26px;
      margin-top: 7px;
      vertical-align: top;
      width: 26px;
    }
    .folderName {
      display: inline-block;
      line-height: 40px;
      margin-left: 5px;
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: top;
      white-space: nowrap;
    }
    .folderDetail {
      position: absolute;
      right: 5px;
      top: 0;
      span {
        color: #999;
        font-size: 14px;
        line-height: 40px;
      }
    }
    .icon-folder-public {
      font-size: 18px;
      margin-right: 5px;
      color: #999;
      line-height: 40px;
    }
  }
`;

function SearchFolder(props) {
  const { projectId } = Store.getState().task.taskConfig;
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [flag, setFlag] = useState(false);

  const handleSearch = (value = '') => {
    setLoading(true);
    setFlag(true);
    ajaxRequest
      .getFolderListForUpdateFolderID({
        projectId: projectId,
        pageIndex: 1,
        pageSize: 20,
        keywords: value.trim(),
      })
      .then(res => {
        setLoading(false);
        setData(res.data || []);
      });
  };

  const onChange = _.debounce(handleSearch, 500);

  return (
    <React.Fragment>
      <input
        type="text"
        id="batchTaskFolder"
        class="boderRadAll_3"
        onChange={e => {
          onChange(e.target.value);
        }}
        onFocus={() => {
          !flag && handleSearch('');
        }}
      />
      <SearchFolderCon
        style={{
          display: visible ? 'block' : 'hidden',
        }}
        id="SearchFolderCon"
      >
        {loading ? (
          <LoadDiv size="middle" />
        ) : data.length === 0 ? (
          <li className="emptyItem">{_l('没有搜索到相关结果')}</li>
        ) : (
          <React.Fragment>
            {data.map(item => {
              return (
                <li
                  data-folderid={item.folderID}
                  onClick={() => {
                    if (item.folderID) {
                      $('#batchTask .batchFolderContent').addClass('show').siblings().removeClass('show');
                      $('#batchTask .batchFolderText').text(item.folderName);
                      // 加载权限 关联项目
                      BatchTask.loadBatchData(2);
                      BatchTask.taskAuth('updateFolder', _l('批量修改任务项目'), item.folderID);
                    }
                    setVisible(false);
                  }}
                >
                  <img src={item.charge.avatar} class="chargeUser circle" data-id={item.charge.accountID} />
                  <span className="folderName">{htmlEncodeReg(item.folderName)}</span>
                  <div class="folderDetail">
                    <span className={item.visibility === 0 ? 'icon-folder-private' : 'icon-folder-public'}></span>
                    <span class="folderMemberCount">{item.taskNum}</span>
                  </div>
                </li>
              );
            })}
          </React.Fragment>
        )}
      </SearchFolderCon>
    </React.Fragment>
  );
}

const BatchTask = {};

// 设置
BatchTask.Settings = {
  TaskIds: [],
  authTask: [],
};

BatchTask.initEvent = function () {
  const $batchTask = $('#batchTask');

  // 批量标签
  $batchTask.on('click', '.iconTaskLabel', event => {
    $('#batchTask .categorys').show();
    $('#txtCategory-selectized').focus();
    $batchTask.find('.batchOperator').addClass('Hidden');
    event.stopPropagation();
  });

  // 消息提醒
  $batchTask.on('click', '.iconTaskNoNews', () => {
    BatchTask.loadBatchData();
    BatchTask.updateUserNotice();
  });

  // 锁定任务
  $batchTask.on('click', '.iconTaskNewLocked ', () => {
    BatchTask.loadBatchData(1);
    // 处理数据
    const $iconTaskNewLocked = $('#batchTask .batchIcon.iconTaskNewLocked');
    const lock = $iconTaskNewLocked.find('.icon-task-new-locked').length > 0;
    const title = lock ? _l('批量锁定任务') : _l('批量解锁任务');
    // 权限判断
    BatchTask.taskAuth('updateTaskLocked', title, lock);
  });

  // 更多
  $batchTask.on('click', '.batchMore', event => {
    $batchTask.find('.batchOperator').toggleClass('Hidden');
  });

  // 删除任务
  $batchTask.on('click', '#batchDelTask', () => {
    BatchTask.loadBatchData(1);

    Dialog.confirm({
      dialogClasses: 'deleteTaskBox',
      title: _l('彻底删除任务'),
      closable: false,
      children: (
        <div className="Font14 mBottom20">
          {_l('注意：此操作将彻底删除任务数据，无法恢复。')}
          <span className="deleteFolderColor">{_l('请确认您和任务的其他参与者都不再需要任务中的数据再行删除')}</span>
        </div>
      ),
      okText: _l('删除'),
      onOk: () => {
        const minorContent = (
          <div className="checkBox overDateBatch">
            <span
              className="btnCk"
              onClick={e => {
                $(e.target).toggleClass('selected');
              }}
            >
              {_l('同时删除任务下的子任务')}
            </span>
          </div>
        );
        BatchTask.taskAuth('DelTask', _l('批量删除任务'), null, minorContent);
      },
    });
  });

  // 批量修改项目
  $batchTask.on('click', '.batchFolderContent .folderNameEdit, .batchFolderContent .batchFolderText', () => {
    $('.batchFolder .batchFolderContent').removeClass('show');
    $('#batchTask .autoBatchFolder').addClass('show');
    $('#batchTaskFolder').focus();
    const root = createRoot(document.querySelector('.barchTaskMain .autoBatchFolder'));
    root.render(<SearchFolder />);
  });

  // 现在开始
  $batchTask.on('click', '.detailTimeNowStart', () => {
    BatchTask.loadBatchData(2);
    BatchTask.taskAuth('updateTasksActualStartTime', _l('将开始所有选中的未启动的任务？'));
  });

  // 标记完成 未完成
  $batchTask.on('click', '.taskDetailStatusBtn', function () {
    // 任务权限
    BatchTask.loadBatchData(2);
    // 是否完成
    const mark = !$(this).hasClass('active');
    const title = mark ? _l('标记完成') : _l('标记未完成');
    // 修改任务状态
    BatchTask.taskAuth('updateTaskStatus', title, mark);
  });

  // 修改任务负责人
  $batchTask.on('click', '.batchCharge', function () {
    const $this = $(this);
    let size = 0;
    let projectId = $('.selectTask:first').attr('data-projectid');
    $.map($('.selectTask'), (_this, i) => {
      if ($(_this).attr('data-projectid') === projectId) {
        size++;
      }
    });
    projectId = size === $('.selectTask').length ? projectId : '';
    dialogSelectUser({
      sourceId: Store.getState().task.taskConfig.folderId,
      fromType: 2,
      showMoreInvite: false,
      SelectUserSettings: {
        projectId: checkIsProject(projectId) ? projectId : '',
        unique: true,
        callback(users) {
          // 成员权限
          BatchTask.loadBatchData(2);
          // 修改
          BatchTask.taskAuth('updateCharge', _l('批量更改主负责人'), users[0]);
        },
      },
    });
  });

  // 批量添加任务成员
  $batchTask.on('click', '#batchAddTask', function () {
    const $this = $(this);

    const callback = function (users) {
      // 成员权限
      BatchTask.loadBatchData();
      // 修改
      BatchTask.addMembers(users);
    };

    let size = 0;
    const existsIds = [];
    let projectId = $('.selectTask:first').attr('data-projectid');
    $.map($('.selectTask'), (_this, i) => {
      if ($(_this).attr('data-projectid') === projectId) {
        size++;
      }
    });
    projectId = size === $('.selectTask').length ? projectId : '';
    $('.barchTaskContent .members .singleuser').each(function () {
      existsIds.push($(this).attr('data-accountid'));
    });
    quickSelectUser($this[0], {
      sourceId: Store.getState().task.taskConfig.folderId,
      fromType: 2,
      offset: {
        top: 25,
        left: 0,
      },
      zIndex: 10001,
      showMoreInvite: false,
      selectedAccountIds: existsIds,
      SelectUserSettings: {
        selectedAccountIds: existsIds,
        projectId: checkIsProject(projectId) ? projectId : '',
        callback,
      },
      selectCb: callback,
    });
  });

  // 任务星星
  $batchTask.on('click', '#batchFavorite', function () {
    const isStar = !$(this).hasClass('icon-task-star');
    // 加载数据
    BatchTask.loadBatchData();
    // 修改任务星星
    BatchTask.updateTaskFavorite(isStar);
  });

  // 文档点击
  $(document).on('click', event => {
    const $target = $(event.target);
    // 头部更多
    if ($target.closest('.batchMore').length <= 0) {
      $batchTask.find('.batchOperator').addClass('Hidden');
    }

    // 联想项目
    if ($target.closest('.autoBatchFolder').length <= 0 && !$target.is('.folderNameEdit,.icon-edit,.batchFolderText')) {
      // 隐藏 联想项目
      $('.batchFolder .batchFolderContent').addClass('show');
      $('#batchTask .autoBatchFolder').removeClass('show');
    }
  });
};

// 加载任务 以后可能扩展
BatchTask.loadTask = function () {
  $('#backTaskCount').text($('#taskList .selectTask').length);
  const isComplete =
    $('#taskList .selectTask .markTask').length == $('#taskList .selectTask .markTask.completeHook').length;

  $('#batchTask .taskDetailStatusBtn').toggleClass('active', isComplete);

  if (isComplete) {
    $('#batchTaskNoStart').addClass('Hidden');
    $('#batchTaskComplete').removeClass('Hidden');
  }
};

// 根据权限加载数据   1 负责人 2  成员
BatchTask.loadBatchData = function (auth) {
  const { folderId, viewType } = Store.getState().task.taskConfig;
  const $tasks = $('#taskList .selectTask');
  let $item;
  let itemAuth;
  let $itemParent;
  BatchTask.Settings.authTask.length = 0;
  BatchTask.Settings.TaskIds.length = 0;

  const isAuth = auth === config.auth.Charger || auth === config.auth.Member;
  // 列表
  if (!folderId) {
    $.each($tasks, (i, item) => {
      $item = $(item);
      BatchTask.Settings.TaskIds.push($item.data('taskid'));
      itemAuth = $item.data('auth');
      // 成员或者负责人
      if (isAuth) {
        // 权限判断
        if (
          (auth === config.auth.Charger && itemAuth !== config.auth.Charger) ||
          (itemAuth !== config.auth.Member && itemAuth !== config.auth.Charger && auth === config.auth.Member)
        ) {
          const avatar = $item.find('.chargeTd img').attr('src') || md.global.Account.avatar;
          BatchTask.Settings.authTask.push({
            TaskID: $item.data('taskid'),
            status: $item.find('.markComplete .markTask').hasClass('markComplete'),
            TaskName: $item.find('.taskListName .spanName').attr('title'),
            avatar,
          });
        }
      }
    });
  } else if (viewType === config.folderViewType.treeView) {
    $.each($tasks, (i, item) => {
      $item = $(item);
      $itemParent = $item.parent();
      BatchTask.Settings.TaskIds.push($itemParent.data('taskid'));
      itemAuth = $itemParent.data('auth');
      // 权限判断
      if (
        (auth === config.auth.Charger && itemAuth !== config.auth.Charger) ||
        (itemAuth !== config.auth.Member && itemAuth !== config.auth.Charger && auth === config.auth.Member)
      ) {
        BatchTask.Settings.authTask.push({
          TaskID: $itemParent.data('taskid'),
          status: $item.find('.treeMark .markTask').hasClass('completeHook'),
          TaskName: $item.find('.taskListNameBox .spanName').attr('title'),
          avatar: $item.find('.chargeTd img').attr('src'),
        });
      }
    });
  } else {
    $.each($tasks, (i, item) => {
      $item = $(item);
      BatchTask.Settings.TaskIds.push($item.data('taskid'));
      itemAuth = $item.data('auth');
      // 权限判断
      if (
        (auth === config.auth.Charger && itemAuth !== config.auth.Charger) ||
        (itemAuth !== config.auth.Member && itemAuth !== config.auth.Charger && auth === config.auth.Member)
      ) {
        BatchTask.Settings.authTask.push({
          TaskID: $item.data('taskid'),
          status: $item.find('.markTask ').hasClass('completeHook'),
          TaskName: $item.find('.listStageTaskName').attr('title'),
          avatar: $item.find('.chargeHeaderAvatar').attr('src'),
        });
      }
    });
  }
};

// 显示弹出层
BatchTask.bindDialog = function () {
  const { projectId } = Store.getState().task.taskConfig;
  $('#batchTask')
    .addClass('slideLeft')
    .html(renderToString(<LoadDiv />));

  let lockedSize = 0;
  $.map($('.selectTask'), (_this, i) => {
    if ($(_this).find('.lockToOtherTask').length) {
      lockedSize++;
    }
  });
  const isLocked = lockedSize < $('.selectTask').length;

  $('#batchTask')
    .off()
    .html(
      doT.template(batchTaskTpl)({
        isShowChargeFolder: !!projectId,
        isLocked,
      }),
    );

  const root = createRoot(document.querySelector('.barchTaskMain .autoBatchFolder'));
  root && root.render(<SearchFolder />);

  // 批量标签绑定事件
  config.selectize = $('#txtCategory').selectize({
    valueField: 'id',
    plugins: ['remove_button'],
    delimiter: ',',
    persist: false,
    placeholder: _l('+ 添加标签'),
    create(text) {
      return {
        id: 'createNewTagsID',
        text,
      };
    },
    options: [],
    items: [],
    preload: 'focus',
    render: {
      option(data, escape) {
        return (
          '<div class="option"><span class="tagsIcon" style="background:' +
          data.color +
          '"></span>' +
          escape(data.text) +
          '</div>'
        );
      },
      item(data, escape) {
        return (
          '<div class="item selectizeiItem"><span class="tagsIcon" style="background:' +
          (data.color || 'transparent') +
          ';width:' +
          (data.color ? '10px' : '0px') +
          '"></span><span class="tagName">' +
          escape(data.text) +
          '</span></div>'
        );
      },
      option_create(data, escape) {
        return '<div class="create">' + _l('创建标签') + '<strong>' + escape(data.input) + '</strong></div>';
      },
    },
    load(keywords, callback) {
      ajaxRequest.getTagsByTaskID({ taskID: '', keywords }).then(source => {
        const selectize = config.selectize[0].selectize || {};
        const selectTags = $('#txtCategory').val().split(',');

        $.map(Object.keys(selectize.options), key => {
          if (selectTags.indexOf(selectize.options[key].id) < 0) {
            selectize.removeOption(key);
          }
        });
        const list = [];
        $.map(source.data, item => {
          list.push({ text: item.tagName, id: item.tagID, color: item.color });
        });
        callback(list);
      });
    },
    onItemAdd(tagID, $item) {
      tagController
        .addTaskTag2({
          taskIds: BatchTask.getAllTaskIds(),
          tagName: $item.find('.tagName').text(),
          tagID: tagID === 'createNewTagsID' ? '' : tagID,
        })
        .then(data => {
          if (data) {
            if (tagID === 'createNewTagsID') {
              const $tagList = $('#txtCategory');
              config.selectize[0].selectize.updateOption('createNewTagsID', {
                id: data.id,
                text: data.value,
                color: data.extra,
              });
              $tagList.attr('value', $tagList.val().replace('createNewTagsID', data.id));
            }
          } else {
            config.selectize[0].selectize.removeOption(tagID || 'createNewTagsID');
          }
        });
    },
    onDelete(tagID) {
      const selectize = config.selectize[0].selectize;

      $('#txtCategory-selectized').blur();
      tagController
        .removeTasksTag({
          sourceIds: BatchTask.getAllTaskIds(),
          tagId: tagID[0],
        })
        .then(data => {
          if (data.state === 0) {
            selectize.addOption([selectize.options[tagID[0]]]);
          }
        });
    },
  });

  BatchTask.loadTask();
  BatchTask.initEvent();
};

BatchTask.getAllTaskIds = function () {
  const allTaskIds = [];
  $.map($('.selectTask'), (_this, i) => {
    allTaskIds.push($(_this).data('taskid'));
  });

  return allTaskIds;
};

// 批量修改任务提醒状态
BatchTask.updateUserNotice = function () {
  const $iconTaskNoNews = $('#batchTask .batchIcon.iconTaskNoNews');
  const notice = $iconTaskNoNews.hasClass('close');
  ajaxRequest
    .batchUpdateTaskMemberNotice({
      taskIDstr: BatchTask.Settings.TaskIds.join(','),
      notice,
    })
    .then(source => {
      if (source.status) {
        alert(notice ? _l('已开启任务提醒') : _l('已关闭任务提醒'));
        if (notice) {
          $iconTaskNoNews.removeClass('close');
          $iconTaskNoNews.attr('data-tip', _l('批量关闭消息提醒')).data('bindDate', false);
        } else {
          $iconTaskNoNews.addClass('close');
          $iconTaskNoNews.attr('data-tip', _l('批量打开消息提醒')).data('bindDate', false);
        }
      } else {
        errorMessage(source.error);
      }
    });
};

// 批量锁定任务 isAuth 是否验证过权限
BatchTask.updateTaskLocked = function (lock, isAuth) {
  ajaxRequest
    .batchUpdateTaskLocked({
      taskIDstr: BatchTask.Settings.TaskIds.join(','),
      locked: lock,
    })
    .then(source => {
      if (source.status) {
        // 批量的锁处理
        const $iconTaskNoNews = $('#batchTask .batchIcon.iconTaskNewLocked');
        if (lock) {
          $iconTaskNoNews.find('i').removeClass('icon-task-new-locked').addClass('icon-task-new-no-locked');
          $iconTaskNoNews.attr('data-tip', _l('批量解锁任务')).data('bindDate', false);
        } else {
          $iconTaskNoNews.find('i').addClass('icon-task-new-locked').removeClass('icon-task-new-no-locked');
          $iconTaskNoNews.attr('data-tip', _l('批量锁定任务')).data('bindDate', false);
        }

        const noAuth = source.data.noAuth;
        // 部分成功
        if (noAuth && noAuth.length > 0) {
          // 生成没有权限的任务
          BatchTask.builAuthTask(
            source,
            {
              lock,
            },
            'lockTask',
            _l('含有无法修改的任务'),
          );
        } else {
          if (lock) {
            $iconTaskNoNews.find('i').removeClass('icon-task-new-locked').addClass('icon-task-new-no-locked');
            $iconTaskNoNews.attr('data-tip', _l('批量锁定任务')).data('bindDate', false);
            // 加锁
            $('#taskList .selectTask .markTask').addClass('lockToOtherTask');
          } else {
            $iconTaskNoNews.find('i').addClass('icon-task-new-locked').removeClass('icon-task-new-no-locked');
            $iconTaskNoNews.attr('data-tip', _l('批量锁定任务')).data('bindDate', false);
            // 加锁
            $('#taskList .selectTask .markTask').removeClass('lockToOtherTask');
          }
        }
      } else {
        errorMessage(source.error);
      }
    });
};

// 批量删除任务
BatchTask.DelTask = function (isAuth) {
  const isDelSubTask = $('.overDateBatch .btnCk').hasClass('selected');
  ajaxRequest
    .batchDeleteTask({
      taskIDstr: BatchTask.Settings.TaskIds.join(','),
      isSubTask: isDelSubTask,
    })
    .then(source => {
      if (source.status) {
        // 成功的任务
        const allTask = source.DeleteTaskID;
        if (allTask) {
          $.each(allTask, (i, taskId) => {
            afterDeleteTask([taskId]);
          });
        }
        const noAuth = source.data.noAuth;
        // 部分成功
        if (noAuth && noAuth.length) {
          // 生成没有权限的任务
          BatchTask.builAuthTask(source, {}, 'DelTask', _l('含有无法修改的任务'));
        } else {
          if (source.fail && source.fail.length) {
            alert(_l('删除失败'), 3);
          } else {
            if (source.data.success.length) {
              $.each(source.data.success, (i, taskId) => {
                afterDeleteTask([taskId]);
              });
              alert(_l('删除成功'));
            }
          }
        }

        // 如果没有任务了 收起批量的层
        if ($('#taskList .selectTask').length <= 0) {
          $('#taskList .selectTask').removeClass('selectTask ThemeBGColor6');
          $('#batchTask').removeClass('slideLeft');
          $('#tasks').removeClass('slideDetail');
        }
      } else {
        errorMessage(source.error);
      }
    });
};

// 批量现在开始任务
BatchTask.updateTasksActualStartTime = function (isAuth) {
  ajaxRequest
    .updateTasksActualStartTime({
      taskIds: BatchTask.Settings.TaskIds,
      actualStartTime: moment().format('YYYY-MM-DD HH:00'),
    })
    .then(source => {
      if (source.status) {
        const noAuth = source.data.noAuth;
        // 部分成功
        if (noAuth && noAuth.length) {
          // 生成没有权限的任务
          BatchTask.builAuthTask(source, {}, 'UpdateActualStartTime', _l('将开始所有选中的未启动的任务？'));
        } else {
          $('#batchTaskNoStart .detailTimeLabel').html(_l('进行中'));
          $('#batchTaskNoStart .detailTimeLabelText').html(_l('实际开始于%0', moment().format('MMMDo HH:00')));
          $('#batchTaskNoStart .icon-watch_later').removeClass().addClass('icon-go_out');
          alert(_l('操作成功'));
        }
        const successIds = [];
        BatchTask.Settings.TaskIds.forEach(id => {
          if (!_.includes(noAuth, id)) {
            successIds.push({ taskId: id });
          }
        });
        successIds.forEach(item => {
          $('#taskList')
            .find("tr[data-taskid='" + item.taskId + "'], li[data-taskid='" + item.taskId + "']")
            .find('.deteLine')
            .data('actdate', moment().format('YYYY-MM-DD HH:00'));
        });
        afterUpdateTaskDate(successIds);
      } else {
        errorMessage(source.error);
      }
    });
};

// 更新项目
BatchTask.updateFolder = function (folderId, isAuto) {
  ajaxRequest
    .batchUpdateTaskFolderID({
      taskIDstr: BatchTask.Settings.TaskIds.join(','),
      folderID: folderId,
    })
    .then(source => {
      if (source.status) {
        alert(_l('操作成功'));
      } else {
        errorMessage(source.error);
      }
    });
};

// 批量修改任务状态
BatchTask.updateTaskStatus = function (status, isAuth) {
  taskStatusDialog(status, () => {
    const taskStatusFun = function (isAllSubTask) {
      ajaxRequest
        .batchUpdateTaskStatus({
          taskIDstr: BatchTask.Settings.TaskIds.join(','),
          status: status ? 1 : 0,
          isSubTask: isAllSubTask,
        })
        .then(source => {
          if (source.status) {
            const noAuth = source.data.noAuth;
            // 部分成功
            if (noAuth && noAuth.length) {
              // 生成没有权限的任务
              BatchTask.builAuthTask(
                source,
                {
                  status,
                },
                'markTask',
                _l('含有无法修改的任务'),
              );
            } else {
              // 标记完成
              if (status == 1) {
                $('#taskList .selectTask .markTask').addClass('completeHook').attr('data-tip', _l('标记未完成'));
                $('#taskList .selectTask .spanName').addClass('completeTask');
                $('#batchTask .taskDetailStatusBtn').addClass('active');
                $('#batchTaskNoStart').addClass('Hidden');
                $('#batchTaskComplete').removeClass('Hidden');
                $('#batchTaskComplete .detailTimeLabelText').html(_l('实际结束于%0', moment().format('MMMDo HH:mm')));
                alert(_l('已标记完成'));
              } else {
                $('#taskList .selectTask .markTask').removeClass('completeHook').attr('data-tip', _l('标记完成'));
                $('#taskList .selectTask .spanName').removeClass('completeTask');
                $('#batchTask .taskDetailStatusBtn').removeClass('active');
                $('#batchTaskNoStart').removeClass('Hidden');
                $('#batchTaskComplete').addClass('Hidden');
                alert(_l('已标记未完成'));
              }
            }
          } else {
            errorMessage(source.error);
          }
        });
    };

    Dialog.confirm({
      closable: false,
      dialogClasses: 'updateTaskStatusDialog',
      title: status ? _l('将选中的任务标为已完成1') : _l('将选中的任务标为未完成1'),
      okText: _l('确定'),
      children: (
        <Checkbox
          className="Gray_9"
          defaultChecked={false}
          text={status ? _l('同时将子任务标为已完成') : _l('同时将子任务标为未完成')}
        />
      ),
      onOk: () => {
        const isAllSubTask = $('.updateTaskStatusDialog .Checkbox').is('.checked');
        taskStatusFun(isAllSubTask);
      },
    });
  });
};

// 修改任务负责人
BatchTask.updateCharge = function (account) {
  ajaxRequest
    .batchUpdateTaskCharge({
      taskIDstr: BatchTask.Settings.TaskIds.join(','),
      charge: account.accountId,
    })
    .then(source => {
      if (source.status) {
        const noAuth = source.data.noAuth;
        // 部分成功
        if (noAuth && noAuth.length) {
          // 生成没有权限的任务
          BatchTask.builAuthTask(source, account, 'charge', _l('含有无法修改的任务'));
        } else {
          const $selectTask = $('#taskList .selectTask');

          if ($selectTask.length > 0) {
            $selectTask.find('.chargeImg').attr('src', account.avatar).data('accountid', account.accountId);
            $('#batchTask .batchCharge').attr('src', account.avatar.replace(/\d{2}\//g, '48/'));
          }
          alert(_l('操作成功'));
        }
      } else {
        errorMessage(source.error);
      }
    });
};

// 批量添加任务成员
BatchTask.addMembers = function (users, callbackInviteResult) {
  const userIdArr = [];
  const specialAccounts = {};

  // 外部用户
  if ($.isFunction(callbackInviteResult)) {
    $.each(users, (i, item) => {
      specialAccounts[item.account] = item.fullname;
    });
  } else {
    $.each(users, (i, item) => {
      userIdArr.push(item.accountId);
    });
  }

  ajaxRequest
    .batchAddTaskMember({
      taskIDstr: BatchTask.Settings.TaskIds.join(','),
      memberstr: userIdArr.join(','),
      specialAccounts: specialAccounts,
    })
    .then(source => {
      if ($.isFunction(callbackInviteResult)) {
        callbackInviteResult({ status: source.status });
      }

      if (source.status) {
        if (source.data) {
          let memberHtml = '';
          $.map(source.data.successMember || [], user => {
            memberHtml +=
              '<span class="singleuser circle" data-accountid="' +
              user.accountID +
              '"><img class="circle" src="' +
              user.avatar +
              '" /> </span>';
          });
          $('#batchAddTask').before(memberHtml);
          if (source.data.limitedCount) {
            alert(_l('有%0位外部用户邀请失败。外部用户短信邀请用量达到上限。', source.data.limitedCount), 3);
          } else if (source.data.successMember && source.data.successMember.length) {
            alert(_l('添加成功'));
          } else {
            alert(_l('用户已存在，请勿重复添加'), 3);
          }
        }
      } else {
        errorMessage(source.error);
      }
    });
};

// 批量修改任务星星
BatchTask.updateTaskFavorite = function (isStar) {
  ajaxRequest
    .batchUpdateTaskMemberStar({
      taskIDstr: BatchTask.Settings.TaskIds.join(','),
      star: isStar,
    })
    .then(source => {
      if (source.status) {
        alert(_l('修改成功'));
        $('#batchFavorite').toggleClass('icon-task-star icon-star-hollow');
        const starSize = $('#taskList .selectTask .taskStar.icon-task-star').length;
        const $allCountTask = $('.aboutMeStar .allCountTask');
        let count = parseInt($allCountTask.text() || 0, 10);

        if (isStar) {
          $('#taskList .selectTask .taskStar').addClass('icon-task-star').removeClass('icon-star-hollow');
          count = count + BatchTask.Settings.TaskIds.length - starSize;
        } else {
          $('#taskList .selectTask .taskStar').removeClass('icon-task-star').addClass('icon-star-hollow');
          count = count - starSize;
        }

        $allCountTask.text(count <= 0 ? '' : count);
      } else {
        errorMessage(source.error);
      }
    });
};

// 批量删除任务成员
BatchTask.deleteTasksMember = function (accountID) {
  ajaxRequest
    .batchDeleteTaskMember({
      taskIDstr: BatchTask.Settings.TaskIds.join(','),
      accountID,
    })
    .then(source => {
      if (source.status) {
        alert(_l('删除成功'));
        // 移除成员
        $("#batchTask .members span[data-accountID='" + accountID + "']").remove();
      } else {
        errorMessage(source.error);
      }
    });
};

// 任务权限
BatchTask.taskAuth = function (type, title, args, minorContent) {
  const taskCount = BatchTask.Settings.authTask.length;

  if (taskCount > 0) {
    Dialog.confirm({
      title: title,
      dialogClasses: 'afterUpdate',
      okText: _l('跳过，继续修改'),
      cancelText: _l('取消'),
      footer: (
        <div>
          <div className="footer">
            <a
              className="noText ThemeHoverColor3"
              onClick={() => {
                $('.afterUpdate').parent().remove();
              }}
            >
              {_l('取消')}
            </a>
            <a
              className="yesText boderRadAll_3 ThemeBGColor3"
              onClick={() => {
                // 批量修改任务负责人
                BatchTask[type](args, true);
                $('.afterUpdate').parent().remove();
              }}
            >
              {_l('跳过，继续修改')}
            </a>
          </div>
          <div className="TxtLeft">{minorContent}</div>
        </div>
      ),
      children: (
        <React.Fragment>
          <div className="tipTitle">{_l('有%0条任务被锁定且你不具有负责人权限，无法被修改', taskCount)}</div>
          <div className="authTaskBox">
            {BatchTask.Settings.authTask.map(item => (
              <div className="authTask">
                <span className="markTask lockTask"></span>
                <img className="circle batchAvatar" src={item.avatar} />
                <span className="batchName overflow_ellipsis">{item.TaskName}</span>
              </div>
            ))}
          </div>
        </React.Fragment>
      ),
    });
  } else {
    // 执行
    BatchTask[type](args);
  }
};

// 生成没有权限的任务
BatchTask.builAuthTask = function (data, args, type, title) {
  const { folderId, viewType } = Store.getState().task.taskConfig;
  const noAuth = data.data.noAuth;
  // 部分成功
  if (noAuth && noAuth.length) {
    const $selectTasks = $('#taskList .selectTask');
    let $item;
    let taskId;
    const authObj = [];
    let avatar;

    $.each($selectTasks, (i, item) => {
      $item = $(item);
      // 项目
      if (!folderId) {
        taskId = $item.data('taskid');
        if ($.inArray(taskId, noAuth) > -1) {
          avatar = $item.find('.chargeTd img').attr('src') || md.global.Account.avatar;
          authObj.push({
            TaskID: $item.data('taskid'),
            TaskName: $item.find('.taskListName .spanName').attr('title'),
            avatar,
          });
        } else {
          // 部分处理
          BatchTask.afterUpdatePart($item, type, args);
        }
      } else {
        if (viewType === config.folderViewType.treeView) {
          taskId = $item.parent().data('taskid');
          if ($.inArray(taskId, noAuth) > -1) {
            authObj.push({
              TaskID: taskId,
              TaskName: $item.find('.taskListNameBox .spanName').attr('title'),
              avatar: $item.find('.chargeTd img').attr('src'),
            });
          } else {
            // 部分处理
            BatchTask.afterUpdatePart($item, type, args);
          }
        } else {
          taskId = $item.data('taskid');
          if ($.inArray(taskId, noAuth) > -1) {
            authObj.push({
              TaskID: $item.data('taskid'),
              TaskName: $item.find('.listStageTaskName').attr('title'),
              avatar: $item.find('.chargeHeaderAvatar').attr('src'),
            });
          } else {
            // 部分处理
            BatchTask.afterUpdatePart($item, type, args);
          }
        }
      }
    });

    // 存在且 未验证
    if (authObj.length) {
      BatchTask.showAuthTask(authObj, title, type);
    }
  }
};

// 部分更新
BatchTask.afterUpdatePart = function ($item, type, args) {
  let taskId;
  // 批量标记完成
  if (type === 'markTask') {
    // 标记完成
    if (args.status == 1) {
      $item.find('.markTask').addClass('completeHook').attr('data-tip', _l('标记未完成'));
    } else {
      $item.find('.markTask').removeClass('completeHook').attr('data-tip', _l('标记完成'));
    }
  } else if (type === 'lockTask') {
    if (args.lock) {
      $item.find('.markTask').addClass('lockToOtherTask');
    } else {
      $item.find('.markTask').removeClass('lockToOtherTask');
    }
  } else if (type === 'DelTask') {
    taskId = BatchTask.getTaskIdByItem($item);
    afterDeleteTask([taskId]);
  } else if (type === 'charge') {
    $item.find('.chargeImg').attr('src', args.avatar).data('accountid', args.accountId);
  }
};

// 获取任务Id
BatchTask.getTaskIdByItem = function ($item) {
  let taskId;
  if (!Store.getState().task.taskConfig.folderId) {
    taskId = $item.data('taskid');
  } else {
    taskId = $item.parent().data('taskid');
  }
  return taskId;
};

// 显示没有权限的任务
BatchTask.showAuthTask = function (authObj, title, type) {
  const taskCount = authObj.length;
  if (taskCount) {
    Dialog.confirm({
      title: title,
      dialogClasses: 'afterUpdateMsg',
      children: (
        <React.Fragment>
          {type === 'UpdateActualStartTime' ? (
            <div className="tipTitle">{_l('有%0条任务未设置计划开始时间，无法开始任务', taskCount)}</div>
          ) : (
            <div className="tipTitle">{_l('有%0条任务被锁定且你不具有负责人权限，无法被修改', taskCount)}</div>
          )}
          <div className="authTaskBox">
            {authObj.map(item => (
              <div className="authTask">
                {type !== 'UpdateActualStartTime' && <span className="markTask lockTask"></span>}
                <img className="circle batchAvatar" src={item.avatar} />
                <span className="batchName overflow_ellipsis">{item.TaskName}</span>
              </div>
            ))}
          </div>
        </React.Fragment>
      ),
      okText: _l('我知道了'),
    });
  }
};

// 选择任务
BatchTask.shiftCtrlKey = function ($el, type) {
  const { folderId, viewType } = Store.getState().task.taskConfig;
  $('body').addClass('userSelect');
  // 列表
  if (!folderId) {
    BatchTask.shiftCtrlKeyList($el, type);
  } else if (viewType === config.folderViewType.treeView) {
    BatchTask.shiftCtrlKeyTree($el, type); // 子母
  } else {
    BatchTask.shiftCtrlKeyStage($el, type); // 阶段
  }

  $('#tasks').addClass('slideDetail');

  if (!$('#batchTask').hasClass('slideLeft')) {
    // 绑定弹出层
    BatchTask.bindDialog();
  } else {
    BatchTask.loadTask();
  }
};

// 列表 shift Ctrl
BatchTask.shiftCtrlKeyList = function (_this, type) {
  if (type == 'ctrl') {
    // 节点赋值
    config.$prevNode = _this;
    _this.toggleClass('selectTask ThemeBGColor6');

    if ($('#taskList .selectTask').length <= 0) {
      _this.toggleClass('selectTask ThemeBGColor6');
    }
  } else {
    // 直接shift 没有选中过
    if (!config.$prevNode) {
      config.$prevNode = $('#taskList table:first tr:first');
    }

    if (type == 'shift') {
      // 移除全部样式
      $('#taskList table tr').removeClass('selectTask ThemeBGColor6');
    }

    _this.addClass('selectTask ThemeBGColor6');
    config.$prevNode.addClass('selectTask ThemeBGColor6');

    if (!config.$prevNode.is(_this)) {
      if ($('.listStageTaskContent').length < 2) {
        // 向下
        if (_this.offset().top > config.$prevNode.offset().top) {
          _this.prevUntil(config.$prevNode).addClass('selectTask ThemeBGColor6');
        } else {
          _this.nextUntil(config.$prevNode).addClass('selectTask ThemeBGColor6');
        }
        config.$prevNode = _this;
      } else {
        // 用到的变量
        let thisTop = _this.offset().top;
        let prevTop = config.$prevNode.offset().top;
        let $tr = config.$prevNode;
        let $prevTr = config.$prevNode;

        config.$prevNode = _this;

        // 向上
        if (thisTop < prevTop) {
          // 交换元素
          const $swap = _this;
          _this = $prevTr;
          $prevTr = $swap;

          thisTop = _this.offset().top;
          prevTop = $prevTr.offset().top;
          $tr = $prevTr;
        }

        let $next;
        // 循环
        while (prevTop <= thisTop) {
          $tr.addClass('selectTask ThemeBGColor6');
          $next = $tr.next();
          if ($next.length <= 0 && prevTop <= thisTop) {
            $tr = $tr.closest('.listStageTaskContent').next().next().find('tr:first');
          } else {
            $tr = $next;
          }
          if ($tr.length > 0) {
            prevTop = $tr.offset().top;
          } else {
            prevTop += 900;
          }
        }
      }
    } else {
      config.$prevNode = _this;
    }
  }
};

// tree shift ctrl
BatchTask.shiftCtrlKeyTree = function (_this, type) {
  if (type === 'ctrl') {
    // 节点赋值
    config.$prevNode = _this;
    _this.toggleClass('selectTask ThemeBGColor6');
  } else {
    // 所有任务
    const $allSingleTreeTask = $('.singleFolderTask  .singleTreeTask');

    // 直接shift 没有选中过
    if (!config.$prevNode) {
      config.$prevNode = $('.singleFolderTask li:first .singleTreeTask:first');
    }
    if (type === 'shift') {
      // 移除全部样式
      $('.singleFolderTask  .singleTreeTask').removeClass('selectTask ThemeBGColor6');
    }

    if (!config.$prevNode.is(_this)) {
      let thisTop = _this.offset().top;
      let prevTop = config.$prevNode.offset().top;
      let $prevNode = config.$prevNode;
      // 下面可以改变 要提前赋值
      config.$prevNode = _this;
      // 向上
      if (thisTop < prevTop) {
        // 交换元素
        const $swap = _this;
        _this = $prevNode;
        $prevNode = $swap;

        thisTop = _this.offset().top;
        prevTop = $prevNode.offset().top;
      }

      const $singleTreeTask = $('.singleTreeTask');
      const singleCount = $singleTreeTask.length;
      let $task;

      for (let i = 0; i < singleCount; i++) {
        $task = $singleTreeTask.eq(i);

        if ($task.offset().top >= prevTop) {
          $task.addClass('selectTask ThemeBGColor6');
        }

        if ($task.offset().top >= thisTop) {
          i = 100000;
        }
      }
    } else {
      _this.parent().find('.singleTreeTask').addClass('selectTask ThemeBGColor6');
    }
  }
};

// stage ctrl shift
BatchTask.shiftCtrlKeyStage = function (_this, type) {
  if (type === 'ctrl') {
    // 节点赋值
    config.$prevNode = _this;
    _this.toggleClass('selectTask ThemeBGColor6');
  } else {
    let $prevNode = config.$prevNode;

    // 直接shift 没有选中过
    if (!config.$prevNode) {
      $prevNode = config.$prevNode = _this.closest('.listStageContent').find('li:first');
    }

    if (!config.$prevNode.closest('.listStageContent').is(_this.closest('.listStageContent'))) {
      $prevNode = _this.closest('.listStageContent').find('li:first');
    }

    // 当前点击
    config.$prevNode = _this;

    if (type === 'shift') {
      // 移除全部样式
      $('#taskList .selectTask').removeClass('selectTask ThemeBGColor6');
    }

    // 用到的变量
    let thisTop = _this.offset().top;
    let prevTop = $prevNode.offset().top;

    // 向上
    if (thisTop < prevTop) {
      // 交换元素
      const $swap = _this;
      _this = $prevNode;
      $prevNode = $swap;

      thisTop = _this.offset().top;
      prevTop = $prevNode.offset().top;
    }

    let $next;
    // 循环
    while (prevTop <= thisTop) {
      $prevNode.addClass('selectTask ThemeBGColor6');
      $prevNode = $prevNode.next();
      if ($prevNode.length <= 0) {
        prevTop = 1000000;
      } else {
        prevTop = $prevNode.offset().top;
      }
    }
  }
};

export default BatchTask;
