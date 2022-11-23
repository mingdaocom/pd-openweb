// import WorkSheetFilter from './WorkSheetFilter';
// export default WorkSheetFilter;
import React, { useReducer } from 'react';
import FiltersPopup from './FiltersPopup';
import { createReducer, createActions, initialState } from './model';

export default function (props) {
  const [state = {}, dispatch] = useReducer(createReducer, initialState);
  const actions = createActions(dispatch, state);
  return <FiltersPopup {...props} state={state} actions={actions} />;
}
