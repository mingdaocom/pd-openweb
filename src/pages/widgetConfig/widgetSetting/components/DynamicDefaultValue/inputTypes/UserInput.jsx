import React, { Component } from 'react';
import { string, arrayOf, shape, func } from 'prop-types';
import { OtherFieldList, SelectOtherField, DynamicInput } from '../components';
import { DynamicValueInputWrap } from '../styled';
import update from 'immutability-helper';

export default class DateInput extends Component {
  static propTypes = {
    onDynamicValueChange: func,
    dynamicValue: arrayOf(shape({ cid: string, rcid: string, staticValue: string })),
  };
  static defaultProps = {
    onDynamicValueChange: _.noop,
    dynamicValue: [],
  };
  componentDidMount() {
    const { data, clearOldDefault } = this.props;
    const { defaultMen } = data;
    if (Array.isArray(defaultMen) && defaultMen.length > 0) {
      clearOldDefault({ defaultMen: '' });
    }
  }
  // 成员多选数据处理
  removeItem = accountId => {
    const { dynamicValue } = this.props;
    const getUserId = item => {
      const { staticValue } = item;
      if (!staticValue) return '';
      return _.get(_.isString(staticValue) ? JSON.parse(staticValue) : staticValue, 'accountId');
    };
    const index = _.findIndex(dynamicValue, item => {
      return getUserId(item) === accountId;
    });
    if (index > -1) {
      this.props.onDynamicValueChange(update(dynamicValue, { $splice: [[index, 1]] }));
    }
  };
  selectUser = () => {
    const { data, dynamicValue } = this.props;
    const unique = data.enumDefault === 0;
    import('dialogSelectUser').then(() => {
      $({}).dialogSelectUser({
        showMoreInvite: false,
        title: _l('设置默认人员'),
        SelectUserSettings: {
          unique,
          // ...settings,
          callback: users => {
            const usersId = users.map(item => ({
              cid: '',
              rcid: '',
              staticValue: _.pick(item, ['accountId', 'fullname', 'avatar']),
            }));

            const getUsers = () => {
              // 人员去重
              const getId = item => _.get(item, ['staticValue', 'accountId']);
              const existUser = dynamicValue
                .filter(item => item.staticValue)
                .map(item => _.get(item, ['staticValue', 'accountId']));
              return usersId.reduce((prev, curr) => {
                return existUser.includes(getId(curr)) ? prev : prev.concat(curr);
              }, dynamicValue);
            };

            this.props.onDynamicValueChange(unique ? usersId : getUsers());
          },
        },
      });
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
          <OtherFieldList {...this.props} removeItem={this.removeItem} onClick={this.selectUser} />
        )}
        <SelectOtherField {...this.props} ref={con => (this.$wrap = con)} />
      </DynamicValueInputWrap>
    );
  }
}
