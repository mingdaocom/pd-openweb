import React from 'react';
import ErrorPage from 'src/components/errorPage/errorPage';
import * as Sentry from '@sentry/react';

/**
 * 错误组件
 * @param {组件} Component
 * @param {是否是严重错误} isSeriousError
 */
const errorBoundary = (Component, isSeriousError) => {
  class ErrorBoundary extends React.Component {
    render() {
      return (
        <Sentry.ErrorBoundary
          fallback={errorData => <ErrorPage isSeriousError={isSeriousError} errorData={errorData} />}
        >
          <Component {...this.props} />
        </Sentry.ErrorBoundary>
      );
    }
  }

  return ErrorBoundary;
};

export default Component => {
  if (typeof Component !== 'boolean') {
    return errorBoundary(Component, false);
  }

  return Component => errorBoundary(Component, true);
};
