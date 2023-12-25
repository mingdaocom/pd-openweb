import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import './taskBasic.less';
import _ from 'lodash';
import { connect } from 'react-redux';
import ajaxRequest from 'src/api/taskCenter';
import Textarea from 'ming-ui/components/Textarea';
import RichText from 'ming-ui/components/RichText';
import config, { OPEN_TYPE, RELATION_TYPES } from '../../../config/config';
import {
  afterUpdateTaskStar,
  afterUpdateTaskName,
  afterUpdateTaskCharge,
  joinProjectPrompt,
  afterUpdateTaskStage,
} from '../../../utils/taskComm';
import { checkIsProject } from '../../../utils/utils';
import UserHead from 'src/components/userHead';
import dialogSelectUser from 'src/components/dialogSelectUser/dialogSelectUser';
import quickSelectUser from 'ming-ui/functions/quickSelectUser';
import UploadFiles from 'src/components/UploadFiles';
import UploadFilesTrigger from 'src/components/UploadFilesTrigger';
import Dropdown from 'ming-ui/components/Dropdown';
import { navigateTo } from 'src/router/navigateTo';
import { htmlDecodeReg } from 'src/util';
import {
  updateTaskName,
  updateTaskCharge,
  updateTaskMemberStar,
  agreeApplyJoinTask,
  refuseJoinTask,
  addTaskMember,
  addTaskTag,
  removeTasksTag,
  addTaskAttachments,
  deleteAttachmentData,
  updateTaskStageId,
  updateTaskSummary,
} from '../../../redux/actions';
import { Tooltip } from 'antd';

let selectizeLib;
const FROM_TYPE = {
  1: {
    icon: 'icon-bellSchedule',
    text: _l('日程转为的任务'),
  },
  2: {
    icon: 'icon-mingdao',
    text: _l('动态转为的任务'),
  },
  3: {
    icon: 'icon-worksheet',
    text: _l('工作表记录转为的任务'),
  },
};

