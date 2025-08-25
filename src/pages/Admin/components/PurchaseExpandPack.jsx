import React from 'react';
import _ from 'lodash';
import { element, string } from 'prop-types';
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
    navigateTo(`/admin/${routePath}/${projectId}/${type}${extraParam ? '/' + extraParam : ''}`);
  };

  if (md.global.Config.IsLocal) return null;

  if ([0, 2].includes(licenseType) && type === 'aggregationtable') {
    //免费版和试用版 不支持扩充聚合表
    return null;
  }

  if (parseInt(_.get(version, 'versionIdV2')) === 0 && ['user', 'portalexpand'].includes(type)) {
    //开发版不支持 成员、外部门户扩容
    return null;
  }

  return (
    <span className={`Normal ThemeColor Hand ${className}`} onClick={handleClick}>
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
