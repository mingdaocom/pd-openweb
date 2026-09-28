import React from 'react';
import { Button } from 'ming-ui/antd-components';

export default function QueryButton(props) {
  const { num, hasQuery, onClick } = props;
  const text = hasQuery ? _l('已查询') : _l('查询(%0)', num);

  return (
    <Button
      style={{ '--hap-control-height': '32px' }}
      type="primary"
      shape="round"
      className="mLeft16 Bold Font13"
      disabled={hasQuery}
      onClick={onClick}
    >
      {text}
    </Button>
  );
}
