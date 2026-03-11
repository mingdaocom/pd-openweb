import _ from 'lodash';
import appManagementAjax from 'src/api/appManagement';
import { SYSTEM_CONTROL_WITH_UAID } from 'src/pages/widgetConfig/config/widget';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget';
import { controlState } from 'src/utils/control';
import { replaceControlsTranslateInfo } from 'src/utils/translate';
import { SYST_PRINT } from './config';

// const FILTER_SYS = ALL_SYS.filter(o => !['ownerid', 'caid', 'ctime', 'utime'].includes(o));

export const isRelationControl = type => {
  return [29, 34, 51].includes(type);
};

// 关联表控件根据showControls排序
export const sortByShowControls = list => {
  let controls = [];
  list.showControls.map(id => {
    let l = list.relationControls.find(it => id === it.controlId);
    if (l) {
      controls.push(l);
    }
  });
  return controls;
};

const isSupportedPrintControl = ({ control, needVisible, showControls = [], isRelationControl = false }) => {
  // 过滤 OCR 和 接口查询
  if ([43, 49].includes(control.type)) return false;

  // 强制显示（勾选了显示字段）
  const forceShow = isRelationControl && showControls.includes(control.controlId);
  if (forceShow) return true;

  // 系统字段
  const isSystemControl = ALL_SYS.includes(control.controlId);
  // 是否可见
  const canVisible = needVisible || controlState(control).visible;

  return !isSystemControl && canVisible;
};

//处理打印数据
export const getControlsForPrint = ({ receiveControls, relationMaps = {}, needVisible, info }) => {
  const { appId, worksheetId } = info;

  const controls = receiveControls
    .filter(c => isSupportedPrintControl({ control: c, needVisible }))
    .map(control => {
      const extendAttr = {};
      // 关联记录、子表、查询记录 数据处理
      if (isRelationControl(control.type)) {
        const originalCheckedMap = Object.fromEntries(control.relationControls.map(rc => [rc.controlId, rc.checked]));
        const relationData = relationMaps[control.controlId] || {};
        const relationControls = (_.get(relationData, 'template.controls') || [])
          .filter(c =>
            isSupportedPrintControl({
              control: c,
              needVisible,
              showControls: control.showControls,
              isRelationControl: true,
            }),
          )
          .map(c => ({ ...c, checked: originalCheckedMap[c.controlId] }))
          .sort((a, b) => (a.row === b.row ? a.col - b.col : a.row - b.row));

        extendAttr.relationControls = replaceControlsTranslateInfo(
          relationData.appId,
          control.dataSource,
          relationControls,
        );
      }

      return {
        ...control,
        ...extendAttr,
      };
    })
    .sort((a, b) => (a.row === b.row ? a.col - b.col : a.row - b.row));

  return replaceControlsTranslateInfo(appId, worksheetId, controls);
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

export const isRToC = control => {
  return [21, 29, 34, 51].includes(control.type) && _.get(control, 'advancedSetting.direction') === '1';
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
  const { worksheetId, rowId, printId, projectId, appId, viewId, fileTypeNum, download = 0, rowIds = [] } = data;
  //功能模块 token枚举，3 = 导出excel，4 = 导入excel生成表，5= word打印
  const token = await appManagementAjax.getToken({ worksheetId, viewId, tokenType: 5 });
  let payload = {
    id: printId,
    rowId: rowIds.length ? rowIds.join(',') : rowId,
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
