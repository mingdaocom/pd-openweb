import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import './css/taskList.less';
import _ from 'lodash';
import { connect } from 'react-redux';
import ajaxRequest from 'src/api/taskCenter';
import doT from 'dot';
import config from '../../config/config';
import { listLoadingContent } from '../../utils/taskComm';
import { formatTaskTime, errorMessage, formatStatus, buildMyTaskIcon, checkIsProject } from '../../utils/utils';
import nodeCommTr from './tpl/nodeCommTr.html';
import folderTask from './tpl/folderTask.html';
import nodeTr from './tpl/nodeTr.html';
import singleTask from './tpl/singleTask.html';
import taskClassify from './tpl/taskClassify.html';
import singleNewTask from './tpl/singleNewTask.html';
import { updateMyTaskDataSource, updateSearchTaskCount } from '../../redux/actions';
import TaskDetail from '../taskDetail/taskDetail';
import { UserHead } from 'ming-ui';
import { updateTaskCharge } from '../../redux/actions';
import { dialogSelectUser } from 'ming-ui/functions';

const taskListSettings = {
  pageIndex: 1,
  isMore: true,
  isLoading: false,
  timer: null,
  isFirst: true,
  categoryTime: null,
  categoryNumber: null,
  isAnimated: true,
  myTaskIsMore: {
    0: true,
    1: true,
    2: true,
    3: true,
  },
  typeNum: {},
  taskListPost: null,
};

class TaskList extends Component {
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
    // 有缓存数据先呈现
    if (!_.isEmpty(this.props.myTaskDataSource)) {
      const { taskFilter, filterUserId, listSort, listStatus, filterSettings } = this.props.taskConfig;
      const isMyTask =
        !filterUserId &&
        listSort === 0 &&
        (taskFilter === 6 || taskFilter === 1 || taskFilter === 2 || taskFilter === 3) &&
        !filterSettings.tags.length &&
        listStatus === 0;
      const data = this.props.myTaskDataSource;

      data.hideOpts = true;
      taskListSettings.isFirst = true;

      isMyTask ? this.renderMyTask(data) : this.renderTask(data);
      taskListSettings.isAnimated = false;
    }

