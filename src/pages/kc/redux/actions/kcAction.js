import _ from 'lodash';
import kcService from '../../api/service';
import { navigateTo } from 'src/router/navigateTo';
import { NODE_SORT_TYPE, NODE_STATUS, PICK_TYPE, ROOT_PERMISSION_TYPE } from '../../constant/enum';
import { getDefaultSortType, getParentId, getRootByPath, getRootId, IdItem, validateFileName } from '../../utils';
import {
  handleAddLinkFile,
  handleBatchDownload,
  handleMoveOrCopy,
  handleMoveOrCopyClick,
  handleOpenUploadAssistant,
  handleRemoveNode,
  handleRestoreNode,
  handleShareNode,
} from '../../utils/common';
import { clearSelect } from './selectAction';

export function updateKcListElement(ele) {
  return {
    type: 'KC_UPDATE_LIST_ELEMENT',
    value: ele,
  };
}

export function changeFolder(path) {
  return (dispatch, getState) => {
    const kcState = getState().kc;
    const root = getRootByPath(path);
    if (root.type === -9999) {
      navigateTo(kcState.baseUrl + '/my');
      return;
    }
    dispatch({ type: 'KC_CLEAR_KC' });
    dispatch({
      type: 'KC_UPDATE_PATH',
      value: path,
    });
    dispatch(clearSelect());
    dispatch(updateRoot(path));
    if (root.isSearch) {
      dispatch(searchNodes(root.keywords));
    } else {
      dispatch(
        fetchKcNodes(path, undefined, () => {
          dispatch(triggerLoadMoreNodes());
        }),
      );
    }
  };
}

export function loadListById(id) {
  return dispatch => {
    dispatch({ type: 'KC_CLEAR_KC' });
    dispatch(clearSelect());
    dispatch(
      fetchKcNodes(undefined, id, () => {
        dispatch(triggerLoadMoreNodes());
      }),
    );
  };
}

export function fetchKcNodes(path, id, cb) {
  return (dispatch, getState) => {
    let type;
    const kcState = getState().kc;
    path = decodeURIComponent(path || kcState.path || '');
    const { keywords, skip, limit, sortBy, sortType } = kcState.params.toObject();
    let getNodeIdPromise = {};
    let status = NODE_STATUS.NORMAL;
    dispatch({
      type: 'KC_FETCH_NODES_START',
    });
    if (id) {
      getNodeIdPromise = { id };
      if (location.pathname.indexOf('recycled') > -1) {
        status = NODE_STATUS.RECYCLED;
      }
      if (location.pathname.indexOf('my') > -1) {
        type = PICK_TYPE.MY;
      } else {
        type = PICK_TYPE.ROOT;
      }
    } else {
      const root = getRootByPath(path);
      const { queryPath } = root;
      type = root.type;
      if (root.isRecycle) {
        status = NODE_STATUS.RECYCLED;
      }
      if (type === PICK_TYPE.MY) {
        getNodeIdPromise = queryPath ? kcService.getNodeByPath('/' + md.global.Account.accountId + queryPath) : {};
      } else if (type === PICK_TYPE.ROOT) {
        getNodeIdPromise = queryPath.indexOf('/') > 0 ? kcService.getNodeByPath('/' + path) : { id: queryPath };
      }
    }
    Promise.all([getNodeIdPromise]).then(([node]) => {
      if (!node) {
        return;
      }
      dispatch({
        type: 'KC_UPDATE_FOLDER',
        value: node && node.id && node.name && node.owner ? node : {},
      });
      kcService
        .getNodes({
          parentId: node.id,
          rootType: type,
          keywords,
          skip,
          limit,
          sortBy,
          sortType,
          status,
        })
        .then(data => {
          dispatch({
            type: 'KC_FETCH_NODES_SUCCESS',
            value: data.list,
          });
          dispatch({
            type: 'KC_UPDATE_TOTALCOUNT',
            value: data.totalCount,
          });
          setTimeout(() => {
            if (typeof cb === 'function') {
              cb(data);
            }
          }, 100);
        });
    });
  };
}

