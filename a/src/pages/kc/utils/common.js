import { debounce } from 'lodash';
import { downloadFile } from 'src/util';
import qs from 'query-string';
import kcService from '../api/service';
import {
  NODE_TYPE,
  NODE_VISIBLE_TYPE,
  NODE_VIEW_TYPE,
  NODE_OPERATOR_TYPE,
  ROOT_PERMISSION_TYPE,
  EXECUTE_RESULT,
  EXECUTE_ERROR_MESSAGE,
  NODE_STATUS,
  PICK_TYPE,
} from '../constant/enum';
import { confirm, getParentId, getLocationType, getPermission, getParentName, isIE } from './index';
import addLinkFile from 'src/components/addLinkFile/addLinkFile.jsx';
import folderDg from 'src/components/kc/folderSelectDialog/folderSelectDialog';
import createShare from 'src/components/createShare/createShare';

function saveLastPos(root, folder) {
  if (typeof currentRoot !== 'object' && root !== 1) {
    return;
  }
  let rootNode;
  if (typeof currentRoot === 'object') {
    rootNode = {
      id: root.id,
      projectId: root.project ? root.project.projectId : '',
      name: root.name,
    };
  } else {
    rootNode = {
      id: null,
      parentId: null,
      name: _l('我的文件'),
    };
  }
  const uploadedPos = {
    rootFolder: rootNode,
    node: folder
      ? {
          id: folder.id,
          parendId: folder.parendId,
          name: folder.name,
          projectId: folder.projectId,
          position: folder.position,
        }
      : rootNode,
  };
  console.log('uploadedPos -> ', uploadedPos);
  safeLocalStorageSetItem('last_select_folder_pos_' + md.global.Account.accountId, JSON.stringify(uploadedPos));
  safeLocalStorageSetItem('last_select_pos_' + md.global.Account.accountId, JSON.stringify(uploadedPos));
}

/** 打开上传助手 */
export function handleOpenUploadAssistant(args) {
  const { currentFolder, currentRoot, kcUsage, isRecycle, addUsage, reloadList } = args;
  if (kcUsage && kcUsage.used >= kcUsage.total) {
    alert(_l('已达到本月上传流量上限'), 3);
    return;
  }
  let id = currentFolder && !_.isEmpty(currentFolder) ? currentFolder.id : undefined;
  const rootId = typeof currentRoot === 'object' ? currentRoot.id : undefined;
  if (rootId && !id) {
    id = rootId;
  }
  const uploadLocation = { parentId: id, rootId };
  if (currentFolder && !_.isEmpty(currentFolder)) {
    uploadLocation.position = currentFolder.position;
  } else if (typeof currentRoot === 'object') {
    uploadLocation.position = '/' + currentRoot.id;
  }
  if (!window.uploadAssistantWindow || window.uploadAssistantWindow.closed) {
    let url = '/apps/kcupload';
    if (window.navigator.userAgent.indexOf('MDClient') > -1 || window.navigator.userAgent.indexOf('Edge') > -1) {
      url = url + '?uploadLocation=' + encodeURIComponent(JSON.stringify(uploadLocation));
    }
    if (window.navigator.userAgent.indexOf('MDClient') > -1) {
      url = url + '&isMDClient=true';
    }
    const name = 'uploadAssistant';
    const iTop = (window.screen.availHeight - 660) / 2; // 获得窗口的垂直位置;
    const iLeft = (window.screen.availWidth - 930) / 2; // 获得窗口的水平位置;
    const options = 'width=930,height=598,toolbar=no,menubar=no,location=no,status=no,top=' + iTop + ',left=' + iLeft;
    window.uploadAssistantWindow = window.open(url, name, options);
  } else {
    window.uploadAssistantWindow.focus();
  }
  if (window.uploadAssistantWindow) {
    if (window.uploadAssistantWindow.setUploadLocation) {
      window.uploadAssistantWindow.setUploadLocation(uploadLocation);
    } else if (!isIE()) {
      window.uploadAssistantWindow.uploadLocation = uploadLocation;
    } else {
      window.clearTimeout(window.callSetUploadLocationTimeout);
      let callSetUploadLocationAcc = 0;
      const callSetUploadLocation = () => {
        window.callSetUploadLocationTimeout = setTimeout(() => {
          if (window.uploadAssistantWindow.setUploadLocation) {
            window.uploadAssistantWindow.setUploadLocation(uploadLocation);
            return;
          } else if (callSetUploadLocationAcc > 50) {
            return;
          }
          callSetUploadLocationAcc += 1;
          callSetUploadLocation();
        }, 100);
      };
      callSetUploadLocation();
    }
  }
  window.reloadNodeList = debounce((uploadRootId, uploadParentId, fsize) => {
    saveLastPos(currentRoot, currentFolder);
    if (isRecycle) {
      return;
    }
    if (id === uploadParentId && rootId === uploadRootId) {
      reloadList();
    }
    addUsage(fsize);
  }, 1000);
}

