import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import './css/taskTree.less';
import doT from '@mdfe/dot';
import 'src/components/mdDialog/dialog';
import ajaxRequest from 'src/api/taskCenter';
import { listLoadingContent } from '../../utils/taskComm';
import { formatTaskTime, errorMessage, formatStatus } from '../../utils/utils';
import config from '../../config/config';
import treeMaster from './tpl/treeMaster.html';
import quickCreateTask from '../../components/quickCreateTask/quickCreateTask';
import TaskDetail from '../taskDetail/taskDetail';
import _ from 'lodash';

const taskTreeSettings = {
  pageIndex: 1,
  isMore: true,
  isLoading: false,
  ajaxPost: null,
};

class TaskTree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openTaskDetail: false,
      taskId: '',
      isForceUpdate: false,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.init();
    this.bindEvents();
    this.props.emitter.removeListener('CREATE_TASK_TO_TREE', this.quickCreateTaskCallback);
    this.props.emitter.addListener('CREATE_TASK_TO_TREE', this.quickCreateTaskCallback);
  }

  componentWillReceiveProps(nextProps) {
    // 减少proejctId不同的而发生的请求
    let nextConfig = Object.assign({}, nextProps.taskConfig);
    let currentConfig = Object.assign({}, this.props.taskConfig);
    let isUpdate = false;

    // 解决切换未关联项目的bug
    if (nextConfig.folderId === currentConfig.folderId && nextConfig.projectId !== currentConfig.projectId) {
      isUpdate = true;
    }

    nextConfig.projectId = '';
    currentConfig.projectId = '';

    if ((nextProps.taskConfig.folderId && !_.isEqual(nextConfig, currentConfig)) || config.isGetData || isUpdate) {
      // 解决props未更新问题
      setTimeout(() => {
        this.init();
      }, 0);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    this.props.emitter.removeListener('CREATE_TASK_TO_TREE', this.quickCreateTaskCallback);
  }

  /**
   * 初始化
   */
  init() {
    taskTreeSettings.isMore = true;
    taskTreeSettings.isLoading = false;
    taskTreeSettings.pageIndex = 1;
    this.getTaskListByFolderId();
  }

  /**
   * 初始化事件
   */
  bindEvents() {
    const $taskList = $('#taskList');
    const that = this;

    // 绑定创建新任务
    $taskList.on('click', '.creatNewContent', (event) => {
      quickCreateTask.init({
        folderId: that.props.taskConfig.folderId === 1 ? '' : that.props.taskConfig.folderId,
        projectId: that.props.taskConfig.projectId,
      });

      event.stopPropagation();
    });

    // 子任务折叠展开
    $taskList.on('click', '.nodeSwitch.on', function (event) {
      const $li = $(this).closest('li');
      const $children = $li.children('ul');
      if ($children.length > 0) {
        const $singleTreeTask = $li.children('.singleTreeTask');
        $singleTreeTask
          .find('.nodeSwitch')
          .removeClass('on')
          .addClass('off')
          .end()
          .find('.joinLine')
          .show();
        $children.slideDown();
      } else {
        if ($li.find('.treeLoadingSingleTask').length > 0) {
          return;
        }
        that.getNodeTask($li);
      }
      event.stopPropagation();
    });

    // 子任务折叠收起
    $taskList.on('click', '.nodeSwitch.off', function (event) {
      const $li = $(this).closest('li');
      const $singleTreeTask = $li.children('.singleTreeTask');
      $singleTreeTask
        .find('.nodeSwitch')
        .removeClass('off')
        .addClass('on');
      $li.children('ul').slideUp(() => {
        $singleTreeTask.find('.joinLine').hide();
      });
      event.stopPropagation();
    });

    // 点击
    $taskList.on(
      {
        mouseover() {
          $('.singleTreeTask .markTask').removeClass('markTaskHover');
          $(this)
            .find('.markTask')
            .addClass('markTaskHover');
        },
        mouseout() {
          $(this)
            .find('.markTask')
            .removeClass('markTaskHover');
        },
        click(event) {
          const $singleTreeTask = $(this);
          const $li = $singleTreeTask.parent();
          const taskId = $li.data('taskid');
          let isMuil = false;
          let metaKeyType;

          if ($singleTreeTask.hasClass('addNewTask') || $(event.target).hasClass('markTask') || $(event.target).hasClass('taskStar')) {
            return;
          }

          if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
            metaKeyType = 'shiftCtrl';
            isMuil = true;
          } else if (event.ctrlKey || event.metaKey) {
            metaKeyType = 'ctrl';
            isMuil = true;
          } else if (event.shiftKey) {
            metaKeyType = 'shift';
            isMuil = true;
          }

          // 多选
          if (isMuil) {
            that.setState({
              openTaskDetail: false,
              taskId: '',
            });

            import('../batchTask/batchTask').then((batchTask) => {
              batchTask.default.shiftCtrlKey($singleTreeTask, metaKeyType);
            });

            return false;
          }

          config.$prevNode = $singleTreeTask;

          $('#taskList .singleTreeTask').removeClass('selectTask ThemeBGColor6');
          $singleTreeTask.addClass('selectTask ThemeBGColor6');

          that.setState({
            openTaskDetail: true,
            taskId,
            isForceUpdate: true,
          });
        },
      },
      '.singleTreeTask'
    );

    // 阶段展开收起
    $taskList.on(
      {
        click(event) {
          const $List = $(this).next('.listStageTaskContent');
          if ($List.is(':animated')) return;
          $List.slideToggle();
          $(this)
            .find('.arrow-down')
            .toggleClass('downArrow');
          event.stopPropagation();
        },
        hover() {
          $(this)
            .find('.listFolderNameText')
            .toggleClass('ThemeColor3');
          $(this)
            .find('.arrow-down')
            .toggleClass('ThemeBorderColor3');
        },
      },
      '.taskListStageName'
    );

    $taskList.on('scroll', function () {
      // 非未关联的返回 或者没有更多了  0   1   -1
      if ((that.props.taskConfig.listStatus != 1 && that.props.taskConfig.listStatus != -1) || !taskTreeSettings.isMore || taskTreeSettings.isLoading) {
        return;
      }

      const _this = $(this);
      const nDivHight = _this.height();
      const nScrollHight = _this[0].scrollHeight;
      const nScrollTop = _this[0].scrollTop;

      if (nScrollTop + nDivHight + 30 >= nScrollHight) {
        taskTreeSettings.pageIndex++;
        that.getTaskListByFolderId();
      }
    });
  }

  /**
   * 获取任务更具项目ID
   */
  getTaskListByFolderId() {
    const { projectId, folderId, viewType, filterUserId, listSort, listStatus, completeTime, filterSettings, searchKeyWords } = this.props.taskConfig;

    if (taskTreeSettings.ajaxPost) {
      taskTreeSettings.ajaxPost.abort();
    }

    taskTreeSettings.isLoading = true;
    listLoadingContent(taskTreeSettings.pageIndex);

    let stageId = '';
    if (listStatus == 1) {
      stageId = 1;
    }
    if (listStatus == -1 && taskTreeSettings.pageIndex > 1) {
      stageId = 1;
    }

    let withoutTag = false;
    const tagIDs = _.filter(filterSettings.tags, tagId => tagId !== 'null');
    if (_.findIndex(filterSettings.tags, tagId => tagId === 'null') >= 0) {
      withoutTag = true;
    }

    // 未关联
    if (folderId === 1) {
      taskTreeSettings.ajaxPost = ajaxRequest.getTaskListInProjectWithOutFolder({
        pageIndex: taskTreeSettings.pageIndex,
        pageSize: config.pageSize,
        completeTime,
        tagIDs: tagIDs,
        chargeIds: filterSettings.selectChargeIds,
        controlSelectedDic: this.returnCustomFilterArray(),
        withoutTag,
        projectId,
        sort: listSort,
        status: listStatus,
        other: filterUserId,
        keywords: searchKeyWords,
      });
    } else {
      taskTreeSettings.ajaxPost = ajaxRequest.getFolderTaskList({
        page: taskTreeSettings.pageIndex,
        size: config.pageSize,
        folderID: folderId,
        completeTime,
        tagIDs: tagIDs,
        chargeIds: filterSettings.selectChargeIds,
        controlSelectedDic: this.returnCustomFilterArray(),
        withoutTag,
        sort: listSort,
        status: listStatus,
        filterType: filterSettings.folderSearchRange,
        keywords: searchKeyWords,
      });
    }

    taskTreeSettings.ajaxPost.then((source) => {
      config.isGetData = false;

      if (source.status) {
        taskTreeSettings.ajaxPost = false;
        if (viewType !== config.folderViewType.treeView) {
          return;
        }

        let stages = source.data.stages;
        // 分页
        if (taskTreeSettings.pageIndex > 1) {
          const index = source.data.stages.length;
          const stageData = [
            {
              sort: 0,
              id: 1,
              name: _l('已完成'),
              tasks: source.data.stages[index - 1].tasks,
            },
          ];

          source.data.stage = stageData;
          stages = source.data.stage;
        }

        // 未关联项目的任务是分页的 其他项目时不分页滴
        if (folderId === 1 || stageId === 1) {
          // 判断是否有更多
          if (listStatus == 1 || listStatus == 0) {
            // 进行中 已完成
            if (config.pageSize > (stages[0].tasks ? stages[0].tasks.length : 0)) {
              taskTreeSettings.isMore = false;
            }
          } else {
            // 全部
            let taskSize = 0;
            $.map(stages, (stage) => {
              taskSize += stage.tasks ? stage.tasks.length : 0;
            });
            if (config.pageSize > taskSize) {
              taskTreeSettings.isMore = false;
            }
          }
        }

        // 只有在 项目中没有任务 且 阶段名称没有修改过
        if (stages.length === 1 && $.trim(stages[0].name) === _l('进行中') && !stages[0].tasks && taskTreeSettings.pageIndex === 1) {
          this.renderNoData();
        } else if (
          listStatus === 1 &&
          !stages[0].tasks &&
          !filterSettings.tags.length &&
          !filterSettings.customFilter.length &&
          taskTreeSettings.pageIndex === 1
        ) {
          // 已完成 的页面
          $('#taskList').html(config.configHtml.noCompleteNullHtml);
        } else {
          source.deep = 0;
          source.pageIndex = taskTreeSettings.pageIndex;
          source.formatStatus = formatStatus;
          source.formatTaskTime = formatTaskTime;

          if (taskTreeSettings.pageIndex === 1) {
            $('#taskList').html(doT.template(treeMaster)(source));
          } else if (listStatus === 1 || listStatus === 0 || stageId === 1) {
            // 只存在一个阶段的
            var allTasks = doT.template(treeMaster)(source);
            if (stageId === 1) {
              // 暂无已完成 且 页面上没有
              if (allTasks.indexOf('nullCompleteTask') > -1) {
                if (!$('#taskList .nullCompleteTask').length) {
                  $('#taskList .singleFolderTask:last').append(allTasks);
                }
              } else {
                $('#taskList .singleFolderTask:last').append(allTasks);
              }
            } else {
              $('#taskList .singleFolderTask:first').append(allTasks);
            }
          } else {
            if (source.data.stages[0].tasks.length > 0) {
              // 未完成
              var allTasks = doT.template(treeMaster)(source);
              $('#taskList .singleFolderTask:first').append(allTasks);
            }

            const alreadly = {
              deep: 0,
              pageIndex: taskTreeSettings.pageIndex,
              formatStatus,
              formatTaskTime,
              data: source.data.stages.splice(1, 1),
            };

            if (alreadly.data[0].tasks.length) {
              // 已完成
              var allTasks = doT.template(treeMaster)(alreadly);
              $('#taskList .singleFolderTask:last').append(allTasks);
            }
          }
        }

        taskTreeSettings.isLoading = false;
        $('#taskFilterLoading,#taskFilterLoadingBottom').remove();
      } else {
        errorMessage(source.error);
      }
    });
  }

  /**
   * 渲染无数据情况
   */
  renderNoData() {
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

    $('#taskList').html(this.props.taskConfig.searchKeyWords ? config.configHtml.searchNullHtml : noDataTpl);
  }

  /**
   * 处理自定义筛选
   */
  returnCustomFilterArray() {
    const { customFilter } = this.props.taskConfig.filterSettings;
    const customFilters = {};

    Object.keys(customFilter).forEach((item) => {
      let keys = '';
      let arrs = [];
      customFilter[item].forEach((key) => {
        if (!keys) {
          keys = key;
        } else if (keys.length > key.length) {
          arrs = keys.split('');
          arrs.splice(keys.length - key.length, 1, '1');
          keys = arrs.join('');
        } else {
          keys = key.substr(0, key.length - keys.length) + keys;
        }
      });

      customFilters[item] = keys;
    });

    return customFilters;
  }

  /**
   * 获取子任务
   */
  getNodeTask($li) {
    const { listSort } = this.props.taskConfig;
    const taskId = $li.data('taskid');
    $li.append('<div class="treeLoadingSingleTask"> ' + LoadDiv('small') + '  </div>');
    const deep = $li.data('deep');

    ajaxRequest
      .getSubTask({
        taskID: taskId,
        sort: listSort,
      })
      .then((source) => {
        if (source.status) {
          const tasks = source.data;
          if (tasks.length <= 0) {
            $li.find('.treeLoadingSingleTask').remove();
            // 顶级
            if ($li.data('deep') === 1) {
              $li.find('.nodeSwitch').removeClass('on off');
            } else {
              $li
                .find('.subJoinLine,.nodeSwitch ')
                .remove()
                .end()
                .find('.singleTreeTask')
                .prepend('<span class="subJoinLine"></span><span class="InlineBlockTop subNoneNode"></span><span class="nodeCircleSmall circle "></span>');
            }
            return;
          }

          // 肯定只有一个  展开节点
          const $parentTask = $li.children('.singleTreeTask');
          let pLeft = 20;
          if (deep != 1) {
            pLeft = deep * 20;
          }

          $parentTask.append('<div style="left:' + pLeft + 'px;" class="joinLine"></div>');
          $parentTask
            .find('.nodeSwitch')
            .removeClass('on')
            .addClass('off');

          if (tasks.length > 0) {
            source.deep = deep;
            source.formatStatus = formatStatus;
            source.formatTaskTime = formatTaskTime;
            $li
              .append(doT.template(treeMaster)(source))
              .hide()
              .slideDown();
            $li.find('.treeLoadingSingleTask').remove();
          }
        } else {
          $li.find('.treeLoadingSingleTask').remove();
          errorMessage(source.error);
        }
      });
  }

  /**
   * 快速创建任务回调
   */
  quickCreateTaskCallback = (source) => {
    const data = source.data;
    const { folderId, projectId, filterUserId } = this.props.taskConfig;
    // 当前页面任务
    if (data.folderID === folderId || (data.projectId === projectId && folderId === 1)) {
      // 子任务
      const parentTaskId = data.parentID;
      let $li;
      let $ul;
      let isMaster;
      let hasSubTask;
      let $sumCount;

      // 兼容数据
      data.auth = 1;
      data.status = 0;
      data.subCount = 0;

      const folders = {
        formatStatus,
        formatTaskTime,
        isNew: true,
        data: {
          stages: [
            {
              tasks: [data],
            },
          ],
        },
      };

      if (parentTaskId) {
        $li = $("#taskList .listStageTaskContent li[data-taskid='" + parentTaskId + "']");
        $ul = $li.parent();
        isMaster = $ul.hasClass('singleFolderTask');
        hasSubTask = $li.children('ul').length > 0;
      } else {
        // 顶级任务
        const stageId = data.stageID || 'undefined';
        const stageName = !data.StageName ? _l('进行中') : data.StageName;
        let $stage = $("#taskList span[data-stageid='" + stageId + "']").parent();

        // 无任务
        if ($stage.length) {
          $li = $stage.next();
        } else {
          $stage = $(
            '<div class="taskListStageName"> <i class="arrow-down"></i> <span data-stageid="' +
              stageId +
              '" class="listFolderNameText boderRadAll_3 overflow_ellipsis" title="' +
              stageName +
              '" >' +
              stageName +
              '</span> <span class="stageTaskCount">0</span></div><div class="listStageTaskContent"><ul class="singleFolderTask"></ul></div>'
          );
          $('#taskList').append($stage);
          $li = $($stage[1]);

          const $createNewSingle = $('#taskList .createNewSingle');
          // 包裹创建任务
          if (!$createNewSingle.parent().is('.createNewTask')) {
            $stage.eq(1).prepend($createNewSingle);
            $createNewSingle.wrap('<div class="createNewTask"></div>');
            $createNewSingle.find('input').focus();
          }
          // 快速创建任务 已经有任务了
          $('.listCreateNew, #taskSearchNullTask').remove();
        }

        isMaster = true;
        hasSubTask = true;
      }

      // 有子任务 且没展开过
      if ($li.find('ul').length <= 0 && $li.find('.nodeSwitch.on').length > 0 && parentTaskId) {
        // 子任务数
        $sumCount = $li.children('.singleTreeTask').find('.subCount');
        $sumCount.text(parseInt($sumCount.text() || 0, 10) + 1);
        return;
      }

      // 顶级
      if (isMaster) {
        folders.deep = 0;
        folders.pageIndex = 2;
        // 判断是否有母任务
        if (parentTaskId) {
          folders.data = [data];
          folders.deep = 1;
        } else {
          folders.data.stages[0].id = '1';
        }

        if (!hasSubTask) {
          folders.isNew = false;
        }
      } else {
        folders.deep = $li.data('deep'); // 1;
        // 子级
        if (!hasSubTask) {
          folders.isNew = false;
        }
        folders.data = [data];
      }

      const allTasks = doT.template(treeMaster)(folders);
      const $singleTreeTask = $li.children('.singleTreeTask');

      if (isMaster) {
        // 没有子节点
        if ($li.children('ul').length <= 0) {
          $singleTreeTask.find('.nodeSwitch').addClass('off');
          $singleTreeTask.append('<div class="joinLine"></div>');
          $li.append(allTasks);
          // 子任务数
          if ($singleTreeTask.find('.icon-task-card').length <= 0) {
            $singleTreeTask
              .find('.taskListDate')
              .before(
                '<i class="icon-task-card" tip="' +
                  _l('子任务') +
                  '"></i> <span class="subCounts"><span class="completeCount">0</span>/<span class="subCount">1</span></span> '
              );
          }
        } else {
          $li.children('ul').prepend(allTasks);
          if (!$li.is('.listStageTaskContent')) {
            // 子任务数
            $sumCount = $singleTreeTask.find('.subCount');
            $sumCount.text(parseInt($sumCount.text() || 0, 10) + 1);
          }
        }
      } else {
        let pLeft = 20;
        const deep = folders.deep;
        if (deep != 1) {
          pLeft = deep * 20;
        }

        if ($li.children('ul').length <= 0) {
          $singleTreeTask.find('.subNoneNode').remove();
          $singleTreeTask.find('.nodeCircleSmall').replaceWith('<span class="nodeSwitch off "></span>');
          $singleTreeTask.append('<div style="left:' + pLeft + 'px;" class="joinLine"></div>');
          $li.append(allTasks);
          // 子任务数
          if ($singleTreeTask.find('.icon-task-card').length <= 0) {
            $singleTreeTask
              .find('.taskListDate')
              .before(
                '<i class="icon-task-card" tip="' +
                  _l('子任务') +
                  '"></i> <span class="subCounts"><span class="completeCount">0</span>/<span class="subCount">1</span></span> '
              );
          }
        } else {
          $li.children('ul').prepend(allTasks);
          // 子任务数
          $sumCount = $singleTreeTask.find('.subCount');
          $sumCount.text(parseInt($sumCount.text() || 0, 10) + 1);
        }
      }
      // 计算加一
      if (!filterUserId) {
        if (!parentTaskId) {
          const $stageTaskCount = $li.prev('.taskListStageName').find('.stageTaskCount');
          $stageTaskCount.text(parseInt($stageTaskCount.text() || 0, 10) + 1);
        }

        const $allCountTask = $('.myTask .allCountTask:first');
        $allCountTask.text(parseInt($allCountTask.text() || 0, 10) + 1);
      }
    }
  };

  render() {
    const { openTaskDetail, taskId, isForceUpdate } = this.state;

    return (
      <Fragment>
        <div id="taskList" />
        <TaskDetail
            visible={openTaskDetail}
            taskId={taskId}
            isForceUpdate={isForceUpdate}
            closeForceUpdate={() => this.setState({ isForceUpdate: false })}
            openType={1}
            closeCallback={() => this.setState({ taskId: '' })}
            animationEndRemoveDetail={() => this.mounted && this.setState({ openTaskDetail: false })}
          />
      </Fragment>
    );
  }
}

export default connect(state => state.task)(TaskTree);
