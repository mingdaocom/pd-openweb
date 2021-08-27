import React, { Component } from 'react';
import Checkbox from 'ming-ui/components/Checkbox';

import './css/group.less';

export default class Group extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    if (!this.props.group.disabled) {
      this.props.onChange(this.props.group);
    }
  }
  render() {
    let { group, checked } = this.props;
    return (
      <div className="GSelect-group" onClick={this.handleClick}>
        <Checkbox disabled={group.disabled} className="GSelect-group--checkbox" checked={checked} />
        <div className="GSelect-group__avatar">
          <img data-accountid={group.groupId} src={group.avatar} />
        </div>
        <div className="GSelect-group__fullname overflow_ellipsis">{group.name}</div>
        <div className="GSelect-group__companyName">{`（${group.groupUserCount}人）`}</div>
      </div>
    );
  }
}
