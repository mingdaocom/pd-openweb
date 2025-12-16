import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Button, Icon, SvgIcon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { checkIsAppAdmin } from 'ming-ui/functions';
import appManagementAjax from 'src/api/appManagement';
import downloadAjax from 'src/api/download';
import CustomSelectDate from 'src/pages/Admin/components/CustomSelectDate';
import Search from 'src/pages/workflow/components/Search';
import { formatFileSize } from 'src/utils/common';
import { formatter, selectDateList } from '../../util';
import TableCom from '../TableCom';

const ByAppWrap = styled.div`
  background-color: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-top: 24px;
  .byAppHeader {
    display: flex;
    justify-content: space-between;
    .tabsWrap {
      height: 36px;
      line-height: 36px;
      margin-left: 24px;
      background-color: #f5f5f5;
      border-radius: 3px;
      .tabItem {
        padding: 0 20px;
        height: 32px;
        text-align: center;
        line-height: 32px;
        margin: 2px;
        font-size: 14px;
        border-radius: 3px;
      }
      .currentTab {
        color: #1677ff;
        background-color: #fff;
      }
    }
    .searchWrap {
      padding-right: 24px;
      .w200 {
        width: 200px;
      }
      .export {
        margin-left: 26px;
        min-width: 76px;
        padding: 0 16px;
      }
    }
  }
  .summary,
  .useage {
    padding: 6px 24px 0;
    .width120 {
      width: 120px;
    }
    .width130 {
      width: 130px;
    }
    .width50 {
      width: 50px;
    }
    .iconWrap {
      width: 22px;
      height: 22px;
      border-radius: 5px;
      margin-right: 10px;
      text-align: center;
      padding-top: 3px;
    }
    .isOpen {
      color: #47b14b !important;
    }
    .chartIcon {
      display: none;
    }
    .row {
      &:hover {
        background: #f5f5f5;
        .nameBox {
          color: #1677ff;
        }
        .chartIcon {
          display: inline-block;
          color: #9e9e9e;
          cursor: pointer;
        }
        .chartIcon:hover {
          color: #1677ff;
        }
      }
    }
  }
`;

const tabs = [
  { tab: 1, name: _l('汇总概览') },
  { tab: 2, name: _l('使用情况') },
];

