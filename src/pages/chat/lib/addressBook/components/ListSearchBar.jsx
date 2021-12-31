import React from 'react';
import cx from 'classnames';

import Icon from 'ming-ui/components/Icon';
import InviteDialog from 'src/components/invite';
import AddFriends from 'addFriends';
import Inivte from 'src/components/common/inviteMember/inviteMember';

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
        InviteDialog();
        break;
      case 'friends':
        AddFriends();
        break;
      case 'projectContacts':
        Inivte.inviteMembers(projectId);
        break;
      case 'groups':
        // FIXME: 不是异步的话dom事件绑定不上 同pageHead
        require(['src/components/group/create/creatGroup'], (CreatGroup) => {
          CreatGroup.createInit({
            projectId,
          });
        });
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
          <input type="text" className="contacts-search-input" placeholder={_l('搜索')} onChange={this.searchHandler} value={this.state.value} />
        </div>
        <span data-tip={tip}>
          <Icon
            icon={isGroup ? 'group_add' : 'invite'}
            className={cx('contacts-search-addbtn pLeft12 pRight20 Gray_9e Hand ThemeHoverColor3', isGroup ? 'Font22' : 'Font18 mLeft5')}
            onClick={this.addHandler}
          />
        </span>
      </div>
    );
  }
}
