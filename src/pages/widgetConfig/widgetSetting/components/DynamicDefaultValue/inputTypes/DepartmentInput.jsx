import React, { Component } from 'react';
import update from 'immutability-helper';
import _ from 'lodash';
import { dialogSelectDept } from 'ming-ui/functions';
import { DynamicInput, OtherFieldList, SelectOtherField } from '../components';
import { DynamicValueInputWrap } from '../styled';

export default class DepartmentInput extends Component {
  // 成员多选数据处理
  removeItem = id => {
    const { dynamicValue, onDynamicValueChange } = this.props;
    const getId = item => {
      const { staticValue } = item;
      if (!staticValue) return '';
      return _.get(_.isString(staticValue) ? JSON.parse(staticValue) : staticValue, 'departmentId');
    };
    const index = _.findIndex(dynamicValue, item => {
      return getId(item) === id;
    });
    if (index > -1) {
      onDynamicValueChange(update(dynamicValue, { $splice: [[index, 1]] }));
    }
  };
  handleClick = () => {
    const { globalSheetInfo, onDynamicValueChange, data = {} } = this.props;
    const { projectId } = globalSheetInfo;
    const unique = data.enumDefault === 0;

    dialogSelectDept({
      projectId,
      isIncludeRoot: false,
      unique: unique,
      showCreateBtn: false,
      selectFn: arr => {
        const value = arr.map(({ departmentId, departmentName }) => ({
          cid: '',
          rcid: '',
          staticValue: JSON.stringify({ departmentId, departmentName }),
        }));
        onDynamicValueChange(value);
      },
    });
  };
  onTriggerClick = () => {
    const { defaultType } = this.props;
    defaultType && this.$wrap.triggerClick();
  };
  render() {
    const { defaultType } = this.props;
    return (
      <DynamicValueInputWrap>
        {defaultType ? (
          <DynamicInput {...this.props} onTriggerClick={this.onTriggerClick} />
        ) : (
          <OtherFieldList {...this.props} removeItem={this.removeItem} onClick={this.handleClick} />
        )}
        <SelectOtherField {...this.props} ref={con => (this.$wrap = con)} />
      </DynamicValueInputWrap>
    );
  }
}
