import React, { Component, Fragment } from 'react';
import DocumentTitle from 'react-document-title';
import CustomTemplate from './components/customTemplate/customTemplate';

export default class CustomTemplateEntrypoint extends Component {
  componentDidMount() {
    $('html').addClass('AppTaskTemplate');
  }
  componentWillUnmount() {
    $('html').removeClass('AppTaskTemplate');
  }
  render() {
    return (
      <Fragment>
        <DocumentTitle title={_l('自定义项目模板-任务')} />
        <CustomTemplate tempId={this.props.match.params.tempId || ''} />
      </Fragment>
    );
  }
}
