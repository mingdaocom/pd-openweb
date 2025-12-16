import React, { Component } from 'react';
import _ from 'lodash';
import { arrayOf, func, shape, string } from 'prop-types';
import CascaderDropdown from 'src/components/Form/DesktopForm/widgets/Cascader';
import { DynamicInput, OtherFieldList, SelectOtherField } from '../components';
import { DynamicValueInputWrap } from '../styled';

export default class CascaderSheet extends Component {
  static propTypes = {
    onDynamicValueChange: func,
    dynamicValue: arrayOf(shape({ cid: string, rcid: string, staticValue: string })),
  };
  static defaultProps = {
    onDynamicValueChange: _.noop,
    dynamicValue: [],
  };
  constructor(props) {
    super(props);
    this.cascaderValue = [];
    this.state = {
      visible: false,
      cascaderValue: [],
    };
  }
  handleClick = () => {
    const { data } = this.props;
    if (!data.dataSource) {
      alert(_l('请先配置数据源'), 3);
      return;
    }
    this.setState({ visible: true });
  };
  getRowId = staticValue => {
    const value = JSON.parse(staticValue || '[]')[0];
    return _.isObject(value) ? value.rowid : value;
  };
  removeRelateSheet = staticValue => {
    const { dynamicValue = [] } = this.props;
    const removeId = this.getRowId(staticValue);
    const newValue = dynamicValue.filter(item => {
      return this.getRowId(item.staticValue) !== removeId;
    });
    this.props.onDynamicValueChange(newValue);
  };
  onTriggerClick = () => {
    const { defaultType } = this.props;
    defaultType && this.$wrap.triggerClick();
  };
  getDynamicValue = () => {
    const { dynamicValue = [], multiple = false } = this.props;
    if (_.isEmpty(this.cascaderValue)) return dynamicValue;
    let newDynamicValue = [].concat(this.cascaderValue);
    if (multiple) {
      newDynamicValue = dynamicValue.concat(this.cascaderValue);
    }
    return _.unionBy(newDynamicValue, 'staticValue');
  };
  handleSave = () => {
    const newVal = this.getDynamicValue();
    this.props.onDynamicValueChange(newVal);
    this.cascaderValue = [];
    this.setState({ cascaderValue: [] });
  };
  render() {
    // multiple 给开始范围指定项专用
    const { data, defaultType, multiple = false, getType } = this.props;
    const titleControl = _.find(data.relationControls || [], re => re.attribute === 1);
    const { visible } = this.state;
    const cascaderProps = {
      ...data,
      getType,
      advancedSetting: {
        ...data.advancedSetting,
        filters: '',
        topshow: '0',
        limitlayer: '0',
        minlayer: '0',
        anylevel: '0',
      },
      visible,
      onPopupVisibleChange: visible => {
        this.setState({ visible });
        if (!visible) {
          this.handleSave();
        }
      },
      onChange: value => {
        const newValue = safeParse(value, 'array').map(item => {
          return {
            cid: '',
            rcid: '',
            staticValue: JSON.stringify([item.sid]),
            relateSheetName: item.name,
          };
        });
        this.cascaderValue = newValue;
        this.setState({ cascaderValue: newValue });
      },
    };
    return (
      <DynamicValueInputWrap className={this.props.className}>
        {defaultType ? (
          <DynamicInput {...this.props} onTriggerClick={this.onTriggerClick} />
        ) : (
          <OtherFieldList
            {...this.props}
            dynamicValue={this.getDynamicValue()}
            totalWidth={multiple}
            titleControl={titleControl}
            onClick={this.handleClick}
            removeRelateSheet={this.removeRelateSheet}
          />
        )}
        {visible && <CascaderDropdown {...cascaderProps} />}
        {!multiple && <SelectOtherField {...this.props} ref={con => (this.$wrap = con)} />}
      </DynamicValueInputWrap>
    );
  }
}
