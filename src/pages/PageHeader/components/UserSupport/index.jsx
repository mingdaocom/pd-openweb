import React, { Component } from 'react';
import { string } from 'prop-types';
import Icon from 'ming-ui/components/Icon';
import Avatar from '../Avatar';
import './index.less';

export default class UserSupport extends Component {
  static propTypes = {};

  static defaultProps = {};

  state = {};

  render() {
    return (
      <div className="userSupport">
        <div className="addAction" />
        <div className="globalHelp">
          <Icon icon="help" />
        </div>
        <div className="userCenter">
          <Avatar size={36} src={''} />
        </div>
      </div>
    );
  }
}
