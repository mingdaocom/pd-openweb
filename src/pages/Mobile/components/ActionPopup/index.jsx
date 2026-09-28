import React, { useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { MobileConfirmPopup, PopupWrapper } from 'ming-ui/antd-mobile-components';
import { useHistoryBackClose } from 'src/utils/platform/navigation/mobileNavigation';
import RenamePopup from './RenamePopup';

const ACTION_LAYER_ID = 'action-popup';
const DEFAULT_RENAME_PLACEHOLDER = _l('请输入名称');
const DEFAULT_DELETE_TITLE = _l('确定删除');
const DEFAULT_DELETE_DESCRIPTION = _l('删除后将不可恢复');
const POPUP_STOP_PROPAGATION_EVENTS = ['click', 'touchstart'];

const ACTIONS = [
  { key: 'rename', name: _l('重命名'), icon: 'rename_input' },
  { key: 'share', name: _l('分享'), icon: 'share' },
  { key: 'delete', name: _l('删除'), icon: 'trash', danger: true },
];

const ActionList = styled.div`
  padding: 0 18px 12px;
  background: var(--color-background-card);

  .actionItem {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 48px;
    padding: 0;
    border: 0;
    font: inherit;
    text-align: left;
    color: var(--color-text-primary);
    background: transparent;
    cursor: pointer;
  }

  .actionIcon {
    flex-shrink: 0;
    width: 20px;
    margin-right: 25px;
    font-size: 20px;
    color: var(--color-text-tertiary);
  }

  .actionName {
    overflow: hidden;
    flex: 1;
    min-width: 0;
    font-size: 15px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .danger {
    color: var(--color-error);
  }
`;

export default function ActionPopup({
  title,
  renamePlaceholder = DEFAULT_RENAME_PLACEHOLDER,
  deleteTitle = DEFAULT_DELETE_TITLE,
  deleteDescription = DEFAULT_DELETE_DESCRIPTION,
  manageHistory = true,
  onRename,
  onShare,
  onDelete,
  onClose,
}) {
  const [actionType, setActionType] = useState('menu');
  const [deleting, setDeleting] = useState(false);

  useHistoryBackClose({ visible: manageHistory, layerId: ACTION_LAYER_ID, onClose });

  const submitDelete = async () => {
    if (deleting) return;
    setDeleting(true);

    try {
      await onDelete();
      onClose();
    } catch {
      setDeleting(false);
    }
  };

  const handleSelect = action => {
    switch (action) {
      case 'rename':
      case 'delete':
        setActionType(action);
        break;
      case 'share':
        onShare();
        break;
    }
  };

  if (actionType === 'rename') {
    return <RenamePopup value={title} placeholder={renamePlaceholder} onSubmit={onRename} onClose={onClose} />;
  }

  if (actionType === 'delete') {
    return (
      <MobileConfirmPopup
        visible
        title={deleteTitle}
        subDesc={deleteDescription}
        confirmText={_l('删除')}
        confirmType="delete"
        onCancel={onClose}
        onConfirm={submitDelete}
      />
    );
  }

  return (
    <PopupWrapper
      visible
      title={title}
      headerType="withIcon"
      headerTitleAlign="left"
      stopPropagation={POPUP_STOP_PROPAGATION_EVENTS}
      onClose={onClose}
    >
      <ActionList>
        {ACTIONS.map(action => (
          <button key={action.key} type="button" className="actionItem" onClick={() => handleSelect(action.key)}>
            <Icon className={cx('actionIcon', { danger: action.danger })} icon={action.icon} />
            <span className={cx('actionName', { danger: action.danger })}>{action.name}</span>
          </button>
        ))}
      </ActionList>
    </PopupWrapper>
  );
}

ActionPopup.propTypes = {
  title: PropTypes.string.isRequired,
  renamePlaceholder: PropTypes.string,
  deleteTitle: PropTypes.string,
  deleteDescription: PropTypes.string,
  manageHistory: PropTypes.bool,
  onRename: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
