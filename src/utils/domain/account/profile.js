import _ from 'lodash';

// 账号基础资料与名片字段的展示配置。
export const displayFieldForNameInfo = {
  1: { id: 'department', text: _l('部门') },
  3: { id: 'job', text: _l('职位') },
  4: { id: 'jobNumber', text: _l('工号') },
  5: { id: 'mobilePhone', text: _l('手机') },
  6: { id: 'email', text: _l('邮箱') },
  8: { id: 'workSite', text: _l('工作地点') },
  7: { id: 'contactPhone', text: _l('工作电话') },
  51: { id: 'currentDepartmentName', text: _l('部门') },
  52: { id: 'currentDepartmentFullName', text: _l('部门') },
  53: { id: 'currentJobTitleName', text: _l('职位') },
  54: { id: 'currentJobNumber', text: _l('工号') },
  55: { id: 'mobilePhone', text: _l('手机') },
  56: { id: 'mobilePhone', text: _l('手机') },
  57: { id: 'email', text: _l('邮箱') },
  58: { id: 'email', text: _l('邮箱') },
  59: { id: 'currentWorkPhone', text: _l('工作电话') },
  60: { id: 'currentWorkSiteName', text: _l('工作地点') },
};

/**
 * 按账号资料或名片场景生成字段展示配置，并合并已有的掩码设置。
 */
export const getFieldsData = (isCard, data = []) => {
  let initFieldsData = [1, 3, 4, 5, 6, 8, 7].map(item => ({ ...displayFieldForNameInfo[item], typeId: item }));

  if (isCard) {
    initFieldsData = [51, 53, 54, 55, 57, 60, 59].map(item => ({ ...displayFieldForNameInfo[item], typeId: item }));
  }

  if (!_.isEmpty(data)) {
    return data.map(item => ({
      ...displayFieldForNameInfo[item.typeId],
      isMask: _.includes([56, 58], item.typeId),
      typeId: item.typeId,
      hideMask: item.hideMask,
    }));
  }

  return initFieldsData;
};

/**
 * 对手机号或邮箱进行中间内容脱敏。
 */
export function maskValue(value, type) {
  if (!value) return '';
  const pattern = type === 'mobilePhone' ? /(\d{3})\d*(\d{4})/ : /(^\w)[^@]*(@.*$)/;
  return value.replace(pattern, '$1***$2');
}
