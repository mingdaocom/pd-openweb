import React, { Fragment, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import cx from 'classnames';
import styled from 'styled-components';
import * as actions from 'src/pages/Mobile/RecordList/redux/actions';
import { Icon, Button } from 'ming-ui';
import Search from 'src/pages/Mobile/RecordList/QuickFilter/Search';
import SheetRows, { WithoutRows } from '../../SheetRows';
import { Flex, ActivityIndicator } from 'antd-mobile';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { TextTypes } from 'src/pages/worksheet/common/Sheet/QuickFilter/Inputs';

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

@withRouter
class SheetView extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {}
  renderWithoutRows() {
    const { match, worksheetInfo, sheetSwitchPermit, filters, quickFilter, view } = this.props;

    if (filters.keyWords) {
      return (
        <WithoutRows text={_l('没有搜索结果')} />
      )
    }

    if (quickFilter.length) {
      return (
        <WithoutRows text={_l('没有符合条件的记录')} />
      )
    }

    return (
      <Fragment>
        <WithoutRows
          text={_l('此视图下暂无记录')}
          children={
            isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) && worksheetInfo.allowAdd && (
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
    const { view, currentSheetRows, sheetRowLoading, sheetView, quickFilter } = this.props;
    const needClickToSearch = _.get(view, 'advancedSetting.clicksearch') === '1';

    if (sheetRowLoading && sheetView.pageIndex === 1) {
      return (
        <Flex justify="center" align="center" className="h100">
          <ActivityIndicator size="large" />
        </Flex>
      )
    }

    if (needClickToSearch && _.isEmpty(quickFilter)) {
      return (
        <WithoutRows text={_l('执行查询后显示结果')} />
      )
    }

    return (
      currentSheetRows.length ? (
        <SheetRows
          view={view}
          navigateTo={window.mobileNavigateTo}
        />
      ) : (
        this.renderWithoutRows()
      )
    )
  }
  render() {
    const { view, worksheetInfo, quickFilter, updateFilters } = this.props;
    const sheetControls = _.get(worksheetInfo, ['template', 'controls']);
    const filters = view.fastFilters.map(filter => ({
      ...filter,
      control: _.find(sheetControls, c => c.controlId === filter.controlId),
    })).filter(c => c.control);
    const excludeTextFilter = filters.filter(item => !TextTypes.includes(item.dataType));
    const textFilters = filters.filter(item => TextTypes.includes(item.dataType));
    const isFilter = quickFilter.filter(item => !TextTypes.includes(item.dataType)).length;

    return (
      <Fragment>
        <div className="flexRow valignWrapper pLeft12 pRight12 pTop15 pBottom5">
          <Search textFilters={textFilters} />
          {!_.isEmpty(excludeTextFilter) && (
            <FilterWrapper>
              <Icon
                icon="filter"
                className={cx('Font20 Gray_9e', { active: isFilter })}
                onClick={() => {
                  const { filters } = this.props;
                  updateFilters({ visible: !filters.visible });
                }}
              />
            </FilterWrapper>
          )}
        </div>
        {this.renderContent()}
      </Fragment>
    )
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
    sheetView: state.mobile.sheetView
  }),
  dispatch =>
    bindActionCreators(
      _.pick(actions, ['updateBase', 'loadWorksheet', 'fetchSheetRows', 'updateFilters']),
      dispatch,
  ),
)(SheetView);
