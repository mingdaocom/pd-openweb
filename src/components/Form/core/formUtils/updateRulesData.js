import _ from 'lodash';
import { controlState } from 'src/utils/control';
import { FORM_ERROR_TYPE } from '../config';
import { handleSetValueActions } from '../customEvent';
import { getAvailableFilters } from './helper';
import { checkValueAvailable, updateDataPermission } from './index';

// 移除必填错误
const removeRequireError = (controls = [], checkRuleValidator = () => {}) => {
  controls.forEach(con => {
    const { controlId = '', childControlIds = [] } = con;
    if (!childControlIds.length) {
      checkRuleValidator(controlId, FORM_ERROR_TYPE.RULE_REQUIRED, '');
    } else {
      childControlIds.map(child => checkRuleValidator(child, FORM_ERROR_TYPE.RULE_REQUIRED, ''));
    }
  });
};

// 字段显示规则计算
export const updateRulesData = props => {
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
      relationControls: (item.relationControls || []).map(re => ({ ...re, ...re.defaultState })),
    };
  });

  //字段过滤
  if (ignoreHideControl) {
    formatData = formatData.filter(da => controlState(da, from).visible);
  }

  // 存放各类操作具体执行内容
  let relateRuleType = {
    parent: {},
    child: {},
    errorMsg: {},
    dynamic: {},
  };

  function pushType(key, id, obj) {
    relateRuleType[key][id] ? relateRuleType[key][id].push(obj) : (relateRuleType[key][id] = [obj]);
  }

  const { defaultRules = [], errorRules = [] } = getAvailableFilters(rules, formatData, recordId);

  if (defaultRules.length > 0 || errorRules.length > 0) {
    // 交互类业务规则捞取各类操作具体执行内容
    if (defaultRules.length > 0) {
      defaultRules.forEach(rule => {
        rule.ruleItems.forEach(({ type, controls = [] }) => {
          let { isAvailable, availableControlIds = [] } = checkValueAvailable(rule, formatData, recordId);
          let currentType = type;
          //显示隐藏无论满足条件与否都要操作
          if (currentType === 1) {
            currentType = isAvailable ? 1 : 2;
          } else if (currentType === 2) {
            currentType = isAvailable ? 2 : 1;
          }

          // 条件变更需要移除必填错误
          if (currentType === 5 && !isAvailable) {
            removeRequireError(controls, checkRuleValidator);
          }

          if (!_.includes([1, 2], currentType) && !isAvailable) {
            return;
          }

          const attrObj = { type: currentType };

          if (_.includes([7, 8], currentType)) {
            formatData.map(item => {
              pushType('parent', item.controlId, attrObj);
            });
          } else if (currentType === 9) {
            // 条件字段有变更才更新值
            if (_.some(availableControlIds, a => _.includes(currentRuleControlIds, a))) {
              controls.forEach(con => {
                pushType('dynamic', con.controlId, { ..._.pick(con, ['type', 'value']) });
              });
            }
          } else {
            controls.forEach(con => {
              const { controlId = '', childControlIds = [], permission, isCustom } = con;
              if (!childControlIds.length) {
                pushType('parent', controlId, { ...attrObj, ...(isCustom ? { permission } : {}) });
              } else {
                childControlIds.map(child => pushType('child', `${controlId}-${child}`, attrObj));
              }
            });
          }
        });
      });
    }

    // 执行显隐等常规业务规则,由于事件规则会覆盖常规规则，所以这里必须执行
    formatData.forEach(it => {
      it.relationControls.forEach(re => {
        // 子表会出现控件id重复的情况
        const id = `${it.controlId}-${re.controlId}`;
        updateDataPermission({
          attrs: relateRuleType['child'][id],
          it: re,
          checkRuleValidator,
          item: it,
          verifyAllControls,
        });
      });
      updateDataPermission({
        attrs: relateRuleType['parent'][it.controlId],
        it,
        checkRuleValidator,
        verifyAllControls,
      });
    });

    // 执行验证业务规则
    if (errorRules.length > 0) {
      errorRules.forEach(rule => {
        // 前端校验才走
        if (rule.checkType !== 2) {
          rule.ruleItems.forEach(({ type, message, controls = [] }) => {
            const {
              filterControlIds = [],
              availableControlIds = [],
              isAvailable,
            } = checkValueAvailable(rule, formatData, recordId, from);
            if (_.includes([6], type)) {
              const errorIds = controls.map(i => i.controlId);
              const curErrorIds = rule.type === 1 && errorIds.length > 0 ? errorIds : filterControlIds;
              //过滤已经塞进去的错误
              (rule.type === 1 ? curErrorIds : filterControlIds).map(id =>
                checkRuleValidator(id, FORM_ERROR_TYPE.RULE_ERROR, '', rule),
              );
              if (isAvailable) {
                availableControlIds.forEach(controlId => {
                  if (!relateRuleType['errorMsg'][controlId]) {
                    //错误提示(checkAllUpdate为true全操作，
                    // 有变更时，ruleType === 1 指定字段直接塞错误
                    //否则操作变更的字段updateControlIds

                    const pushError = (id, msg) => {
                      pushType('errorMsg', id, msg);
                      if (_.find(formatData, fo => fo.controlId === id)) {
                        const errorMsg = relateRuleType['errorMsg'][id] || [];
                        checkRuleValidator(id, FORM_ERROR_TYPE.RULE_ERROR, errorMsg[0], rule);
                      }
                    };

                    if (
                      checkAllUpdate ||
                      (updateControlIds.length > 0 && (rule.type === 1 || _.includes(updateControlIds, controlId)))
                    ) {
                      if (rule.type === 1 && errorIds.length > 0) {
                        errorIds.forEach(e => {
                          pushError(e, message);
                        });
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

    // 执行设置值业务规则
    if (!_.isEmpty(relateRuleType.dynamic) && !disabledRuleSet) {
      Object.keys(relateRuleType.dynamic).map(async (key, index) => {
        const dynamicSettings = relateRuleType.dynamic[key];
        // 同个id赋值逻辑，取最后一个
        const lastSetting = _.last(dynamicSettings);
        if (lastSetting && _.isFunction(handleChange)) {
          try {
            await handleSetValueActions([{ ...lastSetting, controlId: key }], {
              formData: formatData,
              from,
              recordId,
              searchConfig,
              isSetValueFromRule: true,
              handleChange: (value, cid, item, searchByChange) => {
                const setComplete = index === Object.keys(relateRuleType.dynamic).length - 1;
                handleChange(value, cid, item, searchByChange, setComplete);
              },
            });
          } catch (error) {
            console.log(error);
          }
        }
      });
    }
  } else {
    //没有业务规则，还是要合并自定义事件
    formatData.forEach(it => {
      it.relationControls.forEach(re => {
        // 子表会出现控件id重复的情况
        updateDataPermission({
          attrs: [],
          it: re,
          checkRuleValidator,
          item: it,
        });
      });
      updateDataPermission({
        attrs: [],
        it,
        checkRuleValidator,
      });
    });
  }
  return formatData;
};
