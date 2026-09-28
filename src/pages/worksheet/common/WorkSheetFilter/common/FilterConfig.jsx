import React, { useEffect, useReducer } from 'react';
import _ from 'lodash';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import styled from 'styled-components';
import { filterOnlyShowField } from 'src/utils/domain/control/filters';
import { permitList } from 'src/utils/domain/control/formEnum';
import { redefineComplexControl } from 'src/utils/domain/control/normalization';
import { WORKFLOW_SYSTEM_CONTROL } from 'src/utils/domain/control/widget';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import { SYSTEM_CONTROLS } from 'src/utils/domain/worksheet/constants';
import { formatOriginFilterGroupValue } from 'src/utils/domain/worksheet/filterCondition';
import { CONTROL_FILTER_WHITELIST } from 'src/utils/domain/worksheet/filterConstants';
import FilterDetail from '../components/FilterDetail';
import { createActions, createReducer, formatForSave, initialState } from '../model';

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
    disableAddCondition,
  } = props;
  let { columns = [] } = props;
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
    const availableControls = showWorkflowControl
      ? controls
      : controls.filter(
          c =>
            !_.includes(
              WORKFLOW_SYSTEM_CONTROL.map(c => c.controlId),
              c.controlId,
            ),
        );

    return from === 'rule' ? availableControls : filterOnlyShowField(availableControls);
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
          disableAddCondition,
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
