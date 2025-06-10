import React, { useEffect, createRef } from 'react';
import { useSetState } from 'react-use';
import { Input, LoadDiv } from 'ming-ui';
import FieldMappingList from 'src/pages/integration/dataIntegration/components/FieldsMappingList';
import { DATABASE_TYPE } from 'src/pages/integration/dataIntegration/constant.js';
import { mdUniquePkData } from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/config.js';
import _ from 'lodash';
import { hsMorePkControl } from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/util.js';
import styled from 'styled-components';
const Wrap = styled.div`
  background: #f7f7f7;
  border: 1px solid #eaeaea;
  padding: 10px;
  margin: 10px 0;
`;
export default function DestEdit(props) {
  const inputRef = createRef();
  const { onChangeInfo, list, state, flowData, loading } = props;
  const { srcIsDb } = flowData;
  const { node = {}, matchedTypes = {}, fileList = [], sheetName } = state;
  const preNode = list.filter(o => o.pathIds.length > 0 && o.pathIds[0].toDt.nodeId === node.nodeId)[0];
  const [{ mapData, preFields }, setState] = useSetState({
    mapData: [],
    preFields: [],
  });
  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
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
    const hsMorePkData = hsMorePkControl(preNode, list);
    let fields = (_.get(preNode, 'nodeConfig.fields') || []).filter(o => o.isCheck);
    fields = hsMorePkData ? [mdUniquePkData, ...fields] : fields;
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
    const hsMorePkData = hsMorePkControl(preNode, list);
    let fieldsMapping = _.get(node, ['nodeConfig', 'config', 'fieldsMapping']) || [];
    if (hsMorePkData && !fieldsMapping.find(o => !!o.sourceField.isUniquePk)) {
      //上一节点存在多主键，且映射不存在生成 mdUniquePkData 则补充映射
      fieldsMapping = [{ sourceField: mdUniquePkData, destField: null }, ...fieldsMapping];
    }
    if (isSetDefaultMap) {
      return fieldsMapping;
    }
    let sourceControls = [];
    let fields = (_.get(preNode, 'nodeConfig.fields') || []).filter(o => o.isCheck);
    fields = hsMorePkData ? [mdUniquePkData, ...fields] : fields;
    fieldsMapping = fieldsMapping.map(o => {
      //isDelete用作目的地映射的源字段删除显示
      sourceControls.push(o.sourceField);
      let sourceInfo = fields.find(
        it => !!it.isPk === !!_.get(o, 'sourceField.isPk') && it.id === _.get(o, 'sourceField.id'),
      );
      if (!sourceInfo) {
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
            ...sourceInfo,
            isDelete: false,
          },
        };
      }
    });
    fields.map(o => {
      if (!sourceControls.find(it => !!it.isPk === !!_.get(o, 'isPk') && it.id === _.get(o, 'id'))) {
        fieldsMapping.push({ sourceField: o, destField: null });
      }
    });
    return fieldsMapping;
  };
  const showTip = _.get(node, ['nodeConfig', 'config', 'dsType']) === DATABASE_TYPE.MONGO_DB && fileList.length <= 0;
  if (loading) {
    return <LoadDiv />;
  }
  return (
    <React.Fragment>
      {/* MongoDB为目的地的时候，请求返回数据为空 */}
      {showTip && <Wrap className="Gray">{_l('MongoDB 无数据的时候，会显示映射关系失效。')}</Wrap>}
      {_.get(node, ['nodeConfig', 'config', 'createTable']) && (
        <React.Fragment>
          <div className="name Bold pBottom12">{_l('新建表名称')}</div>
          <Input
            className="setSheetName"
            placeholder={_l('请输入')}
            defaultValue={sheetName}
            onBlur={e => {
              const sheetName = e.target.value
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
            manualRef={inputRef}
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
        fieldsMapping={mapData.map(o => {
          return { ...o, sourceField: { ...o.sourceField, name: o.sourceField.alias } };
        })}
        setFieldsMapping={(mapping, isOnChange) => {
          const data = mapping.map(o => {
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
          });
          if (isOnChange) {
            setState({ mapData: data });
            return;
          }
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
