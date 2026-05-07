import React from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import './index.less';

const Button = ({
  type = 'primary', // 'primary' | 'text'
  disabled = false,
  loading = false,
  className,
  children,
  onClick,
  ...rest
}) => {
  const handleClick = e => {
    if (disabled || loading) return;
    onClick?.(e);
  };

  return (
    <div
      className={cx(
        'custom-btn',
        `custom-btn-${type}`,
        {
          'is-disabled': disabled,
          'is-loading': loading,
        },
        className,
      )}
      onClick={handleClick}
      {...rest}
    >
      {loading && <Icon icon="loading_button" />}
      <span className="btn-text">{children}</span>
    </div>
  );
};

export default Button;