export function reloadList() {
  return dispatch => {
    dispatch({ type: 'KC_CLEAR_KC' });
    dispatch(
      fetchKcNodes(undefined, undefined, () => {
        dispatch(triggerLoadMoreNodes());
      }),
    );
  };
}

export function loadMoreKcNodes(cb = () => {}) {
  return (dispatch, getState) => {
    const kcState = getState().kc;
    const { params, isGlobalSearch } = kcState;
    const { keywords, skip, limit } = params.toObject();
    dispatch({
      type: 'KC_UPDATE_PARAMS',
      value: {
        skip: skip + limit,
      },
    });
    if (isGlobalSearch) {
      dispatch(globalSearch(keywords));
    } else {
      dispatch(fetchKcNodes(undefined, undefined, cb));
    }
  };
}

export function triggerLoadMoreNodes() {
  return (dispatch, getState) => {
    const kcState = getState().kc;
    const { kcListElement, list, totalCount } = kcState;
    if (!kcListElement) {
      return;
    }
    const el = kcListElement.querySelector('.kclistScrollContent .scroll-viewport');
    if (list.size < totalCount && el && el.scrollTop + $(el).height() + 40 > el.scrollHeight) {
      dispatch(loadMoreKcNodes());
    }
  };
}

export function searchNodes(keywords) {
  return dispatch => {
    dispatch({ type: 'KC_CLEAR_KC' });
    dispatch({
      type: 'KC_UPDATE_PARAMS',
      value: { keywords },
    });
    dispatch(
      fetchKcNodes(undefined, undefined, () => {
        dispatch(triggerLoadMoreNodes());
      }),
    );
  };
}

export function startGlobalSearch(keywords) {
  return dispatch => {
    dispatch({ type: 'KC_CLEAR_KC' });
    dispatch({
      type: 'KC_UPDATE_PARAMS',
      value: { keywords },
    });
    dispatch({
      type: 'KC_UPDATE_IS_GLOBAL_SEARCH',
      value: true,
    });
    dispatch(globalSearch(keywords));
  };
}

export function globalSearch(keywords) {
  return (dispatch, getState) => {
    const kcState = getState().kc;
    const { skip, limit, sortBy, sortType } = kcState.params.toObject();
    dispatch({
      type: 'KC_FETCH_NODES_START',
    });
    kcService
      .globalSearch({
        keywords,
        sortBy,
        sortType,
        skip,
        limit,
      })
      .then(data => {
        dispatch({
          type: 'KC_FETCH_NODES_SUCCESS',
          value: data.list,
        });
        dispatch({
          type: 'KC_UPDATE_TOTALCOUNT',
          value: data.totalCount,
        });
        dispatch(triggerLoadMoreNodes());
      });
  };
}

export function updateRoot(path) {
  return (dispatch, getState) => {
    const kcState = getState().kc;
    const root = getRootByPath(path);
    const { type, isRecycle, queryPath } = root;
    dispatch({
      type: 'KC_UPDATE_LIST_STATE',
      value: {
        isRecycle,
        isReadOnly: true,
      },
    });
    if (type !== PICK_TYPE.ROOT) {
      dispatch({
        type: 'KC_UPDATE_ROOT',
        value: type,
      });
    } else {
      if (kcState.currentRoot && kcState.currentRoot.id === queryPath.slice(0, 24)) {
        dispatch({
          type: 'KC_UPDATE_LIST_STATE',
          value: {
            isRecycle,
            isReadOnly:
              kcState.currentRoot.permission && kcState.currentRoot.permission === ROOT_PERMISSION_TYPE.READONLY,
          },
        });
        return;
      }
      kcService.getRootDetail(queryPath.slice(0, 24)).then(node => {
        dispatch({
          type: 'KC_UPDATE_ROOT',
          value: node,
        });
        dispatch({
          type: 'KC_UPDATE_LIST_STATE',
          value: {
            isRecycle,
            isReadOnly: node.permission && node.permission === ROOT_PERMISSION_TYPE.READONLY,
          },
        });
      });
    }
  };
}

