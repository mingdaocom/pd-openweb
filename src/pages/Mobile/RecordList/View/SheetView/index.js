import React, { Fragment, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import cx from 'classnames';
import styled from 'styled-components';
import * as actions from 'mobile/RecordList/redux/actions';
import * as sheetviewActions from 'src/pages/worksheet/redux/actions/sheetview.js';
import { refreshWorksheetControls } from 'worksheet/redux/actions';
import { Modal, Drawer } from 'antd-mobile';
import { Icon, Button } from 'ming-ui';
import QuickFilter from 'mobile/RecordList/QuickFilter';
import Search from 'mobile/RecordList/QuickFilter/Search';
import SheetRows, { WithoutRows } from '../../SheetRows';
import { Flex, ActivityIndicator } from 'antd-mobile';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import worksheetAjax from 'src/api/worksheet';
import { TextTypes } from 'src/pages/worksheet/common/Sheet/QuickFilter/Inputs';
import RecordAction from 'mobile/Record/RecordAction';
import { startProcess } from 'src/pages/workflow/api/process';

const SearchWrapper = styled.div`
  background-color: #f2f2f3;

  .filterStepListWrapper {
    -webkit-overflow-scrolling: touch;
    position: inherit;
    .am-drawer-sidebar {
      z-index: 100;
      border-radius: 14px 0 0 14px;
      background-color: #fff;
      overflow: hidden;
      -webkit-overflow-scrolling: touch;
    }
    .am-drawer-overlay,
    .am-drawer-content {
      position: inherit;
    }
    &.am-drawer-open {
      z-index: 100;
      position: fixed;
    }
    &.bottom50 {
      bottom: 50px;
    }
  }
`;

const FilterWrapper = styled.div`
  background-color: #fff;
  padding: 10px;
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  .active {
    color: #33a3f4 !important;
  }
`;

const BatchOptBtn = styled.div`
  display: flex;
  height: 56px;
  justify-content: space-between;
  padding: 17px 24px;
  font-weight: 700;
  box-shadow: 0 -6px 12px rgba(0, 0, 0, 0.12);
  background-color: #fff;
  font-size: 15px;
  border-radius: 8px 8px 0 0;
  z-index: 1;
  .deleteOpt {
    color: #f44336;
  }
  .disabledDel {
    color: rgba(244, 67, 54, 0.5);
  }
  .extraOpt {
    text-align: right;
    i {
      color: #9e9e9e;
      vertical-align: middle;
    }
  }
  .disabledExtra {
    color: rgba(158, 158, 158, 0.5);
    i {
      color: rgba(158, 158, 158, 0.5);
      vertical-align: middle;
    }
  }
}
`;

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

@withRouter
class SheetView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    this.loadCustomBtns(this.props.match.params);
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.match.params, nextProps.match.params)) {
      this.loadCustomBtns(nextProps.match.params);
    }
  }
  componentWillUnmount() {
    this.props.changeBatchOptVisible(false);
  }
  renderWithoutRows() {
    const { match, worksheetInfo, sheetSwitchPermit, filters, quickFilter, view } = this.props;

    if (filters.keyWords) {
      return <WithoutRows text={_l('??????????????????')} />;
    }

    if (quickFilter.length) {
      return <WithoutRows text={_l('???????????????????????????')} />;
    }

    return (
      <Fragment>
        <WithoutRows
          text={_l('????????????????????????')}
          children={
            isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) &&
            worksheetInfo.allowAdd && (
              <Button
                className="addRecordBtn valignWrapper mTop10"
                onClick={() => {
                  window.mobileNavigateTo(
                    `/mobile/addRecord/${match.params.appId}/${worksheetInfo.worksheetId}/${view.viewId}`,
                  );
                }}
              >
                <Icon icon="add" className="Font22 White" />
                {worksheetInfo.entityName}
              </Button>
            )
          }
        />
      </Fragment>
    );
  }
  renderContent() {
    const { view, currentSheetRows, sheetRowLoading, sheetView, quickFilter, batchOptCheckedData } = this.props;
    const needClickToSearch = _.get(view, 'advancedSetting.clicksearch') === '1';

    if (sheetRowLoading && sheetView.pageIndex === 1) {
      return (
        <Flex justify="center" align="center" className="h100">
          <ActivityIndicator size="large" />
        </Flex>
      );
    }

    if (needClickToSearch && _.isEmpty(quickFilter)) {
      return <WithoutRows text={_l('???????????????????????????')} />;
    }

    return currentSheetRows.length || batchOptCheckedData.length ? (
      <SheetRows view={view} navigateTo={window.mobileNavigateTo} />
    ) : (
      this.renderWithoutRows()
    );
  }
  // ???????????????????????????
  loadCustomBtns = paramsData => {
    const { view } = this.props;
    this.setState({ customButtonLoading: true });
    worksheetAjax
      .getWorksheetBtns({
        ...formatParams(paramsData),
        viewId: formatParams(paramsData).viewId ? formatParams(paramsData).viewId : view.viewId,
      })
      .then(data => {
        this.setState({
          customBtns: data.filter(
            item =>
              _.includes([CUSTOM_BUTTOM_CLICK_TYPE.IMMEDIATELY, CUSTOM_BUTTOM_CLICK_TYPE.CONFIRM], item.clickType) ||
              (item.writeObject === 1 && item.writeType === 1),
          ),
          customButtonLoading: false,
        });
      });
  };
  showCustomButtoms = () => {
    this.setState({
      showButtons: !this.state.showButtons,
    });
  };
  // ??????????????????
  selectedAll = () => {
    const { batchOptCheckedData, currentSheetRows } = this.props;
    if (!_.isEqual(currentSheetRows.length, batchOptCheckedData.length)) {
      this.props.changeBatchOptData(currentSheetRows.map(item => item.rowid));
    } else {
      this.props.changeBatchOptData([]);
    }
  };
  comfirmDelete = () => {
    const {
      batchOptCheckedData = [],
      sheetViewConfig,
      quickFilter,
      navGroupFilters,
      currentSheetRows = [],
    } = this.props;
    const { appId, worksheetId, viewId } = this.props.match.params || {};
    const { allWorksheetIsSelected } = sheetViewConfig;
    const hasAuthRowIds = currentSheetRows
      .filter(item => _.includes(batchOptCheckedData, item.rowid))
      .filter(item => item.allowdelete || item.allowDelete)
      .map(item => item.rowid);
    if (_.isEmpty(batchOptCheckedData)) {
      alert(_l('???????????????'), 3);
      return;
    }
    if (!allWorksheetIsSelected && hasAuthRowIds.length === 0) {
      alert(_l('??????????????????????????????'), 3);
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
              alert(_l('????????????'));
              this.props.fetchSheetRows();
            } else if (hasAuthRowIds.length < batchOptCheckedData.length) {
              alert(_l('???????????????????????????????????????????????????'), 3);
            }
            this.props.changeBatchOptData([]);
          }
        })
        .fail(err => {
          alert(_l('??????????????????'), 2);
        });
      this.props.changeBatchOptVisible(false);
    }
  };
  // ????????????
  batchDelete = () => {
    const { worksheetInfo, batchOptCheckedData } = this.props;
    if (window.isPublicApp) {
      alert(_l('??????????????????????????????'), 3);
      return;
    }
    Modal.alert(
      <div className="Font16" style={{ fontWeight: 700, textAlign: 'center' }}>
        {_l('???????????????????')}
      </div>,
      <div className="Font13" style={{ color: '#333' }}>
        {_l('60???????????? ????????? ??????????????????%0??????????????????????????????????????????', worksheetInfo.entityName)}
      </div>,
      [
        {
          text: _l('??????'),
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
          text: _l('??????'),
          style: { color: '#F44336', fontWeight: 700, borderTop: '1px solid #dedede', fontSize: '16px' },
          onPress: this.comfirmDelete,
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
      alert(_l('?????????????????????1000???????????????????????????'), 3);
    }
    if (btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.IMMEDIATELY) {
      // ????????????
      this.triggerCustomBtn(btn, allWorksheetIsSelected);
    } else if (btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.CONFIRM) {
      // ????????????
      Modal.alert(_l('???????????????????????????????????????'), '', [
        { text: _l('??????'), onPress: () => {}, style: 'default' },
        { text: _l('??????'), onPress: () => this.triggerCustomBtn(btn, allWorksheetIsSelected) },
      ]);
    }
    this.setState({ showButtons: false });
    this.props.changeBatchOptVisible(false);
  };
  handleUpdateWorksheetRow = args => {
    const {
      appId,
      worksheetId,
      viewId,
      filters,
      quickFilter,
      navGroupFilters,
      allWorksheetIsSelected,
      batchOptCheckedData,
      changeBatchOptData,
      refreshWorksheetControls,
    } = this.props;
    const rowIds = batchOptCheckedData;
    const controls = args.newOldControl;
    const updateArgs = {
      ...args,
      appId,
      viewId,
      worksheetId,
      rowIds,
      controls,
    };
    if (allWorksheetIsSelected) {
      delete args.rowIds;
      updateArgs.isAll = true;
      updateArgs.excludeRowIds = batchOptCheckedData;
      updateArgs.filterControls = filters.filterControls;
      updateArgs.keyWords = filters.keyWords;
      updateArgs.searchType = filters.searchType;
      updateArgs.fastFilters = (quickFilter || []).map(f =>
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
      updateArgs.navGroupFilters = navGroupFilters;
    }
    worksheetAjax.updateWorksheetRows(updateArgs).then(data => {
      changeBatchOptData([]);
      this.props.changeBatchOptVisible(false);
      if (data.successCount === batchOptCheckedData.length && args.workflowType === 2) {
        alert(_l('????????????'));
      }
      if (_.find(controls, item => _.includes([10, 11], item.type) && /color/.test(item.value))) {
        refreshWorksheetControls();
      }
      this.props.fetchSheetRows();
    });
  };
  showRunInfo = flag => {
    this.setState({ runInfoVisible: flag });
  };
  handleOpenDrawer = () => {
    const { filters, updateFilters } = this.props;
    updateFilters({ visible: !filters.visible });
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
    return (
      <QuickFilter
        projectId={worksheetInfo.projectId}
        appId={worksheetInfo.appId}
        worksheetId={worksheetInfo.worksheetId}
        view={view}
        filters={filters}
        controls={sheetControls}
        onHideSidebar={this.handleOpenDrawer}
      />
    );
  }
  render() {
    const {
      view,
      filters,
      worksheetInfo,
      quickFilter,
      batchOptCheckedData,
      batchOptVisible,
      match,
      sheetSwitchPermit,
      appDetail,
    } = this.props;
    const { detail } = appDetail;
    const { params } = match;
    let { customBtns = [], showButtons, customButtonLoading } = this.state;
    const sheetControls = _.get(worksheetInfo, ['template', 'controls']);
    const viewFilters = view.fastFilters
      .map(filter => ({
        ...filter,
        control: _.find(sheetControls, c => c.controlId === filter.controlId),
      }))
      .filter(c => c.control);
    const excludeTextFilter = viewFilters.filter(item => !TextTypes.includes(item.dataType));
    const textFilters = viewFilters.filter(item => TextTypes.includes(item.dataType));
    const isFilter = quickFilter.filter(item => !TextTypes.includes(item.dataType)).length;
    let checkedCount = batchOptCheckedData.length;
    const canDelete =
      isOpenPermit(permitList.delete, sheetSwitchPermit, view.viewId) && !_.isEmpty(batchOptCheckedData);
    const showCusTomBtn =
      isOpenPermit(permitList.execute, sheetSwitchPermit, view.viewId) &&
      !customButtonLoading &&
      !_.isEmpty(customBtns) &&
      !_.isEmpty(batchOptCheckedData);
    return (
      <Fragment>
        {batchOptVisible && (
          <div className="batchOptBar flexRow Font16">
            <a
              onClick={() => {
                this.props.changeBatchOptVisible(false);
                this.props.changeBatchOptData([]);
              }}
            >
              {_l('??????')}
            </a>
            {_.isEmpty(batchOptCheckedData) && <span>{_l('?????????')}</span>}
            {!_.isEmpty(batchOptCheckedData) && <span>{_l(`?????????%0???`, checkedCount)}</span>}
            <a onClick={this.selectedAll}>{_l('??????')}</a>
          </div>
        )}
        <SearchWrapper className="searchWrapper flexRow valignWrapper pLeft12 pRight12 pTop15 pBottom5">
          <Search textFilters={textFilters} />
          {!_.isEmpty(excludeTextFilter) && (
            <FilterWrapper>
              <Icon
                icon="filter"
                className={cx('Font20 Gray_9e', { active: isFilter })}
                onClick={this.handleOpenDrawer}
              />
            </FilterWrapper>
          )}
          <Drawer
            className={cx('filterStepListWrapper', {
              open: filters.visible,
              bottom50: detail.appNaviStyle === 2 && location.href.includes('mobile/app'),
            })}
            position="right"
            sidebar={_.isEmpty(view) ? null : this.renderSidebar(view)}
            open={filters.visible}
            onOpenChange={this.handleOpenDrawer}
          >
            <Fragment />
          </Drawer>
        </SearchWrapper>
        {this.renderContent()}
        {batchOptVisible && (canDelete || showCusTomBtn) && (
          <BatchOptBtn>
            {canDelete && (
              <div
                className={cx('deleteOpt flex', {
                  disabledDel: !canDelete,
                })}
                onClick={!canDelete ? () => {} : this.batchDelete}
              >
                <Icon icon="delete_12" className="mRight16" />
                {_l('??????')}
              </div>
            )}
            {showCusTomBtn && (
              <div
                className={cx('extraOpt flex', {
                  disabledExtra: !showCusTomBtn,
                })}
                onClick={!showCusTomBtn ? () => {} : this.showCustomButtoms}
              >
                <Icon icon="custom_actions" className="mRight10 Font20 extraIcon" />
                {_l('????????????')}
              </div>
            )}
          </BatchOptBtn>
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
      </Fragment>
    );
  }
}

export default connect(
  state => ({
    filters: state.mobile.filters,
    quickFilter: state.mobile.quickFilter,
    worksheetInfo: state.mobile.worksheetInfo,
    currentSheetRows: state.mobile.currentSheetRows,
    sheetSwitchPermit: state.mobile.sheetSwitchPermit,
    sheetRowLoading: state.mobile.sheetRowLoading,
    sheetView: state.mobile.sheetView,
    batchOptCheckedData: state.mobile.batchOptCheckedData,
    batchOptVisible: state.mobile.batchOptVisible,
    worksheetControls: state.mobile.worksheetControls,
    appDetail: state.mobile.appDetail,
    sheetViewConfig: state.sheet.sheetview.sheetViewConfig,
    navGroupFilters: state.sheet.navGroupFilters,
  }),
  dispatch =>
    bindActionCreators(
      {
        ..._.pick(actions, [
          'updateBase',
          'loadWorksheet',
          'fetchSheetRows',
          'updateFilters',
          'changeBatchOptVisible',
          'changeBatchOptData',
        ]),
        refreshWorksheetControls,
      },
      dispatch,
    ),
)(SheetView);
