import React, { forwardRef, useContext, useMemo } from 'react';
import AntdButton from 'antd/es/button';
import { ConfigContext } from 'antd/es/config-provider';
import cx from 'classnames';
import PropTypes from 'prop-types';
import './index.less';

const CSS_VARIABLE_COLOR_PATTERN = /^var\(\s*--[^,\s)]+(?:\s*,[\s\S]+)?\s*\)$/;
const TEXT_BORDERED_VARIANT = 'textBordered';
const DEFAULT_TEXT_BORDERED_STYLE = { border: '1px solid var(--color-border-primary)' };
const TEXT_BORDERED_STYLE = { border: '1px solid currentColor' };
const ELLIPSIS_CLASS_NAMES = { root: 'overflowHidden', content: 'ellipsis' };
const WIDE_STYLE = {
  '--hap-button-padding-inline': '32px',
  '--hap-button-padding-inline-sm': '22px',
  '--hap-button-padding-inline-lg': '32px',
};
const ANTD_BUTTON_COLORS = new Set([
  'default',
  'primary',
  'danger',
  'blue',
  'purple',
  'cyan',
  'green',
  'magenta',
  'pink',
  'red',
  'orange',
  'yellow',
  'volcano',
  'geekblue',
  'lime',
  'gold',
]);

export const isCssVariableColor = color => typeof color === 'string' && CSS_VARIABLE_COLOR_PATTERN.test(color.trim());

export const isCustomColor = color => {
  if (typeof color !== 'string' || !color.trim()) {
    return false;
  }

  return !ANTD_BUTTON_COLORS.has(color.trim());
};

export const getCustomColorStyle = (color, rootPrefixCls) => {
  if (!isCustomColor(color)) {
    return undefined;
  }

  const value = color.trim();
  const cssVarPrefix = `--${rootPrefixCls}-btn-`;

  // Ant Design cannot derive a palette from var(...), so provide its per-button color slots directly.
  return {
    [`${cssVarPrefix}color-base`]: value,
    [`${cssVarPrefix}color-hover`]: `color-mix(in srgb, ${value} 85%, white)`,
    [`${cssVarPrefix}color-active`]: `color-mix(in srgb, ${value} 85%, black)`,
    [`${cssVarPrefix}color-light`]: `color-mix(in srgb, ${value} 10%, transparent)`,
    [`${cssVarPrefix}color-light-hover`]: `color-mix(in srgb, ${value} 15%, transparent)`,
    [`${cssVarPrefix}color-light-active`]: `color-mix(in srgb, ${value} 20%, transparent)`,
    [`${cssVarPrefix}shadow`]: 'none',
  };
};

export const getCssVariableColorStyle = (color, rootPrefixCls) => {
  return isCssVariableColor(color) ? getCustomColorStyle(color, rootPrefixCls) : undefined;
};

export const mergeEllipsisClassNames = classNames => {
  const mergeClassNames = currentClassNames => ({
    ...currentClassNames,
    root: cx(ELLIPSIS_CLASS_NAMES.root, currentClassNames?.root),
    content: cx(ELLIPSIS_CLASS_NAMES.content, currentClassNames?.content),
  });

  return typeof classNames === 'function' ? info => mergeClassNames(classNames(info)) : mergeClassNames(classNames);
};

export const getEllipsisTitle = (ellipsis, title, children) => {
  if (!ellipsis || title !== undefined) return title;

  return typeof children === 'string' || typeof children === 'number' ? String(children) : undefined;
};

const Button = forwardRef(
  ({ children, classNames, color, ellipsis = false, title, variant, wide, style, ...props }, ref) => {
    const { getPrefixCls } = useContext(ConfigContext);
    const rootPrefixCls = getPrefixCls();
    const hasCustomColor = isCustomColor(color);
    const isTextBordered = variant === TEXT_BORDERED_VARIANT;
    const mergedClassNames = useMemo(
      () => (ellipsis ? mergeEllipsisClassNames(classNames) : classNames),
      [classNames, ellipsis],
    );
    const mergedStyle = useMemo(() => {
      if (!hasCustomColor && !isTextBordered && !wide) {
        return style;
      }

      return {
        ...(isTextBordered ? (color === 'default' ? DEFAULT_TEXT_BORDERED_STYLE : TEXT_BORDERED_STYLE) : {}),
        ...(hasCustomColor ? getCustomColorStyle(color, rootPrefixCls) : {}),
        ...(wide ? WIDE_STYLE : {}),
        ...style,
      };
    }, [color, hasCustomColor, isTextBordered, rootPrefixCls, style, wide]);

    return (
      <AntdButton
        {...props}
        ref={ref}
        classNames={mergedClassNames}
        color={hasCustomColor ? 'primary' : color}
        title={getEllipsisTitle(ellipsis, title, children)}
        variant={isTextBordered ? 'text' : hasCustomColor ? (variant ?? 'solid') : variant}
        style={mergedStyle}
      >
        {children}
      </AntdButton>
    );
  },
);

Button.displayName = 'Button';
Button.Group = AntdButton.Group;
Button.__ANT_BUTTON = AntdButton.__ANT_BUTTON;

Button.propTypes = {
  color: PropTypes.string,
  ellipsis: PropTypes.bool,
  style: PropTypes.object,
  variant: PropTypes.oneOf(['outlined', 'dashed', 'solid', 'filled', 'text', 'textBordered', 'link']),
  wide: PropTypes.bool,
};

export default Button;
