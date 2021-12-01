import React, { Component } from 'react';
import { string, arrayOf, shape, func } from 'prop-types';
import CustomDefaultValue from './CustomDefaultValue';
import { OtherFieldList, SelectOtherField, DynamicInput } from '../../components';
import { DynamicValueInputWrap } from '../../styled';

export default class SubSheet extends Component {
  static propTypes = {
    onDynamicValueChange: func,
    dynamicValue: arrayOf(shape({ cid: string, rcid: string, staticValue: string })),
  };
  static defaultProps = {
    onDynamicValueChange: _.noop,
    dynamicValue: [],
  };
  state = {
    recordListVisible: false,
  };
  handleClick = () => {
    const {
      data: { relationControls = [] },
    } = this.props;
    if (!relationControls.length) {
      alert(_l('请先添加字段'));
      return;
    }
    this.setState({ recordListVisible: true });
  };
  removeRelateSheet = () => {
    this.props.onDynamicValueChange([]);
  };
  onTriggerClick = () => {
    const { defaultType } = this.props;
    if (defaultType === 'dynamiccustom') {
      this.setState({ recordListVisible: true });
      return;
    }
    defaultType && this.$wrap.triggerClick();
  };
  render() {
    const { defaultType } = this.props;
    const { recordListVisible } = this.state;
    return (
      <DynamicValueInputWrap>
        {defaultType ? (
          <DynamicInput {...this.props} onTriggerClick={this.onTriggerClick} />
        ) : (
          <OtherFieldList {...this.props} onClick={this.handleClick} />
        )}
        {recordListVisible && (
          <CustomDefaultValue
            {...this.props}
            onClose={() => this.setState({ recordListVisible: false })}
            onOk={() => {}}
          />
        )}
        <SelectOtherField {...this.props} ref={con => (this.$wrap = con)} />
      </DynamicValueInputWrap>
    );
  }
}
