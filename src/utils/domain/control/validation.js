import { Parser } from 'hot-formula-parser';
import _, { includes, isEmpty } from 'lodash';
import { getAdvanceSetting } from './advancedSetting';
import { getControlByControlId } from './filters';
import { checkOptionsRepeat } from './options';

// 获取校验信息
/** 获取字段配置校验结果及对应错误文案。 */
export const getVerifyInfo = (data, { controls }) => {
  const { type, dataSource, enumDefault, sourceControlId, advancedSetting = {} } = data;
  let isValid = true;

  if (type === 30) {
    if (!sourceControlId) {
      return { text: _l('没有配置显示字段'), isValid: false };
    }
  }

  if (type === 31) {
    if (!dataSource) {
      return { text: _l('没有配置计算控件'), isValid: false };
    }

    const quoteIds = (dataSource.match(/\$(\w+)\$/g) || []).map(item => item.replace(/\$/g, ''));

    if (!isEmpty(quoteIds) && quoteIds.some(id => isEmpty(getControlByControlId(controls, id)))) {
      return { text: _l('存在已删除的字段'), isValid: false };
    }

    // 自定义计算
    if (enumDefault === 1) {
      const parser = new Parser();

      // 替换controlId及最后一个括号前的逗号
      const replaceValue = value => {
        return value.replace(/\$(.+?)\$/g, () => ` ${_.uniqueId()} `).replace(/,(?=\))/g, '');
      };

      const res = parser.parse(replaceValue(dataSource));

      if (res.error) {
        return { text: _l('自定义公式有语法错误'), isValid: false };
      }
    }
  }

  // 文本组合、汇总
  if (includes([32, 37], type)) {
    if (!dataSource) {
      return { text: _l('没有配置字段'), isValid: false };
    }
  }

  if (type === 43) {
    const ocrMap = getAdvanceSetting(data, 'ocrmap') || [];

    if (ocrMap.length < 1 && advancedSetting.ocrapitype !== '1') {
      return { isValid: false, text: _l('没有配置映射字段') };
    }
  }

  if (type === 47) {
    const { enumDefault, enumDefault2, dataSource } = data;

    if (((enumDefault === 1 || enumDefault2 === 3) && !dataSource) || (enumDefault === 2 && enumDefault2 === 0)) {
      return { isValid: false, text: _l('没有配置数据源') };
    }
  }

  if (includes([49, 50], type)) {
    if (!dataSource) {
      return { isValid: false, text: _l('没有选择查询模版') };
    }

    if (
      (data.hasAuth && !advancedSetting.authaccount) ||
      (type === 50 && (!advancedSetting.itemsource || !advancedSetting.itemtitle))
    ) {
      return { isValid: false, text: _l('有必填项未配置') };
    }
  }

  if (type === 6 && advancedSetting.showtype === '3' && !advancedSetting.numinterval) {
    return { isValid: false, text: _l('未配置步长') };
  }

  if (_.includes([9, 10, 11], type) && checkOptionsRepeat([data], false)) {
    return { isValid: false, text: _l('存在重复选项') };
  }

  return { isValid };
};

// 自动编号可选控件
/** 判断字段能否作为自动编号规则的数据源。 */
export const isAutoNumberSelectableControl = item => {
  const types = [2, 9, 10, 11, 15, 16, 19, 23, 24, 46];
  return types.includes(item.type);
};
