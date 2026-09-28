import React, { Component, createRef } from 'react';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Dropdown, Modal } from 'ming-ui/antd-components';
import { PERMISSION_ENUM } from 'src/utils/domain/security/permission';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { getCurrentProject } from 'src/utils/services/project';
import { checkPermission } from 'src/utils/services/security/permission';
import GeneralSelect from './GeneralSelect';
import NoData from './GeneralSelect/NoData';
import './index.less';

// dataRange枚举(0:所有联系人, 1: 好友, 2:网络用户,3:其他协作---7.7版本移除 )
const dataRangeTypes = {
  all: 0,
  friend: 1,
  project: 2,
};
const getDefaultSelectUserSettings = () => ({
  includeMySelf: true,
  includeUndefinedAndMySelf: false,
  includeSystemField: false,
  filterSystemAccountId: [],
  projectId: '',
  filterProjectId: '',
  filterAll: false,
  filterFriend: false,
  filterAccountIds: [],
  prefixAccountIds: [],
  filterOtherProject: false,
  dataRange: 0,
  unique: false,
  selectedAccountIds: [],
  hideOftenUsers: false,
  hideManageOftenUsers: false,
  callback: function () {},
});

const getSelectUserOptions = (options = {}) => ({
  ...options,
  SelectUserSettings: {
    ...getDefaultSelectUserSettings(),
    ...options.SelectUserSettings,
  },
});

const getDialogProps = (options = {}) => ({
  width: 640,
  zIndex: options.zIndex,
  className: browserIsMobile() ? 'mobileSelectUser' : '',
  mask: { closable: options.overlayClosable === true },
});

class DialogSelectUser extends Component {
  constructor(props) {
    super(props);
    const { SelectUserSettings: { projectId = '', dataRange = 0, filterProjectId } = {} } = props;
    this.state = {
      dataRange: filterProjectId ? dataRange : projectId ? 2 : dataRange,
      projectId: filterProjectId ? '' : projectId,
      currentProject: getCurrentProject(projectId, true),
    };
  }

