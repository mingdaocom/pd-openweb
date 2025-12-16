import _ from 'lodash';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import sheetAjax from 'src/api/worksheet.js';
import { controlState, getCurrentValue } from 'src/components/Form/core/formUtils';
import RegExpValidator from 'src/utils/expression';
import { compatibleMDJS } from 'src/utils/project';

let timer = null;

/**
 * 对接APP前置扫码
 * @param {*} controls - 表单字段
 * @param {*} worksheetInfo
 * @param {*} updateData - 更新数据
 * @param {*} handleSubmit - 提交表单
 * @param {*} onCancel - 手动取消
 * @returns
 */
export const handleAPPScanCode = ({
  controls,
  worksheetInfo,
  updateData = () => {},
  handleSubmit = () => {},
  onCancel = () => {},
  handleReStart = () => {},
  handOverNavigation = () => {},
}) => {
  localStorage.removeItem('scanRelateRecordValues');
  if (!window.isMingDaoApp) return;

  // 允许扫码输入&在显示表单前先获取输入(文本、附件、关联记录)
  const scanCodeData = controls
    .filter(
      v =>
        controlState(v, 2).editable &&
        controlState(v, 2).visible &&
        ((v.type === 2 && v.advancedSetting.scantype) || _.includes([14, 29], v.type)) &&
        v.advancedSetting.getinput === '1',
    )
    .map(item => {
      const { ...rest } = item;
      return rest;
    });

  if (!scanCodeData.length) return;
  let scanFinishData = _.clone(controls); // 扫码完成后更新数据

  // 获取后是否提交表单
  const isSave = _.findIndex(scanCodeData, c => c.advancedSetting.getsave === '1') !== -1;
  // 是否继续创建
  const isContinueNext =
    _.findIndex(
      controls,
      c => c.advancedSetting.createnext === '1' || (c.advancedSetting.getsave === '1' && !c.advancedSetting.createnext),
    ) !== -1;
  clearTimeout(timer);
  timer = setTimeout(() => {
    compatibleMDJS('scanWithControls', {
      controls: scanCodeData,
      shouldStartWithControl: () => {
        // 每个字段开始扫码时, App会调用
        // H5根据当前字段的显隐, 只读状况返回
        // 字段显示且非只读时, 返回true, 否则返回false
        // 返回false 后, App会继续请求下一个字段的情况
        // 如果没有其他字段了, 会调用success
        return true;
      },
      updateH5watermark: h5watermark => {
        // 确认开始后, 如果是附件字段且包含h5watermak
        // App会调用该方法, H5需要将替换后的h5watermak返回
        // 将除了4个系统字段外的字段都替换为对应的值
        let newText = '';
        const h5watermarkArr = h5watermark.split('$');
        const data = scanFinishData.filter(v => _.includes([2, 3, 4, 5, 6, 8, 15, 16, 46], v.type));
        newText = h5watermarkArr
          .map(item => {
            const c = _.find(data, v => v.controlId === item);
            return _.includes(['user', 'time', 'address', 'xy'], item) ? `$${item}$` : c ? c.value : item;
          })
          .join('');
        return newText;
      },
      success: function (res) {
        // 每个字段完成取值后都会执行一次
        const { finished, cid, result = {}, shouldRestart } = res || {};
        const { value } = result;
        // finished; // true/false 完成扫码
        // lastInputCid; // 最后一个执行的字段id
        // shouldRestart // 用户放弃已存储的数据, 重新开始

        if (shouldRestart) {
          handleReStart();
          return;
        }

        if (cid && value) {
          const currentControl = _.find(scanCodeData, v => v.controlId === cid);
          if (currentControl.type === 29) {
            // 关联记录
            handleRelateRow(currentControl, value, worksheetInfo, updateData);
          } else if (currentControl.type === 14) {
            // 附件
            const originValue = currentControl.value ? JSON.parse(currentControl.value) : [];
            if (_.isObject(originValue)) {
              const { attachments = [], attachmentData = [] } = originValue;
              updateData({
                controlId: cid,
                value: JSON.stringify({
                  attachments: attachments.concat(JSON.parse(value)),
                  knowledgeAtts: [],
                  attachmentData,
                }),
              });
            } else {
              updateData({
                controlId: cid,
                value: JSON.stringify({
                  attachments: JSON.parse(value),
                  knowledgeAtts: [],
                  attachmentData: originValue,
                }),
              });
            }
          } else {
            const index = _.findIndex(scanFinishData, v => v.controlId === cid);
            scanFinishData[index] = { ...scanFinishData[index], value };
            updateData({ controlId: cid, value });
          }
        }
        // 执行至最后一个字段
        if (finished && isSave) {
          handleSubmit(isContinueNext);
        }
      },
      cancel: function () {
        // 用户取消, H5端需要结束创建流程, 关闭创建页面
        handOverNavigation(true);

        onCancel();
      },
    });
  }, 200);
};

