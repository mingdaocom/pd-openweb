import React from 'react';
import ReactDom from 'react-dom';
import Score from 'ming-ui/components/Score';
import ajaxRequest from 'src/api/taskCenter';
import { errorMessage, taskStatusDialog, getCurrentTime, formatTaskTime, formatStatus, checkIsProject, returnCustonValue } from './utils';
import 'mdDialog';
import Store from 'redux/configureStore';
import doT from 'dot';
import { addTask } from '../redux/actions';
import singleFolder from '../containers/taskNavigation/tpl/singleFolder.html';
import singleFolderComm from '../containers/taskNavigation/tpl/singleFolderComm.html';
import { navigateTo } from 'src/router/navigateTo';
import DeleteReconfirm from 'ming-ui/components/DeleteReconfirm';
import { htmlEncodeReg } from 'src/util';

// 加载loading
export const listLoadingContent = (pageIndex) => {
  if (pageIndex == 1) {
    if ($('#taskList').find('#taskFilterLoading').length === 0) {
      $('#taskList').append('<div id="taskFilterLoading"><div class="loadingCenter"> ' + LoadDiv('big') + ' </div></div>');
    }
  } else {
    if ($('#taskList').find('#taskFilterLoadingBottom').length === 0) {
      $('#taskList').append('<div id="taskFilterLoadingBottom">' + LoadDiv() + '</div>');
    }
  }
};

// 获取tr 或者li
const getTrOrLi = function (taskId) {
  let $el = $("#taskList tr[data-taskid='" + taskId + "']");

  if (!$el.length) {
    $el = $("#taskList li[data-taskid='" + taskId + "']");
  }

  return $el;
};

// 修改任务状态之后数据处理
export const afterUpdateTaskStatus = (data, status, isAll, $el) => {
  const folderId = data.folderID;
  let taskIdArray = data.taskIDs;
  let $completedNum;
  let $subCount;

  if (!taskIdArray) {
    taskIdArray = data;
  }

  // 标记完成之后计数
  const $selectTask = $el || $('#taskList .selectTask');
  if (isAll) {
    $.map(taskIdArray, (taskId) => {
      $completedNum = $('tr[data-taskid=' + taskId + '] .completedNum').length
        ? $('tr[data-taskid=' + taskId + '] .completedNum')
        : $('li[data-taskid=' + taskId + '] .completedNum');
      if (!$completedNum.length) {
        return;
      }
      $subCount = $completedNum.siblings('.subCount');
      $completedNum.html(status ? $subCount.text() : 0);
    });
  } else {
    let completedNum = taskIdArray.length;
    if ($selectTask && completedNum && taskIdArray.indexOf($selectTask.attr('data-taskid')) !== -1) {
      completedNum = completedNum - 1;
    }
    if ($selectTask && completedNum > 0) {
      $completedNum = $selectTask.find('.completedNum');
      $subCount = $completedNum.siblings('.subCount');
      const oldNum = parseInt($completedNum.html(), 10);
      if (status) {
        $completedNum.html(oldNum + completedNum > parseInt($subCount.html(), 10) ? $subCount.html() : oldNum + completedNum);
      } else {
        $completedNum.html(oldNum - completedNum > -1 ? oldNum - completedNum : 0);
      }
    }
  }

  // 任务数
  const taskIdCount = taskIdArray.length;
  // 是否是列表
  const isList = $('#taskList .listStage').length === 0;
  // 当前行
  let $tr;
  for (let i = 0; i < taskIdCount; i++) {
    const taskId = taskIdArray[i].toLowerCase();
    $tr = getTrOrLi(taskId);

    if (isList) {
      // 子母任务视图
      let $markTask = $tr.find('.markTask');
      if ($tr.children('.singleTreeTask').length > 0) {
        $markTask = $tr.children('.singleTreeTask').find('.markTask');
      }
      // 未完成
      if (status == 0) {
        $markTask
          .removeClass('completeHook')
          .end()
          .find('.taskListName .spanName')
          .removeClass('completeTask')
          .end()
          .find('.chargeImg')
          .removeClass('opacity6');
      } else {
        $markTask
          .addClass('completeHook')
          .end()
          .find('.taskListName .spanName')
          .addClass('completeTask')
          .end()
          .find('.deteLine')
          .data('comdate', moment().format('YYYY-MM-DD HH:mm'))
          .end()
          .find('.chargeImg')
          .addClass('opacity6');
      }
    } else {
      // 未完成 需要传阶段iD
      if (status == 0) {
        $tr
          .find('.markTask')
          .removeClass('completeHook')
          .end()
          .find('.listStageTaskName')
          .removeClass('completeTask')
          .end()
          .find('.chargeImg')
          .removeClass('opacity6');
      } else {
        $tr
          .find('.markTask')
          .addClass('completeHook')
          .end()
          .find('.listStageTaskName')
          .addClass('completeTask')
          .end()
          .find('.chargeImg')
          .addClass('opacity6');
      }
    }
  }
};

// 检查任务是否有子任务
export const checkTaskSubTask = (taskId, callback) => {
  const $li = getTrOrLi(taskId);
  let $markTask = $li.find('.markTask');

  if ($li.children('.singleTreeTask').length > 0) {
    $markTask = $li.children('.singleTreeTask').find('.markTask');
  }

  const status = $markTask.hasClass('completeHook') ? 0 : 1;

  taskStatusDialog(status, () => {
    if ($li.find('.icon-task-card').length > 0) {
      const content = status ? _l('标记该任务为已完成') : _l('标记该任务为未完成');
      $.DialogLayer({
        dialogBoxID: 'enterStatus',
        showClose: false,
        container: {
          content: '<div class="Font16 mBottom20">' + content + '</div>',
          ckText: status ? _l('同时标记该任务下所有任务为已完成') : _l('同时标记该任务下所有任务为未完成'),
          yesFn(isCk) {
            callback($li, status, isCk);
          },
        },
      });
    } else {
      callback($li, status, false);
    }
  });
};

