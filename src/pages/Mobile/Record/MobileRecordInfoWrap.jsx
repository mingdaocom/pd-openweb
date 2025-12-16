import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { handlePushState, handleReplaceState } from 'src/utils/project';
import { RecordInfoModal } from './index';

// 处理打开记录详情通过浏览器返回逐层关闭
export default function MobileRecordInfoWrap(props) {
  const [recordId, setRecordId] = useState(props.rowId);

  const onQueryChange = useCallback(() => {
    handleReplaceState('page', 'recordDetail', () => {
      setRecordId(undefined);
      if (props.updateMobileInfo) {
        props.updateMobileInfo({});
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener('popstate', onQueryChange);
    return () => {
      window.removeEventListener('popstate', onQueryChange);
    };
  }, [onQueryChange]);

  useEffect(() => {
    if (props.visible && props.rowId) {
      setRecordId(props.rowId);
      handlePushState('page', 'recordDetail');
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
