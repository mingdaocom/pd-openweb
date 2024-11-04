import React, { Component } from 'react';
import { string, arrayOf, shape, func } from 'prop-types';
import { OtherFieldList, SelectOtherField, DynamicInput } from '../components';
import { DynamicValueInputWrap } from '../styled';
import update from 'immutability-helper';
import { quickSelectUser, dialogSelectUser } from 'ming-ui/functions';
import { getTabTypeBySelectUser } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import _ from 'lodash';
import { DYNAMIC_FROM_MODE } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/config.js';

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
  formatUsersId = (users = []) => {
    return users.map(item => ({
      cid: '',
      rcid: '',
      staticValue: JSON.stringify(_.pick(item, ['accountId', 'fullname', 'avatar'])),
    }));
  };
  selectUser = event => {
    const { data, dynamicValue, globalSheetInfo = {}, from } = this.props;
    const tabType = getTabTypeBySelectUser(data);
    const unique = data.enumDefault === 0;
    const selectedAccountIds = dynamicValue
      .filter(
        item =>
          item.staticValue &&
          (JSON.parse(item.staticValue || '{}').accountId !== 'user-self' || item.cid !== 'user-self'),
      )
      .map(i => JSON.parse(i.staticValue || '{}').accountId);

    const getUsers = usersId => {
      // 人员去重
      const getId = item => _.get(item, ['staticValue', 'accountId']);
      const existUser = dynamicValue
        .filter(item => item.staticValue)
        .map(item => JSON.parse(item.staticValue || '{}').accountId);
      return usersId.reduce((prev, curr) => {
        return existUser.includes(getId(curr)) ? prev : prev.concat(curr);
      }, dynamicValue);
    };
    if (tabType === 2 || from === DYNAMIC_FROM_MODE.FAST_FILTER) {
      let param = {};
      if (from === DYNAMIC_FROM_MODE.FAST_FILTER && _.get(data, 'advancedSetting.shownullitem') === '1') {
        param.staticAccounts = [
          {
            avatar:
              md.global.FileStoreConfig.pictureHost.replace(/\/$/, '') +
              '/UserAvatar/undefined.gif?imageView2/1/w/100/h/100/q/90',
            fullname: _.get(data, 'advancedSetting.nullitemname') || _l('为空'),
            accountId: 'isEmpty',
          },
        ];
      }

      quickSelectUser(event.target, {
        ...param,
        showMoreInvite: false,
        isTask: false,
        tabType,
        appId: globalSheetInfo.appId,
        selectedAccountIds,
        minHeight: 400,
        offset: {
          top: 16,
          left: 0,
        },
        zIndex: 10001,
        SelectUserSettings: {
          unique,
          projectId: globalSheetInfo.projectId,
          selectedAccountIds,
          callback: users => {
            const usersId = this.formatUsersId(users);
            this.props.onDynamicValueChange(unique ? usersId : getUsers(usersId));
          },
        },
        selectCb: users => {
          const usersId = this.formatUsersId(users);
          this.props.onDynamicValueChange(unique ? usersId : getUsers(usersId));
        },
      });
      return;
    }

    dialogSelectUser({
      showMoreInvite: false,
      title: _l('设置默认人员'),
      SelectUserSettings: {
        unique,
        projectId: globalSheetInfo.projectId,
        selectedAccountIds,
        callback: users => {
          const usersId = this.formatUsersId(users);
          this.props.onDynamicValueChange(unique ? usersId : getUsers(usersId));
        },
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
          <OtherFieldList
            ref={con => (this.userscon = con)}
            {...this.props}
            removeItem={this.removeItem}
            onClick={this.selectUser}
          />
        )}
        <SelectOtherField {...this.props} ref={con => (this.$wrap = con)} />
      </DynamicValueInputWrap>
    );
  }
}