// 修改负责人后操作
export const afterUpdateTaskCharge = (taskId, userImg, accountId) => {
  const $li = getTrOrLi(taskId);
  $li
    .find('.chargeImg:first')
    .removeClass('userdisable')
    .attr({
      src: userImg,
      'data-id': accountId,
    })
    .data('id', accountId)
    .data('hasbusinesscard', false)
    .data('md.businesscard', false)
    .off();
};

// 修改任务日期后处理
export const afterUpdateTaskDate = (changedTasks) => {
  for (let i = 0; i < changedTasks.length; i++) {
    const taskId = changedTasks[i].taskId;
    let $tr = getTrOrLi(taskId);
    // 嵌套 所以先取出
    if ($tr.children('.singleTreeTask').length) {
      $tr = $tr.children('.singleTreeTask');
    }

    const status = $tr.find('.markTask').hasClass('completeHook');
    const $deteLine = $tr.find('.deteLine');

    const startTime = changedTasks[i].startTime !== undefined ? changedTasks[i].startTime : $deteLine.data('start') || '';
    const deadline = changedTasks[i].startTime !== undefined ? changedTasks[i].deadline : $deteLine.data('end') || '';

    const actDate = $deteLine.data('actdate') || '';
    const completeDate = $deteLine.data('comdate') || '';

    const taskTimeText = formatTaskTime(status, startTime, deadline, actDate, completeDate);

    $tr.find('.taskListDate, .deteLine').toggleClass('mp0', !taskTimeText);
    $deteLine.html(taskTimeText); // 替换时间
  }
};

// 修改任务时间信息
export const afterUpdateTaskDateInfo = (taskId, startTime, deadline, actualStartTime, completeTime) => {
  let $tr = getTrOrLi(taskId);
  // 嵌套 所以先取出
  if ($tr.children('.singleTreeTask').length) {
    $tr = $tr.children('.singleTreeTask');
  }

  const $deteLine = $tr.find('.deteLine');

  $deteLine.data('start', startTime || '');
  $deteLine.data('end', deadline || '');
  $deteLine.data('actdate', actualStartTime || '');
  $deteLine.data('comdate', completeTime || '');
};

// 改变锁的状态后处理
export const afterUpdateLock = (taskId, locked) => {
  const $elem = getTrOrLi(taskId);
  const $markTask = $elem.find('.markTask:first');

  // 非完成
  if (!$markTask.hasClass('completeHook')) {
    const auth = $elem.data('auth');
    // 如果是锁定与我是负责人
    if (locked && auth === 1) {
      $markTask
        .removeClass()
        .addClass('markTask lockToOtherTask')
        .attr('tip', _l('任务已锁定，但我是创建者或负责人可以操作'))
        .data('bindtip', false);
    } else if (locked && auth !== 1) {
      $markTask
        .removeClass()
        .addClass('markTask lockTask')
        .attr('tip', _l('任务已锁定，无法操作'))
        .data('bindtip', false);
    } else if (!locked) {
      $markTask
        .removeClass()
        .addClass('markTask')
        .attr('tip', _l('标记完成'))
        .data('bindtip', false);
    }
  }
};

// 删除未打开的任务节点
export const taskTreeAfterDeleteTask = (taskId, listSort) => {
  ajaxRequest
    .getSubTask({
      taskID: taskId,
      sort: listSort,
    })
    .then((source) => {
      if (source.status) {
        const folders = {
          formatStatus,
          formatTaskTime,
          data: [
            {
              stageID: 'ZP',
              tasks: source.data,
            },
          ],
          deep: 0,
          pageIndex: 2,
        };

        import('../containers/taskTree/tpl/treeMaster.html').then((treeListTpl) => {
          const allTasks = doT.template(treeListTpl)(folders);
          const $li = $("#taskList .listStageTaskContent li[data-taskid='" + taskId + "']");
          $li.closest('.singleFolderTask').prepend(allTasks);
          $li.remove();
        });
      } else {
        errorMessage(source.error);
      }
    });
};

