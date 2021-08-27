import React from 'react';
import ErrorPage from 'src/components/errorPage/errorPage';

/**
 * 错误组件
 * @param {组件} Component
 * @param {是否是严重错误} isSeriousError
 */
const errorBoundary = (Component, isSeriousError) => {
  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        hasError: false,
      };
    }

    componentDidCatch(error, extra) {
      this.setState({ hasError: true });
      console.error(extra);
    }

    render() {
      if (this.state.hasError) {
        return <ErrorPage isSeriousError={isSeriousError} />;
      }

      return <Component {...this.props} />;
    }
  }

  return ErrorBoundary;
};

export default (Component) => {
  if (typeof Component !== 'boolean') {
    return errorBoundary(Component, false);
  }

  return Component => errorBoundary(Component, true);
};
