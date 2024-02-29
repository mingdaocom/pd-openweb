import TaskFlow from 'src/pages/integration/api/taskFlow.js';
import dataSourceApi from 'src/pages/integration/api/datasource.js';
import worksheetApi from 'src/api/worksheet';
import _ from 'lodash';
import { getDefaultData, getInitWorkSheetFields } from '../../utils';
import {
  PERSONNEL_FIELDS,
  DEPT_FIELDS,
  RELATED_RECORD_FIELDS,
  DATABASE_TYPE,
} from 'src/pages/integration/dataIntegration/constant.js';
import { NODE_TYPE_LIST } from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/config.js';

export const formatTaskNodeData = (dataList = [], firstId) => {
  // const firstId = "source1";
  if (dataList.length <= 0) {
    return [];
  }
  let parentIds = [];
  let maxY = 0;
  let list = dataList.map(o => {
    return {
      ..._.omit(o, ['x', 'y']),
      prevIds:
        ['JOIN', 'UNION'].includes(o.nodeType) && (o.prevIds || []).length > 1
          ? [_.get(o, 'nodeConfig.config.leftTableId'), _.get(o, 'nodeConfig.config.rightTableId')]
          : o.prevIds,
    };
  });

  const generateCoordinateX = (currentId, x, y) => {
    const currentItem = list.find(item => item.nodeId === currentId);

    currentItem.x = currentId === firstId ? 0 : x;
    currentItem.y = currentId === firstId ? 0 : y;

    if ((currentItem.prevIds || []).length) {
      parentIds = parentIds.concat(currentItem.prevIds || []);
    }

    currentItem.nextIds.forEach(o => {
      generateCoordinateX(o, currentItem.x + 1, currentItem.y);
    });
  };

  const generateCoordinateParent = (parentIds, newY) => {
    parentIds.forEach(currentId => {
      const currentItem = list.find(item => item.nodeId === currentId);
      if (!currentItem) {
        return;
      }
      const parentNode = list.find(obj => (obj.prevIds || []).indexOf(currentId) > -1);
      if (!newY || (parentNode.prevIds || []).indexOf(currentId) > 0) {
        maxY = maxY + 1;
      }
      currentItem.x = parentNode.x - 1;
      currentItem.y = maxY;
      generateCoordinateParent(currentItem.prevIds || [], maxY);
    });
  };

  // 所有大于0 x轴平移
  const translationX = () => {
    let minX = 0;

    list.forEach(item => {
      if (item.x < minX) {
        minX = item.x;
      }
    });

    minX = Math.abs(minX);

    list.forEach(item => {
      if (item.x !== 0 || item.y !== 0) {
        item.x = item.x + minX;
      }
    });
  };

  // 计算所有行的位置情况
  const calculationAllRowPosition = () => {
    const rowObj = {};
    let allowMergeRow = [];

    list
      .filter(item => item.y > 0)
      .map(item => {
        if (!rowObj[item.y]) {
          rowObj[item.y] = [item.x];
        } else {
          rowObj[item.y].push(item.x);
        }
      });

    Object.keys(rowObj).forEach((key, index) => {
      if (index !== Object.keys(rowObj).length - 1) {
        const mergeArr = rowObj[key].concat(rowObj[Object.keys(rowObj)[index + 1]]);
        if (_.uniq(mergeArr).length === mergeArr.length) {
          allowMergeRow.push(parseInt(key) + 1);
        }
      }
    });

    allowMergeRow
      .sort((a, b) => b - a)
      .forEach(line => {
        list
          .filter(item => item.y >= line)
          .map(item => {
            item.y = item.y - 1;
          });
      });
  };

  generateCoordinateX(firstId);
  generateCoordinateParent(parentIds);
  translationX();
  calculationAllRowPosition();
  return list;
};

//计算pathIds
export const formatDataWithLine = dataList => {
  let list = dataList.map(o => {
    return {
      ...o,
      prevIds:
        ['JOIN', 'UNION'].includes(o.nodeType) && (o.prevIds || []).length > 1
          ? [_.get(o, 'nodeConfig.config.leftTableId'), _.get(o, 'nodeConfig.config.rightTableId')]
          : o.prevIds,
    };
  });
  const l = list.map(o => {
    let pathIds = [];
    if ((o.nextIds || []).length > 0) {
      (o.nextIds || []).map(it => {
        pathIds.push({ fromDt: o, toDt: list.find(a => a.nodeId === it) || {} });
      });
    }
    return {
      ...o,
      pathIds,
    };
  });
  list.map(o => {
    if ((o.prevIds || []).length > 0) {
      (o.prevIds || []).map(it => {
        let index = list.findIndex(a => a.nodeId === it);
        if (index > -1) {
          l[index] = { ...l[index], pathIds: [...(l[index].pathIds || []), { fromDt: l[index], toDt: o }] };
        }
      });
    }
  });
  return l;
};

