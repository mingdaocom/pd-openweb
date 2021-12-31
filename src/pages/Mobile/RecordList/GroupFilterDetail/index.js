import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../redux/actions';
import { ActivityIndicator, Flex, Drawer } from 'antd-mobile';
import View from '../View';
import Back from '../../components/Back';
import QuickFilter from 'src/pages/Mobile/RecordList/QuickFilter';
import RecordAction from 'src/pages/Mobile/Record/RecordAction';
import worksheetAjax from 'src/api/worksheet';
import { Icon, Button } from 'ming-ui';
import './index.less';

const formatParams = params => {
  const { appId, viewId } = params;
  return {
    ...params,
    appId: ['null', 'undefined'].includes(appId) ? '' : appId,
    viewId: ['null', 'undefined'].includes(viewId) ? '' : viewId,
  };
};
const CUSTOM_BUTTOM_CLICK_TYPE = {
  IMMEDIATELY: 1,
  CONFIRM: 2,
  FILL_RECORD: 3,
};

class GroupFilterDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    const { base = {} } = this.props;
    const { viewId } = base;
    if (!viewId) {
      const { params } = this.props.match;
      const { viewId, appId, worksheetId, rowId } = params;
      this.props.updateBase({ viewId, appId, worksheetId, rowId });
      this.props.loadWorksheet();
    } else {
      this.getNavGroupFitlers(this.props);
    }
    this.loadCustomBtns();
  }
  componentWillReceiveProps(nextProps) {
    const { base = {} } = nextProps;
    if (_.isEqual(base, this.props.base)) {
      this.getNavGroupFitlers(nextProps);
    }
  }
  componentWillUnmount() {
    this.props.changeBatchOptVisible(false);
  }

  getNavGroupFitlers = props => {
    const { params } = props.match;
    const { viewId, rowId } = params;
    const { views = [], controls = [] } = props;
    const view = _.find(views, { viewId }) || (viewId === 'all' && views[0]) || {};
    const navGroup = view.navGroup && view.navGroup.length > 0 ? view.navGroup[0] : {};
    let soucre = controls.find(o => o.controlId === navGroup.controlId) || {};
    let obj = _.omit(navGroup, ['isAsc']);
    let navGroupFilters = [
      {
        ...obj,
        values: [rowId],
        dataType: soucre.type,
        filterType: soucre.type === 29 || soucre.type === 35 ? 24 : 2,
      },
    ];
    this.props.changeMobielSheetLoading(false);
    if (rowId === 'all') {
      props.changeMobileGroupFilters([]);
    } else {
      props.changeMobileGroupFilters(navGroupFilters);
    }
  };
  handleOpenDrawer = () => {
    const { filters } = this.props;
    this.props.updateFilters({
      visible: !filters.visible,
    });
  };
  renderSidebar(view) {
    const { fastFilters = [] } = view;
    const { worksheetInfo } = this.props;
    const sheetControls = _.get(worksheetInfo, ['template', 'controls']);
    const filters = fastFilters
      .map(filter => ({
        ...filter,
        control: _.find(sheetControls, c => c.controlId === filter.controlId),
      }))
      .filter(c => c.control);
    return <QuickFilter view={view} filters={filters} controls={sheetControls} onHideSidebar={this.handleOpenDrawer} />;
  }
  // 加载自定义按钮数据
  loadCustomBtns = () => {
    const { params } = this.props.match;
    worksheetAjax
      .getWorksheetBtns({
        ...formatParams(params),
      })
      .then(data => {
        this.setState({
          customBtns: data.filter(
            item =>
              item.clickType === CUSTOM_BUTTOM_CLICK_TYPE.IMMEDIATELY ||
              item.clickType === CUSTOM_BUTTOM_CLICK_TYPE.CONFIRM ||
              (item.writeObject === 1 && item.writeType === 1),
          ),
        });
      });
  };
  showCustomButtoms = () => {
    this.setState({
      showButtons: !this.state.showButtons,
    });
  };
  // 批量操作全选
  selectedAll = () => {
    const { batchOptCheckedData, currentSheetRows } = this.props;
    if (!_.isEqual(currentSheetRows.length, batchOptCheckedData.length)) {
      this.props.changeBatchOptData(currentSheetRows.map(item => item.rowid));
    } else {
      this.props.changeBatchOptData([]);
    }
  };
  // 批量删除
  batchDelete = () => {
    const {
      batchOptCheckedData = [],
      worksheetInfo,
      sheetViewConfig,
      quickFilter,
      navGroupFilters,
      currentSheetRows,
    } = this.props;
    const { appId, worksheetId, viewId } = this.props.match.params || {};
    const { allWorksheetIsSelected } = sheetViewConfig;
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    Modal.alert(
      <div className="Font16" style={{ fontWeight: 700, textAlign: 'center' }}>
        {_l('确认删除记录?')}
      </div>,
      <div className="Font13" style={{ color: '#333' }}>
        {_l('60天内可在 回收站 内找回已删除%0，无编辑权限的数据无法删除。', worksheetInfo.entityName)}
      </div>,
      [
        {
          text: _l('取消'),
          style: {
            color: '#2196F3',
            fontWeight: 700,
            borderTop: '1px solid #dedede',
            borderRight: '1px solid #dedede',
            fontSize: '16px',
          },
          onPress: () => {},
        },
        {
          text: '删除',
          style: { color: '#F44336', fontWeight: 700, borderTop: '1px solid #dedede', fontSize: '16px' },
          onPress: () => {
            const hasAuthRowIds = currentSheetRows
              .filter(item => _.includes(batchOptCheckedData, item.rowid))
              .filter(item => item.allowdelete || item.allowDelete)
              .map(item => item.rowid);
            if (_.isEmpty(batchOptCheckedData)) {
              alert(_l('未选中记录'), 3);
              return;
            }
            if (!allWorksheetIsSelected && hasAuthRowIds.length === 0) {
              alert(_l('无权限删除选择的记录'), 3);
            } else {
              const args = {
                appId,
                viewId,
                worksheetId,
                isAll: allWorksheetIsSelected,
              };
              if (args.isAll) {
                args.excludeRowIds = batchOptCheckedData.map(item => item.rowid);
                args.fastFilters = (quickFilter || []).map(f =>
                  _.pick(f, [
                    'controlId',
                    'dataType',
                    'spliceType',
                    'filterType',
                    'dateRange',
                    'value',
                    'values',
                    'minValue',
                    'maxValue',
                  ]),
                );
                args.navGroupFilters = navGroupFilters;
                args.filterControls = filters.filterControls;
                args.keyWords = filters.keyWords;
                args.searchType = filters.searchType;
              } else {
                args.rowIds = hasAuthRowIds;
              }
              worksheetAjax
                .deleteWorksheetRows(args)
                .then(res => {
                  if (res.isSuccess) {
                    if (hasAuthRowIds.length === batchOptCheckedData.length) {
                      alert(_l('删除成功'));
                      this.props.fetchSheetRows();
                    } else if (hasAuthRowIds.length < batchOptCheckedData.length) {
                      alert(_l('删除成功，无编辑权限的记录无法删除'));
                    }
                    this.props.changeBatchOptData([]);
                  }
                })
                .fail(err => {
                  alert(_l('批量删除失败', 3));
                });
            }
          },
        },
      ],
    );
  };
  triggerCustomBtn = (btn, isAll) => {
    const { worksheetId, viewId, batchOptCheckedData, filters, quickFilter, navGroupFilters } = this.props;
    const { filterControls, keyWords, searchType } = filters;
    let args = { isAll };
    if (isAll) {
      args = {
        ...args,
        viewId,
        filterControls,
        keyWords,
        navGroupFilters,
      };
      args.fastFilters = (_.isArray(quickFilter) ? quickFilter : []).map(f =>
        _.pick(f, [
          'controlId',
          'dataType',
          'spliceType',
          'filterType',
          'dateRange',
          'value',
          'values',
          'minValue',
          'maxValue',
        ]),
      );
    }
    if (searchType === 2) {
      args.filterControls = [
        {
          controlId: 'ownerid',
          dataType: 26,
          filterType: 2,
          spliceType: 1,
          values: [md.global.Account.accountId],
        },
      ];
    }
    this.props.changeBatchOptData([]);
    startProcess({
      appId: worksheetId,
      sources: batchOptCheckedData,
      triggerId: btn.btnId,
      ...args,
    }).then(data => {
      if (!data) {
        alert(_l('失败，所有记录都不满足执行条件，或流程尚未启用'));
        this.setState({ runInfoVisible: false });
      } else {
        this.showRunInfo(true);
        this.props.fetchSheetRows();
      }
    });
  };
  handleBatchOperateCustomBtn = btn => {
    const { allWorksheetIsSelected, batchOptCheckedData } = this.props;
    if (allWorksheetIsSelected && batchOptCheckedData && batchOptCheckedData.length > 1000) {
      alert(_l('前选中数量超过1000条，无法执行此操作'));
    }
    if (btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.IMMEDIATELY) {
      // 立即执行
      this.triggerCustomBtn(btn, allWorksheetIsSelected);
    } else if (btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.CONFIRM) {
      // 二次确认
      Modal.alert(_l('你确认对记录执行此操作吗？'), '', [
        { text: _l('取消'), onPress: () => {}, style: 'default' },
        { text: _l('确定'), onPress: () => this.triggerCustomBtn(btn, allWorksheetIsSelected) },
      ]);
    }
    this.setState({ showButtons: false });
    this.props.changeBatchOptVisible(false);
  };
  showRunInfo = flag => {
    this.setState({ runInfoVisible: flag });
  };
  render() {
    const { params } = this.props.match;
    const { viewId, txt } = params;
    let { navGroupFilters = [], showButtons, customBtns = [] } = this.state;
    const {
      views = [],
      worksheetInfo,
      workSheetLoading,
      filters,
      batchOptVisible,
      batchOptCheckedData,
      mobileViewPermission,
    } = this.props;
    const view = _.find(views, { viewId }) || (viewId === 'all' && views[0]) || {};
    if (workSheetLoading) {
      return (
        <Flex justify="center" align="center" className="h100">
          <ActivityIndicator size="large" />
        </Flex>
      );
    }
    return (
      <Drawer
        className="groupFilterDeatailDraer"
        position="right"
        open={filters.visible}
        sidebar={_.isEmpty(view) ? null : this.renderSidebar(view)}
        onOpenChange={this.handleOpenDrawer}
      >
        <div className="flexColumn h100 Relative groupFitlerDetail">
          {!batchOptVisible && <div className="title Font18">{txt}</div>}
          {view && Object.keys(view).length ? <View view={view} /> : null}

          {!batchOptVisible && (
            <div className="addRecordItemWrapper">
              <Button
                className="addRecordBtn flex valignWrapper"
                onClick={() => {
                  window.mobileNavigateTo(
                    `/mobile/addRecord/${params.appId}/${worksheetInfo.worksheetId}/${view.viewId}`,
                  );
                }}
              >
                <Icon icon="add" className="Font22" />
                {worksheetInfo.entityName}
              </Button>
            </div>
          )}

          {!batchOptVisible && (
            <Back
              style={{
                bottom: view.viewType === 0 && mobileViewPermission && mobileViewPermission.canRemove ? '80px' : '20px',
              }}
              onClick={() => {
                this.props.changeMobielSheetLoading(true);
                this.props.history.goBack();
              }}
            />
          )}

          {mobileViewPermission && mobileViewPermission.canRemove && !batchOptVisible && view.viewType === 0 && (
            <div
              className="batchOperation"
              onClick={() => {
                this.props.changeBatchOptVisible(true);
              }}
            >
              <Icon icon="task-complete" className="Font24" />
            </div>
          )}

          <RecordAction
            recordActionVisible={showButtons}
            {...formatParams(params)}
            customBtns={customBtns}
            worksheetInfo={worksheetInfo}
            loadRow={() => {}}
            loadCustomBtns={this.loadCustomBtns}
            hideRecordActionVisible={() => {
              this.setState({ showButtons: false });
            }}
            isMobileOperate={true}
            batchOptCheckedData={batchOptCheckedData}
            fetchSheetRows={this.props.fetchSheetRows}
            view={view}
            worksheetControls={this.props.worksheetControls}
            changeBatchOptData={this.props.changeBatchOptData}
            handleBatchOperateCustomBtn={this.handleBatchOperateCustomBtn}
            runInfoVisible={this.state.runInfoVisible}
            showRunInfo={this.showRunInfo}
            handleUpdateWorksheetRow={this.handleUpdateWorksheetRow}
            currentSheetRows={this.props.currentSheetRows}
          />
        </div>
      </Drawer>
    );
  }
}

