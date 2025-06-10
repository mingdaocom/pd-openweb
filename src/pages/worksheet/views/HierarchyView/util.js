import _ from 'lodash';
import { SYSTEM_CONTROLS } from 'worksheet/constants/enum';
import { getTitleControlForCard } from 'src/pages/worksheet/views/util.js';
import { getAdvanceSetting } from 'src/utils/control';
import { renderText as renderCellText } from 'src/utils/control';
import {
  filterAndFormatterControls,
  getMultiRelateViewConfig,
  getRecordAttachments,
  RELATION_SHEET_TYPE,
  RENDER_RECORD_NECESSARY_ATTR,
} from '../util';

// 获取svg的相关位置数据
export const getPosition = ($parent, $cur, scale = 1, isStraightLine = false) => {
  if (!$parent || !$cur) return {};
  const { top, bottom, height } = $parent.getBoundingClientRect();
  const { top: curTop, bottom: curBottom, height: curHeight } = $cur.getBoundingClientRect();
  // svg元素的高度
  const svgHeight = Math.max(bottom - top, curBottom - top, curBottom - curTop, bottom - curTop) / scale;
  // svg向上位移的像素值
  const svgTop = curTop - top;
  // 曲线起点坐标, -10 是为了抵消marginBottom值
  const startY = ($parent.className || '').includes('sortableVerticalTreeNodeWrap')
    ? Math.ceil((height + 6) / scale)
    : Math.ceil((height - 8) / 2 / scale);
  const startPoint = [isStraightLine ? 16 : 28, startY];
  // 曲线终点坐标
  const endY = Math.ceil(((curHeight - 8) / 2 + svgTop) / scale);

  const endPoint = [isStraightLine ? 100 : 120, endY];

  return {
    height: svgHeight,
    top: svgTop / scale,
    start: startPoint,
    end: endPoint,
    straightLineInflection: [16, endY],
  };
};

export const dealHierarchyData = (
  item,
  { worksheetControls, currentView, stateData = {}, hierarchyRelateSheetControls },
) => {
  let { displayControls, coverCid, childType, viewControl, viewControls = [] } = currentView;
  const { abstract = '', viewtitle = '' } = getAdvanceSetting(getMultiRelateViewConfig(currentView, stateData));

  if (String(childType) === '2') {
    const { path = [] } = stateData;
    if (path.length > 1) {
      const viewConfig = viewControls[path.length - 1] || {};
      const { showControls = [], worksheetId: relateSheetId } = viewConfig;
      worksheetControls = hierarchyRelateSheetControls[relateSheetId];
      displayControls = showControls;
      coverCid = viewConfig.coverCid || [];
    }
  }

  if (_.isEmpty(item) || _.isEmpty(currentView) || _.isEmpty(worksheetControls)) return {};
  if (!viewControl && _.isEmpty(viewControls)) return {};
  const getControlById = id => _.find(worksheetControls.concat(SYSTEM_CONTROLS), item => item.controlId === id);
  // const selectControl = getControlById(viewControl);
  const titleControl = getTitleControlForCard({ advancedSetting: { viewtitle } }, worksheetControls);
  // if (selectControl) {
  const { pid, rowid: rowId, allowedit: allowEdit, allowdelete: allowDelete, childrenids = '', ...rest } = item;
  const items = [];
  if (titleControl) {
    items.push({
      ..._.pick(titleControl, RENDER_RECORD_NECESSARY_ATTR),
      value: item[titleControl.controlId],
    });
  }
  const displayItems = _.filter(displayControls, item => item !== (titleControl || {}).controlId)
    .filter(getControlById)
    .map(key => ({
      ..._.pick(getControlById(key), RENDER_RECORD_NECESSARY_ATTR),
      value: item[key],
    }));
  items.push(...displayItems);
  let formData = worksheetControls.map(o => {
    return { ...o, value: item[o.controlId] };
  });
  return {
    rowId,
    item,
    fields: items.filter(i => !_.includes([51], i.type)),
    allowEdit,
    allowDelete,
    ...getRecordAttachments(item[coverCid]),
    coverData: { ...(worksheetControls.find(it => it.controlId === coverCid) || {}), value: item[coverCid] },
    formData,
    abstractValue: abstract
      ? renderCellText({
          ...(worksheetControls.find(it => it.controlId === abstract) || {}),
          value: item[abstract],
        })
      : '',
  };
  // }
};

export const getRelateDefaultValue = (item, { worksheetControls, currentView }) => {
  const recordData = dealHierarchyData(item, {
    currentView,
    worksheetControls,
  });
  return JSON.stringify([{ sid: item.rowid, sourcevalue: JSON.stringify(recordData.item) }]);
};

export const hierarchyViewCanSelectFields = ({ controls, worksheetId }) => {
  const getRelationName = parent => {
    const { controlName, sourceControlId } = parent;
    const { controlName: subName } = _.find(controls, item => item.controlId === sourceControlId) || {};
    return `${controlName}-${subName}`;
  };
  return filterAndFormatterControls({
    controls: controls,
    filter: item => item.type === RELATION_SHEET_TYPE && item.enumDefault === 1 && item.dataSource === worksheetId,
    formatter: item => ({
      text: getRelationName(item),
      value: item.controlId,
      icon: 'link-worksheet',
    }),
  });
};

export const getRelateSheetId = (view = {}, pathId) => {
  const { viewControls, childType } = view;
  if (String(childType) !== '2' || configIndex === 0 || viewControls.length === 1) return undefined;

  const configIndex = pathId.length - 1;
  const currentViewControl =
    viewControls && viewControls.length && configIndex > 0 ? viewControls[configIndex - 1] || {} : {};

  return currentViewControl.worksheetId;
};
