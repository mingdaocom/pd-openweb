import React from 'react';
import { Modal } from 'ming-ui/antd-components';
import BatchPrintErrorContent from './BatchPrintErrorContent';

export default function BatchPrintErrorModal({ templateName, recordNames, zIndex, onClose }) {
  return (
    <Modal
      open
      width={680}
      zIndex={zIndex}
      title={_l('批量打印：%0', templateName)}
      okText={_l('关闭')}
      cancelButtonProps={{ style: { display: 'none' } }}
      styles={{ header: { marginBottom: 8 } }}
      onOk={onClose}
      onCancel={onClose}
    >
      <BatchPrintErrorContent recordNames={recordNames} />
    </Modal>
  );
}
