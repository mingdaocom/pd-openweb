import React, { Component } from 'react';
import NodeShare from './common/NodeShare';
import './main.css';
import alert from 'src/components/alert/alert';

window.alert = alert;

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
