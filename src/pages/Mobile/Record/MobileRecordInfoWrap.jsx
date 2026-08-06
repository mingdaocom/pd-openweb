import React, { useEffect, useState } from 'react';
import useHistoryBackClose from 'src/utils/mobileNavigation';
import { RecordInfoModal } from './index';

// 处理打开记录详情通过浏览器返回逐层关闭
export default function MobileRecordInfoWrap(props) {
  const [recordId, setRecordId] = useState(props.rowId);
  const isOpen = !!props.visible && !!props.rowId && !!recordId;

  // 接管浏览器返回 → 关闭记录详情；嵌套时由全局栈按栈顶顺序响应
  useHistoryBackClose({
    visible: isOpen,
    layerId: 'page=recordDetail',
    onClose: () => {
      setRecordId(undefined);
      if (props.updateMobileInfo) {
        props.updateMobileInfo({});
      }
    },
  });

  useEffect(() => {
    if (props.visible && props.rowId) {
      setRecordId(props.rowId);
    }
  }, [props.rowId, props.visible]);

  return (
    <div>
      {!!recordId && props.visible && (
        <RecordInfoModal className="full" visible={!!recordId && props.visible} rowId={recordId} {...props} />
      )}
    </div>
  );
}
