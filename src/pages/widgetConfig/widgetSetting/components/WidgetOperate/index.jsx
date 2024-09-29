import React from 'react';
import RelateOperate from './RelateOperate';
import SubListOperate from './SubListOperate';
import RelateSearchOperate from './RelateSearchOperate';
import EmbedOperate from './EmbedOperate';
import AttachmentOperate from './AttachmentOperate';

// 高级设置
export default function WidgetOperate(props) {
  const { data } = props;
  const { type } = data;

  if (type === 14) {
    return <AttachmentOperate {...props} />;
  }

  if (type === 29) {
    return <RelateOperate {...props} />;
  }

  if (type === 34) {
    return <SubListOperate {...props} />;
  }

  if (type === 45) {
    return <EmbedOperate {...props} />;
  }

  if (type === 51) {
    return <RelateSearchOperate {...props} />;
  }

  return null;
}
