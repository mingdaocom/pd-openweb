import React, { Component } from 'react';
import Checkbox from 'ming-ui/components/Checkbox';

export default class User extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.props.onChange(this.props.user);
  }
  render() {
    let { user, checked, includeUndefinedAndMySelf } = this.props;

    const shouldShowInfo = !(includeUndefinedAndMySelf && user.accountId === md.global.Account.accountId);
    return (
      <div className="GSelect-User" onClick={this.handleClick}>
        <Checkbox className="GSelect-User--checkbox" checked={checked} />
        <div className="GSelect-User__avatar">
          <img data-accountid={user.accountId} src={user.avatar} />
        </div>
        {!shouldShowInfo ? <div className="GSelect-User__fullname">{_l('我自己')}</div> : <div className="GSelect-User__fullname">{user.fullname}</div>}
        {user.companyName && shouldShowInfo && <div className="GSelect-User__companyName">{user.companyName}</div>}
        {user.department && shouldShowInfo && <div className="GSelect-User__companyName">{user.department}</div>}
      </div>
    );
  }
}
