import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Modal } from 'ming-ui/antd-components';
import { useAutoFocus } from 'src/utils/platform/react/interaction';
import { VERSION_ACTION } from '../constants';

const DIALOG_WIDTH = 520;
const CONFIRM_ACTIONS = [VERSION_ACTION.UPGRADE, VERSION_ACTION.RESTORE, VERSION_ACTION.REJECT, VERSION_ACTION.APPROVE];

const noop = () => {};

const RejectReasonInput = styled.textarea`
  width: 100%;
  min-height: 96px;
  padding: 10px 12px;
  border: 1px solid var(--color-border-tertiary);
  border-radius: 4px;
  box-sizing: border-box;
  background-color: var(--color-background-input);
  color: var(--color-text-primary);
  font-size: 13px;
  line-height: 20px;
  resize: none;

  &:hover:not(:focus) {
    border-color: var(--color-text-disabled);
  }

  &:focus {
    border-color: var(--color-primary);
    outline: 0;
  }

  &::placeholder {
    color: var(--color-text-disabled);
  }
`;

const getDialogConfig = (action, version, batchCount) => {
  if (action === VERSION_ACTION.UPGRADE) {
    return {
      title: batchCount ? _l('立即升级 %0 个应用', batchCount) : _l('立即升级'),
      content: _l('升级后将立即执行发布更新，升级期间应用无法正常使用，完成后会推送结果。请确认此操作。'),
      confirmText: _l('确定'),
    };
  }

  if (action === VERSION_ACTION.RESTORE) {
    return {
      title: _l('还原至 %0 版本', (version?.versionNo || version?.version || '').replace(/^v/, '')),
      content: _l('确认后，将当前应用还原为该历史版本的应用结构，未发布的变更项将被丢弃，请谨慎操作。'),
      confirmText: _l('确认还原'),
    };
  }

  if (action === VERSION_ACTION.REJECT) {
    return {
      title: batchCount ? _l('驳回 %0 个应用', batchCount) : _l('驳回理由'),
      confirmText: _l('确定'),
    };
  }

  return {
    title: batchCount ? _l('通过 %0 个应用审核', batchCount) : _l('通过审核'),
    content: _l('通过后将进入待升级状态，可手动执行升级'),
    confirmText: _l('确定'),
  };
};

function ConfirmVersionActionDialogContent({ action, version, batchCount, confirmLoading, onClose, onConfirm }) {
  const rejectReasonRef = useRef(null);
  const [rejectReason, setRejectReason] = useState('');
  const isReject = action === VERSION_ACTION.REJECT;
  const config = getDialogConfig(action, version, batchCount);

  useAutoFocus(rejectReasonRef, isReject);

  return (
    <Modal
      open
      keyboard
      focusable={{ focusTriggerAfterClose: false }}
      zIndex={1100}
      width={DIALOG_WIDTH}
      title={config.title}
      cancelText={_l('取消')}
      okText={config.confirmText}
      confirmLoading={confirmLoading}
      onOk={() => onConfirm({ action, version, rejectReason })}
      onCancel={onClose}
    >
      {isReject ? (
        <RejectReasonInput
          ref={rejectReasonRef}
          value={rejectReason}
          rows={6}
          placeholder={_l('请填写应用审核不通过的理由')}
          onChange={event => setRejectReason(event.target.value)}
        />
      ) : (
        <div className="Font13 textPrimary">{config.content}</div>
      )}
    </Modal>
  );
}

export default function ConfirmVersionActionDialog({
  open = false,
  action = VERSION_ACTION.APPROVE,
  version = null,
  batchCount = 0,
  confirmLoading = false,
  onClose = noop,
  onConfirm = noop,
}) {
  if (!open) return null;

  return (
    <ConfirmVersionActionDialogContent
      action={action}
      version={version}
      batchCount={batchCount}
      confirmLoading={confirmLoading}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

ConfirmVersionActionDialogContent.propTypes = {
  action: PropTypes.oneOf(CONFIRM_ACTIONS).isRequired,
  version: PropTypes.shape({
    version: PropTypes.string,
    versionNo: PropTypes.string,
  }),
  batchCount: PropTypes.number.isRequired,
  confirmLoading: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

ConfirmVersionActionDialog.propTypes = {
  open: PropTypes.bool,
  action: PropTypes.oneOf(CONFIRM_ACTIONS),
  version: PropTypes.shape({
    version: PropTypes.string,
    versionNo: PropTypes.string,
  }),
  batchCount: PropTypes.number,
  confirmLoading: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
};
