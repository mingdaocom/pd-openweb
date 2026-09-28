import _ from 'lodash';
import attachmentAjax from 'src/api/attachment';
import folderDg from 'src/components/kc/folderSelectDialog/folderSelectDialog';
import saveToKnowledge from 'src/components/kc/saveToKnowledge/saveToKnowledge';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { addBehaviorLog, getFeatureStatus } from 'src/utils/services/project';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { PICK_TYPE } from '../../../constant/enum';
import { defaultWpsPreview, isWpsPreview } from '../../../utils';
import * as ajax from '../ajax';
import ACTION_TYPES from '../constant/actionTypes';
import { PREVIEW_ATTACHMENT_TYPE, PREVIEW_TYPE } from '../constant/enum';
import { formatAttachment } from '../utils/formatAttachment';
import { loadAttachment } from '../utils/loadAttachment';

export function getAttachmentEditDetail(params) {
  const {
    currentAttachment,
    controlId,
    recordId,
    worksheetId,
    projectId,
    dispatch,
    masterWorksheetId,
    masterRecordId,
    masterControlId,
    allowEdit,
    workId,
    instanceId,
    btnId,
  } = params;
  const isNewTab = location.pathname.indexOf('recordfile') > -1 || location.pathname.indexOf('rowfile') > -1;
  const featureType = getFeatureStatus(projectId, VersionProductType.editAttachment);
  const docEditEnabled = md.global.Config.EnableDocEdit || window.platformENV.isHap;

  if ((!isNewTab && featureType !== '1') || !allowEdit || !docEditEnabled) return;

  if (isWpsPreview(currentAttachment.ext, true) && !_.get(window, 'shareState.shareId')) {
    let attachmentShareId;

    if (!controlId && isNewTab) {
      attachmentShareId = location.pathname.match(/.*\/(recordfile|rowfile)\/(\w+)/)[2];
    }

    attachmentAjax
      .getAttachmentEditDetail({
        fileId: currentAttachment.sourceNode.fileID || currentAttachment.sourceNode.fileId,
        worksheetId,
        rowId: recordId,
        controlId,
        attachmentShareId,
        parentWorksheetId: masterWorksheetId,
        parentRowId: masterRecordId,
        foreignControlId: masterControlId,
        editType: 1, // 1:表单内附件 2:打印模板
        workId,
        instanceId,
        btnId,
      })
      .then(res => {
        dispatch({ type: 'ATTACHMENT_EDIT_DETAIL', wpsEditUrl: res.wpsEditUrl });
      })
      .catch(() => {
        dispatch({ type: 'ATTACHMENT_EDIT_DETAIL', wpsEditUrl: '' });
      });
  }
}

export function init(options, extra) {
  return (dispatch, getState) => {
    const { callFrom, showThumbnail, showAttInfo, hideFunctions, fromType, onClose } = options;
    let { attachments, index } = options;
    let currentAttachment;
    index = index || 0;
    dispatch({
      type: 'FILE_PREVIEW_SAVE_ORIGIN_ATTACHMENTS',
      attachments,
    });
    attachments = formatAttachment(attachments, callFrom);
    currentAttachment = attachments[index];
    dispatch({
      type: 'FILE_PREVIEW_INIT',
      index,
      attachments,
      showThumbnail,
      showAttInfo,
      hideFunctions,
      fromType,
      onClose,
      extra,
    });
    loadAttachment(currentAttachment, options)
      .then(attachment => {
        dispatch({
          type: 'FILE_PREVIEW_LOAD_FILE_SUCESS',
          attachment,
          index,
        });
        if (window.platformENV.isHap && defaultWpsPreview(attachment.ext)) {
          dispatch({
            type: 'CHANGE_PREVIEW_SERVICE',
            previewService: 'wps',
          });
        }
      })
      .catch(err => {
        dispatch({
          type: 'FILE_PREVIEW_LOAD_FILE_SUCESS',
          attachment: currentAttachment,
          index,
          error: err,
        });
      });

    getAttachmentEditDetail({
      currentAttachment,
      ...options,
      dispatch,
    });

    if (index > attachments.length - 3) {
      loadMoreAttachments(getState(), dispatch);
    }

    if (index < 3) {
      preLoadMoreAttachments(getState(), dispatch);
    }
  };
}

export function loading() {
  return {
    type: 'FILE_PREVIEW_CLOSE',
  };
}

export function error() {
  return {
    type: 'FILE_PREVIEW_ERROR',
    error: true,
  };
}

