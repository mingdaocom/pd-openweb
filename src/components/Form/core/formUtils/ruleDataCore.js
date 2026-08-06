import _ from 'lodash';
import { controlState } from 'src/utils/controlCommon';
import { FORM_ERROR_TYPE } from '../config';

const removeRequireError = (controls = [], checkRuleValidator = () => {}) => {
  controls.forEach(control => {
    const { controlId = '', childControlIds = [] } = control;

    if (!childControlIds.length) {
      checkRuleValidator(controlId, FORM_ERROR_TYPE.RULE_REQUIRED, '');
    } else {
      childControlIds.forEach(childControlId => checkRuleValidator(childControlId, FORM_ERROR_TYPE.RULE_REQUIRED, ''));
    }
  });
};

export const updateRulesDataByRule = (
  props,
  {
    getAvailableFilters,
    checkValueAvailable,
    updateDataPermission,
    handleDynamicRules,
    parseStyleSetting = value => JSON.parse(value || '{}'),
  },
) => {
  const {
    rules = [],
    data = [],
    recordId,
    from,
    checkAllUpdate = false,
    updateControlIds = [],
    currentRuleControlIds = [],
    searchConfig = [],
    ignoreHideControl = false,
    verifyAllControls = false,
    handleChange,
    checkRuleValidator = () => {},
    disabledRuleSet = false,
  } = props;
  let formatData = data.map(item => {
    return {
      ...item,
      ...item.defaultState,
      relationControls: (item.relationControls || []).map(relationControl => ({
        ...relationControl,
        ...relationControl.defaultState,
      })),
    };
  });

  if (ignoreHideControl) {
    formatData = formatData.filter(control => controlState(control, from).visible);
  }

  const formatDataMap = formatData.reduce((map, item) => {
    map[item.controlId] = item;
    return map;
  }, {});
  const relateRuleType = {
    parent: {},
    child: {},
    errorMsg: {},
    dynamic: {},
    style: {},
  };

  function pushType(key, id, obj) {
    relateRuleType[key][id] ? relateRuleType[key][id].push(obj) : (relateRuleType[key][id] = [obj]);
  }

  const { defaultRules = [], errorOrStyleRules = [] } = getAvailableFilters(rules, formatData, recordId);

  if (defaultRules.length > 0) {
    defaultRules.forEach(rule => {
      const { isAvailable, availableControlIds = [] } = checkValueAvailable(rule, formatData, recordId);

      rule.ruleItems.forEach(({ type, controls = [] }) => {
        let currentType = type;

        if (currentType === 1) {
          currentType = isAvailable ? 1 : 2;
        } else if (currentType === 2) {
          currentType = isAvailable ? 2 : 1;
        }

        if (currentType === 5 && !isAvailable) {
          removeRequireError(controls, checkRuleValidator);
        }

        if (!_.includes([1, 2], currentType) && !isAvailable) return;

        const attrObj = { type: currentType };

        if (_.includes([7, 8], currentType)) {
          formatData.forEach(item => pushType('parent', item.controlId, attrObj));
        } else {
          controls.forEach(control => {
            if (currentType === 9) {
              if (
                _.some(availableControlIds, availableControlId => _.includes(currentRuleControlIds, availableControlId))
              ) {
                pushType('dynamic', control.controlId, { ..._.pick(control, ['type', 'value']) });
              }
            } else {
              const { controlId = '', childControlIds = [], permission, isCustom } = control;

              if (!childControlIds.length) {
                pushType('parent', controlId, { ...attrObj, ...(isCustom ? { permission } : {}) });
              } else {
                childControlIds.forEach(childControlId => pushType('child', `${controlId}-${childControlId}`, attrObj));
              }
            }
          });
        }
      });
    });
  }

  formatData.forEach(item => {
    item.relationControls.forEach(relationControl => {
      const id = `${item.controlId}-${relationControl.controlId}`;
      updateDataPermission({
        attrs: relateRuleType.child[id],
        it: relationControl,
        checkRuleValidator,
        item,
        verifyAllControls,
      });
    });
    updateDataPermission({
      attrs: relateRuleType.parent[item.controlId],
      it: item,
      checkRuleValidator,
      verifyAllControls,
    });
  });

  if (errorOrStyleRules.length > 0) {
    errorOrStyleRules.forEach(rule => {
      if (rule.checkType !== 2 || rule.type === 3) {
        const {
          filterControlIds = [],
          availableControlIds = [],
          isAvailable,
        } = checkValueAvailable(rule, formatData, recordId, from);

        rule.ruleItems.forEach(({ type, message, controls = [] }) => {
          if (rule.type === 3 && isAvailable) {
            controls.forEach(control => {
              pushType('style', control.controlId, { ..._.pick(control, ['type', 'value']), message });
            });
          } else if (_.includes([6], type)) {
            const errorIds = controls.map(i => i.controlId);
            const curErrorIds = rule.type === 1 && errorIds.length > 0 ? errorIds : filterControlIds;
            (rule.type === 1 ? curErrorIds : filterControlIds).forEach(id =>
              checkRuleValidator(id, FORM_ERROR_TYPE.RULE_ERROR, '', rule),
            );

            if (isAvailable) {
              availableControlIds.forEach(controlId => {
                if (!relateRuleType.errorMsg[controlId]) {
                  const pushError = (id, msg) => {
                    pushType('errorMsg', id, msg);
                    if (formatDataMap[id]) {
                      const errorMsg = relateRuleType.errorMsg[id] || [];
                      checkRuleValidator(id, FORM_ERROR_TYPE.RULE_ERROR, errorMsg[0], rule);
                    }
                  };

                  if (
                    checkAllUpdate ||
                    (updateControlIds.length > 0 && (rule.type === 1 || _.includes(updateControlIds, controlId)))
                  ) {
                    if (rule.type === 1 && errorIds.length > 0) {
                      errorIds.forEach(errorId => pushError(errorId, message));
                    } else {
                      pushError(controlId, message);
                    }
                  }
                }
              });
            }
          }
        });
      }
    });
  }

  if (!_.isEmpty(relateRuleType.dynamic) && !disabledRuleSet && _.isFunction(handleChange) && handleDynamicRules) {
    handleDynamicRules({
      relateRuleType,
      formatData,
      from,
      recordId,
      searchConfig,
      handleChange,
    });
  }

  if (!_.isEmpty(relateRuleType.style)) {
    Object.keys(relateRuleType.style).forEach(key => {
      if (relateRuleType.style[key]) {
        const styleSettings = _.last(relateRuleType.style[key] || []);

        if (!_.isEmpty(styleSettings)) {
          const item = formatDataMap[key];

          if (item) {
            item.advancedSetting = {
              ...item.advancedSetting,
              ...parseStyleSetting(styleSettings.message),
              ...parseStyleSetting(styleSettings.value),
            };
          }
        }
      }
    });
  }

  return formatData;
};