export function changeSortBy(newSortBy) {
  return (dispatch, getState) => {
    let newSortType;
    const kcState = getState().kc;
    const { sortBy, sortType } = kcState.params.toObject();
    if (newSortBy === sortBy) {
      newSortType = sortType === NODE_SORT_TYPE.ASC ? NODE_SORT_TYPE.DESC : NODE_SORT_TYPE.ASC;
    } else {
      newSortType = getDefaultSortType(newSortBy);
    }
    dispatch({ type: 'KC_CLEAR_KC' });
    dispatch({
      type: 'KC_UPDATE_PARAMS',
      value: {
        sortBy: newSortBy,
        sortType: newSortType,
      },
    });
    dispatch(
      fetchKcNodes(undefined, undefined, () => {
        dispatch(triggerLoadMoreNodes());
      }),
    );
  };
}

export function clearKc() {
  return {
    type: 'KC_CLEAR_KC',
  };
}

export function updateKcUsage() {
  return dispatch => {
    kcService.getUsage().then(usage => {
      dispatch({
        type: 'KC_FETCH_USAGE_SUCCESS',
        value: usage,
      });
    });
  };
}

/** 上传完成添加流量 */
export function handleAddUsage(fsize) {
  return (dispatch, getState) => {
    const kcState = getState().kc;
    const { kcUsage, currentRoot } = kcState;
    const isUsage =
      currentRoot === PICK_TYPE.MY ||
      (typeof currentRoot === 'object' &&
        (!currentRoot.projectId ||
          !md.global.Account.projects.filter(p => {
            return p.projectId === currentRoot.projectId;
          }).length));
    if (kcUsage && isUsage) {
      kcUsage.used += fsize;
      dispatch({
        type: 'KC_FETCH_USAGE_SUCCESS',
        value: kcUsage,
      });
    }
  };
}

export function openUploadAssistant() {
  return (dispatch, getState) => {
    const kcState = getState().kc;
    const { currentRoot, currentFolder, kcUsage, isRecycle } = kcState;
    handleOpenUploadAssistant({
      currentRoot,
      currentFolder,
      kcUsage,
      isRecycle,
      addUsage: fsize => {
        dispatch(handleAddUsage(fsize));
      },
      reloadList: () => {
        dispatch(reloadList());
      },
    });
  };
}

export function addLinkFile(isEdit = false, item = {}) {
  return (dispatch, getState) => {
    const kcState = getState().kc;
    const { currentRoot, currentFolder } = kcState;
    const args = {
      isEdit,
      item,
      folder: currentFolder,
      root: currentRoot,
      performUpdateItem: newItem => {
        dispatch(updateNodeItem(newItem));
      },
      reloadList: () => {
        dispatch(reloadList());
      },
    };
    handleAddLinkFile(args);
  };
}

export function addNewFolder(folderName, cb = () => {}) {
  return (dispatch, getState) => {
    const kcState = getState().kc;
    const { currentRoot, currentFolder } = kcState;
    const validateOut = {};
    if (validateFileName(folderName, true, validateOut)) {
      kcService
        .addFolder({
          name: folderName,
          rootId: getRootId(currentRoot),
          parentId: getParentId(currentFolder, currentRoot),
        })
        .then(newFolder => {
          if (!newFolder) {
            return Promise.reject();
          }
          alert(_l('新建成功'));
          dispatch({
            type: 'KC_ADD_NEWFOLDER_SUCCESS',
            value: newFolder,
          });
          cb(null);
        })
        .catch(() => {
          alert(_l('操作失败，请稍后重试'), 2);
        });
    } else {
      cb({
        validName: validateOut.validName,
      });
    }
  };
}

export function updateNodeItem(item) {
  return (dispatch, getState) => {
    item = new IdItem(item);
    const kcState = getState().kc;
    const { list, selectedItems } = kcState;
    const selectedItem = selectedItems.find(i => i.id === item.id);
    const index = list.findIndex(i => i.id === item.id);
    if (selectedItem) {
      dispatch({
        type: 'KC_UPDATE_SELECTED_ITEMS',
        value: selectedItems.remove(selectedItem).add(item),
      });
    }
    if (index > -1) {
      dispatch({
        type: 'KC_REPLACE_NODES',
        value: list.update(index, () => item),
      });
    }
  };
}

