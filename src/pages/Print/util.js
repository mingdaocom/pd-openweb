import _ from 'lodash';
import appManagementAjax from 'src/api/appManagement';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { SYSTEM_CONTROL_WITH_UAID } from 'src/pages/widgetConfig/config/widget';
import { FILTER_SYS, SYST_PRINT } from './config';

export const isVisible = (control, useControlPermissions = false) => {
  const fieldPermission = control.fieldPermission || '111';
  const controlPermission = !useControlPermissions || _.get(control, 'controlPermissions[0]') === '1';

  return fieldPermission[0] === '1' && controlPermission;
};

export const getVisibleControls = (controls, useControlPermissions = false) => {
  return controls.filter(control => isVisible(control, useControlPermissions));
};

//规则计算=>隐藏处理
export const getShowControl = (controls = []) => {
  if (controls.length <= 0) {
    return [];
  }
  let list = controls.map(control => {
    let { fieldPermission = '111' } = control;
    const [visible] = fieldPermission.split('');
    if (visible === '0') {
      return {
        ...control,
        checked: false,
      };
    } else {
      return control;
    }
  });
  return list;
};

// 关联表控件根据showControls排序
export const sortByShowControls = list => {
  let controls = [];
  list.showControls.map(id => {
    let l = list.relationControls.find(it => id === it.controlId);
    if (l && isVisible(l)) {
      controls.push(l);
    }
  });
  return controls;
};

//处理打印数据
export const getControlsForPrint = (receiveControls, relationMaps = {}, needVisible, additional) => {
  let controls = getShowControl(receiveControls)
    .filter(
      o => ![43, 49].includes(o.type) && !FILTER_SYS.includes(o.controlId) && (needVisible || controlState(o).visible),
    )
    .map(control => {
      const extendAttr = {};
      let _control = (_.get(additional, 'info.template.controls') || []).find(m => m.controlId === control.controlId);

      if (_control) {
        extendAttr.advancedSetting = _control.advancedSetting;
      }

      //关联表数据处理
      if (((control.type === 29 && control.enumDefault === 2) || control.type === 34) && control.checked) {
        extendAttr.relationControls = getShowControl(
          _.get(relationMaps[control.controlId], 'template.controls') || control.relationControls,
        );
        extendAttr.relationsData = relationMaps[control.controlId];
      }

      return {
        ...control,
        ...extendAttr,
      };
    });

  controls = controls.sort((a, b) => {
    if (a.row === b.row) {
      return a.col - b.col;
    } else {
      return a.row - b.row;
    }
  });
  // 模版打印/配置（新建模版）=> 不考虑显隐设置
  //系统打印需要根据用户权限显示
  return controls;
};

export const SYST_PRINTData = data => {
  return SYSTEM_CONTROL_WITH_UAID.map(o => {
    return { ...o, checked: data[SYST_PRINT[o.controlId]] };
  });
};

export const isRelation = control => {
  return (
    ([29, 51].includes(control.type) && ['2', '5', '6'].includes(_.get(control, 'advancedSetting.showtype'))) ||
    control.type === 34
  );
};

export const useUserPermission = control => {
  const [isHiddenOtherViewRecord] = (control.strDefault || '000').split('');
  return !!+isHiddenOtherViewRecord;
};

export const getFormData = (controls, data) => {
  return controls.map(it => ({
    ...it,
    value: data[it.controlId],
  }));
};

export const getDownLoadUrl = async (downLoadUrl, data, callback) => {
  const { worksheetId, rowId, printId, projectId, appId, viewId, fileTypeNum, download = 0 } = data;
  //功能模块 token枚举，3 = 导出excel，4 = 导入excel生成表，5= word打印
  const token = await appManagementAjax.getToken({ worksheetId, viewId, tokenType: 5 });
  let payload = {
    id: printId,
    rowId: rowId,
    accountId: md.global.Account.accountId,
    worksheetId,
    appId,
    projectId,
    t: new Date().getTime(),
    viewId,
    token,
    download,
  };

  window
    .mdyAPI('', '', payload, {
      ajaxOptions: { url: downLoadUrl + (fileTypeNum === 5 ? '/ExportXlsx/GetXlsxPath' : '/ExportWord/GetWordPath') },
      customParseResponse: true,
    })
    .then(r => {
      if (r.message) {
        alert(r.message, 2);
        callback('error');
        return;
      }

      callback(r.data);
    })
    .catch(() => {
      callback('error');
    });
};
