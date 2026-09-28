import React, { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import _ from 'lodash';
import { browserIsMobile } from 'src/utils/platform/browser/device';

export const getFunctionWrapProps = (props, destroy) => {
  const componentProps = {
    ...(props.visibleName ? { [props.visibleName]: true } : { visible: true }),
    ...props,
    onClose: (...args) => {
      destroy();
      if (_.isFunction(props.onClose)) {
        props.onClose(...args);
      }
    },
    onCancel: () => {
      destroy();
      if (_.isFunction(props.onCancel)) {
        props.onCancel();
      }
    },
  };

  if (props.closeFnName) {
    componentProps[props.closeFnName] = () => {
      destroy();
      if (_.isFunction(props[props.closeFnName])) {
        props[props.closeFnName]();
      }
    };
  }

  return componentProps;
};

const FunctionWrapItem = React.memo(function FunctionWrapItem({ item, store }) {
  const { id, Comp, props, container } = item;

  return createPortal(<Comp {...getFunctionWrapProps(props, () => store.destroy(id))} />, container);
});

export default function FunctionWrapHolder({ store }) {
  const items = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  useEffect(() => {
    if (!items.length) return;

    const handlePopState = () => !browserIsMobile() && store.destroyAll();

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [items.length, store]);

  useEffect(() => () => store.clear(), [store]);

  return items.map(item => <FunctionWrapItem key={item.id} item={item} store={store} />);
}