export function handleAddLinkFile(args) {
  const { isEdit, item, folder, root, performUpdateItem, reloadList } = args;
  const { id, rootId } = _.isEmpty(folder)
    ? typeof root === 'object'
      ? { id: root.id, rootId: root.id }
      : {}
    : folder;
  const location = { parentId: id, rootId };
  addLinkFile({
    callback: link => {
      const { linkName, linkContent } = link;
      const execTypeName = isEdit ? _l('保存') : _l('创建');
      let savePromise;
      if (!isEdit) {
        savePromise = kcService.addFile({
          name: linkName + '.url',
          originLinkUrl: linkContent,
          size: 0,
          parentId: location.parentId,
          rootId: location.rootId,
        });
      } else {
        savePromise = kcService.updateNode({
          id: item.id,
          name: linkName + '.url',
          newLinkUrl: linkContent,
        });
      }
      $.when(savePromise)
        .then(data => {
          alert(execTypeName + _l('成功'));
          if (isEdit && typeof data === 'object') {
            performUpdateItem(data);
            return;
          }
          reloadList();
        })
        .fail(() => {
          alert(execTypeName + _l('失败'), 3);
        });
    },
    location,
    isEdit,
    data: isEdit
      ? {
          id: item.id,
          name: item.name,
          originLinkUrl: item.originLinkUrl,
        }
      : undefined,
  })
}

/** 批量下载 */
export function handleBatchDownload(args) {
  const { list, selectedItems, root, folder, selectAll } = args;
  const fileName = getParentName(folder, root);
  const folderId = folder ? folder.id : undefined;

  if (selectAll) {
    const excludeNodeIds =
      list.size !== selectedItems.size
        ? list
            .filter(item => !selectedItems.some(selectedItem => selectedItem.id === item.id))
            .map(item => item.id)
            .toArray()
        : null;
    if (!_.isEmpty(folder)) {
      downloadOne(folderId, excludeNodeIds);
    } else {
      downloadAll(root, excludeNodeIds);
    }
  } else {
    const ids = selectedItems
      .map(item => item.id)
      .toArray()
      .join(',');
    batchDownload(ids, folderId, fileName);
  }
}

/** 弹出分享节点层 */
export function handleShareNode(item, updateKcNodeItem = () => {}) {
  import('src/components/shareAttachment/shareAttachment').then(share => {
    window.shareDialogObject = share.default(
      {
        attachmentType: 2,
        id: item.id,
        name: item.name,
        ext: item.ext ? '.' + item.ext : '',
        size: item.size,
        imgSrc: File.isPicture('.' + item.ext)
          ? item.previewUrl.indexOf('imageView2') > -1
            ? item.previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/2/w/490')
            : `${item.previewUrl}&imageView2/2/w/490`
          : undefined,
        node: item,
        isKcFolder: item.type === NODE_TYPE.FOLDER,
      },
      {
        performUpdateItem: visibleType => {
          if (visibleType) {
            item.visibleType = visibleType;
            item.isOpenShare = visibleType === NODE_VISIBLE_TYPE.PUBLIC;
            updateKcNodeItem(item);
          }
        },
      },
    );
  });
}

