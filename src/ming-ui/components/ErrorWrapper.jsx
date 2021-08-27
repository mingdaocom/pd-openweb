import React from 'react';
import errorBoundary from 'ming-ui/decorators/errorBoundary';

function ErrorWrapper(props) {
  return <React.Fragment>{props.children}</React.Fragment>;
}

export default errorBoundary(ErrorWrapper);
