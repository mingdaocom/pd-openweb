import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Icon, Dropdown, Dialog } from 'ming-ui';
import GeneralSelect from './GeneralSelect';
import { browserIsMobile } from 'src/util';
import NoData from './GeneralSelect/NoData';
import functionWrap from 'ming-ui/components/FunctionWrap';

import './index.less';
import _ from 'lodash';

// dataRange枚举(0:所有联系人, 1: 好友, 2:网络用户,3:其他协作---7.7版本移除 )
const dataRangeTypes = {
  all: 0,
  friend: 1,
  project: 2,
};

class DialogSelectUser extends Component {
  constructor(props) {
    super(props);
    const { SelectUserSettings: { projectId = '', dataRange = 0, filterProjectId } = {} } = props;
    this.state = {
      dataRange: filterProjectId ? dataRange : projectId ? 2 : dataRange,
      projectId: filterProjectId ? '' : projectId,
    };
  }

  componentDidMount() {
    const dropLists = this.initDropList();
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
  }

  /**
   * 获取下拉列表(全部联系人、好友、网络等)
   */
  initDropList = () => {
    const { SelectUserSettings = {} } = this.props;
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
    if (md.global.Account && md.global.Account.projects) {
      for (let i = 0, length = md.global.Account.projects.length; i < length; i++) {
        const item = md.global.Account.projects[i];
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

    return list;
  };

  /**
   * 通讯录网络切换
   */
  renderHeader = () => {
    const list = this.initDropList();
    const { SelectUserSettings = {} } = this.props;
    const { dataRange, projectId } = this.state;
    const value =
      projectId && _.find(md.global.Account.projects, project => project.projectId === projectId)
        ? projectId
        : dataRange;

    return (
      <div className="dialogSelectTitleContainer">
        <Icon icon="topbar-addressList" className="Font16 ThemeColor3" />
        <Dropdown
          data={list}
          value={value}
          maxHeight={500}
          currentItemClass="selectMenuItem"
          disabled={SelectUserSettings.filterOtherProject}
          onChange={value => {
            const isProjectId = !_.includes([dataRangeTypes.all, dataRangeTypes.friend], value);
            this.setState({
              dataRange: isProjectId ? dataRangeTypes.project : value,
              projectId: isProjectId ? (_.find(md.global.Account.projects, { projectId: value }) ? value : '') : '',
            });
          }}
        />
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
    const { projectId, dataRange } = this.state;

    if (settings.projectId !== projectId || settings.dataRange !== dataRange) {
      settings.projectId = projectId;
      settings.dataRange = dataRange;
    }

    const commonSettings = {
      projectId: projectId,
      dataRange: dataRange || 0,
      isSuperWork:
        projectId &&
        (_.find(md.global.Account.projects, project => project.projectId === projectId) || {}).isSuperAdmin &&
        fromAdmin,
      callback: data => {
        this.props.onCancel();
      },
    };

    const userSettings = {
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
      callback: (users, departments, group) => {
        settings.callback && settings.callback(users, departments, group);
        this.props.onCancel();
      },
    };

    // 外部协作任何网络、联系人、好友都没有
    if (
      settings.filterAll &&
      settings.filterFriend &&
      settings.filterOtherProject &&
      projectId &&
      !_.find(md.global.Account.projects, project => project.projectId === projectId)
    ) {
      return (
        <div className="GSelect-box">
          <NoData>{_l('您的账号不是该组织成员')}</NoData>
        </div>
      );
    }

    return (
      <GeneralSelect
        chooseType={chooseType}
        commonSettings={commonSettings}
        userSettings={userSettings}
        departmentSettings={SelectDepartmentSettings}
        groupSettings={SelectGroupSettings}
        isChat={isChat}
        handleCancel={this.props.onCancel}
      />
    );
  };

  render() {
    const { dialogProps, visible } = this.props;
    const windowHeight = window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;
    return (
      <Dialog
        {...dialogProps}
        visible={visible}
        title={this.renderHeader()}
        footer={null}
        onCancel={this.props.onCancel}
      >
        <div
          className="dialogSelectUserContainer"
          id="dialogBoxSelectUser"
          style={{ height: `${windowHeight - 160}px` }}
        >
          {this.renderContent()}
        </div>
      </Dialog>
    );
  }
}

export default (function ($) {
  $.fn.dialogSelectUser = function (opts) {
    let DEFAULTS = {
      SelectUserSettings: {
        includeUndefinedAndMySelf: false,
        includeSystemField: false,
        filterSystemAccountId: [],
        projectId: '', // 默认取哪个网络的用户 为空则表示默认加载全部
        filterProjectId: '', // 过滤哪个网络的用户
        filterAll: false, // 过滤全部
        filterFriend: false, // 是否过滤好友
        filterAccountIds: [], // 过滤指定的用户
        prefixAccountIds: [], // 指定置顶的用户
        filterOtherProject: false, // 当对于 true,projectId不能为空，指定只加载某个网络的数据
        dataRange: 0, // reference to dataRangeTypes 和 projectId 配合使用
        unique: false, // 是否只可以选一个
        callback: function (data) {},
      },
    };

    if (opts.SelectUserSettings) {
      opts.SelectUserSettings = _.extend(DEFAULTS.SelectUserSettings, opts.SelectUserSettings);
    }

    const options = _.extend({}, DEFAULTS, opts);

    const dialogProps = {
      width: 640,
      oneScreen: false,
      oneScreenGap: 240,
      className: browserIsMobile() ? 'mobileSelectUser' : '',
      overlayClosable: opts.overlayClosable,
    };

    functionWrap(DialogSelectUser, { ...options, dialogProps });
  };
})(jQuery);
