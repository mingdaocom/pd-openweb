import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { RadioGroup } from 'ming-ui';
import { FILTER_CONDITION_TYPE } from '../../enum';

export default class YesNo extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    control: PropTypes.shape({}),
    type: PropTypes.number,
  };
  constructor(props) {
    super(props);
    this.state = {};
  }
  @autobind
  getRadioGroupData() {
    const { control } = this.props;
    if (control.type === 36) {
      return [
        { text: _l('选中'), value: 1 },
        { text: _l('未选中'), value: 0 },
      ];
    }
    return [
      { text: _l('有'), value: 1 },
      { text: _l('无'), value: 0 },
    ];
  }
  @autobind
  getCheckedByFilterType(type) {
    const { control } = this.props;
    if (control.type === 36) {
      return type === FILTER_CONDITION_TYPE.EQ ? 1 : 0;
    }
    return type === FILTER_CONDITION_TYPE.HASVALUE ? 1 : 0;
  }
  @autobind
  getFilterTypeByCheckedValue(value) {
    const { control } = this.props;
    if (control.type === 36) {
      return value ? FILTER_CONDITION_TYPE.EQ : FILTER_CONDITION_TYPE.NE;
    }
    return value ? FILTER_CONDITION_TYPE.HASVALUE : FILTER_CONDITION_TYPE.ISNULL;
  }
  render() {
    const { disabled, control, type, onChange } = this.props;
    const data = this.getRadioGroupData(control.type);
    return (
      <div className="worksheetFilterYesNoCondition">
        <RadioGroup
          disabled={disabled}
          data={data}
          checkedValue={this.getCheckedByFilterType(type)}
          onChange={radiovalue => {
            onChange({ type: this.getFilterTypeByCheckedValue(radiovalue), value: 1 });
          }}
          size="small"
        />
      </div>
    );
  }
}
