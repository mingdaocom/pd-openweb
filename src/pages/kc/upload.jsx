import React, { Component } from 'react';
import UploadAssistant from './common/UploadAssistant';
import './main.css';

// 隐藏 chat、mobileShare

export default class KcUploadEntrypoint extends Component {
  componentDidMount() {
    $('html').addClass('AppKc AppKcUpload');
  }
  componentWillUnmount() {
    $('html').removeClass('AppKc AppKcUpload');
  }
  render() {
    return <UploadAssistant />;
  }
}
