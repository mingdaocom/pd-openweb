import React, { forwardRef } from 'react';
import AntdInputNumber from 'antd/es/input-number';
import Icon from 'ming-ui/components/Icon';
import { transformSemanticConfig } from '../utils';

const DEFAULT_ACTIONS_STYLE = { width: 32, opacity: 1 };
const DEFAULT_STYLES = { actions: DEFAULT_ACTIONS_STYLE };
const DEFAULT_CONTROLS = {
  upIcon: <Icon icon="expand_less" className="Font18" />,
  downIcon: <Icon icon="expand_more" className="Font18" />,
};

const mergeStyles = styles => {
  if (!styles) return DEFAULT_STYLES;

  const merge = currentStyles => ({
    ...currentStyles,
    actions: {
      ...DEFAULT_ACTIONS_STYLE,
      ...currentStyles?.actions,
    },
  });

  return transformSemanticConfig(styles, merge);
};

const mergeControls = controls => {
  if (controls === undefined) return DEFAULT_CONTROLS;
  if (!controls || typeof controls !== 'object') return controls;

  return {
    ...DEFAULT_CONTROLS,
    ...controls,
  };
};

const InputNumber = forwardRef(({ styles, controls, ...props }, ref) => (
  <AntdInputNumber {...props} ref={ref} styles={mergeStyles(styles)} controls={mergeControls(controls)} />
));

InputNumber.displayName = 'InputNumber';

export default InputNumber;
