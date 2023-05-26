import TaskFlow from 'src/pages/integration/api/taskFlow.js';
import dataSourceApi from 'src/pages/integration/api/datasource.js';
import worksheetApi from 'src/api/worksheet';
import { enumWidgetType } from 'src/pages/widgetConfig/util';
import { DEFAULT_DATA } from 'src/pages/widgetConfig/config/widget.js';
import {
  INVALID_MD_TYPE_SHEET,
  INVALID_MD_TYPE,
  SYSTEM_FIELD_IDS,
  namePattern,
  isValidName,
  DATABASE_TYPE,
} from 'src/pages/integration/dataIntegration/constant.js';
import _ from 'lodash';

export const formatTaskNodeData = (list = [], firstId) => {
  // const firstId = "source1";
  if (list.length <= 0) {
    return [];
  }
  let parentIds = [];
  let maxY = 0;

  const generateCoordinateX = (currentId, x, y) => {
    const currentItem = list.find(item => item.nodeId === currentId);

    currentItem.x = currentId === firstId ? 0 : x;
    currentItem.y = currentId === firstId ? 0 : y;

    if (currentItem.prevIds.length) {
      parentIds = parentIds.concat(currentItem.prevIds);
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
      const parentNode = list.find(obj => obj.prevIds.indexOf(currentId) > -1);
      if (!newY || parentNode.prevIds.indexOf(currentId) > 0) {
        maxY = maxY + 1;
      }
      // console.log(currentItem, parentNode);
      currentItem.x = parentNode.x - 1;
      currentItem.y = maxY;

      generateCoordinateParent(currentItem.prevIds, maxY);
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
export const formatDataWithLine = list => {
  // console.log(list);
  const l = list.map(o => {
    let pathIds = [];
    if (o.nextIds.length > 0) {
      o.nextIds.map(it => {
        pathIds.push({ fromDt: o, toDt: list.find(a => a.nodeId === it) });
      });
    }
    return {
      ...o,
      pathIds,
    };
  });
  list.map(o => {
    if (o.prevIds.length > 0) {
      o.prevIds.map(it => {
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
        return { ...o, type: 16, controlId: o.id, controlName: o.name };
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
        return { ...o, type: 6, controlId: o.id, controlName: o.name };
      default:
        //其他都转成文本类型
        return { ...o, type: 2, controlId: o.id, controlName: o.name };
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

export const getInitWorkSheetFields = (controls, isGetSource, isSourceAppType, isDestAppType) => {
  const rowIDField = controls
    .filter(c => c.controlId === 'rowid')
    .map(rowId => {
      return {
        id: rowId.controlId,
        name: 'rowID',
        alias: 'rowID',
        dataType: null,
        jdbcTypeId: null,
        precision: 0,
        scale: 0,
        isPk: true,
        isNotNull: true,
        isCheck: true,
        status: 'NORMAL',
        mdType: rowId.type,
        isTitle: false,
        orderNo: null,
        controlSetting: { advancedSetting: rowId.advancedSetting, enumDefault: rowId.enumDefault, dot: rowId.dot },
      };
    });

  const fields = controls
    .filter(
      control =>
        ((isGetSource && !_.includes(isDestAppType ? INVALID_MD_TYPE_SHEET : INVALID_MD_TYPE, control.type)) ||
          !isGetSource) &&
        !_.includes(SYSTEM_FIELD_IDS, control.controlId),
    )
    .map(control => {
      return {
        id: control.controlId,
        name: control.controlName,
        alias: control.alias || control.controlName,
        dataType: null,
        jdbcTypeId: null,
        precision: 0,
        scale: 0,
        isPk: false,
        isNotNull: control.required,
        isCheck: false,
        status: 'NORMAL',
        mdType: control.type,
        isTitle: false,
        orderNo: null,
        controlSetting: {
          advancedSetting: control.advancedSetting,
          enumDefault: control.enumDefault,
          dot: control.dot,
        },
      };
    });

  return isSourceAppType && !isDestAppType ? rowIDField.concat(fields) : fields;
};
export const getInitFieldsMapping = (sourceFields, isSourceAppType, isDestAppType) => {
  let pkFieldMapping = {};
  const needReplace = !isSourceAppType || !isDestAppType;
  const mapping = sourceFields.map(item => {
    return {
      sourceField: item,
      destField: {
        dependFieldIds: [item.id],
        isCheck: !!item.isPk,
        isNotNull: item.isPk,
        isPk: item.isPk,
        name: needReplace
          ? item.alias.replace(namePattern, '') || item.name.replace(namePattern, '')
          : item.alias || item.name,
        alias: needReplace
          ? item.alias.replace(namePattern, '') || item.name.replace(namePattern, '')
          : item.alias || item.name,

        dataType: null,
        jdbcTypeId: null,
        precision: null,
        scale: null,
        mdType: null, //仅用于工作表
        controlSetting: null, //仅用于工作表

        id: null,
        status: 'NORMAL',
        orderNo: null,
        isTitle: false, //仅用于工作表
      },
    };
  });
  if (!(isSourceAppType && isDestAppType)) {
    mapping.forEach((item, index) => {
      if (item.sourceField.isPk) {
        pkFieldMapping = item;
        mapping.splice(index, 1);
        return;
      }
    });
    mapping.unshift(pkFieldMapping);
  }
  return getDuplicateFieldsRenamedList(mapping.filter(o => !!o.sourceField));
};
export const getDuplicateFieldsRenamedList = list => {
  const tempObj = {};
  list.forEach(item => {
    const fieldName = item.destField.name;
    tempObj[fieldName] = !tempObj[fieldName] ? 1 : tempObj[fieldName] + 1;
    if (tempObj[fieldName] > 1) {
      item.destField.name = item.destField.alias = fieldName + Math.floor(Math.random() * 10000);
    }
  });
  return list;
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
      fieldsMapping: setDefaultData(
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
    fieldsMapping: setDefaultData(
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
export const getMatchedFieldsOptions = (types, sourceField, destFields, isSourceAppType, isDestAppType) => {
  const matchedTypeIds = _.uniq(types[sourceField.id].map(type => type.dataType));
  const matchedMdTypeIds = _.uniq(types[sourceField.id].map(type => type.mdType));

  const matchedFieldsOptions = isDestAppType
    ? destFields.filter(
        o => (isSourceAppType ? !!o.isPk === !!sourceField.isPk : true) && _.includes(matchedMdTypeIds, o.mdType),
      )
    : destFields.filter(o => !!o.isPk === !!sourceField.isPk && _.includes(matchedTypeIds, o.jdbcTypeId));
  return matchedFieldsOptions;
};
export const setDefaultData = (mapping, types, isSetDefaultFields, destFields, isSourceAppType, isDestAppType) => {
  let hasSetFields = {};
  const newFieldsMapping = (mapping || []).map(item => {
    const isValidField = isValidName(item.sourceField.name) || isSourceAppType;
    //设置默认选中字段--仅对于选择已有表情况
    if (isSetDefaultFields) {
      const matchedFields = getMatchedFieldsOptions(
        types,
        item.sourceField,
        destFields,
        isSourceAppType,
        isDestAppType,
      );
      const sameNameFields = matchedFields.filter(f => f.name === item.sourceField.name);
      if (!item.destField.id && sameNameFields.length > 0 && !hasSetFields[sameNameFields[0].name]) {
        hasSetFields[sameNameFields[0].name] = 1;
        return {
          sourceField: { ...item.sourceField, isCheck: !!isValidField },
          destField: isValidField
            ? {
                ...item.destField,
                isCheck: true,
                isNotNull: sameNameFields[0].isNotNull,
                id: sameNameFields[0].id,
                name: sameNameFields[0].name,
                alias: sameNameFields[0].alias,
                dataType: sameNameFields[0].dataType,
                jdbcTypeId: sameNameFields[0].jdbcTypeId,
                precision: sameNameFields[0].precision,
                scale: sameNameFields[0].scale,
                mdType: sameNameFields[0].mdType,
                controlSetting: sameNameFields[0].controlSetting,
              }
            : item.destField,
        };
      }
    }
    const itemOptions = types[item.sourceField.id];
    if (itemOptions.length === 0) {
      return item;
    }
    const initOption = itemOptions.filter(o =>
      isDestAppType ? o.mdType === item.sourceField.mdType : o.typeName.toLowerCase() === item.sourceField.dataType,
    )[0];

    const ENUM_TYPE = enumWidgetType[itemOptions[0].mdType];
    const settingData =
      ENUM_TYPE === 'DATE_TIME'
        ? { type: itemOptions[0].mdType, advancedSetting: { showtype: '6' } }
        : {
            type: itemOptions[0].mdType,
            ..._.omit(DEFAULT_DATA[ENUM_TYPE], ['controlName']),
          };

    return {
      sourceField: { ...item.sourceField, disabled: !isValidField },
      destField: {
        ...item.destField,
        dataType: (initOption || itemOptions[0]).typeName.toLowerCase(),
        jdbcTypeId: (initOption || itemOptions[0]).dataType,
        precision: (initOption || itemOptions[0]).maxLength,
        scale: (initOption || itemOptions[0]).defaultScale,
        //工作表
        mdType: (initOption || itemOptions[0]).mdType,
        controlSetting: isDestAppType ? _.pick(settingData, ['advancedSetting', 'enumDefault', 'type', 'dot']) : null,
      },
    };
  });

  return newFieldsMapping;
};

//获取当前节点的fields
export const getFields = async (preNode, nextNode, projectId, isGetPreFields) => {
  let { dsType, workSheetId, tableName, dbName, schema, datasourceId, dataDestId } =
    _.get(isGetPreFields ? preNode : nextNode, ['nodeConfig', 'config']) || {};
  if (dsType === DATABASE_TYPE.APPLICATION_WORKSHEET) {
    const res = await worksheetApi.getWorksheetInfo({ worksheetId: workSheetId, getTemplate: true });
    const fieldsParams = getInitWorkSheetFields(
      res.template.controls,
      false,
      _.get(preNode, 'nodeConfig.config.dsType') === DATABASE_TYPE.APPLICATION_WORKSHEET,
      _.get(nextNode, 'nodeConfig.config.dsType') === DATABASE_TYPE.APPLICATION_WORKSHEET,
    );
    if (_.isEmpty(fieldsParams)) {
      return [];
    } else {
      const ress = await dataSourceApi.fillJdbcType(fieldsParams);
      return ress;
    }
  } else {
    const params = {
      projectId,
      datasourceId: datasourceId || dataDestId,
      dbName,
      schema,
      tableName,
    };
    const res = await dataSourceApi.getTableFields(params);
    return res;
  }
};
