import sheetAjax from 'src/api/worksheet';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { getIsScanQR } from 'src/components/newCustomFields/components/ScanQRCode';
import _ from 'lodash';

const getPermissionInfo = (activeRelateSheetControl, rowInfo, worksheet) => {
  const { allowAdd } = worksheet;
  const { receiveControls, allowEdit } = rowInfo;
  const activeSheetIndex = 0;
  const controlPermission = controlState(activeRelateSheetControl, 3);
  const { enumDefault2, strDefault, controlPermissions = '111', advancedSetting } = activeRelateSheetControl;
  const [, , onlyRelateByScanCode] = strDefault.split('').map(b => !!+b);
  const isSubList = activeRelateSheetControl.type === 34;
  const allowRemoveRelation = typeof advancedSetting.allowcancel === 'undefined' ? true : advancedSetting.allowcancel === '1';
  const allowLink = advancedSetting.allowlink !== '0';
  const isCreate = isSubList
    ? allowEdit && controlPermission.editable && enumDefault2 !== 1 && enumDefault2 !== 11 && !onlyRelateByScanCode
    : allowEdit &&
      controlPermission.editable &&
      allowAdd &&
      enumDefault2 !== 1 &&
      enumDefault2 !== 11;
  const isRelevance =
    !isSubList &&
    controlPermission.editable &&
    enumDefault2 !== 10 &&
    enumDefault2 !== 11 &&
    allowEdit;
  const hasEdit = controlPermission.editable && allowEdit && (allowAdd || isSubList);
  const isScanQR = getIsScanQR();

  return {
    allowRemoveRelation,
    allowLink,
    isCreate,
    isRelevance,
    hasEdit,
    isSubList,
    activeRelateSheetControl,
    controlPermission,
    onlyRelateByScanCode: onlyRelateByScanCode && isScanQR,
  };
}

export const updateBase = base => (dispatch, getState) => {
  dispatch({
    type: 'MOBILE_UPDATE_BASE',
    base,
  });
}

export const loadRow = (control, getType) => (dispatch, getState) => {

  const { base, rowInfo } = getState().mobile;
  const { instanceId, workId, worksheetId, rowId } = base;
  const params = {};

  if (instanceId && workId) {
    params.instanceId = instanceId;
    params.workId = workId;
    params.rowId = rowId;
    params.worksheetId = worksheetId;
    params.getType = getType || 9;
  } else {
    const { appId, viewId, controlId } = base;
    params.controlId = controlId;
    params.getType = getType || 1;
    params.checkView = true;
    params.appId = appId;
    params.worksheetId = worksheetId;
    params.viewId = viewId;
    params.rowId = rowId;
  }

  if (_.isEmpty(rowInfo)) {
    sheetAjax.getRowByID(params).then(result => {
      dispatch({ type: 'MOBILE_RELATION_ROW_INFO', data: result });
      dispatch(loadRowRelationRows(control, getType));
    });
  } else {
    dispatch(loadRowRelationRows(control));
  }
}

export const loadRowRelationRows = (relationControl, getType) => (dispatch, getState) => {

  const { base, loadParams, relationRows, rowInfo } = getState().mobile;
  const { pageIndex } = loadParams;
  const { instanceId, rowId, worksheetId, controlId } = base;
  const PAGE_SIZE = 10;
  const params = {
    controlId,
    rowId,
    worksheetId,
    getType
  };

  dispatch({ type: 'MOBILE_RELATION_LOAD_PARAMS', data: { loading: true } });

  if (_.isEmpty(instanceId)) {
    const { appId, viewId } = base;
    params.appId = appId;
    params.viewId = viewId;
  }

  const shareId = (location.href.match(/\/public\/(record|view|workflow)\/(\w{24})/) || [])[2];
  if (shareId) {
    params.shareId = shareId;
  }

  sheetAjax.getRowRelationRows({
    ...params,
    pageIndex,
    pageSize: PAGE_SIZE,
    getWorksheet: pageIndex === 1,
  }).then(result => {
    if (pageIndex === 1) {
      const { controls } = result.template;
      const control = relationControl || _.find(rowInfo.receiveControls, { controlId });
      const titleControl = _.find(controls, { attribute: 1 });
      const fileControls = controls.filter(item => item.type === 14);
      dispatch({
        type: 'MOBILE_RELATION_ROW',
        data: _.pick(result, ['template', 'worksheet', 'count'])
      });
      dispatch({
        type: 'MOBILE_PERMISSION_INFO',
        data: getPermissionInfo(control, rowInfo, result.worksheet)
      });
      dispatch({
        type: 'MOBILE_RELATION_ACTION_PARAMS',
        data: {
          showControls: control.showControls.filter(item => titleControl.controlId !== item).slice(0, 3),
          coverCid: control.coverCid || null,
        }
      });
    }
    dispatch({
      type: 'MOBILE_RELATION_ROWS',
      data: relationRows.concat(result.data)
    });
    dispatch({
      type: 'MOBILE_RELATION_LOAD_PARAMS',
      data: {
        pageIndex,
        loading: false,
        isMore: result.data.length === PAGE_SIZE
      }
    });
  });
}

export const updateRelationRows = (data, value) => (dispatch, getState) => {
  const { relationRow } = getState().mobile;
  dispatch({
    type: 'MOBILE_RELATION_ROWS',
    data
  });
  dispatch({
    type: 'MOBILE_RELATION_ROW',
    data: {
      count: relationRow.count + value
    }
  });
}

export const updatePageIndex = (index) => (dispatch, getState) => {
  dispatch({
    type: 'MOBILE_RELATION_LOAD_PARAMS',
    data: { pageIndex: index }
  });
  dispatch(loadRowRelationRows());
}

export const updateActionParams = (data) => (dispatch, getState) => {
  dispatch({
    type: 'MOBILE_RELATION_ACTION_PARAMS',
    data
  });
}

export const reset = () => (dispatch, getState) => {
  dispatch({
    type: 'MOBILE_RELATION_LOAD_PARAMS',
    data: {
      pageIndex: 1,
      loading: true,
      isMore: true
    }
  });
  dispatch({
    type: 'MOBILE_RELATION_ACTION_PARAMS',
    data: {
      isEdit: false,
      selectedRecordIds: []
    }
  });
  dispatch({
    type: 'MOBILE_RELATION_ROW_INFO', data: {}
  });
  dispatch({
    type: 'MOBILE_RELATION_ROWS',
    data: []
  });
  dispatch({
    type: 'MOBILE_RELATION_ROW',
    data: { count: 0 }
  });
}

