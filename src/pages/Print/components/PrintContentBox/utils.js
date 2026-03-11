import _ from 'lodash';
import sheetAjax from 'src/api/worksheet';
import instance from 'src/pages/workflow/api/instanceVersion';
import processAjax from 'src/pages/workflow/api/processVersion';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { getTranslateInfo } from 'src/utils/app';
import { renderText as renderCellText } from 'src/utils/control';
import { fromType, typeForCon } from '../../core/config';

export const getAttributeName = (receiveControls, rowValue) => {
  const { controlValues } = rowValue;
  let dat = receiveControls.filter(o => ![43, 49].includes(o.type) && o.controlId !== 'wfcotime'); //去除 文本识别 43 接口查询按钮
  let control = dat.find(it => it.attribute === 1);
  if (!control) return '';

  control.value = controlValues.find(it => it.id === control.controlId)?.value;
  let attributeName = renderCellText(control) || '';

  return attributeName;
};

export const getApproval = ({ rowId, approvalIds, params, updateApprovalAjax }) => {
  const { from, printType, type, worksheetId, appId } = params;

  if (printType && printType === 'flow') return Promise.resolve([]);

  let promiseList = [
    instance.getTodoList2({
      startAppId: worksheetId,
      startSourceId: rowId,
      complete: true,
    }),
    instance.getTodoList2({
      startAppId: worksheetId,
      startSourceId: rowId,
    }),
  ];

  if (from === fromType.FORM_SET && type !== typeForCon.PREVIEW) {
    promiseList.push(
      processAjax.list({
        relationId: appId,
        processListType: '11',
      }),
    );
  }

  return Promise.all(promiseList).then(([res1, res2, res3 = []]) => {
    let ajaxWithProcessIdMap = {};
    let res = res1.concat(res2);
    const otherProcess = res3.find(l => l.groupId === worksheetId);
    const otherApproval = otherProcess
      ? otherProcess.processList
          .filter(l => !res.find(m => l.id === _.get(m, 'process.parentId')))
          .map(l => ({ ...l, checked: !!approvalIds.find(m => m === l.id), processId: l.id }))
      : [];

    res.forEach(item => {
      const requestFn = () =>
        instance.get2({
          id: item.id,
          workId: item.workId,
        });
      if (_.has(ajaxWithProcessIdMap, item.process.parentId)) {
        ajaxWithProcessIdMap[item.process.parentId].ajaxList.push(requestFn);
        ajaxWithProcessIdMap[item.process.parentId].originalData.push(item);
      } else {
        ajaxWithProcessIdMap[item.process.parentId] = {
          ajaxList: [requestFn],
          alreadyGet: false,
          originalData: [item],
        };
      }
    });
    updateApprovalAjax(ajaxWithProcessIdMap);
    const approvalList = res.map(item => ({
      name: item.process.name,
      processId: item.process.parentId,
      checked: !!approvalIds.find(l => l === item.process.parentId),
    }));
    return approvalList.concat(otherApproval);
  });
};

export const getApprovalDetail = ({ approvalList, approvalRef, params }) => {
  const { ajaxList, originalData } = approvalRef;
  const { appId } = params;
  return Promise.all(ajaxList.map(fn => fn())).then(resData => {
    resData.forEach((item, index) => {
      let _index = approvalList.findIndex(m => m.processId === item.parentId);
      approvalList[_index].checked = true;
      const data = { ...originalData[index], processInfo: item, checked: true };
      data.processInfo.works?.forEach(work => {
        work.flowNode.name = getTranslateInfo(appId, item.parentId, work.flowNode.id).nodename || work.flowNode.name;
      });
      if (!approvalList[_index].child) approvalList[_index].child = [data];
      else approvalList[_index].child.push(data);
    });
    return approvalList;
  });
};

export const isRelationControl = type => {
  return [34, 51, 29].includes(type);
};

const formatRelationRows = (res, rowIds, controls) => {
  const result = {};

  res.forEach((controlGroup, i) => {
    const controlId = controls[i]?.controlId;
    if (!controlId || !_.isArray(controlGroup)) return;

    controlGroup.forEach((item, j) => {
      const rowId = rowIds[j];
      if (!rowId) return;

      if (!result[rowId]) {
        result[rowId] = {};
      }

      result[rowId][controlId] = item;
    });
  });

  return result;
};

export const getAllRelationRows = ({ params, relationControls, controlProcessedMap }) => {
  const { worksheetId, rowIds } = params;

  const promiseList = relationControls.map(control => {
    const filtersMap = rowIds.reduce((acc, rowId) => {
      const filters =
        getFilter({
          control: { ...control, recordId: rowId },
          formData: controlProcessedMap[rowId],
          filterKey: 'resultfilters',
        }) || [];

      // 过滤空值 & 空数组
      if (!filters?.length) {
        return acc;
      }

      acc[rowId] = filters;
      return acc;
    }, {});

    return sheetAjax.getRowRelationRows({
      worksheetId,
      controlId: control.controlId,
      getRules: true,
      getWorksheet: true,
      keywords: '',
      pageIndex: 1,
      pageSize: control?.type === 51 && control.enumDefault === 1 ? 1 : 1000,
      rowids: rowIds,
      rowAndFilterControls: filtersMap,
      getType: 5,
    });
  });

  return Promise.all(promiseList).then(res => {
    if (!res.length) return {};

    const dataMap = formatRelationRows(res, rowIds, relationControls);
    console.log('dataMap', dataMap);
    return dataMap;
  });
};

export const findLastVisibleByBinary = (pageElements, viewBottom) => {
  let left = 0;
  let right = pageElements.length - 1;
  let result = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midTop = pageElements[mid].offsetTop;

    if (midTop < viewBottom) {
      result = mid; // mid 是可见的，尝试找更靠后的
      left = mid + 1;
    } else {
      right = mid - 1; // mid 不可见，往前找
    }
  }

  return result + 1; // 页码（1-based）
};
