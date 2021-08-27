import React, { Component } from 'react';
import cx from 'classnames';
import { DateTime } from 'ming-ui/components/NewDateTimePicker';
import SelectOtherFields from '../SelectOtherFields';
import Tag from '../Tag';

export default class SpecificFieldsValue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fieldsVisible: false,
    };
  }

  renderSelectFieldsValue = () => {
    const { data, updateSource } = this.props;

    return (
      <div className={cx('actionControlBox flex ThemeBorderColor3 clearBorderRadius ellipsis actionCustomBox')}>
        <span className="flexRow pTop3">
          <Tag
            flowNodeType={data.fieldNodeType}
            appType={data.fieldAppType}
            actionId={data.fieldActionId}
            nodeName={data.fieldNodeName}
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
    const { processId, selectNodeId, updateSource, type } = this.props;

    return (
      <SelectOtherFields
        item={{ type: type === 'date' ? 16 : 6 }}
        fieldsVisible={this.state.fieldsVisible}
        processId={processId}
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
          });
        }}
        openLayer={() => this.setState({ fieldsVisible: true })}
        closeLayer={() => this.setState({ fieldsVisible: false })}
      />
    );
  };

  renderDate() {
    const { data, updateSource } = this.props;

    return (
      <div className="actionControlBox flex ThemeBorderColor3 clearBorderRadius">
        <DateTime
          selectedValue={data.fieldValue ? moment(data.fieldValue) : null}
          timePicker={false}
          onOk={e => updateSource({ fieldValue: e.format('YYYY-MM-DD') })}
          onClear={() => updateSource({ fieldValue: '' })}
        >
          {data.fieldValue ? (
            moment(data.fieldValue).format('YYYY-MM-DD')
          ) : (
            <span className="Gray_bd">{_l('请选择日期')}</span>
          )}
        </DateTime>
      </div>
    );
  }

  renderNumber() {
    const { type, data, updateSource } = this.props;
    const PLACEHOLDER = {
      numberFieldValue: _l('填写天数'),
      hourFieldValue: _l('填写小时数'),
      minuteFieldValue: _l('填写分钟数'),
      number: '',
    };

    return (
      <input
        type="text"
        className="flex ThemeBorderColor3 actionControlBox clearBorderRadius pTop0 pBottom0 pLeft10 pRight10"
        placeholder={PLACEHOLDER[type]}
        value={data.fieldValue}
        onChange={e => updateSource({ fieldValue: this.formatVal(e.target.value) })}
      />
    );
  }

  formatVal(value) {
    const { type, allowedEmpty } = this.props;
    value = parseInt(value, 10);

    if (allowedEmpty && !value) return '';
    if (typeof value !== 'number' || isNaN(value)) return 0;

    switch (type) {
      case 'numberFieldValue':
        return Math.max(0, Math.min(value, 999));
      case 'hourFieldValue':
        return Math.max(0, Math.min(value, 23));
      case 'minuteFieldValue':
        return Math.max(0, Math.min(value, 59));
      case 'number':
        return value;
    }
  }

  render() {
    const { data, type } = this.props;

    return (
      <div className="mTop10 flexRow relative">
        {data.fieldNodeId ? this.renderSelectFieldsValue() : type === 'date' ? this.renderDate() : this.renderNumber()}
        {this.renderOtherFields()}
      </div>
    );
  }
}
