import React, { Component, Fragment } from 'react';
import { string } from 'prop-types';
import DocumentTitle from 'react-document-title';
import { Route } from 'react-router-dom';

export default class WithTitle extends Component {
  static propTypes = {
    title: string,
  };

  renderComponentWithTitle = props => {
    const { title, component: Comp, ...rest } = this.props;
    return (
      <Fragment>
        {title && <DocumentTitle title={title} />}
        <Comp {...props} {...rest} />
      </Fragment>
    );
  };

  render() {
    const { title, component, ...rest } = this.props;
    return <Route {...rest} component={this.renderComponentWithTitle} />;
  }
}
