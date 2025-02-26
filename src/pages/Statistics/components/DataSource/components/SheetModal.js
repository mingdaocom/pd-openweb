import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { ConfigProvider, Select, Modal, Button, Tabs } from 'antd';
import { Icon, Dropdown, LoadDiv, SvgIcon } from 'ming-ui';
import sheetApi from 'src/api/worksheet';
import homeAppApi from 'src/api/homeApp';
import appManagementApi from 'src/api/appManagement';
import syncTaskApi from 'src/pages/integration/api/syncTask';
import { getTranslateInfo, getFeatureStatus } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import { VIEW_DISPLAY_TYPE, VIEW_TYPE_ICON } from 'worksheet/constants/enum';
import styled from 'styled-components';

const Wrap = styled.div`
  .ant-tabs-nav {
    margin-bottom: 0 !important;
    &::before {
      border-bottom: none !important;
    }
    .ant-tabs-tab-active .ant-tabs-tab-btn {
      font-weight: bold;
    }
  }
  .ant-tabs-content {
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  .searchWrap {
    padding: 12px 10px;
    border-bottom: 1px solid #eaeaea;
    input {
      border: none;
      &::placeholder {
        color: #bdbdbd;
      }
    }
  }
  .workSheetListWrap {
    padding: 6px 0;
    height: 300px;
    overflow-y: auto;
    .sheetItem {
      padding: 10px;
      &:hover {
        background-color: #F5F5F5;
      }
    }
    .svgIconWrap div {
      display: flex;
      align-items: center;
    }
  }
  .viewsWrap {
    .viewItem {
      padding: 7px 20px 7px 32px;
      &.active, &:hover {
        background-color: #F5F5F5;
      }
    }
  }
  .iconWrap {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    justify-content: center;
    background: #f5f5f5;
  }
`;

