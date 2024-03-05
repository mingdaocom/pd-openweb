import React, { Fragment, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from 'mobile/RecordList/redux/actions';
import SheetRows, { WithoutRows } from '../../SheetRows/';
import QuickFilterSearch from 'mobile/RecordList/QuickFilter/QuickFilterSearch';
import { RecordInfoModal } from 'mobile/Record';

class DetailView extends Component {
  constructor(props) {
    super(props);
  }
  renderWithoutRows = () => {
    const { filters, quickFilter, view } = this.props;
    const needClickToSearch = _.get(view, 'advancedSetting.clicksearch') === '1';

    if (needClickToSearch && _.isEmpty(quickFilter)) {
      return <WithoutRows text={_l('执行查询后显示结果')} />;
    }
    if (filters.keyWords) {
      return <WithoutRows text={_l('没有搜索结果')} />;
    }
    if (quickFilter.length) {
      return <WithoutRows text={_l('没有符合条件的记录')} />;
    }
    return (
      <Fragment>
        <WithoutRows text={_l('此视图下暂无记录')} />
      </Fragment>
    );
  };
  render() {
    const {
      view,
      worksheetInfo,
      filters,
      quickFilter,
      appDetail,
      currentSheetRows = [],
      base = {},
      sheetSwitchPermit,
      hasDebugRoles,
      appNaviStyle,
    } = this.props;
    const { detail } = appDetail;
    const sheetControls = _.get(worksheetInfo, ['template', 'controls']);
    const needClickToSearch = _.get(view, 'advancedSetting.clicksearch') === '1';
    const viewFilters = view.fastFilters
      .map(filter => ({
        ...filter,
        control: _.find(sheetControls, c => c.controlId === filter.controlId),
      }))
      .filter(c => c.control);
    const isFilter = quickFilter.length;

    return (
      <Fragment>
        {view.childType !== 1 && (
          <QuickFilterSearch
            excludeTextFilter={viewFilters}
            isFilter={isFilter}
            filters={filters}
            detail={detail}
            view={view}
            worksheetInfo={worksheetInfo}
            sheetControls={sheetControls}
            updateFilters={this.props.updateFilters}
          />
        )}
        {_.isEmpty(currentSheetRows) || (needClickToSearch && _.isEmpty(quickFilter)) ? (
          this.renderWithoutRows()
        ) : view.childType === 1 ? (
          <RecordInfoModal
            notModal={true}
            visible={true}
            appId={base.appId}
            worksheetId={base.worksheetId}
            viewId={base.viewId || view.viewId}
            rowId={currentSheetRows[0].rowid}
            sheetSwitchPermit={sheetSwitchPermit}
            view={view}
            chartEntryStyle={appNaviStyle === 2 ? { bottom: 100 } : {}}
          />
        ) : (
          <SheetRows view={view} navigateTo={window.mobileNavigateTo} />
        )}
      </Fragment>
    );
  }
}

export default connect(
  state => ({
    ..._.pick(state.mobile, [
      'worksheetInfo',
      'filters',
      'appDetail',
      'quickFilter',
      'currentSheetRows',
      'base',
      'sheetSwitchPermit',
    ]),
  }),
  dispatch =>
    bindActionCreators(
      {
        ..._.pick(actions, ['fetchSheetRows', 'updateFilters']),
      },
      dispatch,
    ),
)(DetailView);
