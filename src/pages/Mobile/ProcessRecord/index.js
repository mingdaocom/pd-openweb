import React, { Component, Fragment, useEffect } from 'react';
import { Popup } from 'antd-mobile';
import cx from 'classnames';
import Back from 'mobile/components/Back';
import workflowPushSoket from 'mobile/components/socket/workflowPushSoket';
import { compatibleMDJS } from 'src/utils/project';
import ProcessRecordInfo from './ProcessRecordInfo';

export default props => {
  const { isModal, match } = props;
  const { className, visible, onClose } = props;

  useEffect(() => {
    if (isModal) return;
    workflowPushSoket();
  }, []);

  if (isModal) {
    if (!visible) return null;

    const { instanceId, workId } = props;
    return (
      <Popup className={cx('mobileModal full', className)} onClose={onClose} visible={visible}>
        {instanceId && <ProcessRecordInfo isModal={true} instanceId={instanceId} workId={workId} onClose={onClose} />}
        <Back icon="back" className="Fixed" style={{ bottom: 120 }} onClick={onClose} />
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
          if (window.isMingDaoApp && location.pathname.includes('mobile/processRecord')) {
            compatibleMDJS('back', { closeAll: true });
            return;
          }
          window.mobileNavigateTo('/mobile/processMatters');
        }}
      />
    );
  }
};
