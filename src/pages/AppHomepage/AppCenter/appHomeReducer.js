import React from 'react';
import { Dialog } from 'ming-ui';
import homeAppAjax from 'src/api/homeApp';
import appManagementAjax from 'src/api/appManagement';
import _ from 'lodash';

export const initialState = {
  groupsLoading: true,
  appsLoading: true,
  keywords: '',
  groups: [],
  apps: [],
  externalApps: [],
  aloneApps: [],
  markedApps: [],
  markedGroup: [],
  recentApps: [],
  ownedApps: [],
  //工作台状态
  dashboardLoading: true,
  platformSettingLoading: true,
  recentAppItems: [],
  projectGroupsLang: [], // 组织分组多语言
  appLang: [], // 应用多语言
};

function updateAppOfState(state, appId, update = data => data) {
  ['apps', 'markedApps', 'externalApps', 'aloneApps', 'activeGroupApps', 'recentApps', 'ownedApps'].forEach(key => {
    if (state[key]) {
      state[key] = state[key].map(app => (app.id === appId ? update(app) : app));
    }
  });
  return state;
}
function deleteAppOfState(state, appId) {
  [
    'apps',
    'markedApps',
    'externalApps',
    'aloneApps',
    'activeGroupApps',
    'recentApps',
    'recentAppItems',
    'ownedApps',
  ].forEach(key => {
    if (state[key]) {
      state[key] = state[key].filter(app => app.id !== appId);
    }
  });
  ['groups', 'markedGroup'].forEach(key => {
    if (state[key]) {
      state[key].forEach(group => {
        const hasDeletedApp = _.includes(group.appIds, appId);
        if (hasDeletedApp) {
          group.appIds = group.appIds.filter(id => id !== appId);
          group.count = group.appIds.length;
        }
      });
    }
  });
  return state;
}

function updateGroupOfState(state, groupId, update = data => data) {
  ['groups', 'markedGroup'].forEach(key => {
    if (state[key]) {
      state[key] = state[key].map(group => (group.id === groupId ? update(group) : group));
    }
  });
  return state;
}

