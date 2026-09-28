import _ from 'lodash';
import moment from 'moment';
import roleApi from 'src/api/role';
import versionApi from 'src/api/version';

let cachePermission = {};

export const FEATURE_PERMISSION = {
  CREATE_APP: 'cannotCreateApp',
  DELETE_APP: 'cannotDeleteApp',
  API_INTEGRATION: 'allowAPIIntegration',
  DATA_PIPELINE: 'allowDataPipeline',
  PLUGIN: 'allowPlugin',
  SUPER_SEARCH: 'allowSuperSearch',
  MINGO_BUILD_APP: 'allowMingoAppBuild',
  MINGO_DATA_QUERY: 'allowMingoDataQueryAndAnalysis',
  MINGO_OTHER_ASSISTANT: 'allowMingoAppOthers',
};

const FEATURE_PERMISSION_VALUES = Object.values(FEATURE_PERMISSION);
const INVERTED_FEATURE_PERMISSIONS = [FEATURE_PERMISSION.CREATE_APP, FEATURE_PERMISSION.DELETE_APP];

export const hasFeaturePermission = (projectId, feature) => {
  if (!projectId || !FEATURE_PERMISSION_VALUES.includes(feature)) return false;

  const project = _.find(_.get(md, 'global.Account.projects', []), { projectId });
  if (!project) return false;

  return INVERTED_FEATURE_PERMISSIONS.includes(feature) ? !project[feature] : !!project[feature];
};

const setCacheData = (projectId, data, version) => {
  cachePermission[projectId] = {
    data,
    time: moment().format('YYYY-MM-DD HH:mm:ss'),
    version,
  };
};

const syncGetVersion = projectId => {
  try {
    const data = versionApi.getVersion(
      { moduleType: 50, sourceId: projectId },
      { ajaxOptions: { sync: true }, silent: true },
    );
    return data ? data.version : '';
  } catch {
    return '';
  }
};

export const hasPermission = (userPermissionIds, needPermission) => {
  const needPermissions = _.isArray(needPermission) ? needPermission : [needPermission];

  return needPermissions.some(item => userPermissionIds.includes(item));
};

export const getMyPermissions = (projectId, isSync = true) => {
  const cache = cachePermission[projectId];
  let version = '';

  if (cache) {
    const cacheSource = () => (isSync ? cache.data || [] : Promise.resolve(cache.data || []));

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
  } catch {
    // 同步 XHR 网络异常时返回空权限，避免抛出 NetworkError 触发 ErrorBoundary
  }

  return [];
};

export const checkPermission = (projectId, needPermission) => {
  return hasPermission(getMyPermissions(projectId), needPermission);
};
