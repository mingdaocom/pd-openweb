import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import SheetContext from 'worksheet/common/Sheet/SheetContext';
import { formatRecordToRelateRecord } from 'worksheet/util';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils';
import { WORKSHEETTABLE_FROM_MODULE } from 'worksheet/constants/enum';
import { RELATE_RECORD_SHOW_TYPE } from 'worksheet/constants/enum';
import { getTitleTextFromControls, getTitleTextFromRelateControl } from 'src/components/newCustomFields/tools/utils';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import { isKeyBoardInputChar, emitter } from 'worksheet/util';
import RelateRecordTags from './comps/RelateRecordTags';
import EditableCellCon from '../EditableCellCon';
import RelateRecordDropdown from 'worksheet/components/RelateRecordDropdown';
import { openChildTable } from '../ChildTableDialog';
import { openRelateRelateRecordTable } from '../RelateRecordTableDialog';
import _, { includes } from 'lodash';
import { browserIsMobile } from 'src/util';

const RecordCardCellRelateRecord = styled.div`
  display: inline-block;
  line-height: 21px;
  font-size: 13px;
  background-color: rgba(0, 100, 240, 0.08);
  padding: 0 10px;
  border-radius: 3px;
  margin-right: 6px;
`;
export default class RelateRecord extends React.Component {
  static contextType = SheetContext;
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.shape({}),
    singleLine: PropTypes.bool,
    editable: PropTypes.bool,
    isediting: PropTypes.bool,
    popupContainer: PropTypes.any,
    cell: PropTypes.shape({ value: PropTypes.string }),
    updateCell: PropTypes.func,
    updateEditingStatus: PropTypes.func,
    onClick: PropTypes.func,
  };

  constructor(props) {
    super(props);
    const records = props.cell.value ? this.parseValue(props.cell.value) : [];
    this.state = {
      records,
      dialogActive: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.cell.value !== nextProps.cell.value) {
      this.setState({ records: this.parseValue(nextProps.cell.value) });
    }
  }

  shouldComponentUpdate(nextProps) {
    return (
      this.props.isediting !== nextProps.isediting ||
      (nextProps.from === 4 && this.props.cell.value !== nextProps.cell.value) ||
      _.isEqual(this.props.cell.style, nextProps.cell.style)
    );
  }

  dropdownRef = React.createRef();
  relateRecordTagsPopup = createRef();

  get isSubList() {
    const { tableFromModule } = this.props;
    return tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST;
  }

  get addedIds() {
    const data = safeParse(_.get(this, 'props.cell.value'), 'array');
    return data.filter(r => r.isNew);
  }
  get deletedIds() {
    const data = safeParse(_.get(this, 'props.cell.value'), 'array');
    return (_.get(data, '0.deletedIds') || []).filter(id => !_.find(data, r => r.sid === id));
  }

  parseValue(value) {
    if (!value) {
      return [];
    }
    try {
      return JSON.parse(value).map(r => JSON.parse(r.sourcevalue));
    } catch (err) {
      return [];
    }
  }

  handleTableKeyDown = e => {
    const { tableId, count = 0, recordId, cell, isediting, updateCell, updateEditingStatus } = this.props;
    const { records } = this.state;
    const canAdd = cell.enumDefault === 2 ? count < 50 : records.length === 0;
    switch (e.key) {
      case 'Escape':
        if (this.state.dialogActive) {
          return;
        }
        this.handleVisibleChange(false);
        break;
      case 'Enter':
        if (isediting && this.relateRecordTagsPopup.current) {
          if (e.shiftKey) {
            this.relateRecordTagsPopup.current.searchRecords();
          } else if (canAdd) {
            this.relateRecordTagsPopup.current.selectRecords();
          }
        }
        break;
      default:
        (() => {
          if (!e.isInputValue && (isediting || !e.key || !isKeyBoardInputChar(e.key))) {
            return;
          }
          updateEditingStatus(true);
          setTimeout(() => {
            const input = document.querySelector(`.cell-${tableId}-${recordId}-${cell.controlId} input`);
            if (this.dropdownRef.current) {
              this.dropdownRef.current.setState({ keywords: (input.value = e.key) });
            }
          }, 100);
          e.stopPropagation();
          e.preventDefault();
        })();
    }
  };

  getReordsLength(value) {
    let length = 0;
    if (/^\[(.*)\]$/.test(value)) {
      try {
        length = JSON.parse(value).length;
      } catch (err) {}
    } else {
      length = parseInt(value, 10);
    }
    return length;
  }
  renderSelected() {
    const { isMobileTable, cell = {} } = this.props;
    const { relationControls = [] } = cell;
    const titleControl = _.find(relationControls, c => c.attribute === 1);
    let records = [];
    if (!titleControl) {
      return null;
    }
    if (isMobileTable) {
      records = this.state.records;
      return records.map((record, index) => (
        <RecordCardCellRelateRecord key={index}>
          {getTitleTextFromRelateControl(cell, record)}
        </RecordCardCellRelateRecord>
      ));
    } else {
      try {
        records = JSON.parse(cell.value);
      } catch (err) {}
      return records.map((record, index) => (
        <RecordCardCellRelateRecord key={index}>
          {renderCellText({ ...titleControl, value: record.name })}
        </RecordCardCellRelateRecord>
      ));
    }
  }

  handleVisibleChange = visible => {
    const { cell, updateEditingStatus, updateCell, onValidate } = this.props;
    if (!visible && this.changed) {
      const newValue = JSON.stringify(
        formatRecordToRelateRecord(cell.relationControls, this.records).map(r => ({
          ..._.pick(r, ['sid', 'name', 'sourcevalue', 'row']),
        })),
      );
      const validateResult = onValidate(newValue, true);
      if (validateResult.errorType === 'REQUIRED') {
        this.changed = false;
        this.setState({ records: this.parseValue(this.props.cell.value) || [] });
        updateEditingStatus(false);
        alert(_l('%0不能为空', cell.controlName), 3);
        return;
      }
      updateCell({
        value: newValue,
      });
      this.changed = false;
    }
    updateEditingStatus(visible);
  };

  handleRelateRecordTagChange = ({ changed, addedIds, deletedIds, records = [], count } = {}) => {
    const { cell, updateEditingStatus, updateCell, onValidate } = this.props;
    if (!changed) {
      updateEditingStatus(false);
      return;
    }
    const newValue = records.length
      ? JSON.stringify(formatRecordToRelateRecord(cell.relationControls, records, { addedIds, deletedIds }))
      : `deleteRowIds: ${deletedIds.join(',')}`;

    const validateResult = onValidate(newValue, true);
    if (validateResult.errorType === 'REQUIRED') {
      this.changed = false;
      this.setState({ records: this.parseValue(this.props.cell.value) || [] });
      updateEditingStatus(false);
      alert(_l('%0不能为空', cell.controlName), 3);
      return;
    }
    // if (_.isEmpty(addedIds) && _.isEmpty(deletedIds)) {
    //   updateEditingStatus(false);
    //   return;
    // }
    if (this.isSubList) {
      updateCell({
        value: newValue,
      });
    } else {
      const data = formatControlToServer({ ...cell, value: newValue }, { needSourceValue: true });
      updateCell({
        editType: data.editType,
        value: data.value,
      });
    }
    updateEditingStatus(false);
  };

  render() {
    const {
      projectId,
      appId,
      viewId,
      tableId,
      isTrash,
      singleLine,
      className,
      style,
      rowIndex,
      from,
      rowFormData = () => [],
      recordId,
      worksheetId,
      rowHeightEnum = 0,
      sheetSwitchPermit,
      count,
      cell,
      editable,
      isediting,
      updateEditingStatus,
      popupContainer,
      onClick,
      isDraft,
    } = this.props;
    const { addedIds = [], deletedIds = [] } = this.isSubList ? this : {};
    let { records } = this.state;
    const { advancedSetting = {} } = cell;
    const isSubList = cell.type === 34;
    const { showtype, allowlink, ddset } = advancedSetting; // 1 卡片 2 列表 3 下拉
    const allowOpenList = from !== 21 && !isTrash && worksheetId && recordId;
    const recordsLength = this.getReordsLength(cell.value);
    let showCount = recordsLength >= 1000 ? '999+' : recordsLength;
    if (isSubList && recordsLength >= 1000) {
      showCount = 1000;
    }
    if (advancedSetting.showcount === '1') {
      showCount = _l('查看');
    }
    if (
      includes(
        [RELATE_RECORD_SHOW_TYPE.LIST, RELATE_RECORD_SHOW_TYPE.TABLE, RELATE_RECORD_SHOW_TYPE.TAB_TABLE],
        parseInt(showtype, 10),
      ) ||
      isSubList
    ) {
      return (
        <div className={className} style={style} onClick={onClick}>
          {recordsLength > 0 && (
            <div
              className={cx('cellRelateRecordMultiple', { allowOpenList })}
              onClick={e => {
                if (!allowOpenList || browserIsMobile()) {
                  return;
                }
                e.stopPropagation();
                if (isSubList) {
                  openChildTable({
                    openFrom: 'cell',
                    allowEdit: editable && from !== 4,
                    title: getTitleTextFromControls(_.isFunction(rowFormData) ? rowFormData() : rowFormData),
                    entityName: cell.sourceEntityName,
                    appId,
                    worksheetId,
                    viewId,
                    from,
                    control: { ...cell, isDraft: from === 21 || isDraft },
                    controls: cell.relationControls,
                    recordId,
                    sheetSwitchPermit,
                    masterData: {
                      worksheetId,
                      formData: (_.isFunction(rowFormData) ? rowFormData() : rowFormData)
                        .map(c => _.pick(c, ['controlId', 'type', 'value', 'options']))
                        .filter(c => !!c.value),
                    },
                    projectId,
                  });
                } else {
                  openRelateRelateRecordTable({
                    openFrom: 'cell',
                    title: getTitleTextFromControls(_.isFunction(rowFormData) ? rowFormData() : rowFormData),
                    appId,
                    viewId,
                    worksheetId,
                    recordId,
                    control: { ...cell, isDraft: from === 21 || isDraft },
                    allowEdit: editable,
                    formdata: _.isFunction(rowFormData) ? rowFormData() : rowFormData,
                    onUpdateCount: () => {
                      emitter.emit('RELOAD_RECORD_INFO', {
                        worksheetId,
                        recordId,
                      });
                    },
                  });
                }
              }}
            >
              <i className={cx('icon', isSubList ? 'icon-table' : 'icon-link_record')}></i>
              {showCount}
            </div>
          )}
        </div>
      );
    } else if (from === 4 || (from === 21 && browserIsMobile())) {
      return this.renderSelected();
    } else if (parseInt(showtype, 10) === RELATE_RECORD_SHOW_TYPE.DROPDOWN) {
      return (
        <EditableCellCon
          className={cx(className, 'cellRelateRecord', { canedit: editable, focusInput: editable })}
          style={style}
          conRef={this.cell}
          hideOutline
          clickAwayWrap={isediting}
          onClick={onClick}
          iconName={'arrow-down-border'}
          isediting={isediting}
          onIconClick={() => updateEditingStatus(true)}
        >
          <RelateRecordDropdown
            ref={this.dropdownRef}
            insheet
            disabled={!editable}
            selected={records}
            cellFrom={from}
            control={{ ...cell, formData: rowFormData, worksheetId, recordId, isDraft }}
            isDraft={isDraft}
            formData={rowFormData}
            viewId={cell.viewId}
            worksheetId={worksheetId}
            recordId={recordId}
            dataSource={cell.dataSource}
            entityName={cell.sourceEntityName}
            enumDefault2={cell.enumDefault2}
            parentWorksheetId={worksheetId}
            controlId={cell.controlId}
            controls={cell.relationControls}
            coverCid={cell.coverCid}
            required={cell.required}
            showControls={cell.showControls}
            allowOpenRecord={allowlink === '1'}
            showCoverAndControls={ddset === '1' || parseInt(showtype, 10) === RELATE_RECORD_SHOW_TYPE.CARD}
            isediting={isediting}
            popupContainer={() => document.body}
            multiple={cell.enumDefault === 2}
            onVisibleChange={this.handleVisibleChange}
            selectedClassName={cx('sheetview', `cell-${tableId}-${recordId}-${cell.controlId}`, {
              canedit: editable,
              cellControlEdittingStatus: isediting,
              singleLine,
            })}
            selectedStyle={{ width: style.width, minHeight: style.height, borderRadius: 0 }}
            onChange={newRecords => {
              this.records = newRecords;
              this.changed = true;
              this.setState({ records: newRecords, changed: true });
            }}
          />
        </EditableCellCon>
      );
    } else if (parseInt(showtype, 10) === RELATE_RECORD_SHOW_TYPE.CARD) {
      records = /^temp|default/.test(recordId) ? records : records.slice(0, [5, 10][rowHeightEnum] || 20);
      if (!isediting) {
        return (
          <EditableCellCon
            className={cx(className, 'cellRelateRecord', { canedit: editable })}
            style={style}
            conRef={this.cell}
            clickAwayWrap={isediting}
            onClick={onClick}
            iconName={'link_record'}
            isediting={isediting}
            onIconClick={() => updateEditingStatus(true)}
          >
            <RelateRecordTags
              from={from}
              isDraft={isDraft}
              disabled
              count={count}
              style={style}
              control={cell}
              records={records}
              addedIds={addedIds}
              deletedIds={deletedIds}
              recordId={recordId}
              worksheetId={worksheetId}
              allowOpenRecord={allowlink === '1'}
            />
          </EditableCellCon>
        );
      } else {
        return (
          <Trigger
            zIndex={99}
            popup={
              <RelateRecordTags
                from={from}
                isDraft={isDraft}
                rowIndex={rowIndex}
                ref={this.relateRecordTagsPopup}
                isediting
                count={count}
                style={style}
                control={cell}
                records={records}
                addedIds={addedIds}
                deletedIds={deletedIds}
                recordId={recordId}
                worksheetId={worksheetId}
                allowOpenRecord={allowlink === '1'}
                rowFormData={rowFormData}
                onClose={this.handleRelateRecordTagChange}
                onCloseDialog={() => {
                  setTimeout(() => {
                    this.setState({ dialogActive: false });
                  }, 100);
                }}
                onOpenDialog={() => this.setState({ dialogActive: true })}
              />
            }
            getPopupContainer={() =>
              rowIndex === 0 && this.isSubList
                ? document.querySelector(`.worksheetTableComp.id-${tableId}-id`) || document.body
                : popupContainer()
            }
            popupClassName="filterTrigger"
            popupVisible={isediting}
            destroyPopupOnHide
            popupAlign={{
              points: ['tl', 'tl'],
              overflow: { adjustY: true },
            }}
          >
            <div className={className} style={style} onClick={onClick} />
          </Trigger>
        );
      }
    } else {
      return <span />;
    }
  }
}
