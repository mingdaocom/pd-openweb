import React, { Component, Fragment } from 'react';
import { Select } from 'antd';
import { Tooltip, Icon, Dialog } from 'ming-ui';
import appManagementAjax from 'src/api/appManagement';
import Search from 'src/pages/workflow/components/Search';
import SvgIcon from 'src/components/SvgIcon';
import TableCom from '../TableCom';
import AppAnalytics from '../AppAnalytics';
import { selectDateList, formatter } from '../../util';
import { formatFileSize } from 'src/util';
import { navigateTo } from 'src/router/navigateTo';
import cx from 'classnames';
import styled from 'styled-components';
import _ from 'lodash';

const { Option } = Select;

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
      width: 190px;
      height: 36px;
      line-height: 36px;
      margin-left: 24px;
      background-color: #f5f5f5;
      border-radius: 3px;
      .tabItem {
        width: 92px;
        height: 32px;
        text-align: center;
        line-height: 32px;
        margin: 2px;
        font-size: 14px;
        border-radius: 3px;
      }
      .currentTab {
        color: #2196f3;
        background-color: #fff;
      }
    }
    .searchWrap {
      padding-right: 24px;
      .ant-select-single:not(.ant-select-customize-input) .ant-select-selector {
        height: 36px;
        border-radius: 3px;
        .ant-select-selection-item {
          line-height: 34px;
        }
      }
      .ant-select-arrow {
        margin-top: -9px;
        top: 50%;
        width: 18px;
        height: 18px;
      }
    }
  }
  .summary,
  .useage {
    padding: 6px 24px 0;
    .width120 {
      width: 150px;
    }
    .width120 {
      width: 120px;
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
          color: #2196f3;
        }
        .chartIcon {
          display: inline-block;
          color: #9e9e9e;
          cursor: pointer;
        }
        .chartIcon:hover {
          color: #2196f3;
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
      isMore: false,
      pageIndex: 1,
      sorterInfo: { sortFiled: '', order: '' },
      useageList: [],
      useageLoading: false,
      useagePageIndex: 1,
      appAnalyticsVisible: false,
      currentAppInfo: {},
      checkAdmin: {
        id: '',
        post: false,
        visible: false,
        title: '',
      },
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
                  onClick={() => this.checkIsAppAdmin(item.appId, item.name)}
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
            <Tooltip text={<span>{_l('使用分析')}</span>}>
              <Icon
                icon="poll"
                className="chartIcon Font20"
                onClick={() => {
                  this.setState({ currentAppInfo: { ...item, iconUrl: item.icon, isAnalysis: true } }, () => {
                    this.checkIsAppAdmin(item.appId, item.name, true);
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
                <div className="flex nameBox ellipsis Font14" onClick={() => this.checkIsAppAdmin(item.id, app.name)}>
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
        className: 'width120',
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
        dataIndex: 'addWorkFlow', title: _l('工作流执行数'), className: 'width120', sorter: true, render: (item) => {
          return formatter(item.addWorkFlow);
        }
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
            <Tooltip text={<span>{_l('使用分析')}</span>}>
              <Icon
                icon="poll"
                className="chartIcon Font20"
                onClick={() => {
                  this.setState({ currentAppInfo: { ...app, appId: item.id }, isAnalysis: true }, () => {
                    this.checkIsAppAdmin(item.id, app.name, true);
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

  getList = () => {
    const { projectId } = this.props;
    const { pageIndex, loading, isMore, sorterInfo = {}, keyword } = this.state;
    const { sortFiled, order } = sorterInfo;

    // 加载更多
    if (pageIndex > 1 && ((loading && isMore) || !isMore)) {
      return;
    }

    this.setState({ loading: true });

    if (this.ajaxRequst) {
      this.ajaxRequst.abort();
    }
    this.ajaxRequst = appManagementAjax.appUsageOverviewStatistics({
      projectId,
      keyWord: keyword,
      appId: '',
      pageIndex,
      pageSize: 50,
      sortFiled,
      sorted: sortFiled ? (order === 'asc' ? true : false) : undefined,
    });
    this.ajaxRequst
      .then(({ list, allCount }) => {
        this.setState({
          list: pageIndex === 1 ? list : this.state.list.concat(list),
          pageIndex: pageIndex + 1,
          total: allCount,
          loading: false,
          isMore: list.length >= 50,
        });
      })
      .fail(err => {
        this.setState({
          pageIndex: 1,
          loading: false,
          isMore: false,
        });
      });
  };
  getUseageList = () => {
    const { projectId } = this.props;
    const { useagePageIndex, useageLoading, isMore, sorterInfo = {}, keyword, selectedDate } = this.state;
    const { sortFiled, order } = sorterInfo;

    // 加载更多
    if (useagePageIndex > 1 && ((useageLoading && isMore) || !isMore)) {
      return;
    }

    this.setState({ useageLoading: true });

    if (this.useageRequest) {
      this.useageRequest.abort();
    }
    this.useageRequest = appManagementAjax.usageStatisticsForDimension({
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
    });
    this.useageRequest
      .then(({ list, allCount }) => {
        this.setState({
          useageList: useagePageIndex === 1 ? list : this.state.useageList.concat(list),
          useagePageIndex: useagePageIndex + 1,
          total: allCount,
          useageLoading: false,
          isMore: list.length >= 50,
        });
      })
      .fail(err => {
        this.setState({
          useageLoading: false,
          isMore: false,
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

  /**
   * 检测是否是应用管理员
   */
  checkIsAppAdmin(appId, name, isAnalysis) {
    const opts = post => {
      return {
        id: appId,
        post,
        visible: true,
        title: name,
      };
    };
    this.setState({ checkAdmin: opts(true) }, () => {
      appManagementAjax.checkAppAdminForUser({
        appId,
      }).then(result => {
        if (result) {
          if (isAnalysis) {
            this.setState({
              checkAdmin: Object.assign({}, this.state.checkAdmin, { visible: false }),
              appAnalyticsVisible: true,
            });
          } else {
            navigateTo(`/app/${appId}`);
          }
        } else if (this.state.checkAdmin.visible) {
          this.setState({ checkAdmin: opts(false) });
        }
      });
    });
  }
  addRoleMemberForAppAdmin = () => {
    const {
      checkAdmin: { id },
      isAnalysis,
    } = this.state;
    appManagementAjax.addRoleMemberForAppAdmin({
      appId: id,
    }).then(result => {
      if (result) {
        if (isAnalysis) {
          this.setState({ appAnalyticsVisible: true, isAnalysis: false });
        } else {
          navigateTo(`/app/${id}`);
        }
      }
    });
  };
  changeTab = item => {
    const { pageIndex, useagePageIndex } = this.state;
    this.setState(
      {
        currentTab: item.tab,
        pageIndex: item.tab === 1 ? 1 : pageIndex,
        useagePageIndex: item.tab === 2 ? 1 : useagePageIndex,
        sorterInfo: item.tab === 2 ? { sortFiled: 'appAccessNumber', order: 'desc' } : { sortFiled: '', order: '' },
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
  render() {
    const { projectId } = this.props;
    let {
      currentTab,
      list = [],
      loading,
      pageIndex,
      useageList = [],
      useageLoading,
      useagePageIndex,
      selectedDate,
      appAnalyticsVisible,
      currentAppInfo = {},
      checkAdmin,
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
              <Select
                className="mRight10"
                style={{ width: '200px' }}
                placeholder={_l('最近30天')}
                suffixIcon={<Icon icon="arrow-down-border" className="Font18" />}
                value={selectedDate}
                onChange={value => {
                  this.setState({ selectedDate: value, useagePageIndex: 1 }, () => this.getUseageList());
                }}
              >
                {selectDateList.map(item => (
                  <Option key={item.value} value={item.value}>
                    {item.label}
                  </Option>
                ))}
              </Select>
            )}
            <Search
              className="appSearch"
              placeholder={_l('应用名称')}
              handleChange={_.debounce(keyword => this.updateState(keyword.trim()), 500)}
            />
          </div>
        </div>
        {currentTab === 1 && (
          <div className="summary flex flexColumn">
            <TableCom
              dataSource={list}
              columns={this.columns}
              loadNextPage={this.getList}
              loading={loading && pageIndex === 1}
              dealSorter={this.dealSorter}
            />
          </div>
        )}
        {currentTab === 2 && (
          <div className="useage flex flexColumn">
            <TableCom
              dataSource={useageList}
              columns={this.useageColumns}
              loadNextPage={this.getUseageList}
              loading={useageLoading && useagePageIndex === 1}
              defaultSorter={{ sortFiled: 'appAccessNumber', order: 'desc' }}
              dealSorter={this.dealSorter}
            />
          </div>
        )}

        {appAnalyticsVisible && (
          <AppAnalytics
            currentAppInfo={currentAppInfo}
            projectId={projectId}
            onCancel={() => {
              this.setState({ appAnalyticsVisible: false });
            }}
          />
        )}

        <Dialog
          visible={checkAdmin.visible}
          className={cx({ checkAdminDialog: checkAdmin.post })}
          title={_l('管理应用“%0”', checkAdmin.title)}
          description={_l('如果你不是应用的管理员，需要将自己加为管理员以获得权限')}
          cancelText=""
          okText={checkAdmin.post ? _l('验证权限...') : _l('加为应用管理员')}
          onOk={checkAdmin.post ? () => {} : this.addRoleMemberForAppAdmin}
          onCancel={() => this.setState({ checkAdmin: Object.assign({}, this.state.checkAdmin, { visible: false }) })}
        />
      </ByAppWrap>
    );
  }
}
