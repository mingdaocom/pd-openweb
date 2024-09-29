import React, { Fragment, Component } from 'react';
import ProcessRecordInfo from './ProcessRecordInfo';
import { Popup } from 'antd-mobile';
import cx from 'classnames';

export default props => {
  const { isModal, match } = props;
  const { className, visible, onClose } = props;

  if (isModal) {
    const { instanceId, workId } = props;
    return (
      <Popup
        className={cx('mobileModal full', className)}
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
      </Popup>
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
