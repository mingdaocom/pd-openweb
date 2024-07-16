import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from 'mobile/RecordList/redux/actions';
import * as worksheetActions from 'src/pages/worksheet/redux/actions';
import { bindActionCreators } from 'redux';
import { Flex } from 'antd-mobile';
import SheetView from './SheetView';
import HierarchyView from './HierarchyView';
import BoardView from './BoardView';
import GalleryView from './GalleryView';
import CalendarView from './CalendarView';
import GunterView from './GunterView';
import DetailView from './DetailView';
import GroupFilter from '../GroupFilter';
import CustomWidgetView from './CustomWidgetView';
import ResourceView from './ResourceView';
import MobileMapView from './MapView';
import State from '../State';
import worksheetAjax from 'src/api/worksheet';
import workflowPushSoket from 'mobile/components/socket/workflowPushSoket';
import { VIEW_TYPE_ICON, VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import { emitter } from 'worksheet/util';
import _ from 'lodash';

const { board, sheet, calendar, gallery, structure, gunter, detail, customize, resource, map } = VIEW_DISPLAY_TYPE;

const TYPE_TO_COMP = {
  [sheet]: SheetView,
  [structure]: HierarchyView,
  [board]: BoardView,
  [gallery]: GalleryView,
  [calendar]: CalendarView,
  [gunter]: GunterView,
  [detail]: DetailView,
  [resource]: ResourceView,
  [map]: MobileMapView,
  [customize]: CustomWidgetView,
};

class View extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    const { view, base } = this.props;

    if (_.includes([0, 6], view.viewType)) {
      if (this.props.mobileNavGroupFilters.length) {
        this.props.fetchSheetRows({ navGroupFilters: this.props.mobileNavGroupFilters });
      } else {
        this.props.fetchSheetRows();
      }
    }
    emitter.addListener('MOBILE_RELOAD_SHEETVIVELIST', this.refreshList);

    if (base.type !== 'single') {
      workflowPushSoket();
    }
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.mobileNavGroupFilters, nextProps.mobileNavGroupFilters)) {
      this.props.fetchSheetRows({ navGroupFilters: nextProps.mobileNavGroupFilters });
    }
  }
  componentWillUnmount() {
    if (!window.IM) return;
    IM.socket.off('workflow_push');
  }
  refreshList = ({ worksheetId, recordId }) => {
    const { view, base = {}, currentSheetRows = [] } = this.props;

    if (worksheetId === base.worksheetId && _.find(currentSheetRows, r => r.rowid === recordId)) {
      worksheetAjax
        .getRowDetail({
          checkView: true,
          getType: 1,
          rowId: recordId,
          viewId: view.viewId,
          worksheetId: base.worksheetId,
        })
        .then(row => {
          if (!row.isViewData) {
            const temp = _.filter(currentSheetRows, v => v.rowid !== recordId);
            this.props.changeMobileSheetRows(temp);
          }
        });
    }
  };
  renderError() {
    return (
      <Flex
        className="withoutRows flex"
        direction="column"
        justify="center"
        align="center"
        style={{ backgroundColor: '#f5f5f5' }}
      >
        <i className="icon icon-computer" style={{ fontSize: 100 }} />
        <div className="Font17 mTop12">{_l('移动端暂不支持此视图')}</div>
        <div className="Font17">{_l('请前往电脑端进行查看')}</div>
      </Flex>
    );
  }
  render() {
    const {
      view,
      viewResultCode,
      base,
      isCharge,
      appNaviStyle,
      hasDebugRoles,
      controls,
      sheetSwitchPermit,
      worksheetInfo,
    } = this.props;
    const { viewType, advancedSetting = {} } = view;

    if (viewType === 2 && advancedSetting.hierarchyViewType === '3') {
      return this.renderError();
    }

    if (viewResultCode !== 1) {
      return <State resultCode={viewResultCode} type={worksheetInfo.resultCode !== 1 ? 'sheet' : 'view'} />;
    }

    if (_.isEmpty(view)) {
      return null;
    }

    const Component = TYPE_TO_COMP[String(view.viewType)];
    const viewProps = {
      ...base,
      isCharge,
      view,
      hasDebugRoles,
      appNaviStyle,
      controls,
      sheetSwitchPermit,
    };

    let hasGroupFilter =
      view.viewId === base.viewId &&
      !_.isEmpty(view.navGroup) &&
      view.navGroup.length > 0 &&
      !location.search.includes('chartId') &&
      _.includes([sheet, gallery, map], String(view.viewType)); // 是否存在分组列表

    if (hasGroupFilter) {
      return (
        <div className="overflowHidden flex Relative mobileView">
          <GroupFilter
            {...this.props}
            changeMobielSheetLoading={this.props.changeMobielSheetLoading}
            groupId={this.props.base.groupId}
          />
        </div>
      );
    }
    return (
      <div className="overflowHidden flex mobileView flexColumn Relative">
        <Component {...viewProps} />
      </div>
    );
  }
}

export default connect(
  state => ({
    ..._.pick(state.mobile, [
      'base',
      'isCharge',
      'worksheetInfo',
      'viewResultCode',
      'mobileNavGroupFilters',
      'batchOptVisible',
      'appColor',
      'currentSheetRows',
    ]),
    controls: state.sheet.controls,
    views: state.sheet.views,
    ...state.sheet,
    sheetSwitchPermit: state.mobile.sheetSwitchPermit,
  }),
  dispatch =>
    bindActionCreators(
      {
        ..._.pick({ ...actions, ...worksheetActions }, [
          'fetchSheetRows',
          'getNavGroupCount',
          'changeMobielSheetLoading',
          'updateMobileViewPermission',
          'addNewRecord',
          'openNewRecord',
          'changeBatchOptVisible',
          'changeMobileGroupFilters',
          'unshiftSheetRow',
          'changeMobileSheetRows',
          'updateGroupFilter',
        ]),
      },
      dispatch,
    ),
)(View);
