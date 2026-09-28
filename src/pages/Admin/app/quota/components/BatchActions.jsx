import React from 'react';
import { SvgIcon } from 'ming-ui';
import { Button, Modal } from 'ming-ui/antd-components';
import LimitModeInput from './LimitModeInput';

const renderResetDescription = ({ businessType, resetDescription, resetRows = [], selectedCount }) => {
  if (resetRows.length !== 1 || selectedCount > resetRows.length) return resetDescription;

  const app = resetRows[0].app || {};
  return (
    <div className="textPrimary WordBreak" style={{ lineHeight: '24px' }}>
      <span>{_l('确定将')}</span>
      <span
        className="mLeft8 mRight3"
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          background: app.appIconColor,
          width: 24,
          height: 24,
          borderRadius: 4,
          textAlign: 'center',
        }}
      >
        <SvgIcon url={app.appIconUrl} fill="#fff" size={18} className="mTop3" />
      </span>
      <span title={app.appName} className="mRight8">
        {app.appName}
      </span>
      <span>{businessType === 4 ? _l('的工作流执行数重置为0吗？') : _l('的已使用附件上传量重置为0吗？')}</span>
    </div>
  );
};

export default function BatchActions({
  loading,
  saveLoading,
  disabled,
  onSave,
  onCancel,
  businessType,
  resetLoading,
  batchEditVisible,
  batchSize,
  batchMax,
  globalUnit,
  onBatchSizeChange,
  onApplyBatchEdit,
  onCloseBatchEdit,
  resetVisible,
  resetDescription,
  selectedCount,
  resetRows,
  loadedCount,
  total,
  onConfirmReset,
  onCloseReset,
}) {
  const showCount = typeof loadedCount === 'number' && typeof total === 'number';
  const saveDisabled = loading || saveLoading || disabled;
  const cancelDisabled = loading || disabled;

  return (
    <React.Fragment>
      <div className="footer flexRow">
        <div className="footerActions flexRow">
          <Button type="primary" wide loading={saveLoading} disabled={saveDisabled} onClick={onSave}>
            {saveLoading ? _l('处理中') : _l('保存')}
          </Button>
          <Button wide disabled={cancelDisabled} onClick={onCancel}>
            {_l('取消')}
          </Button>
        </div>
        {showCount && <div className="listCount">{_l('已加载 %0 / 共 %1', loadedCount, total)}</div>}
      </div>
      <Modal
        open={batchEditVisible}
        width={480}
        title={_l('批量修改额度')}
        okText={_l('确认')}
        onOk={onApplyBatchEdit}
        onCancel={onCloseBatchEdit}
        okDisabled={typeof batchSize !== 'number'}
      >
        <div className="flexRow alignItemsCenter pTop16 pBottom16">
          <span className="mRight12">{_l('设置上限')}</span>
          <LimitModeInput
            className="batchLimitValue"
            businessType={businessType}
            value={batchSize}
            min={businessType === 3 ? 0 : 1}
            max={batchMax}
            unit={globalUnit}
            onChange={onBatchSizeChange}
          />
        </div>
      </Modal>
      <Modal
        open={resetVisible}
        width={480}
        title={businessType === 4 ? _l('重置工作流执行数') : _l('重置附件上传用量')}
        okText={resetLoading ? _l('处理中') : _l('重置')}
        confirmLoading={resetLoading}
        onOk={onConfirmReset}
        onCancel={onCloseReset}
      >
        <div className="pTop16 pBottom16">
          {renderResetDescription({ businessType, resetDescription, resetRows, selectedCount })}
        </div>
      </Modal>
    </React.Fragment>
  );
}
