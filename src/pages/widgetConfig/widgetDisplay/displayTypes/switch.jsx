import React from 'react';
import { Checkbox } from 'ming-ui';
import { getAdvanceSetting } from '../../util';
import { get, head } from 'lodash';

export default function Switch({ data }) {
  const defaultValue = getAdvanceSetting(data, 'defsource');
  const isChecked = get(head(defaultValue), 'staticValue') === '1';
  return <Checkbox checked={isChecked} />;
}
