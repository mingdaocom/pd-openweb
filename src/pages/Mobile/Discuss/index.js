import React, { Fragment, Component } from 'react';
import DiscussInfo from './DiscussInfo';
import { ModalWrap } from '../baseStyled';
import _ from 'lodash';

export default props => {
  const { isModal, match, appId, worksheetId, rowId, viewId, projectId } = props;
  const { className, visible, onClose, onAddCount = _.noop, originalData } = props;
  if (isModal) {
    return (
      <ModalWrap popup animationType="slide-up" className={className} onClose={onClose} visible={visible}>
        {rowId && (
          <DiscussInfo
            isModal={true}
            match={{ params: { appId, worksheetId, rowId, viewId } }}
            onClose={onClose}
            onAddCount={onAddCount}
            originalData={originalData}
            projectId={projectId}
          />
        )}
      </ModalWrap>
    );
  } else {
    return <DiscussInfo match={match} isModal={false} onAddCount={onAddCount} />;
  }
};
