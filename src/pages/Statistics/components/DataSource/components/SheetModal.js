import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { ConfigProvider, Select, Modal, Button, Tabs } from 'antd';
import { Icon, Dropdown, LoadDiv, SvgIcon } from 'ming-ui';
import sheetApi from 'src/api/worksheet';
import homeAppApi from 'src/api/homeApp';
import syncTaskApi from 'src/pages/integration/api/syncTask';
import { getTranslateInfo } from 'src/util';
import { canEditApp } from 'worksheet/redux/actions/util';
import { VIEW_DISPLAY_TYPE, VIEW_TYPE_ICON } from 'worksheet/constants/enum';
import styled from 'styled-components';

const Wrap = styled.div`
  .ant-tabs-nav {
    margin-bottom: 0 !important;
    &::before {
      border-bottom: none !important;
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
    width: 120px;
    height: 120px;
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
      aggregationSheets: [],
      searchValue: '',
      views: props.worksheetInfo.views,
      viewsData: {},
      viewId: props.viewId,
      newWorksheetId: props.worksheetInfo.worksheetId,
      appType: props.appType
    };
  }
  componentDidMount() {
    const { appId } = this.props;
    this.getMyApps();
    this.getSheets(appId);
    // this.getAggregationSheetList(appId);
  }
  componentWillReceiveProps(nextProps) {}
  getMyApps() {
    const { projectId } = this.props;
    homeAppApi.getAllHomeApp().then(data => {
      let apps = [];
      if (projectId) {
        apps = _.flatten(
          data.validProject.filter(project => project.projectId === projectId).map(project => project.projectApps),
        );
      } else {
        apps = data.aloneApps;
      }
      this.setState({
        myApps: apps
          .filter(app => canEditApp(app.permissionType) && !app.isLock)
          .map(app => ({ text: app.name, value: app.id })),
      });
    });
  }
  getSheets(appId) {
    homeAppApi
      .getWorksheetsByAppId({
        appId,
        type: 0,
      })
      .then(data => {
        this.setState({
          sheets: data,
        });
      });
  }
  getAggregationSheetList(appId) {
    const { projectId } = this.props;
    syncTaskApi.list({
      projectId,
      appId,
      pageNo: 0,
      pageSize: 9999,
      taskType: 1
    }).then(data => {
      const { content } = data;
      this.setState({
        aggregationSheets: content.filter(n => n.taskStatus === 'RUNNING')
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
    const { viewId, newWorksheetId, appType } = this.state;
    if (viewId || viewId === null) {
      this.props.onChange(newWorksheetId, viewId, appType);
    } else {
      alert(_l('请选择一个视图'), 3);
    }
  };
  renderWorkSheetItem(sheet) {
    const { newWorksheetId, viewId, viewsData } = this.state;
    const { views = [], show, loading } = viewsData[sheet.workSheetId] || {};
    const isActive = newWorksheetId === sheet.workSheetId;

    const renderView = view => {
      const id = VIEW_DISPLAY_TYPE[view.viewType || 0];
      const { icon, color } = _.find(VIEW_TYPE_ICON, { id }) || {};
      const isActiveView = isActive && viewId === view.viewId;
      return (
        <div
          className={cx('viewItem pointer flexRow alignItemsCenter', { active: isActiveView })}
          key={view.viewId}
          onClick={() => {
            this.setState({
              newWorksheetId: sheet.workSheetId,
              viewId: view.viewId,
              appType: 1
            });
          }}
        >
          <Icon className={cx('Font18 mRight8', { Visibility: view.viewId === null })} icon={icon} style={{ color }} />
          <span className={cx('flex', { ThemeColor: isActiveView })}>{view.name}</span>
          {isActiveView && <Icon className="ThemeColor Font18" icon="done" />}
        </div>
      );
    };

    return (
      <Fragment key={sheet.workSheetId}>
        <div
          className="sheetItem pointer flexRow alignItemsCenter"
          onClick={() => {
            this.getWorksheetViews(sheet.workSheetId);
          }}
        >
          <Icon className="Gray_9e mRight8" icon={show ? 'arrow-down' : 'arrow-right-tip'} />
          <SvgIcon className="svgIconWrap" url={sheet.iconUrl} fill={isActive || show ? '#2196f3' : '#9e9e9e'} size={18} />
          <span className={cx('bold mLeft8', { ThemeColor: isActive || show })}>{sheet.workSheetName}</span>
          {loading && <LoadDiv className="mLeft5" size="small" />}
        </div>
        {!!views.length && show && (
          <div className="viewsWrap">
            {[{ name: _l('无（所有记录）'), viewId: null }].concat(views).map(view => renderView(view))}
          </div>
        )}
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
          <Icon className="Font20 Gray_9e" icon="aggregate_table" />
          <span className={cx('bold mLeft8 flex', { ThemeColor: isActive })}>{sheet.name}</span>
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
          class="w100"
          placeholder={_l('搜索')}
          type="text"
          value={searchValue}
          onChange={e => this.setState({ searchValue: e.target.value })}
        />
      </div>
    );
  }
  renderContent() {
    const { worksheetInfo, appId, projectId, sourceType, ownerId } = this.props;
    const { myApps, sheets, views, newWorksheetId, searchValue, viewId, aggregationSheets } = this.state;
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
                this.getSheets(value);
              }}
            />
            <Wrap>
              <Tabs className="mTop10" defaultActiveKey="1" centered={true}>
                <Tabs.TabPane tab={_l('工作表')} key="workSheet">
                  {this.renderSearch()}
                  <div className="workSheetListWrap">
                    {sheets
                      .filter(item => item.workSheetName.includes(searchValue))
                      .map(item => this.renderWorkSheetItem(item))}
                  </div>
                </Tabs.TabPane>
                {/*
                <Tabs.TabPane tab={_l('聚合表')} key="polymerizationSheet">
                  {this.renderSearch()}
                  <div className="workSheetListWrap">
                    {aggregationSheets.length ? (
                      aggregationSheets
                        .filter(item => item.name.includes(searchValue))
                        .map(item => this.renderAggregationSheetItem(item))
                    ) : (
                      <div className="flexColumn alignItemsCenter justifyContentCenter h100">
                        <div className="iconWrap flexRow alignItemsCenter justifyContentCenter">
                          <Icon className="Font50 Gray_9e" icon="table" />
                        </div>
                        <span className="Font17 Gray_9e mTop10">{_l('将表单或多表数据预处理为聚合数据')}</span>
                      </div>
                    )}
                  </div>
                </Tabs.TabPane>
                */}
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
                    {_l('无（所有记录）')}
                  </Select.Option>
                )}
                {(views || []).map(item => (
                  <Select.Option className="selectOptionWrapper" key={item.viewId} value={item.viewId}>
                    {getTranslateInfo(appId, item.viewId).name || item.name}
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
    return (
      <div className="mTop20 mBottom10 pRight8">
        <ConfigProvider autoInsertSpaceInButton={false}>
          <Button
            type="link"
            onClick={() => {
              this.props.onChangeDialogVisible(false);
            }}
          >
            {_l('取消')}
          </Button>
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
