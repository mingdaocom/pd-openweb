import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { loadWorksheet, unshiftSheetRow, updateFiltersGroup } from 'mobile/RecordList/redux/actions';
import { addNewRecord, updateFilters } from 'src/pages/worksheet/redux/actions';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import View from 'mobile/RecordList/View';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { openAddRecord } from 'mobile/Record/addRecord';
import { mdAppResponse } from 'src/util';
import _ from 'lodash';

const Con = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ViewCon = styled.div`
  flex: 1;
  min-height: 0;
  border: 1px solid #e0e0e0 !important;
`;

function ViewComp(props) {
  const { showHeader, headerLeft, headerRight } = props;
  const { base, workSheetLoading, worksheetInfo, sheetSwitchPermit, filtersGroup = [] } = props;
  const { loadWorksheet, updateFilters, updateFiltersGroup } = props;
  const { views = [], allowAdd } = worksheetInfo;
  const { viewId, appId, worksheetId } = base;
  
  const view = _.find(views, { viewId }) || (!viewId && views[0]) || {};
  const basePara = {};

  useEffect(() => {
    if (appId && worksheetId) {
      loadWorksheet();
    }
  }, [appId, worksheetId]);

  useEffect(() => {
    if (view.viewType) {
      updateFilters({ filtersGroup }, view);
    } else {
      updateFiltersGroup(filtersGroup);
    }
  }, [filtersGroup]);

  return (
    !workSheetLoading && (
      <Con className="SingleViewWrap">
        {showHeader && (
          <div className="SingleViewHeader mobile flexRow valignWrapper">
            {headerLeft}
            <div className="flex" />
            {isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) && allowAdd && (
              <Icon
                icon="plus"
                className="addRecord Font20 Gray_9e"
                onClick={() => {
                  const { appId, worksheetId } = worksheetInfo;
                  const isMingdao = navigator.userAgent.toLowerCase().indexOf('mingdao application') >= 0;
                  const addRecord = (data) => {
                    if (view.viewType) {
                      props.addNewRecord(data, view);
                    } else {
                      props.unshiftSheetRow(data);
                    }
                  };
                  if (isMingdao) {
                    mdAppResponse({
                      type: 'native',
                      settings: {
                        appId,
                        worksheetId,
                        viewId: view.viewId,
                        action: 'addRow'
                      }
                    }).then(data => {
                      const { value } = data;
                      if (value) {
                        const res = JSON.parse(value);
                        res.forEach((data) => {
                          addRecord(data);
                        });
                      }
                    });
                  } else {
                    openAddRecord({
                      className: 'full',
                      worksheetInfo,
                      appId,
                      worksheetId,
                      viewId: view.viewId,
                      addType: 2,
                      entityName: worksheetInfo.entityName,
                      onAdd: addRecord,
                    });
                  }
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
        unshiftSheetRow,
        updateFiltersGroup,
        addNewRecord,
        updateFilters
      },
      dispatch,
    ),
)(errorBoundary(ViewComp));