  componentDidMount() {
    this.initDropList();
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this.focusSearchInputFrame);
  }

  focusSearchInput = () => {
    window.cancelAnimationFrame(this.focusSearchInputFrame);
    this.focusSearchInputFrame = window.requestAnimationFrame(() => {
      this.generalSelect?.focusSearchInput();
    });
  };

  getSettings = (dropLists = []) => {
    const { SelectUserSettings: { filterAll, filterFriend } = {} } = this.props;
    let settings = {};

    if (filterAll && filterFriend) {
      settings.dataRange = dataRangeTypes.project;
      if (!this.state.projectId) {
        settings.projectId = (dropLists[0] || {}).value;
      }
    }

    if (!_.isEmpty(settings)) {
      this.setState({ ...settings });
    }
  };

  /**
   * 获取下拉列表(全部联系人、好友、网络等)
   */
  initDropList = async () => {
    const { SelectUserSettings = {}, projectId } = this.props;
    const { currentProject } = this.state;
    let list = [];

    if (!SelectUserSettings.filterAll) {
      list.push({
        value: dataRangeTypes.all,
        text: _l('全部联系人'),
      });
    }

    if (!SelectUserSettings.filterFriend) {
      list.push({
        value: dataRangeTypes.friend,
        text: _l('好友'),
      });
    }

    let projects = md.global.Account.projects;

    if (md.global.Account && projects) {
      for (let i = 0, length = projects.length; i < length; i++) {
        const item = projects[i];

        // 过滤某个
        if (
          SelectUserSettings.filterProjectId &&
          SelectUserSettings.filterProjectId.toLowerCase() == item.projectId.toLowerCase()
        ) {
          continue;
        }

        // 过滤除某个之外的所有
        if (
          SelectUserSettings.filterOtherProject &&
          SelectUserSettings.projectId.toLowerCase() != item.projectId.toLowerCase()
        ) {
          continue;
        }

        list.push({
          value: item.projectId,
          text: item.companyName,
        });
      }
    }

    if (!_.find(list, l => l.value === projectId) && currentProject.projectStatus === 2) {
      list.push({
        value: currentProject.projectId,
        text: currentProject.companyName,
      });
    }

    this.getSettings(list);
    this.setState({ list });
  };

  /**
   * 通讯录网络切换
   */
  renderHeader = () => {
    const { SelectUserSettings = {} } = this.props;
    const { dataRange, projectId, list = [], currentProject } = this.state;
    const curValue = projectId && currentProject ? projectId : dataRange;
    const currentItem = _.find(list, item => item.value === curValue);

    return (
      <div className="dialogSelectTitleContainer">
        <Icon icon="topbar-addressList" className="Font16 colorPrimary" />
        <Dropdown
          disabled={SelectUserSettings.filterOtherProject}
          trigger={['click']}
          menu={{
            items: list.map(item => ({ key: String(item.value), label: item.text })),
            selectable: true,
            selectedKeys: [String(curValue)],
            style: { width: 300, maxHeight: 500, overflowY: 'auto', overflowX: 'hidden' },
            onClick: ({ key }) => {
              const item = _.find(list, option => String(option.value) === key);
              const value = item?.value;

              if (!item || value === curValue) return;

              const isProjectId = !_.includes([dataRangeTypes.all, dataRangeTypes.friend], value);
              this.setState({
                dataRange: isProjectId ? dataRangeTypes.project : value,
                projectId: isProjectId ? (_.find(md.global.Account.projects, { projectId: value }) ? value : '') : '',
              });
            },
          }}
        >
          <span className="dialogSelectDropdownTrigger">
            <span className="value overflow_ellipsis">{currentItem?.text || _l('请选择')}</span>
            {!SelectUserSettings.filterOtherProject && (
              <Icon icon="arrow-down-border" className="mLeft8 textTertiary" />
            )}
          </span>
        </Dropdown>
      </div>
    );
  };

  /**
   * 内容
   */
  renderContent = () => {
    const {
      isChat,
      chooseType,
      SelectDepartmentSettings,
      SelectGroupSettings,
      fromAdmin = false,
      SelectUserSettings: settings,
    } = this.props;
    const { projectId, dataRange, currentProject } = this.state;

    if (settings.projectId !== projectId || settings.dataRange !== dataRange) {
      settings.projectId = projectId;
      settings.dataRange = dataRange;
    }

    const commonSettings = {
      projectId: projectId,
      dataRange: dataRange || 0,
      isSuperWork:
        fromAdmin && projectId && !_.get(window, 'isPublicApp') && checkPermission(projectId, PERMISSION_ENUM.MEMBER),
      callback: () => {
        this.props.onCancel();
      },
    };

    const userSettings = {
      includeMySelf: settings.includeMySelf,
      includeUndefinedAndMySelf: settings.includeUndefinedAndMySelf,
      includeSystemField: settings.includeSystemField,
      filterSystemAccountId: settings.filterSystemAccountId,
      unique: settings.unique,
      filterAll: settings.filterAll,
      filterProjectId: settings.filterProjectId,
      filterFriend: settings.filterFriend,
      filterResigned: settings.filterResigned,
      filterAccountIds: settings.filterAccountIds,
      prefixAccountIds: settings.prefixAccountIds,
      showTabs: settings.showTabs,
      extraTabs: settings.extraTabs,
      selectedAccountIds: settings.selectedAccountIds,
      hideResignedTab: settings.hideResignedTab,
      hideOftenUsers: settings.hideOftenUsers,
      hideManageOftenUsers: settings.hideManageOftenUsers,
      callback: (users, departments, group) => {
        settings.callback && settings.callback(users, departments, group);
        this.props.onCancel();
      },
    };

    // 外部协作任何网络、联系人、好友都没有
    if (settings.filterAll && settings.filterFriend && settings.filterOtherProject && projectId && !currentProject) {
      return (
        <div className="GSelect-box">
          <NoData>{_l('您的账号不是该组织成员')}</NoData>
        </div>
      );
    }

    return (
      <GeneralSelect
        ref={generalSelect => {
          this.generalSelect = generalSelect;
        }}
        chooseType={chooseType}
        commonSettings={commonSettings}
        userSettings={userSettings}
        departmentSettings={SelectDepartmentSettings}
        groupSettings={SelectGroupSettings}
        isChat={isChat}
        handleCancel={this.props.onCancel}
        dialogSelectUser={dialogSelectUser}
      />
    );
  };

  render() {
    const windowHeight = window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;

    return (
      <React.Fragment>
        <div className="dialogSelectUserInfoTitle mBottom10">{this.renderHeader()}</div>
        <div
          className="dialogSelectUserContainer"
          id="dialogBoxSelectUser"
          style={{ height: `${windowHeight - 160}px` }}
        >
          {this.renderContent()}
        </div>
      </React.Fragment>
    );
  }
}

export function dialogSelectUser(options = {}) {
  const selectUserOptions = getSelectUserOptions(options);
  const dialogProps = getDialogProps(options);
  const dialogRef = createRef();
  let modal;
  const handlePopState = () => modal.destroy();

  const handleCancel = (...args) => {
    modal.destroy();

    if (_.isFunction(options.onCancel)) {
      options.onCancel(...args);
    }
  };

  modal = Modal.info({
    ...dialogProps,
    afterOpenChange: open => {
      if (open) dialogRef.current?.focusSearchInput();
    },
    afterClose: () => window.removeEventListener('popstate', handlePopState),
    centered: true,
    footer: null,
    title: null,
    content: <DialogSelectUser {...selectUserOptions} ref={dialogRef} onCancel={handleCancel} />,
    onCancel: () => {
      if (_.isFunction(options.onCancel)) {
        options.onCancel();
      }
    },
  });

  window.addEventListener('popstate', handlePopState);

  return modal;
}

export default dialogSelectUser;
