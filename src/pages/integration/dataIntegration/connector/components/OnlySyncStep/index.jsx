import React, { useState, useEffect } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Icon, RadioGroup, Input, Tooltip, Checkbox, Dialog, LoadDiv } from 'ming-ui';
import { Select } from 'antd';
import _ from 'lodash';
import {
  CREATE_TYPE_RADIO_LIST,
  CREATE_TYPE,
  DATABASE_TYPE,
  namePattern,
  TRIGGER_WORKFLOW_CHECKBOX_OPTIONS,
} from '../../../constant';
import FieldMappingList from '../../../components/FieldsMappingList/index';
import LeftTableList from './LeftTableList';
import dataSourceApi from '../../../../api/datasource';
import worksheetApi from 'src/api/worksheet';
import SheetGroupSelect from './SheetGroupSelect';
import {
  getInitFieldsMapping,
  getInitWorkSheetFields,
  getDefaultData,
  getDuplicateFieldsRenamedList,
  isNotSupportField,
} from '../../../utils';
import { getIconByType } from 'src/pages/widgetConfig/util';
import SelectTables from '../../../components/SelectTables';

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
  .sheetNameWidth {
    width: 643px;
  }
  .multiplePkTips {
    padding: 10px 16px;
    background: #f7f7f7;
    border-radius: 3px;
    border: 1px solid #eaeaea;
    margin-bottom: 20px;
    width: fit-content;
  }
  .loadSheetWrap {
    display: flex;
    align-items: center;
    width: fit-content;
    margin-top: 20px;
    cursor: pointer;
    color: #2196f3;
    &:hover {
      color: #1565c0;
      i {
        color: #1565c0;
      }
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
  const [loading, setLoading] = useState(true);

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
      const defaultData = getDefaultData(
        initMapping,
        _.get(matchedTypes, [currentTab.db, currentTab.table, 'matchedTypes']),
        isSetDefaultFields,
        destFields,
        isSourceAppType,
        isDestAppType,
        true,
      );
      onChangeStateData(fieldsMapping, setFieldsMapping, { fieldsMapping: defaultData });
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
        const defaultData = getDefaultData(
          initMapping,
          res.matchedTypes,
          isSetDefaultFields,
          destFields,
          isSourceAppType,
          isDestAppType,
          true,
        );
        onChangeStateData(fieldsMapping, setFieldsMapping, { fieldsMapping: defaultData });
        onChangeStateData(matchedTypes, setMatchedTypes, { matchedTypes: res.matchedTypes });
      });
  };

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
    if (isSourceAppType) {
      setLoading(false);
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
          const destFieldsMapping = fieldsMapping[db][table].fieldsMapping.map(mapping => {
            const item = {
              sourceField: { ...mapping.sourceField, alias: mapping.sourceField.name },
              destField: { ...mapping.destField, alias: mapping.destField.name },
            }; //将alias赋值成name提交
            if (isCreate) {
              return isSourceAppType && isDestAppType
                ? {
                    sourceField: _.pick(item.sourceField, [
                      'id',
                      'isTitle',
                      'jdbcTypeId',
                      'isCheck',
                      'oid',
                      'controlSetting',
                    ]),
                    destField: item.destField.isCheck
                      ? _.pick(item.destField, ['name', 'isTitle', 'jdbcTypeId', 'isCheck', 'oid', 'comment'])
                      : null,
                  }
                : {
                    ...item,
                    destField: item.destField.isCheck ? item.destField : null,
                  };
            } else {
              return isDestAppType
                ? {
                    sourceField: isSourceAppType
                      ? _.pick(item.sourceField, ['id', 'isTitle', 'jdbcTypeId', 'isCheck', 'oid', 'isPk'])
                      : item.sourceField,
                    destField: item.destField.isCheck
                      ? isSourceAppType
                        ? _.pick(item.destField, ['id', 'isTitle', 'jdbcTypeId', 'isCheck', 'oid', 'isPk'])
                        : _.pick(item.destField, ['id', 'isTitle', 'jdbcTypeId', 'isPk', 'isNotNull', 'isCheck', 'oid'])
                      : null,
                  }
                : item.destField.isCheck
                ? item
                : { ...item, destField: null };
            }
          });
          const sourceFields = destFieldsMapping.map(item => item.sourceField);
          const destNodeFields = destFieldsMapping.map(item => item.destField).filter(item => item !== null);
          const identifyDuplicateField =
            (_.get(destFields, [db, table, 'fields']) || []).filter(
              item => item.id === _.get(sheetData, [db, table, 'fieldForIdentifyDuplicate']),
            )[0] || {};

          const extraSettingData =
            isDestAppType && _.get(sheetData, [db, table, 'sheetCreateType']) === CREATE_TYPE.SELECT_EXIST
              ? {
                  writeMode: _.get(sheetData, [db, table, 'writeMode']),
                  fieldForIdentifyDuplicate: !_.isEmpty(identifyDuplicateField) ? identifyDuplicateField : undefined,
                  isCleanDestTableData: _.get(sheetData, [db, table, 'isCleanDestTableData']),
                }
              : {};

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
                dbName: source.type === DATABASE_TYPE.KAFKA ? fieldsMapping[db][table].tableName : db,
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
              fields: destNodeFields,
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
                appSectionId: _.get(sheetData, [db, table, 'appSectionId']),
                ...extraSettingData,
              },
            },
            workflowConfig: isDestAppType
              ? {
                  insertTrigger: !!_.get(sheetData, [db, table, 'insertTrigger']),
                  updateTrigger: !!_.get(sheetData, [db, table, 'updateTrigger']),
                  deleteTrigger: !!_.get(sheetData, [db, table, 'deleteTrigger']),
                }
              : undefined,
            tableList: _.get(optionList, [currentTab.db, currentTab.table, 'sheetOptionList']) || [],
            destPkCount: (_.get(destFields, [db, table, 'fields']) || []).filter(item => item.isPk).length,
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
              const fieldsParams = getInitWorkSheetFields(
                res.template.controls,
                false,
                isSourceAppType,
                isDestAppType,
                currentTab.table,
              );
              _.isEmpty(fieldsParams)
                ? onChangeStateData(fieldsMapping, setFieldsMapping, { fieldsMapping: [] })
                : dataSourceApi.fillJdbcType({ worksheetId: currentTab.table, fields: fieldsParams }).then(res => {
                    if (res) {
                      onChangeStateData(sourceFields, setSourceFields, {
                        fields: res,
                        workSheetId: currentTab.table,
                      });
                      setFieldsMappingDefaultData({
                        initMapping: getInitFieldsMapping(res, isSourceAppType, dest.type),
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
          loadTableFields();
        }
      }
    }
  }, [currentTab]);

  const loadTableFields = () => {
    setLoading(true);
    const params = {
      projectId: props.currentProjectId,
      datasourceId: source.id,
      dbName: source.type === DATABASE_TYPE.KAFKA ? currentTab.tableName : currentTab.db,
      schema: currentTab.schema,
      tableName: currentTab.tableName,
      destType: dest.type,
    };

    dataSourceApi
      .getTableFields(params)
      .then(res => {
        if (res) {
          setLoading(false);
          const fields = _.isArray(res) ? res : [];
          onChangeStateData(sourceFields, setSourceFields, { fields });
          setFieldsMappingDefaultData({
            initMapping: getInitFieldsMapping(fields, isSourceAppType, dest.type),
            sourceFields: fields,
            isCreate:
              _.get(sheetData, [currentTab.db, currentTab.table, 'sheetCreateType']) !== CREATE_TYPE.SELECT_EXIST,
          });
        }
      })
      .catch(() => setLoading(false));
  };

  const onSetDefaultSheetData = () => {
    const currentDb = _.get(sheetData, [currentTab.db, currentTab.table, 'dbName']);
    const currentSchema = _.get(sheetData, [currentTab.db, currentTab.table, 'schemaName']);
    const currentSheetName = _.get(sheetData, [currentTab.db, currentTab.table, 'sheetName']);
    const currentSheetCreateType = _.get(sheetData, [currentTab.db, currentTab.table, 'sheetCreateType']);
    let hasSetData = { dbName: null, schemaName: null, schemaOptionList: null, sheetOptionList: null };

    if (!_.isEmpty(sheetData)) {
      for (let dbItem in sheetData) {
        for (let tableItem in sheetData[dbItem]) {
          if (!!sheetData[dbItem][tableItem].dbName) {
            hasSetData = {
              ..._.pick(sheetData[dbItem][tableItem], ['dbName', 'schemaName']),
              ..._.pick(optionList[dbItem][tableItem], ['schemaOptionList', 'sheetOptionList']),
            };
            break;
          }
        }
      }
    }

    if (
      (!currentDb && !!hasSetData.dbName) ||
      (!currentSchema && !!hasSetData.schemaName) ||
      (!currentSheetName && currentSheetCreateType !== CREATE_TYPE.SELECT_EXIST)
    ) {
      onChangeStateData(sheetData, setSheetData, {
        ..._.pick(hasSetData, ['dbName', 'schemaName']),
        sheetName: currentTab.tableName,
      });
      onChangeStateData(optionList, setOptionList, _.pick(hasSetData, ['schemaOptionList', 'sheetOptionList']));
    }
  };

  const onChangeDb = db => {
    const initMapping = getInitFieldsMapping(
      _.get(sourceFields, [currentTab.db, currentTab.table, 'fields']) || [],
      isSourceAppType,
      dest.type,
    );
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
      onChangeStateData(sheetData, setSheetData, { dbName: db.value, sheetNameValue: null });
    }
  };

  const onChangeSchema = schema => {
    const initMapping = getInitFieldsMapping(
      _.get(sourceFields, [currentTab.db, currentTab.table, 'fields']) || [],
      isSourceAppType,
      dest.type,
    );
    setFieldsMappingDefaultData({ initMapping, noFetchSet: true });
    onChangeStateData(sheetData, setSheetData, { schemaName: schema.value });
  };

  const onChangeSheetCreateType = async sheetCreateType => {
    const initSheetData = {};
    const { sheetNameValue, writeNode } = _.get(sheetData, [currentTab.db, currentTab.table]);

    if (sheetCreateType === CREATE_TYPE.NEW) {
      initSheetData.sheetName = currentTab.tableName;
    } else {
      initSheetData.sheetName = sheetNameValue || '';
      initSheetData.appSectionId = null;
      if (!writeNode) {
        initSheetData.writeMode = 'SKIP';
        initSheetData.isCleanDestTableData = false;
      }
      const sheetOptionList = _.get(optionList, [currentTab.db, currentTab.table, 'sheetOptionList']) || [];
      if (sheetNameValue) {
        initSheetData.sheetName = sheetOptionList.filter(item => item.value === sheetNameValue)[0].workSheetName;
      }
    }

    onChangeStateData(sheetData, setSheetData, { sheetCreateType, ...initSheetData });
    const initMapping = getInitFieldsMapping(
      _.get(sourceFields, [currentTab.db, currentTab.table, 'fields']) || [],
      isSourceAppType,
      dest.type,
    );
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
    const initMapping = getInitFieldsMapping(
      _.get(sourceFields, [currentTab.db, currentTab.table, 'fields']) || [],
      isSourceAppType,
      dest.type,
    );
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
          const fieldsParams = getInitWorkSheetFields(
            res.template.controls,
            true,
            isSourceAppType,
            isDestAppType,
            sheet.value,
          );
          dataSourceApi.fillJdbcType({ worksheetId: sheet.value, fields: fieldsParams }).then(res => {
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

  const renderIdentifyDup = () => {
    const destOptions = _.get(destFields, [currentTab.db, currentTab.table, 'fields']) || [];
    const options = destOptions
      .filter(item => _.includes([2, 3, 4, 5, 7, 33], item.mdType)) //可选类型--文本，电话，邮箱，证件，自动编号
      .map(item => {
        return {
          label: (
            <div className="flexRow alignItemsCenter">
              <Icon icon={getIconByType(item.mdType, false)} className="Gray_9e Font18" />
              <span title={item.name} className="mLeft8 overflow_ellipsis Gray">
                {item.name}
              </span>
            </div>
          ),
          value: item.id,
        };
      });

    return (
      <React.Fragment>
        <p className="mTop20 mBottom8 bold">{_l('重复数据')}</p>
        <p className="mBottom12 Gray_9e">{_l('未选择目标字段时, 会根据数据源的主键字段判断重复')}</p>
        <div className="flexRow alignItemsCenter">
          <span className="nowrap">{_l('在同步时，依据目标字段')}</span>
          <div className="Width120 mLeft12 mRight12">
            <Select
              className="selectItem"
              allowClear={true}
              options={options}
              value={_.get(sheetData, [currentTab.db, currentTab.table, 'fieldForIdentifyDuplicate'])}
              onChange={fieldForIdentifyDuplicate =>
                onChangeStateData(sheetData, setSheetData, { fieldForIdentifyDuplicate })
              }
            />
          </div>
          <span className="nowrap">{_l('识别重复，并')}</span>
          <div className="Width70 mLeft12 mRight12">
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
            <Tooltip text={_l('“覆盖”会导致数据同步变慢。')}>
              <Icon icon="info_outline" className="Font16 Gray_bd pointer" />
            </Tooltip>
          )}
        </div>
        <div className="mTop20">
          <Checkbox
            size="small"
            text={_l('在本次同步数据之前，彻底清空目标表数据')}
            checked={_.get(sheetData, [currentTab.db, currentTab.table, 'isCleanDestTableData'])}
            onClick={checked => {
              !checked
                ? Dialog.confirm({
                    title: _l('清空目标表数据'),
                    description: _l('在本次同步任务前，清空目的地表数据，清空后无法恢复。'),
                    buttonType: 'danger',
                    okText: _l('确认'),
                    onOk: () => onChangeStateData(sheetData, setSheetData, { isCleanDestTableData: !checked }),
                  })
                : onChangeStateData(sheetData, setSheetData, { isCleanDestTableData: !checked });
            }}
          />
        </div>
      </React.Fragment>
    );
  };

  const renderPkSet = () => {
    const sourcePkCount = (_.get(sourceFields, [currentTab.db, currentTab.table, 'fields']) || []).filter(
      item => item.isPk,
    ).length;
    //只有（数据源是库且无主键+表到库）可以设置主键
    if (!((!isSourceAppType && sourcePkCount === 0) || (isSourceAppType && !isDestAppType))) {
      return null;
    }
    const sourceOptions = _.get(sourceFields, [currentTab.db, currentTab.table, 'fields']) || [];
    const options = sourceOptions
      .filter(
        item =>
          !isNotSupportField(item, _.get(matchedTypes, [currentTab.db, currentTab.table, 'matchedTypes']) || {}) &&
          (isSourceAppType || ((!!item.isNotNull || source.type === DATABASE_TYPE.KAFKA) && !!item.isCanBePk)),
      )
      .map(item => {
        return {
          label: (
            <div className="flexRow alignItemsCenter">
              <Icon icon={getIconByType(item.mdType, false)} className="Gray_9e Font18" />
              <span title={item.name} className="mLeft8 overflow_ellipsis Gray">
                {item.name}
              </span>
            </div>
          ),
          value: item.id,
        };
      });
    const currentMapping = _.get(fieldsMapping, [currentTab.db, currentTab.table, 'fieldsMapping']) || [];
    const currentPkField = (currentMapping.filter(mapping => mapping.sourceField.isPk)[0] || {}).sourceField || {};
    const currentSheetCreateType = _.get(sheetData, [currentTab.db, currentTab.table, 'sheetCreateType']);

    const onChangePk = id => {
      const newFieldsMapping = currentMapping.map(item => {
        const sourceField = item.sourceField || {};
        const destField = item.destField || {};
        const isPk = sourceField.id === id;

        return {
          sourceField: {
            ...item.sourceField,
            isPk,
            isCheck: isPk,
            isFakePk: isPk,
          },
          destField: {
            ...item.destField,
            isPk,
            isCheck: isPk,
            isFakePk: isPk,
            id: null,
            name: dest.type === DATABASE_TYPE.MONGO_DB && isPk ? '_id' : sourceField.name.replace(namePattern, ''),
            isNotNull: isPk,
          },
        };
      });
      setFieldsMappingDefaultData({
        initMapping: getDuplicateFieldsRenamedList(newFieldsMapping),
        sourceFields: newFieldsMapping.map(item => item.sourceField),
        isCreate: currentSheetCreateType !== CREATE_TYPE.SELECT_EXIST,
        noFetchSet: false,
        isSetDefaultFields:
          currentSheetCreateType === CREATE_TYPE.SELECT_EXIST &&
          !!_.get(destFields, [currentTab.db, currentTab.table, 'fields']),
        destFields: _.get(destFields, [currentTab.db, currentTab.table, 'fields']),
      });
    };

    return (
      <React.Fragment>
        <p className="mBottom16 bold">{_l('设置主键')}</p>
        <div className="flexRow alignItemsCenter mBottom20">
          <span className="nowrap">{_l('在同步时，指定数据源字段')}</span>
          <div className="Width120 mLeft12 mRight12">
            <Select
              className="selectItem"
              options={options}
              value={currentPkField.id}
              notFoundContent={_l('暂无数据')}
              onChange={onChangePk}
            />
          </div>
          <span className="nowrap">{_l('为主键')}</span>
          <Tooltip
            text={
              !isSourceAppType
                ? _l('只可以选非空字段。仅用于数据同步，不会改变数据库字段属性，建议使用索引列。')
                : _l('仅用于数据同步，不会改变数据库字段属性，建议使用索引列。')
            }
          >
            <Icon icon="info_outline" className="Font16 Gray_bd pointer mLeft12" />
          </Tooltip>
        </div>
      </React.Fragment>
    );
  };

  const hasMultiplePks = !!(_.get(sourceFields, [currentTab.db, currentTab.table, 'fields']) || []).filter(
    item => item.fid === 'composite_primary_key',
  ).length;

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
                      <p className="mBottom8 bold">schema</p>
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

                  <div className="flexRow">
                    {isDestAppType &&
                      _.get(sheetData, [currentTab.db, currentTab.table, 'sheetCreateType']) !==
                        CREATE_TYPE.SELECT_EXIST && (
                        <SheetGroupSelect
                          appId={dest.id}
                          value={_.get(sheetData, [currentTab.db, currentTab.table, 'appSectionId'])}
                          onChange={appSectionId => {
                            onChangeStateData(sheetData, setSheetData, { appSectionId });
                          }}
                        />
                      )}
                    <div>
                      <p className="mBottom8 bold">{isDestAppType ? _l('工作表名称') : _l('数据表名称')}</p>
                      <div className="sheetNameWidth">
                        {_.get(sheetData, [currentTab.db, currentTab.table, 'sheetCreateType']) ===
                        CREATE_TYPE.SELECT_EXIST ? (
                          <SelectTables
                            className="selectItem mBottom20"
                            value={_.get(sheetData, [currentTab.db, currentTab.table, 'sheetNameValue'])}
                            options={_.get(optionList, [currentTab.db, currentTab.table, 'sheetOptionList'])}
                            onChangeOptions={sheetOptionList =>
                              onChangeStateData(optionList, setOptionList, { sheetOptionList })
                            }
                            onChangeTable={onChangeSheet}
                            projectId={props.currentProjectId}
                            datasourceId={dest.id}
                            dbName={_.get(sheetData, [currentTab.db, currentTab.table, 'dbName'])}
                            schema={_.get(sheetData, [currentTab.db, currentTab.table, 'schemaName'])}
                            isAppType={isDestAppType}
                            isSameDbObj={
                              !isDestAppType
                                ? source.id === dest.id &&
                                  currentTab.db === _.get(sheetData, [currentTab.db, currentTab.table, 'dbName']) &&
                                  (!destHasSchema ||
                                    currentTab.schema ===
                                      _.get(sheetData, [currentTab.db, currentTab.table, 'schemaName']))
                                : source.id === dest.id
                            }
                            sourceTables={[isDestAppType ? currentTab.table : currentTab.tableName]}
                          />
                        ) : (
                          <Input
                            className="mBottom20 w100"
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
                    </div>
                  </div>

                  <div className="pBottom20 h100 flexColumn">
                    {loading && <LoadDiv className="mTop10" />}

                    {!loading &&
                      (_.get(sheetData, [currentTab.db, currentTab.table, 'sheetCreateType']) !==
                        CREATE_TYPE.SELECT_EXIST ||
                        !!_.get(sheetData, [currentTab.db, currentTab.table, 'sheetNameValue'])) &&
                      _.get(fieldsMapping, [currentTab.db, currentTab.table, 'fieldsMapping']) && (
                        <React.Fragment>
                          {!isSourceAppType && isDestAppType && hasMultiplePks && (
                            <div className="multiplePkTips">
                              {_l(
                                '数据源为多主键表，会新增一个名为composite_primary_key的主键，作为同步到工作表的唯一标识，其值由多个主键值拼接而成。',
                              )}
                            </div>
                          )}
                          {renderPkSet()}
                          <p className="bold">{_l('设置同步字段')}</p>
                          {_.isEmpty(_.get(fieldsMapping, [currentTab.db, currentTab.table, 'fieldsMapping'])) &&
                          source.type !== DATABASE_TYPE.KAFKA ? (
                            <NoDataContent>
                              <div className="TxtCenter">
                                <div className="noContentIcon">
                                  <Icon icon="ic-line" className="Font64" />
                                </div>
                                <p className="Gray_75 Font15 mTop24 mBottom0">{_l('数据源暂无可映射字段')}</p>
                              </div>
                            </NoDataContent>
                          ) : (
                            <React.Fragment>
                              <FieldMappingList
                                isCreate={
                                  _.get(sheetData, [currentTab.db, currentTab.table, 'sheetCreateType']) !==
                                  CREATE_TYPE.SELECT_EXIST
                                }
                                sourceData={{
                                  sourceFields: _.get(sourceFields, [currentTab.db, currentTab.table, 'fields']),
                                  isDbType: !isSourceAppType,
                                  dsType: source.type,
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

                              {source.type === DATABASE_TYPE.KAFKA && (
                                <div className="loadSheetWrap" onClick={() => loadTableFields()}>
                                  <Icon icon="refresh1" className="Font16 mRight8" />
                                  <div>{_l('加载表结构')}</div>
                                </div>
                              )}

                              {isDestAppType &&
                                _.get(sheetData, [currentTab.db, currentTab.table, 'sheetCreateType']) ===
                                  CREATE_TYPE.SELECT_EXIST &&
                                renderIdentifyDup()}

                              {isDestAppType && (
                                <React.Fragment>
                                  <p className="mTop20 mBottom8 bold">{_l('触发工作流')}</p>
                                  <p className="mBottom12 Gray_9e">
                                    {_l('同步数据时，是否触发工作表绑定的自动化工作流')}
                                  </p>
                                  <div className="flexRow">
                                    {TRIGGER_WORKFLOW_CHECKBOX_OPTIONS.map(item => {
                                      const isChecked = _.get(sheetData, [currentTab.db, currentTab.table, item.key]);
                                      return (
                                        <Checkbox
                                          key={item.key}
                                          size="small"
                                          className="pRight30"
                                          checked={isChecked}
                                          onClick={() =>
                                            onChangeStateData(sheetData, setSheetData, { [item.key]: !isChecked })
                                          }
                                        >
                                          {item.text}
                                        </Checkbox>
                                      );
                                    })}
                                  </div>
                                </React.Fragment>
                              )}
                            </React.Fragment>
                          )}
                        </React.Fragment>
                      )}
                  </div>
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
