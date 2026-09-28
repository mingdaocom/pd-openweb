import React, { forwardRef } from 'react';
import AntdCheckbox from 'antd/es/checkbox';
import cx from 'classnames';
import PropTypes from 'prop-types';
import './index.less';

const CHECKBOX_SIZE_TRANSFORMS = {
  small: 'scale(0.875)',
  middle: 'scale(1)',
  default: 'scale(1)',
  large: 'scale(1.125)',
};

const Checkbox = forwardRef(({ size = 'default', style, className, ...props }, ref) => (
  <AntdCheckbox
    {...props}
    ref={ref}
    className={cx('hap-checkbox-size', className)}
    style={{ '--hap-checkbox-size-transform': CHECKBOX_SIZE_TRANSFORMS[size], ...style }}
  />
));

const CheckboxGroup = forwardRef(({ size = 'default', style, className, ...props }, ref) => (
  <AntdCheckbox.Group
    {...props}
    ref={ref}
    className={cx('hap-checkbox-group-size', className)}
    style={{ '--hap-checkbox-size-transform': CHECKBOX_SIZE_TRANSFORMS[size], ...style }}
  />
));

Checkbox.displayName = 'Checkbox';
CheckboxGroup.displayName = 'CheckboxGroup';
Checkbox.Group = CheckboxGroup;
Checkbox.__ANT_CHECKBOX = true;

Checkbox.propTypes = {
  size: PropTypes.oneOf(['small', 'middle', 'default', 'large']),
};

CheckboxGroup.propTypes = {
  size: PropTypes.oneOf(['small', 'middle', 'default', 'large']),
};

export default Checkbox;
