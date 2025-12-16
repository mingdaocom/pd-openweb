import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Tooltip } from 'ming-ui/antd-components';
import Icon from 'ming-ui/components/Icon';
import { dialogSelectUser } from 'ming-ui/functions';
import InviteController from 'src/api/invitation';
import addFriends from 'src/components/addFriends';
import AddFriends from 'src/components/addFriends';
import createGroup from 'src/pages/Group/createGroup';
import { existAccountHint } from 'src/utils/inviteCommon';

export default class SearchBar extends React.Component {
  constructor(props) {
    super();
    this.state = {
      value: props.keywords || '',
    };
    this.addHandler = this.addHandler.bind(this);
    this.search = _.debounce(props.search, 500);
    this.searchHandler = this.searchHandler.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.keywords !== this.props.keywords) {
      this.setState({
        value: nextProps.keywords,
      });
    }
  }

  componentWillUnmount() {
    if (this.search && this.search.cancel) {
      this.search.cancel();
    }
  }

  searchHandler(event) {
    const value = event.target.value;
    this.setState({
      value,
    });
    this.search(value);
  }

  addHandler() {
    const { type, projectId } = this.props;
    switch (type) {
      case 'contacts':
        addFriends({ selectProject: true });
        break;
      case 'friends':
        AddFriends({ projectId, fromType: 0 });
        break;
      case 'projectContacts':
        dialogSelectUser({
          SelectUserSettings: {
            filterAccountIds: [md.global.Account.accountId],
            filterProjectId: projectId,
            callback: function (users) {
              InviteController.inviteUser({
                sourceId: projectId,
                accountIds: users.map(o => o.accountId),
                fromType: 4,
              }).then(function (result) {
                existAccountHint(result);
              });
            },
          },
        });
        break;
      case 'groups':
        // FIXME: 不是异步的话dom事件绑定不上 同pageHead
        createGroup({ projectId });
        break;
      default:
        break;
    }
  }

  render() {
    const { type } = this.props;
    const isGroup = type === 'groups';
    const isFriend = type === 'friends';
    const tip = isGroup ? _l('创建群组') : isFriend ? _l('邀请好友') : _l('邀请同事');
    return (
      <div className="contacts-search">
        <div className="contacts-search-wrapper">
          <Icon icon="search" className="Font18 Gray_a mTop1" />
          <input
            type="text"
            className="contacts-search-input"
            placeholder={_l('搜索')}
            onChange={this.searchHandler}
            value={this.state.value}
          />
        </div>
        <Tooltip title={tip}>
          <span>
            <Icon
              icon={isGroup ? 'group_add' : 'invite'}
              className={cx(
                'contacts-search-addbtn pLeft12 pRight20 Gray_9e Hand ThemeHoverColor3',
                isGroup ? 'Font22' : 'Font18 mLeft5',
              )}
              onClick={this.addHandler}
            />
          </span>
        </Tooltip>
      </div>
    );
  }
}