//预览节点数据
export const getNodeData = (nodeId, list) => {
  if (!nodeId) {
    return [];
  }
  const data = list.filter(o => o.pathIds.length > 0 && o.pathIds[0].toDt.nodeId === node.nodeId);
  const d = data.find(o => o.nodeId === nodeId) || {};
  return d;
};

//通过中间类型转换成筛选组件使用的type
export const formatControls = controls => {
  let templateControls = [];
  templateControls = controls.map(o => {
    switch (o.jdbcTypeId) {
      case 93:
      case 92:
      case 2013:
      case 91:
      case 2014:
        return { ...o, type: 16, controlId: o.alias, controlName: o.alias };
      case 6:
      case 3:
      case 8:
      case -6:
      case 4:
      case 2:
      case -5:
      case -7:
      case 16:
      case 5:
      case 7:
        return { ...o, type: 6, controlId: o.alias, controlName: o.alias };
      default:
        //其他都转成文本类型
        return { ...o, type: 2, controlId: o.alias, controlName: o.alias };
    }
  });
  return templateControls;
};

export const getNodeInfo = async (projectId, flowId, nodeId) => {
  const node = await TaskFlow.getNodeInfo({
    projectId,
    flowId,
    nodeId,
  });
  return node;
};

/**
 * @param {Object} props
 * {Array} props.initMapping 要更新的fieldsMapping
 * {Array} props.sourceFields 源表字段列表
 * {boolean} props.isCreate 目的地表是否新建
 * {boolean} props.matchedTypes 设置默认数据但不需要重新拉取matchedTypes
 * {boolean} props.isSetDefaultFields 是否设置默认选中字段--仅对于选择已有表
 * {Array} props.destFields 目的地表字段列表
 * @returns
 */
export const setFieldsMappingDefaultData = async props => {
  const {
    initMapping,
    sourceFields,
    isCreate,
    matchedTypes,
    isSetDefaultFields,
    destFields,
    dataDestType,
    isSourceAppType,
    isDestAppType,
  } = props;
  if (matchedTypes) {
    return {
      fieldsMapping: getDefaultData(
        initMapping,
        matchedTypes,
        isSetDefaultFields,
        destFields,
        isSourceAppType,
        isDestAppType,
      ),
    };
  }
  //通过接口获取当前源字段对应 目的地字段字段可选的字段类型
  const res = await dataSourceApi.fieldsDataTypeMatch({
    dataDestType,
    sourceFields,
    isCreate,
  });
  return {
    fieldsMapping: getDefaultData(
      initMapping,
      res.matchedTypes,
      isSetDefaultFields,
      destFields,
      isSourceAppType,
      isDestAppType,
    ),
    matchedTypes: res.matchedTypes,
  };
};

//获取当前节点的fields
export const getFields = async ({
  node,
  projectId,
  isGetDest,
  isSourceAppType,
  isDestAppType = true,
  withRowId,
  withSys,
  destType,
}) => {
  let { dsType, workSheetId, tableName, dbName, schema, datasourceId, dataDestId } =
    _.get(node, ['nodeConfig', 'config']) || {};
  if (dsType === DATABASE_TYPE.APPLICATION_WORKSHEET) {
    const res = await worksheetApi.getWorksheetInfo({ worksheetId: workSheetId, getTemplate: true });
    const resFields = isGetDest
      ? _.get(res, 'template.controls') || []
      : (_.get(res, 'template.controls') || []).map(o => {
          return { ...o, alias: o.controlName };
        });
    const fieldsParams = getInitWorkSheetFields(
      resFields,
      isGetDest,
      isSourceAppType,
      isDestAppType,
      workSheetId,
      withRowId,
      withSys,
    );
    if (_.isEmpty(fieldsParams)) {
      return [];
    } else {
      const ress = await dataSourceApi.fillJdbcType({ worksheetId: workSheetId, fields: fieldsParams });
      return ress;
    }
  } else {
    const params = {
      projectId,
      datasourceId: datasourceId || dataDestId,
      dbName,
      schema,
      tableName,
      destType,
    };
    const res = await dataSourceApi.getTableFields(params, { fireImmediately: true });
    return res;
  }
};

