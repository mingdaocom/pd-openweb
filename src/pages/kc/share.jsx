import React, { Component } from 'react';
import NodeShare from './common/NodeShare';
import './main.css';

window.alert = require('alert');

export default class KcShareEntrypoint extends Component {
  componentDidMount() {
    $('html').addClass('AppKc AppKcShare');
  }
  componentWillUnmount() {
    $('html').removeClass('AppKc AppKcShare');
  }
  render() {
    return (
      <NodeShare />
    );
  }
}
