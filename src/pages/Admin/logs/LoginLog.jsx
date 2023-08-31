import React, { Component, Fragment } from 'react';
import { Icon, Button, Tooltip } from 'ming-ui';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import actionLogAjax from 'src/api/actionLog';
import downloadAjax from 'src/api/download';
import SearchWrap from '../components/SearchWrap';
import PageTableCon from '../components/PageTableCon';
import UserHead from 'src/pages/feed/components/userHead';
import UserName from 'src/pages/feed/components/userName';
import { LOGIN_LOG_COLUMNS } from './enum';
import Config from '../config';
import moment from 'moment';
import _ from 'lodash';
import styled from 'styled-components';

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
    width: 74px !important;
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
    const columns = LOGIN_LOG_COLUMNS;
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
        onCell: () => {
          return {
            style: {
              maxWidth: item.width || 150,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            },
          };
        },
        render: (text, record = {}) => {
          let { log = {} } = record;
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
              return (
                <div className="flexRow">
                  <UserHead
                    className="circle mRight8"
                    user={{
                      userHead: log.avatar,
                      accountId: log.accountId,
                    }}
                    lazy={'false'}
                    size={24}
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
            case 'loginVenue':
              return <span>{log.title || ''}</span>;
            case 'loginType':
              return (
                <span>
                  {
                    (
                      [
                        { label: _l('登录'), value: '1' },
                        { label: _l('登出'), value: '2' },
                      ].find(it => it.value === logType) || { value: '-' }
                    ).label
                  }
                </span>
              );
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
    this.getLoglist({ pageIndex: 1, pageSize: 50 });
  }

  getLoglist = (params = {}) => {
    this.setState({ loading: true, pageIndex: params.pageIndex });
    let { pageIndex = 1, pageSize = 50 } = params;
    const { searchValues } = this.state;
    const { startDate, endDate, loginerInfo = [], logType = '' } = searchValues;
    let requestParams = {
      pageIndex,
      pageSize,
      projectId: Config.projectId,
      startDateTime: startDate ? startDate : moment().subtract(29, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
      endDateTime: endDate ? endDate : moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      logType, // ogin=1 logout=2
      accountIds: loginerInfo.map(item => item.accountId),
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
    let { startDate, endDate, loginerInfo = [], logType } = this.state.searchValues;
    const { pageIndex } = this.state;
    const { pageSize = 50 } = param;
    let params = {
      pageIndex,
      pageSize,
      projectId: Config.projectId,
      startDateTime: startDate ? startDate : moment().subtract(29, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
      endDateTime: endDate ? endDate : moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      logType, // ogin=1 logout=2
      accountIds: loginerInfo.map(item => item.accountId),
      columnNames: this.columns.map(it => it.title),
    };
    downloadAjax.exportLoginLog(params).then(res => {
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
    });
  };

  render() {
    const { loading, dataSource = [], count = 0, disabledExportBtn, searchValues, pageIndex } = this.state;

    return (
      <LoginLogWrap className="orgManagementWrap">
        <AdminTitle prefix={_l('日志 - 登录')} />
        <div className="orgManagementHeader Font17 flexRow">
          <span className="flex">{_l('登录')}</span>
          <div>
            <span className="tipInfo">
              {_l('保留最近6个月的登录日志')}
              <Tooltip
                text={<span>{_l('导出上限10万条，超出限制可以先筛选，再分次导出。')}</span>}
                popupPlacement="bottom"
              >
                <Icon icon="info" className="Font14 mLeft5 Gray_9e" />
              </Tooltip>
            </span>
            <Button
              type="primary"
              className="export mLeft24"
              disabled={disabledExportBtn}
              onClick={() => {
                if (disabledExportBtn) return;
                this.exportListData();
              }}
            >
              {_l('导出')}
            </Button>
          </div>
        </div>
        <div className="pLeft24 pRight24 flexColumn flexWrap">
          <div ref={ele => (this.seatchWrap = ele)}>
            <SearchWrap
              projectId={Config.projectId}
              searchValues={searchValues}
              searchList={[
                {
                  type: 'selectUser',
                  key: 'acccountId',
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
                  options: [
                    { label: _l('全部'), value: '' },
                    { label: _l('登录'), value: 1 },
                    { label: _l('登出'), value: 2 },
                  ],
                },
              ]}
              onChange={searchValues =>
                this.setState(
                  { searchValues: { ...this.state.searchValues, ...searchValues }, pageIndex: 1 },
                  this.getLoglist,
                )
              }
            />
          </div>
          <div className="flexWrap">
            <PageTableCon
              loading={loading}
              columns={this.columns}
              dataSource={dataSource}
              count={count}
              getDataSource={this.getLoglist}
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