export const formatFieldsByType = list => {
  let initWorkSheetFields = [];
  const oidStrList = [...PERSONNEL_FIELDS, ...DEPT_FIELDS, ...RELATED_RECORD_FIELDS].map(o => o.id);
  const isIn = str => {
    let inStr = false;
    oidStrList.map(o => {
      if (str.indexOf(o) >= 0) {
        inStr = true;
      }
    });
    return inStr;
  };
  list.map(control => {
    const commonObj = control;
    if (_.includes([26, 27, 29], control.mdType) && !isIn(control.oid)) {
      const type = control.mdType;
      if (type === 26) {
        //人员字段拆分
        const isExternalUser = _.get(control, 'controlSetting.advancedSetting.usertype') === '2'; // 外部成员
        if (isExternalUser) {
          initWorkSheetFields.push({
            ...commonObj,
            id: `${control.id}_pName`,
            oid: `${control.oid}_pName`,
          });
        } else {
          PERSONNEL_FIELDS.forEach(item => {
            const childField = {
              ...commonObj,
              id: `${control.id}_${item.id}`,
              name: `${control.name} - ${item.name}`,
              alias: `${control.alias || control.name} - ${item.name}`,
              oid: `${control.oid}_${item.id}`,
            };
            initWorkSheetFields.push(childField);
          });
        }
      } else {
        (type === 27 ? DEPT_FIELDS : RELATED_RECORD_FIELDS).forEach(item => {
          //部门和关联记录字段拆分
          const childField = {
            ...commonObj,
            id: `${control.id}_${item.id}`,
            name: `${control.name} - ${item.name}`,
            alias: `${control.alias || control.name} - ${item.name}`,
            oid: `${control.oid}_${item.id}`,
          };
          initWorkSheetFields.push(childField);
        });
      }
    } else {
      initWorkSheetFields.push(commonObj);
    }
  });
  return initWorkSheetFields;
};

export const hsMorePkControl = (preNode, list) => {
  //多源且多主键的情况 或者单个源，且不存在后端拼接的主键的情况下
  const pks = (_.get(preNode, 'nodeConfig.fields') || []).filter(o => o.isPk);
  const sourceNodes = list.filter(o => ['SOURCE_TABLE'].includes(o.nodeType));
  return (
    (pks.length > 1 && sourceNodes.length > 1) ||
    (sourceNodes.length === 1 && pks.length > 1 && !pks.map(o => o.fid).includes('composite_primary_key'))
  );
};

export const getUnionFeids = (defaultFields = [], list, node) => {
  const { leftTableId, rightTableId } = _.get(node, ['nodeConfig', 'config']) || {};
  let leftNode = list.find(o => o.nodeId === leftTableId);
  let rightNode = list.find(o => o.nodeId === rightTableId);
  const leftFields = (_.get(leftNode, 'nodeConfig.fields') || []).filter(o => o.isCheck);
  const rightFields = (_.get(rightNode, 'nodeConfig.fields') || []).filter(o => o.isCheck);
  let othersFields = rightFields;
  const fields = leftFields.map(o => {
    let rightField = rightFields.find(it => it.alias === o.alias && it.jdbcTypeId === o.jdbcTypeId);
    if (!!rightField) {
      othersFields = othersFields.filter(it => it.id !== rightField.id);
    }
    return { leftField: o, rightField: rightField, resultField: o };
  });
  return setAllUnionFieldsCheck([
    ...fields,
    ...othersFields.map(o => {
      return { rightField: o, resultField: o };
    }),
  ]).map(o => {
    return {
      ...o,
      resultField: {
        ...o.resultField,
        isCheck: !!(defaultFields.find(it => it.id === _.get(o, 'resultField.id')) || {}).isCheck,
      },
    };
  });
};

export const setAllUnionFieldsCheck = (fieldList, setCheck) => {
  const fields = setCheck
    ? fieldList.map(it => {
        return {
          ...it,
          resultField: {
            ...it.resultField,
            isCheck: true,
          },
        };
      })
    : fieldList;
  return fields.map(o => {
    let data = fields.filter(it => _.get(it, 'resultField.alias') === _.get(o, 'resultField.alias'));
    //同名只能勾选一个
    if (data.length > 1 && _.get(o, 'resultField.id') !== _.get(data[0], 'resultField.id')) {
      return { ...o, resultField: { ...o.resultField, isCheck: false } };
    } else {
      return o;
    }
  });
};

export const setFeildAlias = fields => {
  let newFeilds = [];
  let result = _.groupBy(fields, 'alias');
  _.forEach(result, (a, k) => {
    if (a.length > 1) {
      a.map((it, i) => {
        newFeilds = newFeilds.concat({ ...it, alias: `${it.alias}${i > 0 ? i : ''}` });
      });
    } else {
      newFeilds = newFeilds.concat(a);
    }
  });
  return newFeilds;
};

export const getNodeName = (flowData, nodeData) => {
  const defaultInfo = NODE_TYPE_LIST.find(it => it.nodeType === nodeData.nodeType);
  const sourceName = (
    (flowData.datasources || []).find(o =>
      [
        _.get(nodeData, 'nodeConfig.config.datasourceId'),
        _.get(nodeData, 'nodeConfig.config.dataSourceId'),
        _.get(nodeData, 'nodeConfig.config.dataDestId'),
      ].includes(o.id),
    ) || {}
  ).name;
  return (
    (['DEST_TABLE', 'SOURCE_TABLE'].includes(nodeData.nodeType)
      ? _.get(nodeData, 'nodeConfig.config.dsType') === DATABASE_TYPE.APPLICATION_WORKSHEET
        ? _l('应用工作表')
        : sourceName || nodeData.name
      : nodeData.name) || defaultInfo.name
  );
};
