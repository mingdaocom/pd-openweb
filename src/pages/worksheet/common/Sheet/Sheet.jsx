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
const { sheet, gallery } = VIEW_DISPLAY_TYPE;
import './style.less';

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

const Drag = styled.div(
  ({ left }) => `
  position: absolute;
  z-index: 2;
  left: ${left}px;
  width: 10px;
  height: 100%;
  cursor: ew-resize;
  border-left: 1px solid rgba(0,0,0,0.04);
  &:hover{
    border-left: 1px solid #2196f3;
  }
`,
);

function Sheet(props) {
  const {
    loading,
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
    navGroupFilters = [],
    chartId,
    showControlIds,
    showAsSheetView,
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
  const view = _.find(views, { viewId }) || (!viewId && views[0]) || {};
  const hasGroupFilter =
    !_.isEmpty(view.navGroup) && view.navGroup.length > 0 && _.includes([sheet, gallery], String(view.viewType));
  const basePara = {
    loading,
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
    groupFilterWidth: hasGroupFilter ? groupFilterWidth : 0,
    chartId,
    showControlIds,
    showAsSheetView,
  };
  useEffect(() => {
    if (worksheetId) {
      loadWorksheet(worksheetId);
    }
  }, [worksheetId, flag]);

  useEffect(() => {
    updateGroupFilter([], view);
  }, [view.viewId, worksheetId]);

  return (
    <SheetContext.Provider base={basePara}>
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
            {!_.isEmpty(view.fastFilters) && _.includes([sheet, gallery], String(view.viewType)) && !chartId && (
              <QuickFilter {...basePara} filters={view.fastFilters} />
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
                      window.localStorage.setItem('navGroupWidth', value);
                    }}
                  />
                )}
                <GroupFilter
                  width={groupFilterWidth}
                  isOpenGroup={isOpenGroup}
                  changeGroupStatus={isOpen => {
                    setIsOpenGroup(isOpen);
                    window.localStorage.setItem('navGroupIsOpen', isOpen);
                    if (isOpen) {
                      setGroupFilterWidth(window.localStorage.getItem('navGroupWidth') || 210);
                    } else {
                      setGroupFilterWidth(32);
                    }
                  }}
                />
                {isOpenGroup && <Drag left={groupFilterWidth} onMouseDown={() => setDragMaskVisible(true)}></Drag>}
                <View {...basePara} />
              </ConView>
            ) : (
              <View {...basePara} />
            )}
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
    worksheetInfo: state.sheet.worksheetInfo,
    isCharge: state.sheet.isCharge,
    loading: state.sheet.loading,
    views: state.sheet.views,
    activeViewStatus: state.sheet.activeViewStatus,
  }),
  dispatch =>
    bindActionCreators(
      _.pick(actions, ['updateBase', 'loadWorksheet', 'updateGroupFilter', 'openNewRecord']),
      dispatch,
    ),
)(errorBoundary(Sheet));
