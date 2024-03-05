import publicWorksheetAjax from 'src/api/publicWorksheet';
import formAjax from 'src/api/form';
import { getNewControlColRow } from '../utils';
import _ from 'lodash';

function changeKeyToServer(value) {
  if (!_.isUndefined(value.coverUrl)) {
    value.cover = value.coverUrl.split('?')[0];
    delete value.coverUrl;
  }
  if (!_.isUndefined(value.logoUrl)) {
    value.logo = value.logoUrl.split('?')[0];
    delete value.logoUrl;
  }
  if (!_.isUndefined(value.themeIndex)) {
    value.themeColor = value.themeIndex;
    delete value.themeIndex;
  }
  return value;
}

export const updateSettings =
  (value, cb = isSuccess => {}) =>
  (dispatch, getState) => {
    const {
      publicWorksheet: {
        worksheetInfo: { worksheetId, projectId },
      },
    } = getState();
    publicWorksheetAjax
      .saveSetting({
        projectId,
        worksheetId,
        ...value,
      })
      .then(data => {
        if (data) {
          cb(true);
          console.log('save success');
          dispatch({ type: 'PUBLICWORKSHEET_UPDATE_SETTINGS', value });
        }
      })
      .fail(err => {
        cb(false);
      });
  };

function updateBaseConfig(dispatch, getState, value, cb) {
  const {
    publicWorksheet: {
      worksheetInfo: { worksheetId, projectId },
    },
  } = getState();
  const serverValue = changeKeyToServer(value);
  const params = {
    ...serverValue,
  };
  publicWorksheetAjax
    .saveWorksheet({
      projectId,
      worksheetId,
      ...params,
    })
    .then(data => {
      if (_.isFunction(cb)) {
        cb(worksheetId);
      }
    })
    .fail(err => {
      alert(_l('保存失败'), 3);
    });
}

export function refreshShareUrl() {
  return (dispatch, getState) => {
    const {
      publicWorksheet: {
        worksheetInfo: { worksheetId },
      },
    } = getState();
    publicWorksheetAjax.refreshPublicWorksheetUrl({ worksheetId }).then(data => {
      alert(_l('刷新成功'));
      dispatch({ type: 'PUBLICWORKSHEET_UPDATE_URL', url: data.url });
    });
  };
}

export function addWorksheetControl(controlName, cb = () => {}) {
  return (dispatch, getState) => {
    const state = getState();
    if (state.publicWorksheet.originalControls.length + 1 > 200) {
      alert(_l('表单中添加字段数量已达上限（200个）'), 3);
      return;
    }
    const {
      publicWorksheet: {
        worksheetInfo: { worksheetId },
      },
    } = state;
    formAjax
      .addTextControl({
        worksheetId,
        name: controlName,
      })
      .then(data => {
        dispatch({ type: 'PUBLICWORKSHEET_ADD_CONTROL', control: data });
        dispatch(hideControl(data.controlId));
        cb(data);
      })
      .fail(err => {
        alert(_l('添加文本字段失败'), 3);
      });
  };
}

export function loadPublicWorksheet({ worksheetId }) {
  return (dispatch, getState) => {
    publicWorksheetAjax
      .getPublicWorksheetInfo({ worksheetId })
      .then(data => {
        dispatch({
          type: 'PUBLICWORKSHEET_LOAD_SUCCESS',
          controls: data.controls,
          originalControls: data.originalControls.filter(
            control =>
              !(
                (control.type === 29 && !_.includes([0, 1], control.enumDefault2)) ||
                (control.type === 51 && _.get(control, 'advancedSetting.showtype') === '2')
              ) && !_.includes(['caid', 'ownerid', 'ctime', 'utime'], control.controlId),
          ),
          shareId: data.shareId,
          url: data.url,
          worksheetInfo: {
            themeIndex: data.themeColor,
            themeBgColor: data.themeBgColor,
            logoUrl: data.logo,
            coverUrl: data.cover,
            ..._.pick(data, [
              'worksheetName',
              'advancedSetting',
              'name',
              'desc',
              'worksheetId',
              'projectId',
              'visibleType',
              'submitBtnName',
            ]),
          },
          worksheetSettings: {
            ..._.pick(data, [
              'limitWriteFrequencySetting',
              'ipControlId',
              'browserControlId',
              'deviceControlId',
              'systemControlId',
              'receipt',
              'extendSourceId',
              'extends',
              'needCaptcha',
              'smsVerification',
              'smsVerificationFiled',
              'smsSignature',
              'writeScope',
              'linkSwitchTime',
              'limitWriteTime',
              'limitWriteCount',
              'limitPasswordWrite',
              'cacheDraft',
              'cacheFieldData',
              'weChatSetting',
              'abilityExpand',
              'completeNumber',
            ]),
          },
          hidedControlIds: data.hidedControlIds || [],
        });
      })
      .then(err => {});
  };
}

