import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv, SvgIcon } from 'ming-ui';
import { Button, Input, Modal, Select, Tabs } from 'ming-ui/antd-components';
import appManagementApi from 'src/api/appManagement';
import homeAppApi from 'src/api/homeApp';
import sheetApi from 'src/api/worksheet';
import syncTaskApi from 'src/pages/integration/api/syncTask';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { getTranslateInfo } from 'src/utils/services/app';
import { getFeatureStatus } from 'src/utils/services/project';

const Wrap = styled.div`
  .hap-tabs-nav {
    margin-bottom: 0 !important;
    &::before {
      border-bottom: none !important;
    }
    .hap-tabs-tab-active .hap-tabs-tab-btn {
      font-weight: bold;
    }
  }
  .hap-tabs-content {
    border: 1px solid var(--color-border-primary);
    border-radius: 4px;
  }
  .searchWrap {
    padding: 2px 10px;
    border-bottom: 1px solid var(--color-border-secondary);
  }
  .workSheetListWrap {
    padding: 6px 0;
    height: 300px;
    overflow-y: auto;
    .sheetItem {
      padding: 10px;
      &:hover {
        background-color: var(--color-background-hover);
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
      &.active,
      &:hover {
        background-color: var(--color-background-hover);
      }
    }
  }
  .iconWrap {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    justify-content: center;
    background: var(--color-background-secondary);
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
    this.hideAggregation =
      ((window.platformENV.isOverseas || window.platformENV.isLocal) && !md.global.Config.EnableDataPipeline) ||
      !featureType ||
      featureType === '2';
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
    appManagementApi
      .getManagerApps({
        projectId,
      })
      .then(data => {
        this.setState({
          myApps: data.map(app => ({
            label: appId === app.appId ? `${app.appName} (${_l('本应用')})` : app.appName,
            value: app.appId,
          })),
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
          sheetsLoading: false,
        });
      });
  }
  getAggregationSheetList(appId) {
    const { projectId } = this.props;
    this.setState({ aggregationSheetsLoading: true });
    syncTaskApi
      .list(
        {
          projectId,
          appId,
          pageNo: 0,
          pageSize: 9999,
          taskType: 1,
        },
        {
          isAggTable: true,
        },
      )
      .then(data => {
        const { content } = data;
        this.setState({
          aggregationSheets: content.filter(n => n.aggTableTaskStatus !== 0 && n.taskStatus !== 'ERROR'),
          aggregationSheetsLoading: false,
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
    const { newWorksheetId } = this.state;
    const isActive = newWorksheetId === sheet.workSheetId;

    return (
      <Fragment key={sheet.workSheetId}>
        <div
          className="sheetItem pointer flexRow alignItemsCenter pLeft20"
          onClick={() => {
            this.setState(
              {
                newWorksheetId: sheet.workSheetId,
                viewId: null,
                appType: 1,
              },
              () => {
                this.getWorksheetViews(sheet.workSheetId);
              },
            );
          }}
        >
          <SvgIcon
            className="svgIconWrap"
            url={sheet.iconUrl}
            fill={isActive ? 'var(--color-primary)' : 'var(--color-text-tertiary)'}
            size={18}
          />
          <span className={cx('bold mLeft8 ellipsis', { colorPrimary: isActive })}>{sheet.workSheetName}</span>
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
              appType: 2,
            });
          }}
        >
          <Icon className={cx('Font20', isActive ? 'colorPrimary' : 'textTertiary')} icon="aggregate_table" />
          <span className={cx('bold mLeft8 ellipsis flex', { colorPrimary: isActive })}>{sheet.name}</span>
          {isActive && <Icon className="colorPrimary Font18" icon="done" />}
        </div>
      </Fragment>
    );
  }
  renderSearch() {
    const { searchValue } = this.state;
    return (
      <div className="searchWrap flexRow alignItemsCenter">
        <Icon className="Font18 textTertiary mRight3" icon="search" />
        <Input
          variant="borderless"
          className="w100"
          placeholder={_l('搜索')}
          value={searchValue}
          onChange={e => this.setState({ searchValue: e.target.value })}
        />
      </div>
    );
  }
  renderContent() {
    const { worksheetInfo, projectId, sourceType, ownerId } = this.props;
    const {
      appId,
      myApps,
      sheets,
      sheetsLoading,
      views,
      newWorksheetId,
      searchValue,
      viewId,
      aggregationSheets,
      aggregationSheetsLoading,
      activeKey,
    } = this.state;
    return (
      <div>
        {sourceType ? (
          <Fragment>
            <div className="mBottom10">{_l('应用')}</div>
            <Select
              showPopupSearch
              className="w100"
              classNames={{ popup: { root: 'statisticsSelectWorksheetDropdownMenu' } }}
              placeholder={_l('请选择你作为管理员或开发者的应用')}
              notFoundContent={_l('没有可选的应用')}
              defaultValue={appId}
              optionFilterProp="label"
              options={myApps}
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
                items={[
                  {
                    key: 'workSheet',
                    label: _l('工作表'),
                    children: (
                      <Fragment>
                        {this.renderSearch()}
                        {sheetsLoading ? (
                          <LoadDiv className="mTop10 mBottom10" />
                        ) : (
                          <div className="workSheetListWrap">
                            {sheets
                              .filter(item => (item.workSheetName || '').includes(searchValue))
                              .map(item => this.renderWorkSheetItem(item))}
                          </div>
                        )}
                      </Fragment>
                    ),
                  },
                  ...(!this.hideAggregation
                    ? [
                        {
                          key: 'polymerizationSheet',
                          label: _l('聚合表'),
                          children: (
                            <Fragment>
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
                                        <Icon className="Font50 textTertiary" icon="aggregate_table" />
                                      </div>
                                      <span className="Font14 textTertiary mTop20 mBottom24">
                                        {_l('将表单或多表数据预处理为聚合数据')}
                                      </span>
                                      {getFeatureStatus(projectId, VersionProductType.aggregation) == '1' && (
                                        <Button
                                          type="primary"
                                          onClick={() => {
                                            window.open(
                                              pathCompletion(`/app/${this.state.appId}/settings/aggregations`),
                                            );
                                          }}
                                          style={{ borderRadius: 20 }}
                                        >
                                          {_l('创建')}
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Fragment>
                          ),
                        },
                      ]
                    : []),
                ]}
              />
            </Wrap>
          </Fragment>
        ) : (
          (worksheetInfo.worksheetId || newWorksheetId) && (
            <Fragment>
              <div className="mBottom10">{_l('视图')}</div>
              <Select
                className="w100"
                value={viewId || null}
                suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
                options={[
                  ...(!ownerId
                    ? [
                        {
                          value: null,
                          label: _l('所有记录'),
                        },
                      ]
                    : []),
                  ...(views || [])
                    .filter(view => view.worksheetId !== view.viewId)
                    .map(item => ({
                      value: item.viewId,
                      label: getTranslateInfo(appId, null, item.viewId).name || item.name,
                    })),
                ]}
                onChange={viewId => {
                  this.setState({ viewId });
                }}
              />
            </Fragment>
          )
        )}
      </div>
    );
  }
  renderSourceActions() {
    const { appId, sourceType, projectId } = this.props;
    const { newWorksheetId, sheets, viewId, viewsData, activeKey } = this.state;
    const { views = [], loading } = viewsData[newWorksheetId] || {};
    const showViewSelector =
      sourceType && newWorksheetId && _.find(sheets, { workSheetId: newWorksheetId }) && activeKey === 'workSheet';
    const showCreateAggregation =
      activeKey === 'polymerizationSheet' && getFeatureStatus(projectId, VersionProductType.aggregation) == '1';

    if (!showViewSelector && !showCreateAggregation) return null;

    return (
      <div className="flexRow alignItemsCenter">
        {showViewSelector &&
          (loading ? (
            <LoadDiv className="mLeft0" size="small" />
          ) : (
            <Fragment>
              <div className="mRight10">{_l('视图')}</div>
              <Select
                className="leftAlign"
                style={{ width: 200 }}
                value={viewId || null}
                suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
                options={[
                  {
                    value: null,
                    label: _l('所有记录'),
                  },
                  ...(views || [])
                    .filter(view => view.worksheetId !== view.viewId)
                    .map(item => ({
                      value: item.viewId,
                      label: getTranslateInfo(appId, null, item.viewId).name || item.name,
                    })),
                ]}
                onChange={viewId => {
                  this.setState({ viewId });
                }}
              />
            </Fragment>
          ))}
        {showCreateAggregation && (
          <div
            className="flexRow alignItemsCenter colorPrimary pointer"
            onClick={() => window.open(pathCompletion(`/app/${this.state.appId}/settings/aggregations`))}
          >
            <Icon icon="add" className="mRight2" />
            {_l('新建聚合表')}
          </div>
        )}
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
        open={dialogVisible}
        centered={true}
        closeIcon={<Icon icon="close" className="Font24 pointer textTertiary" />}
        footerLeftElement={this.renderSourceActions()}
        onOk={this.handleSave}
        onCancel={() => {
          this.props.onChangeDialogVisible(false);
        }}
      >
        {this.renderContent()}
      </Modal>
    );
  }
}
