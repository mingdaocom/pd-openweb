import React, { Component, Fragment } from 'react';
import { render } from 'react-dom';
import { connect } from 'react-redux';
import cx from 'classnames';
import './taskDetail.less';
import 'mdDialog';
import ajaxRequest from 'src/api/taskCenter';
import DialogBase from 'ming-ui/components/Dialog/DialogBase';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import { getTaskDetail, getTaskDiscussions, removeTaskMember, destroyTask, updateTaskParentId, updateTaskFolderId } from '../../redux/actions';
import LoadDiv from 'ming-ui/components/LoadDiv';
import ErrorState from 'src/components/errorPage/errorState';
import config, { OPEN_TYPE, RELATION_TYPES } from '../../config/config';
import { errorMessage } from '../../utils/utils';
import ScrollView from 'ming-ui/components/ScrollView';
import TaskComment from './taskComment/taskComment';
import TaskCommentList from './taskCommentList/taskCommentList';
import TaskLog from './taskLog/taskLog';
import FileList from 'src/components/comment/FileList';
import ChecklistContainer from './checklist/checklistContainer';
import SubTask from './subTask/subTask';
import Header from './header/header';
import { afterDeleteTask, afterUpdateTaskFolder, afterUpdateTaskParent, getLeftMenuCount } from '../../utils/taskComm';
import RelationControl from 'src/components/relationControl/relationControl';
import TaskBasic from './taskBasic/taskBasic';
import TaskTime from './taskTime/taskTime';
import TaskControl from './taskControl/taskControl';
import { navigateTo } from 'src/router/navigateTo';

const ClickAwayable = createDecoratedComponent(withClickAway);
const TAB_TYPE = {
  comment: 1,
  attachment: 2,
  log: 3,
};

class TaskDetail extends Component {
  static defaultProps = {
    visible: false,
    taskId: '',
    openType: 1,
    hasNotice: false,
    openCallback: () => {},
    closeCallback: () => {},
    animationEndRemoveDetail: () => {},
    updateCallback: () => {},
  };
  constructor(props) {
    super(props);
    this.state = {
      animationEnd: props.openType !== OPEN_TYPE.slide,
      taskId: props.taskId,
      hasNotice: props.hasNotice,
      postSuccessCount: 0,
      beforeTaskId: '',
      tabIndex: TAB_TYPE.comment,
      addSubTask: false,
      addChecklist: false,
      addTags: false,
      forceUpdateSource: false,
    };
  }

  componentDidMount() {
    this.mounted = true;
    if (this.props.visible && this.state.taskId) {
      this.init();
      this.animationEnd();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.taskId && (nextProps.taskId !== this.props.taskId || nextProps.isForceUpdate)) {
      this.scrollToFixedPosition({ scrollTop: 0 });
      this.setState(
        {
          animationEnd: nextProps.openType !== OPEN_TYPE.slide || this.props.visible,
          taskId: nextProps.taskId,
          beforeTaskId: '',
          tabIndex: TAB_TYPE.comment,
          hasNotice: nextProps.hasNotice,
          postSuccessCount: 0,
          forceUpdateSource: false,
        },
        () => {
          this.init();
          this.animationEnd();
        }
      );

      if ($.isFunction(nextProps.closeForceUpdate)) {
        nextProps.closeForceUpdate();
      }
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.forceUpdateSource && !this.state.forceUpdateSource && this.mounted) {
      if (nextState.tabIndex === TAB_TYPE.comment) {
        this.commentList.updatePageIndex(true);
      } else if (nextState.tabIndex === TAB_TYPE.attachment) {
        this.fileList.getFiles();
      } else if (nextState.tabIndex === TAB_TYPE.log) {
        this.taskLog.getTaskLog();
      }
    }
  }

