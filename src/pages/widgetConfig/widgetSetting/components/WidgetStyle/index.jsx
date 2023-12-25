import React from 'react';
import SubListStyle from './SubListStyle';

// 高级设置
export default function WidgetOperate(props) {
  const { data } = props;

  if (data.type === 34) {
    return <SubListStyle {...props} />;
  }

  return null;
}
