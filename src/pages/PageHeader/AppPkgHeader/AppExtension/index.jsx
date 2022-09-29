import React from 'react';
import { MdLink, VCenterIconText } from 'ming-ui';
import { isCanEdit } from '../../util';

export default ({ appId, permissionType, isLock }) => (
  <div className="appExtensionWrap">
    {!window.isPublicApp && isCanEdit(permissionType, isLock) && (
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
    <MdLink to={`/app/${appId}/role`}>
      <VCenterIconText className="appExtensionItem" icon={'group'} iconSize={20} text={_l('用户')} textSize={14} />
    </MdLink>
  </div>
);
