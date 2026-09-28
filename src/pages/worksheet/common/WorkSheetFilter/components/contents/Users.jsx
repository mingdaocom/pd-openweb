import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { UserHead } from 'ming-ui';
import { Select } from 'ming-ui/antd-components';
import { dialogSelectUser } from 'ming-ui/functions';
import { UserSelectPopover } from 'ming-ui/functions/quickSelectUser';
import { getTabTypeBySelectUser } from 'src/utils/domain/control/controlSelection';
import { FILTER_CONDITION_TYPE } from 'src/utils/domain/worksheet/filterConstants';

const USER_SELECT_STYLES = { root: { '--hap-select-multi-item-height': '28px' } };

export default class Users extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    projectId: PropTypes.string,
    onChange: PropTypes.func,
    fullValues: PropTypes.arrayOf(PropTypes.string),
    from: PropTypes.string, // rule显示规则不出现 当前用户 当前用户的下属 未指定
  };
  static defaultProps = {
    fullValues: [],
  };
  constructor(props) {
    super(props);
    this.state = {
      users: (props.fullValues || [])
        .map(value => {
          let user = {};

          try {
            user = JSON.parse(value);
          } catch (err) {
            console.log(err);
            return undefined;
          }

          return {
            accountId: user.id,
            fullname: user.name,
            avatar: user.avatar,
          };
        })
        .filter(_.identity),
    };
  }
  get selectSingle() {
    return (
      _.get(this.props, 'control.enumDefault') === 0 &&
      _.includes([FILTER_CONDITION_TYPE.ARREQ, FILTER_CONDITION_TYPE.ARRNE], this.props.type)
    );
  }
  selectUser(title, projectId, options, callback) {
    dialogSelectUser({
      title,
      sourceId: 0,
      fromType: 0,
      showMoreInvite: false,
      SelectUserSettings: Object.assign(
        {},
        {
          projectId: _.find(md.global.Account.projects, p => p.projectId === projectId) ? projectId : '',
          callback,
        },
        options,
      ),
    });
  }

  canOpenUserSelect = () => {
    const { projectId, control = {} } = this.props;
    const tabType = getTabTypeBySelectUser(control);

    if (
      tabType === 1 &&
      md.global.Account.isPortal &&
      !_.find(md.global.Account.projects, item => item.projectId === projectId)
    ) {
      alert(_l('您不是该组织成员，无法获取其成员列表，请联系组织管理员'), 3);
      return false;
    }

    if (this.props.disabled) {
      return false;
    }

    return true;
  };

  addUsers = selectusers => {
    const { users } = this.state;
    const newUsers = users.concat(selectusers);

    if (this.selectSingle) {
      this.changeUsers(selectusers.slice(0, 1));
      return;
    }

    if (!selectusers[0] || _.find(users, option => option.accountId === selectusers[0].accountId)) {
      alert(_l('该用户已存在'), 3);
      return;
    }

    this.changeUsers(newUsers);
  };

  removeUser = user => {
    const newUsers = this.state.users.filter(u => u.accountId !== user.accountId);
    this.changeUsers(newUsers);
  };

  changeUsers = newUsers => {
    const { onChange } = this.props;
    this.setState(
      {
        users: newUsers,
      },
      () => {
        let users = newUsers
          .map(user => ({
            id: user.accountId,
            name: user.fullname,
            avatar: user.avatar,
          }))
          .map(v => JSON.stringify(v));
        onChange({
          values: newUsers.map(user => user.accountId),
          fullValues: users,
        });
      },
    );
  };
  renderHead(user) {
    if (user.accountId === 'user-self') {
      return (
        <span className="iconCon">
          <i className="icon icon-task_custom_personnel filterCustomUserHead"></i>
        </span>
      );
    } else if (user.accountId === 'user-sub') {
      return (
        <span className="iconCon">
          <i className="icon icon-framework filterCustomUserHead"></i>
        </span>
      );
    } else {
      return (
        <UserHead
          className="worksheetFilterUserHead"
          user={{
            userHead: user.avatar,
            accountId: user.accountId,
          }}
          size={24}
          appId={this.props.appId}
          projectId={this.props.projectId}
        />
      );
    }
  }
  render() {
    const { appId, control = {}, disabled, filterResigned, from = '', projectId } = this.props;
    const { users } = this.state;
    const includeSpecialUsers = !_.includes(['rule', 'portal', 'subTotal'], from);
    const triggerNode = (
      <Select
        className="w100"
        mode="multiple"
        open={false}
        showSearch={false}
        disabled={disabled}
        placeholder={_l('请选择')}
        styles={USER_SELECT_STYLES}
        options={users.map(user => ({
          label: (
            <span className="flexRow alignItemsCenter minWidth0">
              {this.renderHead(user)}
              <span className="mLeft6 ellipsis">{user.fullname}</span>
            </span>
          ),
          value: user.accountId,
        }))}
        value={users.map(user => user.accountId)}
        onDeselect={accountId => this.removeUser({ accountId })}
      />
    );

    return (
      <div className="worksheetFilterUsersCondition">
        <UserSelectPopover
          showMoreInvite={false}
          includeUndefinedAndMySelf={includeSpecialUsers}
          includeSystemField={includeSpecialUsers}
          prefixAccounts={
            from === 'rule'
              ? [
                  {
                    accountId: 'user-self',
                    fullname: _l('当前用户'),
                    avatar:
                      md.global.FileStoreConfig.pictureHost + '/UserAvatar/user-self.png?imageView2/1/w/100/h/100/q/90',
                  },
                ]
              : []
          }
          isHidAddUser={md.global.Account.isPortal}
          tabType={getTabTypeBySelectUser(control)}
          offset={{ top: 0, left: 1 }}
          appId={appId}
          selectedAccountIds={users.map(l => l.accountId)}
          SelectUserSettings={{
            unique: this.selectSingle,
            projectId,
            filterResigned,
            hideResignedTab: true,
            callback: this.addUsers,
          }}
          onSelect={this.addUsers}
          onOpenChange={visible => {
            if (visible && !this.canOpenUserSelect()) return false;
          }}
        >
          {triggerNode}
        </UserSelectPopover>
      </div>
    );
  }
}
