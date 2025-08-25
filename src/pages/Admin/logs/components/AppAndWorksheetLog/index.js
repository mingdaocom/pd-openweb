import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import filterXss from 'xss';
import { Button, Icon, Tooltip, UserHead, UserName } from 'ming-ui';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import appManagementAjax from 'src/api/appManagement';
import downloadAjax from 'src/api/download';
import sheetAjax from 'src/api/worksheet';
import ArchivedList from 'src/components/ArchivedList';
import unauthorizedPic from 'src/components/UnusualContent/unauthorized.png';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import IsAppAdmin from 'src/pages/Admin/components/IsAppAdmin';
import WorksheetRecordLogDialog from 'src/pages/worksheet/components/WorksheetRecordLog/WorksheetRecordLogDialog';
import { navigateTo } from 'src/router/navigateTo';
import { getTranslateInfo } from 'src/utils/app';
import { getRequest } from 'src/utils/common';
import createLinksForMessage from 'src/utils/createLinksForMessage';
import { VersionProductType } from 'src/utils/enum';
import { dateConvertToUserZone, getFeatureStatus } from 'src/utils/project';
import PageTableCon from '../../../components/PageTableCon';
import SearchWrap from '../../../components/SearchWrap';
import {
  APP_WORKSHEET_LOG_COLUMNS,
  MODULE_LIST,
  OPERATE_LIST,
  PRIVATE_APP_WORKSHEET_LOG_COLUMNS,
  TAB_LIST,
} from '../../enum';
import WorksheetLogDrawer from '../WorksheetLogDrawer';

const FlexWrap = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  .disabledDetail {
    cursor: not-allowed;
    color: #757575;
  }
`;
const TabWrap = styled.div`
  height: 56px;
  padding: 0 24px 0 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eaeaea;
  font-size: 17px;
  font-weight: 600;
  .tabBox {
    height: 100%;
    display: flex;
    align-items: center;
  }
  .tabItem {
    height: 100%;
    display: flex;
    align-items: center;
    font-size: 17px;
    font-weight: 600;
    border-bottom: 2px solid transparent;
    margin-right: 4px;
    padding: 0 16px;
    cursor: pointer;
    &:hover {
      background-color: #f5f5f5;
    }
    &.active {
      color: #1677ff;
      border-bottom-color: #1677ff;
    }
  }
