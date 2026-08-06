import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import { Input } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, LoadDiv, RadioGroup, Textarea } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import worksheetAjax from 'src/api/worksheet';
import { getMyPermissions, hasPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import { getCurrentProject } from 'src/utils/project';
import { ALL_SYS, DEFAULT_CONFIG, WIDGETS_TO_API_TYPE_ENUM } from '../config/widget';
import { SettingItem } from '../styled';
import { enumWidgetType } from '../util';
import { formatControlsData } from './data';

const TemplateRelationNotice = styled.div`
  margin-top: 10px;
  margin-left: 28px;
  padding: 10px 12px;
  border-radius: 4px;
  background: var(--color-warning-bg);
  border: 1px solid var(--color-warning);
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--color-text-primary);
  font-size: 13px;
  line-height: 1.5;
  .icon-info {
    color: var(--color-warning);
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const TemplateFieldsList = styled.div`
  max-height: 220px;
  overflow-y: auto;
  .templateFieldRow {
    display: flex;
    align-items: center;
    padding: 5px 0;
    &:last-child {
      border-bottom: none;
    }
    i {
      color: var(--color-text-tertiary);
    }
    .fieldName {
      margin-left: 8px;
      color: var(--color-text-primary);
      word-break: break-word;
    }
  }
`;

const TemplateDialogWrap = styled(Dialog)`
  .selectConfigRadioGroup {
    .ming.Radio {
      margin-right: 0;
      margin-top: 10px;
      &:last-child {
        margin-top: 16px;
      }
      display: flex;
      .Radio-box {
        flex-shrink: 0;
      }
      .Radio-text {
        margin-top: -6px;
      }
    }
  }
`;

const TEMPLATE_TYPE_LIST = [
  {
    text: (
      <Fragment>
        <span className="textPrimary Font14">{_l('个人')}</span>
        <span className="textSecondary InlineBlock w100">
          {_l('仅自己可见，可用于自己管理的所有应用（包含其他组织的应用）')}
        </span>
      </Fragment>
    ),
    value: 1,
  },
  {
    text: (
      <Fragment>
        <span className="textPrimary Font14 InlineBlock">{_l('组织')}</span>
        <span className="textSecondary InlineBlock w100">{_l('全组织所有应用可见，可使用')}</span>
      </Fragment>
    ),
    value: 2,
  },
];

// 需要检查权限的字段
const NEED_CHECK_PERMISSION_CONTROL_TYPES = [29, 34, 35, 51];
const WORKSHEET_ROLE_CONTROL_TYPES = [
  ...NEED_CHECK_PERMISSION_CONTROL_TYPES,
  WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD,
  WIDGETS_TO_API_TYPE_ENUM.SUBTOTAL,
];
const PERMISSION_WORKSHEET_ROLE_TYPES = [2, 4, 6];
const MAX_REFERENCE_DEPTH = 3;

export const hasCreateOrganizationTemplatePermission = projectId => {
  if (!projectId) return false;

  const currentProject = getCurrentProject(projectId);
  const permissionList = getMyPermissions(projectId);

  return _.get(currentProject, 'isSuperAdmin') || hasPermission(permissionList, PERMISSION_ENUM.APP_RESOURCE_SERVICE);
};

// 支持创建模板的字段
export function supportCreateTemplate(control) {
  const { type, advancedSetting = {}, dataSource = '' } = control || {};
  return (
    !_.includes([45, 49, 50], type) &&
    !(type === 43 && advancedSetting.ocrapitype === '1') &&
    !(type === 34 && (dataSource.includes('-') || Number(advancedSetting.detailworksheettype) === 2))
  );
}

// 批量获取表权限
function getBatchPermission(worksheetIds) {
  if (_.isEmpty(worksheetIds)) return [];

  const res = worksheetAjax.getWorksheetsRoleType({ worksheetIds }, { ajaxOptions: { sync: true } });
  return _.get(res, 'data') || [];
}

function parseDataSource(dataSource) {
  if (!_.isString(dataSource) || !dataSource) return '';
  return _.includes(dataSource, '$') ? dataSource.slice(1, -1) : dataSource;
}

function isValidControl(control) {
  return control && (!_.isEmpty(control) || _.includes(ALL_SYS, control.controlId));
}

const TEMPLATE_RELATION_CONTROL_TYPES = [
  WIDGETS_TO_API_TYPE_ENUM.RELATION,
  WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET,
  WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD,
  WIDGETS_TO_API_TYPE_ENUM.SUB_LIST,
  WIDGETS_TO_API_TYPE_ENUM.SUBTOTAL,
  WIDGETS_TO_API_TYPE_ENUM.RELATION_SEARCH,
];

function templateControlsHasRelationField(controls) {
  return _.some(controls, c => isValidControl(c) && _.includes(TEMPLATE_RELATION_CONTROL_TYPES, c.type));
}

function isWorksheetRoleControl(control = {}) {
  return _.includes(WORKSHEET_ROLE_CONTROL_TYPES, control.type);
}

function getWorksheetIdByControl(allControls, control = {}) {
  const parsedDataSource = parseDataSource(control.dataSource);

  if (_.includes([WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD, WIDGETS_TO_API_TYPE_ENUM.SUBTOTAL], control.type)) {
    return _.get(
      _.find(allControls, item => item.controlId === parsedDataSource),
      'dataSource',
    );
  }

  return parsedDataSource;
}

function getSourceControl(allControls, control = {}) {
  const parsedDataSource = parseDataSource(control.dataSource);

  if (!parsedDataSource) return;

  return _.find(allControls, item => item.controlId === parsedDataSource);
}

function isBlankSubListControl(control = {}) {
  if (control.type !== WIDGETS_TO_API_TYPE_ENUM.SUB_LIST) return false;

  return (
    _.includes(control.dataSource, '-') ||
    Number(_.get(control, 'advancedSetting.detailworksheettype')) === 2 ||
    _.get(window, `subListSheetConfig.${control.controlId}.mode`) === 'new'
  );
}

function isBlankSubListRoleControl(allControls, control = {}) {
  if (isBlankSubListControl(control)) return true;

  return (
    control.type === WIDGETS_TO_API_TYPE_ENUM.SUBTOTAL && isBlankSubListControl(getSourceControl(allControls, control))
  );
}

function supportReferencedTemplateControl(control = {}) {
  return !isBlankSubListControl(control);
}

function normalizeTemplateControl(allControls, control = {}) {
  if (control.type === WIDGETS_TO_API_TYPE_ENUM.SUBTOTAL && isBlankSubListRoleControl(allControls, control)) {
    return {
      ...control,
      dataSource: '',
      sourceControlId: '',
      advancedSetting: { ...control.advancedSetting, filters: '' },
    };
  }

  if (control.type === WIDGETS_TO_API_TYPE_ENUM.OCR && control?.advancedSetting?.ocrcid) {
    const ocrControl = _.find(allControls, i => i.controlId === control.advancedSetting.ocrcid);

    if (isBlankSubListControl(ocrControl)) {
      return {
        ...control,
        advancedSetting: { ...control.advancedSetting, ocrmap: '', ocrcid: '' },
      };
    }

    return control;
  }

  return control;
}

function isDirectReferencedWorksheetRoleControl(allControls, control = {}, worksheetId) {
  return (
    isBlankSubListRoleControl(allControls, control) ||
    (_.includes([WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD, WIDGETS_TO_API_TYPE_ENUM.SUBTOTAL], control.type) &&
      !worksheetId)
  );
}

// 解析$controlId$格式，获取控件
function getControlByDataSource(allControls, dataSource) {
  if (!dataSource) return { referencedControls: [], worksheetRoleControls: [] };
  let referencedControls = [];
  let worksheetRoleControls = [];

  dataSource.replace(/\$.+?\$/g, matched => {
    const controlId = matched.match(/\$(.+?)\$/)[1];
    let singleControl = _.find(allControls, item => item.controlId === controlId);

    if (singleControl) {
      if (_.includes(NEED_CHECK_PERMISSION_CONTROL_TYPES, singleControl.type)) {
        worksheetRoleControls.push(singleControl);
      } else {
        referencedControls.push(singleControl);
      }
    }
  });
  return { referencedControls, worksheetRoleControls };
}

// 解析函数，获取控件
function getControlByDynamicFunc(allControls, defaultfunc) {
  let referencedControls = [];
  let worksheetRoleControls = [];

  const funcPayload = safeParse(defaultfunc || '{}');

  if (!funcPayload.expression) return { referencedControls, worksheetRoleControls };

  const funcControls = getControlByDataSource(allControls, funcPayload.expression);
  referencedControls.push(...funcControls.referencedControls);
  worksheetRoleControls.push(...funcControls.worksheetRoleControls);

  return { referencedControls, worksheetRoleControls };
}

// 解析映射，获取控件
function getControlByMapping(allControls, mapping) {
  let referencedControls = [];
  let worksheetRoleControls = [];

  if (_.isEmpty(mapping)) return { referencedControls, worksheetRoleControls };

  mapping.forEach(item => {
    if (item.rcid) {
      const rcidControl = _.find(allControls, i => i.controlId === item.rcid);

      if (rcidControl) {
        worksheetRoleControls.push(rcidControl);
      }
    } else {
      const control = _.find(allControls, i => i.controlId === (item.cid || item.controlId));

      if (control) {
        if (_.includes(NEED_CHECK_PERMISSION_CONTROL_TYPES, control.type)) {
          worksheetRoleControls.push(control);
        } else {
          referencedControls.push(control);
        }
      }
    }
  });
  return { referencedControls, worksheetRoleControls };
}

// 解析查询工作表，获取控件
function getControlBySearchworksheet(allControls, dynamicsrc, queryConfigs = []) {
  let referencedControls = [];
  let worksheetRoleControls = [];

  const dynamicSrc = safeParse(dynamicsrc || '{}');
  if (!dynamicSrc.id) return { referencedControls, worksheetRoleControls };

  const queryConfig = _.find(queryConfigs, q => !q.eventType && q.id === dynamicSrc.id);
  // 筛选
  const filtersControls = getControlByFilters(allControls, { filters: JSON.stringify(queryConfig.items) }, 'filters');

  referencedControls.push(...filtersControls.referencedControls);
  worksheetRoleControls.push(...filtersControls.worksheetRoleControls);

  return { referencedControls, worksheetRoleControls };
}

// 解析默认值，获取控件
function getControlByDefault(allControls, control, queryConfigs) {
  let referencedControls = [];
  let worksheetRoleControls = [];

  const { advancedSetting = {} } = control;

  if (advancedSetting.defaulttype === '1') {
    const funcControls = getControlByDynamicFunc(allControls, advancedSetting.defaultfunc);
    referencedControls.push(...funcControls.referencedControls);
    worksheetRoleControls.push(...funcControls.worksheetRoleControls);
  } else if (advancedSetting.defaulttype === '2') {
    const defSourceControls = getControlBySearchworksheet(allControls, advancedSetting.dynamicsrc, queryConfigs);
    referencedControls.push(control, ...defSourceControls.referencedControls);
    worksheetRoleControls.push(...defSourceControls.worksheetRoleControls);
  } else {
    const defSource = safeParse(advancedSetting.defsource || '[]');
    const defSourceControls = getControlByMapping(allControls, defSource);
    referencedControls.push(control, ...defSourceControls.referencedControls);
    worksheetRoleControls.push(...defSourceControls.worksheetRoleControls);
  }

  return { referencedControls, worksheetRoleControls };
}

// 解析filters获取控件
function getControlByFilters(allControls, advancedSetting, filterkey) {
  advancedSetting = advancedSetting || {};
  const filters = safeParse(advancedSetting[filterkey] || '[]');
  let referencedControls = [];
  let worksheetRoleControls = [];

  if (_.isEmpty(filters)) return { referencedControls, worksheetRoleControls };

  filters.forEach(item => {
    if (_.isEmpty(item.groupFilters)) {
      const filterControls = getControlByMapping(allControls, item.dynamicSource);
      referencedControls.push(...filterControls.referencedControls);
      worksheetRoleControls.push(...filterControls.worksheetRoleControls);
    } else {
      item.groupFilters.forEach(groupItem => {
        const groupFilterControls = getControlByMapping(allControls, groupItem.dynamicSource);
        referencedControls.push(...groupFilterControls.referencedControls);
        worksheetRoleControls.push(...groupFilterControls.worksheetRoleControls);
      });
    }
  });

  return { referencedControls, worksheetRoleControls };
}

function formatBracketNames(names) {
  return _.uniq(names)
    .map(name => `【${name}】`)
    .join('，');
}

function getPermissionErrorMessage({ noPermissionSheetNames = [], deletedWorksheetControlNames = [] }) {
  const messages = [];

  if (!_.isEmpty(noPermissionSheetNames)) {
    messages.push(_l('无法创建字段模板，你对关联表%0无管理权限', formatBracketNames(noPermissionSheetNames)));
  }

  if (!_.isEmpty(deletedWorksheetControlNames)) {
    messages.push(
      _l('无法创建字段模板，字段%0关联的工作表已被删除。', formatBracketNames(deletedWorksheetControlNames)),
    );
  }

  return messages.join('\n');
}

function alertPermissionError(permissionErrorInfo) {
  const message = getPermissionErrorMessage(permissionErrorInfo);

  if (!message) return false;

  alert(message, 2);
  return true;
}

// 获取模板中所有引用控件包含本身
function getAllReferencedControlInfo(allControls, templateControls, queryConfigs) {
  const referencedControls = [];
  const parsedControlIds = [];
  const permittedControlIds = [];
  const permissionMap = {};
  const noPermissionSheetNames = [];
  const deletedWorksheetControlNames = [];

  const addReferencedControls = controls => {
    controls.filter(isValidControl).forEach(control => {
      if (!supportReferencedTemplateControl(control)) return;

      const normalizedControl = normalizeTemplateControl(allControls, control);

      if (!_.find(referencedControls, item => item.controlId === normalizedControl.controlId)) {
        referencedControls.push(normalizedControl);
      }
    });
  };

  const getControlsWithPermission = controls => {
    const validWorksheetRoleControls = _.uniqBy(
      controls.filter(control => isValidControl(control) && supportReferencedTemplateControl(control)),
      'controlId',
    ).map(control => ({
      control,
      worksheetId: getWorksheetIdByControl(allControls, control),
    }));
    const directReferencedControls = validWorksheetRoleControls
      .filter(({ control, worksheetId }) => isDirectReferencedWorksheetRoleControl(allControls, control, worksheetId))
      .map(item => item.control);
    const worksheetRoleControls = validWorksheetRoleControls
      .filter(({ control, worksheetId }) => !isDirectReferencedWorksheetRoleControl(allControls, control, worksheetId))
      .filter(item => item.worksheetId);
    const worksheetIds = _.uniq(worksheetRoleControls.map(item => item.worksheetId));
    const needRequestIds = worksheetIds.filter(worksheetId => _.isUndefined(permissionMap[worksheetId]));

    if (!_.isEmpty(needRequestIds)) {
      const permissionList = getBatchPermission(needRequestIds);

      permissionList.forEach(item => {
        permissionMap[item.worksheetId] = item;
      });
      needRequestIds
        .filter(worksheetId => _.isUndefined(permissionMap[worksheetId]))
        .forEach(worksheetId => {
          permissionMap[worksheetId] = null;
        });
    }

    const permittedControls = worksheetRoleControls
      .filter(({ control, worksheetId }) => {
        const permissionInfo = permissionMap[worksheetId];
        const isDeleted = permissionInfo && !permissionInfo.name;
        const noPermission = !permissionInfo || !_.includes(PERMISSION_WORKSHEET_ROLE_TYPES, permissionInfo.roleType);

        if (isDeleted) {
          deletedWorksheetControlNames.push(control.controlName || control.controlId);
        } else if (noPermission) {
          noPermissionSheetNames.push(_.get(permissionInfo, 'name') || worksheetId);
        }

        return !isDeleted && !noPermission;
      })
      .map(item => item.control);

    return [...directReferencedControls, ...permittedControls];
  };

  const getControlReferences = control => {
    let referencedControls = [];
    let worksheetRoleControls = [];
    const { type, dataSource, sourceControlId, advancedSetting = {} } = control;

    switch (type) {
      case WIDGETS_TO_API_TYPE_ENUM.CUSTOM:
        const customReference = safeParse(advancedSetting.reference || '[]');
        const customControls = getControlByMapping(allControls, customReference);
        referencedControls.push(control, ...customControls.referencedControls);
        worksheetRoleControls.push(...customControls.worksheetRoleControls);
        break;
      // 函数计算：dataSource 为 JSON，表达式内为 $controlId$
      case WIDGETS_TO_API_TYPE_ENUM.FORMULA_FUNC:
        referencedControls.push(control);

        const funcControls = getControlByDynamicFunc(allControls, dataSource);
        referencedControls.push(...funcControls.referencedControls);
        worksheetRoleControls.push(...funcControls.worksheetRoleControls);
        break;
      // 日期公式：dataSource / sourceControlId 中为 $controlId$
      case WIDGETS_TO_API_TYPE_ENUM.FORMULA_DATE:
        const dateControls = getControlByDataSource(allControls, dataSource);
        const sourceControl = getControlByDataSource(allControls, sourceControlId);
        referencedControls.push(control, ...dateControls.referencedControls, ...sourceControl.referencedControls);
        worksheetRoleControls.push(...dateControls.worksheetRoleControls, ...sourceControl.worksheetRoleControls);
        break;
      // 公式数值、大写金额、条码、文本组合：dataSource 中为 $controlId$
      case WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER:
      case WIDGETS_TO_API_TYPE_ENUM.MONEY_CN:
      case WIDGETS_TO_API_TYPE_ENUM.BAR_CODE:
      case WIDGETS_TO_API_TYPE_ENUM.CONCATENATE:
        const concatControls = getControlByDataSource(allControls, dataSource);
        referencedControls.push(control, ...concatControls.referencedControls);
        worksheetRoleControls.push(...concatControls.worksheetRoleControls);
        break;
      // 文字识别
      case WIDGETS_TO_API_TYPE_ENUM.OCR:
        referencedControls.push(control);
        if (advancedSetting.ocrcid) {
          const ocrControl = _.find(allControls, i => i.controlId === advancedSetting.ocrcid);

          if (ocrControl) {
            worksheetRoleControls.push(ocrControl);
          }
        } else {
          const ocrMap = safeParse(advancedSetting.ocrmap || '[]');
          const mappedControls = getControlByMapping(allControls, ocrMap);
          referencedControls.push(...mappedControls.referencedControls);
          worksheetRoleControls.push(...mappedControls.worksheetRoleControls);
        }

        break;
      // 以下控件只处理默认值
      case WIDGETS_TO_API_TYPE_ENUM.LOCATION:
      case WIDGETS_TO_API_TYPE_ENUM.CRED:
      case WIDGETS_TO_API_TYPE_ENUM.RICH_TEXT:
      case WIDGETS_TO_API_TYPE_ENUM.SCORE:
      case WIDGETS_TO_API_TYPE_ENUM.SWITCH:
      case WIDGETS_TO_API_TYPE_ENUM.TEXT:
      case WIDGETS_TO_API_TYPE_ENUM.NUMBER:
      case WIDGETS_TO_API_TYPE_ENUM.MONEY:
      case WIDGETS_TO_API_TYPE_ENUM.EMAIL:
      case WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE:
      case WIDGETS_TO_API_TYPE_ENUM.TELEPHONE:
      case WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE:
      case WIDGETS_TO_API_TYPE_ENUM.AREA_CITY:
      case WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY:
      case WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU:
      case WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT:
      case WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN:
        const defaultControls = getControlByDefault(allControls, control, queryConfigs);
        referencedControls.push(control, ...defaultControls.referencedControls);
        worksheetRoleControls.push(...defaultControls.worksheetRoleControls);
        break;
      // 自由编号，increase，type为3，controlId，rcid
      case WIDGETS_TO_API_TYPE_ENUM.AUTO_ID:
        const increase = safeParse(advancedSetting.increase || '[]');
        const increaseFilters = increase.filter(i => i.type === 3);
        const increaseFiltersControls = getControlByMapping(allControls, increaseFilters);
        referencedControls.push(control, ...increaseFiltersControls.referencedControls);
        worksheetRoleControls.push(...increaseFiltersControls.worksheetRoleControls);
        break;
      // 附件watermarkinfo，同$controlId$结构
      case WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT:
        const attachmentControls = getControlByDataSource(allControls, advancedSetting.watermarkinfo);
        referencedControls.push(control, ...attachmentControls.referencedControls);
        worksheetRoleControls.push(...attachmentControls.worksheetRoleControls);
        break;
      // 部门、成员、组织角色，除了默认值，还有指定chooserange
      case WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT:
      case WIDGETS_TO_API_TYPE_ENUM.USER_PICKER:
      case WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE:
        const orgDefaultControls = getControlByDefault(allControls, control, queryConfigs);
        const chooserangeControls = getControlByMapping(allControls, safeParse(advancedSetting.chooserange || '[]'));
        referencedControls.push(
          control,
          ...orgDefaultControls.referencedControls,
          ...chooserangeControls.referencedControls,
        );
        worksheetRoleControls.push(
          ...orgDefaultControls.worksheetRoleControls,
          ...chooserangeControls.worksheetRoleControls,
        );
        break;
      // 默认值和起始、结束日期min\max,结构同默认值动态值
      case WIDGETS_TO_API_TYPE_ENUM.DATE:
      case WIDGETS_TO_API_TYPE_ENUM.DATE_TIME:
        const dateDefaultControls = getControlByDefault(allControls, control, queryConfigs);
        const minControls = getControlByMapping(allControls, safeParse(advancedSetting.min || '[]'));
        const maxControls = getControlByMapping(allControls, safeParse(advancedSetting.max || '[]'));
        referencedControls.push(
          control,
          ...dateDefaultControls.referencedControls,
          ...minControls.referencedControls,
          ...maxControls.referencedControls,
        );
        worksheetRoleControls.push(
          ...dateDefaultControls.worksheetRoleControls,
          ...minControls.worksheetRoleControls,
          ...maxControls.worksheetRoleControls,
        );
        break;
      case WIDGETS_TO_API_TYPE_ENUM.SUB_LIST:
        const subListControls = getControlBySearchworksheet(allControls, advancedSetting.dynamicsrc, queryConfigs);
        referencedControls.push(...subListControls.referencedControls);
        worksheetRoleControls.push(control, ...subListControls.worksheetRoleControls);
        break;
      //级联默认值，filters、topfilters筛选需要处理
      case WIDGETS_TO_API_TYPE_ENUM.CASCADER:
        const cascadefaultControls = getControlByDefault(allControls, control, queryConfigs);
        const cascadefiltersControls = getControlByFilters(allControls, advancedSetting, 'filters');
        const topfiltersControls = getControlByFilters(allControls, advancedSetting, 'topfilters');
        referencedControls.push(
          ...cascadefaultControls.referencedControls,
          ...cascadefiltersControls.referencedControls,
          ...topfiltersControls.referencedControls,
        );
        worksheetRoleControls.push(
          control,
          ...cascadefaultControls.worksheetRoleControls,
          ...cascadefiltersControls.worksheetRoleControls,
          ...topfiltersControls.worksheetRoleControls,
        );
        break;
      // 关联默认值、filters筛选需要处理
      case WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET:
        const relationDefaultControls = getControlByDefault(allControls, control, queryConfigs);
        const relationFiltersControls = getControlByFilters(allControls, advancedSetting, 'filters');
        referencedControls.push(
          ...relationDefaultControls.referencedControls,
          ...relationFiltersControls.referencedControls,
        );
        worksheetRoleControls.push(
          control,
          ...relationDefaultControls.worksheetRoleControls,
          ...relationFiltersControls.worksheetRoleControls,
        );
        break;
      // 查询记录，resultfilters筛选需要处理
      case WIDGETS_TO_API_TYPE_ENUM.RELATION_SEARCH:
        const resultFiltersControls = getControlByFilters(allControls, advancedSetting, 'resultfilters');
        referencedControls.push(...resultFiltersControls.referencedControls);
        worksheetRoleControls.push(control, ...resultFiltersControls.worksheetRoleControls);
        break;
      // 他表、汇总需要查表权限
      case WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD:
      case WIDGETS_TO_API_TYPE_ENUM.SUBTOTAL:
        referencedControls.push(control);
        worksheetRoleControls.push(...getControlByDataSource(allControls, control.dataSource).worksheetRoleControls);
        break;
      default:
        referencedControls.push(control);
        break;
    }

    return { referencedControls, worksheetRoleControls };
  };

  let currentControls = templateControls.filter(
    control => isValidControl(control) && supportReferencedTemplateControl(control),
  );

  for (let depth = 0; depth < MAX_REFERENCE_DEPTH && !_.isEmpty(currentControls); depth++) {
    const nextControls = [];
    const worksheetRoleControls = [];

    currentControls = _.uniqBy(currentControls, 'controlId').filter(control => {
      return !_.includes(parsedControlIds, control.controlId) && supportReferencedTemplateControl(control);
    });

    currentControls.forEach(control => {
      if (isWorksheetRoleControl(control) && !_.includes(permittedControlIds, control.controlId)) {
        worksheetRoleControls.push(control);
        return;
      }

      parsedControlIds.push(control.controlId);
      const controls = getControlReferences(control);
      addReferencedControls(controls.referencedControls);
      worksheetRoleControls.push(...controls.worksheetRoleControls);
      nextControls.push(...controls.referencedControls);
    });

    const permittedControls = getControlsWithPermission(worksheetRoleControls);
    permittedControls.forEach(control => permittedControlIds.push(control.controlId));
    addReferencedControls(permittedControls);
    nextControls.push(...permittedControls);

    currentControls = _.uniqBy(
      nextControls.filter(
        control => !_.includes(parsedControlIds, control.controlId) && supportReferencedTemplateControl(control),
      ),
      'controlId',
    );
  }

  return {
    referencedControls,
    noPermissionSheetNames: _.uniq(noPermissionSheetNames),
    deletedWorksheetControlNames: _.uniq(deletedWorksheetControlNames),
  };
}

function getAllReferencedControls(allControls, templateControls, queryConfigs) {
  const { referencedControls, noPermissionSheetNames, deletedWorksheetControlNames } = getAllReferencedControlInfo(
    allControls,
    templateControls,
    queryConfigs,
  );

  alertPermissionError({ noPermissionSheetNames, deletedWorksheetControlNames });
  return referencedControls;
}

function CreateTemplateDialog(props) {
  const {
    allControls = [],
    globalSheetInfo = {},
    templateControls = [],
    templateInfo = {},
    queryConfigs = [],
    setConfig = () => {},
    templatePersonalList,
    templateOrganizationList,
    getTemplateListByPersonal = () => {},
    getTemplateListByOrganization = () => {},
  } = props;
  void globalSheetInfo;
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasCreateTemplatePermission, setHasCreateTemplatePermission] = useState(false);
  const [resolvedReferencedControls, setResolvedReferencedControls] = useState(null);
  const referenceExpandNoticeShownRef = useRef(false);
  const [templateInfoState, setTemplateInfoState] = useSetState({
    name: templateInfo.name || '',
    desc: templateInfo.desc || '',
    type: Number(templateInfo.type || 1),
  });
  const { name, desc, type } = templateInfoState;

  useEffect(() => {
    if (!globalSheetInfo.projectId) return;
    setHasCreateTemplatePermission(hasCreateOrganizationTemplatePermission(globalSheetInfo.projectId));
    setLoading(false);
  }, [globalSheetInfo.projectId]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (templateInfo.templateId) {
      setResolvedReferencedControls(null);
      return;
    }

    if (_.isEmpty(templateControls)) {
      setResolvedReferencedControls([]);
      return;
    }

    const referencedControls = getAllReferencedControls(allControls, templateControls, queryConfigs);

    setResolvedReferencedControls(referencedControls);
    const originalIds = new Set(
      templateControls
        .filter(isValidControl)
        .map(c => c.controlId)
        .filter(Boolean),
    );

    const hasExtraReferenced = referencedControls.some(
      c => isValidControl(c) && c.controlId && !originalIds.has(c.controlId),
    );

    if (hasExtraReferenced && !referenceExpandNoticeShownRef.current) {
      referenceExpandNoticeShownRef.current = true;
      alert(_l('已自动添加引用字段，以确保模板完整可用'), 4);
    }
  }, [loading, templateInfo.templateId, templateControls, allControls, queryConfigs]);

  const handleOk = () => {
    if (saving) {
      return;
    }

    const templateType = Number(type);
    const isPersonalTemplate = templateType === 1;

    if (
      templateInfoState.name &&
      _.find(
        (isPersonalTemplate ? templatePersonalList : templateOrganizationList) || [],
        item =>
          item.name === templateInfoState.name &&
          (templateInfo.templateId
            ? item.templateId !== templateInfo.templateId && item.id !== templateInfo.templateId
            : true),
      )
    ) {
      alert(_l('模板名称不允许重复'), 2);
      return;
    }

    if (!templateInfo.templateId) {
      if (_.isEmpty(templateControls)) {
        alert(_l('未添加引用字段，无法创建字段模板'));
        return;
      }

      const referencedControls =
        resolvedReferencedControls !== null
          ? resolvedReferencedControls
          : getAllReferencedControls(allControls, templateControls, queryConfigs);

      if (referencedControls.length > 30) {
        alert(_l('模板最多包含 30 个字段（含引用字段），请减少选择后重试'), 2);
        return;
      }

      const templateParams = {
        ...templateInfoState,
        type: templateType,
        controls: formatControlsData(referencedControls),
        controlCount: referencedControls.length,
        projectId: globalSheetInfo.projectId,
        ...(isPersonalTemplate ? { accountId: _.get(md, 'global.Account.accountId') } : {}),
      };
      const templateListItem = {
        ...templateParams,
        controls: referencedControls,
      };

      setSaving(true);
      worksheetAjax
        .saveControlTemplate(templateParams)
        .then(res => {
          if (res.data) {
            if (isPersonalTemplate) {
              if (_.isUndefined(templatePersonalList)) {
                getTemplateListByPersonal();
              } else {
                setConfig({
                  templatePersonalList: [{ ...templateListItem, templateId: res.data }, ...templatePersonalList],
                });
              }
            } else {
              if (_.isUndefined(templateOrganizationList)) {
                getTemplateListByOrganization();
              } else {
                setConfig({
                  templateOrganizationList: [
                    { ...templateListItem, templateId: res.data },
                    ...templateOrganizationList,
                  ],
                });
              }
            }

            alert(_l('创建成功'));
            setVisible(false);
          } else {
            alert(_l('创建失败'), 2);
          }
        })
        .catch(() => {
          alert(_l('创建失败'), 2);
        })
        .finally(() => {
          setSaving(false);
        });
      return;
    }

    setSaving(true);
    worksheetAjax
      .saveControlTemplate({
        ...templateInfo,
        ...templateInfoState,
        type: templateType,
        projectId: globalSheetInfo.projectId,
        ...(isPersonalTemplate ? { accountId: _.get(md, 'global.Account.accountId') } : { accountId: '' }),
      })
      .then(res => {
        if (res.data) {
          const templateId = templateInfo.templateId;
          const isPersonalTemplate = templateType === 1;
          const oldTemplateInfo =
            _.find(templatePersonalList, item => item.templateId === templateId || item.id === templateId) ||
            _.find(templateOrganizationList, item => item.templateId === templateId || item.id === templateId) ||
            {};
          const nextTemplateInfo = {
            ...templateInfo,
            ...oldTemplateInfo,
            templateId,
            ...templateInfoState,
            type: templateType,
          };
          const updateTemplateList = list =>
            list.map(item => (item.templateId === templateId || item.id === templateId ? nextTemplateInfo : item));
          const removeTemplate = list => list.filter(item => item.templateId !== templateId && item.id !== templateId);
          const isPersonalTemplateInList = _.some(
            templatePersonalList,
            item => item.templateId === templateId || item.id === templateId,
          );
          const isOrganizationTemplateInList = _.some(
            templateOrganizationList,
            item => item.templateId === templateId || item.id === templateId,
          );
          const nextPersonalList = isPersonalTemplate
            ? isPersonalTemplateInList
              ? updateTemplateList(templatePersonalList)
              : [nextTemplateInfo, ...templatePersonalList]
            : removeTemplate(templatePersonalList);
          const nextOrganizationList = isPersonalTemplate
            ? removeTemplate(templateOrganizationList)
            : isOrganizationTemplateInList
              ? updateTemplateList(templateOrganizationList)
              : [nextTemplateInfo, ...templateOrganizationList];

          setConfig({
            templatePersonalList: nextPersonalList,
            templateOrganizationList: nextOrganizationList,
          });

          alert(_l('保存成功'));
          setVisible(false);
        } else {
          alert(_l('保存失败'), 2);
        }
      })
      .catch(() => {
        alert(_l('保存失败'), 2);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const displayControls = (resolvedReferencedControls !== null ? resolvedReferencedControls : templateControls).filter(
    isValidControl,
  );

  const showOrgRelationNotice =
    hasCreateTemplatePermission && Number(type) === 2 && templateControlsHasRelationField(displayControls);

  return (
    <TemplateDialogWrap
      width={560}
      visible={visible}
      okDisabled={!name}
      title={templateInfo.templateId ? _l('编辑字段模板') : _l('添加字段模板')}
      onCancel={() => setVisible(false)}
      onOk={() => {
        handleOk();
      }}
    >
      {loading ? (
        <LoadDiv size="big" />
      ) : (
        <Fragment>
          <SettingItem className="mTop0">
            <div className="settingItemTitle">
              <span className="TxtMiddle Red mRight4">*</span>
              {_l('模板名称')}
            </div>
            <Input value={name} autoFocus onChange={e => setTemplateInfoState({ name: e.target.value })} />
          </SettingItem>
          <SettingItem>
            <div className="settingItemTitle">{_l('说明')}</div>
            <Textarea
              placeholder={_l('便于后续搜索和判断使用场景')}
              value={desc}
              onChange={value => setTemplateInfoState({ desc: value })}
            />
          </SettingItem>
          {hasCreateTemplatePermission && (
            <SettingItem>
              <div className="settingItemTitle">{_l('归属')}</div>
              <RadioGroup
                size="middle"
                className="selectConfigRadioGroup"
                disableTitle={true}
                vertical={true}
                checkedValue={type}
                data={TEMPLATE_TYPE_LIST}
                onChange={value => setTemplateInfoState({ type: value })}
              />
              {showOrgRelationNotice && (
                <TemplateRelationNotice>
                  <span className="icon-info Font16" />
                  <span>
                    {_l('模板包含关联字段，发布后所有应用管理员使用此模板创建字段时，可查看关联工作表的结构与数据')}
                  </span>
                </TemplateRelationNotice>
              )}
            </SettingItem>
          )}
          {!_.isEmpty(displayControls) && (
            <SettingItem className="withSplitLine">
              <div className="settingItemTitle">{_l('模板中的字段（包含引用字段）')}</div>
              <TemplateFieldsList>
                {displayControls.map(control => {
                  const widgetKey = enumWidgetType[control.type];
                  const { icon } = (widgetKey && DEFAULT_CONFIG[widgetKey]) || {};
                  return (
                    <div
                      key={control.controlId || `${control.type}-${control.controlName}`}
                      className="templateFieldRow"
                    >
                      {icon ? <i className={`Font16 icon-${icon}`} /> : <i className="Font16 icon-text_bold2" />}
                      <span className="fieldName Font14">{control.controlName}</span>
                    </div>
                  );
                })}
              </TemplateFieldsList>
            </SettingItem>
          )}
        </Fragment>
      )}
    </TemplateDialogWrap>
  );
}

export const createTemplateDialog = props => {
  const { allControls = [], templateInfo = {}, templateControls = [], queryConfigs = [] } = props || {};

  if (!templateInfo.templateId) {
    const supportedTemplateControls = templateControls.filter(
      control => isValidControl(control) && supportCreateTemplate(control),
    );

    if (_.isEmpty(supportedTemplateControls)) {
      alert(_l('所选字段均不支持创建字段模板'), 2);
      return;
    }

    const { noPermissionSheetNames, deletedWorksheetControlNames } = getAllReferencedControlInfo(
      allControls,
      supportedTemplateControls,
      queryConfigs,
    );

    if (alertPermissionError({ noPermissionSheetNames, deletedWorksheetControlNames })) {
      return;
    }

    return functionWrap(CreateTemplateDialog, { ...props, templateControls: supportedTemplateControls });
  }

  return functionWrap(CreateTemplateDialog, props);
};
