import React from 'react';
import _ from 'lodash';
import { handleCondition } from 'src/pages/widgetConfig/util/data';
import { dealData } from 'src/pages/worksheet/redux/actions/util.js';
import { dealChildren } from 'src/pages/worksheet/redux/reducers/util.js';
import { renderText as renderCellText } from 'src/utils/control';
import { getAdvanceSetting } from 'src/utils/control';
import { AREA, TYPES } from './constants.js';

export function sortDataByCustomNavs(data, view = {}, controls = []) {
  let customItems = safeParse(_.get(view, 'advancedSetting.customnavs'), 'array');
  if (_.get(view, 'advancedSetting.navshow') === '2') {
    customItems = safeParse(_.get(view, 'advancedSetting.navfilters'), 'array');
  }
  const viewControls = _.find(controls, c => c.controlId === _.get(view, 'navGroup[0].controlId')) || {};
  const controlType = viewControls.type === 30 ? viewControls.sourceControlType : viewControls.type;
  if (!_.isEmpty(customItems) && viewControls) {
    const sortIds = customItems.map(i => {
      if (_.includes([9, 10, 11, 28], controlType)) {
        return i;
      } else {
        const itemVal = safeParse(i);
        return itemVal.id || itemVal.accountId;
      }
    });

    const keyByOrder = new Map(sortIds.map((t, i) => [t, i]));
    const sortData = _.sortBy(data, o => keyByOrder.get(o.key || o.value));
    return sortData;
  }
  return data;
}

export const getSourceControlByNav = (navGroup, controls) => {
  let source = controls.find(o => o.controlId === navGroup.controlId) || {};
  return {
    ...source,
    type: 30 === source.type ? source.sourceControlType : source.type,
  };
};

//是否需要呈现
export const isSourceTree = (source, navGroup, view) => {
  const { navshow, navlayer = '' } = getAdvanceSetting(view);
  return (
    source.type === 35 ||
    (source.type === 29 && navGroup.viewId) ||
    AREA.includes(source.type) ||
    (source.type === 27 && navshow === '2' && navlayer === '999')
  );
};

export const renderTxt = (source, keywords, item, control, viewId, navGroup) => {
  if (keywords && (source.type === 35 || (source.type === 29 && navGroup.viewId && !!viewId && !!item.path))) {
    //视图是否删除 !!viewId
    const path = safeParse(item.path, 'array');
    return path.map((text, i) => {
      const isLast = i === path.length - 1;
      if (text.indexOf(keywords) > -1) {
        return (
          <React.Fragment key={i}>
            <span className="ThemeColor3">{text}</span>
            {!isLast && <span> / </span>}
          </React.Fragment>
        );
      }
      return (
        <React.Fragment key={i}>
          {text}
          {!isLast && <span> / </span>}
        </React.Fragment>
      );
    });
  }
  return control ? renderCellText(Object.assign({}, control, { value: item[control.controlId] })) : _l('未命名');
};

export const getListByNavlayer = (data, level, info) => {
  const treeData = dealData(data);
  return expandedHierarchy({ treeData, data: data, level, info });
};
// 展开多级记录
const expandedHierarchy = ({ data = [], treeData, level, info }) => {
  const parents = _.filter(data, item => !item.pid);
  return genTree({ data: parents, treeData, level, info });
};
// 按已有顺序排序
const sortChildIds = (treeData, rowId, childrenids) => {
  const sortIds = Object.values(treeData).filter(i => i.pid === rowId);
  const idByOrder = new Map(sortIds.map((t, i) => [t.rowid, i]));
  // 未指定固定第一项
  return _.sortBy(dealChildren(childrenids), o => idByOrder.get(o));
};
// 展开多级 递归生成状态树
const genTree = (
  { data = [], treeData = {}, path = [], pathId = [], level, info } = {
    data: [],
    treeData: {},
    path: [],
    pathId: [],
    level: 0,
    info,
  },
) => {
  if (level < 0) return [];
  level = level - 1;
  const children = [];
  for (let i = 0; i < data.length; i++) {
    const rowId = _.isString(data[i]) ? data[i] : data[i].rowid;
    const node = treeData[rowId] || {};
    if (!node.rowid) return;
    const currentPath = path.concat([i]);
    const currentPathId = pathId.concat([rowId]);
    const childrenData = genTree({
      data: sortChildIds(treeData, rowId, node.childrenids),
      treeData,
      path: currentPath,
      pathId: currentPathId,
      level,
      info,
    });
    const { source, keywords, control, viewId, navGroup } = info;
    const txt = renderTxt(source, keywords, node, control, viewId, navGroup);
    children.push({
      rowId,
      value: rowId,
      path: currentPath,
      pathId: currentPathId,
      children: childrenData,
      isLeaf: !node.childrenids,
      txt, // 渲染显示文本
      text: node[control.controlId], // 原始文本
    });
  }
  return children;
};

