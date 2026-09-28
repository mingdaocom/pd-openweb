import React from 'react';
import { Modal } from 'ming-ui/antd-components';
import CreateAppEntryContent from './CreateAppEntryContent';

export default function CreateAppEntryDialog(props) {
  const { actions = [], showAi = true, projectId, onAiSubmit = () => {}, onClose = () => {} } = props;

  return (
    <Modal open title={_l('创建应用')} width={800} mask={{ closable: true }} keyboard onCancel={onClose}>
      <CreateAppEntryContent
        actions={actions}
        showAi={showAi}
        projectId={projectId}
        onAiSubmit={onAiSubmit}
        onClose={onClose}
      />
    </Modal>
  );
}