// 删除任务后处理 退出任务
export const afterDeleteTask = (taskIdArray, parentTaskId) => {
  const { viewType, folderId, listSort } = Store.getState().task.taskConfig;
  const taskCount = taskIdArray.length;
  let taskId;
  let $tr;
  let $parent;
  let $parentPrev;
  const isList = !folderId;
  let $parents;
  let $singleTreeTask;

  // 处理母任务
  if (parentTaskId) {
    // 计数
    $tr = getTrOrLi(parentTaskId);
    const $sumCount = $tr.find('.subCount');
    $sumCount.text(parseInt($sumCount.text(), 10) - 1);
    if ($sumCount.text() <= 0) {
      $tr
        .find('.subCounts')
        .closest('.taskTagsBG')
        .remove();
    }
  }

  // 子母任务视图
  if (viewType === 1 && folderId) {
    taskId = taskIdArray[0];
    const $li = $("#taskList .listStageTaskContent li[data-taskid='" + taskId + "']");
    const hasSubTask = $li.children('.singleTreeTask').find('.nodeSwitch.on,.nodeSwitch.off').length > 0;
    const $subTask = $li.children('ul');
    const $singleFolderTask = $li.closest('.singleFolderTask');

    $parent = $li.parent();
    const isMaster = $parent.hasClass('singleFolderTask');
    // 未展开
    if (hasSubTask && $subTask.length <= 0 && taskIdArray.length == 1) {
      taskTreeAfterDeleteTask(taskId, listSort);
    } else {
      // 不删除子任务 且有子任务
      if (taskIdArray.length === 1 && $subTask.length > 0) {
        let $item;

        $subTask.children('li').each((i, item) => {
          $item = $(item);

          // 存在子任务
          if ($item.find('.nodeSwitch').length > 0) {
            $item
              .removeClass('tLine')
              .children('.singleTreeTask')
              .find('.subJoinLine,.joinPrevLine')
              .remove();
          } else {
            // 没有子任务
            $singleTreeTask = $item.removeClass('tLine').children('.singleTreeTask');
            $singleTreeTask.find('.subJoinLine,.subNoneNode,.joinPrevLine').remove();
            $singleTreeTask.find('.nodeCircleSmall').replaceWith('<span class="nodeSwitch "></span>');
          }

          // 添加到最上面
          $singleFolderTask.prepend($item);
          $item
            .data('deep', 1)
            .children('.singleTreeTask')
            .removeAttr('style');
          if ($item.find('ul').length > 0) {
            afterDeep($item, 2);
          }
        });

        $subTask.remove();
        // 原节点处理
        $parents = $parent.parent();
        $singleTreeTask = $parents.children('.singleTreeTask');
        // 删除的是第二级
        if ($parents.parent().is('.singleFolderTask')) {
          $singleTreeTask
            .find('.joinLine')
            .remove()
            .end()
            .find('.nodeSwitch')
            .removeClass('on off');
        } else {
          // 二级以下
          $singleTreeTask
            .find('.joinLine')
            .remove()
            .end()
            .find('.nodeSwitch')
            .replaceWith('<span class="InlineBlockTop subNoneNode"></span><span class="InlineBlockTop nodeCircleSmall circle "></span>');
        }
        $li.remove();
      } else {
        if (isMaster) {
          // 如果是顶级直接删了就好
          $li.remove();
        } else {
          // 后面还有元素
          if ($li.next().length > 0) {
            $li.remove();
          } else {
            const $prev = $li.prev();
            // 前一个有节点
            if ($prev.length > 0) {
              $prev
                .removeClass('tLine')
                .children('.singleTreeTask')
                .prepend('<div class=" joinPrevLine"></div>');
              if ($li.next().length <= 0) {
                $prev.children('.tliLine').remove();
                const deep = $prev.data('deep');
                if (deep != 2) {
                  const pLeft = deep < 3 ? 16 * (deep - 1) : 18 * (deep - 1) + 1;
                  $prev
                    .children('.singleTreeTask')
                    .find('.joinPrevLine')
                    .css('left', pLeft);
                }
              }

              $li.remove();
            } else {
              // 最后一个节点 该母任务下没有任务了
              // 移除整个节点
              $parents = $parent.parent();
              $parent.remove();
              $singleTreeTask = $parents.children('.singleTreeTask');

              // 删除的是第二级 原节点处理
              if ($parents.parent().is('.singleFolderTask')) {
                $singleTreeTask
                  .find('.joinLine')
                  .remove()
                  .end()
                  .find('.nodeSwitch')
                  .removeClass('on off');
              } else {
                // 二级以下
                $singleTreeTask
                  .find('.joinLine')
                  .remove()
                  .end()
                  .find('.nodeSwitch')
                  .replaceWith('<span class="InlineBlockTop subNoneNode"></span><span class="InlineBlockTop nodeCircleSmall circle "></span>');
              }
              $li.remove();
            }
          }
        }
      }
    }
  } else {
    // 其他处理
    const opts = {};
    for (let i = 0; i < taskCount; i++) {
      taskId = taskIdArray[i];
      $tr = getTrOrLi(taskId);

      if (isList) {
        // 任务总容器
        $parent = $tr.closest('.listStageTaskContent');
        // 移除当前行
        $tr.remove();

        if (listSort == 4 && $parent.find('table tr').length <= 0) {
          // 移除项目 和容器
          $parent
            .prev()
            .remove()
            .end()
            .remove();
        }
        // 无任务时 快速创建
        if ($('#taskList table tr').length <= 0) {
          $('#taskList .persist-area')
            .addClass('Hidden')
            .find('.stageTaskCount')
            .text('0');
          // 快速创建
          const noDataTpl = `
				<div class="listCreateNew boderRadAll_3">
					<div class="creatNewContent">
					<i class="taskQuickCreate"></i>
					<span>
						${_l('点击创建任务')}<br>
						<span class="Font14">${_l('或使用右上角 + 号创建任务')}</span>
					</span>
					</div>
					<div class="ThemeBG taskGroundGlass"></div>
				</div>`;

          // 优先级 4分类
          if (listSort === 0) {
            $('#taskList').append(noDataTpl);
          } else {
            $('#taskList').html(noDataTpl);
          }
        }
      } else {
        // 阶段中删除任务  目前不用处理
        $tr.remove();
      }
    }
  }

  // 清除localStorage中的评论
  $.each(taskIdArray, (index, v) => {
    const localStorageKey = 'task_' + v;
    window.localStorage.removeItem(localStorageKey);
  });
};

