import React, { useReducer, forwardRef, useImperativeHandle } from 'react';
import FiltersPopup from './FiltersPopup';
import { createReducer, createActions, initialState } from './model';

const WorkSheetFilter = forwardRef((props, ref) => {
  const [state = {}, dispatch] = useReducer(createReducer, {
    ...initialState,
    loading: props.showSavedFilters !== false,
  });
  const actions = createActions(dispatch, state);
  useImperativeHandle(ref, () => ({
    reset: actions.reset,
  }));
  return <FiltersPopup {...props} state={state} actions={actions} />;
});

export default WorkSheetFilter;
