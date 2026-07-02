import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import roleApi from 'src/api/role';
import versionApi from 'src/api/version';
import { PERMISSION_ENUM, ROUTE_CONFIG } from 'src/pages/Admin/enum';

let cachePermission = {};

const setCacheData = (projectId, data, version) => {
  cachePermission[projectId] = {
    data,
    time: moment().format('YYYY-MM-DD HH:mm:ss'),
    version,
  };
};

//获取权限版本
const syncGetVersion = projectId => {
  try {
    const data = versionApi.getVersion({ moduleType: 50, sourceId: projectId }, { ajaxOptions: { sync: true }, silent: true });
    return data ? data.version : '';
  } catch {
    return '';
  }
};

//校验权限--已有用户权限
export const hasPermission = (userPermissionIds, needPermission) => {
  let checkResult = false;

  if (_.isArray(needPermission)) {
    //要检查的权限是数组时，用户权限包含数组中任一项则符合条件
    checkResult = needPermission.some(item => userPermissionIds.includes(item));
  } else {
    checkResult = userPermissionIds.includes(needPermission);
  }

  return checkResult;
};

export const getMyPermissions = (projectId, isSync = true) => {
  const cache = cachePermission[projectId];
  let version = '';

  if (cache) {
    const cacheSource = () => {
      return isSync ? cache.data || [] : Promise.resolve(cache.data || []);
    };

    if (moment().diff(moment(cache.time), 'm') > 5) {
      if (isSync) {
        version = syncGetVersion(projectId);

        if (version === cache.version) {
          setCacheData(projectId, cache.data, version);
          return cacheSource();
        }
      }
    } else {
      return cacheSource();
    }
  }

  if (isSync && !version) {
    version = syncGetVersion(projectId);
  }

  if (!isSync) {
    return new Promise((resolve, reject) => {
      roleApi
        .getMyPermissions({ projectId })
        .then(res => {
          if (res) {
            setCacheData(projectId, res.permissionIds, version);
            resolve(res.permissionIds || []);
          } else {
            reject();
          }
        })
        .catch(reject);
    });
  }

  try {
    const res = roleApi.getMyPermissions({ projectId }, { ajaxOptions: { sync: true }, silent: true });

    if (res) {
      setCacheData(projectId, res.permissionIds, version);
      return res.permissionIds || [];
    }
  } catch (e) {
    // 同步 XHR 网络异常时返回空权限，避免抛出 NetworkError 触发 ErrorBoundary
  }

  return [];
};

//校验权限--需要获取权限
export const checkPermission = (projectId, needPermission) => {
  return hasPermission(getMyPermissions(projectId), needPermission);
};

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
  const [hasAuth, setHasAuth] = useState(false);

  useEffect(() => {
    const cache = cachePermission[projectId];
    let version = '';

    if (cache) {
      if (moment().diff(moment(cache.time), 'm') > 5) {
        version = syncGetVersion(projectId);

        if (version === cache.version) {
          setCacheData(projectId, cache.data, version);
          setHasAuth(hasPermission(cache.data || [], needPermission));
        }
      } else {
        setHasAuth(hasPermission(cache.data || [], needPermission));
      }
    } else {
      if (!version) {
        version = syncGetVersion(projectId);
      }

      roleApi
        .getMyPermissions({ projectId })
        .then(res => {
          if (res && res.permissionIds) {
            setCacheData(projectId, res.permissionIds, version);
            setHasAuth(hasPermission(res.permissionIds, needPermission));
          }
        })
        .catch(_.noop);
    }
  }, []);

  return hasAuth ? <React.Fragment>{children}</React.Fragment> : null;
}
