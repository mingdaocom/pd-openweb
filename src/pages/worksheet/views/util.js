import { find, get } from 'lodash';
import _ from 'lodash';
import { permitList } from 'src/pages/FormSet/config';
import { isOpenPermit } from 'src/pages/FormSet/util';
import { FIELD_REG_EXP } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/config.js';
import { isTimeStyle } from 'src/pages/worksheet/views/CalendarView/util';
import { getAdvanceSetting } from 'src/utils/control';
import { renderText as renderCellText } from 'src/utils/control';
import RegExpValidator from 'src/utils/expression';
import { dateConvertToServerZone } from 'src/utils/project';

export const RENDER_RECORD_NECESSARY_ATTR = [
  'controlId',
  'controlName',
  'type',
  'enumDefault',
  'enumDefault2',
  'value',
  'unit',
  'dot',
  'options',
  'attribute',
  'sourceControlType',
  'dataSource',
  'relationControls',
  'advancedSetting',
  'controlPermissions',
  'fieldPermission',
  'hint',
  'sourceControl',
];

// 可作为摘要的控件
// 文本、电话号码、数值、金额、大写金额、邮箱、日期、日期时间、证件、地区、自动编号、文本组合、关联单条、他表字段、定位、富文本。
export const AS_ABSTRACT_CONTROL = [
  1, // 文本
  2, // 文本
  3, // 电话
  4, // 电话
  6, // 数值
  7, // 证件
  8, // 金额
  15, // 日期
  16, // 日期
  17, // 时间段 日期17 日期时间18
  18, // 时间段 日期17 日期时间18
  19, // 地区 19'省23'省-市'24'省-市-县'
  23, // 地区 19'省23'省-市'24'省-市-县'
  24, // 地区 19'省23'省-市'24'省-市-县'
  25, // 大写金额
  30, // 他表字段
  32, // 文本组合
  33, // 自动编号
  41, // _l('富文本'),
];

// 可以在看板视图中展示的控件: 单选，等级，成员，单条的关联他表,部门，组织角色 他表字段（存储数据）
const SELECTABLE_FIELDS_TYPE_IN_BOARD = [9, 10, 11, 26, 27, 28, 29, 48];
const filterAllCanSelectInBoardControls = item =>
  _.includes(SELECTABLE_FIELDS_TYPE_IN_BOARD, item.type) ||
  (item.type === 30 &&
    SELECTABLE_FIELDS_TYPE_IN_BOARD.includes(item.sourceControlType) &&
    (item.strDefault || '').split('')[0] !== '1');
const defaultFormatter = ({ controlName, controlId }) => ({ value: controlId, text: controlName });
export const filterAndFormatterControls = (
  { controls = [], filter = filterAllCanSelectInBoardControls, formatter = defaultFormatter } = {
    controls: [],
    filter: filterAllCanSelectInBoardControls,
    formatter: defaultFormatter,
  },
) => _.filter(controls, filter).map(formatter);

export const RELATION_SHEET_TYPE = 29;

export function getRecordAttachments(coverImageStr) {
  const res = { coverImage: '', allAttachments: [] };
  if (!coverImageStr) return res;
  let coverImage;
  let allAttachments = [];
  try {
    if (coverImageStr) {
      let coverArr = '';
      try {
        coverArr = JSON.parse(coverImageStr);
      } catch (e) {
        console.log(e);
        coverArr = '';
      }
      if (_.isArray(coverArr) && coverArr.length) {
        allAttachments = allAttachments.concat(coverArr.filter(file => !!file.ext));
        const firstFile = _.head(allAttachments);
        if (firstFile && firstFile.ext) {
          const isPicture = RegExpValidator.fileIsPicture(firstFile.ext);
          const previewUrl = _.get(firstFile, 'previewUrl');
          if (isPicture) {
            coverImage =
              previewUrl.indexOf('imageView2') > -1
                ? previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/0/h/200')
                : `${previewUrl}&imageView2/0/h/200`;
          } else {
            coverImage = previewUrl;
          }
        }
      }
    }
  } catch (error) {
    alert(_l('获取记录封面失败'), 2);
    console.log(error);
  }
  return { ...res, coverImage, allAttachments };
}

/**
 * 根据controlId获取control
 * @param {*} controls
 * @param {*} id
 * @param {*} key  取control中的属性
 */
