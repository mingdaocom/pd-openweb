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

    // 外部门户 并且应用id对应不上
    if (md.global.Account.isPortal && md.global.Account.appId !== _.get(this.props, 'computedMatch.params.appId')) {
      location.href = `${window.subPath}/logout?ReturnUrl=${encodeURIComponent(location.href)}`;
    }

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
