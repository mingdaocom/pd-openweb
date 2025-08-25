import { useEffect, useRef } from 'react';
import _ from 'lodash';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { OPERATION_TYPE_DATA } from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/config.js';
import { CAN_AS_TIME_DYNAMIC_FIELD } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/config.js';
import {
  isFormulaResultAsDate,
  isFormulaResultAsDateTime,
  isFormulaResultAsNumber,
  isFormulaResultAsSubtotal,
  isFormulaResultAsSubtotalDateTime,
  isFormulaResultAsSubtotalTime,
  isFormulaResultAsTime,
} from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import { API_ENUM_TO_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum.js';
import { VersionProductType } from 'src/utils/enum';
import { getSyncLicenseInfo } from 'src/utils/project';
import { DATE_TIME_DATA_PARTICLE, GROUPLIMITTYPES } from './config';

export const getNodeInfo = (flowData, type) => {
  return _.values(_.get(flowData, 'aggTableNodes') || {}).find(o => _.get(o, 'nodeType') === type) || {};
};

//是否同一个字段
const isEqualControl = (parentControl, control, item, workSheetId) => {
  return parentControl && _.get(item, 'parentFieldInfo.oid')
    ? _.get(item, 'oid') === `${parentControl.dataSource}_${control.controlId}` &&
        _.get(item, 'parentFieldInfo.oid') === `${workSheetId}_${parentControl.controlId}`
    : !parentControl &&
        _.get(item, 'oid') === `${workSheetId}_${control.controlId}` &&
        !_.get(item, 'parentFieldInfo.oid');
};

//判断这个字段是否已配置过
export const isIn = (flowData, control, parentControl, workSheetId, isGroup) => {
  const groupDt = getNodeInfo(flowData, 'GROUP');
  const aggregateDt = getNodeInfo(flowData, 'AGGREGATE');
  let hs = [];
  (_.get(groupDt, 'nodeConfig.config.groupFields') || []).map(o => {
    const { fields = [] } = o;
    hs.push(...fields.filter((a = {}) => isEqualControl(parentControl, control, a, workSheetId)));
  });
  if (isGroup) {
    return hs.length > 0;
  }
  const aggHs = (_.get(aggregateDt, 'nodeConfig.config.aggregateFields') || []).find(
    (a = {}) => !a.isCalculateField && isEqualControl(parentControl, control, a, workSheetId),
  );
  if (aggHs) {
    hs = hs.concat(aggHs);
  }
  return hs.length > 0;
};

export const getGroupFields = flowData => {
  const groupDt = getNodeInfo(flowData, 'GROUP');
  return (_.get(groupDt, 'nodeConfig.config.groupFields') || []).filter(o => !!o.fields && !!o.resultField);
};

export const canChooseForParent = (flowData, dataSource) => {
  const sourceDtList = getAllSourceList(flowData);
  return (
    sourceDtList.find(o => o.isRelative && o.dataSource === dataSource) ||
    sourceDtList.length < getSourceMaxCountByVersion(flowData.projectId)
  );
};

export const canAgg = (control, parentControl, flowData, workSheetId) => {
  const aggregateDt = getNodeInfo(flowData, 'AGGREGATE');
  const aggregateFields = _.get(aggregateDt, 'nodeConfig.config.aggregateFields') || [];
  return (
    aggregateFields.filter(a => isEqualControl(parentControl, control, a, workSheetId)).length <
    getDefaultOperationDatas(control).length
  );
};

export const getCanSelectControls = (sourceInfos, flowData, workSheetId, forAggregation) => {
  let list = (sourceInfos.find(it => it.worksheetId === workSheetId) || {}).controls || [];
  if (forAggregation) {
    list = list.filter(
      o =>
        !(
          (
            (o.type === 38 && o.enumDefault === 2) || //聚合不支持公式日期加减
            (o.type === 37 && !isFormulaResultAsSubtotal(o))
          ) //聚合不支持数值之外的
        ),
    );
    const onFilter = it => {
      return (
        ![34, 35, 29].includes(it.type) &&
        !(
          (
            (it.type === 38 && it.enumDefault === 2) || //聚合不支持公式日期加减
            (it.type === 37 && !isFormulaResultAsSubtotal(it))
          ) //聚合不支持数值之外的
        )
      );
    };
    const isInGroup = o => {
      if ([34, 35, 29].includes(o.type)) {
        return (
          formatControls(o.relationControls).filter(it => !isIn(flowData, it, o, workSheetId, true) && onFilter(it))
            .length <= 0
        );
      } else {
        return isIn(flowData, o, null, workSheetId, true);
      }
    };
    list = list.map(oo => {
      let o = { ...oo, disableChoose: false };
      if (o.controlId === 'rowscount') {
        if (isIn(flowData, o, null, workSheetId, false)) {
          return { ...o, disableChoose: true };
        }
        return o;
      }
      if ([34, 35, 29].includes(o.type)) {
        //聚合中的字段，聚合方式不能重复
        if (
          !isInGroup(o) &&
          formatControls(o.relationControls).filter(it => onFilter(it) && canAgg(it, o, flowData, workSheetId)).length >
            0
        ) {
          return o;
        }
        return { ...o, disableChoose: true };
      } else {
        if (isInGroup(o)) {
          //归组的字段，聚合不可选
          return { ...o, disableChoose: true };
        }
        if (isIn(flowData, o, null, workSheetId, false)) {
          return { ...o, disableChoose: !canAgg(o, null, flowData, workSheetId) };
        }
        return { ...o, disableChoose: false };
      }
    });
  } else {
    list = list.filter(
      o => ![31, 37].includes(o.type), //归组不支持汇总 公式数值
    );
    const onFilter = it => {
      return ![34, 35, 29, 31, 37, 6, 8].includes(it.type);
    };
    list = list.map(oo => {
      let o = { ...oo, disableChoose: false };
      if ([34, 35, 29].includes(o.type)) {
        const relationControls = formatControls(o.relationControls).filter(
          it => !isIn(flowData, it, o, workSheetId, false) && onFilter(it),
        );
        return {
          ...o,
          disableChoose: relationControls.length <= 0,
        };
      } else {
        if (isIn(flowData, o, null, workSheetId, false)) {
          return { ...o, disableChoose: true };
        }
        return o;
      }
    });
  }
  return list;
};
//聚合方式
export const getDefaultOperationDatas = item => {
  return OPERATION_TYPE_DATA.filter(o => {
    // 数值类字段
    if (
      _.includes([6, 8, 28, 31], item.type) ||
      (item.type === 38 && isFormulaResultAsNumber(item)) ||
      (item.type === 37 && isFormulaResultAsSubtotal(item))
    ) {
      return ['SUM', 'MAX', 'MIN', 'AVG', 'COUNT', 'DISTINCT_COUNT'].includes(o.value);
    } else {
      return ['COUNT', 'DISTINCT_COUNT'].includes(o.value);
    }
  });
};

const isRuleRelative = o => {
  //单对单 单对多 多对单
  return (
    o.type === 29 &&
    // o.enumDefault === 1 &&
    o.sourceControlId &&
    o.relationControls.length > 0 &&
    _.get(getSourceControl(o.relationControls, o.sourceControlId), 'type') === 29
    // && _.get(getSourceControl(o.relationControls, o.sourceControlId), 'enumDefault') === 1
  );
};

export const formatControls = (controls, worksheetId) => {
  // 嵌入,条码,分段,备注,标签页,自由链接,富文本,查询记录,他表字段仅显示,文本识别,api查询(按钮),加密文本,成员外部门户
  // 大写金额，定位 签名 附件
  //老字段 17 18
  //汇总都不支持配置  37
  //54 自定义字段
  // 公式字段(距离此刻时长|为日期加减时间) 不支持
  return controls.filter(
    o =>
      o.type === 29
        ? _.get(o, 'advancedSetting.hide') !== '1' && isRuleRelative(o)
        : !(
            [17, 18, 45, 47, 22, 10010, 52, 21, 41, 51, 49, 43, 25, 40, 42, 14, 53, 37, 54].includes(o.type) ||
            // (o.type === 30 && (o.strDefault || '').split('')[0] === '1') ||
            o.type === 30 || // 他表字段 暂时都不支持
            !!o.encryId ||
            (o.type === 26 && _.get(o, 'advancedSetting.usertype') === '2')
          ) &&
          !([34, 35].includes(o.type) && o.dataSource === worksheetId) &&
          !(o.type === 38 && [2, 3].includes(o.enumDefault)), //公式字段(距离此刻时长|为日期加减时间) 不支持
  );
};

const getSourceControl = (relationControls, sourceControlId) => {
  return relationControls.find(o => o.controlId === sourceControlId);
};

export const filterForFilterDialog = controls => {
  // 嵌入,条码,分段,备注,标签页,自由链接,查询记录,他表字段仅显示,文本识别,api查询(按钮),成员外部门户
  // 大写金额， 附件
  //老字段 17 18
  return controls
    .filter(
      o =>
        !(
          [17, 18, 45, 47, 22, 10010, 52, 21, 51, 49, 43, 25, 14, 53].includes(o.type) ||
          // (o.type === 30 && (o.strDefault || '').split('')[0] === '1') ||
          o.type === 30 || // 他表字段 暂时都不支持
          (o.type === 26 && _.get(o, 'advancedSetting.usertype') === '2') ||
          (o.type === 29 && _.get(o, 'advancedSetting.hide') === '1')
        ),
    )
    .filter(o => !(o.type === 29 && _.get(o, 'enumDefault') === 2)); //暂时排除关联多条的筛选
};

export const getAggFuncTypes = (aggregateFields, parentControl, control, worksheetId) => {
  let hs = false;
  let aggFuncType = 'COUNT';
  let aggFuncName = _l('计数');
  if (control.controlId === 'rowscount') {
    hs = !!aggregateFields.find(o => o.oid === `${worksheetId}_rowscount`);
  } else {
    const list = getDefaultOperationDatas(control);
    const aggFuncTypes = aggregateFields
      .filter(o => isEqualControl(parentControl, control, o, worksheetId))
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
      //排除 非选项集的选项、大写金额、汇总、签名、定位
      .filter(
        o =>
          !([9, 10, 11].includes(o.type) && !o.dataSource) && //选项集的选项
          ![25, 37, 42, 40].includes(o.type), //大写金额、汇总、签名、定位
      )
      .filter(o => (data ? canSelectTypes(_.get(data, 'controlSetting'), o) : true))
  );
};

//多源归组 可选的字段类型
export const canSelectTypes = (data, item) => {
  //关联下的字段 排除非单对单
  if (29 === item.type ? isRuleRelative(item) : [34, 35].includes(item.type)) {
    const onFilter = it => {
      return ![34, 35, 29, 31, 37, 6, 8].includes(it.type);
    };
    const relationControls = formatControls(item.relationControls).filter(
      it => onFilter(it) && canSelectTypes(data, it),
    );
    return relationControls.length > 0;
  }
  if ([9, 10, 11].includes(data.mdType)) {
    //选项集且dataSource一致
    return item.dataSource === _.get(data, 'controlSetting.dataSource') && [9, 10, 11].includes(item.type);
  }
  if ([29].includes(data.mdType)) {
    return data.controlSetting.dataSource === item.dataSource && [29].includes(item.type); //相同的关联表
  }
  switch (data.type) {
    case API_ENUM_TO_TYPE.NEW_FORMULA_38:
    case API_ENUM_TO_TYPE.NEW_FORMULA_31:
    case API_ENUM_TO_TYPE.SUBTOTAL:
      // 时间类
      if (
        (data.type === API_ENUM_TO_TYPE.SUBTOTAL && isFormulaResultAsSubtotalTime(data)) ||
        (data.type === API_ENUM_TO_TYPE.NEW_FORMULA_38 && isFormulaResultAsTime(data))
      ) {
        return (
          API_ENUM_TO_TYPE.TIME === item.type ||
          (item.type === API_ENUM_TO_TYPE.SUBTOTAL && isFormulaResultAsSubtotalTime(item)) ||
          (item.type === API_ENUM_TO_TYPE.NEW_FORMULA_38 && isFormulaResultAsTime(item))
        );
      }
      // 日期时间类
      if (
        (data.type === API_ENUM_TO_TYPE.NEW_FORMULA_38 &&
          (isFormulaResultAsDateTime(data) || isFormulaResultAsDate(data))) || // 公式日期加减 =>日期、公式（日期加减时间）
        (data.type === API_ENUM_TO_TYPE.SUBTOTAL && isFormulaResultAsSubtotalDateTime(data)) //汇总日期时间类
      ) {
        return (
          [
            API_ENUM_TO_TYPE.DATE_INPUT_15,
            API_ENUM_TO_TYPE.DATE_INPUT_16,
            API_ENUM_TO_TYPE.DATE_TIME_RANGE_17,
            API_ENUM_TO_TYPE.DATE_TIME_RANGE_18,
          ].includes(item.type) ||
          (data.type === API_ENUM_TO_TYPE.NEW_FORMULA_38 &&
            (isFormulaResultAsDateTime(data) || isFormulaResultAsDate(data))) ||
          (item.type === API_ENUM_TO_TYPE.SUBTOTAL && isFormulaResultAsSubtotalDateTime(item))
        );
      } else {
        //数值类
        // 公式（除日期加减时间）=> 数值、金额、公式（除日期加减时间）、等级、
        return (
          [
            API_ENUM_TO_TYPE.TEXTAREA_INPUT_1,
            API_ENUM_TO_TYPE.TEXTAREA_INPUT_2,
            API_ENUM_TO_TYPE.NUMBER_INPUT,
            API_ENUM_TO_TYPE.MONEY_AMOUNT_8,
            API_ENUM_TO_TYPE.NEW_FORMULA_31,
            API_ENUM_TO_TYPE.SCORE,
            API_ENUM_TO_TYPE.EMAIL_INPUT,
            API_ENUM_TO_TYPE.PHONE_NUMBER_3,
            API_ENUM_TO_TYPE.PHONE_NUMBER_4,
            API_ENUM_TO_TYPE.CRED_INPUT,
            API_ENUM_TO_TYPE.CONCATENATE,
            API_ENUM_TO_TYPE.API_SEARCH,
            API_ENUM_TO_TYPE.AUTOID,
          ].includes(item.type) ||
          isFormulaResultAsNumber(item) ||
          isFormulaResultAsSubtotal(item)
        );
      }
    case API_ENUM_TO_TYPE.TIME:
      return (
        API_ENUM_TO_TYPE.TIME === item.type ||
        (item.type === API_ENUM_TO_TYPE.SUBTOTAL && isFormulaResultAsSubtotalTime(item)) ||
        (item.type === API_ENUM_TO_TYPE.NEW_FORMULA_38 && isFormulaResultAsTime(item))
      );
    case API_ENUM_TO_TYPE.TEXTAREA_INPUT_1: //文本
    case API_ENUM_TO_TYPE.TEXTAREA_INPUT_2:
    case API_ENUM_TO_TYPE.NUMBER_INPUT: //数值
    case API_ENUM_TO_TYPE.MONEY_AMOUNT_8: //金额
    case API_ENUM_TO_TYPE.SCORE: //等级
    case API_ENUM_TO_TYPE.EMAIL_INPUT: //邮箱
    case API_ENUM_TO_TYPE.PHONE_NUMBER_3:
    case API_ENUM_TO_TYPE.PHONE_NUMBER_4: //手机
    case API_ENUM_TO_TYPE.CRED_INPUT: //证件
    case API_ENUM_TO_TYPE.CONCATENATE: //文本组合
    case API_ENUM_TO_TYPE.API_SEARCH: //API查询、
    case API_ENUM_TO_TYPE.AUTOID: //自动编号
      return (
        [
          API_ENUM_TO_TYPE.TEXTAREA_INPUT_1,
          API_ENUM_TO_TYPE.TEXTAREA_INPUT_2,
          API_ENUM_TO_TYPE.NUMBER_INPUT,
          API_ENUM_TO_TYPE.MONEY_AMOUNT_8,
          API_ENUM_TO_TYPE.NEW_FORMULA_31,
          API_ENUM_TO_TYPE.SCORE,
          API_ENUM_TO_TYPE.EMAIL_INPUT,
          API_ENUM_TO_TYPE.PHONE_NUMBER_3,
          API_ENUM_TO_TYPE.PHONE_NUMBER_4,
          API_ENUM_TO_TYPE.CRED_INPUT,
          API_ENUM_TO_TYPE.CONCATENATE,
          API_ENUM_TO_TYPE.API_SEARCH,
          API_ENUM_TO_TYPE.AUTOID,
        ].includes(item.type) ||
        isFormulaResultAsNumber(item) ||
        isFormulaResultAsSubtotal(item)
      );
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
        (data.type === API_ENUM_TO_TYPE.NEW_FORMULA_38 &&
          (isFormulaResultAsDateTime(data) || isFormulaResultAsDate(data))) ||
        (item.type === API_ENUM_TO_TYPE.SUBTOTAL && isFormulaResultAsSubtotalDateTime(item))
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
//多源归组ResultField及配置处理
export const getResultField = (fields = [], flowData, aggFuncType) => {
  if (fields.length <= 0) {
    return undefined;
  }
  let data = {
    ...fields[0],
    ...getGroupInfo({ fields }, flowData),
    controlSetting: formatGroupConfig(fields),
    mdType: formatGroupConfig(fields).type,
  };
  if (aggFuncType) {
    data.aggFuncType = aggFuncType;
  }
  const getShowtype = () => {
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
  if (data.aggFuncType) {
    data = setResultFieldSettingByAggFuncType(data);
  } else {
    if (
      isFormulaResultAsDate(data.controlSetting) ||
      isFormulaResultAsDateTime(data.controlSetting) ||
      [15, 16, 17, 18].includes(_.get(data, 'controlSetting.type'))
    ) {
      const datatype = getShowtype();
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
      data.controlSetting.unit = datatype;
    }
  }
  return data;
};

//归组字段是否日期时间类字段
export const isDateTimeGroup = item => {
  let isTimeType = true;
  (_.get(item, 'fields') || []).map(data => {
    if (
      !(
        isFormulaResultAsSubtotalDateTime(data.controlSetting) ||
        [15, 16, 17, 18].includes(_.get(data, 'controlSetting.type'))
      )
    ) {
      isTimeType = false;
    }
  });
  return isTimeType;
};

//归组字段是否公式日期 日期时间
export const isDateForFormulaResultGroup = item => {
  let isTimeType = true;
  (_.get(item, 'fields') || []).map(data => {
    if (!isFormulaDateOrDateTimeResult(data.controlSetting)) {
      isTimeType = false;
    }
  });
  return isTimeType;
};

//公式日期 日期 日期时间
export const isFormulaDateOrDateTimeResult = data => {
  return isFormulaResultAsDate(data) || isFormulaResultAsDateTime(data);
};

//归组字段是否时间类字段
export const isTimeGroup = item => {
  let isTimeType = true;
  (_.get(item, 'fields') || []).map(data => {
    if (
      !(
        isFormulaResultAsTime(data.controlSetting) ||
        isFormulaResultAsSubtotalTime(data.controlSetting) ||
        [46].includes(_.get(data, 'controlSetting.type'))
      )
    ) {
      isTimeType = false;
    }
  });
  return isTimeType;
};

//归组字段是否数字类字段
export const isNumberGroup = item => {
  let isNumberType = true;
  (_.get(item, 'fields') || []).map(data => {
    //数值、金额、公式（数值类型）、等级、汇总
    if (
      !(
        [API_ENUM_TO_TYPE.NUMBER_INPUT, API_ENUM_TO_TYPE.MONEY_AMOUNT_8, API_ENUM_TO_TYPE.SCORE].includes(
          _.get(data, 'controlSetting.type'),
        ) ||
        isFormulaResultAsNumber(data) ||
        isFormulaResultAsSubtotal(data)
      )
    ) {
      isNumberType = false;
    }
  });
  return isNumberType;
};

// 归组方式
export const getDefaultOperationForGroup = item => {
  return isDateTimeGroup(item)
    ? DATE_TIME_DATA_PARTICLE.filter(o => !['CUR_SEASON', 'CUR_WEEK'].includes(o.value)) //暂时排除季和周
    : [];
};

//计数归组字段的alias和aggFuncType
export const getGroupInfo = (data, flowData) => {
  let newDt = {};
  if (
    isDateTimeGroup(data) //|| isTimeGroup(data)
  ) {
    const aggFuncTypeList = getDefaultOperationForGroup(data);
    newDt.aggFuncType = aggFuncTypeList.find(o => o.value === 'TODAY') ? 'TODAY' : aggFuncTypeList[0].value;
    const text = aggFuncTypeList.find(o => o.value === newDt.aggFuncType).text;
    newDt.alias = getRuleAlias(`${_.get(data, 'fields[0].alias') || _.get(data, 'fields[0].name')}-${text}`, flowData);
    if (_.get(newDt, 'controlSetting.advancedSetting.showformat')) {
      newDt.controlSetting.advancedSetting.showformat = '0'; //日期时间 ---
    }
  }
  return newDt;
};
//获取数据源节点需要展示的数据 包含源节点 以及关联的字段
export const getAllSourceList = (flowData, source) => {
  const sourceDt = getNodeInfo(flowData, 'DATASOURCE');
  const groupDt = getNodeInfo(flowData, 'GROUP');
  const aggregateDt = getNodeInfo(flowData, 'AGGREGATE');
  const sourceDtList = _.get(sourceDt, 'nodeConfig.config.sourceTables') || [];
  let list = [];
  (_.get(groupDt, 'nodeConfig.config.groupFields') || []).map(o => {
    const { fields = [] } = o;
    fields.map((item = {}) => {
      if (_.get(item, 'parentFieldInfo.controlSetting.controlId')) {
        list.push({
          ..._.get(item, 'parentFieldInfo.controlSetting'),
          isRelative: true,
          isDelete: source ? isDelStatus(item, source) : false,
        });
      }
    });
  });
  (_.get(aggregateDt, 'nodeConfig.config.aggregateFields') || []).map((item = {}) => {
    if (_.get(item, 'parentFieldInfo.controlSetting.controlId')) {
      list.push({
        ..._.get(item, 'parentFieldInfo.controlSetting'),
        isRelative: true,
        isDelete: source ? isDelStatus(item, source) : false,
      });
    }
  });
  return [...sourceDtList, ..._.uniqBy(list, 'dataSource')];
};

//判断当前字段是否已删除
export const isDelStatus = (item, source) => {
  let isDelete = false;
  if (_.get(item, 'parentFieldInfo.controlSetting.controlId') && _.get(item, 'parentFieldInfo.oid')) {
    const dataControls =
      (source.find(it => (_.get(item, 'parentFieldInfo.oid') || '').split('_')[0] === it.sourceId) || {}).controls ||
      [];
    const data = dataControls.find(
      o =>
        o.controlId === _.get(item, 'parentFieldInfo.controlSetting.controlId') &&
        _.get(o, 'advancedSetting.hide') !== '1',
    );
    if (!data || ([29, 34, 35].includes(data.type) && 29 === data.type && !isRuleRelative(data))) {
      isDelete = true;
    }
  }
  if (
    !_.get(item, 'parentFieldInfo.controlSetting.controlId') &&
    !source.find(it => item.oid && item.oid.indexOf(it.sourceId) >= 0)
  ) {
    isDelete = true;
  }
  return isDelete;
};

//更新最新的字段配置到聚合表归组设置
export const setGroupFields = (groupDt, sourceInfos, flowData) => {
  return (_.get(groupDt, 'nodeConfig.config.groupFields') || []).map(o => {
    let fields = o.fields.map((it = {}, i) => {
      let controlSetting = {};
      let parentFieldInfo = it.parentFieldInfo || {};
      if (_.get(parentFieldInfo, 'controlSetting.controlId')) {
        parentFieldInfo.controlSetting =
          (_.get(sourceInfos, `[${i}]controls`) || []).find(
            a =>
              a.controlId === _.get(parentFieldInfo, 'controlSetting.controlId') &&
              _.get(parentFieldInfo, 'controlSetting.dataSource') === a.dataSource,
          ) || _.get(it, 'parentFieldInfo.controlSetting');
        controlSetting = (_.get(parentFieldInfo, 'controlSetting.relationControls') || []).find(
          a => a.controlId === _.get(it, 'controlSetting.controlId'),
        );
      } else {
        controlSetting = (_.get(sourceInfos, `[${i}]controls`) || []).find(
          a => a.controlId === _.get(it, 'controlSetting.controlId'),
        );
      }
      return {
        ...it,
        parentFieldInfo,
        controlSetting: controlSetting || it.controlSetting || {},
      };
    });
    const resultField = o.resultField;
    const result = getResultField(fields, flowData, resultField.aggFuncType);
    return {
      ...o,
      fields: fields,
      resultField: {
        ...result,
        alias: resultField.alias || result.alias,
        aggFuncType: resultField.aggFuncType || result.aggFuncType,
      },
    };
  });
};

//聚合字段配置处理
export const formatAggConfig = (it, isAdd) => {
  const dot = ['COUNT', 'DISTINCT_COUNT'].includes(it.aggFuncType)
    ? undefined
    : isAdd
      ? 2
      : _.get(it, 'controlSetting.advancedSetting.dot') || _.get(it, 'controlSetting.dot');

  const suffix = ['COUNT', 'DISTINCT_COUNT'].includes(it.aggFuncType)
    ? undefined
    : _.get(it, 'controlSetting.advancedSetting.suffix');
  return {
    ...it,
    controlSetting: {
      ..._.get(it, 'controlSetting'),
      dot,
      advancedSetting: {
        ..._.get(it, 'controlSetting.advancedSetting'),
        showtype: '0',
        dot,
        suffix,
      }, //聚合字段showtype：0
      unit:
        isFormulaResultAsTime(it.controlSetting) || // 公式控件计算为时间的
        isFormulaResultAsDateTime(it.controlSetting) || // 公式控件计算为日期时间的
        isFormulaResultAsNumber(it.controlSetting) || //公式计算为数值的
        _.includes(CAN_AS_TIME_DYNAMIC_FIELD, it.controlSetting.type) ||
        ['COUNT', 'DISTINCT_COUNT'].includes(it.aggFuncType)
          ? ''
          : it.controlSetting.unit, //时间类默认把unit都去掉
    },
  };
};

//归组字段配置处理
export const formatGroupConfig = fields => {
  if (fields.length <= 1) {
    return _.get(fields, '[0].controlSetting');
  }
  //符合文本可互相映射的类型
  const isInTxtType =
    [
      API_ENUM_TO_TYPE.TEXTAREA_INPUT_1,
      API_ENUM_TO_TYPE.TEXTAREA_INPUT_2,
      API_ENUM_TO_TYPE.NUMBER_INPUT,
      API_ENUM_TO_TYPE.MONEY_AMOUNT_8,
      API_ENUM_TO_TYPE.NEW_FORMULA_31,
      API_ENUM_TO_TYPE.SCORE,
      API_ENUM_TO_TYPE.EMAIL_INPUT,
      API_ENUM_TO_TYPE.PHONE_NUMBER_3,
      API_ENUM_TO_TYPE.PHONE_NUMBER_4,
      API_ENUM_TO_TYPE.CRED_INPUT,
      API_ENUM_TO_TYPE.CONCATENATE,
      API_ENUM_TO_TYPE.API_SEARCH,
      API_ENUM_TO_TYPE.AUTOID,
    ].includes(_.get(fields, '[0].controlSetting.type')) ||
    isFormulaResultAsNumber(_.get(fields, '[0].controlSetting')) ||
    (isFormulaResultAsSubtotal(_.get(fields, '[0].controlSetting')) &&
      (!!fields.find(o => [API_ENUM_TO_TYPE.TEXTAREA_INPUT_1, API_ENUM_TO_TYPE.TEXTAREA_INPUT_2].includes(o.type)) ||
        _.uniq(fields.map(o => o.type)).length > 1));
  if (isInTxtType) {
    return {
      ..._.get(fields, '[0].controlSetting'),
      type: 2,
    };
  }
  return _.get(fields, '[0].controlSetting');
};

export const setResultFieldSettingByAggFuncType = data => {
  if ([15, 16, 17, 18].includes(_.get(data, 'controlSetting.type'))) {
    const DATE_VALUE = { CUR_YEAR: '5', CUR_MONTH: '4', TODAY: '3', CUR_HOUR: '2', CUR_MINUTE: '1' };
    let datatype = DATE_VALUE[data.aggFuncType];
    if (!_.get(data, 'controlSetting.advancedSetting')) {
      data.controlSetting.advancedSetting = {};
    }
    data.controlSetting.advancedSetting.showtype = datatype;
    data.controlSetting.advancedSetting.showformat = '0';
  }
  if (
    (isFormulaResultAsTime(data.controlSetting) || [46].includes(_.get(data, 'controlSetting.type'))) &&
    data.aggFuncType
  ) {
    // { text: _l('时:分'), value: '8' },
    // { text: _l('时:分:秒'), value: '9' },
    const DATE_VALUE = { CUR_MINUTE: '8' };
    let datatype = DATE_VALUE[data.aggFuncType];
    data.controlSetting.unit = datatype;
    if (!_.get(data, 'controlSetting.advancedSetting')) {
      data.controlSetting.advancedSetting = {};
    }
    data.controlSetting.advancedSetting.showformat = '0';
  }
  return data;
};

export const getSourceIndex = (flowData, o) => {
  let index = -1;
  const sourceList = getAllSourceList(flowData) || [];
  sourceList.find((it, i) => {
    if (
      (o.oid && o.oid.indexOf(it.workSheetId) >= 0) ||
      (_.get(o, 'resultField.oid') && _.get(o, 'resultField.oid').indexOf(it.workSheetId) >= 0) ||
      (_.get(o, 'parentFieldInfo.controlSetting.dataSource') &&
        _.get(o, 'parentFieldInfo.controlSetting.dataSource') === it.dataSource) ||
      (_.get(o, 'resultField.parentFieldInfo.controlSetting.dataSource') &&
        _.get(o, 'resultField.parentFieldInfo.controlSetting.dataSource') === it.dataSource)
    ) {
      index = i;
    }
  });
  return index;
};

//根据版本返回数据源数量上限
export const getSourceMaxCountByVersion = projectId => {
  if (md.global.Config.IsLocal) return 10; //私有部署10个
  const { version = { versionIdV2: '-1' } } = getSyncLicenseInfo(projectId);
  const { versionIdV2 } = version;
  switch (versionIdV2) {
    case '1': //标准版 5 个
      return 5;
    case '2': //专业版 10个
    case '3': //旗舰版 10个
      return 10;
    default:
      return 0;
  }
};

//数据源达到上限提示
export const sourceIsMax = projectId => {
  const project = getSyncLicenseInfo(projectId);
  if (!['2', '3'].includes(_.get(project, 'version.versionIdV2')) && !md.global.Config.IsLocal) {
    buriedUpgradeVersionDialog(projectId, VersionProductType.aggregation);
  } else {
    return alert(_l('数据源已达上限'), 3);
  }
};

export const getLimitControlByRelativeNum = flowData => {
  const groupDt = getNodeInfo(flowData, 'GROUP');
  let num = 0;
  (_.get(groupDt, 'nodeConfig.config.groupFields') || []).map(o => {
    const { fields = [] } = o;
    num =
      num +
      fields.filter(
        it =>
          GROUPLIMITTYPES.includes(_.get(it, 'controlSetting.type')) &&
          _.get(it, 'parentFieldInfo.controlSetting.type') === 29,
      ).length;
  });
  return num;
};
