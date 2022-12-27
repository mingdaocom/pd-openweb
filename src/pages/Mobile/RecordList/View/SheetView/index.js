import React, { Fragment, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import cx from 'classnames';
import styled from 'styled-components';
import * as actions from 'mobile/RecordList/redux/actions';
import * as sheetviewActions from 'src/pages/worksheet/redux/actions/sheetview.js';
import { refreshWorksheetControls } from 'worksheet/redux/actions';
import { Modal, Drawer } from 'antd-mobile';
import { Icon, Button } from 'ming-ui';
import QuickFilterSearch from 'mobile/RecordList/QuickFilter/QuickFilterSearch';
import SheetRows, { WithoutRows } from '../../SheetRows';
import { Flex, ActivityIndicator } from 'antd-mobile';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import worksheetAjax from 'src/api/worksheet';
import { TextTypes } from 'src/pages/worksheet/common/Sheet/QuickFilter/Inputs';
import RecordAction from 'mobile/Record/RecordAction';
import processAjax from 'src/pages/workflow/api/process';
import _ from 'lodash';

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
  position: fixed;
  bottom: 0;
  width: 100%;
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

const CUSTOM_BUTTOM_CLICK_TYPE = {
  IMMEDIATELY: 1,
  CONFIRM: 2,
  FILL_RECORD: 3,
};

class SheetView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    this.loadCustomBtns(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.viewId, nextProps.viewId)) {
      this.loadCustomBtns(nextProps);
    }
  }
  componentWillUnmount() {
    this.props.changeBatchOptVisible(false);
  }
  renderWithoutRows() {
    const { appId, worksheetInfo, sheetSwitchPermit, filters, quickFilter, view } = this.props;

    if (filters.keyWords) {
      return <WithoutRows text={_l('没有搜索结果')} />;
    }

    if (quickFilter.length) {
      return <WithoutRows text={_l('没有符合条件的记录')} />;
    }

    return (
      <Fragment>
        <WithoutRows
          text={_l('此视图下暂无记录')}
          children={
            isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) &&
            worksheetInfo.allowAdd && (
              <Button
                className="addRecordBtn valignWrapper mTop10"
                onClick={() => {
                  window.mobileNavigateTo(`/mobile/addRecord/${appId}/${worksheetInfo.worksheetId}/${view.viewId}`);
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
      return <WithoutRows text={_l('执行查询后显示结果')} />;
    }

    return currentSheetRows.length || batchOptCheckedData.length ? (
      <SheetRows view={view} navigateTo={window.mobileNavigateTo} />
    ) : (
      this.renderWithoutRows()
    );
  }
  // 加载自定义按钮数据
  loadCustomBtns = (props = this.props) => {
    const { appId, worksheetId, viewId } = props;
    this.setState({ customButtonLoading: true });
    worksheetAjax
      .getWorksheetBtns({
        appId,
        worksheetId,
        viewId,
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
  // 批量操作全选
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
    const { appId, worksheetId, viewId } = this.props;
    const { allWorksheetIsSelected } = sheetViewConfig;
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
              alert(_l('删除成功，无编辑权限的记录无法删除'), 3);
            }
            this.props.changeBatchOptData([]);
          }
        })
        .fail(err => {
          alert(_l('批量删除失败'), 2);
        });
      this.props.changeBatchOptVisible(false);
    }
  };
  // 批量删除
  batchDelete = () => {
    const { worksheetInfo, batchOptCheckedData } = this.props;
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
          text: _l('删除'),
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
    processAjax.startProcess({
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
      alert(_l('前选中数量超过1000条，无法执行此操作'), 3);
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
        alert(_l('修改成功'));
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

  render() {
    const {
      view,
      filters,
      worksheetInfo,
      quickFilter,
      batchOptCheckedData,
      batchOptVisible,
      sheetSwitchPermit,
      appDetail,
      appId,
      worksheetId,
      viewId,
    } = this.props;
    const { detail } = appDetail;
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
              {_l('完成')}
            </a>
            {_.isEmpty(batchOptCheckedData) && <span>{_l('请选择')}</span>}
            {!_.isEmpty(batchOptCheckedData) && <span>{_l(`已选中%0条`, checkedCount)}</span>}
            <a onClick={this.selectedAll}>{_l('全选')}</a>
          </div>
        )}
        <QuickFilterSearch
          textFilters={textFilters}
          excludeTextFilter={excludeTextFilter}
          isFilter={isFilter}
          filters={filters}
          detail={detail}
          view={view}
          worksheetInfo={worksheetInfo}
          sheetControls={sheetControls}
          updateFilters={this.props.updateFilters}
        />
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
                {_l('删除')}
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
                {_l('执行动作')}
              </div>
            )}
          </BatchOptBtn>
        )}
        <RecordAction
          recordActionVisible={showButtons}
          appId={appId}
          worksheetId={worksheetId}
          viewId={viewId}
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
