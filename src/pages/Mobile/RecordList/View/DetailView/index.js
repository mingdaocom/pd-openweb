import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { RecordInfoModal } from 'mobile/Record';
import * as actions from 'mobile/RecordList/redux/actions';
import SheetRows, { WithoutRows } from '../../SheetRows/';

const DetailViewWrap = styled.div`
  &.hideFormHeader {
    .mobileSheetRowRecord {
      .sheetNameWrap,
      .header {
        display: none !important;
      }
    }
  }
`;

class DetailView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      _.get(nextProps, 'view.childType') === 1 &&
      _.get(this.props, 'view.viewId') !== _.get(nextProps, 'view.viewId')
    ) {
      this.setState({ loading: true });
    } else {
      this.setState({ loading: false });
    }
  }

  renderWithoutRows = () => {
    const { filters, quickFilter, view, activeSavedFilter = {} } = this.props;
    const needClickToSearch = _.get(view, 'advancedSetting.clicksearch') === '1';

    const handlePullToRefresh = () => {
      this.props.updateIsPullRefreshing(true);
      this.props.changePageIndex(1);
    };

    if (needClickToSearch && _.isEmpty(quickFilter)) {
      return <WithoutRows text={_l('执行查询后显示结果')} />;
    }
    if (filters.keyWords) {
      return <WithoutRows text={_l('没有搜索结果')} />;
    }
    if (quickFilter.length || !_.isEmpty(activeSavedFilter)) {
      return <WithoutRows text={_l('没有符合条件的记录')} />;
    }
    return (
      <Fragment>
        <WithoutRows text={_l('此视图下暂无记录')} onRefresh={handlePullToRefresh} />
      </Fragment>
    );
  };
  render() {
    const {
      view,
      currentSheetRows = [],
      base = {},
      sheetSwitchPermit,
      appNaviStyle,
      worksheetInfo = {},
      sheetRowLoading,
      isCharge,
    } = this.props;
    const { loading } = this.state;

    return (
      <DetailViewWrap className={cx('w100 h100', { hideFormHeader: _.get(view, 'advancedSetting.showtitle') === '0' })}>
        {_.isEmpty(currentSheetRows) ? (
          this.renderWithoutRows()
        ) : view.childType === 1 ? (
          loading || sheetRowLoading ? (
            <div className="w100 h100 flexRow justifyContentCenter alignItemsCenter">
              <LoadDiv />
            </div>
          ) : (
            <RecordInfoModal
              notModal={true}
              visible={true}
              enablePayment={worksheetInfo.enablePayment}
              worksheetInfo={worksheetInfo}
              appId={base.appId}
              worksheetId={base.worksheetId}
              viewId={base.viewId || view.viewId}
              rowId={currentSheetRows[0].rowid}
              sheetSwitchPermit={sheetSwitchPermit}
              view={view}
              chartEntryStyle={appNaviStyle === 2 ? { bottom: 100 } : {}}
              isCharge={isCharge}
            />
          )
        ) : (
          <SheetRows view={view} navigateTo={window.mobileNavigateTo} />
        )}
      </DetailViewWrap>
    );
  }
}

export default connect(
  state => ({
    ..._.pick(state.mobile, [
      'worksheetInfo',
      'filters',
      'quickFilter',
      'currentSheetRows',
      'base',
      'sheetSwitchPermit',
      'activeSavedFilter',
      'sheetRowLoading',
      'isCharge',
    ]),
  }),
  dispatch =>
    bindActionCreators(
      {
        ..._.pick(actions, ['fetchSheetRows', 'updateFilters', 'changePageIndex', 'updateIsPullRefreshing']),
      },
      dispatch,
    ),
)(DetailView);
