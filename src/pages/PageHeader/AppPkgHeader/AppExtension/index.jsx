import React from 'react';
import { navigateTo } from 'src/router/navigateTo';
import { Icon, VCenterIconText } from 'ming-ui';
import { isCanEdit } from '../../util';

export default ({ appId, permissionType, isLock }) => (
  <div className="appExtensionWrap">
    {!window.isPublicApp && isCanEdit(permissionType, isLock) && (
      <VCenterIconText
        className="appExtensionItem"
        onClick={() => navigateTo(`/app/${appId}/workflow`)}
        icon={'workflow'}
        iconSize={20}
        text={_l('工作流')}
        textSize={14}
      />
    )}
    <VCenterIconText
      className="appExtensionItem"
      onClick={() => navigateTo(`/app/${appId}/role`)}
      icon={'group'}
      iconSize={20}
      text={_l('用户')}
      textSize={14}
    />
  </div>
);
