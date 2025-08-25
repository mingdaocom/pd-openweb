import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import { string } from 'prop-types';

export default class WithTitle extends Component {
  static propTypes = {
    title: string,
  };

  componentDidMount() {
    this.props.preCallback && this.props.preCallback(this.props);
  }

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
    const { ...rest } = this.props;
    return <Route {...rest} component={this.renderComponentWithTitle} />;
  }
}
