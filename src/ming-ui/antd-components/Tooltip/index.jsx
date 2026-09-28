import React, { cloneElement, forwardRef } from 'react';
import AntdTooltip from 'antd/es/tooltip';
import { transformSemanticConfig } from '../utils';

const DEFAULT_CONTAINER_STYLES = {
  fontWeight: 'bold',
  lineHeight: '18px',
  padding: '9px 12px',
};

const joinClassNames = (...classNames) => classNames.filter(Boolean).join(' ');

const getClassNames = classNames => {
  if (!classNames) {
    return {};
  }

  return typeof classNames === 'string' ? { root: classNames } : classNames;
};

const mergeRootClassName = classNames => {
  const mergeClassNames = currentClassNames => {
    const nextClassNames = getClassNames(currentClassNames);

    return {
      ...nextClassNames,
      root: joinClassNames('md-tooltip-overlay', nextClassNames.root),
    };
  };

  return transformSemanticConfig(classNames, mergeClassNames);
};

const mergeStyles = ({ styles, maxWidth }) => {
  const mergeCurrentStyles = currentStyles => {
    const nextStyles = currentStyles || {};
    const { body, ...restStyles } = nextStyles;

    return {
      ...restStyles,
      root: {
        maxWidth,
        maxHeight: 300,
        whiteSpace: 'pre-wrap',
        ...nextStyles.root,
      },
      container: {
        ...DEFAULT_CONTAINER_STYLES,
        ...body,
        ...nextStyles.container,
      },
    };
  };

  return transformSemanticConfig(styles, mergeCurrentStyles);
};

const Tooltip = forwardRef((props, ref) => {
  const {
    children,
    destroyOnHidden,
    type = 'var(--color-background-tooltip)',
    title,
    color,
    shortcut,
    maxWidth = 350,
    arrow,
    classNames,
    styles,
    ...restProps
  } = props;

  const renderTitle = () => {
    let content = title;
    if (!content) return null;

    // 如果有快捷键参数，则在 title 后面添加快捷键显示
    if (shortcut) {
      return (
        <span>
          {content}
          <span className="mLeft8 Alpha7">{shortcut}</span>
        </span>
      );
    }

    if (type === 'white') {
      return <div className="textBlack">{content}</div>;
    }

    return content;
  };

  return (
    <AntdTooltip
      {...restProps}
      ref={ref}
      arrow={arrow}
      color={type === 'white' ? 'white' : color || 'var(--color-background-tooltip)'}
      title={renderTitle()}
      classNames={mergeRootClassName(classNames)}
      styles={mergeStyles({ styles, maxWidth })}
      destroyOnHidden={destroyOnHidden ?? true}
    >
      {cloneElement(children)}
    </AntdTooltip>
  );
});

Tooltip.displayName = 'Tooltip';

export default Tooltip;
