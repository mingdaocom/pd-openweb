import _ from 'lodash';
import worksheetAjax from 'src/api/worksheet';
import { formatAttachmentValue } from 'src/utils/domain/control/attachment';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/utils/domain/control/widgetTypes';
import { pathCompletion } from 'src/utils/platform/navigation/path';

const SYSTEM_FIELD_IDS = [
  'rowid',
  'ownerid',
  'caid',
  'ctime',
  'utime',
  'uaid',
  'wfname',
  'wfcuaids',
  'wfcaid',
  'wfctime',
  'wfrtime',
  'wfftime',
  'wfstatus',
];

/** 将记录提交结果码转换为对应的用户错误提示。 */
export function handleRecordError(resultCode, control, isNewRecord = false) {
  if (resultCode === 11) {
    alert(_l('编辑失败，%0不允许重复', control ? control.controlName : ''), 2);
  } else if (resultCode === 31) {
    alert(_l('记录提交失败：有必填字段未填写'), 2);
  } else if (resultCode === 22) {
    alert(_l('记录提交失败：子表字段存在重复数据'), 2);
  } else if (resultCode === 72) {
    alert(_l('记录已锁定，无法保存'), 3);
  } else if (resultCode === 4) {
    alert(_l('编辑失败，记录已被删除'), 2);
  } else {
    alert(isNewRecord ? _l('提交失败！') : _l('编辑失败！'), 2);
  }
}

/** 补全应用信息并生成记录落地页地址。 */
export async function getRecordLandUrl({ appId, worksheetId, viewId, recordId }) {
  if (md.global.Account.isPortal) {
    appId = md.global.Account.appId;
  }

  if (!appId) {
    const res = await worksheetAjax.getWorksheetInfo({ worksheetId });
    appId = res.appId;
  }

  return viewId
    ? pathCompletion(`/app/${appId}/${worksheetId}/${viewId}/row/${recordId}`)
    : pathCompletion(`/app/${appId}/${worksheetId}/row/${recordId}`);
}

function addPrefixForRowIdOfRows(rows = [], prefix = '', controls = []) {
  const rowIds = new Set(rows.map(row => row.rowid).filter(Boolean));
  const relationControlIds = controls
    .filter(control => [29, 34].includes(control.type))
    .map(control => control.controlId);

  const replaceRowReferences = value => {
    if (Array.isArray(value)) return value.map(replaceRowReferences);

    if (_.isPlainObject(value)) {
      return _.mapValues(value, replaceRowReferences);
    }

    if (typeof value !== 'string') return value;
    if (rowIds.has(value)) return prefix + value;
    if (!/^\s*[\[{]/.test(value)) return value;

    try {
      return JSON.stringify(replaceRowReferences(JSON.parse(value)));
    } catch {
      return value;
    }
  };

  return rows.map(row => {
    const newRow = {
      ...row,
      rowid: replaceRowReferences(row.rowid),
      pid: replaceRowReferences(row.pid),
      childrenids: replaceRowReferences(row.childrenids),
    };

    relationControlIds.forEach(controlId => {
      if (Object.prototype.hasOwnProperty.call(newRow, controlId)) {
        newRow[controlId] = replaceRowReferences(newRow[controlId]);
      }
    });

    return newRow;
  });
}

/** 拉取子表关联行并转换为控件可使用的静态默认值。 */
async function fillRowRelationRows(control, rowId, worksheetId, isRecreate = false) {
  let defSource = '';
  const filledControl = _.cloneDeep(control);
  const res = await worksheetAjax.getRowRelationRows({
    controlId: control.controlId,
    rowId,
    worksheetId,
    pageIndex: 1,
    pageSize: 200,
    getWorksheet: true,
  });

  if (res.resultCode === 1) {
    const subControls = ((res.template || {}).controls || []).filter(c => !_.includes(SYSTEM_FIELD_IDS, c.controlId));
    const staticValue = addPrefixForRowIdOfRows(res.data || [], 'temp-', subControls).map(item => {
      const itemValue = { rowid: item.rowid, pid: item.pid, childrenids: item.childrenids };

      subControls.forEach(c => {
        if (isRecreate && c.type === 29 && c.enumDefault === 1 && c.dataSource === worksheetId) {
          itemValue[c.controlId] = undefined;
        } else if (isRecreate && c.type === 29 && c.advancedSetting.showtype === '3') {
          itemValue[c.controlId] = JSON.stringify(safeParse(item[c.controlId], 'array').slice(0, 5));
        } else {
          itemValue[c.controlId] =
            c.type === WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT
              ? formatAttachmentValue(item[c.controlId], isRecreate, true)
              : item[c.controlId];
        }
      });
      return itemValue;
    });
    defSource = [{ cid: '', rcid: '', isAsync: false, staticValue: JSON.stringify(staticValue) }];
  }

  filledControl.defsource = JSON.stringify(defSource);
  filledControl.advancedSetting = { ...control.advancedSetting, defsource: JSON.stringify(defSource) };
  return filledControl;
}

/** 获取原记录并转换为重新创建记录所需的默认数据与控件配置。 */
export async function handleRowData({ rowId, worksheetId, columns }) {
  const data = await worksheetAjax.getRowDetail({ checkView: true, getType: 1, rowId, worksheetId });

  if (data.resultCode !== 1) {
    if (data.resultCode === 4) alert(_l('记录不存在，请刷新视图'), 2);
    return;
  }

  const defaultData = JSON.parse(data.rowData || '{}');
  const subTablePromise = [];
  const defcontrols = _.cloneDeep(columns);

  _.forIn(defaultData, (value, key) => {
    const control = columns.find(item => item.controlId === key);

    if (!control) return;
    if ([38, 32, 33].includes(control.type) || (control.fieldPermission || '111').split('')[2] === '0') {
      defaultData[key] = null;
    } else if (control.type === 14) {
      defaultData[key] = formatAttachmentValue(value, true);
    } else if (control.type === 34) {
      subTablePromise.push(fillRowRelationRows(control, rowId, worksheetId, true));
    } else if (control.type === 29) {
      defaultData[key] = !['2', '5', '6'].includes(control.advancedSetting.showtype)
        ? JSON.stringify(JSON.parse(value || '[]').slice(0, 5))
        : 0;
    } else if (control.type === 37 && control.dataSource) {
      const sourceId = control.dataSource.substring(1, control.dataSource.length - 1);
      const sourceControl = columns.find(item => item.controlId === sourceId);
      defaultData[key] =
        _.get(sourceControl, 'type') === 29 &&
        ['2', '5', '6'].includes(_.get(sourceControl, 'advancedSetting.showtype'))
          ? undefined
          : value;
    } else {
      defaultData[key] = value;
    }
  });

  const subTableControls = await Promise.all(subTablePromise);
  subTableControls.forEach(item => {
    const index = _.findIndex(defcontrols, control => control.controlId == item.controlId);
    defaultData[item.controlId] = undefined;
    if (index > -1) defcontrols[index] = item;
  });

  return { defaultData, defcontrols };
}
