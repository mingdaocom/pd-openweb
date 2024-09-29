import React, { Component } from 'react';
import AppAndWorksheetLog from './components/AppAndWorksheetLog';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import Config from '../config';
import styled from 'styled-components';

const AppLogWrap = styled.div`
  flex: 1;
  min-height: 0;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  .tipInfo {
    color: #212121;
    font-size: 13px;
    line-height: 36px;
    font-weight: 400;
  }
  .export {
    padding: 0 15px;
    min-width: 0;
  }
`;

export default class AppLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: localStorage.getItem('globalLogTab') ? +localStorage.getItem('globalLogTab') : 0,
      disabledExportBtn: false,
    };
  }
  componentDidMount() {}

  render() {
    const { appId, projectId } = _.get(this.props, 'match.params') || '';

    return (
      <AppLogWrap className="orgManagementWrap h100">
        {!appId && <AdminTitle prefix={_l('日志 - 应用')} />}

        <AppAndWorksheetLog projectId={appId ? projectId : Config.projectId} appId={appId} />
      </AppLogWrap>
    );
  }
}