export default class ByApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 1,
      selectedDate: 1,
      list: [],
      loading: false,
      pageIndex: 1,
      sorterInfo: { sortFiled: '', order: '' },
      useageList: [],
      useageLoading: false,
      useagePageIndex: 1,
      currentAppInfo: {},
      disabledExportBtn: true,
      startTime: moment().subtract(29, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
      endTime: moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    };
    this.columns = [
      {
        dataIndex: 'appName',
        title: _l('应用名称'),
        className: 'flex overflowHidden pRight16 minWidth120 pLeft10',
        render: item => {
          if (item.appId) {
            return (
              <div className="flexRow overflowHidden">
                <div className="iconWrap" style={{ backgroundColor: item.iconColor }}>
                  <SvgIcon url={item.icon} fill="#fff" size={16} />
                </div>
                <div
                  className={cx('flex nameBox ellipsis Font14 Hand', { unable: !item.status })}
                  onClick={() => checkIsAppAdmin({ appId: item.appId, appName: item.name })}
                >
                  {item.name}
                </div>
              </div>
            );
          } else {
            return (
              <div className="flexRow overflowHidden alignItemsCenter">
                <div className="iconWrap" style={{ backgroundColor: '#ddd' }}></div>
                <div className="Gray_bd">{_l('应用已删除')}</div>
              </div>
            );
          }
        },
      },
      {
        dataIndex: 'status',
        title: _l('状态'),
        className: 'width120',
        sorter: true,
        render: item => {
          let isOpen = item.status === 1;
          return <span className={cx('Gray_9e', { isOpen: isOpen })}>{isOpen ? _l('开启') : _l('关闭')}</span>;
        },
      },
      {
        dataIndex: 'workSheetCount',
        title: _l('工作表总数'),
        className: 'width120',
        sorter: true,
        render: item => {
          return formatter(item.workSheetCount);
        },
      },
      {
        dataIndex: 'workFlowCount',
        title: _l('工作流总数'),
        className: 'width120',
        render: item => {
          return formatter(item.workFlowCount);
        },
      },
      {
        dataIndex: 'rowCount',
        title: _l('行记录总数'),
        className: 'width120',
        render: item => {
          return formatter(item.rowCount);
        },
      },
      {
        dataIndex: 'action',
        title: '',
        className: 'width50',
        render: item => {
          if (!item.appId) return;
          return (
            <Tooltip title={_l('使用分析')}>
              <Icon
                icon="poll"
                className="chartIcon Font20"
                onClick={() => {
                  this.setState({ currentAppInfo: { ...item, iconUrl: item.icon } }, () => {
                    checkIsAppAdmin({
                      appId: item.appId,
                      appName: item.name,
                      callback: () => {
                        window.open(`/app/${item.appId}/analytics/${props.projectId}`, '__blank');
                      },
                    });
                  });
                }}
              />
            </Tooltip>
          );
        },
      },
    ];
    this.useageColumns = [
      {
        dataIndex: 'appName',
        title: _l('应用名称'),
        className: 'flex overflowHidden pRight16 minWidth120 pLeft10',
        render: item => {
          const { app = {} } = item;
          if (app.name) {
            return (
              <div className="flexRow overflowHidden">
                <div className="iconWrap" style={{ backgroundColor: app.iconColor }}>
                  <SvgIcon url={app.iconUrl} fill="#fff" size={16} />
                </div>
                <div
                  className="flex nameBox ellipsis Font14"
                  onClick={() => checkIsAppAdmin({ appId: item.id, appName: app.name })}
                >
                  {app.name}
                </div>
              </div>
            );
          } else {
            return (
              <div className="flexRow overflowHidden alignItemsCenter">
                <div className="iconWrap" style={{ backgroundColor: '#ddd' }}></div>
                <div className="Gray_bd">{_l('应用已删除')}</div>
              </div>
            );
          }
        },
      },
      {
        dataIndex: 'addRow',
        title: _l('记录创建次数'),
        explain: (
          <span>
            {_l('记录创建次数计数说明：')}
            <br />
            {_l('通过工作表表单页面创建的记录、不包含Excel导入、工作流创建、API调用的方式')}
          </span>
        ),
        className: 'width130',
        sorter: true,
        render: item => {
          return formatter(item.addRow);
        },
      },
      {
        dataIndex: 'addRowNumber',
        title: _l('记录创建人数'),
        className: 'width120',
        sorter: true,
        render: item => {
          return formatter(item.addRowNumber);
        },
      },
      {
        dataIndex: 'appAccess',
        title: _l('访问次数'),
        explain: (
          <span>
            {_l('应用访问次数计数说明：')}
            <br />
            {_l('· 通过应用图标点击进入应用')}
            <br />
            {_l('· 通过系统消息打开了应用')}
            <br />
            {_l('· 通过超链接访问应用')}
          </span>
        ),
        className: 'width120',
        sorter: true,
        render: item => {
          return formatter(item.appAccess);
        },
      },
      {
        dataIndex: 'appAccessNumber',
        title: _l('访问人数'),
        className: 'width120',
        sorter: true,
        render: item => {
          return formatter(item.appAccessNumber);
        },
      },
      {
        dataIndex: 'addWorkFlow',
        title: _l('工作流执行数'),
        className: 'width120',
        sorter: true,
        render: item => {
          return formatter(item.addWorkFlow);
        },
      },
      {
        dataIndex: 'attachmentUpload',
        title: _l('附件上传量'),
        className: 'width120',
        sorter: true,
        render: item => {
          return formatFileSize(item.attachmentUpload, 2);
        },
      },
      {
        dataIndex: 'action',
        title: '',
        className: 'width50',
        render: item => {
          const { app } = item;
          if (!app.name) return;
          return (
            <Tooltip title={_l('使用分析')}>
              <Icon
                icon="poll"
                className="chartIcon Font20"
                onClick={() => {
                  this.setState({ currentAppInfo: { ...app, appId: item.id } }, () => {
                    checkIsAppAdmin({
                      appId: item.id,
                      appName: app.name,
                      callback: () => {
                        window.open(`/app/${item.id}/analytics/${props.projectId}`, '__blank');
                      },
                    });
                  });
                }}
              />
            </Tooltip>
          );
        },
      },
    ];
    this.ajaxRequst = null;
    this.useageRequest = null;
  }

  componentDidMount() {
    this.getList();
  }

  updateState = keyword => {
    const { pageIndex, useagePageIndex, currentTab } = this.state;
    this.setState(
      {
        keyword,
        pageIndex: currentTab === 1 ? 1 : pageIndex,
        useagePageIndex: currentTab === 2 ? 1 : useagePageIndex,
      },
      () => {
        if (currentTab === 1) {
          this.getList();
        } else {
          this.getUseageList();
        }
      },
    );
  };

  getParams = () => {
    const { projectId } = this.props;

    const {
      currentTab,
      pageIndex,
      sorterInfo = {},
      keyword,
      useagePageIndex,
      selectedDate,
      startTime,
      endTime,
    } = this.state;
    const { sortFiled, order } = sorterInfo;
    if (currentTab === 1) {
      return {
        projectId,
        keyWord: keyword,
        appId: '',
        pageIndex,
        pageSize: 50,
        sortFiled,
        sorted: sortFiled ? (order === 'asc' ? true : false) : undefined,
      };
    } else {
      return {
        projectId,
        appId: '',
        userId: '',
        keyword: keyword,
        dayRange: selectedDate,
        pageIndex: useagePageIndex,
        pageSize: 50,
        dimension: 1,
        sortFiled: sortFiled || '',
        sorted: order === 'asc' ? true : false,
        startTime,
        endTime,
      };
    }
  };

  getList = () => {
    this.setState({ loading: true });

    if (this.ajaxRequst) {
      this.ajaxRequst.abort();
    }
    const params = this.getParams();
    this.ajaxRequst = appManagementAjax.appUsageOverviewStatistics(params);
    this.ajaxRequst
      .then(({ list, allCount }) => {
        this.setState({
          list,
          total: allCount,
          loading: false,
          disabledExportBtn: _.isEmpty(list),
        });
      })
      .catch(() => {
        this.setState({
          pageIndex: 1,
          loading: false,
        });
      });
  };
  getUseageList = () => {
    this.setState({ useageLoading: true });

    if (this.useageRequest) {
      this.useageRequest.abort();
    }
    const params = this.getParams();
    this.useageRequest = appManagementAjax.usageStatisticsForDimension(params);
    this.useageRequest
      .then(({ list, allCount }) => {
        this.setState({
          useageList: list,
          total: allCount,
          useageLoading: false,
          disabledExportBtn: _.isEmpty(list),
        });
      })
      .catch(() => {
        this.setState({
          useageLoading: false,
          useageList: [],
          total: 0,
          disabledExportBtn: true,
        });
      });
  };

  dealSorter = sorterInfo => {
    const { currentTab } = this.state;
    if (currentTab === 1) {
      this.setState({ sorterInfo, pageIndex: 1 }, () => {
        this.getList();
      });
    } else {
      this.setState({ sorterInfo, useagePageIndex: 1 }, () => {
        this.getUseageList();
      });
    }
  };

  changeTab = item => {
    const { pageIndex, useagePageIndex, list = [], useageList = [] } = this.state;

    if (
      (item.tab === 1 && pageIndex === 1 && !_.isEmpty(list)) ||
      (item.tab === 2 && useagePageIndex === 1 && !_.isEmpty(useageList))
    ) {
      this.setState({ currentTab: item.tab });
      return;
    }

    this.setState(
      {
        currentTab: item.tab,
        pageIndex: item.tab === 1 ? 1 : pageIndex,
        useagePageIndex: item.tab === 2 ? 1 : useagePageIndex,
        sorterInfo: item.tab === 2 ? { sortFiled: 'appAccessNumber', order: 'desc' } : { sortFiled: '', order: '' },
        total: 0,
      },
      () => {
        if (item.tab === 1) {
          this.getList();
        } else if (item.tab === 2) {
          this.getUseageList();
        }
      },
    );
  };

  exportListData = () => {
    this.setState({ disabledExportBtn: true });
    const { currentTab } = this.state;
    const params = this.getParams();

    const promise =
      currentTab === 2
        ? downloadAjax.exportUsageStatisticsForDimensionLog(params)
        : downloadAjax.exportAppUsageOverviewStatisticsLog(params);

    promise
      .then(() => {
        this.setState({ disabledExportBtn: false });
      })
      .catch(() => {
        this.setState({ disabledExportBtn: false });
      });
  };

  render() {
    let {
      currentTab,
      list = [],
      loading,
      pageIndex,
      useageList = [],
      useageLoading,
      useagePageIndex,
      total,
      disabledExportBtn,
      dateInfo = {},
    } = this.state;

    return (
      <ByAppWrap>
        <div className="byAppHeader">
          <div className="tabsWrap flexRow">
            {tabs.map(item => (
              <div
                key={item.tab}
                className={cx('tabItem fontWeight600 Hand', { currentTab: currentTab === item.tab })}
                onClick={() => {
                  this.changeTab(item);
                }}
              >
                {item.name}
              </div>
            ))}
          </div>
          <div className="searchWrap flexRow">
            {currentTab === 2 && (
              <CustomSelectDate
                className="mdAntSelect mRight10 w200"
                dateFormat={'YYYY-MM-DD HH:mm:ss'}
                searchDateList={selectDateList}
                dateInfo={dateInfo}
                min={moment().subtract(1, 'year')}
                changeDate={({ startDate, endDate, searchDateStr, dayRange }) => {
                  this.setState(
                    {
                      dateInfo: { startDate, endDate, searchDateStr },
                      selectedDate: dayRange,
                      startTime: startDate,
                      endTime: endDate,
                    },
                    this.getUseageList,
                  );
                }}
              />
            )}
            <Search
              className="appSearch"
              placeholder={_l('应用名称')}
              handleChange={_.debounce(keyword => this.updateState(keyword.trim()), 500)}
            />
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
          </div>
        </div>
        {currentTab === 1 && (
          <div className="summary flex flexColumn overflowHidden">
            <TableCom
              dataSource={list}
              columns={this.columns}
              loading={loading}
              dealSorter={this.dealSorter}
              total={total}
              pageIndex={pageIndex}
              changePage={pageIndex => this.setState({ pageIndex }, this.getList)}
            />
          </div>
        )}
        {currentTab === 2 && (
          <div className="useage flex flexColumn">
            <TableCom
              dataSource={useageList}
              columns={this.useageColumns}
              loading={useageLoading && useagePageIndex === 1}
              defaultSorter={{ sortFiled: 'appAccessNumber', order: 'desc' }}
              dealSorter={this.dealSorter}
              total={total}
              pageIndex={useagePageIndex}
              changePage={useagePageIndex => this.setState({ useagePageIndex }, this.getUseageList)}
            />
          </div>
        )}
      </ByAppWrap>
    );
  }
}
