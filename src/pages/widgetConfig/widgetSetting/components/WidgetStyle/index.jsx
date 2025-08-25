import React from 'react';
import { isSheetDisplay } from 'src/pages/widgetConfig/util';
import RelateStyle from './RelateStyle';
import SubListStyle from './SubListStyle';

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
