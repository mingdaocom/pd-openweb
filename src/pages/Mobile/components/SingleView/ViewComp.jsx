import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { loadWorksheet } from 'src/pages/Mobile/RecordList/redux/actions';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import View from 'src/pages/Mobile/RecordList/View';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';

const Con = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ViewCon = styled.div`
  flex: 1;
  border: 1px solid #e0e0e0 !important;
`;

function ViewComp(props) {
  const { showHeader, headerLeft, headerRight } = props;
  const { base, workSheetLoading, worksheetInfo, sheetSwitchPermit } = props;
  const { loadWorksheet } = props;
  const { views = [], allowAdd } = worksheetInfo;
  const { viewId, appId, worksheetId } = base;
  
  const view = _.find(views, { viewId }) || (!viewId && views[0]) || {};
  const basePara = {};

  useEffect(() => {
    if (appId && worksheetId) {
      loadWorksheet();
    }
  }, [appId, worksheetId]);

  return (
    !workSheetLoading && (
      <Con className="SingleViewWrap">
        {showHeader && (
          <div className="SingleViewHeader mobile flexRow">
            {headerLeft}
            <div className="flex" />
            {isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) && allowAdd && (
              <Icon
                icon="plus"
                className="addRecord Font20 Gray_9e"
                onClick={() => {
                  const { appId, worksheetId } = worksheetInfo;
                  const { viewId } = view;
                  window.mobileNavigateTo(`/mobile/addRecord/${appId}/${worksheetId}/${viewId}`);
                }}
              />
            )}
            {headerRight}
          </div>
        )}
        <ViewCon className="flexRow SingleViewBody">
          <View view={view} />
        </ViewCon>
      </Con>
    )
  );
}

export default connect(
  state => ({
    ..._.pick(state.mobile, 'base', 'workSheetLoading', 'worksheetInfo', 'sheetSwitchPermit')
  }),
  dispatch =>
    bindActionCreators(
      {
        loadWorksheet,
      },
      dispatch,
    ),
)(errorBoundary(ViewComp));

