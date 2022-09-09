import React from 'react';
import { Dialog } from 'ming-ui';
import {
  getMyApp,
  getGroup,
  addToGroup,
  removeToGroup,
  addGroup,
  editGroup,
  deleteGroup,
  markedGroup,
  editAppInfo,
  deleteApp,
  markApp,
  createApp,
  updateAppSort,
  editGroupSort,
  editHomeSetting,
} from 'src/api/homeApp';
import { quitRole } from 'src/api/appManagement';
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
};

function updateAppOfState(state, appId, update = data => data) {
  ['apps', 'markedApps', 'externalApps', 'aloneApps', 'activeGroupApps'].forEach(key => {
    if (state[key]) {
      state[key] = state[key].map(app => (app.id === appId ? update(app) : app));
    }
  });
  return state;
}
function deleteAppOfState(state, appId) {
  ['apps', 'markedApps', 'externalApps', 'aloneApps', 'activeGroupApps'].forEach(key => {
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
    case 'NO_APPS':
      return {
        ...state,
        keywords: '',
        origin: {},
        apps: [],
        externalApps: [],
        aloneApps: [],
        markedApps: [],
        markedGroup: [],
        activeGroup: undefined,
        activeGroupApps: [],
        groups: [],
        noApps: true,
      };
    case 'UPDATE_SETTING':
      return { ...state, origin: { ...state.origin, homeSetting: action.value } };
    case 'UPDATE_GROUPS_LOADING':
      return { ...state, groupsLoading: action.value, appsLoading: action.value === false ? false : state.appsLoading };
    case 'UPDATE_APPS_LOADING':
      return { ...state, loading: action.value === false ? false : state.loading, appsLoading: action.value };
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
    case 'UPDATE_APP':
      return updateAppOfState({ ...state }, action.appId, app => ({
        ...app,
        ...action.value,
      }));
    case 'DELETE_APP':
      return deleteAppOfState({ ...state }, action.appId);
    case 'MARK_APP':
      return updateAppOfState(
        {
          ...state,
          markedApps: action.isMark
            ? _.uniqBy(state.markedApps.concat(_.find(state.apps, { id: action.appId })).filter(_.identity), 'id')
            : state.markedApps.filter(app => app.id !== action.appId),
        },
        action.appId,
        app => ({ ...app, isMarked: action.isMark }),
      );
    case 'COPY_APP':
      newApp = _.find(state.apps, { id: action.appId });
      if (!newApp) {
        return state;
      }
      newApp = { ...newApp, id: action.newAppId, name: _l('%0-复制', newApp.name) };
      return updateAppOfState({
        ...state,
        ...(state.activeGroup && action.groupId === state.activeGroup.id
          ? { activeGroupApps: state.activeGroupApps.concat(newApp) }
          : {}),
        apps: state.apps.concat(newApp),
      });
    case 'ADD_APP':
      return updateAppOfState({
        ...state,
        ...(state.activeGroup && action.groupId === state.activeGroup.id
          ? { activeGroupApps: state.activeGroupApps.concat(action.app) }
          : {}),
        apps: state.apps.concat(action.app),
      });
    case 'UPDATE_GROUPS':
      return { ...state, groups: action.value };
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
      newState = updateGroupOfState(newState, action.groupId, group => ({
        ...group,
        ...action.value,
      }));
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
    default:
      console.error('no action type!');
      return { ...state };
  }
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
  loadAppAndGroups({ projectId, activeGroupType, activeGroupId, noGroupsLoading }) {
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
    if (projectId === 'external') {
      projectId = undefined;
    }
    if (window.homeGetMyAppAjax) {
      window.homeGetMyAppAjax.abort();
    }
    window.homeGetMyAppAjax = getMyApp({ projectId });
    window.homeGetMyAppAjax.then(data => {
      delete window.homeGetMyAppAjax;
      if (
        _.every(
          ['markedApps', 'externalApps', 'aloneApps', 'markedGroupIds', 'apps', 'personalGroups', 'projectGroups'].map(
            key => _.isEmpty((data || {})[key]),
          ),
        )
      ) {
        this.dispatch({
          type: 'NO_APPS',
        });
        this.dispatch({
          type: 'UPDATE_GROUPS_LOADING',
          value: false,
        });
        this.dispatch({
          type: 'UPDATE_APPS_LOADING',
          value: false,
        });
        return;
      }
      let groups = [...(data.projectGroups || []), ...(data.personalGroups || [])];
      const markedGroup = (data.markedGroupIds || []).map(id => _.find(groups, { id })).filter(_.identity);
      groups = groups.map(g => ({ ...g, isMarked: !!_.find(markedGroup, { id: g.id }) }));
      this.dispatch({
        type: 'UPDATE_GROUPS',
        value: groups,
      });
      this.dispatch({
        type: 'UPDATE_VALUES',
        values: {
          origin: data,
          apps: data.apps || [],
          externalApps: data.externalApps || [],
          aloneApps: data.aloneApps || [],
          markedApps: (data.markedApps || []).map(app => ({ ...app, isMarked: true })),
          markedGroup,
          activeGroup: undefined,
          activeGroupApps: [],
          noApps: false,
        },
      });
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
        this.dispatch({
          type: 'UPDATE_APPS_LOADING',
          value: false,
        });
      } else {
        this.loadGroup({ activeGroupId, activeGroupType, projectId });
      }
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
    getGroup({ id: activeGroupId, groupType: activeGroupType, projectId }).then(data => {
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
  addGroup({ projectId, name, icon, groupType, cb = () => { } }) {
    addGroup({ projectId, name, icon, groupType })
      .then(({ id, status }) => {
        if (status === 1) {
          cb();
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
      .fail(cb);
  }
  editGroup({ id, projectId, name, icon, groupType, cb = () => { } }) {
    editGroup({ id, projectId, name, icon, groupType })
      .then(status => {
        cb(status);
        if (status === 1) {
          this.dispatch({
            type: 'UPDATE_GROUP',
            groupId: id,
            value: {
              name,
              icon,
              iconUrl: `https://fp1.mingdaoyun.cn/customIcon/${icon}.svg`,
              groupType,
            },
          });
        }
      })
      .fail(cb);
  }
  deleteGroup({ id, projectId, groupType, cb = () => { } }) {
    deleteGroup({ id, projectId, groupType })
      .then(() => {
        cb();
        this.dispatch({
          type: 'DELETE_GROUP',
          groupId: id,
        });
      })
      .fail(cb);
  }
  markGroup({ id, isMarked, groupType, projectId, cb = () => { } }) {
    markedGroup({
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
      .fail(cb);
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
    (isRemove ? removeToGroup : addToGroup)(args)
      .then(() => {
        this.dispatch({
          type: 'UPDATE_GROUP_OF_APP',
          isRemove,
          appId,
          groupId: editingGroup.id,
        });
      })
      .fail(() => {
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
  saveApp(app) {
    editAppInfo(app)
      .then()
      .fail(() => {
        alert(_l('更新应用失败！'), 2);
      });
  }
  deleteApp(para) {
    const oldState = _.cloneDeep(this.state);
    this.dispatch({
      type: 'DELETE_APP',
      appId: para.appId,
    });
    deleteApp({
      ...para,
      isHomePage: true,
    })
      .then(res => {
        if (!res.data) {
          return $.Deferred().reject();
        }
      })
      .fail(() => {
        this.dispatch({
          type: 'RESET_STATE',
          value: oldState,
        });
        alert(_l('删除应用失败！'), 2);
      });
  }
  quitApp(para) {
    quitRole(para).then(res => {
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
    markApp({
      ...para,
      isHomePage: true,
    })
      .then(() => {
        this.dispatch({
          type: 'MARK_APP',
          appId: para.appId,
          isMark: para.isMark,
        });
        alert(_l('设置成功'));
      })
      .fail(() => {
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
    createApp(para)
      .then(data => {
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
      })
      .fail(err => {
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
    updateAppSort({ sortType, appIds, projectId, groupId })
      .then(res => {
        if (!res.data) {
          return $.Deferred().reject();
        }
      })
      .fail(() => {
        alert(_l('更新应用排序失败！'), 2);
      });
  }
  editHomeSetting({ projectId, displayType, exDisplay, markedAppDisplay, editingKey }) {
    const oldValue = _.get(this.state, 'origin.homeSetting');
    this.dispatch({
      type: 'UPDATE_SETTING',
      value: { displayType, exDisplay, markedAppDisplay },
    });
    editHomeSetting({ projectId, displayType, exDisplay, markedAppDisplay })
      .then(data => {
        if (data) {
          if (editingKey === 'markedAppDisplay') {
            this.loadAppAndGroups({ projectId, noGroupsLoading: true });
          }
        } else {
          return $.Deferred().reject();
        }
      })
      .fail(() => {
        this.dispatch({
          type: 'UPDATE_SETTING',
          value: oldValue,
        });
        alert(_l('更新首页配置失败！'), 2);
      });
  }
  updateGroupSorts(sortedGroups) {
    this.dispatch({
      type: 'UPDATE_VALUES',
      values: {
        markedGroup: sortedGroups,
      },
    });
  }
}
window.time = new Date().getTime();
