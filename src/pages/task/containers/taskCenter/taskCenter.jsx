import React, { Component, Fragment } from 'react';
import './taskCenter.less';
import TaskNavigation from '../taskNavigation/taskNavigation';
import { connect } from 'react-redux';
import { getTaskStorage, getTaskState, getFolderState, checkIsProject, errorMessage, setStateToStorage } from '../../utils/utils';
import {
  updateStateConfig,
  taskFirstSetStorage,
  updateKeyWords,
  updateTaskCharge,
  updateTaskMemberStar,
  editTaskStatus,
  clearFolderSettings,
} from '../../redux/actions';
import config from '../../config/config';
import 'src/components/dialogSelectUser/dialogSelectUser';
import 'src/components/mdBusinessCard/mdBusinessCard';
import 'src/components/tooltip/tooltip';
import 'src/components/createTask/createTask';
import { checkTaskSubTask, afterUpdateTaskCharge, afterUpdateTaskStar, afterUpdateTaskStatus, joinProjectPrompt } from '../../utils/taskComm';
import TaskToolbar from '../taskToolbar/taskToolbar';
import Subordinate from '../subordinate/subordinate';
import TaskList from '../taskList/taskList';
import TaskStage from '../taskStage/taskStage';
import TaskGantt from '../taskGantt/containers/taskGantt/taskGantt';
import Attachment from '../attachment/attachment';
import FolderChart from '../folderChart/folderChart';
import TaskTree from '../taskTree/taskTree';
import FolderDetail from '../folderDetail/folderDetail';
import ajaxRequest from 'src/api/taskCenter';
import ErrorState from 'src/components/errorPage/errorState';
import _ from 'lodash';

