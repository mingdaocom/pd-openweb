import React, { useState } from 'react';
import * as Sentry from '@sentry/react';
import copy from 'copy-to-clipboard';
import PropTypes from 'prop-types';
import '../less/ErrorBoundary.less';

function getErrorStr(errorData) {
  try {
    return `error occurred:${errorData.componentStack}
${errorData.error.message}
${errorData.error.stack}`;
  } catch (err) {
    console.log(err);
    return 'parse error fail!';
  }
}

function ErrorPage({ isSeriousError, errorData = {} }) {
  const [errorVisible, setErrorVisible] = useState();

  if (isSeriousError === false) {
    return (
      <div className="programErrorMinBox flexColumn bgPrimary flex">
        <i className="icon-error1 Font56" />
        <div className="Font14 mTop20">{_l('程序错误，请刷新页面重试')}</div>
        {errorVisible && (
          <div className="errorPageErrorLog">
            <span
              className="copy"
              onClick={() => {
                copy(getErrorStr(errorData));
                alert(_l('程序错误信息复制成功'));
              }}
            >
              {_l('复制')}
            </span>
            <br />
            {getErrorStr(errorData)}
          </div>
        )}
        <div className="errorPageShowError" onClick={() => setErrorVisible(true)}></div>
      </div>
    );
  }

  return (
    <div className="programErrorBox flex">
      <div className="programError flexColumn">
        <div className="programErrorImg" />
        <div className="Font20 mTop20">{_l('程序错误，请刷新页面重试')}</div>
        <div className="Font13 mTop10 textTertiary">{_l('如刷新后仍无法解决，请联系客服汇报错误')}</div>
        <div
          className="Font14 bgColorPrimary hoverBgColorPrimaryDark programRefresh mTop25 pointer"
          onClick={() => location.reload()}
        >
          {_l('刷新')}
        </div>
        {errorVisible && (
          <div className="errorPageErrorLog">
            <span
              className="copy"
              onClick={() => {
                copy(getErrorStr(errorData));
                alert(_l('程序错误信息复制成功'));
              }}
            >
              {_l('复制')}
            </span>
            <br />
            {getErrorStr(errorData)}
          </div>
        )}
        <div className="errorPageShowError" onClick={() => setErrorVisible(true)}></div>
      </div>
    </div>
  );
}

function ErrorBoundary({ children, isSeriousError = false, fallback }) {
  return (
    <Sentry.ErrorBoundary
      fallback={errorData =>
        fallback ? fallback(errorData) : <ErrorPage isSeriousError={isSeriousError} errorData={errorData} />
      }
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}

ErrorPage.propTypes = {
  isSeriousError: PropTypes.bool,
  errorData: PropTypes.shape({}),
};

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  isSeriousError: PropTypes.bool,
  fallback: PropTypes.func,
};

ErrorBoundary.wrap = (Component, options) => {
  const isSeriousError = typeof options === 'boolean' ? options : options && options.isSeriousError;

  function ErrorBoundaryWrapper(props) {
    return (
      <ErrorBoundary isSeriousError={!!isSeriousError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  }

  ErrorBoundaryWrapper.displayName = `ErrorBoundary(${Component.displayName || Component.name || 'Component'})`;
  return ErrorBoundaryWrapper;
};

ErrorBoundary.ErrorPage = ErrorPage;

export default ErrorBoundary;
