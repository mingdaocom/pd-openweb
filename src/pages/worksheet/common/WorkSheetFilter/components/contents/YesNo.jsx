import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { RadioGroup } from 'ming-ui';
import { FILTER_CONDITION_TYPE } from '../../enum';
import { getSwitchItemNames } from 'src/pages/widgetConfig/util';
import _ from 'lodash';

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
      const itemnames = getSwitchItemNames(control, { isShow: true });
      return itemnames.map(item => ({ text: item.value, value: Number(item.key) }));
    }
    if (control.type === 40) {
      return [
        { text: _l('为空'), value: 0 },
        { text: _l('不为空'), value: 1 },
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
