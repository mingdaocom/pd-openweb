import React, { useEffect, useMemo, useRef, useState } from 'react';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import { Provider } from 'react-redux';
import { get, isEqual, isFunction } from 'lodash';
import cx from 'classnames';
import styled from 'styled-components';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import RelateRecordTable from './RelateRecordTable';
import generateStore from './redux/store';
import { updateFilter } from './redux/action';
import { initialChanges } from './redux/reducer';

const Con = styled.div`
  position: relative;
  line-height: 1.5;
  ${({ useHeight }) => useHeight && 'height: 100%;'}
  ${({ isSplit }) => isSplit && 'flex: 1; overflow: hidden; display: flex; flex-direction: column;'}
`;

export default function RelateRecordTableIndex(props) {
  const {
    mode,
    appId,
    control,
    isCharge,
    allowEdit,
    pageSize,
    worksheetId,
    recordId,
    formData = [],
    sheetSwitchPermit,
    onCountChange,
  } = props;
  const [filters, setFilters] = useState(false);
  const cache = useRef({
    changes: { addedRecordIds: [], deletedRecordIds: [] },
  });
  const store = useMemo(() => {
    cache.current = {
      changes: { addedRecordIds: [], deletedRecordIds: [] },
    };
    return (
      control.store ||
      generateStore(control, {
        mode,
        recordId,
        allowEdit,
        worksheetId,
        formData,
        pageSize,
        sheetSwitchPermit,
        isCharge,
        appId,
      })
    );
  }, [control.controlId, get(control, 'store.version')]);
  useEffect(() => {
    cache.current.storeVersion = store.version;
    store.subscribe(() => {
      if (cache.current.storeVersion !== store.version) return;
      const state = store.getState();
      const changed = !isEqual(cache.current.changes, state.changes) && !isEqual(state.changes, initialChanges);
      const newCount =
        !state.base.saveSync && typeof state.tableState.countForShow !== 'undefined'
          ? state.tableState.countForShow
          : state.tableState.count;
      if ((cache.current.count !== newCount || !recordId) && isFunction(onCountChange)) {
        onCountChange(newCount, get(state, 'base.isTab') ? get(state, 'changes.changed') : changed);
      }
      cache.current.count = newCount;
      cache.current.changes = state.changes;
    });
  }, [store.version]);
  useEffect(() => {
    if (control.type !== 51) return;
    setFilters(
      getFilter({
        control: { ...control, relationControls: store.getState().controls, recordId },
        formData,
        filterKey: 'resultfilters',
      }),
    );
  }, [
    formData
      .filter(a => (get(control, 'advancedSetting.resultfilters') || '').indexOf(a.controlId) > -1)
      .map(c => c.value)
      .join(''),
  ]);
  useEffect(() => {
    if (control.type !== 51) return;
    store.dispatch({
      type: 'UPDATE_BASE',
      value: { formData, recordId },
    });
    if (!store.getState().loading && control.type === 51) {
      store.dispatch(updateFilter());
    }
  }, [filters]);
  useEffect(() => {
    store.init();
  }, [store.version]);
  return (
    <Provider store={store}>
      <Con useHeight={props.useHeight} isSplit={props.isSplit} className={cx({ flexColumn: props.useHeight })}>
        <RelateRecordTable {...props} />
      </Con>
    </Provider>
  );
}

RelateRecordTableIndex.propTypes = {
  useHeight: bool,
  allowEdit: bool,
  pageSize: number,
  control: shape({}),
  worksheetId: string,
  recordId: string,
  formData: arrayOf(shape({})),
  sheetSwitchPermit: arrayOf(shape({})),
  onCountChange: func,
};
