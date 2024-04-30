import _ from 'lodash';
import { OPERATION_TYPE_DATA } from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/config.js';

export const getNodeInfo = (flowData, type) => {
  return _.values(_.get(flowData, 'aggTableNodes') || {}).find(o => _.get(o, 'nodeType') === type) || {};
};
export const getConfigControls = (flowData, isGroup) => {
  const groupDt = getNodeInfo(flowData, 'GROUP');
  const aggregateDt = getNodeInfo(flowData, 'AGGREGATE');
  let controlOids = [];
  (_.get(groupDt, 'nodeConfig.config.groupFields') || []).map(o => {
    const { fields = [] } = o;
    fields.map(a => {
      controlOids.push(a.oid);
    });
  });
  if (isGroup) {
    return controlOids;
  }
  // !forAggregation &&
  (_.get(aggregateDt, 'nodeConfig.config.aggregateFields') || []).map(o => {
    if (!o.isCalculateField) {
      controlOids.push(o.oid);
    }
  });
  return controlOids;
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
    list = formatControls((sourceInfos.find(it => it.worksheetId === workSheetId) || {}).controls || []);
    const groupOids = getConfigControls(flowData, true);
    list = list.filter(o =>
      o.controlId === 'rowscount'
        ? !_.includes(controlOids, `${workSheetId}_${o.controlId}`)
        : _.includes(groupOids, `${workSheetId}_${o.controlId}`)
        ? false //归组的字段，聚合不可选
        : _.includes(controlOids, `${workSheetId}_${o.controlId}`)
        ? getAggFuncTypesByOid(aggregateFields, `${workSheetId}_${o.controlId}`).length <
          getDefaultOperationDatas(o.type).length
        : true,
    );
  } else {
    list = formatControls((sourceInfos.find(it => it.worksheetId === workSheetId) || {}).controls || []).filter(
      o => !_.includes(controlOids, `${workSheetId}_${o.controlId}`),
    );
  }
  return list;
};

export const getDefaultOperationDatas = type => {
  return OPERATION_TYPE_DATA.filter(o => {
    // 数值类字段
    if (_.includes([6, 8, 28, 31], type) || (type === 38 && o.enumDefault === 2)) {
      return ['SUM', 'MAX', 'MIN', 'AVG'].includes(o.value);
    } else {
      return ['COUNT', 'DISTINCT_COUNT'].includes(o.value);
    }
  });
};

export const formatControls = controls => {
  // 嵌入,条码,分段,备注,标签页,自由链接,富文本,查询记录,他表字段仅显示,api查询,文本识别
  return controls.filter(
    o =>
      !(
        [45, 47, 22, 10010, 52, 21, 41, 51, 49, 50, 43].includes(o.type) ||
        (o.type === 30 && (o.strDefault || '').split('')[0] === '1')
      ),
  );
};

export const getAggFuncTypes = (aggregateFields, control, worksheetId) => {
  let hs = false;
  let aggFuncType = 'COUNT';
  if (control.controlId === 'rowscount') {
    hs = !!aggregateFields.find(o => o.oid === `${worksheetId}_rowscount`);
  } else {
    const list = getDefaultOperationDatas(control.type);
    const aggFuncTypes = aggregateFields
      .filter(o => o.oid === `${worksheetId}_${control.controlId}`)
      .map(o => o.aggFuncType);
    const others = list.filter(o => !(aggFuncTypes || []).includes(o.value));
    if (others.length <= 0) {
      hs = true;
    } else {
      aggFuncType = others[0].value;
    }
  }

  return { hs, aggFuncType };
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

export const getRuleAlias = (alias, flowData, isRule) => {
  const groupDt = getNodeInfo(flowData, 'GROUP');
  const aggregateDt = getNodeInfo(flowData, 'AGGREGATE');
  const groupFields = _.get(groupDt, 'nodeConfig.config.groupFields') || [];
  const aggregateFields = _.get(aggregateDt, 'nodeConfig.config.aggregateFields') || [];
  const aliasList = [];
  groupFields
    .map(o => {
      aliasList.push(o.resultField.alias);
    })
    .concat(
      aggregateFields.map(o => {
        aliasList.push(o.alias);
      }),
    )
    .filter(o => !!o);
  if (isRule) {
    return !aliasList.find(o => o === alias);
  }
  return !aliasList.find(o => o === alias) ? alias : `${alias}_1`;
};
