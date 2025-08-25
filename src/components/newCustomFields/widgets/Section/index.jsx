import React, { Component } from 'react';

export default class Widgets extends Component {
  render() {
    const { children } = this.props;
    return <div className="customFieldsContainer">{children}</div>;
  }
}