export const formatData = (source, navGroup, controls, view) => {
  let data = [];

  switch (source.type) {
    case 9:
    case 10:
    case 11:
      const controlOptions = (controls.find(o => o.controlId === _.get(navGroup, 'controlId')) || []).options || [];
      data = (navGroup.isAsc ? controlOptions : [...controlOptions].reverse())
        .filter(o => !o.isDeleted)
        .map(o => ({
          ...o,
          txt: o.value,
          value: o.key,
        }));
      break;
    case 28: // Level
      const maxLevel = parseInt(
        _.get(
          controls.find(o => o.controlId === _.get(source, 'controlId')),
          'advancedSetting.max',
          '1',
        ),
        10,
      );
      data = Array.from({ length: maxLevel }, (_, i) => ({
        txt: _l('%0 级', i + 1),
        value: JSON.stringify(i + 1),
      }));
      if (!navGroup.isAsc) data.reverse();
      break;

    case 26: // User
    case 27: // Department
    case 48: // Organization
      const { navfilters = '[]' } = getAdvanceSetting(view);
      const filters = safeParse(navfilters, 'array');
      data = filters.map(o => {
        const item = safeParse(o) || {};
        return {
          txt: JSON.stringify({
            [TYPES[source.type].id]: item.id,
            [TYPES[source.type].name]: item.name,
            avatar: item.avatar,
          }),
          value: item.id,
          isLeaf: false,
        };
      });

      break;
  }

  return data;
};

export const transformCountsToData = counts => {
  return counts
    .filter(o => !['all', ''].includes(o.key)) //排除全部和空
    .map(item => ({
      value: item.key,
      txt: item.name, //renderTxt(item, control, viewId),
      isLeaf: false,
    }));
};

export const buildNavGroupFilters = (view, source, controls, keywords) => {
  const { navsearchcontrol = '', navsearchtype = '' } = getAdvanceSetting(view);
  return [
    {
      spliceType: 1,
      isGroup: true,
      groupFilters: [
        {
          dataType: (
            ((controls.find(o => o.controlId === _.get(source, 'controlId')) || {}).relationControls || []).find(
              o => o.controlId === navsearchcontrol,
            ) || {}
          ).type,
          spliceType: 1,
          dynamicSource: [],
          controlId: navsearchcontrol,
          values: [keywords],
          filterType: navsearchtype === '1' ? 2 : 1,
        },
      ],
    },
  ];
};

export const getAllDepartmentIds = view => {
  let ids = [];
  const { navfilters = '[]' } = getAdvanceSetting(view);
  const filters = safeParse(navfilters, 'array');
  filters.map(o => {
    const item = safeParse(o) || {};
    ids = ids.concat(item.id);
  });
  return ids.filter(o => !!o);
};

// 准备请求参数
export const prepareRequestParams = ({ worksheetId, viewId, rowId, appId }, view, source, controls, keyWords) => {
  const { navfilters = '[]', navshow, navlayer } = getAdvanceSetting(view);
  const filters = safeParse(navfilters, 'array'); // 解析导航过滤器

  // 基础参数
  let params = {
    worksheetId,
    viewId,
    pageIndex: 1,
    pageSize: 10000,
    isGetWorksheet: true,
    kanbanKey: rowId,
    keyWords,
  };

  // 级联选择字段特殊处理
  if (source.type === 35) {
    params.getType = 10;
  } else {
    // 关联字段参数
    params = {
      ...params,
      appId,
      searchType: 1,
      getType: !viewId ? 7 : 10, // 7表示基础查询，10表示层级查询
      viewId: viewId || source.viewId,
    };
  }

  // 添加过滤条件
  if (source.type !== 35 && filters.length > 0 && navshow === '3') {
    params.filterControls = filters.map(handleCondition);
  }

  // 关联字段特殊处理
  if (source.type === 29) {
    // 添加排序控制
    params.sortControls = safeParse(_.get(view, 'advancedSetting.navsorts'), 'array');
    // 搜索
    if (keyWords) {
      if (_.get(source, 'advancedSetting.searchcontrol')) {
        // 使用字段自带的搜索控件
        params.controlId = _.get(source, 'controlId');
      }
      if (_.get(view, 'advancedSetting.navsearchcontrol')) {
        // 使用视图配置的搜索控件
        params.keyWords = undefined;
        params.getType = 7;
        params.navGroupFilters = buildNavGroupFilters(view, source, controls, keyWords); // 构建导航组过滤器
      }
    }
  }

  if ((source.type === 35 || source.type === 29) && !!navlayer && !['1', '999'].includes(navlayer) && !keyWords) {
    params.layer = navlayer;
  }

  return params;
};
