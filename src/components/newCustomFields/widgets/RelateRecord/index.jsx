import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { formatRecordToRelateRecord, getRelateRecordCountFromValue } from 'worksheet/util';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { RELATE_RECORD_SHOW_TYPE } from 'worksheet/constants/enum';
import RelateRecordDropdown from 'worksheet/components/RelateRecordDropdown';
import RelateRecordTable from 'worksheet/components/RelateRecordTable';
import RelateRecordCards from 'worksheet/components/RelateRecordCards';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';

export default class Widgets extends Component {
  static propTypes = {
    // disabled: PropTypes.bool,
    appId: PropTypes.string, // 他表字段被关联表所在应用 id
    viewId: PropTypes.string, // 他表字段被关联表所在应用所在视图 id
    worksheetId: PropTypes.string, // 他表字段所在表 id
    sourceEntityName: PropTypes.string,
    from: PropTypes.number, // 来源
    recordId: PropTypes.string, // 他表字段所在记录 id
    controlId: PropTypes.string, // 他表字段 id
    coverCid: PropTypes.string, // 他表字段封面 id
    // enumDefault2: PropTypes.number,
    value: PropTypes.string,
    dataSource: PropTypes.string,
    showControls: PropTypes.arrayOf(PropTypes.string),
    enumDefault: PropTypes.number,
    relationControls: PropTypes.arrayOf(PropTypes.shape({})),
    onChange: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {};
  }

  cardsComp = React.createRef();

  get count() {
    const { value, count } = this.props;
    const recordsCount = getRelateRecordCountFromValue(value, count);
    return _.isUndefined(recordsCount) ? count : recordsCount;
  }

  get isCard() {
    let { showtype = RELATE_RECORD_SHOW_TYPE.LIST } = this.props.advancedSetting; // 1 卡片 2 列表 3 下拉
    return parseInt(showtype, 10) === RELATE_RECORD_SHOW_TYPE.CARD;
  }

  componentWillReceiveProps(nextProps) {
    if (!this.isCard) {
      return;
    }
    try {
      if (nextProps.value === 'deleteRowIds: all') {
        this.cardsComp.current.table.deleteAllRecord();
        return;
      }
      const nextData = this.parseValue(nextProps.value);
      if (_.get(nextData, '0.isWorksheetQueryFill')) {
        const newRecords = nextData.map(item => JSON.parse(item.sourcevalue));
        this.cardsComp.current.table.clearAndAdd(newRecords);
      }
    } catch (err) {}
  }

  shouldComponentUpdate(nextProps) {
    const nextData = this.parseValue(nextProps.value);
    return (nextProps.value !== 'deleteRowIds: all' && !_.get(nextData, '0.isWorksheetQueryFill')) || !this.isCard;
  }

  parseValue(value) {
    let { showtype = RELATE_RECORD_SHOW_TYPE.LIST } = this.props.advancedSetting;
    if (!value) return [];
    if (showtype == RELATE_RECORD_SHOW_TYPE.DROPDOWN && value.indexOf('deleteRowIds') > -1) {
      return;
    }
    let data = [];
    try {
      data = JSON.parse(value);
    } catch (err) {
      return [];
    }
    if (!_.isObject(data)) {
      return [];
    }
    return _.isArray(data) ? data : [data];
  }

  getRecordsData() {
    const value = this.parseValue(this.props.value);
    this.isFromDefault = !!_.find(value, { isFromDefault: true });
    let data = [];
    try {
      data = value.map(r => (r.sourcevalue ? JSON.parse(r.sourcevalue) : { rowid: r.sid, titleValue: r.name }));
    } catch (err) {}
    return data;
  }

  @autobind
  handleChange(args, type) {
    const { relationControls, onChange } = this.props;
    if (type === 'array') {
      onChange(JSON.stringify(formatRecordToRelateRecord(relationControls, args)));
    } else {
      const { count, records, deletedIds, addedIds, searchByChange } = args;
      if (records.length) {
        onChange(
          JSON.stringify(
            formatRecordToRelateRecord(relationControls, records, {
              addedIds,
              deletedIds,
              count,
              isFromDefault: this.isFromDefault,
            }),
          ),
          undefined,
          searchByChange,
        );
      } else {
        onChange(`deleteRowIds: ${deletedIds.join(',')}`);
      }
    }
  }

  render() {
    const {
      appId,
      flag,
      customFields,
      viewId,
      worksheetId,
      from,
      disabled,
      instanceId,
      workId,
      recordId,
      controlId,
      dataSource,
      enumDefault,
      enumDefault2,
      showControls = [],
      formData,
      coverCid,
      relationControls,
      sourceEntityName,
      advancedSetting,
      updateWorksheetControls,
      updateRelateRecordTableCount,
      onChange,
    } = this.props;
    let { showtype = RELATE_RECORD_SHOW_TYPE.LIST } = advancedSetting; // 1 卡片 2 列表 3 下拉
    showtype = parseInt(showtype, 10);
    const controlPermission = controlState({ ...this.props }, from);
    const records = this.getRecordsData();
    if (showtype === RELATE_RECORD_SHOW_TYPE.TABLE) {
      return (
        <RelateRecordTable
          saveSync={false}
          instanceId={instanceId}
          workId={workId}
          control={{ ...this.props }}
          recordId={recordId}
          worksheetId={worksheetId}
          formData={formData}
          updateWorksheetControls={updateWorksheetControls}
          onCountChange={(count, changed) => {
            if (changed) {
              onChange({
                isFormTable: true,
                value: count,
              });
            } else {
              if (_.isFunction(updateRelateRecordTableCount)) {
                updateRelateRecordTableCount(controlId, count);
              } else if (customFields) {
                try {
                  customFields.dataFormat.setControlItemValue(controlId, String(count));
                  customFields.updateRenderData();
                } catch (err) {
                  console.error(err);
                }
              }
            }
          }}
        />
      );
    }
    return (
      <React.Fragment>
        {showtype !== RELATE_RECORD_SHOW_TYPE.DROPDOWN || browserIsMobile() ? (
          <RelateRecordCards
            appId={appId}
            ref={this.cardsComp}
            flag={flag}
            recordId={recordId}
            allowOpenRecord={advancedSetting.allowlink === '1'}
            editable={controlPermission.editable}
            control={{ ...this.props }}
            count={this.count || 0}
            records={
              enumDefault === 1 && browserIsMobile() && showtype === RELATE_RECORD_SHOW_TYPE.DROPDOWN
                ? records.filter((_, index) => !index)
                : records
            }
            multiple={enumDefault === 2}
            showCoverAndControls={advancedSetting.ddset === '1'}
            onChange={this.handleChange}
            from={from}
            loadMoreRelateCards={this.props.loadMoreRelateCards}
          />
        ) : (
          <RelateRecordDropdown
            appId={appId}
            control={{ ...this.props }}
            formData={formData}
            disabled={disabled || !controlPermission.editable}
            selected={records}
            from={from}
            viewId={viewId}
            recordId={recordId}
            dataSource={dataSource}
            entityName={sourceEntityName}
            enumDefault2={enumDefault2}
            parentWorksheetId={worksheetId}
            controlId={controlId}
            controls={relationControls}
            multiple={enumDefault === 2}
            coverCid={coverCid}
            showControls={showControls}
            allowOpenRecord={advancedSetting.allowlink === '1'}
            showCoverAndControls={advancedSetting.ddset === '1'}
            onChange={records => this.handleChange(records, 'array')}
          />
        )}
      </React.Fragment>
    );
  }
}
