import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Button, Icon, Tooltip, UserHead, UserName } from 'ming-ui';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import actionLogAjax from 'src/api/actionLog';
import downloadAjax from 'src/api/download';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import RegExpValidator from 'src/utils/expression';
import { dateConvertToUserZone } from 'src/utils/project';
import PageTableCon from '../components/PageTableCon';
import SearchWrap from '../components/SearchWrap';
import Config from '../config';
import { LOGIN_FAIL_REASON, LOGIN_LOG_COLUMNS } from './enum';

const LoginLogWrap = styled.div`
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
  .flexWrap {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
`;

const PAGE_SIZE = 50;
export default class LoginLog extends Component {
  constructor(props) {
    const columns = LOGIN_LOG_COLUMNS.filter(
      v => md.global.Config.IsLocal || location.href !== 'www.mingdao.com' || v.dataIndex !== 'failReason',
    );
    super(props);
    this.state = {
      count: 0, // 数据总数
      searchValues: {},
      showColumns: columns.map(it => it.dataIndex),
      disabledExportBtn: false,
    };
    this.columns = columns.map(item => {
      return {
        width: 150,
        ellipsis: true,
        ...item,
        render: (text, record = {}) => {
          let { log = {}, date } = record;
          const {
            logType,
            browserName,
            browserVersion,
            systemInfo,
            systemVersion,
            geoCity,
            atitudeLongitude,
            platform,
            deviceModel,
            deviceId,
            imei,
          } = log;
          switch (item.dataIndex) {
            case 'accountId':
              if (!log.accountId) {
                return (
                  <Tooltip text={log.fullname}>
                    <span>
                      {dealMaskValue({
                        value: log.fullname,
                        advancedSetting: { datamask: '1', masktype: RegExpValidator.isEmail(log.fullname) ? '3' : '2' },
                      })}
                    </span>
                  </Tooltip>
                );
              }

              return (
                <div className="flexRow">
                  <UserHead
                    className="circle mRight8"
                    user={{
                      userHead: log.avatar,
                      accountId: log.accountId,
                    }}
                    size={24}
                    projectId={Config.projectId}
                  />
                  <UserName
                    className="Gray Font13 pLeft5 pRight10 pTop3 flex ellipsis"
                    user={{
                      userName: log.fullname,
                      accountId: log.accountId,
                    }}
                  />
                </div>
              );
            case 'date':
              return <span>{dateConvertToUserZone(date)}</span>;
            case 'loginVenue':
              return <span>{log.title || ''}</span>;
            case 'loginType':
              return (
                <span>
                  {(
                    [
                      {
                        label:
                          md.global.Config.IsLocal || location.href !== 'www.mingdao.com' ? _l('登录成功') : _l('登录'),
                        value: '1',
                      },
                      { label: _l('登出'), value: '2' },
                      { label: _l('登录失败'), value: '-1' },
                    ].find(it => it.value === logType) || { value: '-' }
                  ).label || _l('登录失败')}
                </span>
              );
            case 'failReason':
              return <span>{log.failReason}</span>;
            case 'ip':
              return <span>{log.ip || ''}</span>;
            case 'geoCity':
              return <span>{geoCity}</span>;
            case 'browserName':
              return <span>{browserName}</span>;
            case 'browserVersion':
              return <span>{browserVersion}</span>;
            case 'systemInfo':
              return <span>{systemInfo}</span>;
            case 'systemVersion':
              return <span>{systemVersion}</span>;
            case 'atitudeLongitude':
              return <span>{atitudeLongitude}</span>;
            case 'platform':
              return <span>{platform}</span>;
            case 'deviceModel':
              return <span>{deviceModel}</span>;
            case 'deviceId':
              return <span>{deviceId}</span>;
            case 'imei':
              return <span>{imei}</span>;
            default:
              return <span>{text}</span>;
          }
        },
      };
    });
  }

  componentDidMount() {
    this.getLogList({ pageIndex: 1, pageSize: 50 });
  }

