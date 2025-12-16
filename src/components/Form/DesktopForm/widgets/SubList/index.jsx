import React from 'react';
import _, { find, get } from 'lodash';
import PropTypes from 'prop-types';
import RecordInfoContext from 'worksheet/common/recordInfo/RecordInfoContext';
import ChildTable from 'worksheet/components/ChildTable';

export default class SubList extends React.Component {
  static contextType = RecordInfoContext;
  static propTypes = {
    from: PropTypes.number,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
    worksheetId: PropTypes.string,
    recordId: PropTypes.string,
    dataSource: PropTypes.string,
    formData: PropTypes.arrayOf(PropTypes.shape({})),
    registerCell: PropTypes.func,
    onChange: PropTypes.func,
  };

  childTable = React.createRef();

  constructor(props) {
    super(props);
    this.debounceChange = _.debounce(this.props.onChange, 300);
  }

  handleChange = ({ rows, originRows = [], lastAction = {} }, mode) => {
    if (mode === 'childTableDialog') {
      if (!this.childTable.current) return;

      this.childTable.current.store.dispatch({
        type: 'FORCE_SET_OUT_ROWS',
        rows,
      });
    }
    const { value, recordId, onChildTableLoaded = () => {} } = this.props;
    // 子表导入场景这里可以异化，导入完成再调用 onChange
    const onChange =
      lastAction.type === 'UPDATE_ROW' && lastAction.asyncUpdate ? this.debounceChange : this.props.onChange;

    const isAdd = !recordId;
    if (!isAdd && lastAction.type === 'INIT_ROWS') {
      onChildTableLoaded();
    }
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
          'RESET_TREE',
          'UPDATE_TREE_TABLE_VIEW_DATA',
          'UPDATED_TREE_NODE_EXPANSION',
          'UPDATE_TREE_TABLE_VIEW_ITEM',
          'UPDATE_TREE_TABLE_VIEW_TREE_MAP',
          'WORKSHEET_SHEETVIEW_APPEND_ROWS',
          'UPDATE_PAGINATION',
          'RESET_CHANGES',
        ],
        lastAction.type,
      ) &&
      !/^@/.test(lastAction.type)
    ) {
      if (lastAction.type === 'ADD_ROWS' && find(lastAction.rows, row => row.isAddByTree)) {
        return;
      }
      if (isAdd) {
        onChange({
          isAdd: true,
          disabledRuleSet: get(lastAction, 'isSetValueFromRule'),
          rows: rows.filter(row => !row.empty),
        });
      } else if (lastAction.type === 'CLEAR_AND_SET_ROWS') {
        onChange({
          deleted: get(lastAction, 'isSetValueFromEvent')
            ? value.deleted || lastAction.deleted || []
            : originRows.map(r => r.rowid),
          updated: rows.map(r => r.rowid),
          rows: rows,
          disabledRuleSet: get(lastAction, 'isSetValueFromRule'),
        });
      } else {
        let deleted = [];
        let updated = [];
        try {
          deleted = value.deleted || lastAction.deleted || [];
          updated = value.updated || lastAction.updated || [];
        } catch (err) {
          console.log(err);
        }
        if (lastAction.type === 'DELETE_ROW') {
          deleted = _.uniqBy(deleted.concat(lastAction.rowid)).filter(id => !/^(temp|default)/.test(id));
        } else if (lastAction.type === 'DELETE_ROWS') {
          deleted = _.uniqBy(deleted.concat(lastAction.rowIds)).filter(id => !/^(temp|default)/.test(id));
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
        onChange({
          deleted,
          updated,
          rows: rows,
        });
      }
    }
  };

  render() {
    const {
      from,
      registerCell,
      worksheetId,
      recordId,
      formData,
      appId,
      initSource,
      viewIdForPermit,
      sheetSwitchPermit,
      flag,
      isDraft,
    } = this.props;
    const control = { ...this.props };
    return (
      <div className="mdsubList">
        {
          <ChildTable
            showSearch
            showExport
            ref={this.childTable}
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
                .map(c =>
                  _.pick(c, [
                    'controlId',
                    'type',
                    'value',
                    'options',
                    'attribute',
                    'enumDefault',
                    'sourceControl',
                    'sourceControlType',
                  ]),
                )
                .filter(c => !!c.value),
            }}
            onChange={this.handleChange}
          />
        }
      </div>
    );
  }
}