export const changeControls = controls => (dispatch, getState) => {
  dispatch({ type: 'PUBLICWORKSHEET_UPDATE_CONTROLS', controls });
  updateBaseConfig(dispatch, getState, { controls: controls.map(c => _.pick(c, ['controlId', 'col', 'row', 'size'])) });
};

export const updateWorksheetInfo = value => (dispatch, getState) => {
  dispatch({ type: 'PUBLICWORKSHEET_UPDATE_INFO', value });
  updateBaseConfig(dispatch, getState, value);
};

export const updateWorksheetVisibleType =
  (value, cb = () => {}) =>
  (dispatch, getState) => {
    updateBaseConfig(dispatch, getState, { visibleType: value }, worksheetId => {
      cb();
      if (value === 1) {
        dispatch({ type: 'PUBLICWORKSHEET_UPDATE_INFO', value: { visibleType: value } });
      } else {
        dispatch(loadPublicWorksheet({ worksheetId }));
      }
    });
  };

export const hideControl = controlId => (dispatch, getState) => {
  const {
    publicWorksheet: { hidedControlIds, controls },
  } = getState();
  const newHidedControlIds = _.uniqBy(hidedControlIds.concat(controlId));
  const newControls = controls.filter(item => !_.includes(newHidedControlIds, item.controlId));

  updateBaseConfig(dispatch, getState, {
    hidedControlIds: newHidedControlIds,
    controls: newControls,
  });
  dispatch({ type: 'WORKSHEET_HIDE_CONTROL', controlId });
  dispatch({ type: 'PUBLICWORKSHEET_UPDATE_CONTROLS', controls: newControls });
};

export function showControl(control) {
  return (dispatch, getState) => {
    const state = getState();
    const {
      publicWorksheet: { controls, hidedControlIds },
    } = state;
    const rowCol = getNewControlColRow(controls, control.half);
    control.col = rowCol.col;
    control.row = rowCol.row;
    updateBaseConfig(dispatch, getState, {
      hidedControlIds: hidedControlIds.filter(controlId => controlId !== control.controlId),
      controls: controls.concat(_.pick(control, ['controlId', 'col', 'row'])),
    });
    if (_.isFunction(window.scrollToFormEnd)) {
      window.scrollToFormEnd();
    }
    dispatch({
      type: 'WORKSHEET_SHOW_CONTROL',
      controlId: control.controlId,
      control: _.pick(control, ['controlId', 'col', 'row']),
    });
  };
}

export function resetControls() {
  return (dispatch, getState) => {
    const {
      publicWorksheet: {
        worksheetInfo: { worksheetId },
      },
    } = getState();
    publicWorksheetAjax
      .reset({ worksheetId })
      .then(data => {
        if (data && data.success) {
          data = data.info;
          dispatch({
            type: 'PUBLICWORKSHEET_LOAD_SUCCESS',
            controls: data.controls,
            originalControls: data.originalControls.filter(
              control =>
                !(
                  (control.type === 29 && !_.includes([0, 1], control.enumDefault2)) ||
                  (control.type === 51 && _.get(control, 'advancedSetting.showtype') === '2')
                ) && !_.includes(['caid', 'ownerid', 'ctime', 'utime'], control.controlId),
            ),
            shareId: data.shareId,
            url: data.url,
            worksheetInfo: {
              themeIndex: data.themeColor,
              themeBgColor: data.themeBgColor,
              logoUrl: data.logo,
              coverUrl: data.cover,
              ..._.pick(data, [
                'worksheetName',
                'name',
                'desc',
                'worksheetId',
                'projectId',
                'visibleType',
                'submitBtnName',
              ]),
            },
            worksheetSettings: {
              ..._.pick(data, [
                'limitWriteFrequencySetting',
                'ipControlId',
                'browserControlId',
                'deviceControlId',
                'systemControlId',
                'receipt',
                'extendSourceId',
                'extends',
                'needCaptcha',
                'smsVerification',
                'smsVerificationFiled',
                'smsSignature',
                'writeScope',
                'linkSwitchTime',
                'limitWriteTime',
                'limitWriteCount',
                'limitPasswordWrite',
                'cacheDraft',
                'cacheFieldData',
                'weChatSetting',
                'abilityExpand',
                'completeNumber',
              ]),
            },
            hidedControlIds: data.hidedControlIds || [],
          });
        }
      })
      .fail(() => {
        alert(_l('重置失败'), 2);
      });
  };
}

// 清空数据
export const clear = () => ({ type: 'PUBLICWORKSHEET_CLEAR' });