export default connect(
  state => ({
    base: state.mobile.base,
    views: state.sheet.views,
    controls: state.sheet.controls,
    worksheetInfo: state.mobile.worksheetInfo,
    sheetSwitchPermit: state.mobile.sheetSwitchPermit,
    workSheetLoading: state.mobile.workSheetLoading,
    filters: state.mobile.filters,
    batchOptCheckedData: state.mobile.batchOptCheckedData,
    quickFilter: state.mobile.quickFilter,
    currentSheetRows: state.mobile.currentSheetRows,
    sheetView: state.mobile.sheetView,
    batchOptVisible: state.mobile.batchOptVisible,
    worksheetControls: state.mobile.worksheetControls,
    sheetViewConfig: state.sheet.sheetview.sheetViewConfig,
    navGroupFilters: state.sheet.navGroupFilters,
    mobileViewPermission: state.mobile.mobileViewPermission,
  }),
  dispatch =>
    bindActionCreators(
      _.pick(actions, [
        'updateBase',
        'loadWorksheet',
        'changeMobileGroupFilters',
        'changeMobielSheetLoading',
        'updateFilters',
        'changeBatchOptVisible',
        'changeBatchOptData',
        'fetchSheetRows',
      ]),
      dispatch,
    ),
)(GroupFilterDetail);
