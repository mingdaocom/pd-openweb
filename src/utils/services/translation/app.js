import _ from 'lodash';
import { hasAppLangData } from 'src/utils/platform/runtime/config';
import { getTranslateInfo } from 'src/utils/services/app';

const replaceOptionControlTranslateInfo = (data, { translateInfo, optionTranslateInfo }) => {
  data.options = data.options.map(item => {
    return {
      ...item,
      value: item.value ? optionTranslateInfo[item.key] || item.value : '',
    };
  });
  if (data.advancedSetting.otherhint) {
    data.advancedSetting.otherhint = translateInfo.otherhint || data.advancedSetting.otherhint;
  }
};

/**
 * 用应用语言包递归替换控件名称、提示、选项及相关配置文案。
 */
export const replaceControlsTranslateInfo = (appId, worksheetId, controls = []) => {
  if (!hasAppLangData(appId)) return controls;
  return controls.map(c => {
    const translateInfo = getTranslateInfo(appId, worksheetId, c.controlId);
    const { advancedSetting = {} } = c;
    const data = {
      ...c,
      controlName: translateInfo.name || c.controlName,
      hint: c.hint ? translateInfo.hintText || c.hint : '',
    };

    // 选项
    if ([9, 10, 11].includes(c.type)) {
      const optionTranslateInfo = c.dataSource ? getTranslateInfo(appId, null, c.dataSource) : translateInfo;
      replaceOptionControlTranslateInfo(data, { translateInfo, optionTranslateInfo });
    }

    // 检查项
    if (c.type === 36 && advancedSetting.itemnames) {
      const itemnames = safeParse(advancedSetting.itemnames, null);

      if (_.isArray(itemnames)) {
        const newItemnames = itemnames.map(item => {
          return {
            ...item,
            value: item.value ? translateInfo[item.key] || item.value : '',
          };
        });
        data.advancedSetting.itemnames = JSON.stringify(newItemnames);
      }
    }

    // 数值
    if ([6, 8, 31].includes(c.type) && (advancedSetting.suffix || advancedSetting.prefix)) {
      if (advancedSetting.suffix) {
        data.advancedSetting.suffix = translateInfo.suffix || advancedSetting.suffix;
      }

      if (advancedSetting.prefix) {
        data.advancedSetting.prefix = translateInfo.prefix || advancedSetting.prefix;
      }
    }

    // 子表 || 关联表
    if (c.type === 34 || c.type === 29) {
      if (data.sourceBtnName) {
        const translateInfo = getTranslateInfo(appId, null, data.dataSource);
        data.sourceBtnName = translateInfo.createBtnName || data.sourceBtnName;
      }

      data.relationControls = replaceControlsTranslateInfo(appId, data.dataSource, data.relationControls);
    }

    // 他表字段
    if (c.type === 30) {
      const { dataSource } = _.find(controls, { controlId: c.dataSource.replace(/\$/g, '') }) || {};

      // 选项集
      if (c.sourceControl?.dataSource && [9, 10, 11].includes(c.sourceControlType)) {
        const optionTranslateInfo = getTranslateInfo(appId, null, c.sourceControl.dataSource);
        replaceOptionControlTranslateInfo(data, { translateInfo, optionTranslateInfo });
      } else {
        // 普通控件
        if (dataSource && [9, 10, 11].includes(c.sourceControlType)) {
          const optionTranslateInfo = getTranslateInfo(appId, dataSource, data.sourceControlId);
          replaceOptionControlTranslateInfo(data, { translateInfo, optionTranslateInfo });
        }
      }
    }

    // 填充备注字段内容
    if (c.type === 10010) {
      data.dataSource = c.dataSource ? translateInfo.remark || c.dataSource : '';
    } else {
      data.desc = c.desc ? translateInfo.description || c.desc : '';
    }

    return data;
  });
};

/**
 * 用应用语言包替换工作表表单高级设置中的自定义文案。
 */
export const replaceAdvancedSettingTranslateInfo = (appId, worksheetId, advancedSetting = {}) => {
  const translateInfo = getTranslateInfo(appId, null, worksheetId);
  const data = {
    ...advancedSetting,
    title: advancedSetting.title ? translateInfo.formTitle || advancedSetting.title : '',
    sub: advancedSetting.sub ? translateInfo.formSub || advancedSetting.sub : '',
    continue: advancedSetting.continue ? translateInfo.formContinue || advancedSetting.continue : '',
    deftabname: advancedSetting.deftabname ? translateInfo.defaultTabName || advancedSetting.deftabname : '',
    btnname: advancedSetting.btnname ? translateInfo.createBtnName || advancedSetting.btnname : '',
  };

  if (data.doubleconfirm) {
    const doubleconfirm = safeParse(data.doubleconfirm, null);

    if (_.isObject(doubleconfirm) && !_.isArray(doubleconfirm)) {
      data.doubleconfirm = JSON.stringify({
        confirmMsg: doubleconfirm.confirmMsg ? translateInfo.confirmMsg || doubleconfirm.confirmMsg : '',
        confirmContent: doubleconfirm.confirmContent
          ? translateInfo.confirmContent || doubleconfirm.confirmContent
          : '',
        sureName: doubleconfirm.sureName ? translateInfo.sureName || doubleconfirm.sureName : '',
        cancelName: doubleconfirm.cancelName ? translateInfo.cancelName || doubleconfirm.cancelName : '',
      });
    }
  }

  return data;
};

/**
 * 用应用语言包替换字段规则中的校验提示。
 */
export const replaceRulesTranslateInfo = (appId, worksheetId, rules) => {
  return rules.map(rule => {
    const translateInfo = getTranslateInfo(appId, worksheetId, rule.ruleId);

    if (rule.type === 1 && rule.ruleItems && rule.ruleItems[0] && rule.ruleItems[0].message) {
      rule.ruleItems[0].message = translateInfo.message || rule.ruleItems[0].message;
    }

    return rule;
  });
};

/**
 * 用应用语言包替换自定义按钮的名称与描述。
 */
export const replaceBtnsTranslateInfo = (appId, btns = []) => {
  if (!hasAppLangData(appId)) return btns;
  return btns.map(btn => {
    const translateInfo = getTranslateInfo(appId, null, btn.btnId);
    return {
      ...btn,
      name: translateInfo.name || btn.name,
      desc: btn.desc ? translateInfo.description || btn.desc : '',
    };
  });
};