// 删除任务后deep修改
export const afterDeep = ($item, deep) => {
  const pLeft = deep < 3 ? 20 * (deep - 1) : 20 * (deep - 1) + 1;
  if (deep != 2) {
    const itemPLeft = deep < 3 ? 20 * (deep - 2) : 20 * (deep - 2) + 1;
    $item
      .data('deep', deep - 1)
      .children('.singleTreeTask')
      .removeAttr('padding-left', itemPLeft);
  }
  $item
    .children('.singleTreeTask')
    .find('.joinLine')
    .css('left', pLeft);
  $item
    .children('ul')
    .children('li')
    .data('deep', deep)
    .children('.singleTreeTask')
    .css('padding-left', pLeft)
    .find('.joinPrevLine')
    .css('left', pLeft);
  const $lis = $item.children('ul').children('li');
  const subLength = $lis.length;
  let $subItem;

  for (let i = 0; i < subLength; i++) {
    $subItem = $lis.eq(i);
    if ($subItem.children('ul').length > 0) {
      const newDeep = deep + 1;
      afterDeep($subItem, newDeep);
    }
  }
};

// 更改项目后处理
export const afterUpdateTaskFolder = (taskId, parentTaskId) => {
  const { viewType, folderId } = Store.getState().task.taskConfig;

  if (folderId && viewType === 1) {
    // 删除任务
    afterDeleteTask([taskId, taskId], parentTaskId);
  }
};

// 任务修改阶段
export const afterUpdateTaskStage = (stageId, taskId, data) => {
  const { viewType, folderId } = Store.getState().task.taskConfig;
  // 查看项目的时候才存在阶段
  if (folderId) {
    const $tr = getTrOrLi(taskId).data('stageid', stageId);
    let $taskListFolderName;
    if (viewType === 1) {
      // 已完成
      if ($tr.find('.markTask').hasClass('completeHook')) {
        return;
      }
      // 阶段
      $taskListFolderName = $(".taskListStageName span[data-stageid='" + stageId + "']").parent();
      $taskListFolderName
        .next()
        .find('.singleFolderTask')
        .prepend($tr);
    } else {
      // 新阶段
      $taskListFolderName = $("li.singleStage[data-stageid='" + stageId + "']");
      $taskListFolderName.find('.listStageContent > ul').prepend($tr);
    }

    if (data.accountID) {
      getTrOrLi(taskId)
        .find('.chargeHeaderAvatar')
        .attr('src', data.avatar)
        .attr('data-id', data.accountID)
        .data('id', data.accountID);
    }
  }
};

// 更新母任务后操作
export const afterUpdateTaskParent = (taskId, parentId, oldParentId, data) => {
  const { viewType, folderId } = Store.getState().task.taskConfig;
  // 非项目列表处理
  if (!folderId) {
    afterUpdateTaskParentList(taskId, parentId, oldParentId);
    return;
  }

  // 原本的li子任务数处理
  if (oldParentId) {
    const $oldSingleTreeTask = getTrOrLi(oldParentId).children('.singleTreeTask');
    const $sumCount = $oldSingleTreeTask.find('.subCount');
    const count = parseInt($sumCount.text(), 10) - 1;
    if (count <= 0) {
      $oldSingleTreeTask
        .find('.subCounts')
        .closest('.taskTagsBG')
        .remove()
        .end()
        .remove();
    } else {
      $sumCount.text(count);
    }
  }

  const $li = getTrOrLi(taskId);
  // 页面上不存在
  if (!$li.length) {
    // 生成任务
    const newData = {
      data: {
        stages: [
          {
            tasks: [data.ancestors],
            id: 1,
            name: 1,
          },
        ],
      },
      formatStatus,
      formatTaskTime,
      isNew: true,
      pageIndex: 2,
      deep: 0,
    };

    import('../containers/taskTree/tpl/treeMaster.html').then((treeListTpl) => {
      const allTasks = doT.template(treeListTpl)(newData);
      afterUpdateTaskParentComm(taskId, parentId, oldParentId, $(ulHtml));
    });
  } else {
    afterUpdateTaskParentComm(taskId, parentId, oldParentId);
  }
};

// 更新母任务后列表处理
const afterUpdateTaskParentList = (taskId, parentId, oldParentId) => {
  const $tr = getTrOrLi(oldParentId);
  if ($tr.length > 0) {
    const $sumCount = $tr.find('.subCount');
    $sumCount.text(parseInt($sumCount.text(), 10) - 1);
    if ($sumCount.text() <= 0) {
      $tr
        .find('.deteLine')
        .prevAll()
        .remove();
    }
  }

  // 不是删除母任务 新母任务处理
  if (parentId) {
    const $newTr = $("#taskList tr[data-taskid='" + parentId + "']");

    if ($newTr.length > 0) {
      if ($newTr.find('.icon-task-card').length > 0) {
        const $subCount = $newTr.find('.subCount');
        $subCount.text(parseInt($subCount.text(), 10) + 1);
      } else {
        $newTr.find('.taskListDate').prepend(
          `
              <span class="taskTagsBG">
                <i class="icon-task-card" tip="${_l('子任务')}"></i>
                <span class="subCounts">
                  <span class="completedNum">0</span>/<span class="subCount">1</span>
                </span>
              </span>
            `
        );
      }
    }
  }
};