function downloadOne(id, excludeIds) {
  const excludeNodeIds = excludeIds && excludeIds.length ? excludeIds.join(',') : '';
  const url = md.global.Config.AjaxApiUrl + 'file/downKcFile?' + qs.stringify({ id, excludeNodeIds });
  window.open(downloadFile(url));
}

function downloadAll(root, excludeIds) {
  const excludeNodeIds = excludeIds && excludeIds.length ? excludeIds.join(',') : '';
  let rootType, rootId, fileName;
  if (typeof root === 'object') {
    rootType = PICK_TYPE.ROOT;
    rootId = root.id;
    fileName = root.name;
  } else {
    rootType = root;
    switch (rootType) {
      case PICK_TYPE.MY:
        fileName = _l('我的文件');
        break;
      case PICK_TYPE.RECENT:
        fileName = _l('最近使用');
        break;
      case PICK_TYPE.STARED:
        fileName = _l('星标文件');
        break;
    }
  }
  const url =
    md.global.Config.AjaxApiUrl + 'file/downKcFile?' + qs.stringify({ rootType, rootId, fileName, excludeNodeIds });
  window.open(downloadFile(url));
}

function batchDownload(ids, folderId, fileName) {
  const url = md.global.Config.AjaxApiUrl + 'file/downKcFile?' + qs.stringify({ ids, folderId, fileName });
  window.open(downloadFile(url));
}

/** 单条下载 */
export function handleDownloadOne(item, excludeIds) {
  if (item.viewType === NODE_VIEW_TYPE.LINK) {
    window.open(downloadFile(item.downloadUrl));
    return;
  }
  if (item && item.id) {
    downloadOne(item.id, excludeIds, item.versionId);
  }
}

/** 开始修改节点名称 */
// TODO 修改事件是jquery绑定的  最后统一处理
export function updateNodeName(item) {
  $('.nodeItem[data-id=' + item.id + ']')
    .find('.listNameEdit')
    .val(item.name)
    .show()
    .select()
    .siblings('.listName,.itemExt,.thumbnailName')
    .hide();
}

/**
 * [removeNode 删除、彻底删除通用]
 * @param  {[type]} nodeStatus [删除：NODE_STATUS.RECYCLED  彻底删除：NODE_STATUS.DELETED]
 */
