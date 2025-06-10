import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import * as actions from 'worksheet/redux/actions/gunterview';
import { canEditApp, canEditData } from 'worksheet/redux/actions/util.js';
import { FORM_ERROR_TYPE_TEXT } from 'src/components/newCustomFields/tools/config';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { getAdvanceSetting } from 'src/pages/widgetConfig/util/setting';
import { renderText as renderCellText } from 'src/utils/control';
import { handlePushState, handleReplaceState } from 'src/utils/project';
import { handleRecordClick } from 'src/utils/record';

export const RecordWrapper = styled.div`
  height: 32px;
  line-height: 32px;
  padding: 0 10px;
  position: relative;
  .groupingName {
    width: 180px;
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
  .dayCountField {
    width: 80px !important;
  }
  .startTimeField,
  .endTimeField {
    .editableCellCon {
      display: none;
    }
  }
  .field,
  .dayCountField {
    height: 32px;
    width: 180px;
    border-left: 1px solid #0000000a;
    padding: 0 10px;
    position: relative;
  }
  .cellControl {
    display: flex;
  }
  .otherField > div {
    line-height: normal;
    display: flex;
  }
  .otherField29 {
    > div > div {
      width: max-content;
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
    .ant-picker-suffix {
      display: none;
    }
    &:hover {
      .icon-bellSchedule {
        display: inline;
      }
    }
  }
  .icon-bellSchedule,
  .icon-edit {
    display: none;
  }
`;

