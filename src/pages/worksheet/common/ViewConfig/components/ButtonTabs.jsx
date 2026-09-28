import React from 'react';
import { Segmented } from 'ming-ui/antd-components';

function ButtonTabs(props) {
  const { value, disabled, data, className, style, onChange } = props;

  return (
    <Segmented
      block
      className={className}
      style={style}
      disabled={disabled}
      value={value}
      options={data.map(({ text, ...option }) => ({ ...option, label: text }))}
      onChange={onChange}
    />
  );
}

export default ButtonTabs;