export function handleRemoveNode(args) {
  const {
    list,
    nodeStatus,
    selectedItems,
    selectAll,
    totalCount,
    keywords,
    clearSelect,
    root,
    reloadList,
    folder,
    performRemoveItems,
  } = args;
  /* 列表为空不执行*/
  if (list.size === 0) {
    // setState({ selectAll: false });
    return false;
  }

  /* 单选但无权限操作*/
  if (selectedItems.size === 1) {
    const item = selectedItems.toArray()[0];
    const permission = getPermission(root);
    const isCreateUser = item.owner.accountId === md.global.Account.accountId;
    if (!permission && !isCreateUser) {
      alert('没有操作权限', 3);
      return false;
    }
  }

  /* 删除确认层*/
  const confirmTitle = nodeStatus === NODE_STATUS.RECYCLED ? _l('删除') : _l('彻底删除');
  const confirmMessage =
    nodeStatus === NODE_STATUS.RECYCLED
      ? '<span class="Font16"><span class="Bold">' +
        _l('删除文件') +
        '</span><div class="Font14 mTop10">' +
        _l('文件的引用和分享链接也将失效，确认删除？') +
        '</div><div class="Font14 mTop10 Gray_9">' +
        _l('您可以在该文件夹对应的回收站内找回') +
        '</div></span>'
      : '<span class="Font16"><span class="Bold">' +
        _l('彻底删除文件') +
        '</span><div class="Font14 mTop10">' +
        _l('文件的引用和分享链接也将失效，确认删除？') +
        '</div></span>';
  confirm('', confirmMessage, false, '', '', confirmTitle).then(() => {
    let message = '';
    const ids = selectedItems.map(item => item.id).toArray();
    const idsLength = selectAll ? totalCount : ids.length;
    let ajax;

    switch (nodeStatus) {
      case NODE_STATUS.RECYCLED:
        message = { success: _l('删除成功') };
        break;
      case NODE_STATUS.DELETED:
        message = { success: '彻底删除成功' };
        break;
    }

    if (selectAll) {
      // 全选
      ajax = kcService.removeNodeByParentId({
        parentId: getParentId(folder, root),
        locationType: getLocationType(folder, root),
        isPermanent: nodeStatus !== NODE_STATUS.RECYCLED,
        keywords,
        excludeNodeIds:
          list.size !== selectedItems.size
            ? list
                .filter(item => !selectedItems.some(selectedItem => selectedItem.id === item.id))
                .map(item => item.id)
                .toArray()
            : null,
      });
    } else {
      ajax = kcService.removeNode({
        ids,
        isPermanent: nodeStatus !== NODE_STATUS.RECYCLED,
      });
    }

    ajax
      .then(result => {
        const successIds = result[EXECUTE_RESULT.SUCCESS];
        const noRightIds = result[EXECUTE_RESULT.NO_RIGHT];

        /* 操作提示*/
        if (ids.length === noRightIds.length) {
          alert('无权操作');
        } else {
          alert(returnOperationTips(result, message).text);
        }

        /* 重新加载列表*/
        reloadList();
        /* 移除列表数据*/
        performRemoveItems(successIds);

        /* 清空选中*/
        clearSelect();
      })
      .fail(() => alert('操作失败，请稍后重试'), 3);
  });
}

/**
 * [moveOrCopyClick 移动到...或复制到...通用]
 * @param  {[type]} type [移动：NODE_OPERATOR_TYPE.MOVE  复制：NODE_OPERATOR_TYPE.COPY]
 */
export function handleMoveOrCopyClick(args, cb = () => {}) {
  const { type, rootId, folder, fromRoot } = args;
  const { selectedItems } = args;
  const selectedItemIds = selectedItems.map(item => item.id).toArray();
  const notCreateItems = selectedItems.find(item => item.owner.accountId !== md.global.Account.accountId);
  const isAppointRoot =
    type === NODE_OPERATOR_TYPE.MOVE &&
    ((rootId && notCreateItems) ||
      (typeof fromRoot === 'object' &&
        fromRoot.permission !== ROOT_PERMISSION_TYPE.OWNER &&
        fromRoot.permission !== ROOT_PERMISSION_TYPE.ADMIN &&
        notCreateItems));
  let getAppointRootPromise;
  if (isAppointRoot) {
    if (rootId) {
      getAppointRootPromise = kcService.getRootDetail(rootId);
    } else {
      getAppointRootPromise = $.when(fromRoot);
    }
  } else {
    getAppointRootPromise = $.Deferred().resolve();
  }

  getAppointRootPromise.then(root => {
    const rootNode =
      typeof fromRoot === 'object'
        ? {
            id: fromRoot.id,
            projectId: fromRoot.project ? fromRoot.project.projectId : '',
            name: fromRoot.name,
          }
        : {
            id: null,
            parentId: null,
            name: _l('我的文件'),
          };
    const appointFolder =
      typeof fromRoot === 'object' || fromRoot === 1
        ? {
            rootFolder: rootNode,
            node: folder
              ? {
                  id: folder.id,
                  parendId: folder.parendId,
                  name: folder.name,
                  projectId: folder.projectId,
                  position: folder.position,
                }
              : rootNode,
          }
        : undefined;
    folderDg({
      dialogTitle: type === NODE_OPERATOR_TYPE.MOVE ? _l('移动到') : _l('复制到'),
      isFolderNode: 1,
      selectedItems: selectedItemIds,
      appointRoot: root,
      appointFolder,
    }).then(result => {
      cb(result, type);
    });
  });
}

