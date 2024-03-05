import React from 'react';
import RelateOperate from './RelateOperate';
import SubListOperate from './SubListOperate';
import RelateSearchOperate from './RelateSearchOperate';

// 高级设置
export default function WidgetOperate(props) {
  const { data } = props;
  const { type } = data;

  if (type === 29) {
    return <RelateOperate {...props} />;
  }

  if (type === 34) {
    return <SubListOperate {...props} />;
  }

  if (type === 51) {
    return <RelateSearchOperate {...props} />;
  }

  return null;
}