function loadMoreAttachments(state, dispatch, isPre) {
  const { extra, isLoadingMore, loadMoreFinished } = state;
  const loadAjaxName = isPre ? 'preLoadMoreAttachments' : 'loadMoreAttachments';

  if (extra && typeof extra[loadAjaxName] === 'function' && !isLoadingMore && !loadMoreFinished) {
    dispatch({
      type: 'FILE_PREVIEW_LOAD_MORE_START',
    });
    extra[loadAjaxName]()
      .then(data => {
        // if (data.length === 0) {
        //   // dispatch({
        //   //   type: 'FILE_PREVIEW_LOAD_MORE_OUT',
        //   // });
        // } else {
        dispatch({
          type: 'FILE_PREVIEW_LOAD_MORE_SUCESS',
          attachments: formatAttachment(data),
          isPre,
        });
        // }
      })
      .catch(_requestError4 => {
        alertIfNotUnauthorized(_requestError4, _l('加载更多失败'), 2);
      });
  }
}

function preLoadMoreAttachments(state, dispatch) {
  loadMoreAttachments(state, dispatch, true);
}

function changeIndexThunk(dispatch, getState, index, flag, extra = {}) {
  const state = getState();
  const options = { ...(state.extra || {}), ...extra };

  if (flag && flag === 'prev') {
    index = state.index - 1;
  } else if (flag && flag === 'next') {
    index = state.index + 1;
  }

  if (index > state.attachments.length - 3) {
    loadMoreAttachments(state, dispatch);
  }

  if (index < 3) {
    preLoadMoreAttachments(state, dispatch);
  }

  if (index < 0) {
    alert(_l('已经是第一个了'), 3);
    nothing();
    return;
  } else if (index >= state.attachments.length) {
    alert(_l('已经是最后一个了'), 3);
    nothing();
    return;
  }

  const currentAttachment = _.assign({}, state.attachments[index]);

  addBehaviorLog('previewFile', options.worksheetId, {
    fileId: _.get(state.attachments || [], `[${index}].sourceNode.fileID`),
    rowId: options.recordId,
  });
  getAttachmentEditDetail({ ...options, dispatch, currentAttachment: _.get(state.attachments || [], `[${index}]`) });
  dispatch({
    type: 'FILE_PREVIEW_CHANGE_INDEX',
    index,
  });
  dispatch({
    type: 'FILE_PREVIEW_LOAD_FILE_START',
  });
  loadAttachment(currentAttachment, options)
    .then(attachment => {
      dispatch({
        type: 'FILE_PREVIEW_LOAD_FILE_SUCESS',
        attachment,
        index,
      });
    })
    .catch(err => {
      dispatch({
        type: 'FILE_PREVIEW_LOAD_FILE_SUCESS',
        attachment: currentAttachment,
        index,
        error: err,
      });
    });
}

export function changeIndex(index, flag, extra) {
  return (dispatch, getState) => {
    setTimeout(() => {
      changeIndexThunk(dispatch, getState, index, flag, extra);
    }, 10);
  };
}

export function next(params = {}) {
  return changeIndex(0, 'next', params);
}

export function prev(params = {}) {
  return changeIndex(0, 'prev', params);
}

export function disableInited() {
  return {
    type: ACTION_TYPES.DISABLE_INITED,
  };
}

function nothing() {
  return {
    type: ACTION_TYPES.NOTHING,
  };
}

export function renameFile(value) {
  return (dispatch, getState) => {
    const state = getState();
    const index = state.index;
    const currentAttachment = state.attachments[index];
    const previewAttachmentType = currentAttachment.previewAttachmentType;

    if (previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.KC) {
      const { id, ext } = currentAttachment.sourceNode;
      ajax
        .renameKcFile(id, value, ext)
        .then(() => {
          currentAttachment.sourceNode.name = value;
          currentAttachment.name = value;
          alert(_l('修改成功'));
          // 修改文件名回掉
          if (state.extra && typeof state.extra.performUpdateItem === 'function') {
            state.extra.performUpdateItem(currentAttachment.sourceNode);
          }

          dispatch({
            type: 'FILE_PREVIEW_UPDATE_FILE',
            attachment: currentAttachment,
            index,
          });
        })
        .catch(_requestError2 => {
          alertIfNotUnauthorized(_requestError2, _l('修改失败'), 2);
        });
    } else if (previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.COMMON) {
      const { docVersionID, fileID, ext, sourceID } = currentAttachment.sourceNode;
      ajax
        .renameFile(docVersionID, fileID, value, ext, sourceID)
        .then(() => {
          currentAttachment.sourceNode.originalFilename = value;
          currentAttachment.name = value;
          alert(_l('修改成功'));
          // extra 文件重命名回调
          if (state.extra && typeof state.extra.renameCallback === 'function') {
            state.extra.renameCallback(currentAttachment.sourceNode, state.originAttachments);
          }

          dispatch({
            type: 'FILE_PREVIEW_UPDATE_FILE',
            attachment: currentAttachment,
            index,
          });
        })
        .catch(_requestError3 => {
          alertIfNotUnauthorized(_requestError3, _l('修改失败'), 2);
        });
    }
  };
}

