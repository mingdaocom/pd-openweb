import React, { Fragment, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from 'mobile/RecordList/redux/actions';
import SheetRows, { WithoutRows } from '../../SheetRows/';
import { RecordInfoModal } from 'mobile/Record';
import { LoadDiv } from 'ming-ui';

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
    const { view, currentSheetRows = [], base = {}, sheetSwitchPermit, appNaviStyle, worksheetInfo = {} } = this.props;
    const { loading } = this.state;

    return (
      <Fragment>
        {_.isEmpty(currentSheetRows) ? (
          this.renderWithoutRows()
        ) : view.childType === 1 ? (
          loading ? (
            <div className="w100 h100 flexRow justifyContentCenter alignItemsCenter">
              <LoadDiv />
            </div>
          ) : (
            <RecordInfoModal
              notModal={true}
              visible={true}
              enablePayment={worksheetInfo.enablePayment}
              appId={base.appId}
              worksheetId={base.worksheetId}
              viewId={base.viewId || view.viewId}
              rowId={currentSheetRows[0].rowid}
              sheetSwitchPermit={sheetSwitchPermit}
              view={view}
              chartEntryStyle={appNaviStyle === 2 ? { bottom: 100 } : {}}
            />
          )
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