export function reducer(state, action = {}) {
  let newState = { ...state };
  let newApp;
  switch (action.type) {
    case 'PROJECT_GROUPS_NAME_LANG':
      return { ...state, projectGroupsLang: action.data };
    case 'PROJECT_APP_LANG':
      return { ...state, appLang: action.data };
    case 'UPDATE_SETTING':
      return { ...state, origin: { ...state.origin, homeSetting: action.value } };
    case 'UPDATE_GROUPS_LOADING':
      return { ...state, groupsLoading: action.value, appsLoading: action.value === false ? false : state.appsLoading };
    case 'UPDATE_APPS_LOADING':
      return { ...state, appsLoading: action.value };
    case 'UPDATE_DASHBOARD_LOADING':
      return { ...state, dashboardLoading: action.value };
    case 'UPDATE_KEYWORDS':
      return { ...state, keywords: action.value };
    case 'UPDATE_GROUP_APPS':
      return {
        ...state,
        activeGroup: action.activeGroup,
        activeGroupApps: action.apps,
        apps: state.apps.length
          ? state.apps.map(app => ({
              ...app,
              ...(_.find(action.apps, { id: app.id }) || {}),
            }))
          : action.apps,
      };
    case 'UPDATE_MARK_APPS':
      const addedMarkedApps = action.addedData.map(item => ({
        ...(_.find(state.apps, { id: item.appId }) || {}),
        isMarked: item.isMark,
        ..._.pick(item, ['type', 'itemId', 'itemName', 'itemUrl']),
      }));
      const markedApps = state.markedApps
        .filter(
          item =>
            !_.find(action.delData, del =>
              !!del.type ? del.itemId === item.itemId : del.appId === item.id && del.itemId === item.itemId,
            ),
        )
        .concat(addedMarkedApps);

      const markedAppIds = markedApps.filter(item => !item.type).map(item => item.id);
      const markedItemIds = markedApps.filter(item => !!item.type).map(item => item.itemId);

      return {
        ...state,
        markedApps,
        apps: state.apps.map(app => ({ ...app, isMarked: _.includes(markedAppIds, app.id) })),
        recentApps: state.recentApps.map(app => ({ ...app, isMarked: _.includes(markedAppIds, app.id) })),
        recentAppItems: state.recentAppItems.map(item => ({
          ...item,
          isMarked: _.includes(markedItemIds, item.itemId),
        })),
      };
    case 'UPDATE_APP':
      return updateAppOfState({ ...state }, action.appId, app => ({
        ...app,
        ...action.value,
      }));
    case 'DELETE_APP':
      return deleteAppOfState({ ...state }, action.appId);
    case 'MARK_APP':
      const getSourceApps = () => {
        switch (action.groupType) {
          case 'external':
            return state.externalApps;
          case 'personal':
            return state.aloneApps;
          default:
            return state.apps;
        }
      };
      const markedData = action.isMark
        ? state.markedApps.concat({
            ..._.find(getSourceApps(), { id: action.appId }),
            ...action.itemData,
            isMarked: true,
          })
        : state.markedApps.filter(app =>
            !action.itemData.type ? !!app.type || app.id !== action.appId : app.itemId !== action.itemData.itemId,
          );
      const appIds = markedData.filter(item => !item.type).map(item => item.id);
      const itemIds = markedData.filter(item => !!item.type).map(item => item.itemId);

      const getUpdatedMarkedApps = originApps => {
        return originApps.map(app => ({ ...app, isMarked: _.includes(appIds, app.id) }));
      };

      return {
        ...state,
        markedApps: markedData,
        apps: getUpdatedMarkedApps(state.apps),
        recentApps: getUpdatedMarkedApps(state.recentApps),
        recentAppItems: state.recentAppItems.map(item => ({
          ...item,
          isMarked: _.includes(itemIds, item.itemId),
        })),
        activeGroupApps: getUpdatedMarkedApps(state.activeGroupApps || []),
        externalApps: getUpdatedMarkedApps(state.externalApps || []),
        aloneApps: getUpdatedMarkedApps(state.aloneApps || []),
        ownedApps: getUpdatedMarkedApps(state.ownedApps || []),
      };
    case 'COPY_APP':
      newApp = _.find(state.apps, { id: action.appId });
      if (!newApp) {
        return state;
      }
      newApp = { ...newApp, id: action.newAppId, name: _l('%0-复制', newApp.name), isNew: true, isMarked: false };
      return updateAppOfState({
        ...state,
        ...(state.activeGroup && action.groupId === state.activeGroup.id
          ? { activeGroupApps: state.activeGroupApps.concat(newApp) }
          : {}),
        ...(location.pathname.includes('/app/my/owned') ? { ownedApps: state.ownedApps.concat(newApp) } : {}),
        apps: state.apps.concat(newApp),
      });
    case 'ADD_APP':
      return updateAppOfState({
        ...state,
        ...(state.activeGroup && action.groupId === state.activeGroup.id
          ? { activeGroupApps: state.activeGroupApps.concat(action.app) }
          : {}),
        ...(location.pathname.includes('/app/my/owned') ? { ownedApps: state.ownedApps.concat(action.app) } : {}),
        apps: state.apps.concat(action.app),
      });
    case 'UPDATE_GROUP_OF_APP':
      newState = updateAppOfState(newState, action.appId, app => ({
        ...app,
        groupIds: action.isRemove
          ? _.uniq((app.groupIds || []).filter(gId => gId !== action.groupId))
          : _.uniq((app.groupIds || []).concat(action.groupId)),
      }));
      newState = updateGroupOfState(newState, action.groupId, group => ({
        ...group,
        appIds: action.isRemove
          ? _.uniq((group.appIds || []).filter(aId => aId !== action.appId))
          : _.uniq((group.appIds || []).concat(action.appId)),
        count: (group.count || 0) + (action.isRemove ? -1 : 1),
      }));
      return newState;
    case 'ADD_GROUP':
      return { ...state, groups: state.groups.concat(action.value) };
    case 'UPDATE_GROUP':
      newState = updateGroupOfState(
        {
          ...state,
          ...(state.activeGroup && action.groupId === state.activeGroup.id
            ? {
                activeGroup: {
                  ...state.activeGroup,
                  ...action.value,
                },
              }
            : {}),
        },
        action.groupId,
        group => ({
          ...group,
          ...action.value,
        }),
      );
      return newState;
    case 'MARK_GROUP':
      return updateGroupOfState(
        {
          ...state,
          markedGroup: _.uniqBy(
            action.isMarked
              ? state.markedGroup.concat(_.find(state.groups, { id: action.groupId })).filter(_.identity)
              : state.markedGroup.filter(g => g.id !== action.groupId),
            'id',
          ),
        },
        action.groupId,
        group => ({
          ...group,
          isMarked: action.isMarked,
        }),
      );
    case 'DELETE_GROUP':
      return updateGroupOfState({
        ...state,
        markedGroup: state.markedGroup.filter(g => g.id !== action.groupId),
        groups: state.groups.filter(g => g.id !== action.groupId),
      });
    case 'UPDATE_VALUES':
      return { ...state, ...action.values };
    case 'RESET_STATE':
      return action.value;
    case 'UPDATE_GROUPS':
      return { ...state, groups: action.value };
    case 'UPDATE_OWNED_APPS':
      return { ...state, ownedApps: action.value };
    default:
      console.error('no action type!');
      return { ...state };
  }
}

