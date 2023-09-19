import React from 'react';
import PropTypes from 'prop-types';
import ChildTable from 'worksheet/components/ChildTable';
import RecordInfoContext from 'worksheet/common/recordInfo/RecordInfoContext';
import sheetAjax from 'src/api/worksheet';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import { isRelateRecordTableControl } from 'worksheet/util';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { FROM } from '../../tools/config';
import autobind from 'core-decorators/lib/autobind';
import { browserIsMobile } from 'src/util';
import { formatSearchConfigs } from 'src/pages/widgetConfig/util';
import _ from 'lodash';

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
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    this.loadWorksheetInfo(this.props.dataSource);
  }

  get publicLinkId() {
    try {
      return (
        /\/public\/workflow/.test(location.pathname) &&
        decodeURIComponent(location.pathname)
          .split(' ')[0]
          .match(/\/public\/workflow\/(\w{24})/)[1]
      );
    } catch (err) {
      return;
    }
  }

  loadWorksheetInfo(worksheetId) {
    const { recordId, controlId, value, updateRelationControls = () => {} } = this.props;
    const controlPermission = controlState({ ...this.props }, this.props.from);
    const args = { worksheetId, getTemplate: true, getRules: true };
    const { instanceId, workId } = browserIsMobile()
      ? this.props.mobileApprovalRecordInfo || {}
      : _.get(this, 'context.recordBaseInfo') || {};
    const linkId = this.publicLinkId;

    let getWorksheetInfoPromise;
    if (linkId) {
      args.linkId = linkId;
      args.controlId = controlId;
      getWorksheetInfoPromise = sheetAjax.getWorksheetInfoByWorkItem;
    } else if (recordId && instanceId && workId) {
      args.instanceId = instanceId;
      args.workId = workId;
      args.controlId = controlId;
      getWorksheetInfoPromise = sheetAjax.getWorksheetInfoByWorkItem;
    } else if (this.props.from !== FROM.PUBLIC_ADD || _.get(window, 'shareState.isPublicFormPreview')) {
      getWorksheetInfoPromise = sheetAjax.getWorksheetInfo;
    } else {
      getWorksheetInfoPromise = publicWorksheetAjax.getWorksheetInfo;
    }
    args.relationWorksheetId = this.props.worksheetId;
    Promise.all([getWorksheetInfoPromise(args), sheetAjax.getQueryBySheetId({ worksheetId })]).then(
      ([info, queryRes]) => {
        const isWorkflow = ((instanceId && workId) || linkId) && info.workflowChildTableSwitch !== false;

        if (!_.isObject(value) && isWorkflow) {
          updateRelationControls(
            worksheetId,
            info.template.controls.filter(c => c.controlId !== 'rowid'),
          );
        }
        this.setState({
          loading: false,
          searchConfig: formatSearchConfigs(queryRes),
          controls: info.template.controls.map(c => ({
            ...c,
            ...(isWorkflow
              ? {}
              : {
                  controlPermissions:
                    isRelateRecordTableControl(c) || c.type === 34 ? '000' : controlPermission.editable ? '111' : '101',
                }),
          })),
          projectId: info.projectId,
          info,
        });
      },
    );
  }

  @autobind
  handleChange({ rows, originRows = [], lastAction = {} }, mode) {
    if (mode === 'childTableDialog') {
      this.childTable.current.store.dispatch({
        type: 'INIT_ROWS',
        rows,
      });
    }
    const { value, recordId, onChange, from } = this.props;
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
        } else if (lastAction.type === 'DELETE_ROWS') {
          deleted = _.uniqBy(deleted.concat(lastAction.rowIds)).filter(id => !/^(temp|default)/.test(id));
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
    if (from === 21 && lastAction.type === 'INIT_ROWS') {
      onChange({
        deleted: [],
        updated: (rows || []).map(r => r.rowid),
        controls,
        rows: rows || [],
        isDefault: true,
      });
    }
  }

  render() {
    const {
      from,
      registerCell,
      worksheetId,
      recordId,
      formData,
      disabled,
      appId,
      initSource,
      viewIdForPermit,
      sheetSwitchPermit,
      flag,
    } = this.props;
    const { controls, projectId, info } = this.state;
    const { instanceId, workId } = browserIsMobile()
      ? this.props.mobileApprovalRecordInfo || {}
      : _.get(this, 'context.recordBaseInfo') || {};
    const control = { ...this.props };
    const { loading, searchConfig } = this.state;
    return (
      <div
        className="mdsubList"
        style={{ minHeight: 74, margin: '2px 0 12px', background: loading ? '#f7f7f7' : 'transparent' }}
      >
        {!loading && (
          <ChildTable
            ref={this.childTable}
            isWorkflow={((instanceId && workId) || this.linkId) && info.workflowChildTableSwitch !== false}
            initSource={initSource}
            entityName={info.entityName}
            rules={info.rules}
            registerCell={registerCell}
            appId={info.appId || appId}
            viewId={viewIdForPermit}
            from={from}
            control={control}
            controls={controls}
            recordId={recordId}
            searchConfig={searchConfig || []}
            sheetSwitchPermit={sheetSwitchPermit}
            flag={flag}
            masterData={{
              worksheetId,
              formData: formData
                .map(c => _.pick(c, ['controlId', 'type', 'value', 'options', 'attribute']))
                .filter(c => !!c.value),
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
