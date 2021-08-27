import React, { Component, Fragment } from 'react';
import ReactDom from 'react-dom';
import './css/taskStage.less';
import { connect } from 'react-redux';
import doT from 'dot';
import ajaxRequest from 'src/api/taskCenter';
import Score from 'ming-ui/components/Score';
import { listLoadingContent } from '../../utils/taskComm';
import { formatTaskTime, errorMessage, formatStatus, checkIsProject, returnCustonValue } from '../../utils/utils';
import config from '../../config/config';
import 'autoTextarea';
import 'mdDatePicker';
import 'quickSelectUser';
import nodeLiComm from './tpl/nodeLiComm.html';
import stageList from './tpl/stageList.html';
import addList from './tpl/addList.html';
import addNewStage from './tpl/addNewStage.html';
import addNewStageTask from './tpl/addNewStageTask.html';
import 'mdDialog';
import mdFunction from 'mdFunction';
import TaskDetail from '../taskDetail/taskDetail';

const taskStageSettings = {
  timer: null, // 计时器
  pointInitX: 0, // 拖拽初始化 X
  pointInitY: 0, // 拖拽初始化 Y
  pointGapX: 0, // 拖拽时 间隙 鼠标点击任务选项卡 X 偏移量
  pointGapY: 0, // 拖拽时 间隙 鼠标点击任务选项卡 Y 偏移量
  $draggableObjMirror: null, // 拖拽 对象
  oldValue: null, // 原本的值
  globalEvent: null,
  isDragEnd: true,
  dragAuth: false,
  ajaxPost: '',
};

