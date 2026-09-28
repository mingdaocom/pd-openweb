import React, { useCallback } from 'react';
import useFunctionWrap from 'ming-ui/hooks/useFunctionWrap';

const getOriginalProps = props => props;

export function openFunctionWrapComponent(open, Component, props, getComponentProps = getOriginalProps) {
  return open(Component, getComponentProps(props));
}

export default function useFunctionWrapComponent(Component, getComponentProps = getOriginalProps) {
  const [open, holder] = useFunctionWrap();
  const openComponent = useCallback(
    props => openFunctionWrapComponent(open, Component, props, getComponentProps),
    [Component, getComponentProps, open],
  );

  return { open: openComponent, holder };
}

function withOpener(Component, useOpener, openPropName) {
  const WithOpener = React.forwardRef(function WithOpener(props, ref) {
    const { open, holder } = useOpener();

    return (
      <React.Fragment>
        {holder}
        <Component {...props} {...{ [openPropName]: open }} ref={ref} />
      </React.Fragment>
    );
  });

  WithOpener.displayName = `withOpener(${Component.displayName || Component.name || 'Component'})`;

  return WithOpener;
}

export function useFunctionWrapOpener() {
  const [open, holder] = useFunctionWrap();
  return { open, holder };
}

export function withOpeners(Component, openers = { openFunctionWrap: useFunctionWrapOpener }) {
  return Object.entries(openers).reduce(
    (WrappedComponent, [openPropName, useOpener]) => withOpener(WrappedComponent, useOpener, openPropName),
    Component,
  );
}