export function removeNodeItem(ids) {
  return (dispatch, getState) => {
    ids = _.isArray(ids) ? ids : [ids];
    const kcState = getState().kc;
    let { list, selectedItems } = kcState;
    const compareId = id => item => item && item.id === id;
    for (let i = 0; i < ids.length; i++) {
      list = list.remove(list.findIndex(compareId(ids[i])));
      selectedItems = selectedItems.remove(list.find(compareId(ids[i])));
    }
    dispatch({
      type: 'KC_UPDATE_SELECTED_ITEMS',
      value: selectedItems,
    });
    dispatch({
      type: 'KC_REPLACE_NODES',
      value: list,
    });
  };
}

export function removeNode(nodeStatus) {
  return (dispatch, getState) => {
    const kcState = getState().kc;
    const { list, totalCount, currentFolder, currentRoot, selectAll, selectedItems, params } = kcState;
    const { keywords } = params;
    handleRemoveNode({
      list,
      nodeStatus,
      selectedItems,
      selectAll,
      totalCount,
      keywords: keywords || '',
      root: currentRoot,
      folder: currentFolder,
      reloadList: () => {
        // dispatch(reloadList());
      },
      clearSelect: () => {
        dispatch(clearSelect());
      },
      performRemoveItems: ids => {
        dispatch(removeNodeItem(ids));
      },
    });
  };
}

export function shareNode(item) {
  return dispatch => {
    handleShareNode(item, newItem => {
      dispatch(updateNodeItem(newItem));
    });
  };
}

export function starNode(item) {
  return dispatch => {
    const isStared = !item.isStared;
    kcService
      .starNode({ id: item.id, star: isStared })
      .then(result => {
        if (!result) {
          return Promise.reject();
        }
        alert(isStared ? '标星成功' : '取消标星成功');
        item.isStared = isStared;
        dispatch(updateNodeItem(item));
      })
      .catch(() => alert('操作失败，请稍后重试'), 3);
  };
}

export function moveOrCopyClick(type, rootId) {
  return (dispatch, getState) => {
    const kcState = getState().kc;
    const { list, baseUrl, currentFolder, currentRoot, selectAll, selectedItems, params } = kcState;
    const { keywords } = params;
    handleMoveOrCopyClick(
      {
        type,
        rootId,
        folder: currentFolder,
        fromRoot: currentRoot,
        selectAll,
        baseUrl,
        selectedItems,
      },
      result => {
        handleMoveOrCopy({
          baseUrl,
          result,
          type,
          selectedItems,
          selectAll,
          list,
          keywords,
          folder: currentFolder,
          root: currentRoot,
          fromRoot: currentRoot,
          clearSelect: () => {
            dispatch(clearSelect());
          },
          reloadList: () => {
            dispatch(reloadList());
          },
        });
      },
    );
  };
}

export function restoreNode() {
  return (dispatch, getState) => {
    const kcState = getState().kc;
    const { list, selectedItems, selectAll, currentFolder, currentRoot } = kcState;
    const { keywords } = kcState.params;
    handleRestoreNode({
      list,
      folder: currentFolder,
      root: currentRoot,
      selectedItems,
      selectAll,
      keywords: keywords || '',
      reloadList: () => {
        // dispatch(reloadList());
      },
      clearSelect: () => {
        dispatch(clearSelect());
      },
      performRemoveItems: ids => {
        dispatch(removeNodeItem(ids));
      },
    });
  };
}

export function batchDownload() {
  return (dispatch, getState) => {
    const kcState = getState().kc;
    const { list, selectedItems, currentFolder, currentRoot, selectAll } = kcState;
    handleBatchDownload({
      list,
      selectAll,
      selectedItems,
      root: currentRoot,
      folder: currentFolder,
    });
  };
}

export function updateKcBaseUrl(baseUrl) {
  return {
    type: 'KC_UPDATE_KC_BASE_URL',
    value: baseUrl,
  };
}
