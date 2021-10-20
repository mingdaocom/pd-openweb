import React, { Component } from 'react';
import DocumentTitle from 'react-document-title';
import { Tabs, Flex, ActivityIndicator, Drawer } from 'antd-mobile';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { Icon, Button } from 'ming-ui';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import Back from '../components/Back';
import AppPermissions from '../components/AppPermissions';
import QuickFilter from './QuickFilter';
import State from './State';
import View from './View';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import './index.less';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';

const shieldingViewType = [VIEW_DISPLAY_TYPE.board, VIEW_DISPLAY_TYPE.structure, VIEW_DISPLAY_TYPE.calendar].map(item =>
  Number(item),
);

@withRouter
@AppPermissions
class RecordList extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.getApp(this.props);
  }
  navigateTo = (url, isReplace) => {
    if (window.isPublicApp && !new URL('http://z.z' + url).hash) {
      url = url + '#publicapp' + window.publicAppAuthorization;
    }
    if (isReplace) {
      this.props.history.replace(url);
    } else {
      this.props.history.push(url);
    }
  }
  getApp(props) {
    const { params } = props.match;
    props.updateBase({
      appId: params.appId,
      groupId: params.groupId,
      worksheetId: params.worksheetId,
      viewId: params.viewId,
    });
    props.loadWorksheet();
  }
  componentWillReceiveProps(nextProps) {
    const { params: newParams } = nextProps.match;
    const { params } = this.props.match;
    if (newParams.viewId !== params.viewId) {
      this.props.updateBase({ viewId: newParams.viewId });
      this.props.resetSheetView();
    }
    if (newParams.worksheetId !== params.worksheetId) {
      this.props.emptySheetRows();
      this.props.emptySheetControls();
      this.getApp(nextProps);
    }
  }
  componentWillUnmount() {
    this.props.emptySheetControls();
  }
  handleOpenDrawer = () => {
    const { filters } = this.props;
    this.props.updateFilters({
      visible: !filters.visible
    });
  }
  handleChangeView = view => {
    const { match, now } = this.props;
    const { params } = match;
    if (now) {
      this.props.updateBase({ viewId: view.viewId });
      this.props.resetSheetView();
    } else {
      this.navigateTo(`/mobile/recordList/${params.appId}/${params.groupId}/${params.worksheetId}/${view.viewId}`, true);
    }
  }
  renderSidebar(view) {
    const { fastFilters = [] } = view;
    const { worksheetInfo } = this.props;
    const sheetControls = _.get(worksheetInfo, ['template', 'controls']);
    const filters = fastFilters.map(filter => ({
      ...filter,
      control: _.find(sheetControls, c => c.controlId === filter.controlId),
    })).filter(c => c.control);
    return (
      <QuickFilter
        view={view}
        filters={filters}
        controls={sheetControls}
        onHideSidebar={this.handleOpenDrawer}
      />
    );
  }
  render() {
    const { base, worksheetInfo, sheetSwitchPermit, workSheetLoading, match, currentSheetRows, filters } = this.props;
    const { viewId } = base;

    if (workSheetLoading) {
      return (
        <Flex justify="center" align="center" className="h100">
          <ActivityIndicator size="large" />
        </Flex>
      );
    }

    if (worksheetInfo.resultCode !== 1) {
      return <State type="sheet" />;
    }

    const { views, name } = worksheetInfo;
    const view = _.find(views, { viewId }) || (!viewId && views[0]) || {};
    const { params } = match;
    const viewIndex = viewId ? _.findIndex(views, { viewId }) : 0;

    return (
      <Drawer
        className="filterStepListWrapper"
        position="right"
        sidebar={this.renderSidebar(view)}
        open={filters.visible}
        onOpenChange={this.handleOpenDrawer}
      >
        <div className="flexColumn h100">
          <DocumentTitle title={name} />
          <div className="viewTabs z-depth-1">
            <Tabs
              tabBarInactiveTextColor="#9e9e9e"
              tabs={views}
              page={viewIndex === -1 ? 999 : viewIndex}
              onTabClick={view => {
                this.handleChangeView(view);
              }}
              renderTab={tab => <span className="ellipsis">{tab.name}</span>}
            ></Tabs>
          </div>
          <View view={view}/>
          {!location.href.includes('mobile/app') && (
            <Back
              onClick={() => {
                this.navigateTo(`/mobile/app/${params.appId}`);
              }}
            />
          )}
          {isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) &&
          worksheetInfo.allowAdd &&
          currentSheetRows.length &&
          !shieldingViewType.includes(view.viewType) ? (
            <div className="addRecordItemWrapper">
              <Button
                className="addRecordBtn flex valignWrapper"
                onClick={() => {
                  this.navigateTo(
                    `/mobile/addRecord/${params.appId}/${worksheetInfo.worksheetId}/${view.viewId}`,
                  );
                }}
              >
                <Icon icon="add" className="Font22" />
                {worksheetInfo.entityName}
              </Button>
            </div>
          ) : null}
        </div>
      </Drawer>
    );
  }
}

export default connect(
  state => ({
    base: state.mobile.base,
    worksheetInfo: state.mobile.worksheetInfo,
    sheetSwitchPermit: state.mobile.sheetSwitchPermit,
    currentSheetRows: state.mobile.currentSheetRows,
    workSheetLoading: state.mobile.workSheetLoading,
    filters: state.mobile.filters
  }),
  dispatch =>
    bindActionCreators(
      _.pick(actions, ['updateBase', 'loadWorksheet', 'resetSheetView', 'emptySheetControls', 'emptySheetRows', 'updateFilters']),
      dispatch,
  ),
)(RecordList);
