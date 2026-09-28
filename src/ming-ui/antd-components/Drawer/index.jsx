import React, { forwardRef, useMemo } from 'react';
import AntdDrawer from 'antd/es/drawer';
import PropTypes from 'prop-types';
import Icon from 'ming-ui/components/Icon';
import { transformSemanticConfig } from '../utils';

const defaultCloseIcon = <Icon icon="close" className="Font18" />;

const mergeDrawerStyles = styles => ({
  ...styles,
  close: {
    marginInlineStart: 0,
    ...styles?.close,
  },
});

export const getDrawerClosable = closable => {
  if (closable === false) {
    return false;
  }

  if (closable && typeof closable === 'object') {
    return {
      placement: 'end',
      ...closable,
    };
  }

  return { placement: 'end' };
};

export const getDrawerStyles = styles => transformSemanticConfig(styles, mergeDrawerStyles);

const Drawer = forwardRef(({ closable, closeIcon, styles, destroyOnHidden, ...props }, ref) => {
  const mergedClosable = useMemo(() => getDrawerClosable(closable), [closable]);
  const mergedStyles = useMemo(() => getDrawerStyles(styles), [styles]);

  return (
    <AntdDrawer
      {...props}
      ref={ref}
      closable={mergedClosable}
      closeIcon={closeIcon === undefined ? defaultCloseIcon : closeIcon}
      destroyOnHidden={destroyOnHidden ?? true}
      styles={mergedStyles}
    />
  );
});

Drawer.displayName = 'Drawer';
Drawer._InternalPanelDoNotUseOrYouWillBeFired = AntdDrawer._InternalPanelDoNotUseOrYouWillBeFired;

Drawer.propTypes = {
  closeIcon: PropTypes.node,
  closable: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      closeIcon: PropTypes.node,
      disabled: PropTypes.bool,
      placement: PropTypes.oneOf(['start', 'end']),
    }),
  ]),
  destroyOnHidden: PropTypes.bool,
  styles: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
};

export default Drawer;
