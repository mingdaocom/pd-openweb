import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { UserHead } from 'ming-ui';
import { dialogSelectUser, quickSelectUser } from 'ming-ui/functions';
import { getTabTypeBySelectUser } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { FILTER_CONDITION_TYPE } from '../../enum';

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

  addUser = () => {
    const { projectId, from = '', control = {}, appId, filterResigned } = this.props;
    const tabType = getTabTypeBySelectUser(control);
    if (
      tabType === 1 &&
      md.global.Account.isPortal &&
      !find(md.global.Account.projects, item => item.projectId === projectId)
    ) {
      alert(_l('您不是该组织成员，无法获取其成员列表，请联系组织管理员'), 3);
      return;
    }
    const _this = this;

    if (this.props.disabled) {
      return;
    }

    quickSelectUser(this.userscon, {
      showMoreInvite: false,
      isTask: false,
      includeUndefinedAndMySelf: !_.includes(['rule', 'portal', 'subTotal'], from),
      includeSystemField: !_.includes(['rule', 'portal', 'subTotal'], from),
      ...(_.includes(['rule'], from)
        ? {
            prefixAccounts: [
              {
                accountId: 'user-self',
                fullname: _l('当前用户'),
                avatar:
                  md.global.FileStoreConfig.pictureHost.replace(/\/$/, '') +
                  '/UserAvatar/user-self.png?imageView2/1/w/100/h/100/q/90',
              },
            ],
          }
        : {}),
      isHidAddUser: md.global.Account.isPortal,
      tabType,
      offset: {
        top: 0,
        left: 1,
      },
      zIndex: 10001,
      appId,
      selectedAccountIds: this.state.users.map(l => l.accountId),
      SelectUserSettings: {
        unique: this.selectSingle,
        projectId,
        filterResigned: filterResigned,
        hideResignedTab: true,
        callback(users) {
          _this.addUsers(users);
        },
      },
      selectCb(users) {
        _this.addUsers(users);
      },
    });
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
          className="userHead"
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
    const { disabled } = this.props;
    const { users } = this.state;
    return (
      <div className="worksheetFilterUsersCondition">
        <div className={cx('usersCon', { disabled })} ref={con => (this.userscon = con)} onClick={this.addUser}>
          {users.length ? (
            users.map((user, index) => (
              <div className="userItem" key={index}>
                {this.renderHead(user)}
                <span className="fullname breakAll">{user.fullname}</span>
                <span
                  className="remove"
                  onClick={e => {
                    e.stopPropagation();
                    this.removeUser(user);
                  }}
                >
                  <i className="icon icon-delete"></i>
                </span>
              </div>
            ))
          ) : (
            <Fragment>
              <span className="placeholder">{_l('请选择')}</span>
              <i className="icon icon-arrow-down-border Font15 Gray_9e Right mTop5"></i>
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}
