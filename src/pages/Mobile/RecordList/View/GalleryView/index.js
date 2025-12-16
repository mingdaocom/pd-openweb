import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { SpinLoading } from 'antd-mobile';
import _ from 'lodash';
import { Button, Icon } from 'ming-ui';
import * as actions from 'mobile/RecordList/redux/actions';
import { refreshWorksheetControls } from 'worksheet/redux/actions';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import SheetRows, { WithoutRows } from '../../SheetRows';

class MobileGalleryView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderWithoutRows() {
    const {
      appId,
      worksheetInfo,
      sheetSwitchPermit,
      filters,
      quickFilter,
      view,
      activeSavedFilter = {},
      hasGroupFilter,
      mobileNavGroupFilters,
    } = this.props;
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

    const navGroupToSearch =
      hasGroupFilter &&
      _.get(view, 'advancedSetting.appnavtype') === '3' &&
      _.get(view, 'advancedSetting.showallitem') === '1' &&
      !_.get(view, 'navGroup[0].viewId');

    if (navGroupToSearch && _.isEmpty(mobileNavGroupFilters)) {
      return <WithoutRows text={_l('请从左侧选择一个')} />;
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

  render() {
    const { view, currentSheetRows, sheetRowLoading, sheetView, quickFilter, isPullRefreshing } = this.props;
    const wWidth = window.innerWidth;
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

    return currentSheetRows.length ? (
      <SheetRows
        view={view}
        navigateTo={window.mobileNavigateTo}
        colNum={wWidth > 480 && _.get(view, 'advancedSetting.rowcolumns') === '2' ? 2 : 1}
      />
    ) : (
      this.renderWithoutRows()
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
        'batchOptVisible',
        'worksheetControls',
        'appDetail',
        'quickFilterWithDefault',
        'isPullRefreshing',
        'batchCheckAll',
        'activeSavedFilter',
        'mobileNavGroupFilters',
      ]),
      sheetViewConfig: sheet.sheetview.sheetViewConfig,
      navGroupFilters: sheet.navGroupFilters,
    };
  },

  dispatch =>
    bindActionCreators(
      {
        ..._.pick(actions, ['fetchSheetRows', 'changeBatchOptData', 'changePageIndex', 'updateIsPullRefreshing']),
        refreshWorksheetControls,
      },
      dispatch,
    ),
)(MobileGalleryView);