function handleDashboardOrAppResponse(dispatch, data, isDashboard) {
  if (
    _.every(
      [
        'markedApps',
        'externalApps',
        'aloneApps',
        'markedGroupIds',
        'apps',
        'personalGroups',
        'projectGroups',
        'recentAppIds',
        'recentAppItems',
        'markedAppItems',
      ].map(key => _.isEmpty((data || {})[key])),
    )
  ) {
    dispatch({
      type: 'UPDATE_DASHBOARD_LOADING',
      value: false,
    });
    dispatch({
      type: 'UPDATE_VALUES',
      values: {
        origin: data,
        keywords: '',
        apps: [],
        externalApps: [],
        aloneApps: [],
        markedApps: [],
        markedGroup: [],
        activeGroup: undefined,
        activeGroupApps: [],
        groups: [],
        noApps: true,
        recentApps: [],
        recentAppItems: [],
        markedAppItems: [],
      },
    });
    if (!isDashboard) {
      dispatch({
        type: 'UPDATE_APPS_LOADING',
        value: false,
      });
      dispatch({
        type: 'UPDATE_GROUPS_LOADING',
        value: false,
      });
    }
    return;
  }
  let groups = [...(data.projectGroups || []), ...(data.personalGroups || [])];
  const markedGroup = (data.markedGroupIds || []).map(id => _.find(groups, { id })).filter(_.identity);
  groups = groups.map(g => ({ ...g, isMarked: !!_.find(markedGroup, { id: g.id }) }));
  const recentApps = (data.recentAppIds || [])
    .map(item => {
      return (data.apps || []).filter(app => app.id === item)[0];
    })
    .filter(item => !!item);
  dispatch({
    type: 'UPDATE_VALUES',
    values: {
      origin: data,
      apps: data.apps || [],
      externalApps: data.externalApps || [],
      aloneApps: data.aloneApps || [],
      markedGroup,
      groups,
      noApps: false,
      recentApps,
      ...(isDashboard
        ? {
            markedApps: data.markedAppItems || [],
            recentAppItems: data.recentAppItems || [],
          }
        : {
            markedApps: data.markedApps || [],
            activeGroup: undefined,
            activeGroupApps: [],
          }),
    },
  });
  dispatch({
    type: 'UPDATE_DASHBOARD_LOADING',
    value: false,
  });
}

// 分组名称多语言
function getGroupsLangs(dispatch, projectId) {
  appManagementAjax.getProjectLangs({ projectId, type: 20 }).then(res => {
    dispatch({
      type: 'PROJECT_GROUPS_NAME_LANG',
      data: _.keyBy(
        res.filter(o => o.langType === getCurrentLangCode()),
        'correlationId',
      ),
    });
  });
}

