import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { UserCard } from 'ming-ui';
import { DatePicker, Input, Modal, Select } from 'ming-ui/antd-components';
import { UserSelectPopover } from 'ming-ui/functions/quickSelectUser';
import ajaxRequest from 'src/api/taskCenter';
import { expireDialogAsync } from 'src/components/upgradeVersion';
import UploadFiles from 'src/components/UploadFiles';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';

const FOLDER_PAGE_SIZE = 20;
const CREATE_FOLDER_VALUE = '__CREATE_TASK_FOLDER__';
const TASK_TIME_FORMAT = 'YYYY-MM-DD HH:00';
const TASK_TIME_SHOW_TIME = {
  defaultOpenValue: [moment('09:00', 'HH:mm'), moment('18:00', 'HH:mm')],
  format: 'HH',
  hideDisabledOptions: true,
};

const getUniqueFolders = folders => {
  const folderIds = new Set();

  return folders.filter(folder => {
    if (!folder?.folderID || folderIds.has(folder.folderID)) return false;

    folderIds.add(folder.folderID);
    return true;
  });
};

const getTaskUser = user => {
  if (!user) return null;

  const accountId =
    user.accountId ||
    user.accountID ||
    (user.account && user.fullname ? `${user.account}MD_SpecialAccounts${user.fullname}` : '');

  if (!accountId) return null;

  return {
    accountId,
    avatar: user.avatar || user.userHead,
    fullname: user.fullname || user.fullName,
  };
};

const getUniqueTaskUsers = (users, excludeAccountId) =>
  _.uniqBy((Array.isArray(users) ? users : []).map(getTaskUser).filter(Boolean), 'accountId').filter(
    user => user.accountId !== excludeAccountId,
  );

const isValidProject = projectId =>
  !!projectId && (md.global.Account.projects || []).some(project => project.projectId === projectId);

class TaskLocationSelect extends React.PureComponent {
  constructor(props) {
    super(props);

    const { settings } = props;
    this.state = {
      projectId: settings.ProjectID || '',
      folderId: settings.FolderID || '',
      folderName: settings.folderName || '',
      folders: [],
      searchValue: '',
      pageIndex: 1,
      isMore: false,
      loading: false,
      projectLoading: false,
      popupOpen: false,
    };
    this.folderRequestId = 0;
    this.projectRequestId = 0;
  }

  componentWillUnmount() {
    this.unmounted = true;
    window.clearTimeout(this.searchTimer);
  }

  clearStage = () => {
    this.props.onClearStage();
  };

  resetPeople = () => {
    this.props.onProjectChange();
  };

  applyProject = projectId => {
    const { settings } = this.props;

    settings.ProjectID = projectId;
    settings.FolderID = '';
    settings.folderName = '';
    this.folderRequestId += 1;
    window.clearTimeout(this.searchTimer);
    this.clearStage();
    this.resetPeople();
    this.setState(
      {
        projectId,
        folderId: '',
        folderName: '',
        folders: [],
        searchValue: '',
        pageIndex: 1,
        isMore: false,
        loading: false,
        projectLoading: false,
      },
      () => {
        if (this.state.popupOpen) {
          this.loadFolders();
        }
      },
    );
  };

  handleProjectChange = async projectId => {
    if (projectId === this.state.projectId) {
      this.projectRequestId += 1;
      this.setState({ projectLoading: false });
      return;
    }

    const requestId = ++this.projectRequestId;
    this.setState({ projectLoading: true });

    try {
      if (projectId) {
        await expireDialogAsync(projectId);
      }

      if (!this.unmounted && requestId === this.projectRequestId) {
        this.applyProject(projectId);
      }
    } catch {
      if (!this.unmounted && requestId === this.projectRequestId) {
        this.applyProject('');
      }
    }
  };

