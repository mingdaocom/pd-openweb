import _ from 'lodash';
import sheetAjax from 'src/api/worksheet.js';
import { controlState, getCurrentValue } from 'src/components/newCustomFields/tools/utils.js';
import RegExpValidator from 'src/util/expression';

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
}) => {
  localStorage.removeItem('scanRelateRecordValues');
  if (!window.isMingDaoApp) return;

  // 允许扫码输入&在显示表单前先获取输入(文本、附件、关联记录)
  const scanCodeData = controls
    .filter(
      v =>
        controlState(v).editable &&
        controlState(v).visible &&
        ((v.type === 2 && v.advancedSetting.scantype) || _.includes([14, 29], v.type)) &&
        v.advancedSetting.getinput === '1',
    )
    .map(item => {
      const { updateRelateRecordTableCount, updateWorksheetControls, ...rest } = item;
      return rest;
    });

  if (!scanCodeData.length) return;

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
    if (!window.MDJS || !window.MDJS.scanWithControls) return;
    window.MDJS.scanWithControls({
      controls: scanCodeData,
      shouldStartWithControl: cid => {
        // 每个字段开始扫码时, App会调用
        // H5根据当前字段的显隐, 只读状况返回
        // 字段显示且非只读时, 返回true, 否则返回false
        // 返回false 后, App会继续请求下一个字段的情况
        // 如果没有其他字段了, 会调用success
        return true;
      },
      success: function (res) {
        // 每个字段完成取值后都会执行一次
        const { finished, lastInputCid, cid, result = {}, shouldRestart } = res || {};
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
            updateData({
              controlId: cid,
              value: JSON.stringify({
                attachments: originValue.concat(JSON.parse(value)),
                knowledgeAtts: [],
                attachmentData: [],
              }),
            });
          } else {
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
          getRelateData(control, content, result, worksheetInfo, updateData);
        } else {
          alert(_l('无法关联，此记录不在可关联的范围内'), 3);
        }
      });
    return;
  } else {
    const result = content.match(/app\/(.*)\/(.*)\/(.*)\/row\/(.*)/);
    if (result) {
      const [url, appId, worksheetId, viewId, rowId] = result;
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
  const scanControl = _.find(_.get(worksheetInfo, 'template.controls') || [], it => it.controlId === scancontrolid);

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

  sheetAjax
    .getFilterRows({
      worksheetId: control.dataSource,
      viewId: extra.viewId,
      searchType: 1,
      pageSize: 20,
      pageIndex: 1,
      status: 1,
      keyWords: scancontrol === '1' && scancontrolid ? '' : content,
      isGetWorksheet: true,
      getType: 7,
      sortControls: [],
      filterControls: [],
      fastFilters:
        scancontrol === '1' && scancontrolid && !extra.rowId
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
      ...extra,
    })
    .then(res => {
      const titleControl = _.find(_.get(control, 'relationControls'), i => i.attribute === 1) || {};
      const firstRow = res.data && res.data.length ? res.data[0] : {};
      const nameValue = titleControl ? firstRow[titleControl.controlId] : undefined;
      const relateDataInfo = {
        isNew: true,
        isWorksheetQueryFill: _.get(control.advancedSetting || {}, 'showtype') === '1',
        sourcevalue: JSON.stringify(firstRow),
        row: firstRow,
        type: 8,
        sid: firstRow.rowid,
        name: getCurrentValue(titleControl, nameValue, { type: 2 }),
      };
      let isNoRepeat = true;
      const scanRelateRecordValues = localStorage.getItem('scanRelateRecordValues')
        ? JSON.parse(localStorage.getItem('scanRelateRecordValues'))
        : {};
      console.log(scanRelateRecordValues, 'scanRelateRecordValues');
      if (!scanRelateRecordValues[control.controlId]) {
        scanRelateRecordValues[control.controlId] = [relateDataInfo];
        localStorage.setItem('scanRelateRecordValues', JSON.stringify(scanRelateRecordValues));
      } else {
        const currentRelateRecords = scanRelateRecordValues[control.controlId];
        isNoRepeat = _.findIndex(currentRelateRecords || [], v => v.sid === relateDataInfo.sid) === -1;
        scanRelateRecordValues[control.controlId] =
          _.findIndex(currentRelateRecords || [], v => v.sid === relateDataInfo.sid) === -1
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
      });
    });
};

// 关联记录关联成功将当前关联数据通过js sdk返回给APP
const handleScanRelationLoaded = ({ controlId, controlName, title, rowId, type, msg }) => {
  if (!window.MDJS || !window.MDJS.scanRelationLoaded) return;
  window.MDJS.scanRelationLoaded({
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
