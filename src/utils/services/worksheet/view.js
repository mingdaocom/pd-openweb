import { find } from 'lodash';
import _ from 'lodash';
import { renderText as renderCellText } from 'src/utils/domain/control/display';
import { permitList } from 'src/utils/domain/control/formEnum';
import { isTimeStyle } from 'src/utils/domain/control/type';
import { FIELD_REG_EXP } from 'src/utils/domain/control/value';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import RegExpValidator from 'src/utils/domain/validation/expression';
import { dateConvertToServerZone } from 'src/utils/platform/runtime/timeZone';

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
/** 按可选规则筛选并格式化视图控件列表。 */
export const filterAndFormatterControls = (
  { controls = [], filter = filterAllCanSelectInBoardControls, formatter = defaultFormatter } = {
    controls: [],
    filter: filterAllCanSelectInBoardControls,
    formatter: defaultFormatter,
  },
) => _.filter(controls, filter).map(formatter);

export const RELATION_SHEET_TYPE = 29;

/** 解析记录封面字段中的附件和预览图。 */
export function getRecordAttachments(coverImageStr) {
  const res = { coverImage: '', allAttachments: [] };
  if (!coverImageStr) return res;
  let coverImage;
  let allAttachments = [];

  try {
    if (coverImageStr) {
      let coverArr = '';

      try {
        coverArr = safeParse(coverImageStr, 'array');
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

// 判断标题控件是否是文本控件
/** 判断工作表标题控件是否为文本类型。 */
export const isTextTitle = (controls = []) =>
  _.findIndex(controls, item => item.attribute === 1 && item.type === 2) > -1;

/** 根据多表层级路径合并当前卡片显示配置。 */
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

/** 根据层级路径选择多表关联视图配置。 */
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

/** 判断视图权限是否禁用新建记录。 */
export const isDisabledCreate = permit => {
  return !isOpenPermit(permitList.createButtonSwitch, permit);
};

/** 判断目标视图是否允许快速切换。 */
export const isAllowQuickSwitch = (permit, viewId) => isOpenPermit(permitList.quickSwitch, permit, viewId);

/** 整理层级、甘特和地图视图的本地搜索数据。 */
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

/** 按组合标题配置渲染记录标题。 */
export const renderTitleByViewtitle = (row, controls, view, useDateConvertToServerZone) => {
  const viewtitle = _.get(view, 'advancedSetting.viewtitle');
  const controlFields = viewtitle.match(FIELD_REG_EXP) || [];
  const defaultValue = _.filter(viewtitle.split('$'), v => !_.isEmpty(v));
  let str = '';
  defaultValue.map(o => {
    if (controlFields.includes(`$${o}$`)) {
      const control = controls.find(it => it.controlId === o);
      if (!control) return;
      str =
        str +
        renderCellText(
          {
            ...control,
            value:
              useDateConvertToServerZone && (isTimeStyle(control) || (control.type === 38 && control.enumDefault === 2))
                ? dateConvertToServerZone(row[o])
                : row[o],
          },
          { appId: view.appId },
        );
      return;
    }

    str = str + o;
  });
  return str;
};

/** 获取卡片当前使用的标题控件。 */
export const getTitleControlForCard = (currentView, worksheetControls) => {
  const viewtitle = _.get(currentView, 'advancedSetting.viewtitle');
  const titleControl = _.find(worksheetControls, item =>
    viewtitle ? viewtitle === item.controlId : item.attribute === 1,
  );
  return titleControl;
};

// 仅当 viewtitle 形如 $单个字段ID$ 时归一为真实字段 ID，其余（空 / 普通 ID / 组合标题）原样返回。
// 用于卡片标题的「读取/展示侧」兼容：配置保存仍走原值，只有展示与配置高亮按真实字段 ID 匹配。
/** 从单字段组合标题中提取真实控件标识。 */
export const getWrappedViewTitleControlId = viewtitle => {
  const controlFields = viewtitle ? viewtitle.match(FIELD_REG_EXP) || [] : [];
  return controlFields.length === 1 && controlFields[0] === viewtitle ? viewtitle.replace(/\$/g, '') : viewtitle;
};

// 卡片标题的呈现侧兼容：配置仍保存原值，只有 $单个字段ID$ 展示时归一成真实字段 ID。
/** 生成卡片标题字段的渲染数据。 */
export const getCardTitleFieldForView = (row = {}, worksheetControls = [], currentView = {}) => {
  const viewtitle = _.get(currentView, 'advancedSetting.viewtitle');
  const controlId = getWrappedViewTitleControlId(viewtitle);
  const titleControl = getTitleControlForCard(
    {
      ...currentView,
      advancedSetting: {
        ..._.get(currentView, 'advancedSetting'),
        viewtitle: controlId,
      },
    },
    worksheetControls,
  );

  if (!titleControl) {
    return;
  }

  return {
    ..._.pick(titleControl, RENDER_RECORD_NECESSARY_ATTR),
    value: row[titleControl.controlId],
    isWrappedViewTitle: controlId !== viewtitle,
  };
};

/** 过滤工作表自身占位的非业务视图。 */
export const getShowViews = views => {
  return views.filter(l => l.viewId !== l.worksheetId);
};