  loadFolders = ({ keyword = '', pageIndex = 1 } = {}) => {
    const requestId = ++this.folderRequestId;

    this.setState({ loading: true });
    ajaxRequest
      .getFolderListForCreateTask({
        projectId: this.props.settings.ProjectID,
        keyWords: keyword.trim(),
        pageSize: FOLDER_PAGE_SIZE,
        pageIndex,
      })
      .then(source => {
        if (!source.status) throw new Error();
        if (this.unmounted || requestId !== this.folderRequestId) return;

        const nextFolders = source.data || [];
        this.setState(state => ({
          folders: getUniqueFolders(pageIndex === 1 ? nextFolders : state.folders.concat(nextFolders)),
          pageIndex,
          isMore: nextFolders.length === FOLDER_PAGE_SIZE,
          loading: false,
        }));
      })
      .catch(_requestError => {
        if (this.unmounted || requestId !== this.folderRequestId) return;

        this.setState({ loading: false });
        alertIfNotUnauthorized(_requestError, _l('操作失败，请稍后再试'), 2);
      });
  };

  handleFolderSearch = searchValue => {
    if (!searchValue && this.preserveFolderOnEmptySearch) {
      this.preserveFolderOnEmptySearch = false;
      this.setState({ searchValue: '' });
      return;
    }

    this.preserveFolderOnEmptySearch = false;
    this.folderRequestId += 1;
    const folderName = searchValue.trim();
    const { settings } = this.props;

    const hadFolder = !!settings.FolderID;

    settings.FolderID = '';
    settings.folderName = folderName;
    this.clearStage();
    if (hadFolder) this.props.onFolderChange();
    window.clearTimeout(this.searchTimer);
    this.setState(
      {
        folderId: '',
        folderName,
        folders: [],
        searchValue,
        pageIndex: 1,
        isMore: false,
      },
      () => {
        this.searchTimer = window.setTimeout(() => this.loadFolders({ keyword: searchValue }), 300);
      },
    );
  };

  handleFolderChange = (value, option) => {
    if (value === undefined || value === null) {
      this.handleFolderClear();
      return;
    }

    const isCreate = value === CREATE_FOLDER_VALUE;
    const folderId = isCreate ? '' : value;
    const folderName = isCreate ? option.folderName : option.label;
    const { settings, onFolderSelect } = this.props;

    this.preserveFolderOnEmptySearch = true;
    settings.FolderID = folderId;
    settings.folderName = folderName;
    this.clearStage();
    this.setState({ folderId, folderName, searchValue: '' });
    this.props.onFolderChange();

    if (folderId) {
      onFolderSelect();
    }
  };

  handleFolderClear = () => {
    const { settings } = this.props;

    this.preserveFolderOnEmptySearch = false;
    this.folderRequestId += 1;
    window.clearTimeout(this.searchTimer);
    settings.FolderID = '';
    settings.folderName = '';
    this.clearStage();
    this.props.onFolderChange();
    this.setState({
      folderId: '',
      folderName: '',
      folders: [],
      searchValue: '',
      pageIndex: 1,
      isMore: false,
      loading: false,
    });
  };

  handleFolderPopupScroll = event => {
    const { isMore, loading, pageIndex, searchValue } = this.state;
    const { scrollHeight, scrollTop, offsetHeight } = event.target;

    if (isMore && !loading && scrollTop + offsetHeight + 30 >= scrollHeight) {
      this.loadFolders({ keyword: searchValue, pageIndex: pageIndex + 1 });
    }
  };

  handleFolderOpenChange = popupOpen => {
    this.setState({ popupOpen });

    if (popupOpen && !this.state.folders.length && !this.state.loading) {
      this.loadFolders();
    }
  };

  getFolderOptions = () => {
    const { folderId, folderName, folders, searchValue } = this.state;
    const options = folders.map(folder => ({
      value: folder.folderID,
      label: folder.folderName,
      folder,
    }));

    if (folderId && folderName && !options.some(option => option.value === folderId)) {
      options.unshift({ value: folderId, label: folderName });
    }

    const newFolderName = searchValue.trim() || (!folderId && folderName ? folderName : '');

    if (newFolderName) {
      options.unshift({
        value: CREATE_FOLDER_VALUE,
        label: newFolderName,
        folderName: newFolderName,
        isCreate: true,
      });
    }

    return options;
  };