/**
 * [moveOrCopy 移动到...或复制到...通用]
 * @param  {[type]} result [result.type  result.node]
 * @param  {[type]} type   [移动：NODE_OPERATOR_TYPE.MOVE  复制：NODE_OPERATOR_TYPE.COPY]
 */
export function handleMoveOrCopy(options) {
  const { result, type, baseUrl, selectedItems, selectAll, list, keywords, folder, root, reloadList, clearSelect } =
    options;
  let message = '';
  const ids = selectedItems.map(item => item.id).toArray();
  // idsLength = selectAll ? totalCount : ids.length;
  let ajax = '';
  switch (type) {
    case NODE_OPERATOR_TYPE.MOVE:
      message = { success: _l('移动成功') };
      break;
    case NODE_OPERATOR_TYPE.COPY:
      message = { success: _l('复制成功') };
      break;
  }

  if (selectAll) {
    // 全选
    const args = {
      toId: result.node.id,
      toType: result.type,
      parentId: getParentId(folder, root),
      fromType: getLocationType(folder, root),
      keywords: keywords || '',
      excludeNodeIds:
        list.size !== selectedItems.size
          ? list
              .filter(item => !selectedItems.some(selectedItem => selectedItem.id === item.id))
              .map(item => item.id)
              .toArray()
          : null,
    };
    if (type === NODE_OPERATOR_TYPE.MOVE) {
      ajax = kcService.moveNodeByParentId(args);
    } else {
      ajax = kcService.copyNodeByParentId(args);
    }
  } else {
    const args = {
      ids,
      toId: result.node.id,
      toType: result.type,
    };
    if (type === NODE_OPERATOR_TYPE.MOVE) {
      ajax = kcService.moveNode(args);
    } else {
      ajax = kcService.copyNode(args);
    }
  }
  const key = Math.random().toString();
  alert({
    key,
    msg: _l('操作中…'),
    type: 3,
    timeout: 0,
  });
  ajax
    .then(data => {
      const successIds = data[EXECUTE_RESULT.SUCCESS];
      const noRightIds = data[EXECUTE_RESULT.NO_RIGHT];

      /* 操作提示*/
      window.destroyAlert(key);
      const operationTips = returnOperationTips(data, message);
      window.destroyAlert(key);
      if (ids.length === noRightIds.length) {
        alert(_l('操作成功（部分文件您无权操作）'), 3);
      } else if (operationTips.type === EXECUTE_RESULT.SUCCESS || operationTips.type === EXECUTE_RESULT.NO_RIGHT) {
        setTimeout(() => {
          console.log($('.mdAlertDialog .mdClose'));
          $('.mdAlertDialog .mdClose').click();
        }, 1000);
        createShare({
          linkURL:
            md.global.Config.WebUrl +
            baseUrl.replace(/^\//, '') +
            '/' +
            (result.type === 1
              ? 'my'
              : result.type === 2
              ? result.node.id
              : result.node.rootId
              ? result.node.position.slice(1)
              : result.node.position.replace(/\/.{8}(-.{4}){3}-.{12}/, 'my')),
          content: operationTips.text,
        });
      } else {
        alert(operationTips.text, 3);
      }

      if (type === NODE_OPERATOR_TYPE.MOVE) {
        /* 重新加载列表*/
        reloadList();
      } else {
        if (result.type === root || result.node.id === root.id || (folder && result.node.id === folder.id)) {
          /* 重新加载列表*/
          reloadList();
        }
      }

      /* 清空选中*/
      clearSelect();
    })
    .fail(() => alert(_l('操作失败，请稍后重试'), 3));
}

/* 批量操作提示*/
export function returnOperationTips(data, message = {}) {
  const result = {};
  const messages = $.extend(EXECUTE_ERROR_MESSAGE, message);
  const failIds = data[EXECUTE_RESULT.FAIL];
  const successIds = data[EXECUTE_RESULT.SUCCESS];
  const noRightIds = data[EXECUTE_RESULT.NO_RIGHT];
  const existNameIds = data[EXECUTE_RESULT.EXIST_NAME];
  const noExistPathIds = data[EXECUTE_RESULT.NO_EXIST_PATH];
  const noExistNodeIds = data[EXECUTE_RESULT.NO_EXIST_NODE];

  const failSize = failIds ? failIds.length : 0;
  const successSize = successIds ? successIds.length : 0;
  const noRightSize = noRightIds ? noRightIds.length : 0;
  const existNameSize = existNameIds ? existNameIds.length : 0;
  const noExistPathSize = noExistPathIds ? noExistPathIds.length : 0;
  const noExistNodeSize = noExistNodeIds ? noExistNodeIds.length : 0;

  if (failSize) {
    result.text = messages.fail;
    result.type = EXECUTE_RESULT.FAIL;
  } else if (
    (noRightSize && (existNameSize || noExistPathSize || noExistNodeSize)) ||
    (existNameSize && (noExistPathSize || noExistNodeSize)) ||
    (noExistPathSize && noExistNodeSize)
  ) {
    result.text = messages.error;
    result.type = EXECUTE_RESULT.FAIL;
  } else if (noRightSize) {
    result.text = messages.noRight;
    result.type = EXECUTE_RESULT.NO_RIGHT;
  } else if (existNameSize) {
    result.text = messages.existName;
    result.type = EXECUTE_RESULT.EXIST_NAME;
  } else if (noExistPathSize) {
    result.text = messages.noExistPath;
    result.type = EXECUTE_RESULT.NO_EXIST_PATH;
  } else if (noExistNodeSize) {
    result.text = messages.noExistNode;
    result.type = EXECUTE_RESULT.NO_EXIST_NODE;
  } else if (!successSize) {
    result.text = messages.fail;
    result.type = EXECUTE_RESULT.FAIL;
  } else {
    result.text = messages.success;
    result.type = EXECUTE_RESULT.SUCCESS;
  }
  return result;
}

/**
 * [restoreNode 还原]
 */
export function handleRestoreNode(args) {
  const { list, folder, root, selectedItems, selectAll, keywords, performRemoveItems, reloadList, clearSelect } = args;
  const confirmMessage = '<span class="Font16">' + _l('确认还原选中的文件？') + '</span>';
  confirm('', confirmMessage, false, '', '', _l('还原')).then(() => {
    const message = {
      success: _l('还原成功'),
      noExistPath: _l('原存储位置已不存在，还原到对应根目录下'),
    };
    let ajax = '';

    if (selectAll) {
      // 全选
      ajax = kcService.restoreNodeByParentId({
        parentId: getParentId(folder, root),
        locationType: getLocationType(folder, root),
        keywords,
        excludeNodeIds:
          list.size !== selectedItems.size
            ? list
                .filter(item => !selectedItems.some(selectedItem => selectedItem.id === item.id))
                .map(item => item.id)
                .toArray()
            : null,
      });
    } else {
      ajax = kcService.restoreNode({
        ids: selectedItems.map(item => item.id).toArray(),
      });
    }

    ajax
      .then(result => {
        const successIds = result[EXECUTE_RESULT.SUCCESS];
        const noExistPath = result[EXECUTE_RESULT.NO_EXIST_PATH];

        /* 操作提示*/
        alert(returnOperationTips(result, message).text);

        /* 重新加载列表*/
        reloadList();
        /* 移除列表数据*/
        performRemoveItems(successIds);
        performRemoveItems(noExistPath);

        /* 清空选中*/
        clearSelect();
      })
      .fail(() => alert(_l('操作失败，请稍后重试'), 3));
  });
}