// 更新母任务后操作
const afterUpdateTaskParentComm = (taskId, parentId, oldParentId, $dyLi) => {
  let $li = getTrOrLi(taskId);
  let $singleFolderTask = $li.closest('.singleFolderTask');
  const $oldParent = $li.parent();
  let deep;
  let pLeft;
  let $singleTreeTask;
  let $liSingleTreeTask;
  let $sumCount;

  if (!$li.length) {
    $li = $dyLi;
    $singleFolderTask = $('#taskList .selectTask').closest('.singleFolderTask');
  }
  // 原本节点处理  不是顶级
  if (!$oldParent.hasClass('singleFolderTask')) {
    // 后面没有元素
    if (!$li.next().length) {
      const $prev = $li.prev();
      // 前一个有节点
      if ($prev.length) {
        deep = $prev.data('deep');
        pLeft = (deep - 1) * 20;
        $prev
          .removeClass('tLine')
          .children('.singleTreeTask')
          .prepend('<div class="joinPrevLine" style="left:' + pLeft + 'px;"></div>');
        $prev.children('.tliLine').remove();
      } else {
        // 移除整个节点
        const $parents = $oldParent.parent();
        $oldParent.remove();
        $singleTreeTask = $parents.children('.singleTreeTask');

        // 删除的是第二级 原节点处理
        if ($parents.parent().is('.singleFolderTask')) {
          $singleTreeTask
            .find('.joinLine')
            .remove()
            .end()
            .find('.nodeSwitch')
            .removeClass('on off');
        } else {
          // 二级以下
          $singleTreeTask
            .find('.joinLine')
            .remove()
            .end()
            .find('.nodeSwitch')
            .replaceWith('<span class="InlineBlockTop subNoneNode"></span><span class="InlineBlockTop nodeCircleSmall circle "></span>');
        }
      }
    }
  }

  // 放到最上面
  if (!parentId) {
    $li.data('deep', 1).attr('data-deep', 1);
    $li.children('.tliLine').remove();
    $singleTreeTask = $li.children('.singleTreeTask');
    // 没有子任务
    if ($singleTreeTask.find('.nodeCircleSmall').length) {
      $singleTreeTask
        .find('.treeMark')
        .prevAll()
        .remove();
      $singleTreeTask.prepend('<span class="nodeSwitch "></span>');
    } else if ($singleTreeTask.find('.nodeSwitch').length) {
      // 有子任务
      $singleTreeTask.find('.subJoinLine').remove();
      $singleTreeTask.find('.joinPrevLine').remove();
      $singleTreeTask.find('.joinLine').removeClass('joinLineSub');
      $li.children('.singleSubFolderTask').removeClass('sub');
    }

    $singleFolderTask.prepend($li);
    $.map($li.find('.singleTreeTask'), (item, i) => {
      $(item).css('paddingLeft', i * 20);
      $(item)
        .find('.joinLine')
        .css('left', (i + 1) * 20);
      $(item)
        .find('.joinPrevLine')
        .css('left', i * 20);
    });
  } else {
    const $parentLi = $("#taskList .listStageTaskContent li[data-taskid='" + parentId + "']");
    // 有子任务 且没展开过
    if (!$parentLi.find('ul').length && $parentLi.find('.nodeSwitch.on').length) {
      // 子任务数
      $sumCount = $parentLi.children('.singleTreeTask').find('.subCount');
      $sumCount.text(parseInt($sumCount.text(), 10) + 1);
      // 原本节点li处理
      $li.remove();
    } else {
      const $ul = $parentLi.parent();
      const isMaster = $ul.hasClass('singleFolderTask');
      const hasSubTask = $parentLi.children('ul').length;
      $singleTreeTask = $parentLi.children('.singleTreeTask');

      if (isMaster) {
        // 没有子节点
        if (!hasSubTask) {
          $singleTreeTask.find('.nodeSwitch').addClass('on');
          // 子任务数
          $singleTreeTask.find('.taskListDate').before(
            `
                <span class="taskTagsBG">
                  <i class="icon-task-card" tip="${_l('子任务')}"></i>
                  <span class="subCounts">
                    <span class="completedNum">0</span>/<span class="subCount">1</span>
                  </span>
                </span>
              `
          );
          // 原本节点li处理
          $li.remove();
        } else {
          $liSingleTreeTask = $li.children('.singleTreeTask');
          if (!$li.hasClass('tLine')) {
            $li.addClass('tLine');
          }
          // 有母任务
          if ($liSingleTreeTask.find('.nodeSwitch.on,.nodeSwitch.off').length) {
            if ($liSingleTreeTask.find('.subJoinLine').length <= 0) {
              $liSingleTreeTask.prepend('<span class="subJoinLine"></span>');
            }
            $liSingleTreeTask.find('.joinPrevLine').remove();
          } else {
            $liSingleTreeTask.find('.joinPrevLine').remove();
            $liSingleTreeTask
              .find('.treeMark')
              .prevAll()
              .remove();
            $liSingleTreeTask.prepend(
              '<span class="subJoinLine"></span>  <span class="InlineBlockTop subNoneNode"></span>  <span class="nodeCircleSmall circle "> </span> '
            );
          }

          // 添加到当前节点
          $parentLi.children('ul').prepend($li);
          // 只有一级
          deep =
            $li
              .parent()
              .parent()
              .data('deep') + 1;
          pLeft = (deep - 1) * 20;
          $li
            .data('deep', deep)
            .children('.singleTreeTask')
            .css('padding-left', pLeft);
          if ($li.children('.tliLine').length <= 0) {
            $li.prepend('<div class="tliLine" style="left:' + pLeft + 'px;"></div>');
          }

          const $subCount = $parentLi.children('.singleTreeTask').find('.subCount');
          $subCount.text(parseInt($subCount.text(), 10) + 1);
        }
      } else {
        if (!hasSubTask) {
          $singleTreeTask.find('.subNoneNode').remove();
          $singleTreeTask.find('.nodeCircleSmall').replaceWith('<span class="nodeSwitch on "></span>');
          $singleTreeTask.find('.taskListDate').before(
            `
                <span class="taskTagsBG">
                  <i class="icon-task-card" tip="${_l('子任务')}"></i>
                  <span class="subCounts">
                    <span class="completedNum">0</span>/<span class="subCount">1</span>
                  </span>
                </span>
              `
          );
          // 原本节点li处理
          $li.remove();
        } else {
          $liSingleTreeTask = $li.children('.singleTreeTask');
          if (!$li.hasClass('tLine')) {
            $li.addClass('tLine');
          }
          // 有母任务
          if ($liSingleTreeTask.find('.nodeSwitch.on,.nodeSwitch.off').length) {
            $liSingleTreeTask.find('.joinPrevLine').remove();
            if (!$liSingleTreeTask.find('.subJoinLine').length) {
              $liSingleTreeTask.prepend('<span class="subJoinLine"></span>');
            }
          } else {
            $liSingleTreeTask.find('.joinPrevLine').remove();
            $liSingleTreeTask
              .find('.treeMark')
              .prevAll()
              .remove();
            $liSingleTreeTask.prepend(
              '<span class="subJoinLine"></span>  <span class="InlineBlockTop subNoneNode"></span>  <span class="nodeCircleSmall circle "> </span> '
            );
          }

          // 添加到当前节点
          $parentLi.children('ul').prepend($li);
          // 天假后处理
          updateTaskParentDeep($li);
          if (!$parentLi.is('.listStageTaskContent')) {
            // 子任务数
            $sumCount = $singleTreeTask.find('.subCount');
            $sumCount.text(parseInt($sumCount.text(), 10) + 1);
          }
        }
      }
    }
  }
};

