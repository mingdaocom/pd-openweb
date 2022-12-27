import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import styled from 'styled-components';
import * as actions from 'worksheet/redux/actions/gunterview';
import RecordOperate from 'worksheet/components/RecordOperate';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import RecordInfo from 'worksheet/views/GunterView/components/RecordInfo';
import CellControl from 'worksheet/components/CellControls';
import { FORM_ERROR_TYPE_TEXT } from 'src/components/newCustomFields/tools/config';
import { getAdvanceSetting } from 'src/pages/widgetConfig/util/setting';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import _ from 'lodash';

export const RecordWrapper = styled.div`
  height: 32px;
  line-height: 32px;
  padding: 0 10px;
  position: relative;
  .groupingName {
    flex: 2;
    min-width: 180px;
    padding-right: 10px;
    height: 100%;
    input {
      width: 100%;
      padding: 0 3px;
      border: none;
      height: 30px;
      line-height: 30px;
      border: 2px solid #2196f3;
    }
    &:hover {
      .icon-edit {
        display: inline;
      }
    }
  }
  .field {
    flex: 1;
    min-width: 110px;
    .editableCellCon {
      display: none;
    }
  }
  .edit {
    transform: translateX(-5px);
  }
  .icon-more_horiz {
    opacity: 0;
    &:hover {
      color: #2196f3 !important;
    }
  }
  &:hover .icon-more_horiz {
    opacity: 1;
  }
  .editRecordName {
    width: 100%;
    border: none;
  }
  .startTimeField,
  .endTimeField {
    height: 32px;
    width: 110px;
    margin-right: 5px;
    .ant-picker-suffix {
      display: none;
    }
    &:hover {
      .icon-bellSchedule {
        display: inline;
      }
    }
  }
  .dayCountField {
    width: 80px;
  }
  .icon-bellSchedule,
  .icon-edit {
    display: none;
  }
`;