// 应用名称多语言
function getAppLangs(dispatch, projectId, noCache = false) {
  if (md.global.Account.lang === md.global.Config.DefaultLang) {
    return;
  }

  homeAppAjax
    .myPlatformLang({
      projectId,
      noCache,
    })
    .then(data => {
      dispatch({
        type: 'PROJECT_APP_LANG',
        data: data,
      });
    });
}
export class CreateActions {
  constructor(props) {
    this.dispatch = props.dispatch;
    this.state = props.state;
    this.updateAppBelongGroups = this.updateAppBelongGroups.bind(this);
  }
  updateKeywords(keywords) {
    this.dispatch({
      type: 'UPDATE_KEYWORDS',
      value: keywords,
    });
  }
  loadDashboardInfo({ projectId, noCache }) {
    this.dispatch({
      type: 'UPDATE_DASHBOARD_LOADING',
      value: true,
    });
    if (projectId) {
      getAppLangs(this.dispatch, projectId, noCache);
      getGroupsLangs(this.dispatch, projectId);
    }
    if (window.dashboardAjax) {
      window.dashboardAjax.abort();
    }
    window.dashboardAjax = homeAppAjax.myPlatform({ projectId, containsLinks: true });
    window.dashboardAjax.then(data => {
      delete window.dashboardAjax;
      handleDashboardOrAppResponse(this.dispatch, data, true);
    });
  }
  loadAppAndGroups({ projectId, activeGroupType, activeGroupId, noGroupsLoading, noCache, isOwnedApp = false }) {
    if (!activeGroupId) {
      localStorage.removeItem(`latest_group_${md.global.Account.accountId}`);
    }
    if (!noGroupsLoading) {
      this.dispatch({
        type: 'UPDATE_GROUPS_LOADING',
        value: true,
      });
    }
    this.dispatch({
      type: 'UPDATE_APPS_LOADING',
      value: true,
    });
    this.dispatch({
      type: 'UPDATE_DASHBOARD_LOADING',
      value: true,
    });
    if (projectId === 'external') {
      projectId = undefined;
    }
    if (projectId) {
      getAppLangs(this.dispatch, projectId, noCache);
      getGroupsLangs(this.dispatch, projectId);
    }
    if (window.homeGetMyAppAjax) {
      window.homeGetMyAppAjax.abort();
    }
    window.homeGetMyAppAjax = homeAppAjax.getMyApp({ projectId, containsLinks: true });
    window.homeGetMyAppAjax.then(data => {
      delete window.homeGetMyAppAjax;
      handleDashboardOrAppResponse(this.dispatch, data);
      this.dispatch({
        type: 'UPDATE_GROUPS_LOADING',
        value: false,
      });
      if (!activeGroupId) {
        this.dispatch({
          type: 'UPDATE_GROUP_APPS',
          apps: [],
          activeGroup: undefined,
        });
        isOwnedApp
          ? this.loadOwnedApps({ projectId })
          : this.dispatch({
              type: 'UPDATE_APPS_LOADING',
              value: false,
            });
      } else {
        this.loadGroup({ activeGroupId, activeGroupType, projectId });
      }
    });
  }
  loadOwnedApps({ projectId }) {
    this.dispatch({
      type: 'UPDATE_APPS_LOADING',
      value: true,
    });
    homeAppAjax.getOwnedApp({ projectId, containsLinks: true }).then(data => {
      this.dispatch({
        type: 'UPDATE_OWNED_APPS',
        value: data,
      });
      this.dispatch({
        type: 'UPDATE_APPS_LOADING',
        value: false,
      });
    });
  }
  loadGroup({ activeGroupId, activeGroupType, projectId }) {
    safeLocalStorageSetItem(
      `latest_group_${md.global.Account.accountId}`,
      JSON.stringify({
        groupId: activeGroupId,
        groupType: activeGroupType,
        projectId,
      }),
    );

    this.dispatch({
      type: 'UPDATE_APPS_LOADING',
      value: true,
    });

    this.dispatch({
      type: 'UPDATE_GROUP_APPS',
      apps: [],
      activeGroup: {},
    });

    homeAppAjax.getGroup({ id: activeGroupId, groupType: activeGroupType, projectId }).then(data => {
      this.dispatch({
        type: 'UPDATE_GROUP_APPS',
        apps: data.apps,
        activeGroup: data,
      });
      this.dispatch({
        type: 'UPDATE_APPS_LOADING',
        value: false,
      });
    });
  }
  addGroup({ projectId, name, icon, groupType, cb = () => {} }) {
    homeAppAjax
      .addGroup({ projectId, name, icon, groupType })
      .then(({ id, status }) => {
        if (status === 1) {
          cb(status, id);
          this.dispatch({
            type: 'ADD_GROUP',
            value: {
              id,
              projectId,
              name,
              icon,
              groupType,
            },
          });
        } else {
          cb(status);
        }
      })
      .catch(cb);
  }
  editGroup({ id, projectId, name, icon, groupType, cb = () => {} }) {
    homeAppAjax
      .editGroup({ id, projectId, name, icon, groupType })
      .then(status => {
        cb(status);
        if (status === 1) {
          this.dispatch({
            type: 'UPDATE_GROUP',
            groupId: id,
            value: {
              name,
              icon,
              iconUrl: `${md.global.FileStoreConfig.pubHost.replace(/\/$/, '')}/customIcon/${icon}.svg`,
              groupType,
            },
          });
        }
      })
      .catch(cb);
  }
  deleteGroup({ id, projectId, groupType, cb = () => {} }) {
    homeAppAjax
      .deleteGroup({ id, projectId, groupType })
      .then(() => {
        cb();
        this.dispatch({
          type: 'DELETE_GROUP',
          groupId: id,
        });
      })
      .catch(cb);
  }
  markGroup({ id, isMarked, groupType, projectId, cb = () => {} }) {
    homeAppAjax
      .markedGroup({
        id,
        isMarked,
        groupType,
        projectId,
      })
      .then(() => {
        cb();
        this.dispatch({
          type: 'MARK_GROUP',
          groupId: id,
          isMarked,
        });
      })
      .catch(cb);
  }
  updateAppBelongGroups({ appId, editingGroup, isRemove }) {
    const args = {
      appId,
    };
    if (editingGroup.groupType === 0) {
      args.personalGroups = [editingGroup.id];
    } else {
      args.projectGroups = [editingGroup.id];
    }
    (isRemove ? homeAppAjax.removeToGroup : homeAppAjax.addToGroup)(args)
      .then(() => {
        this.dispatch({
          type: 'UPDATE_GROUP_OF_APP',
          isRemove,
          appId,
          groupId: editingGroup.id,
        });
      })
      .catch(() => {
        alert(_l('更新分组失败'), 2);
      });
  }
  updateApp({ appId, ...rest }) {
    this.dispatch({
      type: 'UPDATE_APP',
      appId,
      value: rest,
    });
  }
  saveApp(app, isUpdateExternalLink) {
    homeAppAjax
      .editAppInfo(app)
      .then(res => {
        if (isUpdateExternalLink) {
          res.data && this.updateApp(_.omit(app, 'projectId'));
          res.data ? alert(_l('设置链接成功')) : alert(_l('设置链接失败!'), 2);
        }
      })
      .catch(() => {
        alert(isUpdateExternalLink ? _l('设置链接失败！') : _l('更新应用失败！'), 2);
      });
  }
  deleteApp(para) {
    const oldState = _.cloneDeep(this.state);
    this.dispatch({
      type: 'DELETE_APP',
      appId: para.appId,
    });
    homeAppAjax
      .deleteApp({
        ...para,
        isHomePage: true,
      })
      .then(res => {
        if (!res.data) {
          return Promise.reject();
        }
      })
      .catch(() => {
        this.dispatch({
          type: 'RESET_STATE',
          value: oldState,
        });
        alert(_l('删除应用失败！'), 2);
      });
  }
  quitApp(para) {
    appManagementAjax.quitRole(para).then(res => {
      if (res.isRoleForUser) {
        if (res.isRoleDepartment) {
          this.dispatch({
            type: 'DELETE_APP',
            appId: para.appId,
          });
        } else {
          Dialog.confirm({
            title: <span style={{ color: '#f44336' }}>{_l('无法退出通过部门加入的应用')}</span>,
            description: _l('您所在的部门被加入了此应用，只能由应用管理员进行操作'),
            closable: false,
            removeCancelBtn: true,
            okText: _l('关闭'),
          });
        }
      } else {
        alert(_l('退出失败'), 2);
      }
    });
  }
  markApp(para) {
    homeAppAjax
      .markApp(_.omit(para, ['itemName', 'itemUrl', 'groupType']))
      .then(() => {
        this.dispatch({
          type: 'MARK_APP',
          appId: para.appId,
          isMark: para.isMark,
          groupType: para.groupType,
          itemData: { ..._.pick(para, ['type', 'itemId', 'itemName', 'itemUrl']) },
        });
        alert(para.isMark ? _l('收藏成功') : _l('已取消收藏'));
      })
      .catch(() => {
        alert(para.isMark ? _l('收藏失败！') : _l('取消收藏失败！'), 2);
      });
  }
  markApps(para) {
    homeAppAjax
      .markApps({ projectId: para.projectId, items: para.items.map(item => _.omit(item, 'itemName', 'itemUrl')) })
      .then(() => {
        this.dispatch({
          type: 'UPDATE_MARK_APPS',
          addedData: para.items.filter(item => item.isMark),
          delData: para.items.filter(item => !item.isMark),
        });
        alert(_l('设置成功'));
      })
      .catch(() => {
        alert(_l('设置失败！'), 2);
      });
  }
  copyApp({ id, groupId } = {}, newAppId) {
    this.dispatch({
      type: 'COPY_APP',
      appId: id,
      newAppId,
      groupId,
    });
  }
  createAppFromEmpty(para, cb = _.noop) {
    homeAppAjax
      .createApp(para)
      .then(res => {
        switch (res.state) {
          case 1:
            const data = res.data || {};
            this.dispatch({
              type: 'ADD_APP',
              app: data,
              groupId: para.groupId,
            });
            this.dispatch({
              type: 'UPDATE_GROUP_OF_APP',
              appId: data.id,
              groupId: para.groupId,
            });
            cb(data.id);
            break;
          case 3:
            alert(_l('目标分组不存在！'), 2);
            break;
          case 4:
            alert(_l('没有创建权限！'), 2);
            break;
          default:
            alert(_l('新建应用失败！'), 2);
            break;
        }
      })
      .catch(err => {
        !md.global.Config.IsLocal && alert(_l('新建应用失败！'), 2);
      });
  }
  updateAppSort({ sortType, appIds, projectId, groupId }) {
    const markedAppDisplay = _.get(this.state, 'origin.homeSetting.markedAppDisplay');
    if (!_.isUndefined(markedAppDisplay) && sortType === 1) {
      if (markedAppDisplay === 1) {
        projectId = undefined;
      } else if (markedAppDisplay === 0) {
        sortType = 7;
      }
    }
    homeAppAjax
      .updateAppSort({ sortType, appIds, projectId, groupId })
      .then(res => {
        if (res.data) {
          if (sortType === 6) {
            const newGroups = this.state.groups.map(g => (g.id === groupId ? { ...g, appIds } : g));
            this.dispatch({
              type: 'UPDATE_GROUPS',
              value: newGroups,
            });
          }
        } else {
          return Promise.reject();
        }
      })
      .catch(() => {
        alert(_l('更新应用排序失败！'), 2);
      });
  }
  editHomeSetting({ projectId, setting = {}, editingKey }) {
    const oldValue = _.get(this.state, 'origin.homeSetting');
    this.dispatch({ type: 'UPDATE_SETTING', value: setting });
    homeAppAjax
      .editHomeSetting({ projectId, ...setting })
      .then(data => {
        if (data) {
          if (editingKey === 'markedAppDisplay') {
            this.loadDashboardInfo({ projectId });
          }
        } else {
          return Promise.reject();
        }
      })
      .catch(() => {
        this.dispatch({ type: 'UPDATE_SETTING', value: oldValue });
        alert(_l('更新首页配置失败！'), 2);
      });
  }
  updateGroupSorts(sortedGroups, type) {
    this.dispatch({
      type: 'UPDATE_VALUES',
      values:
        type === 'star'
          ? {
              markedGroup: sortedGroups,
            }
          : { groups: this.state.groups.filter(g => g.groupType === 0).concat(sortedGroups) },
    });
  }
}
window.time = new Date().getTime();
