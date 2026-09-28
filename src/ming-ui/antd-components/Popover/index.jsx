import React, { forwardRef } from 'react';
import AntdPopover from 'antd/es/popover';
import PropTypes from 'prop-types';
import { transformSemanticConfig } from '../utils';

const DEFAULT_AUTO_ADJUST_OVERFLOW = { adjustX: true, adjustY: true, shiftX: true, shiftY: true };

const mergePopoverStyles = styles => ({
  ...styles,
  container: {
    padding: 0,
    ...styles?.container,
  },
});

export const getPopoverStyles = (noPadding, styles) => {
  if (!noPadding) return styles;

  return transformSemanticConfig(styles, mergePopoverStyles);
};

const Popover = forwardRef(
  (
    {
      arrow = false,
      autoAdjustOverflow = DEFAULT_AUTO_ADJUST_OVERFLOW,
      destroyOnHidden,
      noPadding = false,
      styles,
      ...props
    },
    ref,
  ) => (
    <AntdPopover
      {...props}
      ref={ref}
      arrow={arrow}
      autoAdjustOverflow={autoAdjustOverflow}
      destroyOnHidden={destroyOnHidden ?? true}
      styles={getPopoverStyles(noPadding, styles)}
    />
  ),
);

Popover.displayName = 'Popover';
Popover._InternalPanelDoNotUseOrYouWillBeFired = AntdPopover._InternalPanelDoNotUseOrYouWillBeFired;

Popover.propTypes = {
  arrow: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  autoAdjustOverflow: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  destroyOnHidden: PropTypes.bool,
  noPadding: PropTypes.bool,
  styles: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
};

export default Popover;
