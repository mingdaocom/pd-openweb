import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import * as actions from 'worksheet/redux/actions';
import { addRecord } from 'worksheet/common/newRecord';
import Skeleton from 'src/router/Application/Skeleton';
import View from 'worksheet/views';
import SheetContext from './SheetContext';
import SheetHeader from './SheetHeader';
import ViewControl from './ViewControl';
import QuickFilter from './QuickFilter';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
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

function Sheet(props) {
  const {
    loading,
    appId,
    groupId,
    worksheetId,
    worksheetInfo,
    sheetSwitchPermit,
    flag,
    views,
    activeViewStatus,
    isCharge,
    addNewRecord,
  } = props;
  const [viewConfigVisible, setViewConfigVisible] = useState(false);
  let { viewId } = props;
  const { loadWorksheet, updateWorksheetSomeControls } = props;
  const view = _.find(views, { viewId }) || (!viewId && views[0]) || {};
  function openNewRecord() {
    addRecord({
      showFillNext: true,
      appId,
      viewId,
      worksheetId,
      projectId: worksheetInfo.projectId,
      needCache: true,
      addType: 1,
      showShare: isOpenPermit(permitList.recordShareSwitch, sheetSwitchPermit, viewId),
      isCharge: isCharge,
      entityName: worksheetInfo.entityName,
      onAdd: data => addNewRecord(data, view),
      updateWorksheetControls: updateWorksheetSomeControls,
    });
  }
  const basePara = {
    loading,
    appId,
    groupId,
    worksheetId,
    view,
    activeViewStatus,
    viewId: view.viewId,
    isCharge,
    openNewRecord,
    viewConfigVisible,
    setViewConfigVisible,
  };
  useEffect(() => {
    loadWorksheet(worksheetId);
  }, [worksheetId, flag]);
  return (
    <SheetContext.Provider base={basePara}>
      <Con className="worksheetSheet">
        {worksheetInfo.name && (
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
            <SheetHeader {...basePara} />
            <ViewControl {...basePara} />
            {!_.isEmpty(view.fastFilters) && _.includes([sheet, gallery], String(view.viewType)) && (
              <QuickFilter {...basePara} filters={view.fastFilters} />
            )}
            <View {...basePara} />
          </React.Fragment>
        )}
      </Con>
    </SheetContext.Provider>
  );
}

Sheet.propTypes = {
  flag: PropTypes.string,
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
  addNewRecord: PropTypes.func,
  updateWorksheetSomeControls: PropTypes.func,
};

export default connect(
  state => ({
    appId: state.sheet.base.appId,
    groupId: state.sheet.base.groupId,
    worksheetId: state.sheet.base.worksheetId,
    viewId: state.sheet.base.viewId,
    worksheetInfo: state.sheet.worksheetInfo,
    sheetSwitchPermit: state.sheet.sheetSwitchPermit,
    isCharge: state.sheet.isCharge,
    loading: state.sheet.loading,
    views: state.sheet.views,
    activeViewStatus: state.sheet.activeViewStatus,
  }),
  dispatch =>
    bindActionCreators(
      _.pick(actions, ['addNewRecord', 'updateBase', 'loadWorksheet', 'updateWorksheetSomeControls']),
      dispatch,
    ),
)(errorBoundary(Sheet));
