import { getTranslateInfo } from 'src/utils/app';

const replaceOptionControlTranslateInfo = (data, { translateInfo, optionTranslateInfo }) => {
  data.options = data.options.map(item => {
    return {
      ...item,
      value: optionTranslateInfo[item.key] || item.value,
    };
  });
  data.advancedSetting.otherhint = translateInfo.otherhint || data.advancedSetting.otherhint;
}

export const replaceControlsTranslateInfo = (appId, worksheetId, controls = []) => {
  if (!window[`langData-${appId}`]) return controls;
  return controls.map(c => {
    const translateInfo = getTranslateInfo(appId, worksheetId, c.controlId);
    const { advancedSetting = {} } = c;
    const data = {
      ...c,
      controlName: translateInfo.name || c.controlName,
      hint: translateInfo.hintText || c.hint,
    };
    // 选项
    if ([9, 10, 11].includes(c.type)) {
      const optionTranslateInfo = c.dataSource ? getTranslateInfo(appId, null, c.dataSource) : translateInfo;
      replaceOptionControlTranslateInfo(data, { translateInfo, optionTranslateInfo });
    }
    // 检查项
    if (c.type === 36 && advancedSetting.itemnames) {
      const itemnames = JSON.parse(advancedSetting.itemnames);
      const newItemnames = itemnames.map(item => {
        return {
          ...item,
          value: translateInfo[item.key] || item.value,
        };
      });
      data.advancedSetting.itemnames = JSON.stringify(newItemnames);
    }
    // 数值
    if ([6, 8, 31].includes(c.type) && (advancedSetting.suffix || advancedSetting.prefix)) {
      if (advancedSetting.suffix) {
        data.advancedSetting.suffix = translateInfo.suffix || advancedSetting.suffix;
      }
      if (advancedSetting.prefix) {
        data.advancedSetting.prefix = translateInfo.suffix || advancedSetting.prefix;
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
      if (dataSource && [9, 10, 11].includes(c.sourceControlType)) {
        const optionTranslateInfo = getTranslateInfo(appId, dataSource, data.sourceControlId);
        replaceOptionControlTranslateInfo(data, { translateInfo, optionTranslateInfo });
      }
    }
    // 填充备注字段内容
    if (c.type === 10010) {
      data.dataSource = translateInfo.remark || c.dataSource;
    } else {
      data.desc = translateInfo.description || c.desc;
    }
    return data;
  });
};

export const replaceAdvancedSettingTranslateInfo = (appId, worksheetId, advancedSetting = {}) => {
  const translateInfo = getTranslateInfo(appId, null, worksheetId);
  const data = {
    ...advancedSetting,
    title: translateInfo.formTitle || advancedSetting.title,
    sub: translateInfo.formSub || advancedSetting.sub,
    continue: translateInfo.formContinue || advancedSetting.continue,
    deftabname: translateInfo.defaultTabName || advancedSetting.deftabname,
    btnname: translateInfo.createBtnName || advancedSetting.btnname,
  };
  if (data.doubleconfirm) {
    const doubleconfirm = JSON.parse(data.doubleconfirm);
    data.doubleconfirm = JSON.stringify({
      confirmMsg: translateInfo.confirmMsg || doubleconfirm.confirmMsg,
      confirmContent: translateInfo.confirmContent || doubleconfirm.confirmContent,
      sureName: translateInfo.sureName || doubleconfirm.sureName,
      cancelName: translateInfo.cancelName || doubleconfirm.cancelName,
    });
  }
  return data;
};

export const replaceRulesTranslateInfo = (appId, worksheetId, rules) => {
  return rules.map(rule => {
    const translateInfo = getTranslateInfo(appId, worksheetId, rule.ruleId);
    if (rule.type === 1) {
      rule.ruleItems[0].message = translateInfo.message || rule.ruleItems[0].message;
    }
    return rule;
  });
};

export const replaceBtnsTranslateInfo = (appId, btns = []) => {
  if (!window[`langData-${appId}`]) return btns;
  return btns.map(btn => {
    const translateInfo = getTranslateInfo(appId, null, btn.btnId);
    return {
      ...btn,
      name: translateInfo.name || btn.name,
      desc: translateInfo.description || btn.desc,
    };
  });
};