    this.init();
    this.bindEvents();
    this.props.emitter.removeListener('CREATE_TASK_TO_LIST', this.quickCreateTaskCallback);
    this.props.emitter.addListener('CREATE_TASK_TO_LIST', this.quickCreateTaskCallback);
    this.props.emitter.removeListener('UPDATE_TASK_CHARGE', this.renderChargeHeaderAvatar);
    this.props.emitter.addListener('UPDATE_TASK_CHARGE', this.renderChargeHeaderAvatar.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    if (
      !nextProps.taskConfig.folderId &&
      (!_.isEqual(nextProps.taskConfig, this.props.taskConfig) || config.isGetData)
    ) {
      // 解决props未更新问题
      setTimeout(() => {
        taskListSettings.taskListPost.abort();
        this.init();
      }, 0);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    taskListSettings.taskListPost.abort();
    clearTimeout(taskListSettings.timer);
    this.props.emitter.removeListener('CREATE_TASK_TO_LIST', this.quickCreateTaskCallback);
    this.props.emitter.removeListener('UPDATE_TASK_CHARGE', this.renderChargeHeaderAvatar);
  }

  init() {
    taskListSettings.pageIndex = 1;
    taskListSettings.isMore = true;
    taskListSettings.isLoading = false;
    taskListSettings.isFirst = true;
    taskListSettings.myTaskIsMore = {
      0: true,
      1: true,
      2: true,
      3: true,
    };
    taskListSettings.typeNum = {};

    const { taskFilter, filterUserId, listSort, listStatus, filterSettings } = this.props.taskConfig;
    config.isMyTask =
      !filterUserId &&
      listSort === 0 &&
      (taskFilter === 6 || taskFilter === 1 || taskFilter === 2 || taskFilter === 3) &&
      listStatus === 0;
    config.FilterMeTaskClassify = [3];
    config.FilterTaskID = [];

    // 获取数据
    if (config.isMyTask) {
      this.getMyTaskByType();
    } else {
      this.getTasksByType();
    }
  }

  renderChargeHeaderAvatar(params) {
    const { taskConfig } = this.props;
    $('#tasks .listStageTaskContent tr .chargeTd').each((i, ele) => {
      let $ele = $(ele);
      if ($ele.data('hasbusinesscard')) return;
      const folderId = taskConfig.folderId;
      let projectId = taskConfig.projectId;
      let taskId;

      if (folderId) {
        taskId = $ele.closest('li').data('taskid');
      } else {
        taskId = $ele.closest('tr').data('taskid');
        projectId = $ele.closest('tr').data('projectid');
      }

      const accountId = params ? _.get(params.data, 'data.charge.accountID') : $ele.data('id');
      const avatar = params ? _.get(params.data, 'data.charge.avatar') : $ele.data('src');
      const auth = params ? _.get(params.data, 'data.auth') : $ele.data('auth');

      if (params) $ele.data('auth', auth);
      $ele.data('hasbusinesscard', true);
      ReactDOM.render(
        <UserHead
          user={{
            userHead: avatar,
            accountId: accountId,
          }}
          size={26}
          operation={
            auth === config.auth.Charger ? (
              <span
                className="updateChargeBtn ThemeColor3"
                onClick={() => {
                  dialogSelectUser({
                    sourceId: folderId,
                    showMoreInvite: false,
                    fromType: 2,
                    SelectUserSettings: {
                      includeUndefinedAndMySelf: true,
                      filterAccountIds: [accountId],
                      projectId: checkIsProject(projectId) ? projectId : '',
                      unique: true,
                      callback: users => {
                        const user = users[0];

                        this.props.dispatch(
                          updateTaskCharge(taskId, user, '', () => {
                            $ele.data('id', user.accountId).data('src', user.avatar).data('hasbusinesscard', false);
                            this.renderChargeHeaderAvatar();
                          }),
                        );
                      },
                    },
                  });
                }}
              >
                {_l('将任务托付给他人')}
              </span>
            ) : null
          }
        />,
        ele,
      );
    });
  }

  bindEvents() {
    const $taskList = $('#taskList');
    const that = this;

    // 点击出详情
    $taskList.on('click', '.listStageTaskContent tr', function (event) {
      const _this = $(this);
      let isMuil = false;
      let metaKeyType;

      if ($(event.target).hasClass('markTask') || $(event.target).hasClass('taskStar')) {
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

      // 不是多选
      if (!isMuil) {
        config.$prevNode = _this;
        const $txtName = _this.find('.txtName');

        // 项目中分多个table
        $('#taskList table tr').removeClass('selectTask ThemeBGColor6');
        // 点击td
        _this.addClass('selectTask ThemeBGColor6');
        const taskId = _this.data('taskid');

        that.setState({
          openTaskDetail: true,
          taskId,
          isForceUpdate: true,
        });
      } else {
        that.setState({
          openTaskDetail: false,
          taskId: '',
        });
        import('../batchTask/batchTask').then(batchTask => {
          batchTask.default.shiftCtrlKey(_this, metaKeyType);
        });
      }

      if ($('#taskList')[0]) {
        $('.floatingHeader').css(
          'right',
          660 - $('#taskList')[0].scrollWidth + $('#taskList')[0].offsetWidth + $('#chat').width(),
        );
      }

      return false;
    });

    // 分类标题点击
    $taskList.on(
      {
        click(event) {
          const $area = $(this).closest('.persist-area').length ? $(this).parentsUntil('#taskList') : $(this);
          const $List = $(this).closest('.persist-area').length
            ? $(this).parentsUntil('#taskList').find('.listStageTaskContent')
            : $(this).next('.listStageTaskContent');
          if ($List.is(':animated')) return;

          const { listSort } = that.props.taskConfig;

          $List.toggle(1, () => {
            if (listSort == 4) return;
            // 我的任务 更新 FilterTaskID与FilterMeTaskClassify
            that.myTaskManipulation($List);
          });
          $area.find('.arrow-down').toggleClass('downArrow');
          that.hideTaskSetting();
          event.stopPropagation();
        },
        hover(event) {
          const isAdd = event.type == 'mouseenter';
          $(this).find('.listFolderNameTextList').toggleClass('ThemeColor3', isAdd);
          $(this).find('.arrow-down').toggleClass('ThemeBorderColor3', isAdd);
        },
      },
      '.taskListFolderName',
    );

    // 页面滚动加载更多
    $taskList.on('scroll', function () {
      const { folderId, taskFilter, listSort } = that.props.taskConfig;
      // 阶段视图不分页
      if (folderId || taskFilter === 9) {
        return;
      }
      // myTaskSettings hidden
      that.hideTaskSetting();
      const _this = $(this);
      const nDivHight = _this.height();
      const nScrollHight = _this[0].scrollHeight;
      const nScrollTop = _this[0].scrollTop;
      let myTaskIsMore = false;

      if (nScrollTop + nDivHight + 100 >= nScrollHight) {
        $('.listStageTaskContent')
          .filter(':visible')
          .each((v, i) => {
            if (taskListSettings.myTaskIsMore[i]) {
              myTaskIsMore = true;
            }
          });
        if ((taskListSettings.isMore || myTaskIsMore) && !taskListSettings.isLoading) {
          taskListSettings.pageIndex++;
          if (config.isMyTask) {
            that.getMyTaskByType();
          } else {
            // 获取数据
            that.getTasksByType();
          }
        }
      }
    });

    // 我的任务 菜单弹层
    $taskList.on('click', '.myTaskTag', function (event) {
      // 防止出详情
      event.stopPropagation();
      const projectId = $(this).closest('tr').data('projectid');
      const taskId = $(this).closest('tr').data('taskid');
      const type = $(this).closest('table').data('type');
      const $list = $('.myTaskSettingList').data('taskid', taskId).data('projectid', projectId);
      const offset = $(this).offset();
      const winHeight = parseInt(window.innerHeight, 10);

      that.hideTaskSetting();

      if (!$(this).children().hasClass('Hidden')) {
        return false;
      }

      $list.removeClass('Hidden').data('type', type);
      $list.find('li').removeClass('ThemeColor3');
      $list.find('[data-type=' + type + ']').addClass('ThemeColor3');
      $(this).children().removeClass('Hidden');
      // 判断在下方是否放的下， 否则放在上面
      if (offset.top + $list.height() + $('#topBarContent').height() > winHeight) {
        $list.css({
          left: offset.left - 14,
          top: offset.top - 5 - $list.height(),
        });
      } else {
        $list.css({
          left: offset.left - 14,
          top: offset.top + 40,
        });
      }
    });

    $('.myTaskSettingList li').on('click', function () {
      const $this = $(this);
      const taskId = $this.closest('ul').data('taskid');
      const type = $this.data('type');
      const $list = $this.parent();
      if ($list.data('type') == type) return;
      // hide settings list
      that.hideTaskSetting();
      that.updateMyTaskClassify(taskId, type);
    });

    $taskList.on('mousedown', 'table', e => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    });

    // 绑定创建新任务
    $taskList.on('click', '.creatNewContent', () => {
      $.CreateTask();
    });

    // document事件
    $(document).on('click', event => {
      const $target = $(event.target);
      // `我的任务`
      if (
        $target.closest('.myTaskSettingList').length <= 0 &&
        $target.closest('.myTaskTag').length <= 0 &&
        !$target.is('.myTaskIcon')
      ) {
        that.hideTaskSetting();
      }
    });
  }

  /**
   * 获取任务列表
   */
  getTasksByType() {
    taskListSettings.isLoading = true;
    // 加载动画
    listLoadingContent(taskListSettings.pageIndex);

    const { lastMyProjectId, taskFilter, listSort, listStatus, filterUserId, completeTime, filterSettings } =
      this.props.taskConfig;
    const tagIDs = _.filter(filterSettings.tags, tagId => tagId !== 'null');
    let withoutTag = false;
    const keyWords = this.props.taskConfig.searchKeyWords;

    if (_.findIndex(filterSettings.tags, tagId => tagId === 'null') >= 0) {
      withoutTag = true;
    }

    // 非星标任务
    if (taskFilter !== 8) {
      taskListSettings.taskListPost = ajaxRequest.getTaskList({
        page: taskListSettings.pageIndex,
        size: config.pageSize,
        sort: listSort,
        other: filterUserId,
        filterType: taskFilter || 6,
        completeTime,
        status: listStatus,
        tagIDs: tagIDs,
        withoutTag,
        folderID: '',
        structure: listSort === 4 ? config.structure.folderList : config.structure.list,
        isFirst: taskListSettings.isFirst,
        projectId: lastMyProjectId,
        keyWords,
      });
    } else {
      // 星标任务
      taskListSettings.taskListPost = ajaxRequest.getTaskListWithStar({
        pageIndex: taskListSettings.pageIndex,
        pageSize: config.pageSize,
        completeTime,
        status: listStatus,
        projectId: lastMyProjectId,
      });
    }

    taskListSettings.taskListPost.then(source => {
      taskListSettings.isLoading = false;
      config.isGetData = false;

      if (source.status) {
        taskListSettings.pageIndex === 1 &&
          !filterUserId &&
          this.props.dispatch(updateMyTaskDataSource(_.cloneDeep(source.data))); // 首屏缓存数据
        // 没有动画就延迟渲染数据
        if (taskListSettings.isAnimated) {
          this.renderTask(source.data);
        } else {
          taskListSettings.timer = setTimeout(() => {
            this.renderTask(source.data);
          }, 100);
        }
      } else {
        errorMessage(source.error);
      }
    });
  }

  /**
   * 渲染我的任务列表视图
   */
  renderTask(data) {
    const { keyWords, listSort, listStatus, filterSettings } = this.props.taskConfig;
    const taskCount = data.data && data.data.length;

    this.props.dispatch(updateSearchTaskCount(data.taskNum));

    if (taskCount) {
      data.formatTaskTime = formatTaskTime;
      data.formatStatus = formatStatus;
      data.isAnimated = taskListSettings.isAnimated;
      // 按项目排序
      if (listSort === 4) {
        // 判断有无更多
        let size = 0;
        $.map(data.data, (folder, i) => {
          size += (folder.tasks || []).length;
        });
        taskListSettings.isMore = size >= config.pageSize;

        // 初始直接打输出到页面
        if (taskListSettings.pageIndex == 1) {
          const singleTaskTpl = folderTask.replace('#include.nodeCommTr', nodeCommTr);
          $('#taskList').html(doT.template(singleTaskTpl)(data));
          // 动画
          this.slideUpTd();
        } else {
          const existsFolderIdArray = [];

          // 获取页面存在的folderId
          $('#taskList .taskListFolderName').each(function () {
            const folderId = $(this).data('folderid');
            if (existsFolderIdArray.indexOf(folderId) < 0) {
              existsFolderIdArray.push(folderId);
            }
          });

          const folders = data.data;
          let folderCount = folders.length;
          let folder;
          // 存在的项目
          for (let i = 0; i < folderCount; i++) {
            if (!folders[i].folderID) {
              folders[i].folderID = 1;
            }
            folder = folders[i];
            if (existsFolderIdArray.indexOf(folder.folderID) > -1) {
              folder.formatTaskTime = formatTaskTime;
              folder.formatStatus = formatStatus;
              // 移除数据
              _.remove(folders, item => item.folderID === folder.folderID);
              const nodeTrTpl = nodeTr.replace('#include.nodeCommTr', nodeCommTr);
              // 数据
              $("#taskList .taskListFolderName[data-folderid='" + folder.folderID + "']")
                .next()
                .find('table tbody')
                .append(doT.template(nodeTrTpl)(folder));
              // 动画
              this.slideUpTd();

              i--;
              folderCount = folders.length;
            }
          }

          // 新项目
          if (data.data.length > 0) {
            const singleTaskTpl = folderTask.replace('#include.nodeCommTr', nodeCommTr);
            $('#taskList').append(doT.template(singleTaskTpl)(data));
            // 动画
            this.slideUpTd();
          }
        }
      } else {
        data.pageIndex = taskListSettings.pageIndex;
        const singleTaskTpl = singleTask.replace('#include.nodeCommTr', nodeCommTr);
        const allTasks = doT.template(singleTaskTpl)(data);
        if (taskListSettings.pageIndex === 1) {
          $('#taskList').html(allTasks);
        } else {
          $('#taskList table tbody').append(allTasks);
        }
        // 动画
        this.slideUpTd();
        // 是否存在更多
        taskListSettings.isMore = data.data.length >= config.pageSize;
      }
    } else {
      // 第一页 时没有数据才显示无数据
      if (taskListSettings.pageIndex === 1) {
        if (keyWords) {
          $('#taskList').html(config.configHtml.searchNullHtml);
        } else if (filterSettings.tags.length) {
          $('#taskList').html(config.configHtml.filterNullHtml);
        } else if (listStatus === 1) {
          $('#taskList').html(config.configHtml.noCompleteNullHtml);
        } else {
          this.renderNoData();
        }
      }
      taskListSettings.isMore = false;
    }

    taskListSettings.isAnimated = true;
    // 移除加载层
    $('#taskFilterLoading, #taskFilterLoadingBottom').remove();
    this.renderChargeHeaderAvatar();
  }

  /**
   * 获取我的任务4种分类数据
   */
  getMyTaskByType() {
    taskListSettings.isLoading = true;
    // 加载动画
    listLoadingContent(taskListSettings.pageIndex);
    let flag = false;

    // 没有关闭的`我的任务`分类
    const classify = $.grep([0, 1, 2, 3], i => {
      return $.inArray(i, config.FilterMeTaskClassify) == -1;
    });

    if (classify.length == 0) {
      classify.push(0);
    }

    $.each(classify, (i, v) => {
      // 存在 有打开的分类 没有加载完 则继续加载
      if (taskListSettings.myTaskIsMore[v]) {
        flag = true;
        return false;
      }
    });
    // 是否继续加载
    if (!flag) {
      $('#taskFilterLoading, #taskFilterLoadingBottom').remove();
      return false;
    }

    const { listStatus, listSort, filterUserId, taskFilter, completeTime, lastMyProjectId, filterSettings } =
      this.props.taskConfig;
    const tagIDs = _.filter(filterSettings.tags, tagId => tagId !== 'null');

    taskListSettings.taskListPost = ajaxRequest.getTaskList({
      page: taskListSettings.pageIndex,
      size: config.pageSize,
      sort: listSort,
      other: filterUserId,
      filterType: taskFilter || 6,
      completeTime,
      status: listStatus,
      tagIDs: tagIDs,
      withoutTag: false,
      structure: config.structure.myClassify,
      classify: config.FilterMeTaskClassify.length == 3 ? classify.join(',') : -1, // -1: 除单个外的其他
      filterTaskIDs: config.FilterTaskID.join(','),
      filterMeTaskClassifys: config.FilterMeTaskClassify.join(','),
      isFirst: taskListSettings.isFirst,
      projectId: lastMyProjectId,
      keyWords: '',
    });

    taskListSettings.taskListPost.then(source => {
      taskListSettings.isLoading = false;
      config.isGetData = false;

      if (source.status) {
        taskListSettings.pageIndex === 1 &&
          !filterUserId &&
          this.props.dispatch(updateMyTaskDataSource(_.cloneDeep(source.data))); // 首屏缓存数据
        // 没有动画就延迟渲染数据
        if (taskListSettings.isAnimated) {
          this.renderMyTask(source.data);
        } else {
          taskListSettings.timer = setTimeout(() => {
            this.renderMyTask(source.data);
          }, 100);
        }
      } else {
        errorMessage(source.error);
      }
    });
  }

  /**
   * 渲染我的任务 4分类数据
   */
  renderMyTask(data) {
    data.formatTaskTime = formatTaskTime;
    data.formatStatus = formatStatus;
    data.buildMyTaskIcon = buildMyTaskIcon;
    data.isMyTask = true;
    data.pageIndex = taskListSettings.pageIndex;
    data.TYPES = config.MYTASKTYPES;
    data.TIPS = config.TIPS;
    data.FilterMeTaskClassify = config.FilterMeTaskClassify;
    data.isAnimated = taskListSettings.isAnimated;
    // 是否含有更多
    this.updateMyTaskIsMore(data);

    if (taskListSettings.isFirst) {
      const myTaskTpl = taskClassify.replace('#include.nodeCommTr', nodeCommTr);
      $('#taskList').html(doT.template(myTaskTpl)(data));
      if (data.taskNum === 0) {
        this.renderNoData();
      }
      // 每个分类上的 任务计数
      this.renderMyTaskNum(data);
    } else {
      const nodeTrTpl = nodeTr.replace('#include.nodeCommTr', nodeCommTr);
      Object.keys(data.data).forEach(key => {
        key = key.substring(key.indexOf('num_') + 4);
        if (key in data.TYPES) {
          data.type = parseInt(key, 10);
          data.tasks = data.data['classify_' + key];
          const html = doT.template(nodeTrTpl)(data);
          $('#taskList .taskListFolderName[data-type=' + key + ']')
            .next('.listStageTaskContent')
            .find('tbody')
            .append(html);
        }
      });
    }

    taskListSettings.isFirst = false;
    taskListSettings.isAnimated = true;
    this.fixTitle();
    $('#taskFilterLoading, #taskFilterLoadingBottom, #trInlineLoading').remove();
    // 动画
    this.slideUpTd();
    this.renderChargeHeaderAvatar();
  }

  /**
   * 渲染无数据情况
   */
  renderNoData() {
    const { listSort } = this.props.taskConfig;
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

  /**
   * 判断`我的任务` 分类 isMore
   */
  updateMyTaskIsMore(data) {
    const classify = $.grep([0, 1, 2, 3], i => {
      return $.inArray(i, config.FilterMeTaskClassify) == -1;
    });
    let sumList = 0;
    /* 判断 是否分类还有更多
      classify: 未关闭的列表type array
      遍历未关闭的列表数据 返回数据任务数目>=PageSize => 该分类还有个更多 一个分类未完时是不会返回下个分类的 break loop
      若分类已完成 将isMore 设为false
      */
    $.each(classify, (item, v) => {
      const arr = data.data['classify_' + v];
      for (let i = 0; i < v + 1; i++) {
        sumList += data.data['classify_' + i] ? data.data['classify_' + i].length : 0;
      }
      // undefined
      if (!arr) {
        taskListSettings.myTaskIsMore[v] = false;
      } else if (sumList >= config.pageSize) {
        taskListSettings.myTaskIsMore[v] = true;
        return false;
      } else {
        taskListSettings.myTaskIsMore[v] = false;
      }
    });
  }

  /**
   * 每个分类上的 任务计数
   */
  renderMyTaskNum(data) {
    if (config.FilterMeTaskClassify.length === 4) return;
    $.each(data.data, (key, val) => {
      // typeNum 计数
      if (/^num_\d$/.test(key) && !taskListSettings.typeNum[key]) {
        const type = key.slice(-1);
        const $box = $('#taskList .taskListFolderName')
          .filter('[data-type=' + type + ']')
          .find('.stageTaskCount');
        $box.text(val || '');
        // 只取第一次计数
        taskListSettings.typeNum[key] = val;
      }
    });
  }

  /**
   * 滚动固定分类头
   */
  fixTitle() {
    if ($('#taskList').find('.floatingHeader').length <= 0) {
      $('.persist-area').each(function () {
        const clonedHeaderRow = $('.persist-header', this);
        clonedHeaderRow.before(clonedHeaderRow.clone()).addClass('floatingHeader');
      });
      $('#taskList').on('scroll', () => {
        $('.persist-area').each(function () {
          const el = $(this);
          const offset = el.offset();
          const top = offset.top - 152;
          const scrollTop = $('#taskList').scrollTop();
          const floatingHeader = $('.floatingHeader', this);
          $('.floatingHeader').css({
            visibility: 'hidden',
            right:
              $('.taskDetail').width() +
              20 -
              $('#taskList')[0].scrollWidth +
              $('#taskList')[0].offsetWidth +
              $('#chat').width() +
              $('.taskFilterBox').width(),
          });
          if (scrollTop > 0 && top + el.height() > 0) {
            floatingHeader.css({
              visibility: 'visible',
            });
            return false;
          }

          floatingHeader.css({
            visibility: 'hidden',
          });
        });
      });
    }
  }

  /**
   * `我的任务`分页加载`逻辑
   */
  myTaskManipulation($List) {
    const $taskList = $('#taskList');
    const $types = $taskList.find('.taskListFolderName[data-type]').not('.floatingHeader');
    // 忽略的`我的任务`分类 reset
    config.FilterMeTaskClassify = [];
    config.FilterTaskID = [];
    // 重置pageIndex
    taskListSettings.pageIndex = 0;
    $types.each(function (i, e) {
      const $this = $(this);
      const $tasks = $this.siblings('.listStageTaskContent').find('tr');
      const isClosed = $this.find('.downArrow').length > 0;
      const type = $this.data('type');
      if (isClosed) {
        config.FilterMeTaskClassify.push(type);
        $('.listStageTaskContent')
          .filter(':visible')
          .find('tr')
          .each(function () {
            const $task = $(this);
            const taskId = $task.data('taskid');
            if (config.FilterTaskID.indexOf(taskId) < 0) {
              config.FilterTaskID.push(taskId);
            }
          });
      } else {
        $tasks.each(function () {
          const $task = $(this);
          const taskId = $task.data('taskid');
          config.FilterTaskID.push(taskId);
        });
      }
    });

    this.myTaskPreLoad($List);
  }

  /**
   * `我的任务` preload
   */
  myTaskPreLoad($List) {
    const $taskList = $('#taskList');
    const $trs = $taskList.find('table tr').filter(':visible');
    // 余下数据不足一屏 自动加载
    if ($trs.length < config.pageSize || !$List.find('tr').length) {
      taskListSettings.pageIndex = 1;
      this.getMyTaskByType();
    }
  }

  /**
   * 隐藏我的任务操作菜单
   */
  hideTaskSetting() {
    const $list = $('.myTaskSettingList');
    $('#taskList .myTaskTag').children().add($list).addClass('Hidden');
  }

  /**
   * 收起
   */
  slideUpTd() {
    const $animatedFarFast = $('#taskList tr.animatedFarFast td.animatedFarFast');
    const $trs = $('#taskList tr');

    $animatedFarFast.each(function (i) {
      $(this)
        .animate(
          {
            height: '0px',
          },
          300,
        )
        .delay((i + 1) * 30);
    });

    $trs.each(function (i) {
      $(this).animate(
        {
          opacity: 1,
        },
        300,
      );
    });

    Promise.all([$animatedFarFast.promise(), $trs.promise()]).then(() => {
      $('#taskList tr.animatedFarFast').remove();
    });
  }

  /**
   * 修改我的任务分类
   */
  updateMyTaskClassify(taskIDs, type) {
    const { listSort } = this.props.taskConfig;
    ajaxRequest
      .updateTaskMemberClassify({
        taskIDstr: taskIDs,
        classify: type,
      })
      .then(source => {
        if (source.status) {
          if (listSort === 0) {
            this.afterUpdateClassify(taskIDs.split(','), type);
          }
          config.FilterTaskID = config.FilterTaskID.concat(taskIDs.split(','));
          alert(_l('操作成功'), 1);
        } else {
          errorMessage(source.error);
        }
      });
  }

  /**
   * 修改我的任务分类调整数据
   */
  afterUpdateClassify(taskArray, type) {
    $('#taskList .taskListFolderName').filter('[data-type=0]').removeClass('Hidden');
    const $title = $('#taskList .taskListFolderName')
      .filter('[data-type=' + type + ']')
      .removeClass('Hidden');
    const $new = $title.next().find('table tbody');
    const $newCount = $title.find('.stageTaskCount');
    const count = parseInt($newCount.html(), 10) || 0;

    $title.parents('.persist-area').removeClass('Hidden');
    $newCount.html((count <= 0 ? 0 : count) + taskArray.length);

    $.each(taskArray, (i, v) => {
      $('#taskList tr[data-taskid=' + v + ']')
        .find('.myTaskTag')
        .html(buildMyTaskIcon(type));
      const $tr = $('#taskList tr[data-taskid=' + v + ']');
      const $oldTitle = $tr.closest('.listStageTaskContent').siblings('.taskListFolderName');
      const $oldCount = $oldTitle.find('.stageTaskCount');
      const newCount = parseInt($oldCount.html(), 10) - 1 || 0;

      $oldCount.html(newCount <= 0 ? 0 : newCount);
      $tr.find('.myTaskTag').html(buildMyTaskIcon(type));
      $tr.prependTo($new);
    });
  }

  /**
   * 快速创建任务回调
   */
  quickCreateTaskCallback = result => {
    alert(_l('创建成功'));
    const { lastMyProjectId, projectId, listSort, filterUserId } = this.props.taskConfig;

    // 不是在所有网络和当前网络下的时候不添加
    if (lastMyProjectId !== 'all' && lastMyProjectId !== result.data.projectId) return;

    const source = {
      formatTaskTime,
      formatStatus,
      buildMyTaskIcon,
      Sort: listSort,
      isMyTask: listSort === 0,
      createNewTask: true,
      task: result.data,
    };

    // 母任务处理
    const parentTaskId = result.data.parentTaskId;
    if (parentTaskId) {
      const $tr = $("#taskList tr[data-taskid='" + parentTaskId + "']");
      if ($tr.find('.icon-task-card').length > 0) {
        const $subCount = $tr.find('.subCount');
        $subCount.text(parseInt($subCount.text(), 10) + 1);
      } else {
        $tr
          .find('.taskListDate')
          .prepend(
            '<i class="icon-task-card" data-tip="' +
              _l('子任务') +
              '"></i><span class="subCounts"><span class="completedNum">0</span>/<span class="subCount">1</span></span> ',
          );
      }
    }

    // 兼容数据
    source.task.auth = 1;
    source.task.newTask = false;
    source.task.status = 0;

    // 存在table
    if ($('#taskList table').length > 0) {
      source.isExists = true;
    }
    if (listSort == 4) {
      // 不存在`未关联的项目`
      if ($('.taskListFolderName[data-folderid=null]').length <= 0) {
        source.isExists = false;
      } else {
        source.isExists = true;
      }
    }

    $('#taskList .listCreateNew').remove();
    const singleTaskTpl = singleNewTask.replace('#include.nodeCommTr', nodeCommTr);
    // 数据
    const allTasks = doT.template(singleTaskTpl)(source);

    // 按项目
    if (listSort == 4) {
      const folderId = source.data.folderID;
      if (source.isExists) {
        $(".taskListFolderName[data-folderid='" + folderId + "']")
          .next()
          .find('table tbody')
          .prepend(allTasks);
      } else {
        const $html = $(
          '<div class="taskListFolderName" data-folderid="null"> <i class="arrow-down"></i> <span class="listFolderNameTextList ThemeColor9" title="' +
            _l('未关联项目') +
            '">' +
            _l('未关联项目') +
            '</span> <span class="folderTaskCount">1</span> </div>',
        );
        $('#taskList').append($html).append(allTasks);
      }
    } else {
      if (source.isExists) {
        $('#taskList table:first tbody').prepend(allTasks).closest('.persist-area').removeClass('Hidden');
      } else {
        $('#taskList').html(allTasks);
      }
    }

    // 计算加一
    if (!filterUserId) {
      const $allCountTask = $('.myTask .allCountTask:first');
      $allCountTask.text(parseInt($allCountTask.text() || 0, 10) + 1);
    }
    this.renderChargeHeaderAvatar();
  };

  /**
   * 消除新任务、新讨论、小红点
   */
  openTaskDetailCallback = () => {
    const $el = $('#taskList tr[data-taskid=' + this.state.taskId + ']');
    const $newTopic = $el.find('.newTopic');
    const $newTaskTip = $el.find('.newTaskTip');
    // 处理小红点
    const removeTipFun = function () {
      if ($el.data('isnotice')) {
        const $leftNewTip = $('#taskNavigator .myTask .newTip');
        if ($leftNewTip.length) {
          const count = parseInt($leftNewTip.attr('data-count'), 10);
          if (count === 1) {
            $leftNewTip.remove();
          } else {
            $leftNewTip.attr('data-count', count - 1);
          }
        }
      }
    };

    // 清除新任务通知
    if ($newTaskTip.length) {
      $newTaskTip.animate(
        {
          width: '0px',
        },
        150,
        function () {
          $(this).remove();
        },
      );

      $el.find('.spanName').animate(
        {
          'border-left-width': '0px',
        },
        150,
        function () {
          $(this).removeClass('newTaskTipName');
        },
      );
    }

    // 清除新讨论通知
    if ($newTopic.length) {
      $newTopic.animate(
        {
          'margin-top': '5px',
        },
        150,
      );
      $newTopic.fadeOut(() => {
        $newTopic.remove();
        removeTipFun();
      });
    }
  };

  render() {
    const { openTaskDetail, taskId, isForceUpdate } = this.state;

    return (
      <Fragment>
        <ul className="myTaskSettingList borderRadAll_3 Hidden">
          <li data-type="1" className="myTaskChoice ThemeBGColor3">
            <i className="icon-task-today" />
            {_l('今天要做')}
          </li>
          <li data-type="2" className="myTaskChoice ThemeBGColor3">
            <i className="icon-task-soon" />
            {_l('最近要做')}
          </li>
          <li data-type="3" className="myTaskChoice ThemeBGColor3">
            <i className="icon-task-later" />
            {_l('以后考虑')}
          </li>
        </ul>
        <div id="taskList" />
        <TaskDetail
          visible={openTaskDetail}
          taskId={taskId}
          isForceUpdate={isForceUpdate}
          closeForceUpdate={() => this.setState({ isForceUpdate: false })}
          openType={1}
          hasNotice={taskId && !!$('#taskList tr[data-taskid=' + taskId + '] .newTopic').length}
          openCallback={this.openTaskDetailCallback}
          closeCallback={() => this.setState({ taskId: '' })}
          animationEndRemoveDetail={() => this.mounted && this.setState({ openTaskDetail: false })}
        />
      </Fragment>
    );
  }
}

export default connect(state => state.task)(TaskList);
