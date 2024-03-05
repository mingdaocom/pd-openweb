import React, { Fragment, useState, useEffect } from 'react';
import { Input } from 'antd';

export default function(props) {
  const { className, style, disabled, type, value, onChange } = props;
  const [name, setName] = useState(value);
  const Component = type === 'textArea' ? Input.TextArea : Input;

  useEffect(() => {
    setName(value);
  }, [value]);

  const handleChangeName = event => {
    if (value !== event.target.value) {
      onChange(event.target.value || undefined);
    }
  }

  return (
    <Component
      className={className}
      style={style}
      disabled={disabled}
      value={name}
      onChange={event => setName(event.target.value)}
      onBlur={handleChangeName}
      onKeyDown={event => {
        event.which === 13 && handleChangeName(event);
      }}
    />
  );
}
