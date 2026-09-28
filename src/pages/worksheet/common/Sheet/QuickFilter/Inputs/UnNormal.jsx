import React from 'react';
import { arrayOf, func, shape, string } from 'prop-types';
import { Select } from 'ming-ui/antd-components';

export default function UnNormal() {
  return <Select className="w100" disabled placeholder={_l('字段配置出错')} />;
}

UnNormal.propTypes = {
  control: shape({}),
  values: arrayOf(string),
  onChange: func,
};