/**
 * 处理关联数据扫码
 * @param {*} control - 扫码字段
 * @param {*} content - 扫码结果
 * @param {*} worksheetInfo
 * @param {*} updateData - 更新数据
 * @returns
 */
export const handleRelateRow = (control = {}, content, worksheetInfo, updateData) => {
  const currentWorksheetId = control.dataSource;
  if (content.includes('worksheetshare') || content.includes('public/record')) {
    const shareId = (content.match(/\/worksheetshare\/(.*)/) || content.match(/\/public\/record\/(.*)/))[1];
    sheetAjax
      .getShareInfoByShareId({
        shareId,
      })
      .then(result => {
        result = result.data || {};
        if (currentWorksheetId === result.worksheetId) {
          getRelateData(control, content, { ...result, isShareLink: true }, worksheetInfo, updateData);
        } else {
          alert(_l('无法关联，此记录不在可关联的范围内'), 3);
        }
      });
    return;
  } else {
    const result = content.match(/app\/(.*)\/(.*)\/(.*)\/row\/(.*)/);
    if (result) {
      const [, appId, worksheetId, viewId, rowId] = result;
      const { scanlink } = _.get(control, 'advancedSetting') || {};
      if (appId && worksheetId && viewId && rowId) {
        if (scanlink !== '1') {
          return;
        }
        if (currentWorksheetId === worksheetId) {
          getRelateData(control, content, { appId, worksheetId, viewId, rowId }, worksheetInfo, updateData);
        } else {
          alert(_l('无法关联，此记录不在可关联的范围内'), 3);
        }
      } else {
        getRelateData(control, content, {}, worksheetInfo, updateData);
      }
    } else {
      getRelateData(control, content, {}, worksheetInfo, updateData);
    }
  }
};

/**
 * 根据扫码结果获取关联记录记录
 * @param {*} control - 扫码字段
 * @param {*} content - 扫码结果
 * @param {*} extra - 额外参数
 * @param {*} worksheetInfo
 * @param {*} updateData - 更新数据
 * @returns
 */
