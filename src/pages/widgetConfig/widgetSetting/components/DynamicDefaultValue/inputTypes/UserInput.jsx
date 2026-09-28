import React, { Component } from 'react';
import update from 'immutability-helper';
import _ from 'lodash';
import { arrayOf, func, shape, string } from 'prop-types';
import { dialogSelectUser } from 'ming-ui/functions';
import { UserSelectPopover } from 'ming-ui/functions/quickSelectUser';
import { getTabTypeBySelectUser } from 'src/utils/domain/control/controlSelection';
import { DYNAMIC_FROM_MODE } from 'src/utils/domain/control/dynamicValueConfig';
import { DynamicInput, OtherFieldList, SelectOtherField } from '../components';
import { DynamicValueInputWrap } from '../styled';

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

  getUserSelectContext = () => {
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

    return { data, dynamicValue, from, globalSheetInfo, selectedAccountIds, tabType, unique };
  };

  handleSelectUser = users => {
    const { dynamicValue, unique } = this.getUserSelectContext();
    const usersId = this.formatUsersId(users);

    if (unique) {
      this.props.onDynamicValueChange(usersId);
      return;
    }

    const getUsers = () => {
      // 人员去重
      const getId = item => _.get(item, ['staticValue', 'accountId']);
      const existUser = dynamicValue
        .filter(item => item.staticValue)
        .map(item => JSON.parse(item.staticValue || '{}').accountId);
      return usersId.reduce((prev, curr) => {
        return existUser.includes(getId(curr)) ? prev : prev.concat(curr);
      }, dynamicValue);
    };

    this.props.onDynamicValueChange(getUsers());
  };

  openUserDialog = () => {
    const { globalSheetInfo, selectedAccountIds, unique } = this.getUserSelectContext();

    dialogSelectUser({
      showMoreInvite: false,
      title: _l('设置默认人员'),
      SelectUserSettings: {
        unique,
        projectId: globalSheetInfo.projectId,
        selectedAccountIds,
        callback: this.handleSelectUser,
      },
    });
  };
  onTriggerClick = () => {
    const { defaultType } = this.props;
    defaultType && this.$wrap.triggerClick();
  };
  render() {
    const { defaultType } = this.props;
    const { data, from, globalSheetInfo, selectedAccountIds, tabType, unique } = this.getUserSelectContext();
    const usePopover = tabType === 2 || from === DYNAMIC_FROM_MODE.FAST_FILTER;
    const staticAccounts =
      from === DYNAMIC_FROM_MODE.FAST_FILTER && _.get(data, 'advancedSetting.shownullitem') === '1'
        ? [
            {
              avatar: md.global.FileStoreConfig.pictureHost + '/UserAvatar/undefined.gif?imageView2/1/w/100/h/100/q/90',
              fullname: _.get(data, 'advancedSetting.nullitemname') || _l('为空'),
              accountId: 'isEmpty',
            },
          ]
        : [];
    const userField = (
      <OtherFieldList
        {...this.props}
        totalWidth={usePopover}
        removeItem={this.removeItem}
        onClick={usePopover ? undefined : this.openUserDialog}
      />
    );

    return (
      <DynamicValueInputWrap>
        {defaultType ? (
          <DynamicInput {...this.props} onTriggerClick={this.onTriggerClick} />
        ) : usePopover ? (
          <UserSelectPopover
            staticAccounts={staticAccounts}
            showMoreInvite={false}
            tabType={tabType}
            appId={globalSheetInfo.appId}
            selectedAccountIds={selectedAccountIds}
            minHeight={400}
            offset={{ top: 16, left: 0 }}
            SelectUserSettings={{
              unique,
              projectId: globalSheetInfo.projectId,
              selectedAccountIds,
              callback: this.handleSelectUser,
            }}
            onSelect={this.handleSelectUser}
          >
            <div style={{ width: 'calc(100% - 36px)' }}>{userField}</div>
          </UserSelectPopover>
        ) : (
          userField
        )}
        <SelectOtherField {...this.props} ref={con => (this.$wrap = con)} />
      </DynamicValueInputWrap>
    );
  }
}
