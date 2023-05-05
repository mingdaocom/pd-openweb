import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import * as actions from 'worksheet/redux/actions';
import Skeleton from 'src/router/Application/Skeleton';
import View from 'worksheet/views';
import SheetContext from './SheetContext';
import SheetHeader from './SheetHeader';
import ViewControl from './ViewControl';
import QuickFilter from './QuickFilter';
import GroupFilter from './GroupFilter';
import { VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import DragMask from 'worksheet/common/DragMask';
import { Icon } from 'ming-ui';
const { sheet, gallery, board, calendar, gunter } = VIEW_DISPLAY_TYPE;
import './style.less';
import _ from 'lodash';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';

const Con = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  height: 100%;
  flex-direction: column;
  background: #fff;
`;

const Loading = styled.div`
  height: 75px;
`;

const ConView = styled.div`
  flex: 1;
  display: flex;
  position: relative;
`;

const QuickFilterCon = styled.div`
  border-bottom: 1px solid #e0e0e0;
`;

const Drag = styled.div(
  ({ left }) => `
  position: absolute;
  z-index: 2;
  left: ${left}px;
  width: 10px;
  height: 100%;
  cursor: ew-resize;
  border-left: 1px solid #e0e0e0;
  &:hover{
    border-left: 1px solid #2196f3;
  }
`,
);

const EmptyStatus = styled.div`
  color: #9e9e9e;
  font-size: 17px;
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

function Sheet(props) {
  const {
    loading,
    error,
    appId,
    groupId,
    worksheetId,
    worksheetInfo,
    flag,
    type = 'common',
    views,
    activeViewStatus,
    isCharge,
    updateGroupFilter,
    updateFilters,
    config = {},
    navGroupFilters = [],
    filtersGroup,
    chartId,
    showControlIds,
    showAsSheetView,
    quickFilter,
    openNewRecord,
  } = props;
  const [viewConfigVisible, setViewConfigVisible] = useState(false);
  let [dragMaskVisible, setDragMaskVisible] = useState(false);
  let [isOpenGroup, setIsOpenGroup] = useState(
    !window.localStorage.getItem('navGroupIsOpen') ? true : window.localStorage.getItem('navGroupIsOpen') === 'true',
  );
  let [groupFilterWidth, setGroupFilterWidth] = useState(
    isOpenGroup ? window.localStorage.getItem('navGroupWidth') || 210 : 32,
  );
  let { viewId } = props;
  const { loadWorksheet } = props;
  const view = _.find(views, { viewId }) || (!viewId && !chartId && views[0]) || {};
  const hasGroupFilter =
    !_.isEmpty(view.navGroup) && view.navGroup.length > 0 && _.includes([sheet, gallery], String(view.viewType));
  const showQuickFilter =
    !_.isEmpty(view.fastFilters) &&
    _.includes([sheet, gallery, board, calendar, gunter], String(view.viewType)) &&
    !chartId;
  const needClickToSearch =
    showQuickFilter &&
    !_.includes([sheet], String(view.viewType)) &&
    _.get(view, 'advancedSetting.clicksearch') === '1';
  const basePara = {
    type,
    loading,
    error,
    appId,
    groupId,
    worksheetId,
    view,
    activeViewStatus,
    viewId: view.viewId,
    projectId: worksheetInfo.projectId,
    isCharge,
    openNewRecord,
    viewConfigVisible,
    setViewConfigVisible,
    filtersGroup,
    groupFilterWidth: hasGroupFilter ? groupFilterWidth : 0,
    chartId,
    showControlIds,
    showAsSheetView,
  };
  const viewComp =
    needClickToSearch && _.isEmpty(quickFilter) ? (
      <EmptyStatus>{_l('执行查询后显示结果')}</EmptyStatus>
    ) : (
      <View {...basePara} />
    );
  useEffect(() => {
    if (worksheetId) {
      loadWorksheet(worksheetId);
    }
  }, [worksheetId, flag]);

  useEffect(() => {
    if (_.isArray(filtersGroup) && !loading) {
      updateFilters({ filtersGroup }, view);
    }
  }, [filtersGroup, loading]);

  useEffect(() => {
    updateGroupFilter([], view);
  }, [view.viewId, worksheetId]);

  return (
    <SheetContext.Provider base={basePara} value={{ config }}>
      <Con className="worksheetSheet">
        {type === 'common' && worksheetInfo.name && (
          <DocumentTitle
            title={`${(window.appInfo && window.appInfo.name) || _l('应用')} - ${worksheetInfo.name || ''}`}
          />
        )}
        {loading ? (
          <Loading>
            <Skeleton direction="row" widths={['140px']} active itemStyle={{ margin: '10px 0 9px' }} />
            <Skeleton
              direction="row"
              widths={['26px', '64px', '64px', '64px']}
              active
              itemStyle={{ margin: '10px 10px 10px 0' }}
            />
          </Loading>
        ) : (
          <React.Fragment>
            {type === 'common' && (
              <React.Fragment>
                <SheetHeader {...basePara} />
                <ViewControl {...basePara} view={_.cloneDeep(view)} />
              </React.Fragment>
            )}
            {type === 'single' && <SheetHeader {...basePara} onlyBatchOperate />}
            <Con id="worksheetRightContentBox">
              {showQuickFilter && (
                <QuickFilterCon>
                  <QuickFilter
                    {...basePara}
                    filters={setSysWorkflowTimeControlFormat(view.fastFilters, worksheetInfo.switches)}
                  />
                </QuickFilterCon>
              )}
              {hasGroupFilter && !chartId ? (
                <ConView>
                  {dragMaskVisible && (
                    <DragMask
                      value={groupFilterWidth}
                      min={100}
                      max={360}
                      onChange={value => {
                        setDragMaskVisible(false);
                        setGroupFilterWidth(value);
                        safeLocalStorageSetItem('navGroupWidth', value);
                      }}
                    />
                  )}
                  <GroupFilter
                    width={groupFilterWidth}
                    isOpenGroup={isOpenGroup}
                    changeGroupStatus={isOpen => {
                      setIsOpenGroup(isOpen);
                      safeLocalStorageSetItem('navGroupIsOpen', isOpen);
                      if (isOpen) {
                        setGroupFilterWidth(window.localStorage.getItem('navGroupWidth') || 210);
                      } else {
                        setGroupFilterWidth(32);
                      }
                    }}
                  />
                  {!_.get(window, 'shareState.isPublicView') && isOpenGroup && (
                    <Drag left={groupFilterWidth} onMouseDown={() => setDragMaskVisible(true)} />
                  )}
                  {viewComp}
                </ConView>
              ) : (
                viewComp
              )}
            </Con>
          </React.Fragment>
        )}
      </Con>
    </SheetContext.Provider>
  );
}

Sheet.propTypes = {
  flag: PropTypes.string,
  type: PropTypes.string,
  loading: PropTypes.bool,
  appId: PropTypes.string,
  groupId: PropTypes.string,
  worksheetId: PropTypes.string,
  viewId: PropTypes.string,
  activeViewStatus: PropTypes.number,
  isCharge: PropTypes.bool,
  worksheetInfo: PropTypes.shape({}),
  sheetSwitchPermit: PropTypes.arrayOf(PropTypes.shape({})),
  views: PropTypes.arrayOf(PropTypes.shape({})),
  loadWorksheet: PropTypes.func,
};

export default connect(
  state => ({
    appId: state.sheet.base.appId,
    groupId: state.sheet.base.groupId,
    worksheetId: state.sheet.base.worksheetId,
    viewId: state.sheet.base.viewId,
    chartId: state.sheet.base.chartId,
    worksheetInfo: state.sheet.worksheetInfo,
    isCharge: state.sheet.isCharge,
    loading: state.sheet.loading,
    error: state.sheet.error,
    views: state.sheet.views,
    activeViewStatus: state.sheet.activeViewStatus,
    quickFilter: state.sheet.quickFilter,
  }),
  dispatch =>
    bindActionCreators(
      _.pick(actions, ['updateBase', 'updateFilters', 'loadWorksheet', 'updateGroupFilter', 'openNewRecord']),
      dispatch,
    ),
)(errorBoundary(Sheet));
