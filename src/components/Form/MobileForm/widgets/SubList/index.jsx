import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ChildTable from '../../components/ChildTable';

const SubListWrap = styled.div`
  &.tableWrap {
    margin-right: -20px;
  }
`;

export default function SubList(props) {
  const {
    recordId,
    from,
    registerCell,
    worksheetId,
    formData,
    disabled,
    formDisabled,
    appId,
    initSource,
    viewIdForPermit,
    sheetSwitchPermit,
    flag,
    isDraft,
    onChange = () => {},
  } = props;
  const control = { ...props };

  const debounceChange = _.debounce(onChange, 500);

  const handleChange = ({ rows, originRows = [], lastAction = {} }, value) => {
    const onChangeData = lastAction.type === 'UPDATE_ROW' && lastAction.asyncUpdate ? debounceChange : onChange;
    const isAdd = !recordId;
    if (
      !_.includes(
        [
          'INIT_ROWS',
          'LOAD_ROWS',
          'UPDATE_BASE_LOADING',
          'UPDATE_DATA_LOADING',
          'UPDATE_BASE',
          'UPDATE_CELL_ERRORS',
          'FORCE_SET_OUT_ROWS',
          'RESET',
          'UPDATE_TREE_TABLE_VIEW_DATA',
          'UPDATED_TREE_NODE_EXPANSION',
          'UPDATE_TREE_TABLE_VIEW_ITEM',
          'UPDATE_TREE_TABLE_VIEW_TREE_MAP',
          'WORKSHEET_SHEETVIEW_APPEND_ROWS',
          'UPDATE_PAGINATION',
        ],
        lastAction.type,
      ) &&
      !/^@/.test(lastAction.type)
    ) {
      if (isAdd) {
        onChangeData({
          isAdd: true,
          rows: rows.filter(row => !row.empty),
        });
      } else if (lastAction.type === 'CLEAR_AND_SET_ROWS') {
        onChangeData({
          deleted: originRows.map(r => r.rowid),
          updated: rows.map(r => r.rowid),
          rows: rows,
        });
      } else {
        let deleted = [];
        let updated = [];
        try {
          deleted = value.deleted || lastAction.deleted || [];
          updated = value.updated || lastAction.updated || [];
        } catch (err) {}
        if (lastAction.type === 'DELETE_ROW') {
          deleted = _.uniqBy(deleted.concat(lastAction.rowid)).filter(id => !/^(temp|default)/.test(id));
        } else if (lastAction.type === 'ADD_ROW' || (lastAction.type === 'UPDATE_ROW' && !lastAction.noRealUpdate)) {
          updated = _.uniqBy(
            updated.concat(
              lastAction.type === 'UPDATE_ROW'
                ? _.get(lastAction, 'value.rowid') || lastAction.rowid
                : lastAction.rowid,
            ),
          );
        } else if (lastAction.type === 'UPDATE_ROWS' && !lastAction.noRealUpdate) {
          updated = _.uniqBy(updated.concat(lastAction.rowIds));
        } else if (lastAction.type === 'ADD_ROWS') {
          updated = _.uniqBy(updated.concat(lastAction.rows.map(r => r.rowid)));
        }
        onChangeData({
          deleted,
          updated,
          rows: rows,
        });
      }
    }
  };

  return (
    <SubListWrap className={`mobileSubList ${_.get(control, 'advancedSetting.h5showtype') === '3' ? 'tableWrap' : ''}`}>
      <ChildTable
        showSearch
        showExport
        initSource={initSource}
        registerCell={registerCell}
        appId={appId}
        viewId={viewIdForPermit}
        from={from}
        control={control}
        recordId={recordId}
        sheetSwitchPermit={sheetSwitchPermit}
        flag={flag}
        isDraft={isDraft}
        masterData={{
          controlId: control.controlId,
          recordId,
          worksheetId,
          formData: formData
            .map(c => _.pick(c, ['controlId', 'type', 'value', 'options', 'attribute', 'enumDefault']))
            .filter(c => !!c.value),
        }}
        onChange={handleChange}
        mobileIsEdit={!disabled && !formDisabled}
      />
    </SubListWrap>
  );
}

SubList.PropTypes = {
  from: PropTypes.number,
  formDisabled: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
  worksheetId: PropTypes.string,
  recordId: PropTypes.string,
  dataSource: PropTypes.string,
  formData: PropTypes.arrayOf(PropTypes.shape({})),
  registerCell: PropTypes.func,
  onChange: PropTypes.func,
};
