import React, { Fragment } from 'react';
import { purchaseMethodFunc } from 'src/components/pay/versionUpgrade/PurchaseMethodModal';
import { versionUpgradeModal } from 'src/components/pay/versionUpgrade/VersionUpgradeModal';
import PurchaseExpandPack from 'src/pages/Admin/components/PurchaseExpandPack';
import { getCurrentProject } from 'src/utils/project';

export default function UserCountLimitLink({ projectId }) {
  const { licenseType, version } = getCurrentProject(projectId, true);
  const isDevelopment = parseInt(version?.versionIdV2) === 0;

  if ([0, 2].includes(licenseType)) {
    return (
      <React.Fragment>
        <span>{_l('当前用户数已经达到限额')}</span>
        {window.platformENV.isPlatform && (
          <Fragment>
            <span>{_l('请去购买')}</span>
            <span
              className="ThemeColor Hand"
              onClick={() => {
                !window.platformENV.isOverseas
                  ? purchaseMethodFunc({ projectId })
                  : versionUpgradeModal({ projectId, type: 'user' });
              }}
            >
              {_l('付费版本')}
            </span>
          </Fragment>
        )}
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <span>{_l('当前用户数已经达到限额')}</span>
      {window.platformENV.isPlatform && !isDevelopment && (
        <Fragment>
          <span>{_l('，请')}</span>
          {!window.platformENV.isOverseas ? (
            <a href={`/admin/expansionserviceResign/${projectId}/user`} target="_self">
              {_l('购买用户包')}
            </a>
          ) : (
            <PurchaseExpandPack text={_l('调整您的座席数')} type="user" projectId={projectId} />
          )}
        </Fragment>
      )}
    </React.Fragment>
  );
}
