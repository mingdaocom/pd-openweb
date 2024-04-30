import React from 'react';
import SubListStyle from './SubListStyle';
import RelateStyle from './RelateStyle';
import { isSheetDisplay } from 'src/pages/widgetConfig/util';

// 高级设置
export default function WidgetOperate(props) {
  const { data } = props;

  if (isSheetDisplay(data)) {
    return <RelateStyle {...props} />;
  }

  if (data.type === 34) {
    return <SubListStyle {...props} />;
  }

  return null;
}
