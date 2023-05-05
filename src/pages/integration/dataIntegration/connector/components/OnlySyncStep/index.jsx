import React, { useState, useEffect } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Icon, RadioGroup, Input } from 'ming-ui';
import { Select } from 'antd';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import {
  CREATE_TYPE_RADIO_LIST,
  CREATE_TYPE,
  DATABASE_TYPE,
  INVALID_MD_TYPE,
  INVALID_MD_TYPE_SHEET,
  SYSTEM_FIELD_IDS,
  namePattern,
} from '../../../constant';
import FieldMappingList from '../../../components/FieldsMappingList/index';
import LeftTableList from './LeftTableList';
import homeAppApi from 'src/api/homeApp';
import dataSourceApi from '../../../../api/datasource';
import worksheetApi from 'src/api/worksheet';
import { enumWidgetType } from 'src/pages/widgetConfig/util';
import { DEFAULT_DATA } from 'src/pages/widgetConfig/config/widget.js';

const OnlySyncWrapper = styled.div`
  padding: 16px 24px;
  width: 100%;
  height: calc(100% - 32px);

  .middleArrow {
    display: flex;
    justify-content: center;
    transform: rotate(-90deg);
    width: 64px;
    height: 56px;
    color: #2196f3;
  }
  .dbItem {
    display: flex;
    justify-content: space-between;
    width: 643px;
    .itemInput {
      width: 300px;
    }
  }
  .sheetName {
    display: flex;
    justify-content: space-between;
    position: relative;

    .sheetNameWidth {
      width: 643px;
    }
    .writeModeTip {
      position: absolute;
      right: 0;
      top: 44px;
      padding: 8px 16px;
      background: rgba(254, 249, 233, 1);
    }
  }
`;

const NoDataContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 200px;
  margin-top: 24px;
  border: 2px solid #f2f2f2;
  border-radius: 5px;

  .noContentIcon {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 130px;
    height: 130px;
    background: #f5f5f5;
    border-radius: 50%;
    color: #9e9e9e;
  }
