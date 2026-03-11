import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import { navigateTo } from 'src/router/navigateTo';
import AppList from './AppList';
import { tabData } from './constant';
import ExportRecords from './ExportRecords';
import AppAction from './modules/AppAction';
import UpgradeRecords from './UpgradeRecords';
import './index.less';

export default class AppManagement extends Component {
  constructor(props) {
    super(props);
    const savedTotalNum = localStorage.getItem('appListTotalNum');
    this.state = {
      currentTab: 'list',
      listTotalNum: savedTotalNum ? Number(savedTotalNum) : 0,
    };
  }

  componentDidMount() {
    const { type } = _.get(this.props, 'match.params');
    this.setState({ currentTab: type || 'list' });
    if (this.appListRef && this.appListRef.getAppList) {
      this.appListRef.getAppList();
    }
  }

  componentDidUpdate(prevProps) {
    const { type: prevType } = _.get(prevProps, 'match.params');
    const { type } = _.get(this.props, 'match.params');
    if (prevType !== type) {
      this.setState({ currentTab: type || 'list' });
    }
  }

  render() {
    const { currentTab, listTotalNum } = this.state;
    const { projectId } = _.get(this.props, 'match.params');

    return (
      <div className="orgManagementWrap appManagementList flex">
        <AdminTitle prefix={_l('应用')} />
        <div className="orgManagementHeader">
          <div className="tabBox">
            {window.platformENV.isLocal && !window.platformENV.isOverseas && !window.platformENV.isPlatform
              ? tabData.map(item => {
                  return (
                    <span
                      key={item.key}
                      className={cx('tabItem Hand', { active: currentTab === item.key })}
                      onClick={() => {
                        this.setState({ currentTab: item.key });
                        navigateTo(`/admin/app/${projectId}/${item.key}`);
                      }}
                    >
                      {item.label}
                      {item.key === 'list' && listTotalNum ? `（${listTotalNum}）` : ''}
                    </span>
                  );
                })
              : _l('应用')}
          </div>
          <div className="flex"></div>
          {currentTab === 'list' && (
            <AppAction
              projectId={projectId}
              updateExportIds={this.appListRef ? this.appListRef.handleExport : () => {}}
              updateList={this.appListRef ? this.appListRef.updateState : () => {}}
            />
          )}
        </div>
        <AppList
          className={currentTab === 'list' ? '' : 'hide'}
          ref={ele => (this.appListRef = ele)}
          projectId={projectId}
          queryString={this.props.location.search && this.props.location.search.slice(1)}
          updateListTotalNum={num => {
            this.setState({ listTotalNum: num });
            localStorage.setItem('appListTotalNum', num);
          }}
        />
        {currentTab === 'export' && <ExportRecords projectId={projectId} type="export" />}
        {currentTab === 'upgrade' && <UpgradeRecords projectId={projectId} type="upgrade" />}
      </div>
    );
  }
}
