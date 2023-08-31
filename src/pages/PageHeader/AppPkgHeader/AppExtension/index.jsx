import React, { useEffect, useState } from 'react';
import { MdLink, VCenterIconText } from 'ming-ui';
import { canEditApp, canEditData } from 'src/pages/worksheet/redux/actions/util.js';
import appManagementApi from 'src/api/appManagement';

export default ({ appId, permissionType, isLock }) => {
  const [roleEntryVisible, setRoleEntryVisible] = useState(true);

  useEffect(() => {
    if (!canEditData(permissionType) && !canEditApp(permissionType, isLock)) {
      appManagementApi.getAppRoleSetting({
        appId
      }).then(data => {
        const { appSettingsEnum } = data;
        setRoleEntryVisible(appSettingsEnum === 1);
      });
    }
  }, []);

  return (
    <div className="appExtensionWrap">
      {!window.isPublicApp && canEditApp(permissionType, isLock) && (
        <MdLink to={`/app/${appId}/workflow`}>
          <VCenterIconText
            className="appExtensionItem"
            icon={'workflow'}
            iconSize={20}
            text={_l('工作流')}
            textSize={14}
          />
        </MdLink>
      )}
      {roleEntryVisible && (
        <MdLink to={`/app/${appId}/role`}>
          <VCenterIconText className="appExtensionItem" icon={'group'} iconSize={20} text={_l('用户')} textSize={14} />
        </MdLink>
      )}
    </div>
  );
}
