import React, { useEffect, useReducer } from 'react';
import { bool, string, shape, arrayOf, number, func } from 'prop-types';
import styled from 'styled-components';
import { SYSTEM_CONTROLS } from 'worksheet/constants/enum';
import { createReducer, createActions, initialState, formatForSave } from '../model';
import { redefineComplexControl, formatOriginFilterGroupValue } from '../util';
import FilterDetail from '../components/FilterDetail';
import { CONTROL_FILTER_WHITELIST } from '../enum';

const Con = styled.div``;

export default function SingleFilter(props) {
  const {
    from,
    version,
    supportGroup,
    offset,
    appId,
    projectId,
    isRules,
    feOnly,
    showSystemControls,
    filterColumnClassName, // 样式类名 待确认
    canEdit,
    conditions,
    onConditionsChange,
    currentColumns,
    relateSheetList,
    sourceControlId,
    globalSheetControls,
    filterDept,
    filterResigned = true,
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
        filter={editingFilter}
        actions={actions}
        controls={columns}
        filterResigned={filterResigned}
        conditionProps={{
          filterDept,
          sourceControlId,
          currentColumns,
          relateSheetList,
          globalSheetControls,
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

// TODO 初始化会更新
