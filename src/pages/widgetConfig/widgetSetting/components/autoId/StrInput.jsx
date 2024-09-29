import React, { Fragment, useEffect, useState } from 'react';
import { Input } from 'antd';
import AutoIcon from '../../../components/Icon';
import cx from 'classnames';

export default function StrInput({ rule, deleteRule, updateRule }) {
  const { controlId } = rule;
  const [status, setStatus] = useState('');
  const [tempValue, setValue] = useState(controlId);
  const getStyle = () => {
    if (status === 'error') {
      return {
        borderColor: '#f44336',
        boxShadow: '0 0 4px 1px rgba(244,67,54,.25)',
      };
    }
    return {};
  };

  useEffect(() => {
    setValue(controlId);
  }, []);

  const isError = status === 'error';
  return (
    <Fragment>
      <div className="header">
        <div className={cx('title ', { errorHint: isError })}>{isError ? _l('固定字符不能为空') : _l('固定字符')}</div>
        <AutoIcon className="deleteRuleIcon" type="delete" icon="delete_12" onMouseDown={deleteRule} />
      </div>
      <Input
        value={tempValue}
        style={getStyle()}
        onBlur={e => {
          const value = (e.target.value || '').substring(0, 64);
          if (!value) {
            setStatus('error');
          }
          setValue(value);
          updateRule({ controlId: value });
        }}
        onChange={e => {
          const value = e.target.value;
          if (value) {
            setStatus('');
          }
          setValue(value);
        }}
      />
    </Fragment>
  );
}
