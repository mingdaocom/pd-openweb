import React, { Component } from 'react';
import cx from 'classnames';
import moment from 'moment';
import { DateTime } from 'ming-ui/components/NewDateTimePicker';
import { handleGlobalVariableName } from '../../../utils';
import SelectOtherFields from '../SelectOtherFields';
import Tag from '../Tag';

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
      <div className={cx('actionControlBox flex ThemeBorderColor3 clearBorderRadius ellipsis actionCustomBox')}>
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
          className="icon-delete actionControlDel ThemeColor3"
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

    return (
      <div className="actionControlBox flex ThemeBorderColor3 clearBorderRadius">
        <DateTime
          selectedValue={data.fieldValue ? moment(data.fieldValue) : null}
          timePicker={!!timePicker}
          allowClear={false}
          min={minDate}
          onOk={e => updateSource({ fieldValue: e.format(timePicker ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD') })}
        >
          {data.fieldValue ? (
            moment(data.fieldValue).format(timePicker ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD')
          ) : (
            <span className="Gray_bd">{_l('请选择日期')}</span>
          )}
        </DateTime>
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
      <input
        type="text"
        className={cx('flex ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10', {
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
