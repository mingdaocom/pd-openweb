import _ from 'lodash';
import { getAvailableFilters } from './helper';
import { checkValueAvailable, updateDataPermission } from './index';
import { updateRulesDataByRule } from './ruleDataCore';

// 字段显示规则计算
export const updateRulesData = props => {
  return updateRulesDataByRule(props, {
    getAvailableFilters,
    checkValueAvailable,
    updateDataPermission,
    handleDynamicRules: ({ relateRuleType, formatData, from, recordId, searchConfig, handleChange }) => {
      const dynamicKeys = Object.keys(relateRuleType.dynamic);

      Promise.all(
        dynamicKeys.map(async key => {
          const dynamicSettings = relateRuleType.dynamic[key];
          // 同个id赋值逻辑，取最后一个
          const lastSetting = _.last(dynamicSettings);

          if (lastSetting) {
            try {
              const { handleSetValueActions } = await import('../customEvent');
              await handleSetValueActions([{ ...lastSetting, controlId: key }], {
                formData: formatData,
                from,
                recordId,
                searchConfig,
                isSetValueFromRule: true,
                handleChange: (value, cid, item, searchByChange) => {
                  handleChange(value, cid, item, searchByChange);
                },
              });
            } catch (error) {
              console.log(error);
            }
          }
        }),
      ).then(() => {
        handleChange(undefined, undefined, undefined, false, true);
      });
    },
  });
};
