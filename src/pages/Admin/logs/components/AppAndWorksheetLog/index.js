import React, { Component, Fragment } from 'react';
import { Icon, Button, Tooltip } from 'ming-ui';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import UserHead from 'src/pages/feed/components/userHead';
import UserName from 'src/pages/feed/components/userName';
import SearchWrap from '../../../components/SearchWrap';
import PageTableCon from '../../../components/PageTableCon';
import IsAppAdmin from 'src/pages/Admin/components/IsAppAdmin';
import LogDetailDialog from '../LogDetailDialog';
import {
  APP_WORKSHEET_LOG_COLUMNS,
  PRIVATE_APP_WORKSHEET_LOG_COLUMNS,
  MODULE_LIST,
  OPERATE_LIST,
  TAB_LIST,
} from '../../enum';
import appManagementAjax from 'src/api/appManagement';
import { navigateTo } from 'src/router/navigateTo';
import downloadAjax from 'src/api/download';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import { createLinksForMessage } from 'src/components/common/function';
import unauthorizedPic from 'src/router/Application/assets/unauthorized.png';
import styled from 'styled-components';
import moment from 'moment';
import _ from 'lodash';
import cx from 'classnames';

const FlexWrap = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;
const TabWrap = styled.div`
  height: 56px;
  padding: 0 24px;
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
    margin-right: 40px;
    cursor: pointer;
    &.active {
      color: #2196f3;
      border-bottom-color: #2196f3;
    }
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
const PAGE_SIZE = 50;
export default class AppAndWorksheetLog extends Component {
  constructor(props) {
    super(props);
    const columns = md.global.Config.IsLocal
      ? APP_WORKSHEET_LOG_COLUMNS.concat(PRIVATE_APP_WORKSHEET_LOG_COLUMNS)
      : APP_WORKSHEET_LOG_COLUMNS;
    this.state = {
      appList: [{ label: _l('全部'), value: 'all' }],
      worksheetList: [],
      searchValues: {},
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
    };
    this.columns = columns
      .map(item => {
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
          render: (text, record) => {
            const {
              companyName,
              module,
              operationType,
              application = {},
              appItem = {},
              operator = {},
              opeartContent = '',
              extrasAccounts = [],
            } = record;
            const { projectId } = this.props;
            const { accountId, avatar, fullname } = operator;
            const { appId, appName, appIconUrl, appIconColor, createType, urlTemplate, status } = application;
            const { id, name, sectionId } = appItem;

            switch (item.dataIndex) {
              case 'accountId':
                const isNormalUser = accountId && accountId.length === 36;
                const extra = isNormalUser ? {} : { headClick: () => {} };
                return (
                  <div className="flexRow">
                    <UserHead
                      className="circle mRight8"
                      user={{
                        userHead: avatar,
                        accountId: accountId,
                      }}
                      lazy={'false'}
                      size={24}
                      {...extra}
                    />
                    {isNormalUser ? (
                      <UserName
                        className="Gray Font13 pRight10 pTop3 flex ellipsis"
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
                  <span className="Hand Hover_21" onClick={() => navigateTo(`/app/${appId}/${sectionId}/${id}`)}>
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
                return opeartContent ? (
                  opeartContent.indexOf('[aid]') > -1 ? (
                    <span dangerouslySetInnerHTML={{ __html: message }}></span>
                  ) : (
                    <span dangerouslySetInnerHTML={{ __html: opeartContent }}></span>
                  )
                ) : (
                  '-'
                );
              case 'operationType':
                return (
                  <span>{_.get(_.find(OPERATE_LIST, it => it.value === operationType) || {}, 'label') || '-'}</span>
                );
              default:
                return <span>{text}</span>;
            }
          },
        };
      })
      .filter(it => (props.appId ? it.dataIndex !== 'appId' : true));
  }

  componentDidMount() {
    this.getLoglist();
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
          appList:
            appPageIndex === 1
              ? [{ label: _l('全部'), value: '' }].concat(newAppList)
              : this.state.appList.concat(newAppList),
          isMoreApp: newAppList.length >= 50,
          loadingApp: false,
          appPageIndex: appPageIndex + 1,
        });
      })
      .fail(err => {
        this.setState({ loadingApp: false });
      });
  };

  getWorksheetList = (appIds = []) => {
    appManagementAjax.getWorksheetsUnderTheApp({ projectId: this.props.projectId, appIds }).then(res => {
      let newWorksheetList = [{ label: _l('全部'), value: 'all' }];
      appIds.forEach(item => {
        newWorksheetList = newWorksheetList.concat(
          (res[item] || []).map(it => ({ label: it.worksheetName, value: it.worksheetId })),
        );
      });

      this.setState({ worksheetList: _.isEmpty(appIds) ? [] : newWorksheetList });
    });
  };

  getConditions = () => {
    const { appId, projectId } = this.props;
    const { logType, appList, searchValues, worksheetList, isMoreApp } = this.state;
    const { appIds = [], worksheetIds = [], modules = [], operationTypes = [] } = searchValues;
    const galFeatureType = getFeatureStatus(projectId, VersionProductType.GAL);
    let operationTypesData = OPERATE_LIST.filter(it =>
      logType === 1
        ? _.includes(['all', 1, 2, 3, 6, 7], it.value)
        : logType === 2
        ? !_.includes([4, 10], it.value)
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
      {
        key: 'operators',
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
        options: MODULE_LIST.filter(it =>
          logType === 1 ? !_.includes([8], it.value) : logType === 3 ? !_.includes([3, 4], it.value) : true,
        ),
        value: modules,
        mode: 'multiple',
        maxTagCount: 'responsive',
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
      },
      {
        key: 'dateTimeRange',
        type: 'selectTime',
        label: _l('操作时间'),
        placeholder: _l('最近30天'),
        dateFormat: 'YYYY-MM-DD HH:mm:ss',
        suffixIcon: <Icon icon="person" className="Font16" />,
      },
    ];

    return coditions.filter(v => {
      let filterArr = [];
      if (appId) {
        filterArr = logType === 1 ? ['appIds', 'worksheetIds'] : logType === 2 ? ['appIds', 'modules'] : ['appIds'];
      } else {
        filterArr = logType === 1 ? ['worksheetIds'] : logType === 2 ? ['modules'] : [];
      }

      return !_.includes(filterArr, v.key);
    });
  };

  getLoglist = (params = {}) => {
    this.setState({ loading: true, pageIndex: params.pageIndex });
    const { projectId, appId } = this.props;
    const { logType, searchValues } = this.state;
    const { pageIndex = 1, pageSize = 50 } = params;
    const {
      loginerInfo = [],
      appIds = [],
      worksheetIds = [],
      modules = [],
      operationTypes = [],
      startDate,
      endDate,
    } = searchValues;

    appManagementAjax
      .getGlobalLogs({
        pageIndex,
        pageSize,
        projectId,
        queryType: logType ? logType : undefined,
        operators: loginerInfo.map(it => it.accountId),
        appIds: appId ? [appId] : _.includes(appIds, 'all') ? [] : appIds,
        worksheetIds: _.includes(worksheetIds, 'all') ? [] : worksheetIds,
        modules: _.includes(modules, 'all') ? [] : modules,
        operationTypes: _.includes(operationTypes, 'all') ? [] : operationTypes,
        startDateTime: startDate
          ? startDate
          : moment().subtract(29, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        endDateTime: endDate ? endDate : moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
        isSingle: appId ? true : false,
      })
      .then(res => {
        if (res.resultCode === 7) {
          this.setState({ isAuthority: false, loading: false });
          return;
        }
        !this.props.appId && this.getAppList();
        this.props.appId && this.getWorksheetList([this.props.appId]);

        this.setState({
          dataSource: res.list,
          count: res.allCount,
          loading: false,
          disabledExportBtn: _.isEmpty(res.list),
        });
      })
      .fail(err => {
        this.setState({ loading: false, dataSource: [], disabledExportBtn: true });
      });
  };

  // 导出
  exportListData = (param = {}) => {
    this.setState({ disabledExportBtn: true });
    const { projectId, appId } = this.props;
    const { logType, searchValues, pageIndex = 1 } = this.state;
    const { pageSize = 50 } = param;
    const {
      loginerInfo = [],
      appIds = [],
      worksheetIds = [],
      modules = [],
      operationTypes = [],
      startDate,
      endDate,
    } = searchValues;

    let params = {
      pageIndex,
      pageSize,
      projectId,
      queryType: logType ? logType : undefined,
      operators: !_.isEmpty(loginerInfo) ? loginerInfo.map(it => it.accountId) : undefined,
      appIds: appId ? [appId] : _.includes(appIds, 'all') || !appIds.length ? undefined : appIds,
      worksheetIds: _.includes(worksheetIds, 'all') || !worksheetIds.length ? undefined : worksheetIds,
      modules: _.includes(modules, 'all') || !modules.length ? undefined : modules,
      operationTypes: _.includes(operationTypes, 'all') || !operationTypes.length ? undefined : operationTypes,
      startDateTime: startDate ? startDate : moment().subtract(29, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
      endDateTime: endDate ? endDate : moment().format('YYYY-MM-DD HH:mm:ss'),
      columnNames: this.columns.map(it => it.title),
      menuName: _.get(_.find(TAB_LIST, v => v.tab === logType) || {}, 'tabName'),
      isSingle: appId ? true : false,
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
      .fail(err => {
        this.setState({ disabledExportBtn: false });
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
    } = this.state;
    const { appIds = [], worksheetIds = [] } = searchValues;
    const glFeatureType = getFeatureStatus(projectId, VersionProductType.GL);
    const galFeatureType = getFeatureStatus(projectId, VersionProductType.GAL);
    const tabList = TAB_LIST.filter(it => (!galFeatureType ? it.tab !== 3 : true));

    if (glFeatureType === '2') {
      return (
        <div className="orgManagementWrap h100">
          {buriedUpgradeVersionDialog(projectId, VersionProductType.GL, 'content', {
            explainText: _l('请升级至付费版解锁开启'),
          })}
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

    return (
      <Fragment>
        <TabWrap>
          <div className="tabBox flex">
            {tabList.map(item => (
              <div
                key={item.tab}
                className={cx('tabItem', { active: item.tab === logType })}
                onClick={() => {
                  safeLocalStorageSetItem('globalLogTab', item.tab);
                  this.setState({ logType: item.tab, searchValues: {} }, this.getLoglist);
                  this.tableWrap && this.tableWrap.setCheckedCols(this.columns.map(it => it.dataIndex));
                }}
              >
                {item.tabName}
              </div>
            ))}
          </div>

          <div>
            <span className="tipInfo">
              {_l('保留最近6个月的应用日志')}
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
        </TabWrap>
        {logType === 3 && galFeatureType === '2' ? (
          <div className="flex">{buriedUpgradeVersionDialog(projectId, VersionProductType.GAL, 'content')}</div>
        ) : (
          <FlexWrap className="flexColumn pLeft24 pRight24">
            <div ref={ele => (this.seatchWrap = ele)}>
              <SearchWrap
                projectId={projectId}
                searchList={this.getConditions()}
                searchValues={searchValues}
                showExpandBtn={true}
                onChange={searchParams => {
                  if (searchParams.appIds && searchParams.appIds.length && !_.isEqual(searchParams.appIds, appIds)) {
                    this.getWorksheetList(searchParams.appIds);
                  }
                  if (_.isEmpty(searchParams) && this.state.keyword) {
                    this.setState({ appPageIndex: 1, keyword: '' }, this.getAppList);
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
                    this.getLoglist,
                  );
                }}
              />
            </div>
            <FlexWrap>
              <PageTableCon
                paginationInfo={{ pageIndex, pageSize: PAGE_SIZE }}
                ref={node => (this.tableWrap = node)}
                loading={loading}
                columns={this.columns}
                dataSource={dataSource}
                count={count}
                getDataSource={this.getLoglist}
                fixedShowCols={logType === 1 || logType === 3 ? true : false}
                moreAction={true}
                moreActionContent={record =>
                  _.get(record, 'appItem.status') === 1 &&
                  record.module === 8 &&
                  _.includes([1, 3], record.operationType) ? (
                    <span
                      className="ThemeColor Hand"
                      onClick={() => {
                        this.setState({ showRecordLog: true, currentRowInfo: record });
                      }}
                    >
                      {_l('详情')}
                    </span>
                  ) : (
                    ''
                  )
                }
                getShowColumns={showColumns => this.setState({ showColumns })}
              />
            </FlexWrap>
            {showRecordLog && (
              <LogDetailDialog
                visible={showRecordLog}
                currentRowInfo={currentRowInfo}
                onCancel={() => {
                  this.setState({ showRecordLog: false, currentRowInfo: {} });
                }}
              />
            )}
          </FlexWrap>
        )}
      </Fragment>
    );
  }
}
