import React, { Component, Fragment, Suspense } from 'react';
import { Route } from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import { string } from 'prop-types';
import ErrorBoundary from 'ming-ui/components/ErrorBoundary';

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
        <ErrorBoundary>
          <Suspense fallback={null}>
            <Comp {...props} {...rest} />
          </Suspense>
        </ErrorBoundary>
      </Fragment>
    );
  };

  render() {
    const { ...rest } = this.props;
    return <Route {...rest} component={this.renderComponentWithTitle} />;
  }
}
