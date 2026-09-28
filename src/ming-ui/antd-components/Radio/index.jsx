import React, { forwardRef } from 'react';
import AntdRadio from 'antd/es/radio';
import cx from 'classnames';
import PropTypes from 'prop-types';
import './index.less';

const RADIO_SIZE_TRANSFORMS = {
  small: 'scale(0.875)',
  middle: 'scale(1)',
  default: 'scale(1)',
  large: 'scale(1.38)',
};

const Radio = forwardRef(({ size = 'default', style, className, ...props }, ref) => (
  <AntdRadio
    {...props}
    ref={ref}
    className={cx('hap-radio-size', className)}
    style={{ '--hap-radio-size-transform': RADIO_SIZE_TRANSFORMS[size], ...style }}
  />
));

const RadioGroup = forwardRef(({ size = 'default', style, className, ...props }, ref) => (
  <AntdRadio.Group
    {...props}
    ref={ref}
    className={cx('hap-radio-group-size', className)}
    size={size === 'default' ? undefined : size}
    style={{ '--hap-radio-size-transform': RADIO_SIZE_TRANSFORMS[size], ...style }}
  />
));

Radio.displayName = 'Radio';
RadioGroup.displayName = 'RadioGroup';
Radio.Button = AntdRadio.Button;
Radio.Group = RadioGroup;
Radio.__ANT_RADIO = true;

Radio.propTypes = {
  size: PropTypes.oneOf(['small', 'middle', 'default', 'large']),
};

RadioGroup.propTypes = {
  size: PropTypes.oneOf(['small', 'middle', 'default', 'large']),
};

export default Radio;
