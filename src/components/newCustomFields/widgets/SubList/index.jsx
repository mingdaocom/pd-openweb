import React from 'react';
import PropTypes from 'prop-types';
import ChildTable from 'worksheet/components/ChildTable';
import sheetAjax from 'src/api/worksheet';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import { isRelateRecordTableControl } from 'worksheet/util';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { FROM } from '../../tools/config';
import autobind from 'core-decorators/lib/autobind';
import { browserIsMobile } from 'src/util';

export default class SubList extends React.Component {
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

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    this.loadWorksheetInfo(this.props.dataSource);
  }

  loadWorksheetInfo(worksheetId) {
    const controlPermission = controlState({ ...this.props }, this.props.from);
    const getWorksheetInfoPromise =
      this.props.from !== FROM.PUBLIC ? sheetAjax.getWorksheetInfo : publicWorksheetAjax.getWorksheetInfo;
    getWorksheetInfoPromise({ worksheetId, getTemplate: true, getRules: true }).then(info => {
      this.setState({
        loading: false,
        controls: info.template.controls.map(c => ({
          ...c,
          controlPermissions:
            isRelateRecordTableControl(c) || c.type === 34 ? '000' : controlPermission.editable ? '111' : '101',
        })),
        projectId: info.projectId,
        info,
      });
    });
  }

  @autobind
  handleChange({ rows, originRows = [], lastAction = {} }) {
    const { value, recordId, onChange } = this.props;
    const { controls } = this.state;
    const isAdd = !recordId;
    if (lastAction.type !== 'INIT_ROWS' && lastAction.type !== 'LOAD_ROWS') {
      if (isAdd) {
        onChange({
          isAdd: true,
          controls,
          rows: rows.filter(row => !row.empty),
        });
      } else if (lastAction.type === 'CLEAR_AND_SET_ROWS') {
        onChange({
          deleted: originRows.map(r => r.rowid),
          updated: rows.map(r => r.rowid),
          controls,
          rows: rows,
        });
      } else {
        let deleted = [];
        let updated = [];
        try {
          deleted = value.deleted || [];
          updated = value.updated || [];
        } catch (err) {}
        if (lastAction.type === 'DELETE_ROW') {
          deleted = _.uniqBy(deleted.concat(lastAction.rowid)).filter(id => !/^(temp|default)/.test(id));
        } else if (lastAction.type === 'ADD_ROW' || lastAction.type === 'UPDATE_ROW') {
          updated = _.uniqBy(updated.concat(lastAction.rowid));
        } else if (lastAction.type === 'ADD_ROWS') {
          updated = _.uniqBy(updated.concat(lastAction.rows.map(r => r.rowid)));
        }
        onChange({
          deleted,
          updated,
          controls,
          rows: rows,
        });
      }
    }
  }

  render() {
    const { from, registerCell, worksheetId, recordId, formData, disabled, appId } = this.props;
    const { controls, projectId, info } = this.state;
    const control = { ...this.props };
    const { loading } = this.state;
    return (
      <div
        className="mdsubList"
        style={{ minHeight: 74, margin: '10px 0 12px', background: loading ? '#f7f7f7' : 'transparent' }}
      >
        {!loading && (
          <ChildTable
            entityName={info.entityName}
            rules={info.rules}
            registerCell={registerCell}
            appId={info.appId || appId}
            from={from}
            control={control}
            controls={controls}
            recordId={recordId}
            masterData={{
              worksheetId,
              formData: formData.map(c => _.pick(c, ['controlId', 'type', 'value', 'options'])).filter(c => !!c.value),
            }}
            projectId={projectId}
            onChange={this.handleChange}
            mobileIsEdit={browserIsMobile() ? !disabled : undefined}
          />
        )}
      </div>
    );
  }
}
