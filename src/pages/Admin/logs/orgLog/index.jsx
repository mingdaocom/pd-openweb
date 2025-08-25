import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import filterXss from 'xss';
import { Button, Dialog, Icon, Tooltip, UserHead, UserName } from 'ming-ui';
import actionLogAjax from 'src/api/actionLog';
import downloadAjax from 'src/api/download';
import roleController from 'src/api/role';
import { upgradeVersionDialog } from 'src/components/upgradeVersion';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import createLinksForMessage from 'src/utils/createLinksForMessage';
import { dateConvertToUserZone } from 'src/utils/project';
import PageTableCon from '../../components/PageTableCon';
import SearchWrap from '../../components/SearchWrap';
import { OPERATE_TYPE, ORG_LOG_OPERATOR, ORG_MANAGE_LOG_COLUMNS, PRIVATE_APP_WORKSHEET_LOG_COLUMNS } from '../enum';
import HistoryLogs from './HistoryLogs';
import './style.less';

const FlexWrap = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 0 32px;
`;

export default class orgLog extends React.Component {
  constructor(props) {
    super(props);
    const columns = md.global.Config.IsLocal
      ? ORG_MANAGE_LOG_COLUMNS.concat(PRIVATE_APP_WORKSHEET_LOG_COLUMNS)
      : ORG_MANAGE_LOG_COLUMNS;
    this.state = {
      isLoading: false,
      list: [],
      pageIndex: 1,
      pageSize: 20,
      totalCount: null,
      historyLogInfo: {},
    };
    this.columns = columns.map(item => {
      return {
        width: 150,
        ellipsis: true,
        ...item,
        render: (text, record) => {
          const {
            operator = {},
            operateTargetType,
            operateType,
            operationDatetime,
            opeartContent,
            extrasAccounts = [],
          } = record;
          const { accountId, avatar, fullname } = operator;
          const { projectId } = _.get(this.props, 'match.params') || '';

          switch (item.dataIndex) {
            case 'accountId':
              const isNormalUser = accountId && accountId.length === 36;

              return (
                <div className="flexRow">
                  <UserHead
                    className="circle mRight8"
                    user={{
                      userHead: avatar,
                      accountId: accountId,
                    }}
                    size={24}
                    projectId={projectId}
                  />
                  {isNormalUser ? (
                    <UserName
                      className="Gray Font13 pRight10 pTop3 flex ellipsis"
                      projectId={projectId}
                      user={{
                        userName: fullname,
                        accountId: accountId,
                      }}
                    />
                  ) : (
                    <div>{fullname}</div>
                  )}
                </div>
              );
            case 'operateTargetType':
              return <span>{(ORG_LOG_OPERATOR.find(v => v.value === operateTargetType) || {}).label}</span>;
            case 'operateType':
              return <span>{(OPERATE_TYPE.find(v => v.value === operateType) || {}).label}</span>;
            case 'operationTime':
              return <span>{dateConvertToUserZone(operationDatetime)}</span>;
            case 'operationContent':
              const isUser = opeartContent.indexOf('[aid]') > -1;
              const message = isUser
                ? createLinksForMessage({
                    message: opeartContent,
                    rUserList: extrasAccounts,
                  })
                : '';
              const txt = (isUser ? message : opeartContent).replace(/<a.*?>/g, '').replace(/<\/a>/g, '');
              return opeartContent ? (
                <Tooltip text={<spam>{txt}</spam>} popupPlacement="bottom">
                  <span
                    className="wMax100 ellipsis InlineBlock"
                    dangerouslySetInnerHTML={{ __html: isUser ? filterXss(message) : filterXss(opeartContent) }}
                  ></span>
                </Tooltip>
              ) : (
                '-'
              );
            default:
              return <span>{text}</span>;
          }
        },
      };
    });
  }

  componentWillMount() {
    this.fetchLogs();
    this.fetchHistoryLogs();
  }

  fetchLogs = (params = {}) => {
    const { projectId } = _.get(this.props, 'match.params') || '';
    const { pageIndex = 1, pageSize = 50 } = params;
    const { searchValues = {} } = this.state;
    const { orgLogOutDate = {}, selectUserInfo = [], operateTargetType, operateType } = searchValues;
    const { startDate, endDate } = orgLogOutDate;

    this.setState({ isLoading: true });

    actionLogAjax
      .getOrgLogs({
        projectId,
        pageIndex,
        pageSize,
        startDateTime: startDate
          ? startDate
          : moment().subtract(29, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        endDateTime: endDate ? endDate : moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
        operateTargetType,
        operateType,
        accountIds: selectUserInfo.map(item => item.accountId),
      })
      .then(({ data } = {}) => {
        const { totalCount, list } = data || {};
        this.setState({
          isLoading: false,
          totalCount: totalCount || 0,
          list: list,
          pageIndex,
          disabledExportBtn: _.isEmpty(list),
        });
      })
      .catch(() => {
        this.setState({
          isLoading: false,
        });
      });
  };

  // 导出
  exportListData = (param = {}) => {
    this.setState({ disabledExportBtn: true });
    let { orgLogOutDate = {}, selectUserInfo = [], operateTargetType, operateType } = this.state.searchValues || {};
    const { startDate, endDate } = orgLogOutDate;
    const { pageIndex } = this.state;
    const { pageSize = 50 } = param;
    const params = {
      projectId: _.get(this.props, 'match.params.projectId'),
      pageIndex,
      pageSize,
      startDateTime: startDate ? startDate : moment().subtract(29, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
      endDateTime: endDate ? endDate : moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      operateTargetType,
      operateType,
      accountIds: selectUserInfo.map(item => item.accountId),
      columnNames: this.columns.map(it => it.title),
      fileName: _l('组织管理日志'),
    };

    downloadAjax.exportOrgOperateLogs(params).then(res => {
      this.setState({ disabledExportBtn: false });
      if (!res) {
        Dialog.confirm({
          title: _l('数据导出超过100,000行，本次仅导出前100,000行记录'),
          okText: _l('导出'),
          onOk: () => {
            downloadAjax.exportOrgOperateLogs({ ...params, confirmExport: true });
          },
        });
      }
    });
  };

  // 历史日志
  fetchHistoryLogs = ({ pageIndex = 1, pageSize = 20 } = {}) => {
    const { projectId } = _.get(this.props, 'match.params') || '';

    this.setState({ historyLogInfo: { isLoading: true } });

    roleController
      .getPageLogs({ projectId, pageIndex, pageSize })
      .then(({ allCount, list } = {}) => {
        this.setState({
          historyLogInfo: {
            isLoading: false,
            allCount: allCount,
            list: list,
          },
        });
      })
      .catch(() => {
        this.setState({ historyLogInfo: { isLoading: false } });
      });
  };

  render() {
    const {
      isLoading,
      searchValues = {},
      pageIndex,
      disabledExportBtn,
      list,
      totalCount,
      showHistoryLogs,
      historyLogInfo = {},
    } = this.state;
    const { operateTargetType, operateType } = searchValues;
    const { projectId } = _.get(this.props, 'match.params') || '';

    const licenseType = (md.global.Account.projects.find(o => o.projectId === projectId) || {}).licenseType;

    if (licenseType === 0) {
      return upgradeVersionDialog({
        projectId,
        explainText: _l('请升级至付费版解锁'),
        isFree: true,
        dialogType: 'content',
      });
    }

    if (showHistoryLogs) {
      return (
        <HistoryLogs
          projectId={projectId}
          onClose={() => this.setState({ showHistoryLogs: false })}
          historyLogInfo={historyLogInfo}
          fetchHistoryLogs={this.fetchHistoryLogs}
        />
      );
    }

    return (
      <div className="orgManagementWrap roleAuthLogTable">
        <AdminTitle prefix={_l('日志 - 组织管理')} />
        <div className="orgManagementHeader Font17">
          <div className="flex">{_l('组织管理')}</div>
          <div>
            <span className="Font13 Normal mRight26">{_l('保留最近6个月的日志')}</span>
            {historyLogInfo.allCount ? (
              <Tooltip text={<span>{_l('历史日志')}</span>}>
                <i
                  className="icon icon-draft-box Gray_9 hoverText mRight26"
                  onClick={() => this.setState({ showHistoryLogs: true })}
                />
              </Tooltip>
            ) : (
              ''
            )}
            <i
              className="icon-task-later Gray_9 hoverText mRight26 Font17"
              onClick={() => this.setState({ searchValues: {}, pageIndex: 1 }, this.fetchLogs)}
            />
            <Tooltip
              text={<span>{_l('导出上限10万条，超出限制可以先筛选，再分次导出。')}</span>}
              popupPlacement="bottom"
            >
              <Button
                type="primary"
                className="exportBtn pLeft15 pRight15"
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
        <div ref={ele => (this.seatchWrap = ele)} className="mLeft32 mRight32">
          <SearchWrap
            showExpandBtn={true}
            projectId={projectId}
            searchValues={searchValues}
            searchList={[
              {
                type: 'selectUser',
                key: 'selectUserInfo',
                label: _l('操作人'),
                suffixIcon: <Icon icon="person" className="Font16" />,
              },
              {
                type: 'select',
                key: 'operateTargetType',
                label: _l('操作对象'),
                placeholder: _l('全部'),
                allowClear: true,
                value: operateTargetType,
                options: ORG_LOG_OPERATOR,
              },
              {
                type: 'select',
                key: 'operateType',
                label: _l('操作类型'),
                placeholder: _l('全部'),
                allowClear: true,
                value: operateType,
                options: OPERATE_TYPE,
              },
              {
                type: 'selectTime',
                key: 'orgLogOutDate',
                label: _l('操作时间'),
                placeholder: _l('最近30天'),
                dateFormat: 'YYYY-MM-DD HH:mm:ss',
                suffixIcon: <Icon icon="person" className="Font16" />,
              },
            ]}
            onChange={searchValues => {
              this.setState(
                {
                  searchValues: _.isEmpty(searchValues)
                    ? searchValues
                    : { ...this.state.searchValues, ...searchValues },
                  pageIndex: 1,
                },
                this.fetchLogs,
              );
            }}
          />
        </div>
        <FlexWrap>
          <PageTableCon
            className="logsTable"
            paginationInfo={{ pageIndex, pageSize: 50 }}
            ref={node => (this.tableWrap = node)}
            loading={isLoading}
            columns={this.columns}
            dataSource={list}
            count={totalCount}
            getDataSource={this.fetchLogs}
          />
        </FlexWrap>
      </div>
    );
  }
}