`;

export default function OnlySyncStep(props) {
  const { onClose, source, dest, setSubmitData } = props;
  const [currentTab, setCurrentTab] = useState({});
  const [optionList, setOptionList] = useSetState({ dbOptionList: [], sheetOptionList: [] });
  const [sheetData, setSheetData] = useSetState({});
  const [sourceFields, setSourceFields] = useSetState({});
  const [destFields, setDestFields] = useSetState({});
  const [fieldsMapping, setFieldsMapping] = useSetState({});
  const [matchedTypes, setMatchedTypes] = useSetState({});

  const isSourceAppType = source.type === DATABASE_TYPE.APPLICATION_WORKSHEET;
  const isDestAppType = dest.type === DATABASE_TYPE.APPLICATION_WORKSHEET;
  const destHasSchema = dest.hasSchema;

  const onChangeStateData = (state, setState, options) => {
    setState({
      [currentTab.db]: Object.assign({}, _.get(state, [currentTab.db]), {
        [currentTab.table]: Object.assign(
          { tableName: currentTab.tableName, schema: currentTab.schema },
          _.get(state, [currentTab.db, currentTab.table]),
          options,
        ),
      }),
    });
  };

  const getDuplicateFieldsRenamedList = list => {
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

  const getInitFieldsMapping = sourceFields => {
    let pkFieldMapping = {};
    const mapping = sourceFields.map(item => {
      return {
        sourceField: item,
        destField: {
          dependFieldIds: [item.id],
          isCheck: item.isPk,
          isNotNull: item.isPk,
          isPk: item.isPk,
          name: item.alias.replace(namePattern, '') || item.name.replace(namePattern, ''),
          alias: item.alias.replace(namePattern, '') || item.name.replace(namePattern, ''),

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
    return getDuplicateFieldsRenamedList(mapping);
  };

  const getInitWorkSheetFields = (controls, isGetSource) => {
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

  const getMatchedFieldsOptions = (types, sourceField, destFields) => {
    const matchedTypeIds = _.uniq(types[sourceField.id].map(type => type.dataType));
    const matchedMdTypeIds = _.uniq(types[sourceField.id].map(type => type.mdType));

    const matchedFieldsOptions = isDestAppType
      ? destFields.filter(
          o => (isSourceAppType ? !!o.isPk === !!sourceField.isPk : true) && _.includes(matchedMdTypeIds, o.mdType),
        )
      : destFields.filter(o => !!o.isPk === !!sourceField.isPk && _.includes(matchedTypeIds, o.jdbcTypeId));
    return matchedFieldsOptions;
  };

  const setDefaultData = (mapping, types, isSetDefaultFields, destFields) => {
    let hasSetFields = {};
    const newFieldsMapping = (mapping || []).map(item => {
      //设置默认选中字段--仅对于选择已有表情况
      if (isSetDefaultFields) {
        const matchedFields = getMatchedFieldsOptions(types, item.sourceField, destFields);
        const sameNameFields = matchedFields.filter(f => f.name === item.sourceField.name);
        if (!item.destField.id && sameNameFields.length > 0 && !hasSetFields[sameNameFields[0].name]) {
          hasSetFields[sameNameFields[0].name] = 1;
          return {
            sourceField: { ...item.sourceField, isCheck: true },
            destField: {
              ...item.destField,
              isCheck: true,
              id: sameNameFields[0].id,
              name: sameNameFields[0].name,
              alias: sameNameFields[0].alias,
              dataType: sameNameFields[0].dataType,
              jdbcTypeId: sameNameFields[0].jdbcTypeId,
              precision: sameNameFields[0].precision,
              scale: sameNameFields[0].scale,
              mdType: sameNameFields[0].mdType,
              controlSetting: sameNameFields[0].controlSetting,
            },
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
        ...item,
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

    onChangeStateData(fieldsMapping, setFieldsMapping, { fieldsMapping: newFieldsMapping });
  };

  /**
   * @param {Object} props
   * {Array} props.initMapping 要更新的fieldsMapping
   * {Array} props.sourceFields 源表字段列表
   * {boolean} props.isCreate 目的地表是否新建
   * {boolean} props.noFetchSet 设置默认数据但不需要重新拉取matchedTypes
   * {boolean} props.isSetDefaultFields 是否设置默认选中字段--仅对于选择已有表
   * {Array} props.destFields 目的地表字段列表
   * @returns
   */
  const setFieldsMappingDefaultData = props => {
    const { initMapping, sourceFields, isCreate, noFetchSet, isSetDefaultFields, destFields } = props;
    if (noFetchSet) {
      setDefaultData(
        initMapping,
        _.get(matchedTypes, [currentTab.db, currentTab.table, 'matchedTypes']),
        isSetDefaultFields,
        destFields,
      );
      return;
    }
    //通过接口获取当前源字段对应 目的地字段字段可选的字段类型
    dataSourceApi
      .fieldsDataTypeMatch({
        dataDestType: dest.type,
        sourceFields,
        isCreate,
      })
      .then(res => {
        setDefaultData(initMapping, res.matchedTypes, isSetDefaultFields, destFields);
        onChangeStateData(matchedTypes, setMatchedTypes, { matchedTypes: res.matchedTypes });
      });
  };

  //初始获取源数据库或源工作表
  useEffect(() => {
    if (!isDestAppType) {
      dataSourceApi.getDatabases({ projectId: props.currentProjectId, datasourceId: dest.id }).then(res => {
        if (res) {
          const dbOptionList = res.map(item => {
            return { label: item, value: item };
          });
          setOptionList({ dbOptionList });
        }
      });
    }
  }, []);

  //更新提交数据
  useEffect(() => {
    const submitData = [];
    for (let db in fieldsMapping) {
      for (let table in fieldsMapping[db]) {
        const isCreate = _.get(sheetData, [db, table, 'sheetCreateType']) !== CREATE_TYPE.SELECT_EXIST;

        if (
          !_.isEmpty(fieldsMapping[db][table].fieldsMapping) &&
          ((!isDestAppType && _.get(sheetData, [db, table, 'dbName'])) || isDestAppType)
        ) {
          const destFieldsMapping = fieldsMapping[db][table].fieldsMapping.map(item => {
            if (isCreate) {
              return isSourceAppType && isDestAppType
                ? {
                    sourceField: _.pick(item.sourceField, ['id', 'isTitle', 'jdbcTypeId']),
                    destField: item.destField.isCheck
                      ? _.pick(item.destField, ['name', 'isTitle', 'jdbcTypeId'])
                      : null,
                  }
                : {
                    ...item,
                    destField: item.destField.isCheck
                      ? { ...item.destField, id: item.sourceField.id === 'rowid' ? 'rowid' : uuidv4() }
                      : null,
                  };
            } else {
              return isDestAppType
                ? {
                    sourceField: isSourceAppType
                      ? _.pick(item.sourceField, ['id', 'isTitle', 'jdbcTypeId'])
                      : item.sourceField,
                    destField: item.destField.isCheck
                      ? isSourceAppType
                        ? _.pick(item.destField, ['id', 'isTitle', 'jdbcTypeId'])
                        : _.pick(item.destField, ['id', 'isTitle', 'jdbcTypeId', 'isPk', 'isNotNull'])
                      : null,
                  }
                : item.destField.isCheck
                ? item
                : { ...item, destField: null };
            }
          });
          const sourceFields = destFieldsMapping.map(item => item.sourceField);
          const destFields = destFieldsMapping.map(item => item.destField).filter(item => item !== null);

          const data = {
            projectId: props.currentProjectId,
            owner: md.global.Account.accountId,
            sourceNode: {
              nodeId: '1',
              name: _l('源表节点'),
              nodeType: 'SOURCE_TABLE',
              description: _l('这是一个源表节点'),
              fields: sourceFields,
              config: {
                datasourceId: source.id,
                dbName: db,
                tableName: fieldsMapping[db][table].tableName,
                schema: fieldsMapping[db][table].schema,
                dsType: source.type,
                className: source.className,
                iconBgColor: source.iconBgColor,
                appId: isSourceAppType ? source.id : undefined,
                workSheetId: isSourceAppType ? table : undefined,
                fields: sourceFields,
              },
            },
            destNode: {
              nodeId: '2',
              name: _l('目的地节点'),
              nodeType: 'DEST_TABLE',
              description: _l('这是一个目的地节点'),
              fields: destFields,
              config: {
                dataDestId: dest.id,
                dbName: _.get(sheetData, [db, table, 'dbName']),
                tableName: _.get(sheetData, [db, table, 'sheetName']),
                schema: _.get(sheetData, [db, table, 'schemaName']),
                createTable:
                  _.get(sheetData, [db, table, 'sheetCreateType']) === CREATE_TYPE.SELECT_EXIST ? false : true,
                dsType: dest.type,
                className: dest.className,
                iconBgColor: dest.iconBgColor,
                appId: isDestAppType ? dest.id : undefined,
                workSheetId: isDestAppType ? _.get(sheetData, [db, table, 'sheetNameValue']) : undefined,
                fieldsMapping: destFieldsMapping,
                writeMode:
                  !isSourceAppType &&
                  isDestAppType &&
                  _.get(sheetData, [db, table, 'sheetCreateType']) === CREATE_TYPE.SELECT_EXIST
                    ? _.get(sheetData, [db, table, 'writeMode'])
                    : undefined,
              },
            },
            tableList: _.get(optionList, [currentTab.db, currentTab.table, 'sheetOptionList']) || [],
          };
          submitData.push(data);
        }
      }
    }

    setSubmitData && setSubmitData(submitData);
  }, [fieldsMapping, sheetData, optionList]);

  useEffect(() => {
    if (currentTab.table) {
      //设置初始dbName, schemaName, sheetName
      onSetDefaultSheetData();
      //获取源表字段
      if (!_.get(fieldsMapping, [currentTab.db, currentTab.table, 'fieldsMapping'])) {
        if (isSourceAppType) {
          worksheetApi.getWorksheetInfo({ worksheetId: currentTab.table, getTemplate: true }).then(res => {
            if (res) {
              const fieldsParams = getInitWorkSheetFields(res.template.controls, true);
              _.isEmpty(fieldsParams)
                ? onChangeStateData(fieldsMapping, setFieldsMapping, { fieldsMapping: [] })
                : dataSourceApi.fillJdbcType(fieldsParams).then(res => {
                    if (res) {
                      onChangeStateData(sourceFields, setSourceFields, {
                        fields: res,
                        workSheetId: currentTab.table,
                      });
                      setFieldsMappingDefaultData({
                        initMapping: getInitFieldsMapping(res),
                        sourceFields: res,
                        isCreate:
                          _.get(sheetData, [currentTab.db, currentTab.table, 'sheetCreateType']) !==
                          CREATE_TYPE.SELECT_EXIST,
                      });
                    }
                  });
            }
          });
        } else {
          const params = {
            projectId: props.currentProjectId,
            datasourceId: source.id,
            dbName: currentTab.db,
            schema: currentTab.schema,
            tableName: currentTab.tableName,
          };

          dataSourceApi.getTableFields(params).then(res => {
            if (res) {
              onChangeStateData(sourceFields, setSourceFields, { fields: res });
              setFieldsMappingDefaultData({
                initMapping: getInitFieldsMapping(res),
                sourceFields: res,
                isCreate:
                  _.get(sheetData, [currentTab.db, currentTab.table, 'sheetCreateType']) !== CREATE_TYPE.SELECT_EXIST,
              });
            }
          });
        }
      }
    }
  }, [currentTab]);

  const onSetDefaultSheetData = () => {
    const currentDb = _.get(sheetData, [currentTab.db, currentTab.table, 'dbName']);
    const currentSchema = _.get(sheetData, [currentTab.db, currentTab.table, 'schemaName']);
    const currentSheetName = _.get(sheetData, [currentTab.db, currentTab.table, 'sheetName']);
    let hasSetDb;
    let hasSetSchema;

    if (!_.isEmpty(sheetData)) {
      for (let dbItem in sheetData) {
        for (let tableItem in sheetData[dbItem]) {
          if (!!sheetData[dbItem][tableItem].dbName) {
            hasSetDb = sheetData[dbItem][tableItem].dbName;
            hasSetSchema = sheetData[dbItem][tableItem].schemaName;
            break;
          }
        }
      }
    }

    if ((!currentDb && hasSetDb) || (!currentSchema && hasSetSchema) || !currentSheetName) {
      onChangeStateData(sheetData, setSheetData, {
        dbName: hasSetDb,
        schemaName: hasSetSchema,
        sheetName: currentTab.tableName,
      });
    }
  };

  const onChangeDb = db => {
    const initMapping = getInitFieldsMapping(_.get(sourceFields, [currentTab.db, currentTab.table, 'fields']) || []);
    setFieldsMappingDefaultData({ initMapping, noFetchSet: true });

    if (destHasSchema) {
      //获取指定数据库下schema列表
      dataSourceApi
        .getSchemas({ projectId: props.currentProjectId, datasourceId: dest.id, dbName: db.value })
        .then(res => {
          if (res) {
            const schemaOptionList = res.map(item => {
              return { label: item, value: item };
            });
            onChangeStateData(sheetData, setSheetData, { dbName: db.value, schemaName: null, sheetNameValue: null });
            onChangeStateData(optionList, setOptionList, { schemaOptionList });
          }
        });
    } else {
      //获取指定数据库下数据表列表
      dataSourceApi
        .getTables({ projectId: props.currentProjectId, datasourceId: dest.id, dbName: db.value })
        .then(res => {
          if (res) {
            const sheetOptionList = res.map(item => {
              const itemDisabled = source.id === dest.id && currentTab.db === db.value && currentTab.tableName === item;
              return {
                label: itemDisabled ? (
                  <div className="flexRow alignItemsCenter">
                    <span className="Gray_9e">{item}</span>
                    <div data-tip={_l('不可选与数据源相同的表')} className="pointer tip-right mTop2">
                      <Icon icon="info1" className="Gray_bd mLeft24" />
                    </div>
                  </div>
                ) : (
                  item
                ),
                value: item,
                disabled: itemDisabled,
              };
            });
            onChangeStateData(sheetData, setSheetData, { dbName: db.value, sheetNameValue: null });
            onChangeStateData(optionList, setOptionList, { sheetOptionList });
          }
        });
    }
  };

  const onChangeSchema = schema => {
    const initMapping = getInitFieldsMapping(_.get(sourceFields, [currentTab.db, currentTab.table, 'fields']) || []);
    setFieldsMappingDefaultData({ initMapping, noFetchSet: true });

    dataSourceApi
      .getTables({
        projectId: props.currentProjectId,
        datasourceId: dest.id,
        dbName: _.get(sheetData, [currentTab.db, currentTab.table, 'dbName']),
        schema: schema.value,
      })
      .then(res => {
        if (res) {
          const sheetOptionList = res.map(item => {
            return { label: item, value: item };
          });
          onChangeStateData(sheetData, setSheetData, { schemaName: schema.value });
          onChangeStateData(optionList, setOptionList, { sheetOptionList });
        }
      });
  };

  const onChangeSheetCreateType = async sheetCreateType => {
    const initSheetData = {};
    const { sheetNameValue, writeNode } = _.get(sheetData, [currentTab.db, currentTab.table]);

    if (sheetCreateType === CREATE_TYPE.NEW) {
      initSheetData.sheetName = currentTab.tableName;
    } else {
      initSheetData.sheetName = sheetNameValue || '';
      if (!writeNode) {
        initSheetData.writeMode = 'SKIP';
      }
      // 获取下拉列表选项
      if (isDestAppType) {
        await homeAppApi.getWorksheetsByAppId({ appId: dest.id }).then(res => {
          if (res) {
            const sheetOptionList = res
              .filter(o => o.type === 0) //只能是工作表
              .map(item => {
                const itemDisabled = source.id === dest.id && currentTab.table === item.workSheetId;
                return {
                  label: itemDisabled ? (
                    <div className="flexRow alignItemsCenter">
                      <span className="Gray_9e">{item.workSheetName}</span>
                      <div data-tip={_l('不可选与数据源相同的表')} className="pointer tip-right mTop2">
                        <Icon icon="info1" className="Gray_bd mLeft24" />
                      </div>
                    </div>
                  ) : (
                    item.workSheetName
                  ),
                  value: item.workSheetId,
                  disabled: itemDisabled,
                  workSheetName: item.workSheetName,
                };
              });
            if (sheetNameValue) {
              initSheetData.sheetName = sheetOptionList.filter(item => item.value === sheetNameValue)[0].workSheetName;
            }
            onChangeStateData(optionList, setOptionList, { sheetOptionList });
          }
        });
      }
    }

    onChangeStateData(sheetData, setSheetData, { sheetCreateType, ...initSheetData });
    const initMapping = getInitFieldsMapping(_.get(sourceFields, [currentTab.db, currentTab.table, 'fields']) || []);
    !_.isEmpty(initMapping) &&
      setFieldsMappingDefaultData({
        initMapping,
        sourceFields: _.get(sourceFields, [currentTab.db, currentTab.table, 'fields']) || {},
        isCreate: sheetCreateType === CREATE_TYPE.NEW,
        noFetchSet: false,
        isSetDefaultFields:
          sheetCreateType === CREATE_TYPE.SELECT_EXIST &&
          !!_.get(destFields, [currentTab.db, currentTab.table, 'fields']),
        destFields: _.get(destFields, [currentTab.db, currentTab.table, 'fields']),
      });
  };

  const onChangeSheet = sheet => {
    const initMapping = getInitFieldsMapping(_.get(sourceFields, [currentTab.db, currentTab.table, 'fields']) || []);
    if (_.isEmpty(initMapping)) {
      onChangeStateData(sheetData, setSheetData, {
        sheetName: sheet.label,
        sheetNameValue: sheet.value,
      });
      return;
    }

    if (isDestAppType) {
      onChangeStateData(sheetData, setSheetData, {
        sheetName: sheet.label,
        sheetNameValue: sheet.value,
      });
      worksheetApi.getWorksheetInfo({ worksheetId: sheet.value, getTemplate: true }).then(res => {
        if (res) {
          const fieldsParams = getInitWorkSheetFields(res.template.controls, false);
          dataSourceApi.fillJdbcType(fieldsParams).then(res => {
            if (res) {
              onChangeStateData(destFields, setDestFields, { fields: res, workSheetId: sheet.value });
              setFieldsMappingDefaultData({
                initMapping,
                noFetchSet: true,
                isSetDefaultFields: true,
                destFields: res,
              });
            }
          });
        }
      });
    } else {
      const params = {
        projectId: props.currentProjectId,
        datasourceId: dest.id,
        dbName: _.get(sheetData, [currentTab.db, currentTab.table, 'dbName']),
        schema: _.get(sheetData, [currentTab.db, currentTab.table, 'schemaName']),
        tableName: sheet.label,
      };
      dataSourceApi.getTableFields(params).then(res => {
        if (res) {
          const arr = res.filter(item => item.isPk);
          if (arr.length > 0) {
            onChangeStateData(sheetData, setSheetData, {
              sheetName: sheet.label,
              sheetNameValue: sheet.value,
            });
            onChangeStateData(destFields, setDestFields, { fields: res });
            setFieldsMappingDefaultData({
              initMapping,
              noFetchSet: true,
              isSetDefaultFields: true,
              destFields: res,
            });
          } else {
            alert(_l('该表没有主键，无法同步'), 2);
          }
        }
      });
    }
  };

  return (
    <OnlySyncWrapper>
      <div className="tabNav" onClick={onClose}>
        <span>{_l('仅同步数据')}</span>
      </div>

      <div className="flexRow h100">
        <LeftTableList
          {...props}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onDelete={(db, table) => {
            const newSheetData = _.cloneDeep(sheetData);
            const newFieldsMapping = _.clone(fieldsMapping);

            if (newFieldsMapping[db][table]) {
              newFieldsMapping[db][table].fieldsMapping = null;
              newSheetData[db][table].dbName = null;
              newSheetData[db][table].sheetName = null;
              newSheetData[db][table].sheetNameValue = null;
              newSheetData[db][table].sheetCreateType = CREATE_TYPE.NEW;
              setSheetData(newSheetData);
              setFieldsMapping(newFieldsMapping);
            }
          }}
        />

        <div className="middleArrow">
          <Icon icon="arrow_down" className="Font24" />
        </div>

        <div className="flex flexColumn">
          <div className="titleItem mTop16">
            <div className="iconWrapper">
              <svg className="icon svg-icon" aria-hidden="true">
                <use xlinkHref={`#icon${_.get(dest, 'className')}`} />
              </svg>
            </div>
            <span title={dest.sourceName}>{dest.sourceName}</span>
          </div>
          {currentTab.table ? (
            <div className="mTop16 flex flexColumn">
              {!isDestAppType && (
                <div className="dbItem">
                  <div className="itemInput">
                    <p className="mBottom8 bold">{_l('数据库')}</p>
                    <Select
                      className="selectItem mBottom20"
                      showSearch={true}
                      labelInValue={true}
                      placeholder={_l('请选择')}
                      notFoundContent={_l('暂无数据')}
                      value={_.get(sheetData, [currentTab.db, currentTab.table, 'dbName'])}
                      options={optionList.dbOptionList}
                      onChange={db => onChangeDb(db)}
                    />
                  </div>
                  {destHasSchema && (
                    <div className="itemInput">
                      <p className="mBottom8 bold">{_l('Schema')}</p>
                      <Select
                        className="selectItem mBottom20"
                        showSearch={true}
                        labelInValue={true}
                        placeholder={_l('请选择')}
                        notFoundContent={_l('暂无数据')}
                        value={_.get(sheetData, [currentTab.db, currentTab.table, 'schemaName'])}
                        options={_.get(optionList, [currentTab.db, currentTab.table, 'schemaOptionList'])}
                        onChange={schema => onChangeSchema(schema)}
                      />
                    </div>
                  )}
                </div>
              )}

              {(isDestAppType ||
                (!destHasSchema && _.get(sheetData, [currentTab.db, currentTab.table, 'dbName'])) ||
                (destHasSchema && _.get(sheetData, [currentTab.db, currentTab.table, 'schemaName']))) && (
                <div className="flexColumn flex">
                  <p className="mBottom16 bold">{isDestAppType ? _l('工作表') : _l('数据表')}</p>
                  <RadioGroup
                    className="mBottom20"
                    data={CREATE_TYPE_RADIO_LIST}
                    checkedValue={
                      _.get(sheetData, [currentTab.db, currentTab.table, 'sheetCreateType']) || CREATE_TYPE.NEW
                    }
                    onChange={sheetCreateType => onChangeSheetCreateType(sheetCreateType)}
                  />

                  <p className="mBottom8 bold">{isDestAppType ? _l('工作表名称') : _l('数据表名称')}</p>
                  <div className="sheetName">
                    {_.get(sheetData, [currentTab.db, currentTab.table, 'sheetCreateType']) ===
                    CREATE_TYPE.SELECT_EXIST ? (
                      <React.Fragment>
                        <div className="sheetNameWidth">
                          <Select
                            className="selectItem mBottom20"
                            showSearch={true}
                            labelInValue={true}
                            placeholder={_l('请选择')}
                            notFoundContent={_l('暂无数据')}
                            value={_.get(sheetData, [currentTab.db, currentTab.table, 'sheetNameValue'])}
                            options={_.get(optionList, [currentTab.db, currentTab.table, 'sheetOptionList'])}
                            filterOption={(inputValue, option) => {
                              return (isDestAppType ? option.workSheetName : option.value)
                                .toLowerCase()
                                .includes(inputValue.toLowerCase());
                            }}
                            onChange={sheet => onChangeSheet(sheet)}
                          />
                        </div>

                        {!isSourceAppType && isDestAppType && (
                          <div className="mBottom20 flexRow alignItemsCenter">
                            <span className="mLeft5 nowrap">{_l('根据主键识别重复，并')}</span>
                            <div className="Width70 mLeft10">
                              <Select
                                className="selectItem"
                                options={[
                                  { label: _l('跳过'), value: 'SKIP' },
                                  { label: _l('覆盖'), value: 'OVERWRITE' },
                                ]}
                                value={_.get(sheetData, [currentTab.db, currentTab.table, 'writeMode'])}
                                onChange={writeMode => onChangeStateData(sheetData, setSheetData, { writeMode })}
                              />
                            </div>
                            {_.get(sheetData, [currentTab.db, currentTab.table, 'writeMode']) === 'OVERWRITE' && (
                              <div className="writeModeTip">
                                {_l('根据主键判断已有数据的重复，"覆盖"会导致数据变慢。')}
                              </div>
                            )}
                          </div>
                        )}
                      </React.Fragment>
                    ) : (
                      <Input
                        className="mBottom20 sheetNameWidth"
                        value={_.get(sheetData, [currentTab.db, currentTab.table, 'sheetName'])}
                        onBlur={event =>
                          onChangeStateData(sheetData, setSheetData, {
                            sheetName: event.target.value.replace(namePattern, ''),
                          })
                        }
                        onChange={sheetName => onChangeStateData(sheetData, setSheetData, { sheetName })}
                      />
                    )}
                  </div>

                  {(_.get(sheetData, [currentTab.db, currentTab.table, 'sheetCreateType']) !==
                    CREATE_TYPE.SELECT_EXIST ||
                    !!_.get(sheetData, [currentTab.db, currentTab.table, 'sheetNameValue'])) &&
                    _.get(fieldsMapping, [currentTab.db, currentTab.table, 'fieldsMapping']) && (
                      <div className="pBottom20 h100 flexColumn">
                        <p className="bold">{_l('设置同步字段')}</p>
                        {_.isEmpty(fieldsMapping[currentTab.db][currentTab.table].fieldsMapping) ? (
                          <NoDataContent>
                            <div className="TxtCenter">
                              <div className="noContentIcon">
                                <Icon icon="ic-line" className="Font64" />
                              </div>
                              <p className="Gray_75 Font15 mTop24 mBottom0">{_l('数据源暂无可映射字段')}</p>
                            </div>
                          </NoDataContent>
                        ) : (
                          <FieldMappingList
                            isCreate={
                              _.get(sheetData, [currentTab.db, currentTab.table, 'sheetCreateType']) !==
                              CREATE_TYPE.SELECT_EXIST
                            }
                            sourceData={{
                              sourceFields: _.get(sourceFields, [currentTab.db, currentTab.table, 'fields']),
                              isDbType: !isSourceAppType,
                            }}
                            destData={{
                              destFields: _.get(destFields, [currentTab.db, currentTab.table, 'fields']),
                              isDbType: !isDestAppType,
                              dsType: dest.type,
                            }}
                            fieldsMapping={_.get(fieldsMapping, [currentTab.db, currentTab.table, 'fieldsMapping'])}
                            setFieldsMapping={mapping =>
                              onChangeStateData(fieldsMapping, setFieldsMapping, { fieldsMapping: mapping })
                            }
                            matchedTypes={_.get(matchedTypes, [currentTab.db, currentTab.table, 'matchedTypes'])}
                          />
                        )}
                      </div>
                    )}
                </div>
              )}
            </div>
          ) : (
            <NoDataContent>
              <div className="TxtCenter">
                <div className="noContentIcon">
                  <Icon icon="ic-line" className="Font64" />
                </div>
                <p className="Gray_75 Font15 mTop24 mBottom0">{_l('请先从左侧选择数据对象')}</p>
              </div>
            </NoDataContent>
          )}
        </div>
      </div>
    </OnlySyncWrapper>
  );
}