@connect(
  state => ({
    ..._.pick(state.sheet, ['base', 'controls', 'sheetSwitchPermit', 'buttons', 'worksheetInfo', 'gunterView']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class Record extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startTimeEdit: false,
      endTimeEdit: false,
      recordInfoVisible: false,
    };
    this.debounceUpdateRecordTime = _.debounce(props.updateRecordTime, 500);
  }
  get canedit() {
    const { row, base, sheetSwitchPermit } = this.props;
    return row.allowedit && isOpenPermit(permitList.quickSwitch, sheetSwitchPermit, base.viewId);
  }
  handleClick = () => {
    const { row, base, controls, sheetSwitchPermit, gunterView } = this.props;
    const { titleDisable } = gunterView.viewConfig;
    const titleControl = _.find(controls, { attribute: 1 });
    if (this.clicktimer) {
      clearTimeout(this.clicktimer);
      this.clicktimer = null;
      this.canedit &&
        titleControl.type === 2 &&
        !titleDisable &&
        this.props.updateGroupingRow({ isEdit: true }, row.rowid);
    } else {
      this.clicktimer = setTimeout(() => {
        this.clicktimer = null;
        this.setState({
          recordInfoVisible: true,
        });
      }, 260);
    }
  };
  handleCreate = (event, title, titleControl) => {
    const { row, addRecord, updateRecordTitle } = this.props;
    const value = event.target.value || _l('未命名');
    const { checkrange, min, max } = getAdvanceSetting(titleControl);
    this.props.updateEditIndex(null);
    this.props.updateGroupingRow({ isEdit: false }, row.rowid);
    if (checkrange === '1') {
      if (value.length > +max || value.length < +min) {
        const errorText = FORM_ERROR_TYPE_TEXT.TEXT_RANGE({ value, advancedSetting: { min, max } });
        alert(errorText);
        return;
      }
    }
    const cell = {
      controlId: titleControl.controlId,
      controlName: titleControl.controlName,
      dot: titleControl.dot,
      type: titleControl.type,
      value,
    };
    if (value !== title) {
      if (row.rowid.includes('createrowid')) {
        addRecord(cell, row);
      } else {
        updateRecordTitle(cell, row);
      }
    }
  };
  renderStartTime() {
    const { startTimeEdit } = this.state;
    const { base, sheetSwitchPermit, worksheetInfo, row, controls, gunterView } = this.props;
    const { startId, startDisable } = gunterView.viewConfig;
    const startControl = _.find(controls, { controlId: startId });
    return (
      <div className="field valignWrapper startTimeField Relative">
        {startTimeEdit ? (
          <CellControl
            viewId={base.viewId}
            worksheetId={base.worksheetId}
            sheetSwitchPermit={sheetSwitchPermit}
            tableFromModule={3}
            clickEnterEditing={true}
            isSubList={false}
            isediting={true}
            clearCellError={() => {}}
            cellUniqueValidate={() => {}}
            cell={{ ...startControl, value: row.startTime }}
            row={row}
            rowIndex={1}
            rowHeight={32}
            from={1}
            projectId={worksheetInfo.projectId}
            updateCell={(cell, options) => {
              this.debounceUpdateRecordTime(row, cell.value || '', null);
            }}
            onCellFocus={() => {
              this.setState({ startTimeEdit: false });
            }}
            checkRulesErrorOfControl={() => {}}
          />
        ) : (
          <Fragment>
            <span
              className="flex pointer overflow_ellipsis"
              onDoubleClick={() => {
                row.allowedit && !startDisable && this.setState({ startTimeEdit: true });
              }}
            >
              {row.startTime || '--'}
            </span>
            {this.canedit && !startDisable && (
              <Icon
                onClick={() => {
                  row.allowedit && this.setState({ startTimeEdit: true });
                }}
                icon="bellSchedule mRight8 pointer Font17 Gray_9e"
              />
            )}
          </Fragment>
        )}
      </div>
    );
  }
  renderEndTime() {
    const { endTimeEdit } = this.state;
    const { base, sheetSwitchPermit, worksheetInfo, row, controls, gunterView } = this.props;
    const { endId, endDisable } = gunterView.viewConfig;
    const enndControl = _.find(controls, { controlId: endId });
    return (
      <div className="field valignWrapper endTimeField Relative">
        {endTimeEdit ? (
          <CellControl
            viewId={base.viewId}
            worksheetId={base.worksheetId}
            sheetSwitchPermit={sheetSwitchPermit}
            tableFromModule={3}
            clickEnterEditing={true}
            isSubList={false}
            isediting={true}
            clearCellError={() => {}}
            cellUniqueValidate={() => {}}
            cell={{ ...enndControl, value: row.endTime }}
            row={row}
            rowIndex={1}
            rowHeight={32}
            from={1}
            projectId={worksheetInfo.projectId}
            updateCell={(cell, options) => {
              this.debounceUpdateRecordTime(row, null, cell.value || '');
            }}
            onCellFocus={() => {
              this.setState({ endTimeEdit: false });
            }}
            checkRulesErrorOfControl={() => {}}
          />
        ) : (
          <Fragment>
            <span
              className="flex pointer overflow_ellipsis"
              onDoubleClick={() => {
                row.allowedit && !endDisable && this.setState({ endTimeEdit: true });
              }}
            >
              {row.endTime || '--'}
            </span>
            {this.canedit && !endDisable && (
              <Icon
                onClick={() => {
                  row.allowedit && this.setState({ endTimeEdit: true });
                }}
                icon="bellSchedule mRight8 pointer Font17 Gray_9e"
              />
            )}
          </Fragment>
        )}
      </div>
    );
  }
  renderMore() {
    const { row, base, sheetSwitchPermit, buttons, worksheetInfo, groupKey, gunterView } = this.props;
    const { appId, worksheetId, viewId } = base;
    return (
      <RecordOperate
        popupAlign={{
          offset: [0, 10],
          points: ['tl', 'bl'],
        }}
        shows={['share', 'print', 'copy', 'openinnew']}
        allowDelete={row.allowdelete}
        allowCopy={worksheetInfo.allowAdd}
        projectId={worksheetInfo.projectId}
        appId={appId}
        worksheetId={worksheetId}
        sheetSwitchPermit={sheetSwitchPermit}
        defaultCustomButtons={buttons}
        viewId={viewId}
        recordId={row.rowid}
        onUpdate={(updateControls, newItem) => {
          this.props.updateRecord(row, updateControls, newItem);
        }}
        onDelete={() => {
          this.props.removeRecord(row.rowid);
        }}
        onCopySuccess={data => {
          const { grouping } = gunterView;
          const { rows } = _.find(grouping, { key: groupKey });
          const index = _.findIndex(rows, { rowid: row.rowid });
          this.props.addNewRecord(data, index + 1);
        }}
      >
        <Icon className="Gray_9e Font17 mRight5 pointer" icon="more_horiz" />
      </RecordOperate>
    );
  }
  renderTitle() {
    const { row, groupKey, controls, worksheetInfo, sheetSwitchPermit, base, gunterView } = this.props;
    const titleControl = _.find(controls, { attribute: 1 });
    const value = row[titleControl.controlId] || row.titleValue;
    const emptyValue = _l('未命名');
    const title = titleControl ? renderCellText({ ...titleControl, value }) : emptyValue;
    const { titleDisable } = gunterView.viewConfig;
    return (
      <div
        className={cx('groupingName valignWrapper', { edit: row.isEdit })}
        onClick={row.isEdit ? _.noop : this.handleClick}
      >
        {row.isEdit && titleControl.type === 2 ? (
          <input
            autoFocus
            defaultValue={title}
            onBlur={event => {
              this.handleCreate(event, title, titleControl);
            }}
            onKeyDown={event => {
              if (event.which === 13) {
                if (row.rowid.includes('createrowid')) {
                  event.target.blur();
                  this.props.createRecord(groupKey, row.isMilepost);
                } else {
                  this.handleCreate(event, title, titleControl);
                }
              }
            }}
          />
        ) : (
          <Fragment>
            <span className="flex pointer overflow_ellipsis">{title || emptyValue}</span>
            {this.canedit && titleControl.type === 2 && !titleDisable && (
              <Icon
                onClick={e => {
                  e.stopPropagation();
                  this.clicktimer = true;
                  this.handleClick();
                }}
                icon="edit mRight8 pointer Font17 Gray_9e"
              />
            )}
          </Fragment>
        )}
      </div>
    );
  }
  render() {
    const { recordInfoVisible } = this.state;
    const { row } = this.props;
    return (
      <RecordWrapper className={cx('valignWrapper gunterRecord', `gunterRecord-${row.rowid}`)}>
        {window.share ? <div style={{ width: 22 }}/> : this.renderMore()}
        {this.renderTitle()}
        {this.renderStartTime()}
        {this.renderEndTime()}
        <div className="dayCountField overflow_ellipsis">{row.diff ? _l('%0天', row.diff) : '--'}</div>
        {recordInfoVisible && (
          <RecordInfo
            row={row}
            onClose={() => {
              this.setState({ recordInfoVisible: false });
            }}
          />
        )}
      </RecordWrapper>
    );
  }
}
