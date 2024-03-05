import React, { Component } from 'react';
import _ from 'lodash';

export default class Widgets extends Component {
  render() {
    const { children } = this.props;
    return <div className="customFieldsContainer">{children}</div>;
  }
}
