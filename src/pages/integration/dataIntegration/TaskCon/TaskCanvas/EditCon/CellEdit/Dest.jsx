import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { Input } from 'ming-ui';
import FieldMappingList from 'src/pages/integration/dataIntegration/components/FieldsMappingList';
import { DATABASE_TYPE } from 'src/pages/integration/dataIntegration/constant.js';
import { mdJoinPkData } from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/config.js';
import _ from 'lodash';

export default function DestEdit(props) {
  const { onChangeInfo, list, state, flowData } = props;
  const { srcIsDb } = flowData;
  const { node = {}, matchedTypes = {}, fileList = [], sheetName } = state;
  const preNode = list.filter(o => o.pathIds.length > 0 && o.pathIds[0].toDt.nodeId === node.nodeId)[0];
  const [{ mapData, preFields }, setState] = useSetState({
    mapData: [],
    preFields: [],
  });
  useEffect(() => {
    let isEr = $('.isNoMatchOption').length > 0;
    onChangeInfo({
      isEr,
    });
  }, []);
  useEffect(() => {
    formatData();
  }, [props]);

  const formatData = () => {
    const hsMorePkData = (_.get(preNode, 'nodeConfig.fields') || []).filter(o => o.isPk).length > 1;
    let fields = (_.get(preNode, 'nodeConfig.fields') || []).filter(o => o.isCheck);
    fields = hsMorePkData ? [mdJoinPkData, ...fields] : fields;
    let mapData = getMapData();
    setState({
      preFields: fields,
      mapData,
    });
  };
  const getMapData = () => {
    const { list } = props;
    const { node = {}, isSetDefaultMap } = props.state;
    const preNode = list.filter(o => o.pathIds.length > 0 && o.pathIds[0].toDt.nodeId === node.nodeId)[0];
    const hsMorePkData = (_.get(preNode, 'nodeConfig.fields') || []).filter(o => o.isPk).length > 1;
    let fieldsMapping = _.get(node, ['nodeConfig', 'config', 'fieldsMapping']) || [];
    if (hsMorePkData && !fieldsMapping.find(o => !!o.sourceField.isJoinPk)) {
      //上一节点存在多主键，且映射不存在生成 mdJoinPkData 则补充映射
      fieldsMapping = [{ sourceField: mdJoinPkData, destField: null }, ...fieldsMapping];
    }
    if (isSetDefaultMap) {
      return fieldsMapping;
    }
    let sourceControlIds = [];

    let fields = (_.get(preNode, 'nodeConfig.fields') || []).filter(o => o.isCheck);
    fields = hsMorePkData ? [mdJoinPkData, ...fields] : fields;
    const ids = fields.map(it => it.id);
    fieldsMapping = fieldsMapping.map(o => {
      //isDelete用作目的地映射的源字段删除显示
      sourceControlIds.push(o.sourceField.id);
      if (!ids.includes(_.get(o, 'sourceField.id'))) {
        return {
          ...o,
          sourceField: {
            ...o.sourceField,
            isDelete: true,
          },
        };
      } else {
        return {
          ...o,
          sourceField: {
            ...o.sourceField,
            alias: (fields.find(it => it.id === o.sourceField.id) || {}).alias || o.sourceField.alias,
            isDelete: false,
          },
        };
      }
    });
    fields.map(o => {
      if (!sourceControlIds.includes(o.id)) {
        fieldsMapping.push({ sourceField: o, destField: null });
      }
    });
    return fieldsMapping;
  };
  return (
    <React.Fragment>
      {_.get(node, ['nodeConfig', 'config', 'createTable']) && (
        <React.Fragment>
          <div className="name Bold pBottom12">{_l('新建表名称')}</div>
          <Input
            className="setSheetName"
            placeholder={_l('请输入')}
            value={sheetName}
            onChange={sheetName => {
              onChangeInfo({
                sheetName,
                node: {
                  ...node,
                  nodeConfig: {
                    ..._.get(node, ['nodeConfig']),
                    config: {
                      ..._.get(node, ['nodeConfig', 'config']),
                      tableName: sheetName,
                    },
                  },
                },
              });
            }}
          />
          <div className="mTop45"></div>
        </React.Fragment>
      )}
      <FieldMappingList
        isCreate={_.get(node, ['nodeConfig', 'config', 'createTable'])}
        sourceData={{
          ...preNode,
          sourceFields: preFields,
          isDbType: srcIsDb,
        }}
        destData={{
          destFields: fileList,
          isDbType: _.get(node, ['nodeConfig', 'config', 'dsType']) !== DATABASE_TYPE.APPLICATION_WORKSHEET,
          dsType: _.get(node, ['nodeConfig', 'config', 'dsType']),
          isOurCreateTable: _.get(node, ['nodeConfig', 'config', 'isOurCreateTable']),
        }}
        fieldsMapping={mapData}
        setFieldsMapping={mapping => {
          const data = mapping
            .map(o => {
              if (!_.get(node, ['nodeConfig', 'config', 'createTable'])) {
                return {
                  ...o,
                  destField: {
                    ...o.destField,
                    isCheck: !!_.get(o, 'destField.id'),
                  },
                };
              } else {
                //兼容新建表时，源字段新增，目的地无数据的情况
                return {
                  sourceField: {
                    ...o.sourceField,
                    isCheck: _.get(o, 'sourceField.isCheck') || _.get(o, 'destField.isCheck'),
                  },
                  destField: !o.destField
                    ? o.destField
                    : {
                        ...o.sourceField,
                        ...o.destField,
                        dataType: _.get(o, 'destField.dataType'),
                        oid: null,
                        id: null,
                      },
                };
              }
            })
            .map(o => {
              return {
                ...o,
                destField: !o.destField ? o.destField : { ...o.destField, isPk: !!o.sourceField.isPk },
              };
            });
          onChangeInfo({
            node: {
              ...node,
              nodeConfig: {
                ..._.get(node, ['nodeConfig']),
                config: {
                  ..._.get(node, ['nodeConfig', 'config']),
                  fieldsMapping: data,
                },
              },
            },
          });
        }}
        matchedTypes={matchedTypes}
      />
    </React.Fragment>
  );
}