// 更改母任务后deep 处理
const updateTaskParentDeep = ($li) => {
  // 添加后处理
  const deep =
    $li
      .parent()
      .parent()
      .data('deep') + 1;
  const pLeft = (deep - 1) * 20;
  $li
    .data('deep', deep)
    .children('.singleTreeTask')
    .css('padding-left', pLeft);
  if (!$li.children('.tliLine').length && $li.parent().children('li').length > 1) {
    $li.prepend('<div class="tliLine" style="left:' + pLeft + 'px;"></div>');
  }
  const $joinPrevLine = $li.children('.singleTreeTask').find('.joinPrevLine');
  if ($joinPrevLine.length) {
    $joinPrevLine.css('left', pLeft);
  }

  const $ul = $li.children('ul');
  if ($ul.length) {
    $li
      .children('.singleTreeTask')
      .find('.joinLine')
      .css('left', deep * 20);
    const $lis = $ul.children('li');
    const subLength = $lis.length;
    for (let i = 0; i < subLength; i++) {
      updateTaskParentDeep($lis.eq(i));
    }
  }
};

// 更新任务名称后处理
export const afterUpdateTaskName = (taskId, taskName) => {
  const { viewType, folderId } = Store.getState().task.taskConfig;

  if (!folderId) {
    $("#taskList tr[data-taskid='" + taskId + "']")
      .find('.taskListName .spanName')
      .text(taskName)
      .attr('title', taskName);
  } else {
    if (viewType === 1) {
      $("#taskList  li[data-taskid='" + taskId + "']")
        .children('.singleTreeTask ')
        .find('.taskListName .spanName ')
        .text(taskName)
        .attr('title', taskName);
    } else {
      $(".listStageContent ul li[data-taskid='" + taskId + "']")
        .find('.listStageTaskName')
        .text(taskName)
        .attr('title', taskName);
    }
  }
};

// 加星后处理
export const afterUpdateTaskStar = (taskId, hasStar) => {
  const $el = getTrOrLi(taskId).find('.taskStar');

  if (hasStar) {
    $el.removeClass('icon-star-hollow').addClass('icon-task-star');
  } else {
    $el.removeClass('icon-task-star').addClass('icon-star-hollow');
  }

  // 已完成的任务标星不更新星标计数
  if (!getTrOrLi(taskId).find('.markTask.completeHook').length) {
    const $allCountTask = $('.aboutMeStar .allCountTask');
    let count = parseInt($allCountTask.text() || 0, 10);
    if (hasStar) {
      count = count + 1;
    } else {
      count = count - 1;
    }

    $allCountTask.text(count <= 0 ? '' : count);
  }
};

// 添加任务后
export const afterAddTask = (data) => {
  const { viewType, folderId } = Store.getState().task.taskConfig;

  if (!folderId || viewType === 1) {
    Store.dispatch(addTask(data));
  } else {
    const parentTaskId = data.parentID;
    if (parentTaskId) {
      const $li = getTrOrLi(parentTaskId);
      if ($li.find('.icon-task-card').length > 0) {
        const $sumCount = $li.find('.subCount');
        $sumCount.text(parseInt($sumCount.text(), 10) + 1);
      } else {
        $li.find('.deteLine').before(
          `
              <span class="taskTagsBG">
                <i class="icon-task-card" tip="${_l('子任务')}"></i>
                <span class="subCounts">
                  <span class="completedNum">0</span>/<span class="subCount">1</span>
                </span>
              </span>
            `
        );
      }
    }
  }
};

// 创建项目callback
export const createFolder = (data, isOpen = true) => {
  const singleFolderTpl = singleFolder.replace('#include.singleFolderComm', singleFolderComm);
  const newFolder = $(doT.template(singleFolderTpl)([data]));
  const $folderList = $('.networkFolderList[data-projectid=' + data.projectID + '] .folderList');

  if ($folderList.find('.projectFolder').length > 0) {
    $folderList
      .find('.projectFolder')
      .last()
      .after(newFolder);
  } else {
    $folderList.prepend(newFolder);
  }

  if (isOpen) {
    newFolder.trigger('click');
  }

  $('.networkOnly .noFolderList').remove();
};

