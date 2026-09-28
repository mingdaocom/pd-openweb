import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { ROUTE_CONFIG } from 'src/pages/Admin/enum';
import { PERMISSION_ENUM } from 'src/utils/domain/security/permission';
import { checkPermission, getMyPermissions, hasPermission } from 'src/utils/services/security/permission';

export const canPurchase = ({ projectId, myPermissions = [] }) => {
  const permissionsExceptHr = Object.values(PERMISSION_ENUM)
    .map(item => parseInt(item))
    .filter(item => item);

  return projectId
    ? checkPermission(projectId, permissionsExceptHr)
    : hasPermission(myPermissions, permissionsExceptHr);
};

export const hasBackStageAdminAuth = ({ projectId, myPermissions = [] }) => {
  const permissionArr = Object.keys(ROUTE_CONFIG)
    .map(item => parseInt(item))
    .filter(item => item);
  return projectId ? checkPermission(projectId, permissionArr) : hasPermission(myPermissions, permissionArr);
};

export default function PermissionContainer(props) {
  const { children, projectId, needPermission } = props;
  const [permissionResult, setPermissionResult] = useState({});

  useEffect(() => {
    let isCurrent = true;

    getMyPermissions(projectId, false)
      .then(permissionIds => {
        if (!isCurrent) return;

        setPermissionResult({
          projectId,
          needPermission,
          hasAuth: hasPermission(permissionIds, needPermission),
        });
      })
      .catch(_.noop);

    return () => {
      isCurrent = false;
    };
  }, [projectId, needPermission]);

  const hasCurrentAuth =
    permissionResult.projectId === projectId &&
    _.isEqual(permissionResult.needPermission, needPermission) &&
    permissionResult.hasAuth;

  return hasCurrentAuth ? <React.Fragment>{children}</React.Fragment> : null;
}
