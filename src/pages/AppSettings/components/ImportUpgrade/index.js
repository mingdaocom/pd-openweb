import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import appManagementAjax from 'src/api/appManagement';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { VersionProductType } from 'src/utils/enum';
import { dateConvertToUserZone, getFeatureStatus } from 'src/utils/project';
import AppSettingHeader from '../AppSettingHeader';
import EmptyStatus from '../EmptyStatus';
import UpgradeProcess from './components/UpgradeProcess';

const LogsWrap = styled.div`
  overflow: auto;
  .logsItem {
    height: 85px;
    display: flex;
    padding-top: 20px;
    border-bottom: 1px solid #eaeaea;
    .avatar {
      width: 24px;
      height: 24px;
      margin-right: 5px;
      border-radius: 50%;
    }
  }
  .Gray_a4 {
    color: #a4a4a4;
  }
`;

export default class AppImportUpgrade extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showUpgradeProcess: false,
      logList: [],
    };
  }
  componentDidMount() {
    this.getUpgradeLogs();
  }
  renderEmpty = () => {
    return (
      <EmptyStatus
        icon="unarchive"
        radiusSize={130}
        iconClassName="Font50 Gray_9e"
        emptyTxt={_l('暂无升级记录')}
        emptyTxtClassName="Font17 Gray_bd mTop15"
      />
    );
  };

  getUpgradeLogs = () => {
    this.setState({ loading: true });
    const { appId } = this.props;
    appManagementAjax
      .getUpgradeLogs({
        appId,
      })
      .then(data => {
        this.setState({ loading: false, logList: data });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };
  clickImportUpgrade = () => {
    const { projectId } = this.props;
    const featureType = getFeatureStatus(projectId, VersionProductType.appBackupRestore);

    if (featureType === '2') {
      buriedUpgradeVersionDialog(projectId, VersionProductType.appBackupRestore);
      return;
    }
    this.setState({ showUpgradeProcess: true });
  };
  render() {
    const { projectId, data } = this.props;
    const { showUpgradeProcess, loading, logList } = this.state;

    return (
      <Fragment>
        <AppSettingHeader
          title={_l('导入升级')}
          addBtnName={_l('导入升级')}
          description={_l('导入单个应用文件，实现对当前应用快速升级，升级中的应用将为不可用状态')}
          link="https://help.mingdao.com/application/upgrade"
          handleAdd={this.clickImportUpgrade}
        />
        {!loading && !_.isEmpty(logList) ? (
          <LogsWrap>
            {logList.map(item => {
              const { fileName, createTime, creater = {} } = item;
              return (
                <div className="logsItem">
                  <img className="avatar" src={creater.avatar} />
                  <div className="flex flexColumn pTop2">
                    <div className="Gray_a4 mBottom8">{_l(`${creater.fullName} 操作导入升级`)}</div>
                    <div>{fileName}</div>
                  </div>
                  <div className="Gray_a4 Font12 mRight20 pTop2">
                    {createTimeSpan(dateConvertToUserZone(createTime))}
                  </div>
                </div>
              );
            })}
          </LogsWrap>
        ) : (
          this.renderEmpty()
        )}
        {showUpgradeProcess && (
          <UpgradeProcess
            projectId={projectId}
            appDetail={data}
            onCancel={() => this.setState({ showUpgradeProcess: false })}
          />
        )}
      </Fragment>
    );
  }
}
