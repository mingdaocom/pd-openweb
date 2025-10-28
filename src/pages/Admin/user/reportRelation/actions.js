﻿import _ from 'lodash';
import StructureController from 'src/api/structure';
import { getCurrentProject } from 'src/utils/project';
import Config from '../../config';

const COMPANY_FAKE_ACCOUNTID = '';

// 打开关闭节点折叠
export const OPEN_COLLAPSE = 'OPEN_COLLAPSE';
export const CLOSE_COLLAPSE = 'CLOSE_COLLAPSE';
// 添加实体
export const ADD_STRUCTURES = 'ADD_STRUCTURES';
export const REMOVE_STRUCTURE = 'REMOVE_STRUCTURE';
export const REPLACE_STRUCTURE = 'REPLACE_STRUCTURE';

// 替换相关的action
export const ADD_PARENT_CHILDREN = 'ADD_PARENT_CHILDREN';
export const REMOVE_PARENT_CHILDREN = 'REMOVE_PARENT_CHILDREN';
export const UPDATE_CURRENT_CHILDREN = 'UPDATE_CURRENT_CHILDREN';

export const FETCH_PARENT = 'FETCH_PARENT';

export const SUBORDINATES_REQUEST = 'SUBORDINATES_REQUEST';
export const SUBORDINATES_SUCCESS = 'SUBORDINATES_SUCCESS';
export const SUBORDINATES_FAILURE = 'SUBORDINATES_FAILURE';
// 更新下属数组
export const UPDATE_ENTITY_CHILDS = 'UPDATE_ENTITY_CHILDS';

// 更新高亮节点
export const CLEAR_HIGHLIGHT = 'CLEAR_HIGHLIGHT';
export const UPDATE_HIGHLIGHT = 'UPDATE_HIGHLIGHT';

export const UPDATE_IS_LOADING = 'UPDATE_IS_LOADING';
export const UPDATE_FIRST_LEVEL_LOADING = 'UPDATE_FIRST_LEVEL_LOADING';

const PAGE_SIZE = 20;

// 公司节点
export const initRoot = () => dispatch => {
  const project = getCurrentProject(Config.projectId, true);
  dispatch({
    type: ADD_STRUCTURES,
    payload: {
      source: [
        {
          projectId: Config.projectId,
          fullname: project.companyName,
          accountId: COMPANY_FAKE_ACCOUNTID,
        },
      ],
    },
  });
};

export const updateCollapse = (id = COMPANY_FAKE_ACCOUNTID, open = true) => ({
  type: open ? OPEN_COLLAPSE : CLOSE_COLLAPSE,
  payload: {
    id,
  },
});

export const addSubordinates =
  ({ id, accounts, callback }) =>
  (dispatch, getState) => {
    StructureController.addStructure({
      projectId: Config.projectId,
      isTop: id === COMPANY_FAKE_ACCOUNTID,
      parentId: id,
      accountIds: _.map(accounts, _ => _.accountId),
    }).then(res => {
      if (res && res.success) {
        const { failedAccountIds } = res;
        let successAccounts = accounts;
        if (failedAccountIds && failedAccountIds.length) {
          successAccounts = _.filter(
            accounts,
            account => failedAccountIds.findIndex(({ accountId }) => accountId === account.accountId) === -1,
          );

          alert(
            _l(
              '添加失败：%0',
              failedAccountIds
                .map(
                  ({ accountId, failMessage }) =>
                    _.find(accounts, account => account.accountId === accountId).fullname + failMessage,
                )
                .join(','),
            ),
            2,
          );
        }

        if (_.isElement(successAccounts)) return;

        const { users = {} } = getState().entities;
        const { subordinates = [], subTotalCount } = users[id] || {};
        callback && callback();
        // 添加实体
        dispatch({
          type: ADD_STRUCTURES,
          payload: {
            source: successAccounts,
          },
        });
        // 添加实体上下级
        if (id && subordinates.length !== subTotalCount) {
          dispatch(fetchSubordinates(id));
        } else {
          dispatch({
            type: UPDATE_ENTITY_CHILDS,
            payload: {
              id,
              source: successAccounts,
              totalCount: !id
                ? users[id].subTotalCount
                : users[id].subTotalCount + _.map(accounts, _ => _.accountId).length,
            },
          });
        }

        if (id) {
          _.map(accounts, _ => _.accountId).forEach(n => {
            dispatch(fetchSubordinates(n));
          });
        } else {
          dispatch(fetchRootSubordinates(''));
        }

        dispatch(updateCollapse(id));
      } else {
        alert(_l('操作失败'), 2);
      }
    });
  };

/**
 * 替换当前节点
 * @param { object } params
 * @param { object } params.account userModel
 * @param { string } params.replacedAccountId 替换的节点
 * @param { string } params.parentId 替换的节点的父节点 update children用
 */
