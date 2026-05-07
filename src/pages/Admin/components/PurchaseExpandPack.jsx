import React from 'react';
import _ from 'lodash';
import { element, string } from 'prop-types';
import projectApi from 'src/api/project';
import { versionUpgradeModal } from 'src/components/pay/versionUpgrade/VersionUpgradeModal';
import { navigateTo } from 'src/router/navigateTo';

export default function PurchaseExpandPack(props) {
  const { className, text, type, projectId, routePath = 'expansionservice', extraParam, onClick } = props;
  const { version, licenseType } = _.find(md.global.Account.projects, item => item.projectId === projectId) || {};

  const handleClick = e => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    if (onClick && _.isFunction(onClick)) {
      onClick();
      return;
    }

    if (!window.platformENV.isOverseas) {
      navigateTo(`/admin/${routePath}/${projectId}/${type}${extraParam ? '/' + extraParam : ''}`);
    } else {
      if (['user', 'portalexpand'].includes(type)) {
        projectApi.getCurrentLicense({ projectId }).then(res => {
          if (res) {
            !res.isOffLine
              ? type === 'user'
                ? navigateTo(`/admin/${routePath}/${projectId}/${type}${extraParam ? '/' + extraParam : ''}`)
                : projectApi
                    .getExternalIsFirstSubscription({ projectId })
                    .then(res =>
                      res
                        ? navigateTo(`/admin/${routePath}/${projectId}/${type}${extraParam ? '/' + extraParam : ''}`)
                        : versionUpgradeModal({ projectId, type }),
                    )
              : versionUpgradeModal({ projectId, type, showOffLine: true });
          }
        });

        return;
      }

      versionUpgradeModal({ projectId, type });
    }
  };

  if (window.platformENV.isLocal) return null;

  if (
    window.platformENV.isOverseas &&
    ((licenseType === 0 && type !== 'recharge') ||
      (licenseType === 2 && ['user', 'portalexpand', 'storage', 'workflow', 'dataSync'].includes(type)))
  ) {
    return null;
  }

  if ([0, 2].includes(licenseType) && type === 'aggregationtable') {
    //免费版和试用版 不支持扩充聚合表
    return null;
  }

  if (parseInt(_.get(version, 'versionIdV2')) === 0 && ['user', 'portalexpand'].includes(type)) {
    //开发版不支持 成员、外部门户扩容
    return null;
  }

  return (
    <span className={`Normal colorPrimary Hand ${className}`} onClick={handleClick}>
      {text}
    </span>
  );
}

PurchaseExpandPack.prototypes = {
  className: string,
  text: element,
  type: string,
  projectId: string,
  routePath: string,
  extraParam: string,
};
