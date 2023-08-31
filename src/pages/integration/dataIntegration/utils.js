import { enumWidgetType } from 'src/pages/widgetConfig/util';
import { DEFAULT_DATA } from 'src/pages/widgetConfig/config/widget.js';
import {
  namePattern,
  isValidName,
  PERSONNEL_FIELDS,
  DEPT_FIELDS,
  SYSTEM_FIELD_IDS,
  RELATED_RECORD_FIELDS,
} from 'src/pages/integration/dataIntegration/constant.js';
import _ from 'lodash';

export const getInitFieldsMapping = (sourceFields, isSourceAppType, isDestAppType) => {
  const needReplace = !isSourceAppType || !isDestAppType;
  const isExistJoinPk = !!(sourceFields || []).filter(item => item.isJoinPk).length;
  const mapping = sourceFields.map(item => {
    return {
      sourceField: item,
      destField: {
        dependFieldIds: [item.id],
        isCheck: item.isPk,
        //存在多表连接主键，joinPK不允许为null, 其余主键必须允许为null;
        //不存在多表连接，主键不允许为null
        isNotNull: isExistJoinPk ? item.isJoinPk : item.isPk,
        isPk: item.isPk,
        isJoinPk: item.isJoinPk,
        name:
          isSourceAppType && isDestAppType && item.isJoinPk
            ? 'rowid'
            : needReplace
            ? item.alias.replace(namePattern, '') || item.name.replace(namePattern, '')
            : item.alias || item.name,
        alias: item.isJoinPk
          ? 'rowid'
          : needReplace
          ? item.alias.replace(namePattern, '') || item.name.replace(namePattern, '')
          : item.alias || item.name,
        dataType: null,
        jdbcTypeId: null,
        precision: null,
        scale: null,
        mdType: item.isJoinPk ? item.mdType : null, //仅用于工作表
        controlSetting: null, //仅用于工作表

        id: null,
        status: 'NORMAL',
        orderNo: null,
        isTitle: false, //仅用于工作表
      },
    };
  });
  return getDuplicateFieldsRenamedList(mapping);
};

export const getDuplicateFieldsRenamedList = list => {
  const tempObj = {};
  list.forEach(item => {
    const fieldName = _.get(item, 'destField.name');
    tempObj[fieldName] = !tempObj[fieldName] ? 1 : tempObj[fieldName] + 1;
    if (tempObj[fieldName] > 1) {
      item.destField.name = item.destField.alias = fieldName + Math.floor(Math.random() * 10000);
    }
  });
  return list;
};

export const getInitWorkSheetFields = (
  controls,
  isGetDest,
  isSourceAppType,
  isDestAppType,
  workSheetId,
  withRowId,
  withSys,
) => {
  let initWorkSheetFields = [];
  const rowIDField = controls
    .filter(c => c.controlId === 'rowid')
    .map(rowId => {
      return {
        id: 'rowid',
        oid: workSheetId + '_rowid',
        name: 'rowid',
        alias: 'rowid',
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

  controls
    .filter(c =>
      //目的地表或表到表情况，过滤系统字段
      isGetDest || (isSourceAppType && isDestAppType && !withSys)
        ? !_.includes(SYSTEM_FIELD_IDS, c.controlId)
        : c.controlId !== 'rowid',
    )
    .forEach(control => {
      const commonObj = {
        id: control.controlId,
        oid: `${workSheetId}_${control.controlId}`,
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
          strDefault: control.strDefault,
          sourceControlType: control.sourceControlType,
        },
      };
      if (!isDestAppType && _.includes([26, 27, 29], control.type)) {
        if (control.type === 26) {
          //人员字段拆分
          const isExternalUser = control.advancedSetting.usertype === '2'; // 外部成员
          if (isExternalUser) {
            initWorkSheetFields.push({
              ...commonObj,
              id: `${control.controlId}_pName`,
              oid: `${workSheetId}_${control.controlId}_pName`,
            });
          } else {
            PERSONNEL_FIELDS.forEach(item => {
              const childField = {
                ...commonObj,
                id: `${control.controlId}_${item.id}`,
                oid: `${workSheetId}_${control.controlId}_${item.id}`,
                name: `${control.controlName}_${item.name}`,
                alias: `${control.alias || control.controlName}_${item.name}`,
              };
              initWorkSheetFields.push(childField);
            });
          }
        } else {
          (control.type === 27 ? DEPT_FIELDS : RELATED_RECORD_FIELDS).forEach(item => {
            //部门和关联记录字段拆分
            const childField = {
              ...commonObj,
              id: `${control.controlId}_${item.id}`,
              oid: `${workSheetId}_${control.controlId}_${item.id}`,
              name: `${control.controlName}_${item.name}`,
              alias: `${control.alias || control.controlName}_${item.name}`,
            };
            initWorkSheetFields.push(childField);
          });
        }
      } else {
        initWorkSheetFields.push(commonObj);
      }
    });

  return isSourceAppType || withRowId ? rowIDField.concat(initWorkSheetFields) : initWorkSheetFields;
};

export const getMatchedFieldsOptions = (types, sourceField, destFields, isSourceAppType, isDestAppType) => {
  const matchedTypeIds = _.uniq(types[sourceField.id] || []).map(type => type.dataType);
  const matchedMdTypeIds = _.uniq(types[sourceField.id] || []).map(type => type.mdType);

  const matchedFieldsOptions = isDestAppType
    ? destFields.filter(
        o => (isSourceAppType ? !!o.isPk === !!sourceField.isPk : true) && _.includes(matchedMdTypeIds, o.mdType),
      )
    : destFields.filter(o => !!o.isPk === !!sourceField.isPk && _.includes(matchedTypeIds, o.jdbcTypeId));
  return matchedFieldsOptions;
};

export const getDefaultData = (mapping, types, isSetDefaultFields, destFields, isSourceAppType, isDestAppType) => {
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
          sourceField: { ...item.sourceField, isCheck: isValidField },
          destField: isValidField
            ? {
                ...item.destField,
                isCheck: true,
                isNotNull: sameNameFields[0].isNotNull,
                id: sameNameFields[0].id,
                oid: sameNameFields[0].oid,
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
    const itemOptions = types[item.sourceField.id] || [];
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
        mdType: item.destField.isJoinPk ? 2 : (initOption || itemOptions[0]).mdType,
        controlSetting: isDestAppType ? _.pick(settingData, ['advancedSetting', 'enumDefault', 'type', 'dot']) : null,
      },
    };
  });

  return newFieldsMapping;
};
