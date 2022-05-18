import { NODE_TYPE, APP_TYPE, ACTION_ID } from './enum';

/**
 * 遍历获取统计id
 */
export const getSameLevelIds = (data, firstId) => {
  const ids = [firstId];
  let nextId = (data[firstId] || {}).nextId;

  while (nextId && nextId !== '99') {
    ids.push(nextId);
    nextId = (data[nextId] || {}).nextId;
  }

  return ids;
};

/**
 * 返回对应的图标
 */
export const getIcons = (type, appType, actionId) => {
  let icon;

  switch (type) {
    case NODE_TYPE.FIRST:
      if (appType === APP_TYPE.LOOP) {
        icon = 'icon-hr_surplus';
      } else if (appType === APP_TYPE.DATE) {
        icon = 'icon-hr_time';
      } else if (appType === APP_TYPE.WEBHOOK) {
        icon = 'icon-workflow_webhook';
      } else if (appType === APP_TYPE.CUSTOM_ACTION) {
        icon = 'icon-custom_actions';
      } else if (appType === APP_TYPE.USER) {
        icon = 'icon-hr_structure';
      } else if (appType === APP_TYPE.DEPARTMENT) {
        icon = 'icon-workflow';
      } else if (appType === APP_TYPE.EXTERNAL_USER) {
        icon = 'icon-language';
      } else if (appType === APP_TYPE.PBC) {
        icon = 'icon-pbc';
      } else {
        icon = 'icon-worksheet';
      }
      break;
    case NODE_TYPE.WRITE:
      icon = 'icon-workflow_write';
      break;
    case NODE_TYPE.APPROVAL:
      icon = 'icon-workflow_ea';
      break;
    case NODE_TYPE.NOTICE:
      icon = 'icon-workflow_notice';
      break;
    case NODE_TYPE.ACTION:
      if (appType === APP_TYPE.TASK) {
        icon = 'icon-custom_assignment';
      } else if (appType === APP_TYPE.SHEET && actionId === ACTION_ID.EDIT) {
        icon = 'icon-workflow_update';
      } else if (appType === APP_TYPE.SHEET && actionId === ACTION_ID.ADD) {
        icon = 'icon-workflow_new';
      } else if (appType === APP_TYPE.SHEET && actionId === ACTION_ID.RELATION) {
        icon = 'icon-workflow_search';
      }
      break;
    case NODE_TYPE.SEARCH:
      icon = 'icon-search';
      break;
    case NODE_TYPE.WEBHOOK:
      icon = 'icon-workflow_webhook';
      break;
    case NODE_TYPE.FORMULA:
      icon = 'icon-workflow_function';
      break;
    case NODE_TYPE.MESSAGE:
      icon = 'icon-workflow_sms';
      break;
    case NODE_TYPE.EMAIL:
      icon = 'icon-workflow_email';
      break;
    case NODE_TYPE.DELAY:
      icon = 'icon-workflow_delayed';
      break;
    case NODE_TYPE.GET_MORE_RECORD:
      icon = 'icon-transport';
      break;
    case NODE_TYPE.CODE:
      icon = 'icon-url';
      break;
    case NODE_TYPE.LINK:
      icon = 'icon-link2';
      break;
    case NODE_TYPE.SUB_PROCESS:
      icon = 'icon-subprocess';
      break;
    case NODE_TYPE.PUSH:
      icon = 'icon-notifications_11';
      break;
    case NODE_TYPE.FILE:
      icon = 'icon-print';
      break;
    case NODE_TYPE.TEMPLATE:
      icon = 'icon-wechat';
      break;
    case NODE_TYPE.PBC:
      icon = 'icon-pbc';
      break;
    case NODE_TYPE.SYSTEM:
      if (appType === APP_TYPE.PROCESS) {
        icon = 'icon-parameter';
      } else {
        icon = 'icon-application_custom';
      }
      break;
    case NODE_TYPE.FIND_SINGLE_MESSAGE:
      if (appType === APP_TYPE.EXTERNAL_USER) {
        icon = 'icon-external_users';
      } else {
        icon = 'icon-person_search';
      }
      break;
    case NODE_TYPE.FIND_MORE_MESSAGE:
      if (appType === APP_TYPE.EXTERNAL_USER) {
        icon = 'icon-folder-public';
      } else {
        icon = 'icon-group-members';
      }
      break;
    default:
      icon = 'icon-workflow_info';
      break;
  }

  return icon;
};

/**
 * 返回对应的节点颜色
 */
export const getColor = appType => {
  switch (appType) {
    case APP_TYPE.SHEET:
      return 'BGYellow';
    case APP_TYPE.WEBHOOK:
    case APP_TYPE.CUSTOM_ACTION:
    case APP_TYPE.PBC:
      return 'BGBlueAsh';
    case APP_TYPE.USER:
    case APP_TYPE.DEPARTMENT:
    case APP_TYPE.EXTERNAL_USER:
      return 'BGGreen';
    default:
      return 'BGBlue';
  }
};

/**
 * 验证筛选条件是否为空
 */
