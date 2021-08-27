import React from 'react';
import { navigateTo } from 'src/router/navigateTo';
import { Icon } from 'ming-ui';
import { isCanEdit } from '../../util';

export default ({ appId, permissionType, isLock }) => (
  <div className="appExtensionWrap">
    {!window.isPublicApp && isCanEdit(permissionType, isLock) && (
      <div className="appExtensionItem" onClick={() => navigateTo(`/app/${appId}/workflow`)}>
        <Icon className="Font18" icon="workflow" />
        <span>{_l('工作流')}</span>
      </div>
    )}
    <div className="appExtensionItem" onClick={() => navigateTo(`/app/${appId}/role`)}>
      <Icon className="Font18" icon="group" />
      <span>{_l('用户')}</span>
    </div>
  </div>
);