class TaskCenter extends Component {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    folderId: '',
    hideNavigation: false,
  };

  componentDidMount() {
    const that = this;
    const $container = $('#container');

    $('html').addClass('AppTask');

    // 初始化
    this.init(this.props.folderId);

    // 标记状态
    $container.on(
      {
        'mouseover.task': function () {
          const _this = $(this);
          if (_this.data('bindtip')) {
            return;
          }
          _this.MD_UI_Tooltip({
            arrowLeft: 0, // tip箭头的左位移，可以负数
            offsetLeft: -8, // tip的左位移，可以负数
            offsetTop: 0, // tip的上位移，可以负数
            location: 'down', // tip在上面还是下面 选项："up","down"
            checkHeight: true,
            width: 200, // tip的宽度
          });
          _this.data('bindtip', true).mouseenter();
        },
        'click.task': function (event) {
          const _this = $(this);
          const $tr = that.props.taskConfig.folderId ? _this.closest('li') : _this.closest('tr');
          const taskId = $tr.data('taskid');
          const auth = $tr.data('auth');
          let isMask = true;
          const projectId = $tr.data('projectid');
          const { isSubUser, filterUserId } = that.props.taskConfig;

          // 无权限和查看权限
          if (auth === config.auth.None || auth === config.auth.Look) {
            isMask = false;
          } else if (auth === config.auth.Member && _this.hasClass('lockTask')) {
            // 成员权限
            isMask = false;
          }

          // 下属
          if (isSubUser && filterUserId) {
            isMask = true;
          }

          // 锁定
          if (_this.hasClass('disable')) {
            isMask = false;
          }

          // 状态修改  检查是否有子任务  阶段和列表都在这里触发
          if (isMask) {
            checkTaskSubTask(taskId, ($li, status, isAll) => {
              that.props.dispatch(editTaskStatus(taskId, status, isAll, '', source => afterUpdateTaskStatus(source, status, isAll, $li)));
            });
          } else {
            alert(_l('您无权操作'), 3);
          }
          event.stopPropagation();
        },
      },
      '#tasks .markTask'
    );

    // 成员头像hover
    $container.on('mouseover.task', '#tasks .listStageTaskContent .chargeImg, #tasks .listStageContent .chargeImg', function (event) {
      if ($(event.target).closest('.createNewTask').length) return;

      const $this = $(this);
      const folderId = that.props.taskConfig.folderId;
      let projectId = that.props.taskConfig.projectId;

      if (!$this.data('hasbusinesscard')) {
        const accountId = $this.data('id');
        let taskId;
        if (folderId) {
          taskId = $this.closest('li').data('taskid');
        } else {
          taskId = $this.closest('tr').data('taskid');
          projectId = $this.closest('tr').data('projectid');
        }
        $this.mdBusinessCard({
          id: 'updateTaskChargeCard_' + taskId,
          accountId,
          secretType: 1,
          opHtml: $this.data('auth') === config.auth.Charger ? "<span class='updateChargeBtn ThemeColor3'>" + _l('将任务托付给他人') + '</span>' : '',
          readyFn(opts, dialog) {
            dialog.find('.updateChargeBtn').on('click', function () {
              $(this).dialogSelectUser({
                sourceId: folderId,
                showMoreInvite: false,
                fromType: 2,
                SelectUserSettings: {
                  includeUndefinedAndMySelf: true,
                  filterAccountIds: [accountId],
                  projectId: checkIsProject(projectId) ? projectId : '',
                  unique: true,
                  callback(users) {
                    const user = users[0];

                    that.props.dispatch(updateTaskCharge(taskId, user, '', () => afterUpdateTaskCharge(taskId, user.avatar, user.accountId)));
                    $this.data('hasbusinesscard', false).off();
                  },
                },
              });
            });
          },
        });
        $this.data('hasbusinesscard', true).mouseenter();
      }
    });

    // 星标
    $container.on('click.task', '#tasks .taskStar:not(.createNewSingle .taskStar, .addNewTask .taskStar)', function (event) {
      const taskId =
        $(this)
          .closest('li')
          .data('taskid') ||
        $(this)
          .closest('tr')
          .data('taskid');
      const hasStar = $(this).hasClass('icon-star-hollow');

      that.props.dispatch(updateTaskMemberStar(taskId, hasStar, () => afterUpdateTaskStar(taskId, hasStar)));
      event.stopPropagation();
    });

    // 页面点击
    $(document)
      .off('.task')
      .on('click.task', (event) => {
        const $target = $(event.target);

        // 批量操作?
        if (
          $target.closest('#batchTask').length <= 0 &&
          $target.closest('.listStageTaskContent').length <= 0 &&
          $target.closest('.dialogScroll').length <= 0 &&
          $target.closest('.maskTaskBox').length <= 0 &&
          $target.closest('#dialogBoxSelectUser').length <= 0 &&
          $target.closest('#dialogBoxSelectUseroverlay').length <= 0 &&
          !$target.parent().is('.subItem') &&
          $target.closest('.messageDiv').length <= 0 &&
          $target.closest('#batchTaskFolder_autocomplete').length <= 0 &&
          !$target.closest('.businessCardSite').length &&
          $target.closest('#chooseInviteDialog').length <= 0 &&
          $target.closest('#chooseInviteDialogoverlay').length <= 0 &&
          !$target.closest('.quickSelectUser').length &&
          !$target.closest('.confirm').length &&
          !$target.closest('.selectizeiItem').length &&
          !$target.closest('#chat').length &&
          !$target.closest('#chatPanel').length
        ) {
          // 批量操作?
          if ($('#batchTask').length > 0 && $('#batchTask').hasClass('slideLeft')) {
            $('#taskList .selectTask').removeClass('selectTask ThemeBGColor6');
            $('#batchTask')
              .removeClass('slideLeft')
              .on('webkitTransitionEnd transitionEnd', function () {
                $(this).html('');
              });
            $('#tasks').removeClass('slideDetail');
            $('body').removeClass('userSelect');
          }
        }

        // 阶段更多
        if ($target.closest('.singleStage .icon-arrow-down-border').length <= 0) {
          $('.singleStage .icon-arrow-down-border ul').hide();
        }

        // 搜索
        if ($target.closest('#folderNavigator .folderSearch').length <= 0) {
          $('.searchDiv .searchContent').hide();
        }

        // 判断是否隐藏阶段新建任务
        if ($target.closest('li.addNewTask').length <= 0) {
          // 自己
          if ($target.closest('.addNewTask').length > 0) {
            return;
          }
          // 选择成员?
          if ($target.closest('#dialogBoxSelectUser_container').length > 0 || $target.is($('#dialogBoxSelectUser_mask'))) {
            return;
          }
          // 头像?
          if ($target.closest('.messageDiv').length > 0) {
            return;
          }
          // 日历?
          if ($target.closest('.PositionContainer-wrapper').length > 0) {
            return;
          }
          // 提示?
          if ($target.closest('#alertDialog').length > 0) {
            return;
          }
          // 选中成员遮罩?
          if ($target.is('#dialogBoxSelectUseroverlay')) {
            return;
          }
          if ($target.closest('.Calendar-range').length > 0 || $target.closest('.TimePicker').length > 0) {
            return;
          }

          $('li.addNewTask').each(function () {
            if (
              !$.trim(
                $(this)
                  .find('.teaStageName')
                  .val()
              )
            ) {
              const $li = $(this).closest('li.singleStage');
              // 隐藏创建层层
              $li.find('li.addNewTask:last').hide();
              $li.find('.bottomNewBox').show();
              $li.find('.stageContentBox').removeClass('addNewTask');
            }
          });
        }
      });
  }

  componentWillReceiveProps(nextProps) {
    const pathname = nextProps.pathname || '';
    const folderIndex = pathname.indexOf('folder_') > -1 ? pathname.indexOf('folder_') : pathname.indexOf('center_folderId=');

    if (pathname !== this.props.pathname && folderIndex > 0) {
      const paramSize = pathname.indexOf('folder_') > -1 ? 7 : 16;
      const folderId = pathname.substring(folderIndex + paramSize);
      // 不同项目更新数据
      if (folderId !== this.props.taskConfig.folderId) {
        this.init(folderId);

        $('.folderList li').removeClass('ThemeBGColor8');
        $('.folderList li[data-id=' + pathname.substring(folderIndex + 7) + ']')
          .eq(0)
          .addClass('ThemeBGColor8');
      }
    }

    // 应用进入
    if (this.props.hideNavigation && nextProps.folderId !== this.props.folderId) {
      this.init(nextProps.folderId);
    }
  }

  componentWillUnmount() {
    $('html').removeClass('AppTask');
  }

  componentWillUnmount() {
    $('#container').off('.task');
    $('body')
      .off('.task')
      .removeClass('taskDetailOpen');
    this.props.dispatch(clearFolderSettings());
  }

  /**
   * 初始化
   */
  init(folderId) {
    const storage = getTaskStorage('TaskCenterState');
    const pathname = location.pathname;
    const folderIndex = pathname.indexOf('folder_') > -1 ? pathname.indexOf('folder_') : pathname.indexOf('center_folderId=');
    const paramSize = pathname.indexOf('folder_') > -1 ? 7 : 16;

    // 外链直接打开项目
    if (folderIndex > 0 || folderId) {
      // 设置项目options
      this.setFolderOptions(folderId || pathname.substring(folderIndex + paramSize));
    } else if (storage) {
      // 本地缓存的最后打开的数据
      const taskConfig = Object.assign(
        {},
        this.props.taskConfig,
        { taskFilter: storage.Active },
        storage.Active ? getTaskState(storage.Active) : getFolderState()
      );
      // 设置项目options
      if (taskConfig.folderId && taskConfig.folderId !== 1 && pathname.indexOf('star') < 0 && pathname.indexOf('subordinate') < 0) {
        this.setFolderOptions(taskConfig.folderId);
      } else {
        taskConfig.taskFilter = pathname.indexOf('star') >= 0 ? 8 : pathname.indexOf('subordinate') >= 0 ? 9 : storage.Active;
        taskConfig.folderId = '';
        this.props.dispatch(updateStateConfig(taskConfig));
      }
    } else {
      const taskFilter = pathname.indexOf('star') >= 0 ? 8 : pathname.indexOf('subordinate') >= 0 ? 9 : 6;
      this.props.dispatch(updateStateConfig(Object.assign({}, this.props.taskConfig, { taskFilter })));
    }

    this.props.dispatch(taskFirstSetStorage());
  }

  /**
   * 设置项目options
   */
  setFolderOptions(folderId) {
    const taskConfig = Object.assign(
      {},
      getFolderState(),
      {
        taskFilter: '',
        projectId: '',
        folderId,
      },
      config.clearFilterSettings
    );

    if (location.href.indexOf('#detail') > 0) {
      taskConfig.viewType = config.folderViewType.folderDetail;
    }

    setStateToStorage('', taskConfig);
    this.props.dispatch(updateStateConfig(taskConfig));
  }

  /**
   * 渲染内容
   */
  renderContainer() {
    const { taskFilter, folderId, searchKeyWords, projectId } = this.props.taskConfig;
    const { folderSettings, hideNavigation } = this.props;

    return (
      <div className="taskMainBox flexRow borderContainer">
        {hideNavigation ? null : (
          <Fragment>
            <div className="Fixed ThemeBG leftNavHairGlass" />
            <TaskNavigation />
          </Fragment>
        )}
        <div id="tasks" className="flex flexColumn" data-pid={projectId} data-fid={folderId}>
          {taskFilter !== 9 && <TaskToolbar hideNavigation={hideNavigation} />}

          {folderId && searchKeyWords && this.renderFolderSearchBar()}

          {folderId && !_.isEmpty(folderSettings) && folderSettings.code ? (
            this.renderErrorPage()
          ) : (
            <div className="taskContent flex animatedBorderFast">
              {taskFilter !== 9 && !folderId && <TaskList emitter={this.props.emitter} />}
              {taskFilter === 9 && <Subordinate />}
              {this.props.folderId && this.props.folderId !== folderId
                ? null
                : ((folderId && !_.isEmpty(folderSettings) && folderId === folderSettings.folderID) || folderId === 1) && this.renderFolderContainers()}
            </div>
          )}
        </div>
      </div>
    );
  }

  /**
   * 项目下的模块切换
   */
  renderFolderContainers() {
    const { emitter, taskConfig } = this.props;
    const { viewType, folderId, projectId } = taskConfig;

    // 列表
    if (viewType === config.folderViewType.treeView) {
      return <TaskTree emitter={emitter} />;
    }

    // 看板
    if (viewType === config.folderViewType.stageView) {
      return <TaskStage emitter={emitter} />;
    }

    // 时间
    if (viewType === config.folderViewType.taskGantt) {
      return <TaskGantt />;
    }

    // 项目详情
    if (viewType === config.folderViewType.folderDetail) {
      return <FolderDetail />;
    }

    // 文件
    if (viewType === config.folderViewType.attachment) {
      return <Attachment />;
    }

    // 统计
    if (viewType === config.folderViewType.folderChart) {
      return <FolderChart />;
    }
  }

  /**
   * 项目搜索bar
   */
  renderFolderSearchBar() {
    const { searchKeyWords } = this.props.taskConfig;

    return (
      <div className="folderSearchBar boderRadAll_3">
        <span className="pointer ThemeColor3" onClick={() => this.props.dispatch(updateKeyWords(''))}>
          {_l('清除')}
        </span>
        <span className="mLeft20">{_l('所有与“%0”相关的任务', searchKeyWords)}</span>
      </div>
    );
  }

  /**
   * 报错页面
   */
  renderErrorPage() {
    const { code } = this.props.folderSettings;
    const { taskFilter, folderId, searchKeyWords, projectId } = this.props.taskConfig;

    // 无权限
    if (code === 300020101) {
      return (
        <div className="errorFolderBox">
          <ErrorState text={_l('您的权限不足，无法查看此项目')} showBtn callback={() => joinProjectPrompt(folderId)} />;
        </div>
      );
    }

    return (
      <div className="errorFolderBox">
        <ErrorState text={_l('项目已被删除，无法查看')} />;
      </div>
    );
  }

  render() {
    if (!this.props.taskFirstSetStorage) {
      return null;
    }

    return (
      <div className="taskMain relative">
        {this.renderContainer()}
        <div id="batchTask" className="animatedBorderFast" />
      </div>
    );
  }
}

export default connect(state => state.task)(TaskCenter);
