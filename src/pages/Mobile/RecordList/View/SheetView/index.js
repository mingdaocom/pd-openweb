import React, { Fragment, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import cx from 'classnames';
import styled from 'styled-components';
import * as actions from 'mobile/RecordList/redux/actions';
import { refreshWorksheetControls } from 'worksheet/redux/actions';
import { Icon, Button } from 'ming-ui';
import QuickFilterSearch from 'mobile/RecordList/QuickFilter/QuickFilterSearch';
import SheetRows, { WithoutRows } from '../../SheetRows';
import { SpinLoading, Dialog, Popup } from 'antd-mobile';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import worksheetAjax from 'src/api/worksheet';
import RecordAction from 'mobile/components/RecordInfo/RecordAction';
import processAjax from 'src/pages/workflow/api/process';
import { replaceBtnsTranslateInfo } from 'worksheet/util';
import _, { pick } from 'lodash';

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
`;

const Btn = styled(Button)`
  border: 1px solid #eee !important;
  background-color: #fff !important;
  &.delete {
    background-color: #f44336 !important;
    border: 1px solid #f44336;
    color: #fff;
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
    this.state = { deleteVisible: false };
  }
  componentWillUnmount() {
    this.props.changeBatchOptVisible(false);
  }
  renderWithoutRows() {
    const { appId, worksheetInfo, sheetSwitchPermit, filters, quickFilter, view, activeSavedFilter = {} } = this.props;
    const handlePullToRefresh = () => {
      this.props.updateIsPullRefreshing(true);
      this.props.changePageIndex(1);
    };

    if (filters.keyWords) {
      return <WithoutRows text={_l('没有搜索结果')} />;
    }

    if (quickFilter.length || !_.isEmpty(activeSavedFilter)) {
      return <WithoutRows text={_l('没有符合条件的记录')} />;
    }

    return (
      <Fragment>
        <WithoutRows
          text={_l('此视图下暂无记录')}
          onRefresh={handlePullToRefresh}
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
    const { view, currentSheetRows, sheetRowLoading, sheetView, quickFilter, batchOptCheckedData, isPullRefreshing } =
      this.props;
    const needClickToSearch = _.get(view, 'advancedSetting.clicksearch') === '1';

    if (!isPullRefreshing && sheetRowLoading && sheetView.pageIndex === 1) {
      return (
        <div className="flexRow justifyContentCenter alignItemsCenter h100">
          <SpinLoading color="primary" />
        </div>
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
    const { appId, worksheetId, viewId, batchOptCheckedData = [] } = props;
    if (window.shareState.shareId) return;
    this.setState({ customButtonLoading: true });
    worksheetAjax
      .getWorksheetBtns({
        appId,
        worksheetId,
        viewId,
        rowId: batchOptCheckedData.length === 1 ? batchOptCheckedData[0] : undefined,
      })
      .then(data => {
        this.setState({
          customBtns: replaceBtnsTranslateInfo(appId, data).filter(
            item =>
              _.includes([CUSTOM_BUTTOM_CLICK_TYPE.IMMEDIATELY, CUSTOM_BUTTOM_CLICK_TYPE.CONFIRM], item.clickType) ||
              (item.writeObject === 1 && item.writeType === 1),
          ),
          customButtonLoading: false,
        });
      });
  };
  showCustomButtoms = () => {
    this.loadCustomBtns();
    this.setState({
      showButtons: !this.state.showButtons,
    });
  };
  // 批量操作全选
  selectedAll = () => {
    const { batchCheckAll } = this.props;
    this.props.updateBatchCheckAll(!batchCheckAll);
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
        .catch(err => {
          alert(_l('批量删除失败'), 2);
        });
      this.props.changeBatchOptVisible(false);
    }
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
    processAjax
      .startProcess({
        appId: worksheetId,
        sources: batchOptCheckedData,
        triggerId: btn.btnId,
        pushUniqueId: _.get(window, 'md.global.Config.pushUniqueId'),
        ...args,
      })
      .then(data => {
        if (data) {
          this.props.fetchSheetRows();
        }
      });
  };
  handleBatchOperateCustomBtn = btn => {
    const { allWorksheetIsSelected, batchOptCheckedData } = this.props;
    if (allWorksheetIsSelected && batchOptCheckedData && batchOptCheckedData.length > 1000) {
      alert(_l('前选中数量超过1000条，无法执行此操作'), 3);
      return;
    }
    // 立即执行
    this.triggerCustomBtn(btn, allWorksheetIsSelected);
    this.setState({ showButtons: false });
    this.props.changeBatchOptVisible(false);
  };
  handleUpdateWorksheetRow = (args, callback = () => {}) => {
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
      callback();
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
      changeActionSheetModalIndex,
      quickFilterWithDefault,
      savedFilters,
      batchCheckAll,
      activeSavedFilter,
      updateFilters = () => {},
      updateActiveSavedFilter = () => {},
    } = this.props;
    const { detail } = appDetail;
    let { customBtns = [], showButtons, customButtonLoading, deleteVisible } = this.state;
    const sheetControls = _.get(worksheetInfo, ['template', 'controls']);
    const isFilter = quickFilter.length;
    let checkedCount = batchOptCheckedData.length;
    const canDelete =
      isOpenPermit(permitList.delete, sheetSwitchPermit, view.viewId) && !_.isEmpty(batchOptCheckedData);
    const showCusTomBtn =
      isOpenPermit(permitList.execute, sheetSwitchPermit, view.viewId) && !_.isEmpty(batchOptCheckedData);
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
            <a onClick={this.selectedAll}>{batchCheckAll ? _l('取消全选') : _l('全选')}</a>
          </div>
        )}
        <QuickFilterSearch
          isFilter={isFilter}
          filters={filters}
          detail={detail}
          view={view}
          worksheetInfo={worksheetInfo}
          sheetControls={sheetControls}
          updateFilters={updateFilters}
          quickFilterWithDefault={quickFilterWithDefault}
          savedFilters={savedFilters}
          activeSavedFilter={activeSavedFilter}
          updateActiveSavedFilter={updateActiveSavedFilter}
        />
        {this.renderContent()}
        {batchOptVisible && (canDelete || showCusTomBtn) && (
          <BatchOptBtn>
            {canDelete && (
              <div
                className={cx('deleteOpt flex', {
                  disabledDel: !canDelete,
                })}
                onClick={() => {
                  if (!canDelete) return;
                  if (window.isPublicApp) {
                    alert(_l('预览模式下，不能操作'), 3);
                    return;
                  }
                  this.setState({ deleteVisible: true });
                }}
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
                onClick={this.showCustomButtoms}
              >
                <Icon icon="custom_actions" className="mRight10 Font20 extraIcon" />
                {_l('执行动作')}
              </div>
            )}
          </BatchOptBtn>
        )}
        <RecordAction
          changeActionSheetModalIndex={changeActionSheetModalIndex}
          loading={customButtonLoading}
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
          isBatchOperate={true}
          batchOptCheckedData={batchOptCheckedData}
          fetchSheetRows={this.props.fetchSheetRows}
          view={view}
          worksheetControls={this.props.worksheetControls}
          changeBatchOptData={this.props.changeBatchOptData}
          handleBatchOperateCustomBtn={this.handleBatchOperateCustomBtn}
          handleUpdateWorksheetRow={this.handleUpdateWorksheetRow}
          currentSheetRows={this.props.currentSheetRows}
        />

        {deleteVisible && (
          <Popup
            closeOnMaskClick
            visible={deleteVisible}
            position="bottom"
            className="mobileModal topRadius"
            bodyClassName="pTop10 pBottom10 pLeft15 pRight15"
          >
            <div className="Font16 bold mBottom10">{_l('确认删除记录?')}</div>
            <div className="Font13 Gray_9e mBottom10">
              {_l('60天内可在 回收站 内找回已删除%0，无编辑权限的数据无法删除。', worksheetInfo.entityName)}
            </div>
            <div className="flexRow mBottom10">
              <Btn
                radius
                className="flex mRight6 bold Gray_75 Font13"
                onClick={() => this.setState({ deleteVisible: false })}
              >
                {_l('取消')}
              </Btn>
              <Btn
                radius
                className="flex mLeft6 bold Font13 delete"
                onClick={() => this.setState({ deleteVisible: false }, this.comfirmDelete)}
              >
                {_l('确定')}
              </Btn>
            </div>
          </Popup>
        )}
      </Fragment>
    );
  }
}

export default connect(
  state => {
    const { mobile, sheet } = state;

    return {
      ..._.pick(mobile, [
        'filters',
        'quickFilter',
        'worksheetInfo',
        'currentSheetRows',
        'sheetSwitchPermit',
        'sheetRowLoading',
        'sheetView',
        'batchOptCheckedData',
        'batchOptVisible',
        'worksheetControls',
        'appDetail',
        'quickFilterWithDefault',
        'isPullRefreshing',
        'batchCheckAll',
        'savedFilters',
        'activeSavedFilter',
      ]),
      sheetViewConfig: sheet.sheetview.sheetViewConfig,
      navGroupFilters: sheet.navGroupFilters,
    };
  },

  dispatch =>
    bindActionCreators(
      {
        ..._.pick(actions, [
          'fetchSheetRows',
          'updateFilters',
          'changeBatchOptVisible',
          'changeBatchOptData',
          'updateBatchCheckAll',
          'updateActiveSavedFilter',
          'changePageIndex',
          'updateIsPullRefreshing',
        ]),
        refreshWorksheetControls,
      },
      dispatch,
    ),
)(SheetView);
