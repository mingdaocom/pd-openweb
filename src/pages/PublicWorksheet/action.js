import qs from 'query-string';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import { getControlRules } from 'src/api/worksheet';
import { getDisabledControls, overridePos } from 'src/pages/publicWorksheetConfig/utils';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils';
// import { formatFileControls } from 'src/pages/Mobile/Record';
import { getInfo } from './utils';
import { browserIsMobile } from 'src/util';

function getVisibleControls(data) {
  const disabledControlIds = getDisabledControls(
    data.originalControls,
    _.pick(data, [
      'ipControlId',
      'browserControlId',
      'deviceControlId',
      'systemControlId',
      'extendSourceId',
      'ipControlId',
    ]),
  );
  const needHidedControlIds = data.hidedControlIds.concat(disabledControlIds);
  return overridePos(data.originalControls, data.controls).map(c => ({
    ...c,
    advancedSetting: {
      ...(c.advancedSetting || {}),
      showtype: c.type === 29 && (c.advancedSetting || {}).showtype === '2' ? '1' : (c.advancedSetting || {}).showtype,
    },
    controlPermissions:
      _.find(needHidedControlIds, hcid => c.controlId === hcid) ||
      (c.type === 29 && !_.includes([0, 1], c.enumDefault2)) // 条件：关联表控件不允许选择已有记录
        ? '000'
        : c.controlPermissions,
    fieldPermission: c.fieldPermission ? c.fieldPermission.slice(0, 2) + '1' : '',
  }));
}

export function getPublicWorksheetInfo(worksheetId, cb) {
  publicWorksheetAjax.getPublicWorksheetInfo({ worksheetId }).then(data => {
    const controls = getVisibleControls(data);
    cb(false, {
      publicWorksheetInfo: {
        ...data,
        logoUrl: data.logo,
        themeIndex: data.themeColor,
        coverUrl: data.cover,
        visibleType: 2,
      },
      formData: controls,
    });
  });
}

export function getPublicWorksheet(shareId, cb = (err, data) => {}) {
  publicWorksheetAjax
    .getPublicWorksheet({ shareId })
    .then(data => {
      if (!data || data.visibleType !== 2) {
        cb(true, {
          publicWorksheetInfo: {
            logoUrl: data.logo,
            name: data.name,
            themeIndex: data.themeColor,
            coverUrl: data.cover,
            projectName: data.projectName,
            worksheetId: data.worksheetId,
          },
        });
        return;
      }
      data.shareAuthor && (window.shareAuthor = data.shareAuthor);
      const controls = getVisibleControls(data);
      getControlRules({
        worksheetId: data.worksheetId,
        type: 1, // 1字段显隐
      }).then(rules => {
        cb(false, {
          publicWorksheetInfo: {
            ...data,
            logoUrl: data.logo,
            themeIndex: data.themeColor,
            coverUrl: data.cover,
          },
          formData: controls,
          rules,
        });
      });
    })
    .fail(err => {
      cb(true);
    });
}

function getInfoControl(formData, publicWorksheetInfo) {
  const info = getInfo();
  const { originalControls } = publicWorksheetInfo;
  const staticControlIds = [
    publicWorksheetInfo.browserControlId,
    publicWorksheetInfo.deviceControlId,
    publicWorksheetInfo.systemControlId,
    publicWorksheetInfo.extendSourceId,
    publicWorksheetInfo.ipControlId,
  ];
  const staticControls = originalControls.filter(control =>
    _.find(staticControlIds, scid => scid && scid === control.controlId),
  );
  return staticControls.map(item => {
    const indexOfId = staticControlIds.indexOf(item.controlId);
    return {
      ..._.pick(item, ['controlId', 'controlName', 'type']),
      value: info[['browser', 'device', 'system', 'source'][indexOfId]],
    };
  });
}

// 举报表单 自动填充
function fillReportSource(receiveControls, publicWorksheetInfo) {
  const { originalControls } = publicWorksheetInfo;
  const fromUrlControl = _.find(originalControls, oc => oc.controlName.indexOf('违规表单链接') > -1);
  if (!fromUrlControl) {
    return receiveControls;
  } else {
    let fromurl;
    try {
      fromurl = qs.parse(decodeURIComponent(location.search.slice(1))).from;
    } catch (err) {
      return receiveControls;
    }
    if (!fromurl) {
      return receiveControls;
    }
    return receiveControls
      .filter(control => control.controlId !== fromUrlControl.controlId)
      .concat({
        ...fromUrlControl,
        value: decodeURIComponent(fromurl),
      });
  }
}

function formatFileControls(controls) {
  return _.cloneDeep(controls).map(control => {
    if (control.type === 14 && control.value) {
      const parsed = JSON.parse(control.value);
      parsed.attachmentData = parsed.attachmentData.filter(item => {
        return item.accountId;
      });
      parsed.attachments = parsed.attachments.filter(item => {
        return item.key;
      });
      control.value = JSON.stringify(parsed);
    }
    return control;
  });
}

export function addWorksheetRow(
  { shareId, worksheetId, formData = [], params = {}, publicWorksheetInfo, triggerUniqueError = () => {} },
  cb = () => {},
) {
  const infoControl = getInfoControl(formData, publicWorksheetInfo);
  let receiveControls = formData
    .filter(c => !_.find(infoControl, ic => c.controlId === ic.controlId))
    .concat(infoControl)
    .filter(item => item.type !== 30 && item.type !== 31 && item.type !== 32);
  // 举报表单填充举报链接 写死id  仅公网有效
  if (shareId === 'a7f10198e9d84702b68ba35f73c94cac') {
    receiveControls = fillReportSource(receiveControls, publicWorksheetInfo);
  }
  if (browserIsMobile()) {
    receiveControls = formatFileControls(receiveControls);
  }
  publicWorksheetAjax
    .addRow({
      shareId,
      worksheetId,
      receiveControls: receiveControls.map(formatControlToServer),
      ...params,
    })
    .then(data => {
      if (data.resultCode === 1) {
        cb(null, data);
      } else {
        cb(true);
        if (data.resultCode === 11) {
          triggerUniqueError(data.badData);
        } else if (data.resultCode === 14) {
          alert(_l('验证码错误'), 3);
        } else if (data.resultCode === 8) {
          alert(_l('你访问的表单已停止数据收集！'), 2);
        } else {
          alert(_l('提交发生错误'), 3);
        }
      }
    })
    .fail(error => {
      cb(error);
      if (error && error.errorCode === 4017) {
        alert(_l('应用附件上传流量不足，请联系表单发布者'), 3);
      } else {
        alert(error.exception || _l('提交发生错误'), 3);
      }
    });
}
