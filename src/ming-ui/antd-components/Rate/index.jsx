import React, { useMemo, useState } from 'react';
import ConfigProvider from 'antd/es/config-provider';
import AntdRate from 'antd/es/rate';
import PropTypes from 'prop-types';

export default function Rate(props) {
  const {
    count = 5,
    score = 0,
    foregroundColor = 'var(--color-primary)',
    backgroundColor = 'var(--color-border-secondary)',
    callback = () => {},
    disabled = false,
    hover = () => false,
    hideTip,
    character,
    className = '',
    onClick,
    ...restProps
  } = props;
  const [hoverColor, setHoverColor] = useState('');
  const rateProps = { ...restProps };
  delete rateProps.type;
  const currentColor = hoverColor || foregroundColor;
  const value = Number(score) || 0;
  const rateClassName = ['mdRate', className].filter(Boolean).join(' ');
  const tooltips = useMemo(() => Array.from({ length: count }).map((item, index) => String(index + 1)), [count]);
  const theme = useMemo(
    () => ({
      components: {
        Rate: {
          starColor: currentColor,
          starBg: backgroundColor,
        },
      },
    }),
    [backgroundColor, currentColor],
  );

  return (
    <ConfigProvider theme={theme}>
      <AntdRate
        {...rateProps}
        className={rateClassName}
        count={count}
        value={value}
        disabled={disabled}
        tooltips={disabled || hideTip ? undefined : tooltips}
        character={character}
        onChange={callback}
        onClick={event => {
          event.stopPropagation();

          if (onClick) {
            onClick(event);
          }
        }}
        onHoverChange={index => {
          if (disabled) return;

          setHoverColor(index ? hover(index) || foregroundColor : '');
        }}
      />
    </ConfigProvider>
  );
}

Rate.propTypes = {
  foregroundColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  count: PropTypes.number,
  score: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  callback: PropTypes.func,
  disabled: PropTypes.bool,
  hover: PropTypes.func,
  hideTip: PropTypes.bool,
  character: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  type: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
};
