import React, { Component } from 'react';
import WorkSheet from './WorkSheet';

export default class KcEntrypoint extends Component {
  componentDidMount() {
    $('html').addClass('AppWorkSheet');
  }
  componentWillUnmount() {
    $('html').removeClass('AppWorkSheet');
  }
  render() {
    return <WorkSheet />;
  }
}