  renderFolderOption = option => {
    const { folder, folderName, isCreate } = option.data;

    if (isCreate) {
      return <span className="colorPrimary">{_l('创建“%0”项目', folderName)}</span>;
    }

    if (!folder) return option.label;

    return (
      <div className="createTaskFolderOption flexRow alignItemsCenter">
        <img alt="" className="createTaskFolderCharge circle" src={folder.charge?.avatar} />
        <span className="flex minWidth0 ellipsis mLeft8">{folder.folderName}</span>
        <i className={`textTertiary mLeft8 icon-folder-${folder.visibility === 0 ? 'private' : 'public'}`} />
        {!!folder.taskNum && <span className="textTertiary mLeft8">{folder.taskNum}</span>}
      </div>
    );
  };

  render() {
    const { projectId, folderId, folderName, searchValue, loading, projectLoading } = this.state;
    const projects = md.global.Account.projects || [];
    const projectOptions = projects
      .map(project => ({ value: project.projectId, label: project.companyName, icon: 'business' }))
      .concat({ value: '', label: _l('个人'), icon: 'charger' });
    const folderValue = folderId || (folderName ? CREATE_FOLDER_VALUE : undefined);

    return (
      <React.Fragment>
        {!!projects.length && (
          <div className="createTaskFormRow boxSizing Font14 mTop0">
            <div className="createTaskLabel">{_l('归属')}</div>
            <Select
              className="w100"
              loading={projectLoading}
              optionFilterProp="label"
              options={projectOptions}
              showSearch
              value={projectId}
              optionRender={option => (
                <div className="flexRow alignItemsCenter">
                  <i className={`icon-${option.data.icon} mRight8`} />
                  <span className="ellipsis">{option.label}</span>
                </div>
              )}
              onChange={this.handleProjectChange}
            />
          </div>
        )}
        <div className="createTaskFormRow boxSizing Font14">
          <div className="createTaskLabel">{_l('项目')}</div>
          <Select
            allowClear
            className="w100"
            filterOption={false}
            loading={loading}
            optionRender={this.renderFolderOption}
            options={this.getFolderOptions()}
            placeholder={_l('未关联项目')}
            searchValue={searchValue}
            showSearch
            value={folderValue}
            onChange={this.handleFolderChange}
            onOpenChange={this.handleFolderOpenChange}
            onPopupScroll={this.handleFolderPopupScroll}
            onSearch={this.handleFolderSearch}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default class CreateTaskContent extends React.PureComponent {
  constructor(props) {
    super(props);

    const { settings } = props;
    const charge = getTaskUser(settings.ChargeArray[0]) || getTaskUser(md.global.Account);
    const members = getUniqueTaskUsers(settings.MemberArray, charge.accountId);
    const configuredDateRange =
      settings.StartTime && settings.Deadline ? [moment(settings.StartTime), moment(settings.Deadline)] : null;
    const validConfiguredDateRange = configuredDateRange?.every(date => date.isValid()) ? configuredDateRange : null;
    const dateRange = document.getElementById('taskGantt')
      ? [moment().startOf('day').hour(9), moment().startOf('day').hour(18)]
      : validConfiguredDateRange;

    this.state = {
      charge,
      members,
      taskName: settings.TaskName || '',
      description: settings.Description || '',
      dateRange,
      projectId: settings.ProjectID,
      folderId: settings.FolderID,
      stageOptions: [],
      stageValue: '',
      showStage: false,
      showMembers: false,
      showDate: false,
      showDescription: false,
    };
    this.stageRequestId = 0;
  }

  componentDidMount() {
    const { charge, dateRange, description, members, taskName } = this.state;

    this.syncTaskUsers(charge, members);
    this.syncTaskFields({ dateRange, description, taskName });
    this.props.settings.isComplete = true;

    if (this.props.settings.FolderID && this.props.settings.FolderID !== '1') {
      this.handleFolderSelect();
    }
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.stageRequestId += 1;
  }

  syncTaskUsers = (charge, members) => {
    const { settings } = this.props;

    settings.ChargeArray = [charge];
    settings.MemberArray = members;
  };

  syncTaskFields = ({ dateRange, description, taskName }) => {
    const { settings } = this.props;
    const [start, end] = dateRange || [];

    settings.TaskName = taskName;
    settings.Description = description;
    settings.StartTime = start ? start.format(TASK_TIME_FORMAT) : '';
    settings.Deadline = end ? end.format(TASK_TIME_FORMAT) : '';
  };

  handleProjectChange = () => {
    const charge = getTaskUser(md.global.Account);
    const { settings } = this.props;

    this.syncTaskUsers(charge, []);
    this.setState({
      charge,
      members: [],
      projectId: settings.ProjectID,
      folderId: '',
    });
  };

  handleFolderChange = () => {
    const { settings } = this.props;

    this.setState({ projectId: settings.ProjectID, folderId: settings.FolderID });
  };

  handleClearStage = () => {
    const { settings } = this.props;

    this.stageRequestId += 1;
    settings.StageID = '';
    settings.StageName = '';
    this.setState({ stageOptions: [], stageValue: '', showStage: false });
  };

  handleChargeSelect = users => {
    const nextCharge = getTaskUser(users[0]);
    const { charge, members } = this.state;

    if (!nextCharge || nextCharge.accountId === charge.accountId) return;

    const nextMembers = getUniqueTaskUsers(
      charge.accountId === 'user-undefined' ? members : [charge].concat(members),
      nextCharge.accountId,
    );

    this.syncTaskUsers(nextCharge, nextMembers);
    this.setState({ charge: nextCharge, members: nextMembers });
  };

  handleMemberSelect = users => {
    const { charge, members } = this.state;
    const nextMembers = getUniqueTaskUsers(members.concat(users || []), charge.accountId);

    this.syncTaskUsers(charge, nextMembers);
    this.setState({ members: nextMembers, showMembers: true });
  };

  handleRemoveMember = accountId => {
    const { charge, members } = this.state;
    const nextMembers = members.filter(member => member.accountId !== accountId);

    this.syncTaskUsers(charge, nextMembers);
    this.setState({ members: nextMembers });
  };

  handleFolderSelect = async () => {
    const { settings } = this.props;
    const currentFolderId = settings.FolderID;
    const preferredStageId = settings.StageID;
    const requestId = ++this.stageRequestId;

    try {
      const source = await ajaxRequest.getFolderStage({
        projectID: settings.ProjectID,
        folderID: currentFolderId,
      });

      if (!source.status) throw new Error();
      if (this.unmounted || requestId !== this.stageRequestId || currentFolderId !== settings.FolderID) return;

      const folderStages = source.data || [];
      const stageOptions = folderStages.map(stage => ({ label: stage.name, value: stage.id }));

      if (!stageOptions.length) {
        settings.StageID = '';
        settings.StageName = '';
        this.setState({ stageOptions: [], stageValue: '', showStage: false });
        return;
      }

      const currentStage = stageOptions.find(stage => stage.value === preferredStageId) || stageOptions[0];

      settings.StageID = currentStage.value;
      settings.StageName = currentStage.label;
      this.setState({
        stageOptions,
        stageValue: currentStage.value,
        showStage: folderStages.length > 1 || folderStages[0].name !== _l('进行中'),
      });
    } catch (_requestError2) {
      if (this.unmounted || requestId !== this.stageRequestId || currentFolderId !== settings.FolderID) return;

      settings.StageID = '';
      settings.StageName = '';
      this.setState({ stageOptions: [], stageValue: '', showStage: false });
      alertIfNotUnauthorized(_requestError2, _l('操作失败，请稍后再试'), 2);
    }
  };

  handleStageChange = (stageValue, option) => {
    const { settings } = this.props;

    settings.StageID = stageValue;
    settings.StageName = option.label;
    this.setState({ stageValue });
  };

  handleTaskNameChange = event => {
    const taskName = event.target.value;

    this.props.settings.TaskName = taskName;
    this.setState({ taskName });
  };

  handleDescriptionChange = event => {
    const description = event.target.value;

    this.props.settings.Description = description;
    this.setState({ description });
  };

  handleDateChange = dateRange => {
    const { settings } = this.props;

    if (!dateRange) {
      settings.StartTime = '';
      settings.Deadline = '';
      this.setState({ dateRange: null });
      return;
    }

    const [start, end] = dateRange;

    if (!start || !end) return;
    if (!end.isAfter(start)) {
      alert(_l('结束时间不能早于或等于开始时间'), 2);
      return;
    }

    settings.StartTime = start.format(TASK_TIME_FORMAT);
    settings.Deadline = end.format(TASK_TIME_FORMAT);
    this.setState({ dateRange });
  };

  getChargeSelectProps = () => {
    const { charge, folderId, projectId } = this.state;
    const selectedAccountIds = [charge.accountId];

    return {
      sourceId: folderId,
      projectId,
      includeUndefinedAndMySelf: true,
      selectedAccountIds,
      showMoreInvite: false,
      SelectUserSettings: {
        callback: this.handleChargeSelect,
        projectId: isValidProject(projectId) ? projectId : '',
        selectedAccountIds,
        unique: true,
      },
      onSelect: this.handleChargeSelect,
    };
  };

  getMemberSelectProps = () => {
    const { charge, members, projectId } = this.state;
    const selectedAccountIds = [charge].concat(members).map(user => user.accountId);

    return {
      sourceId: '',
      projectId,
      selectedAccountIds,
      SelectUserSettings: {
        callback: this.handleMemberSelect,
        projectId: isValidProject(projectId) ? projectId : '',
        selectedAccountIds,
      },
      onSelect: this.handleMemberSelect,
    };
  };

  renderMember = member => (
    <span className="imgMemberBox" data-id={member.accountId} key={member.accountId}>
      <UserCard sourceId={member.accountId} disabled={member.accountId === 'user-undefined'}>
        <span>
          <span className="removeTaskMember circle" onClick={() => this.handleRemoveMember(member.accountId)}>
            <i className="icon-delete Icon" />
          </span>
          <img
            alt={member.fullname || _l('任务参与者头像')}
            className="createTaskMember circle imgWidth"
            data-id={member.accountId}
            src={member.avatar}
          />
        </span>
      </UserCard>
    </span>
  );

  render() {
    const { settings, onSubmit } = this.props;
    const {
      charge,
      dateRange,
      description,
      members,
      showMembers,
      showDate,
      showDescription,
      showStage,
      stageOptions,
      stageValue,
      taskName,
    } = this.state;

    return (
      <div className="createTaskForm">
        <TaskLocationSelect
          settings={settings}
          onClearStage={this.handleClearStage}
          onFolderChange={this.handleFolderChange}
          onFolderSelect={this.handleFolderSelect}
          onProjectChange={this.handleProjectChange}
        />
        <div className="createTaskFormRow boxSizing Font14 createTaskTitle">
          <div className="createTaskLabel">{_l('名称')}</div>
          <Input
            autoFocus
            className="w100"
            id="txtTaskName"
            maxLength={100}
            placeholder={_l('请输入任务名称')}
            spellCheck={false}
            value={taskName}
            onChange={this.handleTaskNameChange}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onSubmit();
              }
            }}
          />
        </div>
        <div className="createTaskFormRow boxSizing Font14 taskUpdateChargeMain">
          <div className="createTaskLabel">{_l('负责人')}</div>
          <div className="createTaskAvatarControl">
            <UserCard sourceId={charge.accountId} disabled={charge.accountId === 'user-undefined'}>
              <span className="circle" data-id={charge.accountId} id="taskUserBox">
                <img alt={_l('负责人头像')} className="imgWidth" src={charge.avatar} />
              </span>
            </UserCard>
            <UserSelectPopover {...this.getChargeSelectProps()}>
              <span className="taskUpdateCharge icon-task-folder-charge pointer colorPrimary" />
            </UserSelectPopover>
          </div>
        </div>
        <div className={`createTaskFormRow boxSizing Font14 ${showMembers ? '' : 'Hidden'}`} id="taskMembersBox">
          <div className="createTaskLabel">{_l('任务参与者')}</div>
          <span className="createTaskAddMemberBox">
            {members.map(this.renderMember)}
            <UserSelectPopover {...this.getMemberSelectProps()}>
              <i className="icon-task-add-member-circle createTaskAddMember colorPrimary" />
            </UserSelectPopover>
          </span>
        </div>
        <div className={`createTaskFormRow boxSizing Font14 ${showDate ? '' : 'Hidden'}`} id="createTaskDate">
          <div className="createTaskLabel">{_l('起止时间')}</div>
          <DatePicker.RangePicker
            allowClear
            className="w100"
            format={TASK_TIME_FORMAT}
            inputReadOnly
            needConfirm
            placeholder={[_l('开始时间'), _l('结束时间')]}
            showNow={false}
            showTime={TASK_TIME_SHOW_TIME}
            value={dateRange}
            onChange={this.handleDateChange}
          />
        </div>
        <div className={`createTaskFormRow boxSizing Font14 ${showStage ? '' : 'Hidden'}`} id="createTaskStage">
          <div className="createTaskLabel">{_l('看板')}</div>
          <div className="createTaskControl">
            <Select className="w100" options={stageOptions} value={stageValue} onChange={this.handleStageChange} />
          </div>
        </div>
        <div className={`createTaskFormRow boxSizing Font14 ${showDescription ? '' : 'Hidden'}`} id="createTaskDesc">
          <div className="createTaskLabel">{_l('描述和附件')}</div>
          <div className="createTaskControl">
            <Input.TextArea
              autoSize={{ minRows: 1, maxRows: 3 }}
              placeholder={_l('填写描述…')}
              spellCheck={false}
              value={description}
              onChange={this.handleDescriptionChange}
            />
            <UploadFiles
              canAddLink
              kcAttachmentData={settings.createTaskAttachments.kcAttachmentData}
              temporaryData={settings.createTaskAttachments.attachmentData}
              onKcAttachmentDataUpdate={res => {
                settings.createTaskAttachments.kcAttachmentData = res;
              }}
              onTemporaryDataUpdate={res => {
                settings.createTaskAttachments.attachmentData = res;
              }}
              onUploadComplete={res => {
                settings.isComplete = res;
              }}
            />
          </div>
        </div>
        <div className="boxSizing taskTabs Font14" id="taskTabs">
          {!showMembers && (
            <span className="borderColorPrimary colorPrimary" onClick={() => this.setState({ showMembers: true })}>
              {_l('任务参与者')}
            </span>
          )}
          {!showDate && (
            <span className="borderColorPrimary colorPrimary" onClick={() => this.setState({ showDate: true })}>
              {_l('设置时间')}
            </span>
          )}
          {!showDescription && (
            <span className="borderColorPrimary colorPrimary" onClick={() => this.setState({ showDescription: true })}>
              {_l('描述和附件')}
            </span>
          )}
        </div>
      </div>
    );
  }
}

export class CreateTaskDialog extends React.PureComponent {
  state = { confirmLoading: false };

  componentWillUnmount() {
    this.unmounted = true;
  }

  handleSubmit = async () => {
    if (this.submitting) return false;

    this.submitting = true;
    this.setState({ confirmLoading: true });

    let success = false;

    try {
      success = await this.props.onSubmit();
      return success;
    } finally {
      if (!success && !this.unmounted) {
        this.submitting = false;
        this.setState({ confirmLoading: false });
      }
    }
  };

  render() {
    const { open, onAfterClose, onClose, settings } = this.props;

    return (
      <Modal
        open={open}
        afterOpenChange={nextOpen => {
          if (!nextOpen) onAfterClose?.();
        }}
        cancelText={_l('取消')}
        confirmLoading={this.state.confirmLoading}
        okText={_l('创建')}
        title={_l('创建任务')}
        width={570}
        className={`${settings.frameid} createTaskConfirm`}
        onCancel={onClose}
        onOk={this.handleSubmit}
      >
        <CreateTaskContent settings={settings} onSubmit={this.handleSubmit} />
      </Modal>
    );
  }
}
