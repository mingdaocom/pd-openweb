import React, { Fragment, useState } from 'react';
import { Input } from 'antd';
import Icon from 'src/components/Icon';
import cx from 'classnames';

export default function StrInput({ rule, deleteRule, updateRule }) {
  const { controlId } = rule;
  const [status, setStatus] = useState('');
  const getStyle = () => {
    if (status === 'error') {
      return {
        borderColor: '#f44336',
        boxShadow: '0 0 4px 1px rgba(244,67,54,.25)',
      };
    }
    return {};
  };

  const isError = status === 'error';
  return (
    <Fragment>
      <div className="header">
        <div className={cx('title ', { errorHint: isError })}>{isError ? _l('固定字符不能为空') : _l('固定字符')}</div>
        <Icon className="deleteRuleIcon" type="delete" icon="delete_12" onMouseDown={deleteRule} />
      </div>
      <Input
        value={controlId}
        style={getStyle()}
        onBlur={e => {
          const value = e.target.value;
          if (!value) {
            setStatus('error');
          }
        }}
        onChange={e => {
          const value = e.target.value;
          if (value) {
            setStatus('');
          }
          if (value.length < 64) {
            updateRule({ controlId: e.target.value });
          }
        }}
      />
    </Fragment>
  );
}