export const getControlById = (controls = [], id, key) => {
  const control = find(controls, item => item.controlId === id);
  return key ? get(control, key) : control;
};

// 判断标题控件是否是文本控件
export const isTextTitle = (controls = []) =>
  _.findIndex(controls, item => item.attribute === 1 && item.type === 2) > -1;

export const getCardDisplayPara = ({ currentView = {}, data = {} }) => {
  const { childType, viewControls } = currentView;
  // 多表关联层级视图显示设置要从配置中取
  if (String(childType) === '2') {
    const currentIndex = (_.get(data, 'path') || []).length - 1;
    if (currentIndex > 0) {
      const { showControlName, worksheetId, coverType } = viewControls[currentIndex] || {};
      return {
        ...currentView,
        showControlName,
        coverType,
        worksheetId,
      };
    }
  }
  return currentView;
};

export const isListRelate = item => {
  const { showtype } = getAdvanceSetting(item);
  return item.type === 29 && showtype === '2';
};

export const getMultiRelateViewConfig = (view, stateData) => {
  const { viewType, childType, viewControls } = view;
  // 多表关联层级视图
  if (viewType === 2 && childType === 2) {
    const { path = [] } = stateData;
    if (path.length === 1) return view;
    return viewControls[path.length - 1] || {};
  }
  return view;
};

export const isDisabledCreate = permit => {
  return !isOpenPermit(permitList.createButtonSwitch, permit);
};

export const isAllowQuickSwitch = (permit, viewId) => isOpenPermit(permitList.quickSwitch, permit, viewId);

export const getSearchData = sheet => {
  const {
    base = {},
    views = [],
    controls,
    hierarchyView: { hierarchyViewState = [], hierarchyViewData = {} },
    gunterView: { grouping = [], withoutArrangementVisible },
    mapView: { mapViewData = [] },
  } = sheet;
  const view = find(views, item => item.viewId === base.viewId) || {};
  const titleControlId = (_.find(controls, { attribute: 1 }) || {}).controlId;
  let data = [];

  if (Number(view.viewType) === 2) {
    hierarchyViewState.map(row => {
      const getPathId = (item, pathId = []) => {
        if (!hierarchyViewData[item.rowId]) return;
        //搜索结果显示三级路径
        const newPathId = pathId.concat(item.rowId);
        const value = (newPathId || [])
          .map(pid => (hierarchyViewData[pid] || {})[titleControlId])
          .filter(i => !!i)
          .join('/');
        value && data.push({ [titleControlId]: value, rowid: item.rowId });
        if (item.children && item.children.length > 0 && item.pathId && item.pathId.length < 5) {
          item.children.map(i => getPathId(i, newPathId));
        }
      };
      getPathId(row, []);
    });
  } else if (Number(view.viewType) === 5) {
    data = _.flatten(
      grouping.map(item => {
        return withoutArrangementVisible ? item.rows : item.rows.filter(item => item.diff > 0);
      }),
    );
  } else if (Number(view.viewType) === 8) {
    const { viewControl } = view;

    data = viewControl ? mapViewData.filter(l => l[viewControl] && l[titleControlId]) : [];
  }

  return { queryKey: titleControlId, data };
};

export const renderTitleByViewtitle = (row, controls, view, useDateConvertToServerZone) => {
  const viewtitle = _.get(view, 'advancedSetting.viewtitle');
  const controlFields = viewtitle.match(FIELD_REG_EXP) || [];
  const defaultValue = _.filter(viewtitle.split('$'), v => !_.isEmpty(v));
  let str = '';
  defaultValue.map(o => {
    if (controlFields.includes(`$${o}$`)) {
      const control = controls.find(it => it.controlId === o);
      str =
        str +
        renderCellText({
          ...control,
          value:
            useDateConvertToServerZone && (isTimeStyle(control) || (control.type === 38 && control.enumDefault === 2))
              ? dateConvertToServerZone(row[o])
              : row[o],
        });
      return;
    }
    str = str + o;
  });
  return str;
};

export const getTitleControlForCard = (currentView, worksheetControls) => {
  const viewtitle = _.get(currentView, 'advancedSetting.viewtitle');
  const titleControl = _.find(worksheetControls, item =>
    viewtitle ? viewtitle === item.controlId : item.attribute === 1,
  );
  return titleControl;
};

export const getShowViews = views => {
  return views.filter(l => l.viewId !== l.worksheetId);
};
