import React from 'react';
import MobileInput from './MobileInput';
import MobileAttachment from './MobileAttachment';
import MobileOcr from './MobileOcr';
import MobileRelate from './MobileRelate';

// 移动端设置
export default function WidgetMobile(props) {
  const { data } = props;

  if (data.type === 2) {
    return <MobileInput {...props} />;
  }

  if (data.type === 14) {
    return <MobileAttachment {...props} />;
  }

  if (data.type === 29) {
    return <MobileRelate {...props} />;
  }

  if (data.type === 43) {
    return <MobileOcr {...props} />;
  }

  return null;
}
