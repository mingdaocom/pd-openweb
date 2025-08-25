import React, { Component } from 'react';
import _ from 'lodash';
import { arrayOf, func, shape, string } from 'prop-types';
import { DynamicInput, OtherFieldList, SelectOtherField } from '../../components';
import { DynamicValueInputWrap } from '../../styled';
import CustomDefaultValue from './CustomDefaultValue';

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
    if (this.props.eventKey) return;
    const {
      data: { relationControls = [] },
    } = this.props;
    if (!relationControls.length) {
      alert(_l('请先添加字段'), 3);
      return;
    }
    this.setState({ recordListVisible: true });
  };
  removeRelateSheet = () => {
    this.props.onDynamicValueChange([]);
  };
  onTriggerClick = () => {
    const { defaultType, eventKey } = this.props;
    if (defaultType === 'dynamiccustom' && !eventKey) {
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
