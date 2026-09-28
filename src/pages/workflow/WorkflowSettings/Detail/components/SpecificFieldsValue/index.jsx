import React, { Component } from 'react';
import cx from 'classnames';
import moment from 'moment';
import { DatePicker, Input } from 'ming-ui/antd-components';
import { handleGlobalVariableName } from '../../../utils';
import SelectOtherFields from '../SelectOtherFields';
import Tag from '../Tag';

const DATE_FORMAT = 'YYYY-MM-DD';
const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm';
const DATE_TIME_PICKER_CONFIG = { format: 'HH:mm' };

const isBeforeMinDate = (current, minDate) => current && minDate && current.isBefore(moment(minDate), 'day');

const getDisabledTime = (current, minDate) => {
  const min = moment(minDate);

  if (!current || !min.isValid() || !current.isSame(min, 'day')) return {};

  return {
    disabledHours: () => Array.from({ length: min.hour() }, (_, hour) => hour),
    disabledMinutes: hour => (hour === min.hour() ? Array.from({ length: min.minute() }, (_, minute) => minute) : []),
  };
};

export default class SpecificFieldsValue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fieldsVisible: false,
    };
  }

  static defaultProps = {
    hasOtherField: true,
    min: '',
    max: '',
    minDate: null,
    isDecimal: false,
    dot: 1,
  };

  renderSelectFieldsValue = () => {
    const { data, updateSource } = this.props;

    return (
      <div className={cx('actionControlBox flex borderColorPrimary clearBorderRadius ellipsis actionCustomBox')}>
        <span className="flexRow pTop3">
          <Tag
            flowNodeType={data.fieldNodeType}
            appType={data.fieldAppType}
            actionId={data.fieldActionId}
            nodeName={handleGlobalVariableName(data.fieldNodeId, data.sourceType, data.fieldNodeName)}
            controlId={data.fieldControlId}
            controlName={data.fieldControlName}
          />
        </span>
        <i
          className="icon-delete actionControlDel colorPrimary"
          onClick={() =>
            updateSource({
              fieldControlId: '',
              fieldControlType: 0,
              fieldControlName: '',
              fieldNodeId: '',
              fieldNodeName: '',
              fieldNodeType: 0,
              fieldValue: '',
            })
          }
        />
      </div>
    );
  };

  renderOtherFields = () => {
    const { projectId, processId, relationId, selectNodeId, updateSource, type } = this.props;

    return (
      <SelectOtherFields
        item={{ type: type === 'date' ? 16 : 6 }}
        fieldsVisible={this.state.fieldsVisible}
        projectId={projectId}
        processId={processId}
        relationId={relationId}
        selectNodeId={selectNodeId}
        handleFieldClick={({
          actionId,
          fieldValueId,
          appType,
          fieldValue,
          fieldValueName,
          nodeId,
          nodeName,
          nodeTypeId,
          fieldValueType,
          sourceType,
        }) => {
          updateSource({
            fieldActionId: actionId,
            fieldControlName: fieldValueName,
            fieldNodeName: nodeName,
            fieldAppType: appType,
            fieldNodeType: nodeTypeId,
            fieldNodeId: nodeId,
            fieldValue,
            fieldControlId: fieldValueId,
            fieldControlType: fieldValueType,
            sourceType,
          });
        }}
        openLayer={() => this.setState({ fieldsVisible: true })}
        closeLayer={() => this.setState({ fieldsVisible: false })}
      />
    );
  };

  renderDate() {
    const { data, updateSource, timePicker, minDate } = this.props;
    const format = timePicker ? DATE_TIME_FORMAT : DATE_FORMAT;

    return (
      <div className="actionControlBox flex borderColorPrimary clearBorderRadius">
        <DatePicker
          allowClear={false}
          className="workflowDatePicker"
          disabledDate={current => isBeforeMinDate(current, minDate)}
          disabledTime={current => getDisabledTime(current, minDate)}
          format={format}
          inputReadOnly
          needConfirm
          placeholder={_l('请选择日期')}
          showNow={false}
          showTime={timePicker ? DATE_TIME_PICKER_CONFIG : false}
          suffixIcon={null}
          value={data.fieldValue ? moment(data.fieldValue) : null}
          variant="borderless"
          onChange={value => value && updateSource({ fieldValue: value.format(format) })}
        />
      </div>
    );
  }

  renderNumber() {
    const { type, data, updateSource, hasOtherField, min, max, isDecimal, dot } = this.props;
    const PLACEHOLDER = {
      numberFieldValue: _l('填写天数'),
      hourFieldValue: _l('填写小时数'),
      minuteFieldValue: _l('填写分钟数'),
      secondFieldValue: _l('填写秒钟数'),
      number: '',
    };

    return (
      <Input
        className={cx('flex', {
          clearBorderRadius: hasOtherField,
        })}
        placeholder={PLACEHOLDER[type]}
        value={data.fieldValue}
        onChange={e => updateSource({ fieldValue: this.formatVal(e.target.value) })}
        onBlur={e => {
          if (min !== '' && min >= (isDecimal ? parseFloat : parseInt)(e.target.value || 0, 10)) {
            e.target.value = min;
            updateSource({ fieldValue: min.toString() });
          }

          if (max !== '' && max <= (isDecimal ? parseFloat : parseInt)(e.target.value || 0, 10)) {
            e.target.value = max;
            updateSource({ fieldValue: max.toString() });
          }

          if (isDecimal) {
            updateSource({ fieldValue: (parseFloat(e.target.value, 10) || min).toFixed(dot) });
          }
        }}
      />
    );
  }

  formatVal(value) {
    const { type, allowedEmpty, isDecimal } = this.props;

    if (!isDecimal) {
      value = parseInt(value, 10);

      if (allowedEmpty && !value && value !== 0) return '';
      if (typeof value !== 'number' || isNaN(value)) return '';
    }

    switch (type) {
      case 'numberFieldValue':
        return Math.max(0, Math.min(value, 999));
      case 'hourFieldValue':
        return Math.max(0, Math.min(value, 23));
      case 'minuteFieldValue':
      case 'secondFieldValue':
        return Math.max(0, Math.min(value, 59));
      case 'number':
        return value;
    }
  }

  render() {
    const { data, type, hasOtherField } = this.props;

    return (
      <div className="flexRow relative">
        {data.fieldNodeId ? this.renderSelectFieldsValue() : type === 'date' ? this.renderDate() : this.renderNumber()}
        {hasOtherField && this.renderOtherFields()}
      </div>
    );
  }
}
