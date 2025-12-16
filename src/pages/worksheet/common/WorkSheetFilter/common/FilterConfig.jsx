import React, { useEffect, useReducer } from 'react';
import _ from 'lodash';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import styled from 'styled-components';
import { SYSTEM_CONTROLS } from 'worksheet/constants/enum';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { WORKFLOW_SYSTEM_CONTROL } from 'src/pages/widgetConfig/config/widget';
import { filterOnlyShowField } from 'src/pages/widgetConfig/util';
import FilterDetail from '../components/FilterDetail';
import { CONTROL_FILTER_WHITELIST } from '../enum';
import { createActions, createReducer, formatForSave, initialState } from '../model';
import { formatOriginFilterGroupValue, redefineComplexControl } from '../util';

const Con = styled.div``;

export default function SingleFilter(props) {
  const {
    from,
    version,
    supportGroup,
    appId,
    viewId,
    projectId,
    isRules,
    feOnly,
    sheetSwitchPermit,
    showSystemControls,
    canEdit,
    conditions,
    onConditionsChange,
    currentColumns,
    relateSheetList,
    sourceControlId,
    globalSheetControls,
    filterDept,
    filterResigned = true,
    filterError,
    urlParams,
    showCustom,
    widgetControlData,
  } = props;
  let { columns } = props;
  const filterWhiteKeys = _.flatten(
    Object.keys(CONTROL_FILTER_WHITELIST).map(key => CONTROL_FILTER_WHITELIST[key].keys),
  );
  columns = columns
    .filter(c => (c.controlPermissions || '111')[0] === '1')
    .map(redefineComplexControl)
    .filter(c => _.includes(filterWhiteKeys, c.type))
    .filter(c => !(c.type === 38 && c.enumDefault === 3));
  if (showSystemControls) {
    columns = columns
      .filter(column => !_.find(SYSTEM_CONTROLS, c => c.controlId === column.controlId))
      .concat(SYSTEM_CONTROLS);
  }
  columns = columns.sort((a, b) => (a.row * 10 + a.col > b.row * 10 + b.col ? 1 : -1));
  const [state = {}, dispatch] = useReducer(createReducer, {
    ...initialState,
    editingFilter: formatOriginFilterGroupValue({ items: conditions }),
  });
  const { editingFilter } = state;
  const actions = createActions(dispatch, state);
  const base = {
    appId,
    projectId,
  };
  const showWorkflowControl = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit, viewId);
  function filterAddConditionControls(controls) {
    return filterOnlyShowField(
      showWorkflowControl
        ? controls
        : controls.filter(
            c =>
              !_.includes(
                WORKFLOW_SYSTEM_CONTROL.map(c => c.controlId),
                c.controlId,
              ),
          ),
    );
  }
  useEffect(() => {
    if (/^(ADD_|UPDATE_|DELETE_)/.test(state.lastAction)) {
      const formattedValues = formatForSave(state.editingFilter, { returnFullValues: feOnly, noCheck: true });
      if (formattedValues) {
        onConditionsChange(formattedValues.filter(_.identity));
      }
    }
  }, [state.lastAction]);
  useEffect(() => {
    if (!version) {
      return;
    }
    actions.editFilter(formatOriginFilterGroupValue({ items: conditions }));
  }, [version]);
  return (
    <Con>
      <FilterDetail
        supportGroup={supportGroup}
        canEdit={canEdit}
        isSingleFilter
        from={from}
        base={base}
        isRules={isRules}
        filter={editingFilter}
        actions={actions}
        controls={columns}
        filterResigned={filterResigned}
        filterError={filterError}
        filterAddConditionControls={filterAddConditionControls}
        showCustom={showCustom}
        conditionProps={{
          filterDept,
          sourceControlId,
          currentColumns,
          relateSheetList,
          globalSheetControls,
          widgetControlData,
          urlParams,
        }}
      />
    </Con>
  );
}

SingleFilter.propTypes = {
  appId: string,
  canEdit: string,
  columns: arrayOf(shape({})),
  conditions: arrayOf(shape({})),
  feOnly: bool,
  filterColumnClassName: string,
  from: number,
  isRules: bool,
  offset: number,
  onConditionsChange: func,
  projectId: string,
  showSystemControls: bool,
  supportGroup: bool,
  currentColumns: arrayOf(shape({})),
  relateSheetList: arrayOf(shape({})),
  sourceControlId: string,
  globalSheetControls: arrayOf(shape({})),
  filterDept: bool,
};