// 项目置顶
export const updateFolderTop = (folderId, isTop, callback) => {
  ajaxRequest
    .updateFolderTop({
      folderID: folderId,
      isTop,
    })
    .then((source) => {
      if (source.status) {
        let $li = $(".folderList li[data-id='" + folderId + "']");
        const currentFolderId = Store.getState().task.taskConfig.folderId;

        // 不存在该项目时插入一个
        if (!$li.length) {
          createFolder(source.data, false);
          // 重新获取元素
          $li = $(".folderList li[data-id='" + folderId + "']");
        }
        const topListLength = $('.topFolderList .folderList li').length;

        // 取消置顶
        if (!isTop) {
          // 移除置顶的项目
          $li
            .data('istop', false)
            .first()
            .remove();
          if (topListLength === 1) {
            $('.topFolderList').remove();
          }
          $li.toggleClass('ThemeBGColor8', currentFolderId === folderId);
        } else {
          const $newLi = $li
            .removeClass('ThemeBGColor8')
            .clone()
            .toggleClass('ThemeBGColor8', currentFolderId === folderId);
          $li.add($newLi).data('istop', true); // 所有li
          if (topListLength) {
            $('.topFolderList .folderList')
              .prepend($newLi)
              .show();
          } else {
            const topList =
              '<div class="topFolderList ThemeBorderColor7"><div class="popTops ThemeColor9">' + _l('置顶项目') + '</div><ul class="folderList"></ul></div>';
            $('.navContent').prepend(topList);
            $('.topFolderList .folderList').html($newLi);
          }
        }

        if ($.isFunction(callback)) {
          callback();
        }
      } else {
        errorMessage(source.error);
      }
    });
};

// 退出与删除 项目callback
const exitAndDeleteCallback = (folderId, isDelete, hideNavigation) => {
  alert(isDelete ? _l('删除成功') : _l('退出成功'));

  if (hideNavigation) {
    navigateTo(location.pathname.replace('/' + folderId, ''));
    return;
  }

  // 置顶项目
  $(".folderList li[data-id='" + folderId + "']").slideUp(() => {
    if (!$('.topFolderList .folderList li').length) {
      $('.topFolderList').remove();
    }
  });
  // 当前查看的是删除的项目
  if (Store.getState().task.taskConfig.folderId === folderId) {
    $('#taskNavigator .taskType li:visible:first').click(); // 点击第一项
  }
};

// 删除项目
export const deleteFolder = (folderId, hideNavigation) => {
  DeleteReconfirm({
    title: _l('彻底删除项目“%0”', $('.folderList li[data-id=' + folderId + '] .folderName').text() || $('.taskToolbar .folderName').text()),
    description: _l('项目将彻底删除且无法恢复。请确认您和其他项目的参与者都不再需要项目中的数据再执行此操作'),
    data: [
      {
        text: _l('只删除此项目'),
        value: false,
      },
      {
        text: _l('删除项目和项目下的所有任务'),
        value: true,
      },
    ],
    onOk: (isDeleteTask) => {
      ajaxRequest
        .removeFolder({
          folderID: folderId,
          isDeleteTask,
        })
        .then((source) => {
          if (source.status) {
            exitAndDeleteCallback(folderId, true, hideNavigation);
            $('.folderList li[data-id=' + folderId + ']').remove();
          } else {
            errorMessage(source.error);
          }
        });
    },
  });
};

// 退出项目
export const exitFolder = (folderId, hideNavigation) => {
  $.DialogLayer({
    dialogBoxID: 'exitFolder',
    showClose: false,
    container: {
      content: '<div class="Font16 mBottom20">' + _l('确定退出该项目？') + '</div>',
      yesFn() {
        ajaxRequest
          .removeFolderMember({
            folderID: folderId,
            accountID: md.global.Account.accountId,
            isRemoveTaskMember: false,
          })
          .then((source) => {
            if (source.status) {
              exitAndDeleteCallback(folderId, false, hideNavigation);
            } else {
              errorMessage(source.error);
            }
          });
      },
    },
  });
};

// 项目归档
export const updateFolderArchived = (projectId, folderId, pigeonhole, callback) => {
  ajaxRequest
    .updateFolderArchived({
      folderID: folderId,
      archived: pigeonhole,
    })
    .then((source) => {
      if (source.status) {
        if (!checkIsProject(projectId)) {
          projectId = '';
        }
        let $li = $(".folderList li[data-id='" + folderId + "']");
        const $networkFolderList = $('.networkFolderList[data-projectid=' + projectId + ']');

        // 左侧未展开
        if (!$li.length) {
          return;
        }

        $li.toggleClass('archivedFolder', pigeonhole);
        $li.data('ispigeonhole', pigeonhole);
        $li = $li.filter(':last');
        // 归档
        if (pigeonhole) {
          $networkFolderList
            .find('.pigeonholeFolderList')
            .prepend($li)
            .closest('.pigeonholeFolder')
            .removeClass('Hidden');
        } else if (source.data === '1') {
          // 1 表示隐藏
          $networkFolderList
            .find('.slideFolderList')
            .prepend($li.data('ishidden', true).attr('data-ishidden', 'true'))
            .closest('.slideFolders')
            .removeClass('Hidden');
        } else {
          const fileId = source.data ? source.data.toLowerCase() : '';
          const $projectFolder = $networkFolderList.find('.projectFolder');

          // 原本在项目文件夹中 若还是存在 则插入到原文件夹中
          const $file = $networkFolderList.find("li[data-fileid='" + fileId + "']");
          if ($file.length > 0) {
            $file.find('.projectFolderUl').prepend($li);
          } else if ($projectFolder.length) {
            // 否则 寻找存在的项目文件夹，插入项目到下方
            $networkFolderList
              .find('.projectFolder')
              .last()
              .after($li);
          } else {
            // 没有项目文件夹， 插入到项目列表第一个
            $networkFolderList.find('.folderList').prepend($li);
          }
        }

        // 隐藏归档项目
        const $pigeonholeFolderList = $networkFolderList.find('.pigeonholeFolder');
        if (!$pigeonholeFolderList.find('.commFolder').length) {
          $pigeonholeFolderList
            .removeClass('selectPigeonhole')
            .find('.initFilp')
            .removeClass('filp')
            .end()
            .find('.pigeonholeFolderList')
            .hide();
        }

        if ($.isFunction(callback)) {
          callback();
        }
      } else {
        errorMessage(source.error);
      }
    });
};