export const replaceStructure =
  ({ account, parentId, replacedAccountId, callback }) =>
  dispatch => {
    const { accountId } = account;
    StructureController.replaceUserStructure({
      projectId: Config.projectId,
      replacedAccountId,
      accountId,
    }).then(res => {
      if (res) {
        const { accountId } = account;
        callback && callback();
        // 添加实体
        dispatch({
          type: ADD_STRUCTURES,
          payload: {
            source: [account],
          },
        });
        // 父实体修改
        // 删除
        dispatch({
          type: REMOVE_PARENT_CHILDREN,
          payload: {
            id: parentId,
            removeId: replacedAccountId,
          },
        });
        // 添加
        dispatch({
          type: ADD_PARENT_CHILDREN,
          payload: {
            id: parentId,
            addId: accountId,
          },
        });
        // 下属替换
        dispatch({
          type: UPDATE_CURRENT_CHILDREN,
          payload: {
            id: accountId,
            replacedAccountId,
          },
        });
        dispatch(fetchSubordinates(parentId));
      } else {
        alert(_l('操作失败'), 2);
      }
    });
  };

/**
 * 移除节点
 */
export const removeStructure =
  ({ parentId, accountId, callback }) =>
  dispatch => {
    StructureController.removeParentID({
      projectId: Config.projectId,
      accountId,
    }).then(res => {
      if (res) {
        callback && callback();
        // 父实体修改
        dispatch({
          type: REMOVE_PARENT_CHILDREN,
          payload: {
            id: parentId,
            removeId: accountId,
          },
        });
        // 实体集删除
        dispatch({
          type: REMOVE_STRUCTURE,
          payload: {
            id: accountId,
          },
        });
      } else {
        alert(_l('操作失败'), 2);
      }
    });
  };

export const fetchRootSubordinates =
  (parentId, pageIndex = 1) =>
  dispatch => {
    dispatch({ type: SUBORDINATES_REQUEST, payload: { id: parentId } });
    pageIndex <= 1 && dispatch({ type: UPDATE_IS_LOADING, payload: { data: true } });
    pageIndex > 1 && dispatch({ type: UPDATE_FIRST_LEVEL_LOADING, payload: { data: true } });
    return StructureController.pagedGetAccountList({
      projectId: Config.projectId,
      pageIndex,
      pageSize: PAGE_SIZE,
      parentId: parentId || '',
    }).then(
      ({ totalCount, pagedDatas: source }) => {
        dispatch({ type: ADD_STRUCTURES, payload: { source } });
        dispatch({
          type: UPDATE_ENTITY_CHILDS,
          payload: {
            id: parentId,
            source,
            pageIndex,
            moreLoading: false,
            totalCount,
          },
        });
        dispatch({ type: UPDATE_IS_LOADING, payload: { data: false } });
        dispatch({ type: UPDATE_FIRST_LEVEL_LOADING, payload: { data: false } });
      },
      error => {
        dispatch({ type: SUBORDINATES_FAILURE, payload: { id: parentId, error } });
        dispatch({ type: UPDATE_IS_LOADING, payload: { data: false } });
      },
    );
  };

export const fetchSubordinates =
  (parentId, pageIndex = 1) =>
  dispatch => {
    dispatch({ type: UPDATE_ENTITY_CHILDS, payload: { id: parentId, source: [], moreLoading: true } });
    return StructureController.pagedGetAccountList({
      projectId: Config.projectId,
      pageIndex,
      pageSize: PAGE_SIZE,
      parentId: parentId || '',
    }).then(({ pagedDatas: source, totalCount }) => {
      dispatch({ type: ADD_STRUCTURES, payload: { source } });
      dispatch({
        type: UPDATE_ENTITY_CHILDS,
        payload: { id: parentId, source, pageIndex, moreLoading: false, totalCount },
      });
      return source;
    });
  };

/**
 * 获取上司数组
 */
export const fetchParent =
  (id, isDirect = false) =>
  (dispatch, getState) => {
    return StructureController.getParentsByAccountId({
      accountId: id,
      projectId: Config.projectId,
      isDirect,
    }).then(parents => {
      if (parents && parents.length) {
        const parentIds = _.map(parents, p => p.accountId);
        parentIds.reverse().forEach(it => {
          dispatch(fetchSubordinates(it))
            .then(source => {
              const users = getState().entities.users;
              const accountIds = _.reduce(
                source,
                (result, { accountId }) => {
                  const subordinates = (users[accountId] || {}).subordinates;
                  return result.concat(subordinates || []);
                },
                [],
              );
              return accountIds;
            })
            .then(accountIds => {
              // 获取数据完后全部展开父节点
              _.forEach(parentIds.concat(accountIds), id => {
                dispatch(updateCollapse(id));
              });

              dispatch({
                type: UPDATE_HIGHLIGHT,
                payload: {
                  highLightId: id,
                  highLightRootId: parentIds[0],
                },
              });
            });
        });
      } else {
        dispatch({
          type: UPDATE_HIGHLIGHT,
          payload: {
            highLightId: id,
            highLightRootId: id,
          },
        });
      }
    });
  };

export const loadMore = (parentId, pageIndex) => dispatch => {
  if (parentId) {
    dispatch(fetchSubordinates(parentId, pageIndex));
  } else {
    dispatch(fetchRootSubordinates(parentId, pageIndex));
  }
};