class TaskBasic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      taskName: props.taskDetails[props.taskId].data.taskName,
      showTags: props.taskDetails[props.taskId].data.tags.length > 0,
      showAttachment: false,
      isComplete: false,
      disabled: false,
      isEditing: false,
      attachmentData: [],
      kcAttachmentData: [],
    };
  }

  componentDidMount() {
    const { taskId } = this.props;
    const { data } = this.props.taskDetails[taskId];

    this.bindTags(data.tags, taskId);
  }

  componentWillReceiveProps(nextProps) {
    const { data } = nextProps.taskDetails[nextProps.taskId];
    if (data.taskName !== this.state.taskName) {
      this.setState({ taskName: data.taskName });
    }

    if (selectizeLib) {
      const tags = data.tags.map(item => item.tagID);

      if (!_.isEqual(selectizeLib[0].selectize.items.sort(), tags.sort())) {
        this.bindTags(data.tags, nextProps.taskId);
      }
    }

    if (nextProps.taskId !== this.props.taskId) {
      this.setState({
        showTags: data.tags.length > 0,
        showAttachment: false,
        isComplete: false,
        disabled: false,
        isEditing: false,
        attachmentData: [],
        kcAttachmentData: [],
      });
    }

    if (nextProps.addTags) {
      this.setState({ showTags: true }, () => {
        $('.taskTagList .selectize-input input:last').focus();
      });
      nextProps.closeAddTags();
    }
  }

  /**
   * 打开详情
   */
  openDetail(type, id) {
    if (type === 1) {
      navigateTo('/apps/calendar/detail_' + id); // 日程
    } else if (type === 2) {
      navigateTo('/feeddetail?itemID=' + id); // 动态
    } else if (type === 3) {
      const arr = id.split('|');
      // 工作表
      if (arr.length === 2) {
        // 老数据
        navigateTo(`/worksheet/${arr[0]}/row/${arr[1]}`);
      } else if (arr.length === 4) {
        // 视图id不存在的情况
        if (!arr[2]) {
          navigateTo(`/worksheet/${arr[1]}/row/${arr[3]}`);
        } else {
          navigateTo(`/app/${arr[0]}/${arr[1]}/${arr[2]}/row/${arr[3]}`);
        }
      }
    }
  }

  /**
   * 渲染项目信息
   */
  renderFolder() {
    const { taskId } = this.props;
    const { data } = this.props.taskDetails[taskId];
    const hasAuth = data.auth === config.auth.Charger || data.auth === config.auth.Member;
    const stages = data.stages.map(item => {
      return {
        text: htmlDecodeReg(item.name),
        value: item.id,
      };
    });

    return (
      <div className="flexRow mTop15 detailFolder">
        {!data.folderID ? (
          <Fragment>
            <div
              className={cx('taskNullFolder', { 'pointer ThemeColor3 ThemeBorderColor3': hasAuth })}
              onClick={() => hasAuth && this.props.showRelationControl(RELATION_TYPES.folder)}
            >
              {_l('关联项目')}
            </div>
            <div className="overflow_ellipsis mLeft20 flex detailFolderName">{data.projectName || _l('个人')}</div>
          </Fragment>
        ) : (
          <Fragment>
            <Tooltip
              title={_l(
                '所属组织：%0',
                (this.props.taskDetails[this.props.taskId] || { data: {} }).data.projectName || _l('个人'),
              )}
            >
              <div
                className="taskDeatilFolderName pointer ThemeColor3 overflow_ellipsis"
                onClick={() => this.openFolder(data.folderID, data.folderCanLook)}
              >
                {htmlDecodeReg(data.folderName)}
              </div>
            </Tooltip>
            <div className="taskDeatilFolderStage">
              <Dropdown
                className={cx('mLeft15', { ThemeBGColor3: hasAuth && !data.parentID })}
                data={stages}
                value={data.stageID}
                onChange={this.switchTaskStage}
                disabled={!hasAuth || !!data.parentID}
              />
            </div>
            <div className="flex" />
            {!data.ancestors.length && (
              <span
                className="folderBtn ThemeColor3 tip-bottom-left pointer"
                data-tip={_l('重新关联项目')}
                onClick={() => this.props.showRelationControl(RELATION_TYPES.folder)}
              >
                <i className="icon-edit" />
              </span>
            )}
          </Fragment>
        )}
      </div>
    );
  }

  /**
   * 打开项目
   */
  openFolder(folderId, folderCanLook) {
    if (folderCanLook) {
      if (folderId === this.props.taskConfig.folderId) {
        return;
      }
      if (this.props.openType !== OPEN_TYPE.slide) {
        this.props.closeCallback();
      }
      navigateTo('/apps/task/folder_' + folderId);
    } else {
      joinProjectPrompt(folderId); // 申请加入项目
    }
  }

  /**
   * 更改阶段
   */
  switchTaskStage = stageId => {
    const { taskId, openType } = this.props;
    const { data } = this.props.taskDetails[taskId];
    const stageName = _.find(data.stages, item => item.id === stageId).name;
    const callback = data => {
      if (openType === OPEN_TYPE.slide) {
        afterUpdateTaskStage(stageId, taskId, data);
      }
    };

    this.props.dispatch(updateTaskStageId(taskId, stageId, stageName, callback));
  };

  /**
   * 渲染母任务列表
   */
  renderParentItem(item, i, showBtn) {
    return (
      <li key={i} className="flexRow">
        <div
          className="Font16 overflow_ellipsis ThemeColor3 ThemeBorderColor3 pointer"
          onClick={() => this.props.switchTaskDetail(item.taskID)}
        >
          {item.taskName} >
        </div>
        <div className="flex" />
        {showBtn && (
          <Fragment>
            <span
              className="parentBtn ThemeColor3 tip-bottom-left pointer"
              data-tip={_l('取消关联任务')}
              onClick={() => this.props.relationOnSubmit('', RELATION_TYPES.task)}
            >
              <i className="icon-delete" />
            </span>
            <span
              className="parentBtn ThemeColor3 tip-bottom-left pointer"
              data-tip={_l('重新关联母任务')}
              onClick={() => this.props.showRelationControl(RELATION_TYPES.task)}
            >
              <i className="icon-edit" />
            </span>
          </Fragment>
        )}
      </li>
    );
  }

  /**
   * 更改负责人之后回调处理列表
   */
  afterUpdateTaskCharge(avatar, accountId) {
    const { taskId, openType } = this.props;

    if (openType === OPEN_TYPE.slide) {
      afterUpdateTaskCharge(taskId, avatar, accountId);
    } else {
      this.props.updateCallback({ type: 'UPDATE_CHARGE', user: { accountId, avatar } });
    }
  }

  /**
   * 点击切换负责人
   */
  clickChargeAvatar(evt) {
    const { taskId } = this.props;
    const { data } = this.props.taskDetails[taskId];
    const callback = users => {
      const user = users[0];
      this.props.dispatch(
        updateTaskCharge(taskId, user, '', () => this.afterUpdateTaskCharge(user.avatar, user.accountId)),
      );
    };

    quickSelectUser(evt.target, {
      sourceId: taskId,
      projectId: data.projectID,
      fromType: 2,
      filterAccountIds: [data.charge.accountID],

      showMoreInvite: false,
      includeUndefinedAndMySelf: true,
      SelectUserSettings: {
        filterAccountIds: [data.charge.accountID],
        projectId: checkIsProject(data.projectID) ? data.projectID : '',
        callback,
      },
      selectCb: callback,
    });
  }

  /**
   * 负责人 opHtml
   */
  renderChargeOpHtml() {
    const { taskId } = this.props;
    const { data } = this.props.taskDetails[taskId];

    return (
      <span
        className="Gray_9e ThemeHoverColor3 pointer w100 oaButton updateTaskCharge"
        onClick={() => {
          dialogSelectUser({
            sourceId: taskId,
            title: _l('选择负责人'),
            showMoreInvite: false,
            fromType: 2,
            SelectUserSettings: {
              includeUndefinedAndMySelf: true,
              filterAccountIds: [data.charge.accountID],
              projectId: checkIsProject(data.projectID) ? data.projectID : '',
              unique: true,
              callback: users => {
                const user = users[0];
                this.afterUpdateTaskCharge(user.avatar, user.accountId);
                this.props.dispatch(updateTaskCharge(taskId, user, ''));
              },
            },
          });
        }}
      >
        {_l('更改负责人')}
      </span>
    );
  }

  /**
   * 回车失去焦点
   */
  updateTaskNameKeyDown = evt => {
    if (evt.keyCode === 13) {
      evt.currentTarget.blur();
      evt.preventDefault();
    }
  };

  /**
   * 更改任务名称
   */
  updateTaskName = () => {
    const { taskId } = this.props;
    const { data } = this.props.taskDetails[taskId];
    const taskName = _.trim(this.state.taskName);
    const callback = () => {
      if (this.props.openType === OPEN_TYPE.slide) {
        afterUpdateTaskName(taskId, taskName);
      } else {
        this.props.updateCallback({ type: 'UPDATE_NAME', taskName });
      }
    };

    if (taskName === data.taskName) {
      return;
    }

    if (taskName) {
      this.props.dispatch(updateTaskName(taskId, taskName, '', callback));
    } else {
      this.setState({ taskName: data.taskName });
    }
  };

  /**
   * 更改任务星标
   */
  updateTaskMemberStar = () => {
    const { taskId } = this.props;
    const { data } = this.props.taskDetails[taskId];
    const star = !data.star;
    const callback = () => {
      afterUpdateTaskStar(taskId, star);
    };

    this.props.dispatch(updateTaskMemberStar(taskId, star, callback));
  };

  /**
   * 任务成员item
   */
  renderMemberItem(item, i, hasAuth) {
    if (item.type !== 0 || item.status === 2) {
      return null;
    }

    return (
      <span key={i} className="membersListItem">
        {item.status === 1 && <span className="maskApplyMemberBg" />}
        <UserHead
          className={cx({ gray: item.account.status !== 1 })}
          user={{
            userHead: item.account.avatar,
            accountId: item.account.accountID,
          }}
          size={26}
          secretType={1}
          operation={hasAuth || item.account.accountID === md.global.Account.accountId ? this.renderMemberOpHtml(item.account, hasAuth, item.status === 1) : null}
        />
      </span>
    );
  }

  /**
   * 成员 opHtml
   */
  renderMemberOpHtml(account, hasAuth, isApply) {
    // 无权限经过我自己
    if (!hasAuth && md.global.Account.accountId === account.accountId) {
      return (
        <span
          className="Gray_9e ThemeHoverColor3 pointer w100 oaButton removeTaskMember"
          onClick={() => this.clickMemberFn('removeTaskMember', account)}
        >
          {_l('退出任务')}
        </span>
      );
    }

    // 申请
    if (isApply) {
      return (
        <Fragment>
          <span
            className="Gray_9e ThemeHoverColor3 pointer oaButton addMemberAgree"
            onClick={() => this.clickMemberFn('addMemberAgree', account)}
          >
            {_l('同意')}
          </span>
          <span
            className="Gray_9e ThemeHoverColor3 pointer oaButton addMemberRefuse"
            onClick={() => this.clickMemberFn('addMemberRefuse', account)}
          >
            {_l('拒绝')}
          </span>
        </Fragment>
      );
    }

    return (
      <Fragment>
        <span
          className="Gray_9e ThemeHoverColor3 pointer oaButton updateTaskCharge"
          onClick={() => this.clickMemberFn('updateTaskCharge', account)}
        >
          {_l('设为负责人')}
        </span>
        <span
          className="Gray_9e ThemeHoverColor3 pointer oaButton removeTaskMember"
          onClick={() => this.clickMemberFn('removeTaskMember', account)}
        >
          {md.global.Account.accountId === account.accountId ? _l('退出任务') : _l('移出任务')}
        </span>
      </Fragment>
    );
  }

  /**
   * 成员 op操作
   */
  clickMemberFn = (clickOp, account) => {
    const { taskId, removeTaskMember } = this.props;
    const user = {
      accountId: account.accountID,
      avatar: account.avatar,
      fullName: account.fullname,
    };

    switch (clickOp) {
      // 设为负责人
      case 'updateTaskCharge':
        this.props.dispatch(
          updateTaskCharge(taskId, user, '', () => this.afterUpdateTaskCharge(user.avatar, user.accountId)),
        );
        return;
      // 移出成员
      case 'removeTaskMember':
        removeTaskMember(user.accountId);
        return;
      // 同意
      case 'addMemberAgree':
        this.props.dispatch(agreeApplyJoinTask(taskId, user.accountId));
        return;
      // 拒绝
      case 'addMemberRefuse':
        this.props.dispatch(refuseJoinTask(taskId, user.accountId));
        return;
      default:
        return;
    }
  };

  /**
   * 添加成员
   */
  addMembers = evt => {
    const { taskId } = this.props;
    const { data } = this.props.taskDetails[taskId];
    let existsIds = data.member.filter(item => item.type !== 3).map(item => item.account.accountID);
    // 回调
    const callback = (users, callbackInviteResult) => {
      const userIdArr = [];
      const specialAccounts = {}; // 外部用户

      if ($.isFunction(callbackInviteResult)) {
        users.forEach(item => {
          specialAccounts[item.account] = item.fullname;
        });
      } else {
        users.forEach(item => {
          userIdArr.push(item.accountId);
        });
      }

      this.props.dispatch(addTaskMember(taskId, userIdArr, specialAccounts, callbackInviteResult));
    };

    existsIds = existsIds.concat([data.charge.accountID, 'user-undefined']);

    quickSelectUser(evt.target, {
      sourceId: taskId,
      projectId: data.projectID,
      fromType: 2,
      filterAccountIds: existsIds,
      includeUndefinedAndMySelf: true,
      SelectUserSettings: {
        filterAccountIds: existsIds,
        projectId: checkIsProject(data.projectID) ? data.projectID : '',
        callback,
      },
      selectCb: callback,
      ChooseInviteSettings: {
        callback(users, callbackInviteResult) {
          if (!callbackInviteResult) {
            callbackInviteResult = function () {};
          }
          callback(users, callbackInviteResult);
        },
      },
    });
  };

  /**
   * 标签
   */
  bindTags(tags, taskId) {
    const that = this;
    const tagOptions = [];
    const tagSelect = [];

    tags.forEach(tag => {
      tagOptions.push({ text: tag.tagName, id: tag.tagID, color: tag.color });
      tagSelect.push(tag.tagID);
    });

    $('.taskTagBox:last').html(
      '<input type="text" class="taskTagList" value="" tabIndex="-1" style="display: none;" />',
    );

    selectizeLib = $('.taskTagList:last').selectize({
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
      options: tagOptions,
      items: tagSelect,
      preload: 'focus',
      render: {
        option(data, escape) {
          return (
            '<div class="option"><span class="tagsIcon" style="background:' +
            (data.color || 'transparent') +
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
        that.getTags(keywords, callback);
      },
      onItemAdd(tagID, $item) {
        const tagName = $item.find('.tagName').text();
        const callback = data => {
          if (data) {
            if (!tagID) {
              selectizeLib[0].selectize.updateOption('createNewTagsID', {
                id: data.id,
                text: data.value,
                color: data.extra,
              });
            }
          } else {
            selectizeLib[0].selectize.removeOption(tagID || 'createNewTagsID');
          }
        };

        that.props.dispatch(addTaskTag(taskId, tagID, tagName, callback));
      },
      onDelete(tagID) {
        $('.taskTagList .selectize-input input:last').blur();

        that.props.dispatch(
          removeTasksTag(taskId, tagID[0], () => {
            const selectize = selectizeLib[0].selectize;
            selectize.addOption([selectize.options[tagID[0]]]);
          }),
        );
      },
    });
  }

  /**
   * 获取标签
   */
  getTags(keywords, callback) {
    const { taskId } = this.props;
    const { data } = this.props.taskDetails[taskId];
    const selectTags = data.tags.map(tag => tag.tagID);

    ajaxRequest.getTagsByTaskID({ taskID: taskId, keywords }).then(source => {
      const selectize = selectizeLib[0].selectize || {};

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
  }

  /**
   * 取消上传附件
   */
  cancelAttachment = () => {
    this.setState({
      disabled: false,
      attachmentData: [],
      kcAttachmentData: [],
    });
  };

  /**
   * 添加附件
   */
  addTaskAttachments = () => {
    const { taskId } = this.props;
    const { isComplete, disabled, attachmentData, kcAttachmentData } = this.state;

    // 附件是否上传完成
    if (!isComplete) {
      alert(_l('文件上传中，请稍等'), 3);
      return;
    }

    if (disabled) {
      return;
    }

    this.props.dispatch(addTaskAttachments(taskId, attachmentData, kcAttachmentData, this.cancelAttachment));
    this.setState({ disabled: true });
  };

  /**
   * 删除附件
   */
  deleteAttachmentData = data => {
    const { taskId } = this.props;
    this.props.dispatch(deleteAttachmentData(taskId, data));
  };

  /**
   * 编辑描述
   */
  updateTaskSummary = summary => {
    const { taskId } = this.props;
    const { data } = this.props.taskDetails[taskId];

    if (data.summary !== summary) {
      this.props.dispatch(updateTaskSummary(taskId, summary));
    }

    // this.setState({ isEditing: false });
  };

  render() {
    const { taskName, showTags, showAttachment, attachmentData, kcAttachmentData, isEditing } = this.state;
    const { taskId } = this.props;
    const { data } = this.props.taskDetails[taskId];
    const hasAuth = data.auth === config.auth.Charger || data.auth === config.auth.Member;

    return (
      <Fragment>
        {data.sourceId && (
          <div className="fromWhere flexRow">
            <i className={cx('mRight10 Font16', FROM_TYPE[data.sourceType].icon)} />
            <span className="ThemeColor3 pointer" onClick={() => this.openDetail(data.sourceType, data.sourceId)}>
              {FROM_TYPE[data.sourceType].text}
            </span>
          </div>
        )}
        <div className="taskContentBox taskContentBasicBox">
          {this.renderFolder()}
          <ul className="parentTaskList">
            {data.ancestors.map((item, i) =>
              this.renderParentItem(item, i, hasAuth && i === data.ancestors.length - 1),
            )}
          </ul>
          <div className="flexRow mTop15">
            <span className="chargeAvatar" onClick={evt => hasAuth && this.clickChargeAvatar(evt)}>
              <UserHead
                className={cx({ gray: data.charge.status !== 1 }, { opacity6: data.status })}
                user={{
                  userHead: data.charge.avatar,
                  accountId: data.charge.accountID,
                }}
                size={32}
                operation={hasAuth ? this.renderChargeOpHtml() : null}
              />
            </span>
            <Textarea
              disabled={!hasAuth}
              className="flex detailTaskName"
              minHeight={24}
              maxLength={100}
              value={taskName}
              spellCheck={false}
              onChange={value => this.setState({ taskName: value.replace(/[\r\n]/, '') })}
              onKeyDown={this.updateTaskNameKeyDown}
              onBlur={this.updateTaskName}
            />
            <span
              className="detailStar tip-bottom-left"
              data-tip={data.star ? _l('移除星标') : _l('添加星标')}
              onClick={this.updateTaskMemberStar}
            >
              <i className={data.star ? 'icon-task-star' : 'icon-star-hollow'} />
            </span>
          </div>
          <div className="taskContentBoxBG mTop10">
            <div className="detailSummary">
              <i
                className="icon-edit taskContentIcon Hand"
                onClick={() => {
                  hasAuth && this.setState({ isEditing: true });
                }}
              />
              {!isEditing ? (
                <RichText
                  id={taskId}
                  className="taskDetailEdit"
                  dropdownPanelPosition={{ right: 'initial' }}
                  data={data.summary}
                  disabled={true}
                  minHeight={40}
                  maxHeight={500}
                  placeholder={hasAuth ? _l('添加描述') : _l('未添加描述')}
                  onClickNull={e => {
                    hasAuth &&
                      this.setState({
                        isEditing: true,
                      });
                  }}
                />
              ) : (
                <RichText
                  id={taskId}
                  maxWidth={550}
                  data={data.summary || ''}
                  onSave={this.updateTaskSummary}
                  className={cx('taskDetailEdit appIntroDescriptionEditor')}
                  maxHeight={500}
                  dropdownPanelPosition={{ right: 'initial' }}
                />
              )}
            </div>
            <div className="detailAtts">
              <i className="icon-ic_attachment_black taskContentIcon" />
              <div>
                {!hasAuth && !data.attachments.length && <span className="detailAttsNull">{_l('无上传附件')}</span>}
                {hasAuth && (
                  <UploadFilesTrigger
                    canAddLink
                    minWidth={130}
                    onUploadComplete={isComplete => this.setState({ isComplete })}
                    temporaryData={attachmentData}
                    kcAttachmentData={kcAttachmentData}
                    onTemporaryDataUpdate={res => this.setState({ attachmentData: res })}
                    onKcAttachmentDataUpdate={res => this.setState({ kcAttachmentData: res })}
                    getPopupContainer={() => document.querySelector('.taskDetailContent .nano-content')}
                    onCancel={this.cancelAttachment}
                    onOk={this.addTaskAttachments}
                  >
                    <span className="detailAttsBtn ThemeColor3">{_l('添加附件')}</span>
                  </UploadFilesTrigger>
                )}

                <UploadFiles
                  isUpload={false}
                  isDeleteFile={hasAuth}
                  showAttInfo={false}
                  attachmentData={data.attachments}
                  onDeleteAttachmentData={this.deleteAttachmentData}
                />
              </div>
            </div>
            <div className={cx('detailTaskLable', { Hidden: !showTags })}>
              <i className="icon-task-label taskContentIcon" />
              <div className="w100 taskTagBox" />
            </div>
            <div className="taskMembers">
              <span className="taskContentIcon tip-bottom-right" data-tip={_l('任务参与者')}>
                <i className="icon-group" />
              </span>
              <div className="membersList">
                {data.member.map((item, i) => this.renderMemberItem(item, i, hasAuth))}
                {hasAuth && (
                  <span
                    className="ThemeColor3 detailAddMember"
                    data-tip={_l('添加任务参与者')}
                    onClick={this.addMembers}
                  >
                    <i className="icon-task-add-member-circle" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default connect(state => state.task)(TaskBasic);
