import React, { Fragment, Component } from 'react';
import ProcessRecordInfo from './ProcessRecordInfo';
import { ModalWrap } from '../baseStyled';

export default props => {
  const { isModal, instanceId, workId, match } = props;
  const { className, visible, onClose } = props;

  if (isModal) {
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
            match={{params: { instanceId, workId }}}
            onClose={onClose}
          />
        )}
      </ModalWrap>
    );
  } else {
    return (
      <ProcessRecordInfo
        match={match}
        isModal={false}
      />
    );
  }
};
