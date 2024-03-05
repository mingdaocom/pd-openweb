import React from 'react';
import SubListStyle from './SubListStyle';
import RelateStyle from './RelateStyle';

// 高级设置
export default function WidgetOperate(props) {
  const { data } = props;

  if (data.type === 29 && _.get(data, 'advancedSetting.showtype') === '2') {
    return <RelateStyle {...props} />;
  }

  if (data.type === 34) {
    return <SubListStyle {...props} />;
  }

  return null;
}
