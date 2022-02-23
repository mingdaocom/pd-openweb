import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';
import { formatRecordToRelateRecord } from 'worksheet/util';
import { RELATE_RECORD_SHOW_TYPE } from 'worksheet/constants/enum';
import { renderCellText } from 'src/pages/worksheet/components/CellControls';
import EditableCellCon from '../EditableCellCon';
import RelateRecordDropdown from 'worksheet/components/RelateRecordDropdown';
import autobind from 'core-decorators/lib/autobind';

const RecordCardCellRelateRecord = styled.div`
  display: inline-block;
  line-height: 21px;
  font-size: 13px;
  background-color: #e8e8e8;
  padding: 0 10px;
  margin-right: 6px;
`;
export default class RelateRecord extends React.Component {
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
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isediting !== nextProps.isediting && this.props.cell.value !== nextProps.cell.value) {
      this.setState({ records: this.parseValue(nextProps.cell.value) });
    }
  }

  shouldComponentUpdate(nextProps) {
    return (
      this.props.isediting !== nextProps.isediting ||
      (nextProps.from === 4 && this.props.cell.value !== nextProps.cell.value)
    );
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

  @autobind
  renderToTop({ cellHeight, popupHeight } = {}) {
    const { style, tableScrollTop, gridHeight } = this.props;
    return popupHeight > gridHeight - (style.top - tableScrollTop) - (cellHeight || style.height);
  }

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
    const { cell = {} } = this.props;
    const { relationControls = [] } = cell;
    const titleControl = _.find(relationControls, c => c.attribute === 1);
    let records = [];
    try {
      records = JSON.parse(cell.value);
    } catch (err) {}
    if (!_.isArray(records) || !titleControl) {
      return null;
    }
    return records.map((record, index) => (
      <RecordCardCellRelateRecord key={index}>
        {renderCellText({ ...titleControl, value: record.name })}
      </RecordCardCellRelateRecord>
    ));
  }

  @autobind
  handleVisibleChange(visible) {
    const { cell, updateEditingStatus, updateCell } = this.props;
    if (!visible && this.changed) {
      updateCell({
        value: JSON.stringify(
          formatRecordToRelateRecord(cell.relationControls, this.records).map(r => ({
            ..._.pick(r, ['sid', 'name', 'sourcevalue']),
          })),
        ),
      });
      this.changed = false;
    }
    updateEditingStatus(visible);
  }

  render() {
    const {
      singleLine,
      className,
      style,
      from,
      formdata,
      recordId,
      worksheetId,
      cell,
      editable,
      isediting,
      updateEditingStatus,
      onClick,
    } = this.props;
    const { records } = this.state;
    const { advancedSetting = {} } = cell;
    const isSublist = cell.type === 34;
    const { showtype, allowlink, ddset } = advancedSetting; // 1 卡片 2 列表 3 下拉

    const recordsLength = this.getReordsLength(cell.value);

    if (parseInt(showtype, 10) === RELATE_RECORD_SHOW_TYPE.LIST || isSublist) {
      return (
        <div className={className} style={style} onClick={onClick}>
          {recordsLength > 0 && (
            <div className="cellRelateRecordMultiple">
              <i className={cx('icon', isSublist ? 'icon-table' : 'icon-link_record')}></i>
              {recordsLength}
            </div>
          )}
        </div>
      );
    } else if (from === 4) {
      return this.renderSelected();
    } else {
      return (
        <EditableCellCon
          className={cx(className, 'cellRelateRecord', { canedit: editable })}
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
            insheet
            disabled={!editable}
            selected={records}
            cellFrom={from}
            control={cell}
            formData={formdata}
            viewId={cell.viewId}
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
            controls={cell.relationControls}
            allowOpenRecord={allowlink === '1'}
            showCoverAndControls={ddset === '1' || parseInt(showtype, 10) === RELATE_RECORD_SHOW_TYPE.CARD}
            selected={records}
            isediting={isediting}
            popupContainer={() => document.body}
            multiple={cell.enumDefault === 2}
            onVisibleChange={this.handleVisibleChange}
            selectedClassName={cx('sheetview', { canedit: editable, cellControlEdittingStatus: isediting, singleLine })}
            selectedStyle={{ width: style.width, minHeight: style.height, borderRadius: 0 }}
            renderToTop={this.renderToTop}
            onChange={newRecords => {
              this.records = newRecords;
              this.changed = true;
              this.setState({ records: newRecords, changed: true });
            }}
          />
        </EditableCellCon>
      );
    }
  }
}
