import React, { useEffect } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import MobilePopup from 'ming-ui/components/MobilePopup';
import Back from 'mobile/components/Back';
import workflowPushSoket from 'mobile/components/socket/workflowPushSoket';
import { compatibleMDJS } from 'src/utils/project';
import ProcessRecordInfo from './ProcessRecordInfo';

export default props => {
  const { isModal, match } = props;
  const { className, visible, onClose, onSave } = props;

  useEffect(() => {
    if (isModal) return;
    workflowPushSoket();
  }, []);

  if (isModal) {
    if (!visible) return null;

    const { instanceId, workId } = props;
    return (
      <MobilePopup
        className={cx('processRecordInfoModal mobileModal full', className)}
        onClose={onClose}
        visible={visible}
        layerId={`processRecord-${instanceId}`}
      >
        {instanceId && (
          <ProcessRecordInfo isModal={true} instanceId={instanceId} workId={workId} onClose={onClose} onSave={onSave} />
        )}
        <Back icon="back" className="Fixed" style={{ bottom: 120 }} onClick={onClose} />
      </MobilePopup>
    );
  } else {
    const { instanceId, workId } = match.params;
    return (
      <ProcessRecordInfo
        className="processRecordInfoPage"
        isModal={false}
        instanceId={instanceId}
        workId={workId}
        onClose={() => {
          if (window.isMingDaoApp && location.pathname.includes('mobile/processRecord')) {
            compatibleMDJS('back', { closeAll: true });
            return;
          }

          if (window.isDingTalk && _.get(window, 'dd.biz.navigation')) {
            window.dd.biz.navigation.close({
              onFail: function () {
                window.mobileNavigateTo('/mobile/processMatters');
              },
            });
            return;
          }

          window.mobileNavigateTo('/mobile/processMatters');
        }}
        onSave={onSave}
      />
    );
  }
};