const getRelateData = (control = {}, content, extra = {}, worksheetInfo = {}, updateData) => {
  const { controlId, controlName } = control;
  const { scanlink, scancontrol, scancontrolid } = _.get(control, 'advancedSetting') || {};
  const scanControl =
    _.find(_.get(worksheetInfo, 'template.controls') || [], it => it.controlId === scancontrolid) || {};

  const handleRelateResult = firstRow => {
    const titleControl = _.find(_.get(control, 'relationControls'), i => i.attribute === 1) || {};
    const nameValue = titleControl ? firstRow[titleControl.controlId] : undefined;
    const relateDataInfo =
      firstRow && !_.isEmpty(firstRow)
        ? {
            isNew: true,
            isWorksheetQueryFill: _.get(control.advancedSetting || {}, 'showtype') === '1',
            sourcevalue: JSON.stringify(firstRow),
            row: firstRow,
            type: 8,
            sid: firstRow.rowid,
            name: getCurrentValue(titleControl, nameValue, { type: 2 }),
          }
        : {};
    let isNoRepeat = true;
    const scanRelateRecordValues = localStorage.getItem('scanRelateRecordValues')
      ? JSON.parse(localStorage.getItem('scanRelateRecordValues'))
      : {};
    if (!scanRelateRecordValues[control.controlId] && !_.isEmpty(relateDataInfo)) {
      scanRelateRecordValues[control.controlId] = [relateDataInfo];
      localStorage.setItem('scanRelateRecordValues', JSON.stringify(scanRelateRecordValues));
    } else {
      const currentRelateRecords = scanRelateRecordValues[control.controlId];
      isNoRepeat = _.findIndex(currentRelateRecords || [], v => v.sid === relateDataInfo.sid) === -1;
      scanRelateRecordValues[control.controlId] =
        !_.isEmpty(relateDataInfo) && _.findIndex(currentRelateRecords || [], v => v.sid === relateDataInfo.sid) === -1
          ? currentRelateRecords.concat(relateDataInfo)
          : currentRelateRecords;
      localStorage.setItem('scanRelateRecordValues', JSON.stringify(scanRelateRecordValues));
    }
    if (!_.isEmpty(firstRow)) {
      updateData({
        controlId: control.controlId,
        value: JSON.stringify(scanRelateRecordValues[control.controlId]),
        isInit: true,
      });
    }

    handleScanRelationLoaded({
      controlId,
      controlName,
      title: getCurrentValue(titleControl, nameValue, { type: 2 }),
      rowId: firstRow.rowid,
      type: !isNoRepeat ? '3' : _.isEmpty(firstRow) ? '1' : undefined,
      msg: !isNoRepeat ? undefined : _.isEmpty(firstRow) ? _l('无法关联，此记录不在可关联的范围内') : undefined,
    });
  };

  if (
    (scanlink !== '1' && RegExpValidator.isURL(content)) ||
    (scancontrol !== '1' && !RegExpValidator.isURL(content))
  ) {
    handleScanRelationLoaded({
      controlId,
      controlName,
      title: '',
      rowId: '',
      type: '2',
    });
    return;
  }

  const { appId, worksheetId, viewId, rowId, isShareLink } = extra;

  // 处理公开分享链接（getFilterRows无权限访问）
  if (isShareLink) {
    sheetAjax
      .getRowDetail({
        appId,
        worksheetId,
        viewId,
        rowId,
        checkView: true,
        getTemplate: true,
        getType: 1,
      })
      .then(res => {
        handleRelateResult(res.rowData ? JSON.parse(res.rowData) : undefined);
      });
    return;
  }

  const requestParams = {
    appId,
    worksheetId: control.dataSource,
    viewId,
    searchType: 1,
    pageSize: 20,
    pageIndex: 1,
    status: 1,
    isGetWorksheet: true,
    getType: 7,
    sortControls: [],
    filterControls: rowId
      ? [
          {
            controlId: 'rowid',
            dataType: 2,
            spliceType: 1,
            filterType: 2,
            dynamicSource: [],
            values: [rowId],
          },
        ]
      : [],
    keyWords: scancontrol === '1' && scancontrolid ? '' : content,
    langType: window.shareState.shareId ? getCurrentLangCode() : undefined,
    fastFilters:
      scancontrol === '1' && scancontrolid && !rowId
        ? [
            {
              controlId: scancontrolid,
              dataType: scanControl.type,
              spliceType: 1,
              filterType: 1,
              dateRange: 0,
              minValue: '',
              maxValue: '',
              value: '',
              values: [content],
            },
          ]
        : [],
  };

  const getFilterRowsPromise = window.isPublicWorksheet ? publicWorksheetAjax.getRelationRows : sheetAjax.getFilterRows;

  getFilterRowsPromise(requestParams).then(res => {
    const firstRow = res.data && res.data.length ? res.data[0] : {};
    handleRelateResult(firstRow);
  });
};

// 关联记录关联成功将当前关联数据通过js sdk返回给APP
const handleScanRelationLoaded = ({ controlId, controlName, title, rowId, type, msg }) => {
  compatibleMDJS('scanRelationLoaded', {
    cid: controlId,
    cname: controlName,
    relation: _.includes(['2', '3'], type)
      ? {}
      : {
          title: title, //关联记录的标题, 注意转换为纯文本提供
          rowId: rowId, //关联记录的Id
        },
    error: {
      type, //"1": 无数据, "2": 不在关联范围内,
      msg, // 对应描述
    },
  });
};