`;
const NoAuthorWrap = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .imgWrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 130px;
    height: 130px;
    line-height: 130px;
    border-radius: 50%;
    text-align: center;
    background-color: #f5f5f5;
    img {
      width: 100%;
    }
  }
  .explainText {
    margin: 30px 0 50px 0;
    font-size: 17px;
    color: #757575;
  }
`;
const Box = styled.div`
  width: 100%;
  height: 36px;
  background: #fefbe7;
  border-radius: 3px;
  border: 1px solid #fce596;
  padding: 0 12px;
`;
const AvatarWrap = styled.div`
  width: 24px;
  height: 24px;
  background: #f5f5f5;
`;
const PAGE_SIZE = 50;
export default class AppAndWorksheetLog extends Component {
  constructor(props) {
    super(props);
    const columns = md.global.Config.IsLocal
      ? APP_WORKSHEET_LOG_COLUMNS.concat(PRIVATE_APP_WORKSHEET_LOG_COLUMNS)
      : APP_WORKSHEET_LOG_COLUMNS;
    const { oldsheetlog } = getRequest(location.search);
    this.state = {
      appList: [],
      worksheetList: [],
      searchValues: {
        worksheetIds: props.worksheetId ? [props.worksheetId] : [],
      },
      showColumns: columns.map(it => it.dataIndex),
      currentRowInfo: {},
      appPageIndex: 1,
      checkAdmin: {
        id: '',
        post: false,
        visible: false,
        title: '',
      },
      logType: localStorage.getItem('globalLogTab') ? +localStorage.getItem('globalLogTab') : 0,
      disabledExportBtn: false,
      isAuthority: true, // 是否有权限（应用： 管理员、运营者，后台超级管理员）
      showWorksheetLog: !!oldsheetlog,
    };
    this.columns = columns
      .map(item => {
        return {
          width: 150,
          ellipsis: true,
          ...item,
          render: (text, record) => {
            const {
              companyName,
              module,
              operationType,
              operationDatetime,
              application = {},
              appItem = {},
              operator = {},
              opeartContent = '',
              extrasAccounts = [],
            } = record;
            const { projectId } = this.props;
            const { accountId, avatar, fullname } = operator;
            const { appId, appName, appIconUrl, appIconColor, createType, urlTemplate, status } = application;
            const { id, name } = appItem;

            switch (item.dataIndex) {
              case 'accountId':
                const isNormalUser = accountId && accountId.length === 36;
                const extra = isNormalUser ? {} : { headClick: () => {} };
                const isPublicFileDownload = operationType === 12 && accountId === 'user-publicform';

                return (
                  <div className="flexRow">
                    {isPublicFileDownload ? (
                      <AvatarWrap className="pointer circle mRight8 valignWrapper justifyContentCenter">
                        <Icon icon="worksheet" className="Gray_9e Font16 TxtMiddle" />
                      </AvatarWrap>
                    ) : (
                      <UserHead
                        className="circle mRight8"
                        user={{
                          userHead: avatar,
                          accountId: accountId,
                        }}
                        size={24}
                        appId={appId}
                        {...extra}
                        projectId={projectId}
                      />
                    )}

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
                      <div>{isPublicFileDownload ? _l('公开访问') : fullname}</div>
                    )}
                  </div>
                );
              case 'projectId':
                return <span>{companyName}</span>;
              case 'appId':
                return status === 2 ? (
                  <span className="Gray_9e">{_l('已删除')}</span>
                ) : appName ? (
                  <IsAppAdmin
                    appId={appId}
                    appName={appName}
                    iconUrl={appIconUrl}
                    iconColor={appIconColor}
                    createType={createType}
                    urlTemplate={urlTemplate}
                    projectId={projectId}
                  />
                ) : (
                  '-'
                );
              case 'worksheetId':
                return name ? (
                  <span className="Hand Hover_21" onClick={() => navigateTo(`/worksheet/${id}`)}>
                    {name}
                  </span>
                ) : (
                  '-'
                );
              case 'module':
                return <span>{_.get(_.find(MODULE_LIST, it => it.value === module) || {}, 'label') || '-'}</span>;
              case 'opeartContent':
                const isUser = opeartContent.indexOf('[aid]') > -1;
                const message = isUser
                  ? createLinksForMessage({
                      message: opeartContent,
                      rUserList: extrasAccounts,
                    })
                  : '';
                const txt = (isUser ? message : opeartContent).replace(/<a.*?>/, '').replace(/<\/a>/, '');
                return opeartContent ? (
                  <Tooltip text={<spam>{txt}</spam>} popupPlacement="bottom" autoCloseDelay={0}>
                    <span
                      className="wMax100 ellipsis InlineBlock"
                      dangerouslySetInnerHTML={{ __html: isUser ? filterXss(message) : filterXss(opeartContent) }}
                    ></span>
                  </Tooltip>
                ) : (
                  '-'
                );
              case 'operationType':
                return (
                  <span>{_.get(_.find(OPERATE_LIST, it => it.value === operationType) || {}, 'label') || '-'}</span>
                );
              case 'operationDatetime':
                return <span>{dateConvertToUserZone(operationDatetime)}</span>;
              default:
                return <span>{text}</span>;
            }
          },
        };
      })
      .filter(it => (props.appId ? it.dataIndex !== 'appId' : true));
  }

  componentDidMount() {
    this.getLogList();
  }
  componentWillUnmount() {
    localStorage.removeItem('globalLogTab');
  }

  getAppList = () => {
    const { projectId } = this.props;
    const { appPageIndex, isMoreApp, loadingApp, keyword = '' } = this.state;
    // 加载更多
    if (appPageIndex > 1 && ((loadingApp && isMoreApp) || !isMoreApp)) {
      return;
    }
    this.setState({ loadingApp: true });
    if (this.appPromise) {
      this.appPromise.abort();
    }
    this.appPromise = appManagementAjax.getAppsByProject({
      projectId,
      status: '',
      order: 3,
      pageIndex: appPageIndex,
      pageSize: 50,
      keyword,
    });

    this.appPromise
      .then(({ apps }) => {
        const newAppList = (apps || []).map(item => {
          return {
            label: item.appName,
            value: item.appId,
          };
        });
        this.setState({
          appList: appPageIndex === 1 ? [].concat(newAppList) : this.state.appList.concat(newAppList),
          isMoreApp: newAppList.length >= 50,
          loadingApp: false,
          appPageIndex: appPageIndex + 1,
        });
      })
      .catch(() => {
        this.setState({ loadingApp: false });
      });
  };

  getWorksheetList = (appIds = []) => {
    appManagementAjax.getWorksheetsUnderTheApp({ projectId: this.props.projectId, appIds }).then(res => {
      let newWorksheetList = [];
      appIds.forEach(item => {
        newWorksheetList = newWorksheetList.concat(
          (res[item] || []).map(it => ({
            label: getTranslateInfo(item, null, it.worksheetId).name || it.worksheetName,
            value: it.worksheetId,
          })),
        );
      });

      this.setState({ worksheetList: _.isEmpty(appIds) ? [] : newWorksheetList });
    });
  };

  getConditions = () => {
    const { appId, projectId } = this.props;
    const { logType, appList, searchValues, worksheetList, isMoreApp, archivedItem = {} } = this.state;
    const {
      appIds = [],
      worksheetIds = [],
      modules = [],
      operationTypes = [],
      dateTimeRange = {},
      archiveDate,
    } = searchValues;
    const { startDate, endDate } = dateTimeRange;
    const galFeatureType = getFeatureStatus(projectId, VersionProductType.globalBehaviorLog);
    let operationTypesData = OPERATE_LIST.filter(it =>
      logType === 1
        ? _.includes(['all', 1, 2, 3, 6, 7, 16, 18, 19, 20], it.value)
        : logType === 2
          ? !_.includes([4, 10, 16, 18, 19, 20], it.value)
          : logType === 3
            ? _.includes(['all', 4, 10], it.value)
            : true,
    );
    // 非旗舰版不显示浏览、打印
    operationTypesData =
      galFeatureType === '2' || !galFeatureType
        ? operationTypesData.filter(it => !_.includes([4, 10], it.value))
        : operationTypesData;

    const coditions = [
      !_.isEmpty(archivedItem)
        ? {
            key: 'archiveDate',
            type: 'antdDatePicker',
            label: _l('操作时间'),
            picker: 'month',
            allowClear: false,
            value: archiveDate,
            disabledDate: current => {
              return (
                (archivedItem.start && current < moment(archivedItem.start)) ||
                (archivedItem.end && current > moment(archivedItem.end))
              );
            },
          }
        : {
            key: 'dateTimeRange',
            type: 'antdRangePicker',
            label: _l('操作时间'),
            placeholder: [_l('开始日期'), _l('结束日期')],
            defaultPickerValue: _.isEmpty(archivedItem)
              ? []
              : [moment(archivedItem.start, 'YYYY-MM-DD').subtract(30, 'days'), moment(archivedItem.end, 'YYYY-MM-DD')],
            format: 'YYYY-MM-DD',
            value: !_.isEmpty(dateTimeRange) ? [dateTimeRange.startDate, dateTimeRange.endDate] : [],
            disabledDate: current => {
              if (md.global.Config.IsLocal) {
                return (
                  current < moment(endDate).subtract(6, 'months') ||
                  current > moment(startDate).add(6, 'months').format('YYYYMMDDHHmmss')
                );
              }
              return current < moment().subtract(1, 'day').subtract(6, 'months');
            },
          },
      {
        key: 'selectUserInfo',
        type: 'selectUser',
        label: _l('用户'),
        suffixIcon: <Icon icon="person" className="Font16" />,
      },
      {
        key: 'appIds',
        type: 'select',
        label: _l('应用'),
        placeholder: _l('全部'),
        showSearch: true,
        allowClear: true,
        options: appList,
        value: appIds,
        notFoundContent: <span className="Gray_9e">{_l('无搜索结果')}</span>,
        mode: 'multiple',
        maxTagCount: 'responsive',
        onSearch: _.debounce(val => this.setState({ keyword: val, appPageIndex: 1 }, this.getAppList), 500),
        filterOption: (inputValue, option) => {
          return (
            appList
              .find(item => item.value === option.value)
              .label.toLowerCase()
              .indexOf(inputValue.toLowerCase()) > -1
          );
        },
        onClear: () => {
          this.setState({ appPageIndex: 1, keyword: '' }, this.getAppList);
        },
        onPopupScroll: e => {
          e.persist();
          const { scrollTop, offsetHeight, scrollHeight } = e.target;
          if (scrollTop + offsetHeight === scrollHeight) {
            if (isMoreApp) {
              this.getAppList();
            }
          }
        },
      },
      {
        key: 'worksheetIds',
        type: 'select',
        label: _l('应用项'),
        placeholder: _l('全部'),
        mode: 'multiple',
        showSearch: true,
        allowClear: true,
        options: worksheetList,
        value: worksheetIds,
        disabled: !appId && _.isEmpty(appIds),
        filterOption: (inputValue, option) => {
          return (
            worksheetList
              .find(item => item.value === option.value)
              .label.toLowerCase()
              .indexOf(inputValue.toLowerCase()) > -1
          );
        },
        notFoundContent: <span className="Gray_9e">{_l('无搜索结果')}</span>,
        maxTagCount: 'responsive',
      },
      {
        key: 'modules',
        type: 'select',
        label: _l('操作对象'),
        placeholder: _l('全部'),
        options: MODULE_LIST.filter(
          it => !_.includes(logType === 1 ? [8, 9] : logType === 3 ? [3, 4, 11] : [], it.value),
        ),
        value: modules,
        mode: 'multiple',
        maxTagCount: 'responsive',
        filterOption: (inputValue, option) => option.children.toLowerCase().includes(inputValue.toLowerCase()),
      },
      {
        key: 'operationTypes',
        type: 'select',
        label: _l('操作类型'),
        placeholder: _l('全部'),
        options: operationTypesData,
        value: operationTypes,
        mode: 'multiple',
        maxTagCount: 'responsive',
        filterOption: (inputValue, option) => option.children.toLowerCase().includes(inputValue.toLowerCase()),
      },
    ];

    return coditions.filter(v => {
      let filterArr = [];
      if (appId) {
        filterArr = logType === 1 ? ['appIds'] : logType === 2 ? ['appIds', 'modules'] : ['appIds'];
      } else {
        filterArr = logType === 1 ? [] : logType === 2 ? ['modules'] : [];
      }

      return !_.includes(filterArr, v.key);
    });
  };

  getLogList = (params = {}) => {
    this.setState({ loading: true, pageIndex: params.pageIndex });
    const { projectId, appId } = this.props;
    const { logType, searchValues, archivedItem = {} } = this.state;
    const { pageIndex = 1, pageSize = 50 } = params;
    const {
      selectUserInfo = [],
      appIds = [],
      worksheetIds = [],
      modules = [],
      operationTypes = [],
      dateTimeRange = {},
      archiveDate,
    } = searchValues;
    const { startDate, endDate } = dateTimeRange;

    let requestPromise = _.isEmpty(archivedItem)
      ? appManagementAjax.getGlobalLogs
      : appManagementAjax.getArchivedGlobalLogs;

    requestPromise({
      pageIndex,
      pageSize,
      projectId,
      queryType: logType ? logType : undefined,
      operators: selectUserInfo.map(it => it.accountId),
      appIds: appId ? [appId] : _.includes(appIds, 'all') ? [] : appIds,
      worksheetIds: _.includes(worksheetIds, 'all') ? [] : worksheetIds,
      modules: _.includes(modules, 'all') ? [] : modules,
      operationTypes: _.includes(operationTypes, 'all') ? [] : operationTypes,
      startDateTime: startDate
        ? startDate.startOf('day').format('YYYY-MM-DD HH:mm:ss')
        : _.isEmpty(archivedItem)
          ? moment().subtract(29, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss')
          : moment(archiveDate).startOf('month').format('YYYY-MM-DD HH:mm:ss'),
      endDateTime: endDate
        ? endDate.endOf('day').format('YYYY-MM-DD HH:mm:ss')
        : _.isEmpty(archivedItem)
          ? moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
          : moment(archiveDate).endOf('month').format('YYYY-MM-DD HH:mm:ss'),
      isSingle: appId ? true : false,
      archivedId: archivedItem.id,
    })
      .then(res => {
        if (res.resultCode === 7) {
          this.setState({ isAuthority: false, loading: false });
          return;
        }
        !this.props.appId && this.getAppList();
        this.props.appId && this.getWorksheetList([this.props.appId]);

        this.setState({
          dataSource: res.list.map(item => {
            return {
              ...item,
              appItem: {
                ...item.appItem,
                name: getTranslateInfo(appId, null, _.get(item.appItem, 'id')).name || _.get(item.appItem, 'name'),
              },
            };
          }),
          count: res.allCount,
          loading: false,
          disabledExportBtn: _.isEmpty(res.list),
        });
      })
      .catch(() => {
        this.setState({ loading: false, dataSource: [], disabledExportBtn: true });
      });
  };

  // 导出
  exportListData = (param = {}) => {
    this.setState({ disabledExportBtn: true });
    const { projectId, appId } = this.props;
    const { logType, searchValues, pageIndex = 1, archivedItem = {} } = this.state;
    const { pageSize = 50 } = param;
    const {
      selectUserInfo = [],
      appIds = [],
      worksheetIds = [],
      modules = [],
      operationTypes = [],
      dateTimeRange = {},
      archiveDate,
    } = searchValues;
    const { startDate, endDate } = dateTimeRange;

    let params = {
      pageIndex,
      pageSize,
      projectId,
      queryType: logType ? logType : undefined,
      operators: !_.isEmpty(selectUserInfo) ? selectUserInfo.map(it => it.accountId) : undefined,
      appIds: appId ? [appId] : _.includes(appIds, 'all') || !appIds.length ? undefined : appIds,
      worksheetIds: _.includes(worksheetIds, 'all') || !worksheetIds.length ? undefined : worksheetIds,
      modules: _.includes(modules, 'all') || !modules.length ? undefined : modules,
      operationTypes: _.includes(operationTypes, 'all') || !operationTypes.length ? undefined : operationTypes,
      startDateTime: startDate
        ? startDate.startOf('day').format('YYYY-MM-DD HH:mm:ss')
        : _.isEmpty(archivedItem)
          ? moment().subtract(29, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss')
          : moment(archiveDate).startOf('month').format('YYYY-MM-DD HH:mm:ss'),
      endDateTime: endDate
        ? endDate.endOf('day').format('YYYY-MM-DD HH:mm:ss')
        : _.isEmpty(archivedItem)
          ? moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
          : moment(archiveDate).endOf('month').format('YYYY-MM-DD HH:mm:ss'),
      columnNames: this.columns.map(it => it.title),
      menuName: _.get(_.find(TAB_LIST, v => v.tab === logType) || {}, 'tabName'),
      isSingle: appId ? true : false,
      archivedId: archivedItem.id,
    };

    downloadAjax
      .exportGlobalLogs(params)
      .then(res => {
        this.setState({ disabledExportBtn: false });
        if (!res) {
          Confirm({
            title: _l('数据导出超过100,000行，本次仅导出前100,000行记录'),
            okText: _l('导出'),
            onOk: () => {
              downloadAjax.exportGlobalLogs({ ...params, confirmExport: true });
            },
          });
        }
      })
      .catch(() => {
        this.setState({ disabledExportBtn: false });
      });
  };

  // 查看记录记录
  getControls = record => {
    if (this.state.loadingControlDetails) return;

    this.setState({ loadingControlDetails: true, currentRowInfo: record });

    sheetAjax
      .getWorksheetInfo({ getRules: true, getTemplate: true, worksheetId: _.get(record, 'appItem.id') })
      .then(res => {
        const controls = (res.template.controls || []).map(it => {
          return { ...it };
        });

        this.setState({ controls, showRecordLog: true, currentRowInfo: record, loadingControlDetails: false });
      })
      .catch(() => {
        this.setState({ loadingControlDetails: false });
      });
  };

  render() {
    const { projectId, appId } = this.props;
    const {
      dataSource = [],
      count,
      showRecordLog,
      loading,
      logType,
      currentRowInfo,
      searchValues,
      pageIndex,
      disabledExportBtn,
      isAuthority,
      controls = [],
      loadingControlDetails,
      showWorksheetLog,
      archivedItem = {},
    } = this.state;
    const { appIds = [], worksheetIds = [] } = searchValues;
    const glFeatureType = getFeatureStatus(projectId, VersionProductType.glabalLog);
    const galFeatureType = getFeatureStatus(projectId, VersionProductType.globalBehaviorLog);
    const tabList = TAB_LIST.filter(it => (!galFeatureType ? it.tab !== 3 : true));

    if (glFeatureType === '2') {
      return (
        <div className="orgManagementWrap h100">
          {buriedUpgradeVersionDialog(projectId, VersionProductType.glabalLog, { dialogType: 'content' })}
        </div>
      );
    }
    if (!isAuthority) {
      return (
        <NoAuthorWrap>
          <div className="imgWrap">
            <img src={unauthorizedPic} alt={_l('错误图片')} />
          </div>
          <div className="explainText">{_l('无权限访问')}</div>
        </NoAuthorWrap>
      );
    }

    let keepFilters = ['dateTimeRange', 'selectUserInfo', 'appIds', 'worksheetIds'].filter(item =>
      appId ? item !== 'appIds' : true,
    );

    return (
      <Fragment>
        <TabWrap className="orgManagementHeader">
          <div className="tabBox flex">
            {tabList.map(item => (
              <div
                key={item.tab}
                className={cx('tabItem', { active: item.tab === logType })}
                onClick={() => {
                  safeLocalStorageSetItem('globalLogTab', item.tab);

                  this.setState(
                    {
                      logType: item.tab,
                      searchValues: Object.assign(
                        {},
                        _.pick(
                          searchValues,
                          keepFilters.filter(v => (item.tab === 1 ? v !== 'worksheetIds' : true)),
                        ),
                      ),
                    },
                    this.getLogList,
                  );
                  this.tableWrap && this.tableWrap.setCheckedCols(this.columns.map(it => it.dataIndex));
                }}
              >
                {item.tabName}
              </div>
            ))}
          </div>

          <div>
            {md.global.Config.IsLocal ? '' : <span className="tipInfo">{_l('保留最近6个月的日志')}</span>}
            {appId && (
              <Tooltip text={_l('查看旧版工作表日志')}>
                <i
                  className="icon icon-draft-box Gray_9 Hand mLeft26 Font17 Hover_21"
                  onClick={() => this.setState({ showWorksheetLog: true })}
                />
              </Tooltip>
            )}
            <ArchivedList
              type={3}
              showSelectItem={false}
              archivedItem={archivedItem}
              params={{ projectId, appId }}
              iconClassName="mLeft26 Gray_9"
              onChange={archivedItem => {
                this.setState(
                  {
                    archivedItem,
                    searchValues: {
                      ...searchValues,
                      archiveDate: moment(archivedItem.start),
                      dateTimeRange: {},
                    },
                  },
                  this.getLogList,
                );
              }}
            />
            <i
              className="icon-task-later Gray_9 hoverText mRight26 Font17 mLeft26"
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
        </TabWrap>
        {logType === 3 && galFeatureType === '2' ? (
          <div className="flex">
            {buriedUpgradeVersionDialog(projectId, VersionProductType.globalBehaviorLog, { dialogType: 'content' })}
          </div>
        ) : (
          <FlexWrap
            className={cx('orgManagementContent pTop0 flexColumn', {
              'pLeft24 pRight24': appId,
              pTop20: !_.isEmpty(archivedItem),
            })}
          >
            {!_.isEmpty(archivedItem) && (
              <Box className="flexRow alignItemsCenter">
                <div className="bold">{_l('查看已归档数据：')}</div>
                <div className="mLeft5 flex">
                  {archivedItem.start} {_l('至')} {archivedItem.end}
                </div>
                <Icon
                  icon="cancel"
                  className="Font20 mLeft10 Gray_9e ThemeHoverColor3 pointer"
                  onClick={() => this.setState({ archivedItem: {}, searchValues: {} }, this.getLogList)}
                />
              </Box>
            )}
            <div ref={ele => (this.seatchWrap = ele)}>
              <SearchWrap
                projectId={projectId}
                searchList={this.getConditions()}
                searchValues={searchValues}
                showExpandBtn={true}
                onChange={searchParams => {
                  const { startDate, endDate } = searchParams.dateTimeRange || {};

                  if (
                    md.global.Config.IsLocal &&
                    moment(endDate).subtract(6, 'months').format('YYYYMMDDHHmmss') >
                      moment(startDate).format('YYYYMMDDHHmmss')
                  ) {
                    alert(_l('最大跨度6个月'), 2);
                    return;
                  }
                  if (searchParams.appIds && searchParams.appIds.length && !_.isEqual(searchParams.appIds, appIds)) {
                    this.getWorksheetList(searchParams.appIds);
                  }
                  if (_.isEmpty(searchParams) && this.state.keyword) {
                    this.setState({ appPageIndex: 1, keyword: '' }, this.getAppList);
                  }

                  if (!_.isEmpty(archivedItem) && _.isEmpty(searchParams)) {
                    this.setState(
                      { searchValues: { archiveDate: moment(archivedItem.start) }, pageIndex: 1 },
                      this.getLogList,
                    );
                    return;
                  }

                  this.setState(
                    {
                      searchValues: _.isEmpty(searchParams)
                        ? searchParams
                        : {
                            ...searchValues,
                            ...searchParams,
                            worksheetIds: searchParams.worksheetIds
                              ? searchParams.worksheetIds
                              : searchParams.appIds && _.isEmpty(searchParams.appIds)
                                ? []
                                : !_.isEmpty(appIds) || !_.isEmpty(worksheetIds)
                                  ? worksheetIds
                                  : [],
                          },
                      pageIndex: 1,
                      worksheetList:
                        searchParams.appIds && _.isEmpty(searchParams.appIds) ? [] : this.state.worksheetList,
                    },
                    this.getLogList,
                  );
                }}
              />
            </div>
            <FlexWrap>
              <PageTableCon
                className="logsTable"
                paginationInfo={{ pageIndex, pageSize: PAGE_SIZE }}
                ref={node => (this.tableWrap = node)}
                loading={loading}
                columns={this.columns}
                dataSource={dataSource}
                count={count}
                getDataSource={this.getLogList}
                fixedShowCols={logType === 1 || logType === 3 ? true : false}
                moreAction={true}
                moreActionContent={record =>
                  _.get(record, 'appItem.status') === 1 &&
                  record.module === 8 &&
                  _.includes([1, 3], record.operationType) ? (
                    <span
                      className={cx('ThemeColor Hand', {
                        disabledDetail: loadingControlDetails && currentRowInfo.id === record.id,
                      })}
                      onClick={() => this.getControls(record)}
                    >
                      {loadingControlDetails && currentRowInfo.id === record.id ? _l('加载中...') : _l('详情')}
                    </span>
                  ) : (
                    ''
                  )
                }
                getShowColumns={showColumns => this.setState({ showColumns })}
              />
            </FlexWrap>
            {showRecordLog && (
              <WorksheetRecordLogDialog
                appId={appId || _.get(currentRowInfo, 'application.appId')}
                worksheetId={_.get(currentRowInfo, 'appItem.id')}
                rowId={_.get(currentRowInfo, 'rowId')}
                controls={controls}
                filterUniqueIds={[currentRowInfo.uniqueId]}
                visible
                onClose={() => this.setState({ showRecordLog: false })}
              />
            )}
          </FlexWrap>
        )}

        {showWorksheetLog && (
          <WorksheetLogDrawer
            selectWorksheetId={!_.isEmpty(worksheetIds) ? worksheetIds[0] : undefined}
            visible={showWorksheetLog}
            projectId={projectId}
            appId={appId}
            onClose={() => this.setState({ showWorksheetLog: false })}
          />
        )}
      </Fragment>
    );
  }
}
