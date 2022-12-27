import { find, get } from 'lodash';
import { getAdvanceSetting } from 'src/util';
import { isOpenPermit } from 'src/pages/FormSet/util';
import { permitList } from 'src/pages/FormSet/config';

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

// 可以在看板视图中展示的控件: 单选，等级，成员，单条的关联他表
const SELECTABLE_FIELDS_TYPE_IN_BOARD = [9, 10, 11, 26, 28];
const RELATION_SHEET_FIELD = [29];
const filterAllCanSelectInBoardControls = item =>
  _.includes(SELECTABLE_FIELDS_TYPE_IN_BOARD, item.type) ||
  (_.includes(RELATION_SHEET_FIELD, item.type) && item.enumDefault === 1);
const defaultFormatter = ({ controlName, controlId }) => ({ value: controlId, text: controlName });
export const filterAndFormatterControls = (
  { controls = [], filter = filterAllCanSelectInBoardControls, formatter = defaultFormatter } = {
    controls: [],
    filter: filterAllCanSelectInBoardControls,
    formatter: defaultFormatter,
  },
) => _.filter(controls, filter).map(formatter);

export const setItem = (key, value) => safeLocalStorageSetItem(key, JSON.stringify(value));
export const getItem = key => JSON.parse(localStorage.getItem(key));
export const dropItem = key => localStorage.removeItem(key);

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
        coverArr = '';
      }
      if (_.isArray(coverArr) && coverArr.length) {
        allAttachments = allAttachments.concat(coverArr.filter(file => !!file.previewUrl));
        const firstFile = _.head(allAttachments);
        if (firstFile && firstFile.ext) {
          const isPicture = File.isPicture(firstFile.ext);
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
    alert(_l('获取记录封面失败'));
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

export const isAllowQuickSwitch = permit => isOpenPermit(permitList.quickSwitch, permit);

export const getSearchData = sheet => {
  const {
    base = {},
    views = [],
    controls,
    hierarchyView: { hierarchyViewState = [], hierarchyViewData = {} },
    gunterView: { grouping = [] },
  } = sheet;
  const view = find(views, item => item.viewId === base.viewId) || {};
  const titleControlId = (_.find(controls, { attribute: 1 }) || {}).controlId;
  let data = [];

  if (Number(view.viewType) === 2) {
    hierarchyViewState.map(row => {
      const getPathId = (item, pathId = []) => {
        //搜索结果显示三级路径
        const newPathId = pathId.concat(item.rowId);
        const value = (newPathId || [])
          .map(pid => (hierarchyViewData[pid] || {})[titleControlId])
          .filter(i => !!i)
          .join('/');
        value && data.push({ [titleControlId]: value, rowid: item.rowId });
        if (item.children && item.children.length > 0 && item.pathId && item.pathId.length < 3) {
          item.children.map(i => getPathId(i, newPathId));
        }
      };
      getPathId(row, []);
    });
  } else if (Number(view.viewType) === 5) {
    data = _.flatten(
      grouping.map(item => {
        return item.rows.filter(item => item.diff > 0);
      }),
    );
  }

  return { queryKey: titleControlId, data };
};