// 申请加入项目
export const joinProjectPrompt = (folderId) => {
  const content = `
    <div class="folderInfo">
      <textarea class="ThemeBorderColor3" placeholder="${_l('向负责人说明你想要加入项目的原因')}"></textarea>
    </div>
  `;
  $.DialogLayer({
    dialogBoxID: 'joinFolder',
    container: {
      header: _l('申请加入项目'),
      content,
      yesText: _l('申请加入'),
      yesFn() {
        ajaxRequest
          .applyFolderMember({
            folderID: folderId,
            applyInfo: $('#joinFolder textarea').val(),
          })
          .then((source) => {
            if (source.status) {
              alert(_l('操作成功'));
            } else {
              errorMessage(source.error);
            }
          });
      },
    },
    readyFn() {
      $('#joinFolder textarea').focus();
    },
    width: 550,
  });
};

// 获取左侧计数
export const getLeftMenuCount = (filterUserId, projectId) => {
  ajaxRequest
    .getLeftMenu({
      other: filterUserId,
      projectId,
    })
    .then((result) => {
      if (result.status) {
        const { data } = result;

        if (filterUserId) {
          $('#taskNavigator .responsible .allCountTask:last').text(data.otherCharge || ''); // 他负责的任务
          $('#taskNavigator .trust .allCountTask:last').text(data.otherRelease || ''); // 他托付的任务
          $('#taskNavigator .participate .allCountTask:last').text(data.otherParticipate || ''); // 他参与的任务
          $('#taskNavigator .otherAndMe .allCountTask:last').text(data.withMe || ''); // 我与他协作的任务
          $('#taskNavigator .otherResponsible .allCountTask:last').text(data.otherCharge || ''); // 我可见的由他负责的任务
        } else {
          $('#taskNavigator .myTask .allCountTask:first').text(data.me || ''); // 我的任务
          $('#taskNavigator .aboutMeStar .allCountTask:first').text(data.start || ''); // 星标任务

          // 查看自己
          if (data.unreadTask) {
            if ($('#taskNavigator .myTask').find('.newTip').length) {
              $('#taskNavigator .myTask .newTip').attr('data-count', data.unreadTask);
              return;
            }
            $('#taskNavigator .myTask')
              .find('.allCountTask:first')
              .before('<span class="newTip"><span class="tipCircle circle"></span></span>')
              .siblings('.newTip')
              .attr('data-count', data.unreadTask);
          } else {
            $('#taskNavigator .myTask .newTip').remove();
          }
        }
      } else {
        errorMessage(source.error);
      }
    });
};

// 更新阶段视图下的任务列表自定义数据自动更新
export const updateStageViewControlsSource = (taskId, controls) => {
  const { viewType, folderId } = Store.getState().task.taskConfig;

  if (viewType === 2 && folderId) {
    const $li = $('.singleTaskStage[data-taskid=' + taskId + ']');
    let content = '';

    controls.forEach((item) => {
      item.value = returnCustonValue(item);

      if (item.type === 28 && item.value === '0') {
        item.value = '';
      }

      if (item.value) {
        content += '<div class="listStageCustomItem">';

        if (item.type !== 28) {
          content += `
          <div class="listStageCustomItemDesc Font12">
            <span class="listStageCustomItemColor">${item.controlName}：</span>
            ${htmlEncodeReg(item.value)}${item.type === 6 || item.type === 8 ? item.unit : ''}
          </div>
        `;
        } else {
          content += `
          <div class="flexRow Font12">
            <span class="mRight10">
              <span class="listStageCustomItemColor">
                <span class="overflow_ellipsis">${item.controlName}</span>：
              </span>
              ${item.enumDefault !== 1 ? item.value + '/10' : ''}
            </span>
            <span class="listStageCustomItemStar flex" data-type="score" data-enum="${item.enumDefault}" data-score="${item.value}"></span>
          </div>
        `;
        }

        content += '</div>';
      }
    });

    if ($li.find('.listStageCustomBox').length) {
      $li.find('.listStageCustomBox').html(content);
    } else {
      $li.find('.listStageDate').after(`<div class="listStageCustomBox">${content}</div>`);
    }

    if (!$li.find('.Score-wrapper').length) {
      const type = $li.find('.listStageCustomItemStar').data('enum');
      const score = $li.find('.listStageCustomItemStar').data('score');
      let foregroundColor = '#f44336';

      if (score === 6 || type === 1) {
        foregroundColor = '#fed156';
      } else if (score > 6) {
        foregroundColor = '#4caf50';
      }

      ReactDom.render(
        <Score
          type={type === 1 ? 'star' : 'line'}
          score={score}
          foregroundColor={foregroundColor}
          backgroundColor={type === 1 ? '#9e9e9e' : '#e0e0e0'}
          disabled
          count={type === 1 ? 5 : 10}
        />,
        $li.find('.listStageCustomItemStar')[0]
      );
    }
  }
};