class TaskStage extends Component {
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
    this.props.emitter.removeListener('CREATE_TASK_TO_STAGE', this.quickCreateTaskCallback);
    this.props.emitter.addListener('CREATE_TASK_TO_STAGE', this.quickCreateTaskCallback);
  }

  componentWillReceiveProps(nextProps) {
    // 减少proejctId不同的而发生的请求
    const nextConfig = Object.assign({}, nextProps.taskConfig);
    const currentConfig = Object.assign({}, this.props.taskConfig);

    nextConfig.projectId = '';
    currentConfig.projectId = '';

    if ((nextProps.taskConfig.folderId && !_.isEqual(nextConfig, currentConfig)) || config.isGetData) {
      // 解决props未更新问题
      setTimeout(() => {
        this.init();
      }, 0);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    this.props.emitter.removeListener('CREATE_TASK_TO_STAGE', this.quickCreateTaskCallback);
  }

  /**
   * 初始化
   */
  init() {
    listLoadingContent(1);

    const { filterSettings, folderId, listSort, listStatus, completeTime, viewType, searchKeyWords } = this.props.taskConfig;
    const currentFolderId = folderId === 1 ? '' : folderId;

    let withoutTag = false;
    const tagIDs = _.filter(filterSettings.tags, tagId => tagId !== 'null');
    if (_.findIndex(filterSettings.tags, tagId => tagId === 'null') >= 0) {
      withoutTag = true;
    }

    ajaxRequest
      .getTaskListWithStageView({
        folderID: currentFolderId,
        tagIDs: tagIDs,
        chargeIds: filterSettings.selectChargeIds,
        controlSelectedDic: this.returnCustomFilterArray(),
        sort: listSort,
        status: listStatus,
        completeTime,
        withoutTag,
        pageSize: config.pageSize,
        filterType: filterSettings.folderSearchRange,
        keywords: searchKeyWords,
      })
      .then((result) => {
        config.isGetData = false;

        if (viewType !== config.folderViewType.stageView) {
          return;
        }

        if (result.status) {
          // 编辑  拖拽权限
          taskStageSettings.dragAuth = result.data.canEditStages;
          this.renderStageDom(result.data);
        } else {
          errorMessage(result.error);
        }
      });
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    const that = this;
    const $taskList = $('#taskList');

    // 阶段负责人头像hover
    $taskList.on('mouseover', '.singleStage .stageChargeAvatar', function (event) {
      const $this = $(this);
      const accountId = $this.closest('.singleStage').data('chargeid');

      if (!$this.data('hasbusinesscard')) {
        $this.mdBusinessCard({
          id: 'updateTaskChargeCard_' + accountId,
          accountId,
        });
        $this.data('hasbusinesscard', true).mouseenter();
      }
    });

    // 阶段负责人头像点击
    $taskList.on('click', '.singleStage .stageChargeAvatar', function (event) {
      const $this = $(this);
      const isEdit = $this.closest('.singleStage').data('edit');

      if (isEdit) {
        that.addStageCharge($this.closest('.singleStage'), $this);
      }
    });

    // 滚轮滚动
    $taskList.on('mousewheel DOMMouseScroll', function (event) {
      // 非列表滚动
      if (!$(event.target).closest('.listStageContent').length) {
        const $ul = $(this).children('ul');
        const scrollLeft = $ul.scrollLeft();
        const scrollWidth = $ul[0].scrollWidth;
        const ulWidth = $ul.width();
        const wheelDelta = 120;

        event.preventDefault();

        const delta = parseInt(event.originalEvent.wheelDelta || -event.originalEvent.detail, 10);
        const isMac = /mac/i.test(navigator.platform);
        if (isMac && Math.abs(delta) < 50) {
          return;
        }
        // up
        if (delta > 0) {
          $ul.scrollLeft(scrollLeft - wheelDelta > 0 ? scrollLeft - wheelDelta : 0);
        } else if (delta < 0) {
          // down
          $ul.scrollLeft(scrollLeft + wheelDelta + ulWidth > scrollWidth ? scrollWidth - ulWidth : scrollLeft + wheelDelta);
        }
      }
    });

    // 阶段下拉
    $taskList.on('click', '.singleStage .icon-arrow-down-border', function (event) {
      // 阶段下拉操作
      const $listStageDownOperator = $('#taskList .listStageDownOperator');
      let left = -15;
      // 第二次点击隐藏
      if ($(this).find('.listStageDownOperator').length && $listStageDownOperator.is(':visible')) {
        $listStageDownOperator.hide();
        return;
      }

      $(this).append($listStageDownOperator);
      if ($(this).offset().left + $listStageDownOperator.width() > $(window).width()) {
        left = -170;
      }

      const chargeId = $(this)
        .closest('.singleStage')
        .data('chargeid');

      $('#taskList .listStageDownOperator .stageCharge .text').text(chargeId ? _l('取消默认负责人') : _l('设置默认负责人'));

      $('#taskList .listStageDownOperator')
        .css('left', left)
        .show();
      event.stopPropagation();
    });

    // 任务拖拽
    $taskList.on(
      {
        // 200 毫秒后开始拖拽
        mousedown(event) {
          const $target = $(event.target);
          const _this = $(this);

          // 右键 || 标记完成
          if (event.button === 2 || $target.is('.markTask')) {
            return;
          }

          // 原本的阶段ID
          taskStageSettings.oldValue = _this.closest('li.singleStage').data('stageid');
          taskStageSettings.timer = setTimeout(() => {
            // 清除计时器
            clearTimeout(taskStageSettings.timer);
            taskStageSettings.timer = null;
            // 位置计算
            taskStageSettings.pointInitX = event.clientX;
            taskStageSettings.pointInitY = event.clientY;
            taskStageSettings.isDragEnd = false;
            that.draggableTask(_this);
            // 阻止回调
            event.stopPropagation();
            return false;
          }, 200);

          event.stopPropagation();
          return false;
        },
        click(event) {
          clearTimeout(taskStageSettings.timer);
          taskStageSettings.timer = null;
          const _this = $(this);
          let isMuil = false;
          let metaKeyType;

          if (_this.hasClass('addNewTask') || $(event.target).hasClass('markTask') || $(event.target).hasClass('taskStar')) {
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
              batchTask.default.shiftCtrlKey(_this, metaKeyType);
            });

            event.stopPropagation();
            return false;
          }

          config.$prevNode = _this;

          $('#taskList .singleStage li').removeClass('selectTask');
          _this.addClass('selectTask');
          const taskId = _this.data('taskid');

          that.setState({
            openTaskDetail: true,
            taskId,
            isForceUpdate: true,
          });

          if ($('#taskList .addNewTask').length > 0) {
            that.canelCreateStageTask($('#taskList .addNewTask').closest('li.singleStage'));
          }
        },
      },
      '.singleStage .listStageContent li.singleTaskStage'
    );

    // 修改阶段名称
    $taskList.on('click', '.listStageDownOperator li.updateStageName', function () {
      const $li = $(this)
        .closest('ul')
        .closest('li');
      $li.find('.listStageTaskCount').hide();

      const $stageName = $li.find('.listStageName').hide();
      const stageName = $.trim($stageName.text());

      $li.find('.stageChargeAvatar').addClass('Hidden');
      $li
        .find('.icon-arrow-down-border')
        .hide()
        .end()
        .find('.stageHeader')
        .append('<input class="updateStageName boderRadAll_3 ThemeBorderColor3" maxlength="100" />')
        .end()
        .find('input.updateStageName')
        .focus()
        .val(stageName);
      taskStageSettings.isBlur = false;
    });

    // 在此后添加新阶段
    $taskList.on('click', '.listStageDownOperator li.addNewStageToNext', function (event) {
      // 在此后添加新阶段
      that.addStageToNext($(this));
      event.stopPropagation();
    });

    // 添加负责人和删除负责人
    $taskList.on('click', '.listStageDownOperator li.stageCharge', function (event) {
      const $li = $(this).closest('li.singleStage');

      if ($li.data('chargeid')) {
        that.setStageOwner($li);
      } else {
        that.addStageCharge($li, $li.find('.icon-arrow-down-border'));
      }
      $('.listStageDownOperator').hide();
      event.stopPropagation();
    });

    // 添加新阶段
    $taskList.on('click', '.listStageDownOperator li.delStage', function (event) {
      const $li = $(this).closest('li.singleStage');
      $('#taskList .listStage').append($('.listStageDownOperator').hide());
      // 删除阶段
      that.delStage($li);
      event.stopPropagation();
    });

    // 更新阶段名称
    $taskList.on(
      {
        blur() {
          if (taskStageSettings.isBlur) {
            return;
          }
          taskStageSettings.isBlur = true;
          that.updateStageName($(this));
        },
        keyup(event) {
          if (event.keyCode === 13) {
            $(this).blur();
          }
        },
      },
      '.stageHeader .updateStageName'
    );

    // 拖拽阶段
    $taskList.on(
      {
        mousedown(event) {
          if (
            !taskStageSettings.dragAuth ||
            $(this).find('input').length > 0 ||
            event.button === 2 ||
            $(event.target).is('.icon-arrow-down-border') ||
            $(event.target).closest('.listStageDownOperator').length
          ) {
            return;
          }

          const $singleStage = $(this).closest('li.singleStage');

          // 保存原本的位置 无权限时返回
          taskStageSettings.oldValue = $singleStage.index();
          taskStageSettings.timer = setTimeout(() => {
            clearTimeout(taskStageSettings.timer); // 清除计时器
            taskStageSettings.timer = null;
            // 位置计算
            taskStageSettings.pointInitX = event.clientX;
            taskStageSettings.pointInitY = event.clientY;
            taskStageSettings.isDragEnd = false;
            that.draggableStage($singleStage);
            $('html').addClass('overflowHidden');
            // 阻止回调
            event.stopPropagation();
            return false;
          }, 200);

          event.stopPropagation();
          return false;
        },
        mouseup(event) {
          clearTimeout(taskStageSettings.timer);
          taskStageSettings.timer = null;

          const $this = $(this);
          const $singleStage = $this.closest('li.singleStage');
          const $listStageName = $this.find('.listStageName');

          if ($(event.target).is($listStageName)) {
            // 编辑框
            const $stageName = $listStageName.hide();
            $listStageName.siblings('.icon-arrow-down-border,.listStageTaskCount').hide();
            $listStageName.siblings('.stageChargeAvatar').addClass('Hidden');
            $listStageName.closest('.stageHeader').append('<input class="updateStageName boderRadAll_3" maxlength="100" />');
            $listStageName
              .siblings('.updateStageName')
              .focus()
              .val($.trim($stageName.text()));
            taskStageSettings.isBlur = false;
          }
        },
      },
      '.singleStage .stageHeader'
    );

    // 页面滚动条
    $taskList.on('mousedown', '.listStage', (event) => {
      const $listStage = $('#taskList .listStage');
      const listStageWidth = $listStage.width();
      const listStageContentWidth = $('#taskList .listStage > li').length * $('#taskList .listStage > li:first').width();

      // 输入框 右键  无滚动条 新建阶段的时候
      if ($(event.target).is(':input') || event.button === 2 || listStageWidth > listStageContentWidth || $('.singleStage .txtAddNew').length) {
        return;
      }

      taskStageSettings.pointGapX = event.clientX;
      taskStageSettings.isDragEnd = false;

      $(document).on({
        'mousemove.moveStage': function (evt) {
          taskStageSettings.globalEvent = evt;
          // 移动页面滚动条
          that.movePageScroll(evt);
          config.isDrop = true;
        },
        'mouseup.moveStage': function () {
          $(document).off('mousemove.moveStage');
          $(document).off('mouseup.moveStage');
        },
      });

      event.stopPropagation();
      return false;
    });

    // 添加新阶段 文本框
    $taskList.on(
      {
        blur() {
          // 处理ie 无法失去焦点bug
          if (taskStageSettings.isBlur) {
            return;
          }
          taskStageSettings.isBlur = true;
          const stageName = $.trim($(this).val());

          $('.listStage .addNewStage').removeClass('Hidden');
          // 如果不输入阶段名称 默认去除创建
          if (!stageName) {
            // 移除
            $(this)
              .closest('li.singleStage')
              .remove();
            return;
          }

          // 添加新阶段
          that.addNewStage($(this));
        },
        keydown(event) {
          if (event.keyCode == 13) {
            $(this).blur();
          }
        },
      },
      '.singleStage .txtAddNew'
    );

    // 阶段创建任务
    $taskList.on('click', '.singleStage .bottomNewBox', function (event) {
      const $this = $(this);
      // 去除窗体上 创建没有输入值的
      $('li.addNewTask').each(() => {
        if (!$.trim($this.find('.teaStageName').val())) {
          that.canelCreateStageTask($this.closest('li.singleStage'));
        }
      });

      // 监测网络是否过期
      mdFunction.expireDialogAsync(that.props.taskConfig.projectId).then(() => {
        that.addNewTask($this.parent());
      });
      event.stopPropagation();
    });

    // 创建任务确定
    $taskList.on('click', '.addNewTask .btnStagCreateTask', function () {
      const _this = $(this);
      if (_this.data('create')) {
        return;
      }
      _this.text(_l('创建中…')).data('create', 1);
      that.addNewTaskEnter(_this);
    });

    // 创建任务改负责人
    $taskList.on('click', '.addNewTask .chargeHeaderAvatar', function () {
      const _this = $(this);
      const callback = function (users) {
        const user = users[0];
        _this.attr({ 'data-id': user.accountId, src: user.avatar }).data('id', user.accountId);
      };

      _this.quickSelectUser({
        sourceId: that.props.taskConfig.folderId,
        showMoreInvite: false,
        showQuickInvite: false,
        fromType: 2,
        filterAccountIds: [_this.attr('data-id')],
        includeUndefinedAndMySelf: true,
        SelectUserSettings: {
          filterAccountIds: [_this.attr('data-id')],
          projectId: checkIsProject(that.props.taskConfig.projectId) ? that.props.taskConfig.projectId : '',
          unique: true,
          callback,
        },
        selectCb: callback,
      });
    });

    // 创建任务标星
    $taskList.on('click', '.addNewTask .taskStar', function () {
      $(this).toggleClass('icon-task-star icon-star-hollow');
    });

    // 创建任务回车
    $taskList.on('keydown', '.addNewTask .teaStageName', function (event) {
      if (event.keyCode == 13) {
        if ($.trim($(this).val())) {
          that.addNewTaskEnter(
            $(this)
              .closest('li')
              .find('.btnStagCreateTask'),
            true
          );
        }
        return false;
      }
      event.stopPropagation();
    });

    // 创建新阶段
    $taskList.on('click', '.addNewStage', function () {
      $(this).addClass('Hidden');
      that.addStageToNext($('.listStage .singleStage:last'));
    });

    // 禁止事件冒泡
    $taskList.on(
      'mousedown',
      '.singleStage .txtAddNew,li.addNewTask,.addNewTask .btnStagCreateTask,.addNewTask .stageDate,.addNewTask .chargeHeaderAvatar,.listStageDownOperator li.delStage,.listStageDownOperator li.updateStageName,.listStageDownOperator li.addNewStageToNext',
      (event) => {
        event.stopPropagation();
      }
    );
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
   * 渲染阶段数据
   */
  renderStageDom(data) {
    data.formatTaskTime = formatTaskTime;
    data.formatStatus = formatStatus;
    data.isEdit = taskStageSettings.dragAuth;
    data.returnCustonValue = returnCustonValue;

    const singleTaskTpl = stageList.replace('#include.nodeLiComm', nodeLiComm);
    $('#taskList').html(doT.template(singleTaskTpl)(data));

    // 绑定评分控件
    this.customScore();

    // 绑定已完成分页加载
    this.scrollFun();
  }

  /**
   * 评分控件
   */
  customScore() {
    $('.listStageCustomItemStar[data-type=score]').map((i, item) => {
      if (!$(item).find('.Score-wrapper').length) {
        const type = $(item).data('enum');
        const score = $(item).data('score');
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
          $(item)[0]
        );
      }
    });
  }

  /**
   * 滚动获取任务列表
   */
  scrollFun() {
    const that = this;

    $('#taskList .bottomNullAdd').on('scroll', function () {
      if (taskStageSettings.ajaxPost) {
        return;
      }

      const $this = $(this);
      const nDivHight = $this.height();
      const nScrollHight = $this[0].scrollHeight;
      const nScrollTop = $this[0].scrollTop;
      const pageIndex = parseInt($this.attr('data-page'), 10);

      if (nScrollTop + nDivHight + 30 >= nScrollHight) {
        // 没有更多时不进行加载
        if (pageIndex === 0) return;

        const { folderId, listSort, listStatus, completeTime, filterSettings, searchKeyWords } = that.props.taskConfig;
        let withoutTag = false;
        const tagIDs = _.filter(filterSettings.tags, tagId => tagId !== 'null');
        if (_.findIndex(filterSettings.tags, tagId => tagId === 'null') >= 0) {
          withoutTag = true;
        }

        taskStageSettings.ajaxPost = ajaxRequest.getFolderTaskListByStageID({
          folderID: folderId,
          stageID: $this.closest('.singleStage').data('stageid'),
          sort: listSort,
          status: listStatus,
          completeTime,
          withoutTag,
          tagIDs: tagIDs,
          chargeIds: filterSettings.selectChargeIds,
          controlSelectedDic: that.returnCustomFilterArray(),
          pageIndex: pageIndex + 1,
          pageSize: config.pageSize,
          filterType: filterSettings.folderSearchRange,
          keywords: searchKeyWords,
        });

        taskStageSettings.ajaxPost.then((source) => {
          if (source.status) {
            taskStageSettings.ajaxPost = false;

            const data = source.data;
            data.formatTaskTime = formatTaskTime;
            data.formatStatus = formatStatus;
            data.returnCustonValue = returnCustonValue;

            const singleTaskTpl = addList.replace('#include.nodeLiComm', nodeLiComm);
            const taskList = doT.template(singleTaskTpl)(data);

            if ($this.find('ul .addNewTask').length) {
              $this.find('ul .addNewTask').before(taskList);
              $this.scrollTop(100000);
            } else {
              $this.find('ul').append(taskList);
            }

            // 绑定评分控件
            that.customScore();

            if (
              $this.find('.singleTaskStage').length >=
              parseInt(
                $this
                  .parent()
                  .find('.taskCount')
                  .html(),
                10
              )
            ) {
              $this.attr('data-page', 0);
            } else {
              $this.attr('data-page', pageIndex + 1);
            }
          } else {
            errorMessage(source.error);
          }
        });
      }
    });
  }

  /**
   * 取消阶段创建任务
   */
  canelCreateStageTask($li) {
    $li.find('li.addNewTask:last').hide();
    $li.find('.bottomNewBox').show();
    $li.find('.stageContentBox').removeClass('addNewTask');
  }

  /**
   * 在此后添加阶段
   */
  addStageToNext($el) {
    $('.listStageDownOperator').hide();
    $('.listStage .addNewStage').addClass('Hidden');

    $el.closest('li.singleStage').after(doT.template(addNewStage)({}));

    $('.singleStage.taskStageAnimation').on('webkitAnimationEnd animationend', function () {
      $(this).removeClass('taskStageAnimation');
      // 默认获得焦点
      $('.singleStage .txtAddNew').focus();
      taskStageSettings.isBlur = false;
    });
  }

  /**
   * 删除阶段
   */
  delStage($li) {
    if ($('#taskList .listStage .singleStage').length === 1) {
      alert(_l('看板最少存在一个'), 3);
      return;
    }

    const { folderId } = this.props.taskConfig;

    $.DialogLayer({
      dialogBoxID: 'delStage',
      showClose: false,
      container: {
        content: '<div class="Font16 mBottom20">' + _l('确认删除此看板吗？') + '</div>',
        yesText: _l('删除'),
        yesFn() {
          const stageId = $li.data('stageid');

          ajaxRequest
            .deleteFolderStage({
              folderID: folderId,
              stageID: stageId,
              newStageID: '',
            })
            .then((source) => {
              if (source.status) {
                alert(_l('删除成功'));

                const $newLi = $li.prev().length > 0 ? $li.prev() : $li.next();
                $newLi.find('.listStageContent ul').append($li.find('.listStageContent li'));
                $li.fadeOut(function () {
                  $(this).remove();
                });
              } else {
                errorMessage(source.error);
              }
            });
        },
      },
    });
  }

  /**
   * 更新阶段名称
   */
  updateStageName($el) {
    const stageName = $.trim($el.val());
    const $spanStage = $el.siblings('.listStageName');
    const oldStageName = $.trim($spanStage.text());
    const breakEditState = () => {
      $el.remove();
      $spanStage.show();
      if ($spanStage.closest('.singleStage').data('chargeid')) {
        $spanStage.siblings('.stageChargeAvatar').removeClass('Hidden');
      }
      $spanStage.siblings('.icon-arrow-down-border, .listStageTaskCount').show();
    };

    $('.listStageDownOperator').hide();

    if (!stageName || oldStageName === stageName) {
      breakEditState();
    } else {
      const { folderId } = this.props.taskConfig;
      const stageId = $el.closest('li.singleStage').data('stageid');

      ajaxRequest
        .updateFolderStage({
          folderID: folderId,
          stageID: stageId,
          sort: 0,
          stageName,
        })
        .then((source) => {
          if (source.status) {
            $spanStage.text(stageName);
          } else {
            errorMessage(source.error);
          }

          breakEditState();
        });
    }
  }

  /**
   * 拖拽阶段
   */
  draggableStage($el) {
    // 单个阶段
    taskStageSettings.pointGapY = taskStageSettings.pointInitY - $el.offset().top;
    taskStageSettings.pointGapX = taskStageSettings.pointInitX - $el.offset().left;
    taskStageSettings.pointInitX -= taskStageSettings.pointGapX;
    taskStageSettings.pointInitY -= taskStageSettings.pointGapY;

    const $stageContentBox = $el.find('.stageContentBox');
    const singleHeight =
      $stageContentBox.height() + parseInt($stageContentBox.css('border-top-width'), 10) + parseInt($stageContentBox.css('border-bottom-width'), 10);
    const scrollTop = 0;

    // 是否存在
    if ($('#insertVirtualStage').length > 0) {
      $el.before($('#insertVirtualStage'));
    } else {
      $el.before('<li id="insertVirtualStage" class="boderRadAll_3 singleStage" style="height:' + singleHeight + 'px;"></li>');
    }

    taskStageSettings.$draggableObjMirror = $el;

    // 定位
    $('body').append(
      taskStageSettings.$draggableObjMirror.addClass('draggableElementStage').css({
        left: taskStageSettings.pointInitX,
        top: taskStageSettings.pointInitY,
      })
    );

    // 鼠标移动事件
    this.draggableStageMouseMove();
  }

  /**
   * 阶段拖拽
   */
  draggableStageMouseMove() {
    const that = this;
    // 文档 mouseMouse
    $(document).on({
      'mousemove.draggableStage': function (event) {
        taskStageSettings.globalEvent = event;
        // 插入虚拟元素
        that.insetVirtualElemByStage();
        // 移动
        taskStageSettings.$draggableObjMirror.css({
          left: (event.clientX -= taskStageSettings.pointGapX),
          top: (event.clientY -= taskStageSettings.pointGapY),
        });
        // 阶段左右滚动条
        that.moveStageScroll();
        return false;
      },
      'mouseup.draggableStage': function () {
        // 鼠标松开后处理
        taskStageSettings.isDragEnd = true;
        that.draggableStageMouseUp();
      },
    });
  }

  /**
   * 项目中插入虚拟阶段
   */
  insetVirtualElemByStage() {
    const eventY = taskStageSettings.globalEvent.clientY;
    const eventX = taskStageSettings.globalEvent.clientX;
    // 所有阶段
    const $singleStages = $('#taskList .singleStage');
    // 阶段box 位置
    const listStageOffset = $('#taskList .listStage').offset();
    const $selSingleStage = null;
    let Offset;
    let _this;
    let $singleTask;
    let singleHeight = 0;
    let $stageContentBox;

    // 在阶段内
    if (eventY > listStageOffset.top && eventX > listStageOffset.left) {
      // 可能是最后 一个 也有可能没有元素
      $singleStages.each(function () {
        _this = $(this);
        Offset = _this.offset();
        $stageContentBox = _this.find('.stageContentBox ');
        singleHeight =
          $stageContentBox.height() + parseInt($stageContentBox.css('border-top-width'), 10) + parseInt($stageContentBox.css('border-bottom-width'), 10);

        if (eventX > Offset.left && eventX < Offset.left + _this.width() && eventY < Offset.top + singleHeight) {
          if (_this.offset().left - $(window).scrollLeft() + _this.width() / 2 > eventX) {
            _this.before(
              $('#insertVirtualStage')
                .addClass('mRight5')
                .removeClass('mLeft5')
            );
          } else {
            _this.after(
              $('#insertVirtualStage')
                .addClass('mLeft5')
                .removeClass('mRight5')
            );
          }
          return false;
        }
      });
    }
  }

  /**
   * 阶段滚动条 左右事件
   */
  moveStageScroll() {
    const that = this;
    const $listStage = $('#taskList .listStage');
    const listStageWidth = $listStage.width();
    const listStageContentWidth = $('#taskList .listStage > li').length * $('#taskList .listStage > li:first').width();
    const scrollLeft = $listStage.scrollLeft();

    if (taskStageSettings.isDragEnd) {
      return;
    }

    // 有滚动条
    if (listStageWidth < listStageContentWidth) {
      if (taskStageSettings.globalEvent.clientX < 500) {
        if (scrollLeft <= 0) {
          return;
        }

        // 非动画中
        if (!$listStage.is(':animated')) {
          $listStage.animate(
            {
              scrollLeft: scrollLeft - 200,
            },
            300,
            () => {
              // 如果没到头部 且 还在此滚动条内 循环调用
              that.moveStageScroll();
            }
          );
        }
      } else if (taskStageSettings.globalEvent.clientX > $(window).width() - 300) {
        const nDivWidth = $listStage.width();
        const nScrollWidth = $listStage[0].scrollWidth;
        const nScrollLeft = $listStage[0].scrollLeft;

        // 是否到底部
        if (nScrollLeft + nDivWidth < nScrollWidth) {
          if (!$listStage.is(':animated')) {
            $listStage.animate(
              {
                scrollLeft: scrollLeft + 200,
              },
              300,
              () => {
                // 回调
                that.moveStageScroll();
              }
            );
          }
        }
      }
    }
  }

  /**
   * 鼠标弹起 修改阶段
   */
  draggableStageMouseUp() {
    // 取消事件绑定
    $(document).off('mousemove.draggableStage');
    $(document).off('mouseup.draggableStage');

    if ($('#insertVirtualStage').hasClass('mLeft5')) {
      taskStageSettings.$draggableObjMirror
        .removeClass('draggableElementStage')
        .removeAttr('style')
        .addClass('mLeft5');
    } else {
      taskStageSettings.$draggableObjMirror
        .removeClass('draggableElementStage')
        .removeAttr('style')
        .addClass('mRight5');
    }

    // 插入到位置
    $('#insertVirtualStage').before(taskStageSettings.$draggableObjMirror);
    // 更改
    this.updateStageSort(taskStageSettings.$draggableObjMirror);
    // 拖拽元素删除
    $('#insertVirtualStage').remove();
    $('html').removeClass('overflowHidden');
  }

  /**
   * 修改阶段顺序
   */
  updateStageSort($li) {
    const stageId = $li.data('stageid');
    let sort = $li.index();
    if (taskStageSettings.oldValue == sort) {
      return;
    }

    // 新建阶段
    if ($li.prevAll('ul').length <= 0) {
      sort += 1;
    }

    ajaxRequest
      .updateFolderStage({
        folderID: this.props.taskConfig.folderId,
        stageID: stageId,
        sort,
        stageName: '',
      })
      .then((source) => {
        if (!source.status) {
          $('.listStage .singleStage')
            .eq(taskStageSettings.oldValue)
            .before($li);
          errorMessage(source.error);
        }
      });
  }

  /**
   * 页面滚动条
   */
  movePageScroll(event) {
    const gap = event.clientX - taskStageSettings.pointGapX;
    const $listStage = $('#taskList .listStage');
    const oldScrollLeft = $listStage.scrollLeft();
    let scrollLeft = oldScrollLeft - gap;

    // 超出左边
    if (scrollLeft < 0) {
      scrollLeft = 0;
    } else {
      // 超出最大宽度 最大宽度=div宽+滚动距离
      const scrollWidth = $listStage[0].scrollWidth;
      const listStageWidth = $listStage.width();

      if (oldScrollLeft + listStageWidth > scrollWidth) {
        scrollLeft = scrollWidth - listStageWidth;
      }
    }

    $('#taskList .listStage').scrollLeft(scrollLeft);
    taskStageSettings.pointGapX = event.clientX;
  }

  /**
   * 添加新阶段
   */
  addNewStage($el) {
    const { folderId } = this.props.taskConfig;
    const $li = $el.closest('li.singleStage');
    const stageName = $.trim($el.val());

    ajaxRequest
      .addFolderStage({
        folderID: folderId,
        stageName,
        sort: $li.index() + 1,
      })
      .then((source) => {
        if (source.status) {
          $el.remove();
          // 阶段名称
          $li
            .attr('data-stageid', source.data)
            .find('.stageHeader .listStageName')
            .text(stageName)
            .show();
          $li.find('.stageHeader .icon-arrow-down-border').show();
          $li.find('.btnBottomNew').removeClass('Hidden');
          if ($('.listStage .singleStage').length === $li.index() + 1) {
            $('#taskList .listStage').scrollLeft(100000);
          }
        } else {
          $li.remove();
          errorMessage(source.error);
        }
      });
  }

  /**
   * 添加新任务
   */
  addNewTask($li) {
    if ($li.find('.stageContentBox .addNewTask').length) {
      $li.find('.stageContentBox .addNewTask').show();
      $li
        .find('.stageContentBox')
        .addClass('addNewTask')
        .scrollTop(100000)
        .next()
        .hide();
      $li
        .find('.stageContentBox .teaStageName')
        .height(80)
        .val('')
        .focus();
      $li.find('.stageContentBox .btnStagCreateTask').html(_l('确认'));
    } else {
      const chargeId = $li.closest('.singleStage').data('chargeid');
      const avatar = $li.closest('.singleStage').data('avatar');
      $li
        .find('.stageContentBox')
        .addClass('addNewTask')
        .find('ul')
        .append(
          doT.template(addNewStageTask)({ accountId: chargeId || md.global.Account.accountId, avatar: chargeId ? avatar : md.global.Account.avatar })
        )
        .end()
        .next()
        .hide();
      const $stageDate = $li.find('.stageDate');
      $stageDate.on('click', function () {
        $('.warpDatePicker').hide();
        const _this = $(this);

        const { start: defaultStart, end: defaultEnd } = $stageDate.data();
        $stageDate.reactTaskCalendarRangePickerClick({
          props: {
            selectedValue: [defaultStart, defaultEnd],
            onClear() {
              delete $stageDate.data().start;
              delete $stageDate.data().end;
              this.destroy();
            },
          },
          publicMethods: {
            submit(selectedValue) {
              let [start, end] = selectedValue;
              start = start ? start.format('YYYY-MM-DD HH:00') : '';
              end = end ? end.format('YYYY-MM-DD HH:00') : '';
              $stageDate.data('start', start);
              $stageDate.data('end', end);
            },
          },
        });
      });

      $('.addNewTask .teaStageName').autoTextarea({
        maxHeight: 273,
        minHeight: 73,
      });

      // 滚动条到底部
      $li
        .find('.stageContentBox')
        .scrollTop($li.find('.listStageContent').height())
        .end()
        .find('.teaStageName')
        .focus();
    }
  }

  /**
   * 拖拽任务
   */
  draggableTask($el) {
    // 单个阶段
    taskStageSettings.pointGapY = taskStageSettings.pointInitY - $el.offset().top;
    taskStageSettings.pointGapX = taskStageSettings.pointInitX - $el.offset().left;
    taskStageSettings.pointInitX -= taskStageSettings.pointGapX;
    taskStageSettings.pointInitY -= taskStageSettings.pointGapY;

    // 是否存在
    if ($('#insertVirtual').length > 0) {
      $el.before($('#insertVirtual'));
    } else {
      $el.before('<li id="insertVirtual" class="boderRadAll_3"></li>');
    }

    taskStageSettings.$draggableObjMirror = $el;

    // 定位
    $('body').append(
      taskStageSettings.$draggableObjMirror.addClass('draggableElement').css({
        left: taskStageSettings.pointInitX,
        top: taskStageSettings.pointInitY,
      })
    );

    // 鼠标移动事件
    this.draggableTaskMouseMove();
  }

  /**
   * 鼠标移动事件
   */
  draggableTaskMouseMove() {
    const that = this;
    $(document).on({
      'mousemove.draggableTask': function (event) {
        taskStageSettings.globalEvent = event;

        // 插入虚拟元素
        that.insetVirtualElemByTask();

        // 移动
        taskStageSettings.$draggableObjMirror.css({
          left: (event.clientX -= taskStageSettings.pointGapX),
          top: (event.clientY -= taskStageSettings.pointGapY),
        });

        // 阶段左右滚动条
        that.moveStageScroll();
        return false;
      },
      'mouseup.draggableTask': function () {
        that.draggableTaskMouseUp();
      },
    });
    $(document)
      .on('mousemove.draggableTask')
      .on();
  }

  /**
   * 插入虚拟元素到页面上
   */
  insetVirtualElemByTask() {
    const that = this;
    let $currentElem = null;
    const eventY = taskStageSettings.globalEvent.clientY;
    const eventX = taskStageSettings.globalEvent.clientX;
    // 所有阶段
    const $singleStages = $('#taskList .singleStage');
    // 阶段离顶部距离
    const singleStageTop = $singleStages.first().offset().top;
    const offsetLeft = 0;
    const offsetRight = 0;
    const $selSingleStage = null;
    let Offset;
    let _this;
    let $singleTask;
    const taskGap = 5;
    let singleHeight = 0;
    let $stageContentBox;
    let isBreak = false;
    const scrollTop = 0;
    const nScrollHight = 0;
    const nScrollTop = 0;
    const nDivHight = 0;

    // 头部大于阶段头部
    if (eventY > singleStageTop) {
      // 可能是最后 一个 也有可能没有元素
      $singleStages.each(function () {
        _this = $(this);
        Offset = _this.offset();

        // 已有元素 返回 不在遍历
        if (isBreak) {
          return false;
        }

        $stageContentBox = _this.find('.stageContentBox ');
        singleHeight =
          $stageContentBox.height() + parseInt($stageContentBox.css('border-top-width'), 10) + parseInt($stageContentBox.css('border-bottom-width'), 10);

        // 阶段内
        if (eventX > Offset.left && eventX < Offset.left + _this.width() && eventY < Offset.top + singleHeight) {
          // 阶段滚动条
          that.moveTaskScroll($stageContentBox);
          // 进入一个阶段后 不在遍历其后的阶段
          isBreak = true;
          _this.find('.stageContentBox li').each(function () {
            $singleTask = $(this);

            // 放置任务
            if (eventY > $singleTask.offset().top && eventY < $singleTask.offset().top + $singleTask.height() + taskGap) {
              $currentElem = $singleTask;

              // 如果在虚拟元素上 直接返回
              if ($currentElem.is('#insertVirtual')) {
                return false;
              }
              if ($currentElem.offset().top - $(window).scrollTop() + $currentElem.height() / 2 > eventY) {
                $currentElem.before($('#insertVirtual'));
              } else {
                $currentElem.after($('#insertVirtual'));
              }

              return false;
            }
          });

          // 没有找到元素
          if ($currentElem == null) {
            // 不存在任务
            if (!_this.find('.stageContentBox li:not(.addNewTask)').length) {
              _this.find('.stageContentBox ul').append($('#insertVirtual'));
            }
          }
        }
      });
    }
  }

  /**
   * 滚动条上下左右滚动事件
   */
  moveTaskScroll($stageContentBox) {
    const that = this;
    const eventY = taskStageSettings.globalEvent.clientY;
    const eventX = taskStageSettings.globalEvent.clientX;
    const $singleStage = $stageContentBox.closest('li.singleStage');
    const Offset = $singleStage.offset();
    const singleHeight =
      $stageContentBox.height() + parseInt($stageContentBox.css('border-top-width'), 10) + parseInt($stageContentBox.css('border-bottom-width'), 10);
    let scrollTop = 0;

    if (taskStageSettings.isDragEnd) {
      return;
    }

    // 阶段内
    if (eventX > Offset.left && eventX < Offset.left + $singleStage.width() && eventY < Offset.top + singleHeight) {
      // 出现滚动条了
      if ($stageContentBox.height() < $stageContentBox.find('ul').height()) {
        // 离头步
        scrollTop = $stageContentBox.scrollTop();
        // 头部
        if (eventY < Offset.top + 85) {
          if (scrollTop > 0) {
            if (!$stageContentBox.is(':animated')) {
              $stageContentBox.animate(
                {
                  scrollTop: scrollTop - 150,
                },
                300,
                () => {
                  // 如果没到头部 且 还在此滚动条内 循环调用
                  that.moveTaskScroll($stageContentBox);
                }
              );
            }
          }
        } else if (eventY > Offset.top + singleHeight - 85) {
          const nDivHight = $stageContentBox.height();
          const nScrollHight = $stageContentBox[0].scrollHeight;
          const nScrollTop = $stageContentBox[0].scrollTop;
          // 是否到底部
          if (nScrollTop + nDivHight < nScrollHight) {
            if (!$stageContentBox.is(':animated')) {
              $stageContentBox.animate(
                {
                  scrollTop: scrollTop + 150,
                },
                300,
                () => {
                  // 循环调用
                  that.moveTaskScroll($stageContentBox);
                }
              );
            }
          }
        }
      }
    }
  }

  /**
   * 拖拽松开
   */
  draggableTaskMouseUp() {
    taskStageSettings.isDragEnd = true;
    // 取消事件绑定
    $(document).off('mousemove.draggableTask');
    $(document).off('mouseup.draggableTask');
    // 插入到位置
    $('#insertVirtual').before(taskStageSettings.$draggableObjMirror.removeClass('draggableElement'));
    // 拖拽元素删除
    $('#insertVirtual').remove();
    // 修改任务
    this.updateTaskStage(
      taskStageSettings.$draggableObjMirror.css({
        top: '0px',
        left: '0px',
      })
    );
  }

  /**
   * 修改任务阶段
   */
  updateTaskStage($li) {
    const taskId = $li.data('taskid');
    const stageId = $li.closest('li.singleStage').data('stageid');
    // 相同不修改
    if (stageId == taskStageSettings.oldValue) {
      return;
    }

    ajaxRequest
      .updateTaskStageID({
        taskID: taskId,
        stageID: stageId,
      })
      .then((source) => {
        if (source.status) {
          // 修改阶段ID
          $(".listStageContent ul li[data-taskid='" + taskId + "']").data('stageid', stageId);
          if (source.data.accountID) {
            $li
              .find('.chargeHeaderAvatar')
              .attr('src', source.data.avatar)
              .attr('data-id', source.data.accountID)
              .data('id', source.data.accountID)
              .data('hasbusinesscard', false);
            $li.find('.chargeHeaderAvatar').mdBusinessCard('destroy');
          }
        } else {
          $(".singleStage[data-stageid='" + taskStageSettings.oldValue + "']")
            .find('.listStageContent ul')
            .prepend($li);
          errorMessage(source.error);
        }
      });
  }

  /**
   * 添加阶段负责人
   */
  addStageCharge($li, $el) {
    const chargeId = $li.data('chargeid');

    const callback = (user) => {
      this.setStageOwner($li, user[0].accountId, user[0].avatar);
    };

    $el.quickSelectUser({
      sourceId: this.props.taskConfig.folderId,
      showMoreInvite: false,
      showQuickInvite: false,
      fromType: 2,
      filterAccountIds: [chargeId],
      includeUndefinedAndMySelf: true,
      SelectUserSettings: {
        filterAccountIds: [chargeId],
        projectId: checkIsProject(this.props.taskConfig.projectId) ? this.props.taskConfig.projectId : '',
        unique: true,
        callback,
      },
      selectCb: callback,
    });
  }

  /**
   * 设置阶段负责人
   */
  setStageOwner($li, ownerId = '', avatar = '') {
    ajaxRequest
      .setStageOwner({
        folderID: this.props.taskConfig.folderId,
        stageID: $li.data('stageid'),
        ownerId,
      })
      .then((source) => {
        if (source.status) {
          $li.data('chargeid', ownerId).data('avatar', avatar);
          $li
            .find('.stageChargeAvatar')
            .toggleClass('Hidden', !ownerId)
            .attr('src', avatar)
            .data('hasbusinesscard', false);
        } else {
          errorMessage(source.error);
        }
      });
  }

  /**
   * 创建
   */
  addNewTaskEnter($el, isEnter) {
    const $parent = $el.parent();
    const taskName = $.trim($parent.find('.teaStageName').val());

    // 验证任务名称
    if (!taskName) {
      alert(_l('请输入任务名称'), 3);
      $parent
        .find('.btnStagCreateTask ')
        .data('create', 0)
        .text(_l('确认'));
      return;
    }
    let $listStageContent;
    if (isEnter) {
      $listStageContent = $el.closest('.singleStage').find('.btnBottomNew');
    }
    // 阶段id
    const stageId = $el.closest('li.singleStage').data('stageid');
    const start = $el.siblings('.stageDate').data('start');
    const end = $el.siblings('.stageDate').data('end');
    const chargeUserId = $el.siblings('.chargeHeaderAvatar').attr('data-id');
    const isStar = $parent.find('.taskStar').hasClass('icon-task-star');
    $parent.find('.teaStageName').val('');

    ajaxRequest
      .addTask({
        taskName,
        stageID: stageId,
        summary: '',
        folderID: this.props.taskConfig.folderId,
        chargeAccountID: chargeUserId,
        members: '',
        startTime: start,
        deadline: end,
        parentID: '',
        groupIDstr: '',
        postID: '',
        projectId: this.props.taskConfig.projectId,
        star: isStar,
        attachments: null,
        color: 0,
      })
      .then((source) => {
        if (source.status) {
          source.data.taskName = source.data.name;
          source.data.star = isStar;
          source.data.stageID = stageId;
          source.data.actualStartTime = '';
          source.data.completeTime = '';

          // 后续处理
          this.quickCreateTaskCallback(source, $listStageContent);
        } else {
          errorMessage(source.error);
        }
      });
  }

  /**
   * 快速创建任务回调
   */
  quickCreateTaskCallback = (result, $listStageContent) => {
    const source = {
      formatTaskTime,
      returnCustonValue,
      isCreateNew: true,
      task: result.data,
    };

    // 兼容数据
    source.task.auth = 1;
    source.task.status = 0;

    const singleStageTaskHtml = doT.template(nodeLiComm)(source);
    const $li = $("#taskList li.singleStage[data-stageid='" + source.task.stageID + "']");

    if ($li.find('.listStageContent ul .addNewTask').length) {
      $li.find('.listStageContent ul .addNewTask').before(singleStageTaskHtml);
      $li.find('.listStageContent ul .btnStagCreateTask').data('create', 0);
    } else {
      $li.find('.listStageContent ul').append(singleStageTaskHtml);
    }

    const $taskCount = $li.find('.stageHeader .taskCount');
    if ($taskCount.length) {
      $taskCount.html(parseInt($taskCount.html(), 10) + 1);
    } else {
      $li.find('.stageHeader .listStageTaskCount').html('(<span class="taskCount">1</span>)');
    }

    this.canelCreateStageTask($li);

    // 回车继续创建
    if ($listStageContent) {
      $listStageContent.click();
    }

    // 计算加一
    if (!this.props.taskConfig.filterUserId) {
      const $allCountTask = $('.myTask .allCountTask:first');
      $allCountTask.text(parseInt($allCountTask.text() || 0, 10) + 1);
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

export default connect(state => state.task)(TaskStage);
