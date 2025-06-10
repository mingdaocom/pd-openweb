import React, { useState } from 'react';
import _ from 'lodash';
import { Input } from 'ming-ui';
import { formatNumberThousand } from 'src/utils/control';

export default function InputValue({ type, value, className, onChange, onBlur, placeholder }) {
  const [isEditing, setEditing] = useState(false);
  const parseValue = value => {
    const dealValue = [2, 10].includes(type)
      ? value.replace(/[^\d]/g, '')
      : value
          .replace(/[^-\d.]/g, '')
          .replace(/^\./g, '')
          .replace(/^-/, '$#$')
          .replace(/-/g, '')
          .replace('$#$', '-')
          .replace(/^-\./, '-')
          .replace('.', '$#$')
          .replace(/\./g, '')
          .replace('$#$', '.');
    if (dealValue === '.') return '';
    return dealValue;
  };
  const displayValue = value => {
    if (!value) return '';
    if (value === '-') return '-';
    value = value.replace(/,/g, '');
    let formatNumber = '';
    if (_.includes(value, '.')) {
      formatNumber = _.endsWith(value, '.')
        ? `${String(parseFloat(value))}.`
        : String(parseFloat(value).toFixed(value.split('.')[1].length));
    } else {
      formatNumber = String(parseFloat(value));
    }
    const dealValue = formatNumberThousand(formatNumber);
    return dealValue;
  };
  return isEditing ? (
    <Input
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={value => onChange(parseValue(value))}
      onBlur={e => {
        setEditing(false);
        if (onBlur) {
          onBlur(parseValue(e.target.value));
          return;
        }
        onChange(parseValue(e.target.value));
      }}
    />
  ) : (
    <Input
      style={{ borderColor: '#ddd' }}
      className={className}
      value={displayValue(value)}
      onFocus={() => setEditing(true)}
      placeholder={placeholder}
    />
  );
}
