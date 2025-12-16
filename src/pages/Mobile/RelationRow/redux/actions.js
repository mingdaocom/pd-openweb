import _ from 'lodash';
import sheetAjax from 'src/api/worksheet';
import worksheetAjax from 'src/api/worksheet';
import { controlState } from 'src/components/Form/core/utils';
import { getIsScanQR } from 'src/components/Form/MobileForm/components/ScanQRCode';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';

const getPermissionInfo = (activeRelateSheetControl, rowInfo, worksheet) => {
  const { allowAdd } = worksheet;
  const { allowEdit } = rowInfo;
  const controlPermission = {
    visible: controlState(activeRelateSheetControl, 3).visible,
    editable: controlState(activeRelateSheetControl, 3).editable && allowEdit,
  };
  const { enumDefault2, strDefault, advancedSetting } = activeRelateSheetControl;
  const [, , onlyRelateByScanCode] = strDefault.split('').map(b => !!+b);
  const isSubList = activeRelateSheetControl.type === 34;
  const allowRemoveRelation =
    typeof advancedSetting.allowcancel === 'undefined' ? true : advancedSetting.allowcancel === '1';
  const allowLink = advancedSetting.allowlink !== '0';
  const isCreate = isSubList
    ? allowEdit && controlPermission.editable && enumDefault2 !== 1 && enumDefault2 !== 11 && !onlyRelateByScanCode
    : allowEdit && controlPermission.editable && allowAdd && enumDefault2 !== 1 && enumDefault2 !== 11;
  const isRelevance =
    !isSubList && controlPermission.editable && enumDefault2 !== 10 && enumDefault2 !== 11 && allowEdit;
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
};

export const updateBase = base => dispatch => {
  dispatch({
    type: 'MOBILE_UPDATE_BASE',
    base,
  });
};

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
    params.getTemplate = true;
  } else {
    const { appId, viewId, controlId } = base;
    params.controlId = controlId;
    params.getType = getType || 1;
    params.checkView = true;
    params.getTemplate = true;
    params.appId = appId;
    params.worksheetId = worksheetId;
    params.viewId = viewId;
    params.rowId = rowId;
  }

  if (_.isEmpty(rowInfo)) {
    sheetAjax.getRowDetail(params).then(result => {
      dispatch({
        type: 'MOBILE_RELATION_ROW_INFO',
        data: {
          ...result,
          templateControls: (result.templateControls || []).map(v =>
            v.controlId === control.controlId ? { ...v, ...control } : v,
          ),
        },
      });
      dispatch(loadRowRelationRows(control, getType));
    });
  } else {
    dispatch(loadRowRelationRows(control));
  }
};

export const loadRowRelationRows = (relationControl, getType) => async (dispatch, getState) => {
  const { base, loadParams, relationRows, rowInfo } = getState().mobile;
  const { pageIndex, keywords } = loadParams;
  const { instanceId, workId, rowId, worksheetId, controlId } = base;
  const PAGE_SIZE = 10;
  const params = {
    controlId,
    rowId,
    worksheetId,
    getType,
    instanceId,
    workId,
    keywords,
  };
  const control = relationControl || _.find(rowInfo.templateControls, { controlId }) || {};

  dispatch({ type: 'MOBILE_RELATION_LOAD_PARAMS', data: { loading: true } });

  if (_.isEmpty(instanceId)) {
    const { appId, viewId } = base;
    params.appId = appId;
    params.viewId = viewId;
  }

  let relationControls = [];
  let resWorksheetInfo = await worksheetAjax.getWorksheetInfo({
    worksheetId: control.dataSource,
    getTemplate: true,
    relationWorksheetId: worksheetId,
  });
  relationControls = _.get(resWorksheetInfo, 'template.controls') || [];
  const filterControls = getFilter({
    control: { ...control, relationControls, recordId: rowId },
    formData: control.formData || rowInfo.templateControls,
    filterKey: 'resultfilters',
  });
  if (!filterControls) {
    dispatch({
      type: 'MOBILE_RELATION_ROWS',
      data: [],
    });
    dispatch({
      type: 'MOBILE_RELATION_LOAD_PARAMS',
      data: {
        pageIndex,
        loading: false,
        isMore: false,
      },
    });
    return;
  }
  params.filterControls = filterControls || [];

  sheetAjax
    .getRowRelationRows({
      ...params,
      pageIndex,
      pageSize: PAGE_SIZE,
      getWorksheet: pageIndex === 1,
      getRules: pageIndex === 1,
    })
    .then(result => {
      if (pageIndex === 1) {
        dispatch({
          type: 'MOBILE_RELATION_ROW',
          data: _.pick(result, ['template', 'worksheet', 'count']),
        });
        dispatch({
          type: 'MOBILE_PERMISSION_INFO',
          data: getPermissionInfo(control, rowInfo, result.worksheet),
        });
        dispatch({
          type: 'MOBILE_RELATION_ACTION_PARAMS',
          data: {
            relationControls,
            showControls: control.showControls,
            coverCid: control.coverCid || null,
          },
        });
      }
      dispatch({
        type: 'MOBILE_RELATION_ROWS',
        data: pageIndex === 1 ? result.data : relationRows.concat(result.data),
      });
      dispatch({
        type: 'MOBILE_RELATION_LOAD_PARAMS',
        data: {
          pageIndex,
          loading: false,
          isMore: result.data.length === PAGE_SIZE,
        },
      });
    });
};

export const updateRelationRows = (data, value) => (dispatch, getState) => {
  const { relationRow } = getState().mobile;
  dispatch({
    type: 'MOBILE_RELATION_ROWS',
    data,
  });
  dispatch({
    type: 'MOBILE_RELATION_ROW',
    data: {
      count: relationRow.count + value,
    },
  });
};

export const updatePageIndex =
  (index, params = {}) =>
  dispatch => {
    dispatch({
      type: 'MOBILE_RELATION_LOAD_PARAMS',
      data: { pageIndex: index, ...params },
    });
    dispatch(loadRowRelationRows());
  };

export const updateActionParams = data => dispatch => {
  dispatch({
    type: 'MOBILE_RELATION_ACTION_PARAMS',
    data,
  });
};

export const reset = () => dispatch => {
  dispatch({
    type: 'MOBILE_RELATION_LOAD_PARAMS',
    data: {
      pageIndex: 1,
      loading: true,
      isMore: true,
      keywords: '',
    },
  });
  dispatch({
    type: 'MOBILE_RELATION_ACTION_PARAMS',
    data: {
      isEdit: false,
      selectedRecordIds: [],
    },
  });
  dispatch({
    type: 'MOBILE_RELATION_ROW_INFO',
    data: {},
  });
  dispatch({
    type: 'MOBILE_RELATION_ROWS',
    data: [],
  });
  dispatch({
    type: 'MOBILE_RELATION_ROW',
    data: { count: 0 },
  });
};
