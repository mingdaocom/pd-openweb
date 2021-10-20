import React, { Component, createRef } from 'react';
import { string, func } from 'prop-types';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import SelectFields from './SelectFields';
import { SelectOtherFieldWrap } from '../styled';
import { Tooltip } from 'antd';

export default class SelectOtherField extends Component {
  static propTypes = { onTriggerClick: func };
  static defaultProps = {
    onTriggerClick: _.noop,
  };
  constructor(props) {
    super(props);
    this.$wrap = createRef(null);
  }
  state = {
    isDynamic: false,
  };

  // 插入标签;
  insertField = para => {
    const { fieldId, relateSheetControlId, type } = para;
    const { data, onDynamicValueChange, dynamicValue } = this.props;
    const isText = _.includes([1, 2], data.type);
    const isAsync = () => {
      // 部门选成员 需要异步获取数据 isAsync设为true
      if (data.type === 27 && type === 26) return true;
      return false;
    };

    const newField = [{ cid: fieldId, rcid: relateSheetControlId, staticValue: '', isAsync: isAsync() }];
    onDynamicValueChange(isText ? dynamicValue.concat(newField) : newField);
    this.setState({ isDynamic: false });
  };
  render() {
    const { isDynamic } = this.state;
    const { data, dynamicValue, onDynamicValueChange, onTriggerClick, ...rest } = this.props;
    return (
      <div ref={this.$wrap}>
        <Trigger
          action={['click']}
          popupStyle={{ width: '100%' }}
          popupVisible={isDynamic}
          getPopupContainer={() => this.$wrap.current}
          popup={
            <SelectFields
              onClickAway={() => this.setState({ isDynamic: false })}
              data={data}
              dynamicValue={dynamicValue}
              onClick={this.insertField}
              onMultiUserChange={onDynamicValueChange}
              {...rest}
            />
          }
          popupAlign={{
            points: ['tr', 'br'],
            offset: [0, 0],
          }}>
          <Tooltip trigger={['hover']} placement={'bottom'} title={_l('使用其他字段的值')}>
            <SelectOtherFieldWrap
              onClick={() => {
                this.setState({ isDynamic: true });
                onTriggerClick();
              }}>
              <i className="icon-workflow_other"></i>
            </SelectOtherFieldWrap>
          </Tooltip>
        </Trigger>
      </div>
    );
  }
}
