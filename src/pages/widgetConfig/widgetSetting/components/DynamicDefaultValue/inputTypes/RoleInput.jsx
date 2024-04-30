import React, { Component } from 'react';
import { OtherFieldList, SelectOtherField, DynamicInput } from '../components';
import { DynamicValueInputWrap } from '../styled';
import { dialogSelectOrgRole } from 'ming-ui/functions';
import update from 'immutability-helper';
import _ from 'lodash';

export default class RoleInput extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // 成员多选数据处理
  removeItem = id => {
    const { dynamicValue, onDynamicValueChange } = this.props;
    const getId = item => {
      const { staticValue } = item;
      if (!staticValue) return '';
      return _.get(_.isString(staticValue) ? JSON.parse(staticValue) : staticValue, 'organizeId');
    };
    const index = _.findIndex(dynamicValue, item => {
      return getId(item) === id;
    });
    if (index > -1) {
      onDynamicValueChange(update(dynamicValue, { $splice: [[index, 1]] }));
    }
  };
  onTriggerClick = () => {
    const { defaultType } = this.props;
    defaultType && this.$wrap.triggerClick();
  };
  render() {
    const { defaultType, data = {}, globalSheetInfo: { projectId } = {}, onDynamicValueChange } = this.props;
    return (
      <DynamicValueInputWrap>
        {defaultType ? (
          <DynamicInput {...this.props} onTriggerClick={this.onTriggerClick} />
        ) : (
          <OtherFieldList
            {...this.props}
            removeItem={this.removeItem}
            onClick={() => {
              dialogSelectOrgRole({
                projectId,
                unique: data.enumDefault === 0,
                onSave: arr => {
                  const value = arr.map(({ organizeName, organizeId }) => ({
                    cid: '',
                    rcid: '',
                    staticValue: JSON.stringify({ organizeId, organizeName }),
                  }));
                  onDynamicValueChange(value);
                },
              });
            }}
          />
        )}
        <SelectOtherField {...this.props} ref={con => (this.$wrap = con)} />
      </DynamicValueInputWrap>
    );
  }
}
