import React, { Component } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import Config from '../config';
import AppAndWorksheetLog from './components/AppAndWorksheetLog';

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

  render() {
    const { appId, projectId, worksheetId } = _.get(this.props, 'match.params') || '';

    return (
      <AppLogWrap className="orgManagementWrap h100">
        {!appId && <AdminTitle prefix={_l('日志 - 应用')} />}

        <AppAndWorksheetLog projectId={appId ? projectId : Config.projectId} appId={appId} worksheetId={worksheetId} />
      </AppLogWrap>
    );
  }
}