export default class SheetModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      myApps: [],
      sheets: [],
      sheetsLoading: true,
      aggregationSheets: [],
      aggregationSheetsLoading: true,
      searchValue: '',
      activeKey: props.appType === 2 ? 'polymerizationSheet' : 'workSheet',
      appId: props.appId,
      views: props.worksheetInfo.views,
      viewsData: {},
      viewId: props.viewId,
      newWorksheetId: props.worksheetInfo.worksheetId,
      appType: props.appType,

    };
    const featureType = getFeatureStatus(props.projectId, VersionProductType.aggregation);
    this.hideAggregation =  md.global.Config.IsLocal && !md.global.Config.EnableDataPipeline || !featureType || featureType === '2';
  }
  componentDidMount() {
    const { activeKey, newWorksheetId } = this.state;
    const { appId } = this.props;
    this.getMyApps();
    if (activeKey === 'workSheet') {
      this.getSheets(appId);
      newWorksheetId && this.getWorksheetViews(newWorksheetId);
    } else {
      !this.hideAggregation && this.getAggregationSheetList(appId);
    }
  }
  getMyApps() {
    const { appId, projectId } = this.props;
    appManagementApi.getManagerApps({
      projectId
    }).then(data => {
      this.setState({
        myApps: data
          .map(app => ({ text: appId === app.appId ? `${app.appName} (${_l('本应用')})` : app.appName, value: app.appId })),
      });
    });
  }
  getSheets(appId) {
    this.setState({ sheetsLoading: true });
    homeAppApi
      .getWorksheetsByAppId({
        appId,
        type: 0,
      })
      .then(data => {
        this.setState({
          sheets: data,
          sheetsLoading: false
        });
      });
  }
  getAggregationSheetList(appId) {
    const { projectId } = this.props;
    this.setState({ aggregationSheetsLoading: true });
    syncTaskApi.list({
      projectId,
      appId,
      pageNo: 0,
      pageSize: 9999,
      taskType: 1
    }, {
      isAggTable: true
    }).then(data => {
      const { content } = data;
      this.setState({
        aggregationSheets: content.filter(n => n.aggTableTaskStatus !== 0 && n.taskStatus !== 'ERROR'),
        aggregationSheetsLoading: false
      });
    });
  }
  setViewsData = (worksheetId, data) => {
    const { viewsData } = this.state;
    this.setState({
      viewsData: {
        ...viewsData,
        [worksheetId]: {
          ...viewsData[worksheetId],
          ...data,
        },
      },
    });
  };
  getWorksheetViews(worksheetId) {
    const { views = [], loading, show } = this.state.viewsData[worksheetId] || {};
    if (loading) {
      return;
    }
    if (views.length) {
      this.setViewsData(worksheetId, { show: !show });
      return;
    }
    this.setViewsData(worksheetId, { loading: true });
    sheetApi
      .getWorksheetInfo({
        worksheetId,
        getViews: true,
      })
      .then(res => {
        const { views = [] } = res;
        this.setViewsData(worksheetId, { views, show: true, loading: false });
      });
  }
  handleSave = () => {
    const { viewId, newWorksheetId, appType, activeKey } = this.state;
    if (viewId || viewId === null) {
      this.props.onChange(newWorksheetId, viewId, appType);
    } else {
      alert(activeKey === 'workSheet' ? _l('请选择一个工作表和视图') : _l('请选择一个聚合表'), 3);
    }
  };
  renderWorkSheetItem(sheet) {
    const { newWorksheetId, viewId, viewsData } = this.state;
    const { views = [], show } = viewsData[sheet.workSheetId] || {};
    const isActive = newWorksheetId === sheet.workSheetId;
    return (
      <Fragment key={sheet.workSheetId}>
        <div
          className="sheetItem pointer flexRow alignItemsCenter pLeft20"
          onClick={() => {
            this.setState({
              newWorksheetId: sheet.workSheetId,
              viewId: null,
              appType: 1
            }, () => {
              this.getWorksheetViews(sheet.workSheetId);
            });
          }}
        >
          <SvgIcon className="svgIconWrap" url={sheet.iconUrl} fill={isActive ? '#2196f3' : '#9e9e9e'} size={18} />
          <span className={cx('bold mLeft8 ellipsis', { ThemeColor: isActive })}>{sheet.workSheetName}</span>
        </div>
      </Fragment>
    );
  }
  renderAggregationSheetItem(sheet) {
    const { newWorksheetId } = this.state;
    const isActive = newWorksheetId === sheet.worksheetId;
    return (
      <Fragment key={sheet.worksheetId}>
        <div
          className="sheetItem pointer flexRow alignItemsCenter pLeft20"
          onClick={() => {
            this.setState({
              viewId: null,
              newWorksheetId: sheet.worksheetId,
              appType: 2
            });
          }}
        >
          <Icon className={cx('Font20', isActive ? 'ThemeColor' : 'Gray_9e')} icon="aggregate_table" />
          <span className={cx('bold mLeft8 ellipsis flex', { ThemeColor: isActive })}>{sheet.name}</span>
          {isActive && <Icon className="ThemeColor Font18" icon="done" />}
        </div>
      </Fragment>
    );
  }
  renderSearch() {
    const { searchValue } = this.state;
    return (
      <div className="searchWrap flexRow alignItemsCenter">
        <Icon className="Font18 Gray_9e mRight3" icon="search" />
        <input
          className="w100"
          placeholder={_l('搜索')}
          type="text"
          value={searchValue}
          onChange={e => this.setState({ searchValue: e.target.value })}
        />
      </div>
    );
  }
  renderContent() {
    const { worksheetInfo, projectId, sourceType, ownerId } = this.props;
    const { appId, myApps, sheets, sheetsLoading, views, newWorksheetId, searchValue, viewId, aggregationSheets, aggregationSheetsLoading, appType, activeKey } = this.state;
    return (
      <div>
        {sourceType ? (
          <Fragment>
            <div className="mBottom10">{_l('应用')}</div>
            <Dropdown
              isAppendToBody
              border
              openSearch
              className="w100"
              menuClass="statisticsSelectWorksheetDropdownMenu"
              placeholder={_l('请选择你作为管理员或开发者的应用')}
              noData={_l('没有可选的应用')}
              defaultValue={appId}
              data={myApps}
              onChange={value => {
                this.setState({ appId: value, sheets: [], aggregationSheets: [] });
                if (activeKey === 'workSheet') {
                  this.getSheets(value);
                } else {
                  this.getAggregationSheetList(value);
                }
              }}
            />
            <Wrap>
              <Tabs
                className="mTop10"
                activeKey={activeKey}
                onTabClick={key => {
                  if (key === 'workSheet') {
                    !sheets.length && this.getSheets(appId);
                  } else {
                    !aggregationSheets.length && this.getAggregationSheetList(appId);
                  }
                  this.setState({ activeKey: key, searchValue: '' });
                }}
                centered={true}
              >
                <Tabs.TabPane tab={_l('工作表')} key="workSheet">
                  {this.renderSearch()}
                  {sheetsLoading ? (
                    <LoadDiv className="mTop10 mBottom10" />
                  ) : (
                    <div className="workSheetListWrap">
                      {sheets
                        .filter(item => item.workSheetName.includes(searchValue))
                        .map(item => this.renderWorkSheetItem(item))}
                    </div>
                  )}
                </Tabs.TabPane>
                {!this.hideAggregation && (
                  <Tabs.TabPane tab={_l('聚合表')} key="polymerizationSheet">
                    {this.renderSearch()}
                    {aggregationSheetsLoading ? (
                      <LoadDiv className="mTop10 mBottom10" />
                    ) : (
                      <div className="workSheetListWrap">
                        {aggregationSheets.length ? (
                          aggregationSheets
                            .filter(item => (item.name || '').includes(searchValue))
                            .map(item => this.renderAggregationSheetItem(item))
                        ) : (
                          <div className="flexColumn alignItemsCenter justifyContentCenter h100">
                            <div className="iconWrap flexRow alignItemsCenter justifyContentCenter">
                              <Icon className="Font50 Gray_9e" icon="aggregate_table" />
                            </div>
                            <span className="Font14 Gray_9e mTop20 mBottom24">{_l('将表单或多表数据预处理为聚合数据')}</span>
                            {getFeatureStatus(projectId, VersionProductType.aggregation) == '1' && (
                              <ConfigProvider autoInsertSpaceInButton={false}>
                                <Button
                                  type="primary"
                                  onClick={() => {
                                    window.open(`/app/${this.state.appId}/settings/aggregations`);
                                  }}
                                  style={{ borderRadius: 20 }}
                                >
                                  {_l('创建')}
                                </Button>
                              </ConfigProvider>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </Tabs.TabPane>
                )}
              </Tabs>
            </Wrap>
          </Fragment>
        ) : (
          (worksheetInfo.worksheetId || newWorksheetId) && (
            <Fragment>
              <div className="mBottom10">{_l('视图')}</div>
              <Select
                className="chartSelect w100"
                value={viewId || null}
                suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
                onChange={viewId => {
                  this.setState({ viewId });
                }}
              >
                {!ownerId && (
                  <Select.Option className="selectOptionWrapper" value={null}>
                    {_l('所有记录')}
                  </Select.Option>
                )}
                {(views || []).map(item => (
                  <Select.Option className="selectOptionWrapper" key={item.viewId} value={item.viewId}>
                    {getTranslateInfo(appId, null, item.viewId).name || item.name}
                  </Select.Option>
                ))}
              </Select>
            </Fragment>
          )
        )}
      </div>
    );
  }
  renderFooter() {
    const { appId, sourceType, projectId } = this.props;
    const { newWorksheetId, sheets, viewId, viewsData, activeKey } = this.state;
    const { views = [], show, loading } = viewsData[newWorksheetId] || {};
    return (
      <div className="mTop20 mBottom10 pLeft8 pRight8 flexRow">
        <div className="flexRow flex alignItemsCenter">
          {sourceType && newWorksheetId && _.find(sheets, { workSheetId: newWorksheetId }) && activeKey === 'workSheet' && (
            loading ? (
              <LoadDiv className="mLeft0" size="small" />
            ) : (
              <Fragment>
                <div className="mRight10">{_l('视图')}</div>
                <Select
                  className="chartSelect leftAlign"
                  style={{ width: 200 }}
                  value={viewId || null}
                  suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
                  onChange={viewId => {
                    this.setState({ viewId });
                  }}
                >
                  <Select.Option className="selectOptionWrapper" value={null}>
                    {_l('所有记录')}
                  </Select.Option>
                  {(views || []).map(item => (
                    <Select.Option className="selectOptionWrapper" key={item.viewId} value={item.viewId}>
                      {getTranslateInfo(appId, null, item.viewId).name || item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Fragment>
            )
          )}
          {activeKey === 'polymerizationSheet' && getFeatureStatus(projectId, VersionProductType.aggregation) == '1' && (
            <div className="flexRow alignItemsCenter ThemeColor pointer" onClick={() => window.open(`/app/${this.state.appId}/settings/aggregations`)}>
              <Icon icon="add" className="mRight2" />
              {_l('新建聚合表')}
            </div>
          )}
        </div>
        <ConfigProvider autoInsertSpaceInButton={false}>
          <Button type="primary" onClick={this.handleSave}>
            {_l('确认')}
          </Button>
        </ConfigProvider>
      </div>
    );
  }
  render() {
    const { dialogVisible } = this.props;
    return (
      <Modal
        title={_l('数据源')}
        width={640}
        className="chartModal chartSheetModal"
        visible={dialogVisible}
        centered={true}
        destroyOnClose={true}
        closeIcon={<Icon icon="close" className="Font24 pointer Gray_9e" />}
        footer={this.renderFooter()}
        onCancel={() => {
          this.props.onChangeDialogVisible(false);
        }}
      >
        {this.renderContent()}
      </Modal>
    );
  }
}
