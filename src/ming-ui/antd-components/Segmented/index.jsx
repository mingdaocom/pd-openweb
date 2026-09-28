import React, { forwardRef } from 'react';
import AntdSegmented from 'antd/es/segmented';
import cx from 'classnames';
import { transformSemanticConfig } from '../utils';

const DEFAULT_CLASS_NAMES = { label: 'flexRow alignItemsCenter justifyContentCenter' };
const DEFAULT_LABEL_STYLE = { fontWeight: 600 };
const DEFAULT_ICON_STYLE = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 };
const DEFAULT_STYLES = { icon: DEFAULT_ICON_STYLE, label: DEFAULT_LABEL_STYLE };

const mergeClassNames = classNames => {
  if (!classNames) return DEFAULT_CLASS_NAMES;

  const merge = currentClassNames => ({
    ...currentClassNames,
    label: cx(DEFAULT_CLASS_NAMES.label, currentClassNames?.label),
  });

  return transformSemanticConfig(classNames, merge);
};

const mergeStyles = styles => {
  if (!styles) return DEFAULT_STYLES;

  const merge = currentStyles => ({
    ...currentStyles,
    icon: {
      ...DEFAULT_ICON_STYLE,
      ...currentStyles?.icon,
    },
    label: {
      ...DEFAULT_LABEL_STYLE,
      ...currentStyles?.label,
    },
  });

  return transformSemanticConfig(styles, merge);
};

const Segmented = forwardRef(({ classNames, styles, ...props }, ref) => (
  <AntdSegmented {...props} ref={ref} classNames={mergeClassNames(classNames)} styles={mergeStyles(styles)} />
));

Segmented.displayName = 'Segmented';

export default Segmented;