export function updateAllowDownload() {
  return (dispatch, getState) => {
    const state = getState();
    const index = state.index;
    const currentAttachment = state.attachments[index];
    const docVersionID = currentAttachment.sourceNode.docVersionID;
    const allowDown = !!currentAttachment.sourceNode.allowDown;
    ajax
      .updateAllowDownload(docVersionID, !allowDown)
      .then(() => {
        if (allowDown) {
          delete currentAttachment.sourceNode.allowDown;
          alert(_l('已设置为不可以下载'));
        } else {
          currentAttachment.sourceNode.allowDown = 'ok';
          alert(_l('已设置为可以下载'));
        }

        dispatch({
          type: 'FILE_PREVIEW_UPDATE_FILE',
          attachment: currentAttachment,
          index,
        });
      })
      .catch(_requestError => {
        alertIfNotUnauthorized(_requestError, _l('设置失败'), 3);
      });
  };
}

function selectFolder() {
  return new Promise((resolve, reject) => {
    folderDg({
      dialogTitle: _l('选择路径'),
      isFolderNode: 1,
      selectedItems: null,
    })
      .then(result => {
        resolve(result);
      })
      .catch(() => {
        reject();
      });
  });
}

export function saveToKnowlwdge(savePath) {
  return (dispatch, getState) => {
    const state = getState();
    const index = state.index;
    const currentAttachment = state.attachments[index];
    const { previewAttachmentType, sourceNode, previewType } = currentAttachment;
    let savePromise;

    if (savePath === 1) {
      savePromise = Promise.resolve({ type: PICK_TYPE.MY, node: { id: null, name: _l('我的文件') } });
    } else {
      if (!md.global.Account || !md.global.Account.accountId) {
        alert(_l('保存失败, 您无法选择文件路径'), 2);
        return;
      }

      savePromise = selectFolder();
    }

    Promise.all([savePromise])
      .then(([path]) => {
        const sourceData = {};
        let attachmentType;

        if (previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.COMMON) {
          attachmentType = 1;
          sourceData.fileID = sourceNode.fileID;
          sourceData.allowDown = !!(sourceNode.allowDown && sourceNode.allowDown === 'ok');
          if (previewType === PREVIEW_TYPE.PICTURE) {
            sourceData.allowDown = true;
          }
        } else if (previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.KC) {
          attachmentType = 2;
          sourceData.nodeId = sourceNode.id;
          if (state.extra && state.extra.shareFolderId) {
            sourceData.isShareFolder = true;
          }
        } else if (previewAttachmentType === PREVIEW_ATTACHMENT_TYPE.QINIU) {
          attachmentType = 0;
          sourceData.name = currentAttachment.name + '.' + currentAttachment.ext;
          sourceData.filePath = sourceNode.path;
        }

        saveToKnowledge(attachmentType, sourceData)
          .save(path)
          .then(() => {
            // alert(message || '保存成功');
          })
          .catch(message => {
            alertIfNotUnauthorized(message, message || _l('保存失败'), 3);
          });
      })
      .catch(() => {});
  };
}

export function replaceAttachment(originAttachment, index, callFrom) {
  return dispatch => {
    const currentAttachment = formatAttachment([originAttachment], callFrom)[0];
    loadAttachment(currentAttachment)
      .then(attachment => {
        dispatch({
          type: 'FILE_PREVIEW_LOAD_FILE_SUCESS',
          attachment,
          index,
        });
      })
      .catch(err => {
        dispatch({
          type: 'FILE_PREVIEW_LOAD_FILE_SUCESS',
          attachment: currentAttachment,
          index,
          error: err,
        });
      });
  };
}

export function changeStateOfAttachment(attachment, index) {
  return dispatch => {
    dispatch({
      type: 'FILE_PREVIEW_LOAD_FILE_SUCESS',
      attachment,
      index,
    });
  };
}

export function onClose() {
  return (dispatch, getState) => {
    const state = getState();

    if (state.onClose) {
      state.onClose();
    }
  };
}

export function changePreviewService(previewService) {
  return dispatch => {
    dispatch({
      type: 'CHANGE_PREVIEW_SERVICE',
      previewService,
    });
  };
}

// 全屏模式
export function toggleFullScreen() {
  return {
    type: ACTION_TYPES.TOGGLE_FULLSCREEN,
  };
}
