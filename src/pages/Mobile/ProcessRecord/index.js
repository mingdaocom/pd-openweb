import React, { Fragment, Component } from 'react';
import ProcessRecordInfo from './ProcessRecordInfo';
import { ModalWrap } from '../baseStyled';

export default props => {
  const { isModal, match } = props;
  const { className, visible, onClose } = props;

  if (isModal) {
    const { instanceId, workId } = props;
    return (
      <ModalWrap
        popup
        animationType="slide-up"
        className={className}
        onClose={onClose}
        visible={visible}
      >
        {instanceId && (
          <ProcessRecordInfo
            isModal={true}
            instanceId={instanceId}
            workId={workId}
            onClose={onClose}
          />
        )}
      </ModalWrap>
    );
  } else {
    const { instanceId, workId } = match.params;
    return (
      <ProcessRecordInfo
        isModal={false}
        instanceId={instanceId}
        workId={workId}
        onClose={() => {
          window.mobileNavigateTo('/mobile/processMatters');
        }}
      />
    );
  }
};
