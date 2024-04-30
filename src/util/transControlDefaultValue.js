import worksheetAjax from 'src/api/worksheet';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { v4 as uuidv4 } from 'uuid';

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

export function formatAttachmentValue(value, isRecreate = false, isRelation = false) {
  const attachmentArr = JSON.parse(value || '[]');
  let attachmentValue = attachmentArr;

  if (attachmentArr.length) {
    attachmentValue = attachmentArr
      .filter(item => !item.refId)
      .map((item, index) => {
        let fileUrl = item.fileUrl || item.fileRealPath;
        if (!fileUrl && item.filepath && item.filename) {
          fileUrl = `${item.filepath}${item.filename}`;
        }
        const url = new URL(fileUrl);
        const urlPathNameArr = (url.pathname || '').split('/');
        const fileName = (urlPathNameArr[urlPathNameArr.length - 1] || '').split('.')[0];
        let filePath = (url.pathname || '').slice(1).replace(fileName + item.ext, '');
        const IsLocal = md.global.Config.IsLocal;
        const host = File.isPicture(item.ext)
          ? md.global.FileStoreConfig.pictureHost
          : md.global.FileStoreConfig.documentHost;
        let searchParams = '';
        let extAttr = {};

        if (IsLocal && isRecreate && (item.viewUrl || item.previewUrl)) {
          const filelink = new URL(host);
          filePath = filePath.replace(filelink.pathname.slice(1), '');
          searchParams = (item.viewUrl || item.previewUrl).match(/\?.*/)[0];
          isRelation && (extAttr = { ext: item.ext, previewUrl: item.previewUrl });
        }

        return {
          ...extAttr,
          fileID: item.fileId || item.fileID,
          fileSize: item.filesize,
          url: fileUrl + searchParams,
          viewUrl: fileUrl + searchParams,
          serverName: IsLocal && isRecreate ? host : url.origin + '/',
          filePath,
          fileName,
          fileExt: item.ext,
          originalFileName: item.originalFilename,
          key: uuidv4(),
          oldOriginalFileName: item.originalFilename,
          index,
        };
      });
  }
  return JSON.stringify({
    attachments: attachmentValue,
    knowledgeAtts: [],
    attachmentData: [],
  });
}

export async function fillRowRelationRows(control, rowId, worksheetId, isRecreate = false) {
  let defSource = '';
  let filledControl = control;
  await worksheetAjax
    .getRowRelationRows({
      controlId: control.controlId,
      rowId,
      worksheetId,
      pageIndex: 1,
      pageSize: 200,
      getWorksheet: true,
    })
    .then(res => {
      if (res.resultCode === 1) {
        const subControls = ((res.template || {}).controls || []).filter(
          c => !_.includes(SYSTEM_FIELD_IDS, c.controlId),
        );
        const staticValue = (res.data || []).map(item => {
          let itemValue = {};
          subControls.forEach(c => {
            if (isRecreate && c.type === 29 && c.advancedSetting.showtype === '3') {
              let value = JSON.parse(item[c.controlId]).slice(0, 5);
              itemValue[c.controlId] = JSON.stringify(value);
              return;
            }
            itemValue[c.controlId] =
              c.type === WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT
                ? formatAttachmentValue(item[c.controlId], isRecreate, true)
                : item[c.controlId];
          });
          return itemValue;
        });
        defSource = [{ cid: '', rcid: '', isAsync: false, staticValue: JSON.stringify(staticValue) }];
      }
      filledControl.defsource = JSON.stringify(defSource);
      filledControl.advancedSetting = {
        ...control.advancedSetting,
        defsource: JSON.stringify(defSource),
      };
    });
  return filledControl;
}

export async function handleRowData(props) {
  const { rowId, worksheetId, columns } = props;
  const data = await worksheetAjax.getRowDetail({
    checkView: true,
    getType: 1,
    rowId: rowId,
    worksheetId: worksheetId,
  });
  if (data.resultCode === 1) {
    let defaultData = JSON.parse(data.rowData || '{}');

    let subTablePromise = [];
    let defcontrols = _.cloneDeep(columns);
    _.forIn(defaultData, (value, key) => {
      let control = columns.find(l => l.controlId === key);
      if (!control) return;
      else if ([38, 32, 33].includes(control.type) || (control.fieldPermission || '111').split('')[2] === '0') {
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
        const sourceControl = columns.find(l => l.controlId === sourceId);
        defaultData[key] =
          sourceControl.type === 29 && ['2', '5', '6'].includes(sourceControl.advancedSetting.showtype)
            ? undefined
            : value;
      } else {
        defaultData[key] = value;
      }
    });

    const res = await Promise.all(subTablePromise);
    res.forEach(item => {
      const index = _.findIndex(defcontrols, o => {
        return o.controlId == item.controlId;
      });
      (defaultData[item.controlId] = undefined), index > -1 && (defcontrols[index] = item);
    });

    return { defaultData, defcontrols };
  }
}
