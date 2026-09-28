import React, { forwardRef } from 'react';
import AntdInput from 'antd/es/input';
import PropTypes from 'prop-types';

const RADIUS_STYLE = { borderRadius: 36 };

export const getInputStyle = (radius, style) => {
  if (!radius) return style;

  return { ...RADIUS_STYLE, ...style };
};

const Input = forwardRef(({ radius = false, style, ...props }, ref) => (
  <AntdInput {...props} ref={ref} style={getInputStyle(radius, style)} />
));

Input.displayName = 'Input';
Input.Group = AntdInput.Group;
Input.Search = AntdInput.Search;
Input.TextArea = AntdInput.TextArea;
Input.Password = AntdInput.Password;
Input.OTP = AntdInput.OTP;

Input.propTypes = {
  radius: PropTypes.bool,
};

export default Input;