@connect(
  state => ({
    ..._.pick(state.sheet, ['base', 'controls', 'sheetSwitchPermit', 'worksheetInfo', 'gunterView', 'isCharge']),
    ..._.pick(state.appPkg, ['permissionType']),
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
      RecordInfoComponent: null,
      RecordOperateComponent: null,
      CellControlComponent: null,
    };
    this.debounceUpdateRecordTime = _.debounce(props.updateRecordTime, 500);
  }
  componentDidMount() {
    import('worksheet/views/GunterView/components/RecordInfo').then(component => {
      this.setState({
        RecordInfoComponent: component.default,
      });
    });
    import('worksheet/components/RecordOperate').then(component => {
      this.setState({
        RecordOperateComponent: component.default,
      });
    });
    import('worksheet/components/CellControls').then(component => {
      this.setState({
        CellControlComponent: component.default,
      });
    });
    window.addEventListener('popstate', this.onQueryChange);
  }
  componentWillUnmount() {
    window.removeEventListener('popstate', this.onQueryChange);
  }
  get canedit() {
    const { row, base, sheetSwitchPermit } = this.props;
    return row.allowedit && isOpenPermit(permitList.quickSwitch, sheetSwitchPermit, base.viewId);
  }
  onQueryChange = () => {
    handleReplaceState('page', 'recordDetail', () => this.setState({ recordInfoVisible: false }));
  };
  handleClick = () => {
    const { row, base, controls, sheetSwitchPermit, gunterView } = this.props;
    handleRecordClick(
      {
        advancedSetting: { clicktype: gunterView.viewConfig.clickType },
      },
      row,
      () => {
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
            handlePushState('page', 'recordDetail');
            this.setState({
              recordInfoVisible: true,
            });
          }, 260);
        }
      },
    );
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
    const { startTimeEdit, CellControlComponent } = this.state;
    const { base, sheetSwitchPermit, worksheetInfo, row, controls, gunterView, widthConfig } = this.props;
    const { startId, startDisable, displayControls } = gunterView.viewConfig;
    const startControl = _.find(controls, { controlId: startId });
    return (
      <div
        className="field valignWrapper startTimeField Relative"
        style={{ width: widthConfig[displayControls.length + 1] }}
      >
        {startTimeEdit ? (
          <CellControlComponent
            viewId={base.viewId}
            worksheetId={base.worksheetId}
            sheetSwitchPermit={sheetSwitchPermit}
            tableFromModule={3}
            clickEnterEditing={true}
            isSubList={false}
            isediting={true}
            clearCellError={() => {}}
            cellUniqueValidate={() => {}}
            cell={{ ...startControl, value: row.startTime, notConvertZone: true }}
            row={row}
            rowFormData={() => controls}
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
            <div className="flex startTimeWrap">
              <span
                className="pointer overflow_ellipsis"
                onDoubleClick={() => {
                  row.allowedit && !startDisable && this.setState({ startTimeEdit: true });
                }}
              >
                {row.startTime || '--'}
              </span>
            </div>
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
    const { endTimeEdit, CellControlComponent } = this.state;
    const { base, sheetSwitchPermit, worksheetInfo, row, controls, gunterView, widthConfig } = this.props;
    const { endId, endDisable, displayControls } = gunterView.viewConfig;
    const enndControl = _.find(controls, { controlId: endId });
    return (
      <div
        className="field valignWrapper endTimeField Relative"
        style={{ width: widthConfig[displayControls.length + 2] }}
      >
        {endTimeEdit ? (
          <CellControlComponent
            viewId={base.viewId}
            worksheetId={base.worksheetId}
            sheetSwitchPermit={sheetSwitchPermit}
            tableFromModule={3}
            clickEnterEditing={true}
            isSubList={false}
            isediting={true}
            clearCellError={() => {}}
            cellUniqueValidate={() => {}}
            cell={{ ...enndControl, value: row.endTime, notConvertZone: true }}
            row={row}
            rowFormData={() => controls}
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
            <div className="flex endTimeWrap">
              <span
                className="pointer overflow_ellipsis"
                onDoubleClick={() => {
                  row.allowedit && !endDisable && this.setState({ endTimeEdit: true });
                }}
              >
                {row.endTime || '--'}
              </span>
            </div>
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
    const { RecordOperateComponent } = this.state;
    const { row, base, sheetSwitchPermit, worksheetInfo, groupKey, gunterView, isCharge, permissionType } = this.props;
    const { appId, worksheetId, viewId } = base;
    const isDevAndOps = canEditApp(permissionType) || canEditData(permissionType);

    if (!RecordOperateComponent) return null;

    return (
      <RecordOperateComponent
        popupAlign={{
          offset: [0, 10],
          points: ['tl', 'bl'],
        }}
        isCharge={isCharge}
        isDevAndOps={isDevAndOps}
        shows={['share', 'print', 'copy', 'copyId', 'openinnew', 'fav']}
        allowDelete={row.allowdelete}
        allowCopy={worksheetInfo.allowAdd}
        projectId={worksheetInfo.projectId}
        appId={appId}
        worksheetId={worksheetId}
        sheetSwitchPermit={sheetSwitchPermit}
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
      </RecordOperateComponent>
    );
  }
  renderTitle() {
    const { row, groupKey, controls, gunterView, widthConfig } = this.props;
    const titleControl = _.find(controls, { attribute: 1 });
    const value = row[titleControl.controlId] || row.titleValue;
    const emptyValue = _l('未命名');
    const title = titleControl ? renderCellText({ ...titleControl, value }) : emptyValue;
    const { titleDisable, hideTitle } = gunterView.viewConfig;
    if (hideTitle) {
      return null;
    }
    return (
      <div
        className={cx('groupingName valignWrapper', { edit: row.isEdit })}
        style={{ width: widthConfig[0] }}
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
  renderControl(data, index) {
    const { CellControlComponent } = this.state;
    const { row, widthConfig, base, controls, worksheetInfo } = this.props;
    const cell = Object.assign({}, data, { value: row[data.controlId] });
    const rowFormData = controls.map(c => ({ ...c, value: row[c.controlId] }));
    return (
      <div
        className={cx('field otherField valignWrapper Relative overflowHidden', `otherField${cell.type}`)}
        key={data.controlId}
        style={{ width: widthConfig[index] }}
      >
        <div>
          <CellControlComponent
            rowHeight={32}
            cell={cell}
            from={4}
            className={'w100'}
            appId={base.appId}
            row={row}
            rowFormData={() => rowFormData}
            worksheetId={base.worksheetId}
            projectId={worksheetInfo.projectId}
          />
        </div>
      </div>
    );
  }
  render() {
    const { recordInfoVisible, RecordInfoComponent, CellControlComponent } = this.state;
    const { row, gunterView } = this.props;
    const { displayControls } = gunterView.viewConfig;

    if (!CellControlComponent) return null;

    return (
      <RecordWrapper
        className={cx('valignWrapper gunterRecord w100', `gunterRecord-${row.rowid}`)}
        onClick={event => {
          const { classList } = event.target;
          if (
            classList.contains('gunterRecord') ||
            classList.contains('field') ||
            classList.contains('dayCountField') ||
            classList.contains('startTimeWrap') ||
            classList.contains('endTimeWrap')
          ) {
            this.handleClick();
          }
        }}
      >
        {_.get(window, 'shareState.shareId') ? <div style={{ width: 22 }} /> : this.renderMore()}
        {this.renderTitle()}
        {displayControls.map((data, index) => this.renderControl(data, index + 1))}
        {this.renderStartTime()}
        {this.renderEndTime()}
        <div className="dayCountField overflow_ellipsis">{row.diff ? _l('%0天', row.diff) : '--'}</div>
        {recordInfoVisible && (
          <RecordInfoComponent
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