export const checkConditionsIsNull = data => {
  let nullFields = 0;

  (data || []).forEach(list =>
    list.forEach(item => {
      // 不是 不为空、为空、已填写、未填写、在范围内、不在范围内、选中、未选中、有、无
      if (!_.includes(['7', '8', '15', '16', '29', '30', '31', '32', '37', '38'], item.conditionId)) {
        if (
          _.isEmpty(item) ||
          !item.conditionValues.length ||
          (!item.conditionValues[0].value && !item.conditionValues[0].controlId)
        ) {
          nullFields++;
        }
      } else if (_.includes(['15', '16', '37', '38'], item.conditionId)) {
        if (
          !item.conditionValues.length ||
          (!(item.conditionValues[0] || {}).value &&
            !(item.conditionValues[0] || {}).controlId &&
            !(item.conditionValues[1] || {}).value &&
            !(item.conditionValues[1] || {}).controlId)
        ) {
          nullFields++;
        }
      }
    }),
  );

  return !!nullFields;
};

/**
 * 递归替换字段名
 * text {string} 要替换的文字
 * fieldMap {object} 字段映射的具体数据
 * connector {string} 文字之间的连接符,默认为>
 */
export const replaceField = (text, fieldMap, connector = '>') => {
  if (!fieldMap) return text;
  if (!Object.keys(fieldMap).length) return text;
  const reg = /\$(\w+-\w+)\$/;
  if (!reg.test(text)) return text;
  const handledText = text.replace(reg, ($0, $1) => {
    const value = $1.split('-').map(v => fieldMap[v].name);
    return ` (${value.join(connector)}) `;
  });
  return replaceField(handledText, fieldMap);
};

/**
 * 检验json格式
 */
export const checkJSON = value => {
  try {
    JSON.parse((value || '').replace(/\$.*?\$/g, 1));
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * 获取筛选的控件条件
 */
export const getConditionList = (type, enumDefault) => {
  let list;

  switch (type) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 7:
    case 32:
    case 33:
    case 41:
      list = { ids: ['1', '2', '3', '4', '5', '6', '8', '7'], defaultConditionId: '1' };
      break;
    case 6:
    case 8:
    case 31:
      list = { ids: ['9', '10', '11', '12', '13', '14', '15', '16', '8', '7'], defaultConditionId: '9' };
      break;
    case 9:
    case 11:
      list = { ids: ['9', '10', '1', '2', '8', '7'], defaultConditionId: '9' };
      break;
    case 10:
      list = { ids: ['9', '10', '3', '4', '8', '7'], defaultConditionId: '9' };
      break;
    case 14:
    case 21:
    case 40:
    case 42:
      list = { ids: ['31', '32'], defaultConditionId: '31' };
      break;
    case 15:
    case 16:
      list = { ids: ['9', '10', '41', '39', '37', '38', '8', '7'], defaultConditionId: '9' };
      break;
    case 19:
    case 23:
    case 24:
      list = { ids: ['1', '2', '3', '4', '35', '36', '8', '7'], defaultConditionId: '1' };
      break;
    case 28:
      list = { ids: ['1', '2', '8', '7'], defaultConditionId: '1' };
      break;
    case 26:
    case 10000001:
      if (enumDefault === 0) {
        list = { ids: ['9', '10', '1', '2', '8', '7'], defaultConditionId: '9' };
      } else {
        list = { ids: ['9', '10', '3', '4', '8', '7'], defaultConditionId: '9' };
      }
      break;
    case 27:
      if (enumDefault === 0) {
        list = { ids: ['9', '10', '1', '2', '35', '36', '8', '7'], defaultConditionId: '9' };
      } else {
        list = { ids: ['9', '10', '3', '4', '35', '36', '8', '7'], defaultConditionId: '9' };
      }
      break;
    case 29:
      if (enumDefault === 1) {
        list = { ids: ['33', '34', '3', '4', '31', '32'], defaultConditionId: '33' };
      } else {
        list = { ids: ['33', '34', '31', '32'], defaultConditionId: '33' };
      }
      break;
    case 36:
      list = { ids: ['29', '30'], defaultConditionId: '29' };
      break;
    case 38:
      if (enumDefault === 1) {
        list = { ids: ['9', '10', '11', '12', '13', '14', '15', '16', '8', '7'], defaultConditionId: '9' };
      } else {
        list = { ids: ['9', '10', '41', '39', '37', '38', '8', '7'], defaultConditionId: '9' };
      }
      break;
  }

  return list;
};

/**
 * 获取筛选的控件条件的个数
 */
export const getConditionNumber = id => {
  let count;

  switch (id) {
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '9':
    case '10':
    case '11':
    case '12':
    case '13':
    case '14':
    case '17':
    case '18':
    case '33':
    case '34':
    case '35':
    case '36':
    case '39':
    case '41':
      count = 1;
      break;
    case '7':
    case '8':
    case '29':
    case '30':
    case '31':
    case '32':
      count = 0;
      break;
    case '15':
    case '16':
    case '37':
    case '38':
      count = 2;
      break;
  }

  return count;
};