  componentDidUpdate() {
    const { hasNotice, postSuccessCount } = this.state;

    // ??????????????????????????????
    if (hasNotice && postSuccessCount === 4) {
      setTimeout(() => {
        this.scrollToFixedPosition({ scrollTo: $('.taskDetail .talkNav') });
      }, 100);
      this.setState({ hasNotice: false });
    }

    if (this.state.forceUpdateSource) {
      this.setState({ forceUpdateSource: false });
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    if (this.props.openType === OPEN_TYPE.slide) {
      $('#tasks').removeClass('slideDetail');
    }
  }

  /**
   * ?????????
   */
  init() {
    if (this.props.openType === OPEN_TYPE.slide) {
      $('#tasks').addClass('slideDetail');
      $('#batchTask')
        .removeClass('slideLeft')
        .html(''); // ???????????????????????????
    }

    this.props.dispatch(getTaskDetail(this.state.taskId, this.props.openCallback, this.addPostSuccessCount));
  }

  /**
   * ???????????? ????????????????????????????????????
   */
  addPostSuccessCount = () => {
    if (this.mounted && this.state.hasNotice) {
      this.setState({ postSuccessCount: this.state.postSuccessCount + 1 });
    }
  };

  /**
   * ??????????????????
   */
  animationEnd() {
    if (this.props.openType === OPEN_TYPE.slide) {
      setTimeout(() => {
        this.setState({ animationEnd: true });
      }, 200);
    }
  }

  /**
   * ????????????
   */
  closeDetail = () => {
    if (this.props.openType === OPEN_TYPE.slide) {
      $('#tasks').removeClass('slideDetail');
      $('#tasks .selectTask').removeClass('selectTask ThemeBGColor6');
      // ?????????????????????????????????
      setTimeout(() => {
        this.props.animationEndRemoveDetail();
      }, 250);
    }

    this.props.closeCallback();
  };

  /**
   * ??????????????????
   */
  applyJoinTask = () => {
    ajaxRequest
      .applyJoinTask({
        taskID: this.state.taskId,
      })
      .then((source) => {
        if (source.status) {
          alert(_l('????????????????????????????????????????????????'));
        } else {
          errorMessage(source.error);
        }
      });
  };

  /**
   * ??????????????????
   */
  switchTaskDetail = (taskId) => {
    const { openType } = this.props;

    if (openType === OPEN_TYPE.detail) {
      navigateTo('/apps/task/task_' + taskId);
    } else {
      this.scrollToFixedPosition({ scrollTop: 0 });
      this.setState(
        {
          taskId,
          tabIndex: TAB_TYPE.comment,
          beforeTaskId: this.state.taskId,
        },
        () => {
          this.init();
        }
      );
    }
  };

  /**
   * ?????????????????????
   */
  showRelationControl = (type) => {
    const { taskId } = this.state;
    const { data } = this.props.taskDetails[taskId];
    const ajaxPost = (keywords) => {
      if (type === RELATION_TYPES.task) {
        return ajaxRequest.getTaskList_RelationParent({ taskID: taskId, keyword: keywords });
      }

      return ajaxRequest.getFolderListForUpdateFolderID({ projectId: data.projectID, keyWords: keywords, excludeTaskIDs: taskId });
    };
    const ajaxDataFormat = (data) => {
      let sourceArray = [];
      if (type === RELATION_TYPES.task) {
        sourceArray = (data || []).map((item) => {
          return {
            sid: item.taskID,
            type: RELATION_TYPES.task,
            avatar: item.charge.avatar,
            fullname: item.charge.fullName,
            name: item.taskName,
          };
        });
      } else {
        sourceArray = (data || []).map((item) => {
          return {
            sid: item.folderID,
            type: RELATION_TYPES.folder,
            avatar: item.charge.avatar,
            fullname: item.charge.fullName,
            name: item.folderName,
          };
        });
      }

      return sourceArray;
    };

    render(
      <RelationControl
        ajaxPost={ajaxPost}
        ajaxDataFormat={ajaxDataFormat}
        createDisable
        types={[type]}
        onSubmit={item => this.relationOnSubmit(item.sid, item.type)}
      />,
      document.createElement('div')
    );
  };

  /**
   * ???????????? ??? ?????????
   */
  relationOnSubmit = (id, type) => {
    const { taskId } = this.state;
    const { openType } = this.props;
    const { data } = this.props.taskDetails[taskId];
    const taskControls = this.props.taskControls[taskId] || [];

    // ??????????????????
    const updateFolderCallback = () => {
      if (openType === OPEN_TYPE.slide) {
        afterUpdateTaskFolder(taskId, '');
      }
    };

    // ?????????????????????
    const updateParentCallback = (source) => {
      if (openType === OPEN_TYPE.slide) {
        afterUpdateTaskParent(taskId, id, data.parentID, source);
      }
    };

    // ????????????
    const callback = () => {
      if (type === RELATION_TYPES.task) {
        this.props.dispatch(updateTaskParentId(taskId, id, updateParentCallback));
      } else {
        this.props.dispatch(updateTaskFolderId(taskId, id, updateFolderCallback));
      }
    };

    if (taskControls.length && id) {
      $.DialogLayer({
        dialogBoxID: 'updateTaskStatusDialog',
        showClose: false,
        container: {
          header: type === RELATION_TYPES.task ? _l('????????????????????????????????????') : _l('?????????????????????????????????'),
          content: `<div class="Font14 mBottom20">${
            type === RELATION_TYPES.task
              ? _l('?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????')
              : _l('???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????')
          }</div>`,
          yesText: _l('??????'),
          noText: _l('??????'),
          yesFn: () => {
            callback();
          },
        },
      });
    } else {
      callback();
    }
  };

  /**
   * ??????????????????
   */
  removeTaskMember = (accountId) => {
    const { taskId } = this.state;
    const { openType } = this.props;
    const isMe = accountId === md.global.Account.accountId;

    $.DialogLayer({
      dialogBoxID: 'deleteTaskMemberDialog',
      showClose: false,
      container: {
        content: `<div class="Font16 mBottom20">${isMe ? _l('??????????????????????????????') : _l('?????????????????????????????????')}</div>`,
        yesFn: () => {
          ajaxRequest.deleteTaskMember({ taskID: taskId, accountID: accountId }).then(() => {
            alert(isMe ? _l('????????????') : _l('????????????'));

            if (isMe) {
              this.closeDetail();
              this.props.dispatch(destroyTask(taskId));
              if (openType === OPEN_TYPE.slide) {
                afterDeleteTask([taskId]);
                // ???????????????????????????????????????
                if (!this.props.taskConfig.filterUserId) {
                  getLeftMenuCount('', 'all');
                }
              } else if (openType === OPEN_TYPE.detail) {
                navigateTo('/apps/task/center');
              }
            } else {
              this.props.dispatch(removeTaskMember(taskId, accountId));
            }
          });
        },
      },
    });
  };

  /**
   * ??????tab
   */
  switchTabs(tabIndex) {
    this.setState({ tabIndex });
  }

  /**
   * ?????????????????????
   */
  scrollToFixedPosition(obj) {
    $('.taskDetailScroll').nanoScroller(obj);
  }

  /**
   * scrollView??????
   */
  scroll = (evt, obj) => {
    if (this.mounted) {
      $('.taskDetailHeader').toggleClass('borderClear', obj.position > 0);

      if (obj.maximum - obj.position <= 30 && this.state.tabIndex === TAB_TYPE.comment) {
        this.commentList.updatePageIndex();
      }
    }
  };

  /**
   * ??????????????????
   */
  renderContentBox() {
    const { openType } = this.props;

    if (openType === OPEN_TYPE.slide) {
      return (
        <ClickAwayable
          component="div"
          className="taskDetail slide"
          onClickAwayExceptions={[
            '.persist-area',
            '.listStageTaskContent',
            '.listStageContent',
            '.rc-notification',
            '.dialogScroll',
            '.attachmentsPreview',
            '.selectUserBox',
            '#dialogBoxSelectUser_container',
            '.businessCardSite',
            '.mui-dialog-container',
            '.mdAlertDialog',
            '.PositionContainer-wrapper',
            '.rc-trigger-popup',
            '#chat',
            '#chatPanel',
            '.warpDatePicker',
            '.ck'
          ]}
          onClickAway={this.closeDetail}
        >
          {this.renderTaskContent()}
        </ClickAwayable>
      );
    }

    return (
      <div className={cx('taskDetail', { detail: openType === OPEN_TYPE.detail }, { fullscreen: openType === OPEN_TYPE.dialog })}>
        {this.renderTaskContent()}
      </div>
    );
  }

  /**
   * ??????????????????
   */
  renderTaskContent() {
    const { animationEnd, taskId, beforeTaskId, tabIndex, showHeadShadow, addSubTask, addChecklist, addTags, forceUpdateSource } = this.state;
    const { openType, taskDetails } = this.props;
    const result = taskDetails[taskId];

    // ?????????
    if (!result || !animationEnd) {
      return <LoadDiv />;
    }

    // ???????????????????????????????????????
    if (!result.status || result.data.auth === config.auth.None) {
      return (
        <div className="relative h100">
          {beforeTaskId ? (
            <div className="applyReturn">
              <span onClick={() => this.switchTaskDetail(beforeTaskId)}>
                <i className="icon-arrow-left-border" />
                {_l('??????')}
              </span>
            </div>
          ) : null}
          {openType === OPEN_TYPE.dialog ? (
            <span className="taskCloseBtn ThemeColor3" data-tip={_l('??????')} onClick={this.closeDetail}>
              <i className="icon-delete" />
            </span>
          ) : null}
          <ErrorState
            text={!result.status ? _l('??????????????????????????????') : _l('??????????????????????????????????????????')}
            showBtn={!!result.status}
            callback={this.applyJoinTask}
          />
        </div>
      );
    }

    return (
      <Fragment>
        <Header
          taskId={taskId}
          refreshDetail={() => {
            this.init();
            this.setState({ forceUpdateSource: true });
          }}
          addSubTask={() => this.setState({ addSubTask: true })}
          addChecklist={() => this.setState({ addChecklist: true })}
          addTags={() => this.setState({ addTags: true })}
          removeTaskMember={this.removeTaskMember}
          openType={openType}
          showRelationControl={this.showRelationControl}
          closeDetail={this.closeDetail}
          updateCallback={this.props.updateCallback}
        />
        <div className="flex taskDetailContent">
          <ScrollView className="Absolute taskDetailScroll" updateEvent={this.scroll}>
            <TaskTime taskId={taskId} openType={openType} updateCallback={this.props.updateCallback} />
            <TaskBasic
              taskId={taskId}
              openType={openType}
              removeTaskMember={this.removeTaskMember}
              addTags={addTags}
              closeCallback={this.props.closeCallback}
              showRelationControl={this.showRelationControl}
              relationOnSubmit={this.relationOnSubmit}
              switchTaskDetail={this.switchTaskDetail}
              closeAddTags={() => this.setState({ addTags: false })}
              updateCallback={this.props.updateCallback}
            />
            <SubTask
              taskId={taskId}
              openType={openType}
              switchTaskDetail={this.switchTaskDetail}
              addSubTask={addSubTask}
              closeAddSubTask={() => this.setState({ addSubTask: false })}
              updateCallback={this.props.updateCallback}
            />
            <div className="taskContentBox">
              <ChecklistContainer
                taskId={taskId}
                noAuth={result.data.auth === config.auth.Look}
                addChecklist={addChecklist}
                closeAddChecklist={() => this.setState({ addChecklist: false })}
              />
            </div>
            <TaskControl taskId={taskId} />
            <ul className="talkNav boxSizing">
              <li className={cx('ThemeBorderColor3 ThemeColor3', { active: tabIndex === TAB_TYPE.comment })} onClick={() => this.switchTabs(TAB_TYPE.comment)}>
                {_l('??????')}
              </li>
              <li
                className={cx('ThemeBorderColor3 ThemeColor3 mLeft20', { active: tabIndex === TAB_TYPE.attachment })}
                onClick={() => this.switchTabs(TAB_TYPE.attachment)}
              >
                {_l('??????')}
              </li>
              <li className={cx('ThemeBorderColor3 ThemeColor3', { active: tabIndex === TAB_TYPE.log })} onClick={() => this.switchTabs(TAB_TYPE.log)}>
                {_l('????????????')}
              </li>
            </ul>
            <div className="talkBox">
              {tabIndex === TAB_TYPE.comment && (
                <TaskCommentList
                  taskId={taskId}
                  addPostSuccessCount={this.addPostSuccessCount}
                  scrollToComment={() => this.scrollToFixedPosition({ scrollTo: $('.taskDetail .talkNav') })}
                  manualRef={(commentList) => {
                    this.commentList = commentList;
                  }}
                />
              )}
              {tabIndex === TAB_TYPE.log && (
                <TaskLog
                  taskId={taskId}
                  manualRef={(taskLog) => {
                    this.taskLog = taskLog;
                  }}
                />
              )}
              {tabIndex === TAB_TYPE.attachment && (
                <FileList
                  sourceType={FileList.TYPES.TASK}
                  sourceId={taskId}
                  appId={md.global.APPInfo.taskAppID}
                  manualRef={(fileList) => {
                    this.fileList = fileList;
                  }}
                />
              )}
            </div>
          </ScrollView>
        </div>
        <TaskComment taskId={taskId} scrollToComment={() => this.scrollToFixedPosition({ scrollTo: $('.taskDetail .talkNav') })} />
      </Fragment>
    );
  }

  render() {
    const { visible, openType } = this.props;

    if (!visible) {
      return null;
    }

    // ?????? or ???????????????
    if (openType === OPEN_TYPE.slide || openType === OPEN_TYPE.detail) {
      return <Fragment>{this.renderContentBox()}</Fragment>;
    }

    // ????????????
    return (
      <DialogBase visible width={800} type="fixed" anim={false}>
        {this.renderContentBox()}
      </DialogBase>
    );
  }
}

export default connect(state => state.task)(TaskDetail);
