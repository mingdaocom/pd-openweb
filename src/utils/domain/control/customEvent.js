import _ from 'lodash';
import { dealRelateSheetDefaultValue, dealUserId } from './defaultValue';

// 自定义事件保存时处理执行动作内默认值
/** 规范化自定义事件动作中的成员、部门和关联记录默认值。 */
export const dealCusTomEventActions = (actionItems = [], controls = []) => {
  return (actionItems || []).map(item => {
    // 函数、查询不处理，动态值处理
    if (_.includes(['1', '2'], item.type)) return item;
    const currentControl = _.find(controls, c => c.controlId === item.controlId);

    // 默认值处理，成员、部门等取id
    if (currentControl && item.value) {
      // 用户id替换
      if (_.includes([26, 27, 48], currentControl.type)) {
        const dealData = dealUserId({ ...currentControl, advancedSetting: { defsource: item.value } });
        return { ...item, value: _.get(dealData, 'advancedSetting.defsource') };
      }

      if (_.includes([29, 35, 51], currentControl.type)) {
        const dealReData = dealRelateSheetDefaultValue({
          ...currentControl,
          advancedSetting: { defsource: item.value },
        });
        return { ...item, value: _.get(dealReData, 'advancedSetting.defsource') };
      }

      return item;
    } else {
      return item;
    }
  });
};
