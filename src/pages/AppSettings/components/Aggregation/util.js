import { useEffect, useRef } from 'react';
import _ from 'lodash';
import { OPERATION_TYPE_DATA } from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/config.js';
import { API_ENUM_TO_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum.js';
import {
  isFormulaResultAsSubtotal,
  isFormulaResultAsNumber,
  isFormulaResultAsDateTime,
  isFormulaResultAsDate,
  isFormulaResultAsTime,
} from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';

export const getNodeInfo = (flowData, type) => {
  return _.values(_.get(flowData, 'aggTableNodes') || {}).find(o => _.get(o, 'nodeType') === type) || {};
};
export const getConfigControls = (flowData, isGroup) => {
  const groupDt = getNodeInfo(flowData, 'GROUP');
  const aggregateDt = getNodeInfo(flowData, 'AGGREGATE');
  let controlOids = [];
  (_.get(groupDt, 'nodeConfig.config.groupFields') || []).map(o => {
    const { fields = [] } = o;
    fields.map((a = {}) => {
      controlOids.push(a.oid || '');
    });
  });
  if (isGroup) {
    return controlOids;
  }
  // !forAggregation &&
  (_.get(aggregateDt, 'nodeConfig.config.aggregateFields') || []).map((o = {}) => {
    if (!o.isCalculateField) {
      controlOids.push(o.oid || {});
    }
  });
  return controlOids;
};

export const getGroupFields = flowData => {
  const groupDt = getNodeInfo(flowData, 'GROUP');
  return (_.get(groupDt, 'nodeConfig.config.groupFields') || []).filter(o => !!o.fields && !!o.resultField);
};

const getAggFuncTypesByOid = (aggregateFields, oid) => {
  return _.uniq(aggregateFields.filter(o => o.oid === oid).map(o => o.aggFuncType));
};

export const getCanSelectControls = (sourceInfos, flowData, workSheetId, forAggregation) => {
  const controlOids = getConfigControls(flowData) || [];
  let list = [];
  if (forAggregation) {
    const aggregateDt = getNodeInfo(flowData, 'AGGREGATE');
    const aggregateFields = _.get(aggregateDt, 'nodeConfig.config.aggregateFields') || [];
    list = formatControls((sourceInfos.find(it => it.worksheetId === workSheetId) || {}).controls || []).filter(
      o =>
        !(
          (
            (o.type === 38 && o.enumDefault === 2) || //聚合不支持公式日期加减
            (o.type === 37 && !isFormulaResultAsSubtotal(o))
          ) //聚合不支持数值之外的
        ),
    );
    const groupOids = getConfigControls(flowData, true);
    list = list.filter(o =>
      o.controlId === 'rowscount'
        ? !_.includes(controlOids, `${workSheetId}_${o.controlId}`)
        : _.includes(groupOids, `${workSheetId}_${o.controlId}`)
        ? false //归组的字段，聚合不可选
        : _.includes(controlOids, `${workSheetId}_${o.controlId}`)
        ? getAggFuncTypesByOid(aggregateFields, `${workSheetId}_${o.controlId}`).length <
          getDefaultOperationDatas(o).length
        : true,
    );
  } else {
    list = formatControls((sourceInfos.find(it => it.worksheetId === workSheetId) || {}).controls || [])
      .filter(o => !_.includes(controlOids, `${workSheetId}_${o.controlId}`))
      .filter(
        o => ![31, 37].includes(o.type), //归组不支持汇总 公式数值
      );
  }
  return list;
};

export const getDefaultOperationDatas = item => {
  return OPERATION_TYPE_DATA.filter(o => {
    // 数值类字段
    if (
      _.includes([6, 8, 28, 31], item.type) ||
      (item.type === 38 && isFormulaResultAsNumber(item)) ||
      (item.type === 37 && isFormulaResultAsSubtotal(item))
    ) {
      return ['SUM', 'MAX', 'MIN', 'AVG'].includes(o.value);
    } else {
      return ['COUNT', 'DISTINCT_COUNT'].includes(o.value);
    }
  });
};

export const formatControls = controls => {
  // 嵌入,条码,分段,备注,标签页,自由链接,富文本,查询记录,他表字段仅显示,文本识别,api查询(按钮),加密文本,成员外部门户
  // 大写金额，定位 签名 子表 附件 公式字段(距离此刻时长/时长)(只支持加减)
  //老字段 17 18
  return controls.filter(
    o =>
      !(
        [17, 18, 45, 47, 22, 10010, 52, 21, 41, 51, 49, 43, 25, 40, 42, 34, 14].includes(o.type) ||
        // (o.type === 30 && (o.strDefault || '').split('')[0] === '1') ||
        o.type === 30 || // 他表字段 暂时都不支持
        !!o.encryId ||
        (o.type === 26 && _.get(o, 'advancedSetting.usertype') === '2') ||
        (o.type === 38 && o.enumDefault !== 2) || //公式字段(距离此刻时长) 公式字段(时长) 不支持，只支持加减
        (o.type === 29 && _.get(o, 'advancedSetting.hide') === '1')
      ),
  );
};

export const getAggFuncTypes = (aggregateFields, control, worksheetId) => {
  let hs = false;
  let aggFuncType = 'COUNT';
  let aggFuncName = _l('计数');
  if (control.controlId === 'rowscount') {
    hs = !!aggregateFields.find(o => o.oid === `${worksheetId}_rowscount`);
  } else {
    const list = getDefaultOperationDatas(control);
    const aggFuncTypes = aggregateFields
      .filter(o => o.oid === `${worksheetId}_${control.controlId}`)
      .map(o => o.aggFuncType);
    const others = list.filter(o => !(aggFuncTypes || []).includes(o.value));
    if (others.length <= 0) {
      hs = true;
    } else {
      aggFuncType = others[0].value;
      aggFuncName = others[0].text;
    }
  }

  return { hs, aggFuncType, aggFuncName };
};

export const extractBetweenDollars = str => {
  if (str === null || typeof str !== 'string') {
    // 处理错误情况，比如返回空数组或抛出异常
    return [];
  }
  // 正则表达式匹配两个"$"符号之间的内容
  const regex = /\$([^$]*)\$/g;
  // 执行匹配操作
  const matches = str.match(regex);
  // 去除每个匹配项中的"$"符号
  return matches ? matches.map(match => match.slice(1, -1)) : [];
};

export const getRuleAlias = (alias, flowData, isRule, getLen) => {
  const groupDt = getNodeInfo(flowData, 'GROUP');
  const aggregateDt = getNodeInfo(flowData, 'AGGREGATE');
  const groupFields = _.get(groupDt, 'nodeConfig.config.groupFields') || [];
  const aggregateFields = _.get(aggregateDt, 'nodeConfig.config.aggregateFields') || [];
  const aliasList = [];
  groupFields
    .map(o => {
      aliasList.push({ alias: _.get(o, 'resultField.alias'), id: _.get(o, 'resultField.id') });
    })
    .concat(
      aggregateFields.map(o => {
        aliasList.push({ alias: o.alias, id: o.id });
      }),
    )
    .filter(o => !!o);
  if (getLen) {
    return aliasList.filter(o => o.alias === alias);
  }
  if (isRule) {
    return !aliasList.find(o => o.alias === alias);
  }
  const addUniqueItemWithName = newName => {
    if (!aliasList.find(o => o.alias === newName)) {
      return newName;
    } else {
      // 如果有重复，添加后缀并检查新名称是否仍然重复
      let suffix = 1;
      let uniqueName = newName + suffix;
      while (aliasList.some(item => item.alias === uniqueName)) {
        suffix++;
        uniqueName = newName + suffix;
      }
      return uniqueName;
    }
  };
  return addUniqueItemWithName(alias);
};

//多源选择字段
export const getControls = (data, controls = []) => {
  return (
    controls
      //排除 非选项集的选项、大写金额、汇总、子表、签名、定位、关联多条
      .filter(
        o =>
          !([9, 10, 11].includes(o.type) && !o.dataSource) && //选项集的选项
          ![25, 37, 34, 42, 40].includes(o.type) && //大写金额、汇总、子表、签名、定位
          !([29].includes(o.type) && o.enumDefault === 2), //关联多条
      )
      .filter(o =>
        !!data
          ? [9, 10, 11].includes(data.mdType) //选项集且dataSource一致
            ? o.dataSource === _.get(data, 'controlSetting.dataSource') && [9, 10, 11].includes(o.type)
            : [29].includes(data.mdType)
            ? data.controlSetting.dataSource === o.dataSource && [29].includes(o.type) //相同的关联表
            : canSelectTypes(_.get(data, 'controlSetting'), o)
          : true,
      )
  );
};

//可选的字段类型
export const canSelectTypes = (data, item) => {
  switch (data.type) {
    case API_ENUM_TO_TYPE.TEXTAREA_INPUT_1:
    case API_ENUM_TO_TYPE.TEXTAREA_INPUT_2:
    case API_ENUM_TO_TYPE.CONCATENATE:
      // 文本（单行、多行）
      //文本、数值、金额、邮箱、时间、手机、、证件、文本组合、汇总、API查询(暂不支持)、自动编号（日期、公式需要数据集成支持转成文本在支持）
      return [
        API_ENUM_TO_TYPE.TEXTAREA_INPUT_1,
        API_ENUM_TO_TYPE.TEXTAREA_INPUT_2,
        API_ENUM_TO_TYPE.NUMBER_INPUT,
        API_ENUM_TO_TYPE.MONEY_AMOUNT_8,
        API_ENUM_TO_TYPE.EMAIL_INPUT,
        API_ENUM_TO_TYPE.TIME,
        API_ENUM_TO_TYPE.PHONE_NUMBER_3,
        API_ENUM_TO_TYPE.PHONE_NUMBER_4,
        // API_ENUM_TO_TYPE.DATE_INPUT_15,//暂时排除日期
        // API_ENUM_TO_TYPE.DATE_INPUT_16,
        // API_ENUM_TO_TYPE.DATE_TIME_RANGE_17,
        // API_ENUM_TO_TYPE.DATE_TIME_RANGE_18,
        // API_ENUM_TO_TYPE.NEW_FORMULA_31,
        // API_ENUM_TO_TYPE.NEW_FORMULA_38,
        API_ENUM_TO_TYPE.CRED_INPUT,
        API_ENUM_TO_TYPE.CONCATENATE,
        API_ENUM_TO_TYPE.SUBTOTAL,
      ].includes(item.type);
    case API_ENUM_TO_TYPE.PHONE_NUMBER_3:
    case API_ENUM_TO_TYPE.PHONE_NUMBER_4:
      // 电话
      //文本、电话
      return [
        API_ENUM_TO_TYPE.TEXTAREA_INPUT_1,
        API_ENUM_TO_TYPE.TEXTAREA_INPUT_2,
        API_ENUM_TO_TYPE.PHONE_NUMBER_3,
        API_ENUM_TO_TYPE.PHONE_NUMBER_4,
      ].includes(item.type);
    case API_ENUM_TO_TYPE.CRED_INPUT:
      // 证件
      // 证件 文本、
      return [
        API_ENUM_TO_TYPE.TEXTAREA_INPUT_1,
        API_ENUM_TO_TYPE.TEXTAREA_INPUT_2,
        API_ENUM_TO_TYPE.CRED_INPUT,
      ].includes(item.type);
    case API_ENUM_TO_TYPE.EMAIL_INPUT:
      // 邮箱
      //文本、邮箱
      return [
        API_ENUM_TO_TYPE.TEXTAREA_INPUT_1,
        API_ENUM_TO_TYPE.TEXTAREA_INPUT_2,
        API_ENUM_TO_TYPE.EMAIL_INPUT,
      ].includes(item.type);
    case API_ENUM_TO_TYPE.AREA_INPUT_24:
    case API_ENUM_TO_TYPE.AREA_INPUT_19:
    case API_ENUM_TO_TYPE.AREA_INPUT_23:
      //地区
      return [API_ENUM_TO_TYPE.AREA_INPUT_24, API_ENUM_TO_TYPE.AREA_INPUT_19, API_ENUM_TO_TYPE.AREA_INPUT_23].includes(
        item.type,
      );
    case API_ENUM_TO_TYPE.DATE_INPUT_15:
    case API_ENUM_TO_TYPE.DATE_INPUT_16:
    case API_ENUM_TO_TYPE.DATE_TIME_RANGE_17:
    case API_ENUM_TO_TYPE.DATE_TIME_RANGE_18:
      //日期 日期时间  公式（日期）日期加减
      return (
        [
          API_ENUM_TO_TYPE.DATE_INPUT_15,
          API_ENUM_TO_TYPE.DATE_INPUT_16,
          API_ENUM_TO_TYPE.DATE_TIME_RANGE_17,
          API_ENUM_TO_TYPE.DATE_TIME_RANGE_18,
        ].includes(item.type) ||
        (item.type === API_ENUM_TO_TYPE.NEW_FORMULA_38 && item.enumDefault === 2)
      );
    case API_ENUM_TO_TYPE.NEW_FORMULA_38:
    case API_ENUM_TO_TYPE.NEW_FORMULA_31:
      if (data.enumDefault === 2 && data.type === API_ENUM_TO_TYPE.NEW_FORMULA_38) {
        // 公式日期加减 =>日期、公式（日期加减时间）
        return (
          [
            API_ENUM_TO_TYPE.DATE_INPUT_15,
            API_ENUM_TO_TYPE.DATE_INPUT_16,
            API_ENUM_TO_TYPE.DATE_TIME_RANGE_17,
            API_ENUM_TO_TYPE.DATE_TIME_RANGE_18,
          ].includes(item.type) ||
          (item.type === API_ENUM_TO_TYPE.NEW_FORMULA_38 && item.enumDefault === 2)
        );
      } else {
        // 公式（除日期加减时间）=> 数值、金额、公式（除日期加减时间）、等级、
        return (
          [
            API_ENUM_TO_TYPE.NUMBER_INPUT,
            API_ENUM_TO_TYPE.MONEY_AMOUNT_8,
            API_ENUM_TO_TYPE.NEW_FORMULA_31,
            API_ENUM_TO_TYPE.SCORE,
          ].includes(item.type) ||
          (item.type === API_ENUM_TO_TYPE.NEW_FORMULA_38 && item.enumDefault !== 2)
        );
      }
    case API_ENUM_TO_TYPE.NUMBER_INPUT:
    case API_ENUM_TO_TYPE.MONEY_AMOUNT_8:
    case API_ENUM_TO_TYPE.SCORE:
      // 数值、金额、公式（除日期加减时间）、等级、=> 数值、金额、公式（除日期加减时间）、等级、
      return (
        [
          API_ENUM_TO_TYPE.NUMBER_INPUT,
          API_ENUM_TO_TYPE.MONEY_AMOUNT_8,
          API_ENUM_TO_TYPE.NEW_FORMULA_31,
          API_ENUM_TO_TYPE.SCORE,
        ].includes(item.type) ||
        (item.type === API_ENUM_TO_TYPE.NEW_FORMULA_38 && item.enumDefault !== 2)
      );
    case API_ENUM_TO_TYPE.AUTOID:
      // 自动编号  自动编号和文本
      return [API_ENUM_TO_TYPE.AUTOID, API_ENUM_TO_TYPE.TEXTAREA_INPUT_1, API_ENUM_TO_TYPE.TEXTAREA_INPUT_2].includes(
        item.type,
      );
    default:
      return data.type === item.type;
  }
};

export function useInterval(callback, delay) {
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    if (!delay && delay !== 0) {
      return;
    }
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

export const updateConfig = (sourceData, data) => {
  return {
    ...sourceData,
    nodeConfig: {
      ..._.get(sourceData, 'nodeConfig'),
      config: {
        ..._.get(sourceData, 'nodeConfig.config'),
        ...data,
      },
    },
  };
};

export const isHasChange = flowData => {
  let isChange = false;
  let changeLen = 0;
  const groupDt = getNodeInfo(flowData, 'GROUP');
  const aggregateDt = getNodeInfo(flowData, 'AGGREGATE');
  const groupFields = _.get(groupDt, 'nodeConfig.config.groupFields') || [];
  const aggregateFields = _.get(aggregateDt, 'nodeConfig.config.aggregateFields') || [];
  groupFields
    .map(o => {
      if (!_.get(o, 'resultField.id') || !_.get(flowData, `fieldIdAndAssignCidMap[${_.get(o, 'resultField.id')}]`)) {
        isChange = true;
        changeLen = changeLen + 1;
      }
    })
    .concat(
      aggregateFields.map(o => {
        if (!o.id || !_.get(flowData, `fieldIdAndAssignCidMap[${o.id}]`)) {
          isChange = true;
          changeLen = changeLen + 1;
        }
      }),
    )
    .filter(o => !!o);
  return {
    isChange,
    isAllChange: aggregateFields.length + groupFields.length <= changeLen,
    isDisPreview: groupFields.length <= 0 || aggregateFields.length <= 0,
  };
};

export const getResultField = (fields = []) => {
  if (fields.length <= 0) {
    return undefined;
  }
  let data = {
    ...fields[0],
    controlSetting: _.get(fields, '[0].controlSetting'),
  };
  const getShowtype = () => {
    // { text: _l('年'), value: '5' },
    // { text: _l('年-月'), value: '4' },
    // { text: _l('年-月-日'), value: '3' },
    // { text: _l('年-月-日 时'), value: '2' },
    // { text: _l('年-月-日 时:分'), value: '1' },
    // { text: _l('年-月-日 时:分:秒'), value: '6' },
    // { text: _l('时:分'), value: '8' },
    // { text: _l('时:分:秒'), value: '9' },
    let list = [];
    fields.map(o => {
      if (
        isFormulaResultAsTime(o.controlSetting) ||
        isFormulaResultAsDate(o.controlSetting) ||
        isFormulaResultAsDateTime(o.controlSetting) ||
        [46].includes(_.get(o, 'controlSetting.type'))
      ) {
        list.push(_.get(o, 'controlSetting.unit'));
      } else {
        list.push(_.get(o, 'controlSetting.advancedSetting.showtype'));
      }
    });
    if (
      isFormulaResultAsDate(data.controlSetting) ||
      isFormulaResultAsDateTime(data.controlSetting) ||
      [15, 16, 17, 18].includes(_.get(data, 'controlSetting.type'))
    ) {
      if (list.includes('6')) {
        return '6';
      } else {
        return _.min(list);
      }
    } else {
      return _.max(list);
    }
  };
  if (
    isFormulaResultAsDate(data.controlSetting) ||
    isFormulaResultAsDateTime(data.controlSetting) ||
    [15, 16, 17, 18].includes(_.get(data, 'controlSetting.type'))
  ) {
    const datatype = getShowtype();
    console.log(datatype);
    if (isFormulaResultAsDate(data.controlSetting) || isFormulaResultAsDateTime(data.controlSetting)) {
      //公式字段 配置在unit
      data.controlSetting.unit = datatype;
    } else {
      // 日期字段配置在showtype
      data.controlSetting.advancedSetting.showtype = datatype;
    }
  }
  if (isFormulaResultAsTime(data.controlSetting) || [46].includes(_.get(data, 'controlSetting.type'))) {
    const datatype = getShowtype();
    console.log(datatype);
    data.controlSetting.unit = datatype;
  }
  return data;
};