  getLogList = (params = {}) => {
    this.setState({ loading: true, pageIndex: params.pageIndex });
    let { pageIndex = 1, pageSize = 50 } = params;
    const { searchValues } = this.state;
    const { loginLogOutDate = {}, selectUserInfo = [], logType = '', accountResult } = searchValues;
    const { startDate, endDate } = loginLogOutDate;
    let requestParams = {
      pageIndex,
      pageSize,
      projectId: Config.projectId,
      startDateTime: startDate ? startDate : moment().subtract(29, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
      endDateTime: endDate ? endDate : moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      logType, // ogin=1 logout=2
      accountIds: selectUserInfo.map(item => item.accountId),
      accountResult,
    };
    actionLogAjax.getActionLogs(requestParams).then(res => {
      const temp = _.get(res, ['data', 'list']) || [];
      this.setState({
        dataSource: temp,
        disabledExportBtn: _.isEmpty(temp) ? true : false,
        count: _.get(res, ['data', 'totalCount']) || 0,
        loading: false,
      });
    });
  };

  // 导出
  exportListData = (param = {}) => {
    this.setState({ disabledExportBtn: true });
    let { loginLogOutDate = {}, selectUserInfo = [], logType, accountResult } = this.state.searchValues || {};
    const { startDate, endDate } = loginLogOutDate;
    const { pageIndex } = this.state;
    const { pageSize = 50 } = param;
    let params = {
      pageIndex,
      pageSize,
      projectId: Config.projectId,
      startDateTime: startDate ? startDate : moment().subtract(29, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
      endDateTime: endDate ? endDate : moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      logType, // ogin=1 logout=2
      accountIds: selectUserInfo.map(item => item.accountId),
      accountResult,
      columnNames: this.columns.map(it => it.title),
      fileName: _l('登录日志'),
    };
    downloadAjax
      .exportLoginLog(params)
      .then(res => {
        this.setState({ disabledExportBtn: false });
        if (!res) {
          Confirm({
            title: _l('数据导出超过100,000行，本次仅导出前100,000行记录'),
            okText: _l('导出'),
            onOk: () => {
              downloadAjax.exportLoginLog({ ...params, confirmExport: true });
            },
          });
        }
      })
      .catch(err => {
        this.setState({ disabledExportBtn: false });
      });
  };

  render() {
    const { loading, dataSource = [], count = 0, disabledExportBtn, searchValues, pageIndex } = this.state;

    let searchList = [
      {
        type: 'selectUser',
        key: 'selectUserInfo',
        label: _l('用户'),
        suffixIcon: <Icon icon="person" className="Font16" />,
      },
      {
        type: 'selectTime',
        key: 'loginLogOutDate',
        label: _l('登录/登出时间'),
        placeholder: _l('登录/登出时间'),
        dateFormat: 'YYYY-MM-DD HH:mm:ss',
        suffixIcon: <Icon icon="person" className="Font16" />,
      },
      {
        type: 'select',
        key: 'logType',
        label: _l('登录类型'),
        placeholder: _l('全部'),
        allowClear: true,
        value: _.get(searchValues, 'logType'),
        options: [
          { label: _l('全部'), value: '' },
          {
            label: md.global.Config.IsLocal || location.href !== 'www.mingdao.com' ? _l('登录成功') : _l('登录'),
            value: 1,
          },
          { label: _l('登录失败'), value: -1 },
          { label: _l('登出'), value: 2 },
        ].filter(v => md.global.Config.IsLocal || location.href !== 'www.mingdao.com' || v.value !== -1),
      },
    ];

    if (searchValues.logType === -1) {
      searchList = searchList.concat({
        type: 'select',
        key: 'accountResult',
        label: _l('失败原因'),
        placeholder: _l('全部'),
        allowClear: true,
        options: LOGIN_FAIL_REASON,
      });
    }

    return (
      <LoginLogWrap className="orgManagementWrap">
        <AdminTitle prefix={_l('日志 - 登录')} />
        <div className="orgManagementHeader Font17 flexRow">
          <span className="flex">{_l('登录')}</span>
          <div>
            <span className="tipInfo mRight26">{_l('保留最近6个月的日志')}</span>
            <i
              className="icon-task-later Gray_9 hoverText mRight26 Font17"
              onClick={() => this.setState({ searchValues: {}, pageIndex: 1 }, this.getLogList)}
            />
            <Tooltip
              text={<span>{_l('导出上限10万条，超出限制可以先筛选，再分次导出。')}</span>}
              popupPlacement="bottom"
            >
              <Button
                type="primary"
                className="export"
                disabled={disabledExportBtn}
                onClick={() => {
                  if (disabledExportBtn) return;
                  this.exportListData();
                }}
              >
                {_l('导出')}
              </Button>
            </Tooltip>
          </div>
        </div>
        <div className="orgManagementContent pTop0 flexColumn">
          <div ref={ele => (this.seatchWrap = ele)}>
            <SearchWrap
              showExpandBtn={true}
              hideReset={true}
              projectId={Config.projectId}
              searchValues={searchValues}
              searchList={searchList}
              onChange={searchValues => {
                const obj = { ...this.state.searchValues, ...searchValues };
                this.setState(
                  {
                    searchValues: {
                      ...obj,
                      accountResult:
                        !_.isUndefined(searchValues.logType) && searchValues.logType !== -1
                          ? undefined
                          : obj.accountResult,
                    },
                    pageIndex: 1,
                  },
                  this.getLogList,
                );
              }}
            />
          </div>
          <div className="flexWrap">
            <PageTableCon
              className="logsTable"
              loading={loading}
              columns={this.columns}
              dataSource={dataSource}
              count={count}
              getDataSource={this.getLogList}
              moreAction={true}
              paginationInfo={{ pageIndex, pageSize: PAGE_SIZE }}
              getShowColumns={showColumns => this.setState({ showColumns })}
            />
          </div>
        </div>
      </LoginLogWrap>
    );
  }
}
