import React from 'react';
import { Dialog } from 'ming-ui';
import CreateAppEntryContent from './CreateAppEntryContent';

export default function CreateAppEntryDialog(props) {
  const { actions = [], showAi = true, projectId, onAiSubmit = () => {}, onClose = () => {} } = props;

  return (
    <Dialog visible title={_l('创建应用')} width={800} footer={null} onCancel={onClose}>
      <CreateAppEntryContent
        actions={actions}
        showAi={showAi}
        projectId={projectId}
        onAiSubmit={onAiSubmit}
        onClose={onClose}
      />
    </Dialog>
  );
}
