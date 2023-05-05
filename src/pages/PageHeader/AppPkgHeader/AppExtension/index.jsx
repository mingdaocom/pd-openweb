import React from 'react';
import { MdLink, VCenterIconText } from 'ming-ui';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util.js';

export default ({ appId, permissionType, isLock }) => (
  <div className="appExtensionWrap">
    {!window.isPublicApp && canEditApp(permissionType, isLock) && (
      <MdLink to={`/app/${appId}/workflow/${isLock}`}>
        <VCenterIconText
          className="appExtensionItem"
          icon={'workflow'}
          iconSize={20}
          text={_l('工作流')}
          textSize={14}
        />
      </MdLink>
    )}
    <MdLink to={`/app/${appId}/role`}>
      <VCenterIconText className="appExtensionItem" icon={'group'} iconSize={20} text={_l('用户')} textSize={14} />
    </MdLink>
  </div>
);
