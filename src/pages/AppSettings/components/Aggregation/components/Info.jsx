import React, { Fragment, useState, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { LoadDiv, Icon, Dialog } from 'ming-ui';
import ChooseControls from './ChooseControls';
import './style.less';
import GroupDialog from './GroupDialog';
import GroupCon from './GroupCon';
import AggregationCon from './AggregationCon';
import ChooseControlsForAggregation from './ChooseControlsForAggregation';
import CalculationDialog from './CalculationDialog';
import 'src/pages/workflow/components/Switch/index.less';
import sheetAjax from 'src/api/worksheet';
import SyncTask from 'src/pages/integration/api/syncTask.js';
import AggTableAjax from 'src/pages/integration/api/aggTable.js';
import { getNodeInfo, getAggFuncTypes, getRuleAlias } from '../util';
import Preview from './Preview';
import { Wrap, WrapDropW, Header } from './style';
import 'src/pages/integration/dataIntegration/connector/style.less';
import SourceCon from './SourceCon';

const STATUS2TEXT = {
  active: _l('同步中'),
  close: _l('已关闭'),
};

export default function Info(props) {
  const { onClose, projectId, appId, id } = props;
  const [
    {
      flowData,
      showGroupDialog,
      sourceInfos,
      showCalculation,
      isUpdate,
      updating,
      loading,
      isEdit,
      name,
      hasChange,
      hasDelete,
      isPreviewRunning,
    },
    setState,
  ] = useSetState({
    flowData: {},
    showGroupDialog: false,
    showCalculation: false,
    sourceInfos: [],
    isUpdate: false,
    updating: false,
    loading: true,
    isEdit: false,
    name: '',
    hasChange: false, //是否修改过配置
    hasDelete: false,
    isPreviewRunning: false, //存在未保存的配置 且当前正在保存ing
  });

  useEffect(() => {
    getInfo();
  }, []);

  const getInfo = () => {
    let Ajax = null;
    setState({
      loading: true,
    });
    if (!id) {
      Ajax = AggTableAjax.initEmpty({ projectId, appId, owner: md.global.Account.accountId });
    } else {
      Ajax = AggTableAjax.getAggTable({ projectId, appId, aggTableId: id });
    }
    Ajax.then(res => {
      initState(res);
    });
  };

  const initState = res => {
    setState({
      flowData: res,
      loading: (_.get(getNodeInfo(res, 'DATASOURCE'), 'nodeConfig.config.sourceTables') || []).length > 0,
      hasChange: res.status === 'EDITING', //编辑过未保存
    });
    (_.get(getNodeInfo(res, 'DATASOURCE'), 'nodeConfig.config.sourceTables') || []).length > 0 &&
      getWorksheets(_.get(getNodeInfo(res, 'DATASOURCE'), 'nodeConfig.config.sourceTables').map(o => o.workSheetId));
  };

  const getWorksheets = ids => {
    sheetAjax.getWorksheetsControls({ worksheetIds: ids, handControlSource: true }).then(({ code, data }) => {
      if (code === 1) {
        setState({
          loading: false,
          sourceInfos: _.map(ids, id => _.keyBy(data, 'worksheetId')[id]).map(o => {
            return {
              ...o,
              controls: (o.controls || [])
                .filter(it => !it.encryId) //加密字段 均不参数聚合表配置
                .map(a => {
                  return { ...a, relationControls: a.relationControls.filter(it => !it.encryId) };
                }),
            };
          }),
        });
      }
    });
  };

  const updateNodeConfig = node => {
    setState({
      isUpdate: true,
      flowData: {
        ...flowData,
        aggTableNodes: {
          ..._.get(flowData, 'aggTableNodes'),
          [node.nodeId]: node,
        },
      },
    });
  };

  const onUpdate = (node, isChange = true) => {
    if (!hasChange && isChange) {
      setState({
        hasChange: true,
      });
    }
    AggTableAjax.updateNode({
      projectId,
      aggTableId: flowData.id,
      nodeId: node.nodeId,
      name: node.name,
      nodeType: node.nodeType,
      status: node.status,
      description: node.description,
      nodeConfig: node.nodeConfig,
      updateFlag: isChange,
    }).then(res => {
      if (res.clearAll) {
        const groupDt = getNodeInfo(flowData, 'GROUP');
        const aggregateDt = getNodeInfo(flowData, 'AGGREGATE');
        setState({
          isUpdate: true,
          sourceInfos: [],
          flowData: {
            ...flowData,
            aggTableNodes: {
              ..._.get(flowData, 'aggTableNodes'),
              [node.nodeId]: node,
              [groupDt.nodeId]: { ...groupDt, nodeConfig: { ...groupDt.nodeConfig, config: { groupFields: [] } } },
              [aggregateDt.nodeId]: {
                ...aggregateDt,
                nodeConfig: { ...aggregateDt.nodeConfig, config: { aggregateFields: [] } },
              },
            },
          },
        });
        const tables = _.get(node, 'nodeConfig.config.sourceTables');
        tables.length > 0 && getWorksheets(tables.map(o => o.workSheetId));
      } else {
        updateNodeConfig({ ...node, nodeConfig: res });
      }
    });
  };

  const renderErrerDialog = errorMsgList => {
    return Dialog.confirm({
      title: _l('报错信息'),
      className: 'connectorErrorDialog',
      description: (
        <div className="errorInfo" style={{ 'max-height': 400, overflow: 'auto' }}>
          {errorMsgList.map((error, index) => {
            return (
              <div key={index} className="mTop5">
                {error}
              </div>
            );
          })}
        </div>
      ),
      removeCancelBtn: true,
      okText: _l('关闭'),
    });
  };
  const publishTask = () => {
    if (updating) {
      return;
    }
    publishTaskAction();
  };
  const publishTaskAction = info => {
    setState({
      updating: true,
    });
    AggTableAjax.publishTask({
      projectId,
      appId,
      aggTableId: flowData.id,
      preview: false, //是否预览
      // aggTableNodes: _.values(flowData.aggTableNodes),
    }).then(
      res => {
        setState({
          updating: false,
          hasChange: false,
        });
        const {
          errorMsgList = [],
          isSucceeded,
          errorNodeIds = [],
          errorType,
          worksheetId,
          fieldIdAndAssignCidMap,
        } = res;
        if (isSucceeded) {
          // setState({
          //   isUpdate: false,
          //   flowData: {
          //     ...flowData,
          //     taskStatus: 'RUNNING',
          //     status: '',
          //     worksheetId,
          //     fieldIdAndAssignCidMap,
          //   },
          // });
          onClose();
        } else {
          if (errorMsgList.length > 0) {
            setState({
              isUpdate: false,
              flowData: {
                ...flowData,
                taskStatus: 'ERROR',
              },
            });
            renderErrerDialog(errorMsgList);
          }
        }
      },
      () => {
        setState({
          updating: false,
        });
      },
    );
  };
  //修改同步任务属性(name)
  const updateSyncTask = () => {
    SyncTask.updateSyncTask({
      taskId: flowData.taskId,
      name: name,
      projectId,
      owner: md.global.Account.accountId,
    }).then(res => {
      if (res) {
        setState({
          flowData: { ...flowData, taskName: name },
          isEdit: false,
          name: '',
        });
      } else {
        alert(_l('修改失败，请稍后再试'), 2);
      }
    });
  };

  if (loading) {
    return <LoadDiv />;
  }
  const sourceDt = getNodeInfo(flowData, 'DATASOURCE');
  const groupDt = getNodeInfo(flowData, 'GROUP');
  const aggregateDt = getNodeInfo(flowData, 'AGGREGATE');
  return (
    <Wrap className="flexColumn h100">
      <Header className="flexRow alignItemsCenter">
        <div className="flex mLeft24 pageName">
          <div
            className="iconWrap Hand"
            onClick={() => {
              onClose();
            }}
          >
            <i className="back icon-backspace Font24"></i>
          </div>
          {isEdit ? (
            <input
              autoFocus
              value={name}
              onChange={e => {
                const name = e.target.value;
                setState({
                  name,
                });
              }}
              onBlur={() => {
                if (!name.trim()) {
                  setState({ isEdit: false, name: '' });
                } else {
                  updateSyncTask();
                }
              }}
            />
          ) : (
            <div
              className="name overflow_ellipsis Font16 Bold"
              onClick={() => setState({ isEdit: true, name: (flowData || {}).taskName })}
            >
              {(flowData || {}).taskName || _l('未命名聚合表')}
            </div>
          )}
        </div>
        <div
          className="flex flexRow"
          style={{
            'justify-content': 'flex-end',
          }}
        >
          <span
            className={cx('publishBtn InlineBlock Hand mRight24', { disable: updating })}
            onClick={() => {
              if (updating) {
                return;
              }
              publishTask();
            }}
          >
            {!flowData.worksheetId ? _l('发布') : _l('保存')}
          </span>
        </div>
      </Header>
      <div className="con flex overflowHidden">
        <div className="flexRow h100">
          <div className="setCon h100 Relative">
            {isPreviewRunning && (
              <React.Fragment>
                <div className="cover" />
                <div className="TxtCenter Bold Gray">{_l('预览中无法修改配置，请先停止预览')}</div>
              </React.Fragment>
            )}
            <div className="Bold Font14 Gray">{_l('数据源')}</div>
            <SourceCon
              projectId={projectId}
              appId={appId}
              flowData={flowData}
              sourceInfos={sourceInfos}
              onChange={(data, state) => {
                data && onUpdate(data);
                state && setState({ ...state });
              }}
              getWorksheets={getWorksheets}
            />
            <div className="line mTop20" />
            <div className="Bold Font13 Gray mTop24">
              <div className="flexRow">
                <span className="flex Font14">{_l('归组')} </span>
                {/* 多源且已设置归组 */}
                {(_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).length > 1 && (
                  // (_.get(groupDt, 'nodeConfig.config.groupFields') || []).length > 0 &&
                  <span
                    className="Hand Gray_75 ThemeHoverColor3"
                    onClick={() => {
                      setState({ showGroupDialog: true });
                    }}
                  >
                    {_l('设置归组')}
                  </span>
                )}
              </div>
              {/* 归组 */}
              {/* 关联记录限制10个，选择了下一级字段才算使用1个。 */}
              {(_.get(groupDt, 'nodeConfig.config.groupFields') || []).length > 0 && (
                <GroupCon
                  flowData={flowData}
                  list={_.get(groupDt, 'nodeConfig.config.groupFields') || []}
                  sourceTables={_.get(sourceDt, 'nodeConfig.config.sourceTables') || []}
                  onChange={(groupFields, isChange) => {
                    onUpdate(
                      {
                        ...groupDt,
                        nodeConfig: {
                          ..._.get(groupDt, 'nodeConfig'),
                          config: {
                            ..._.get(groupDt, 'nodeConfig.config'),
                            groupFields: groupFields,
                          },
                        },
                      },
                      isChange,
                    );
                  }}
                  updateErr={() => {
                    !hasDelete && setState({ hasDelete: true });
                  }}
                />
              )}
              {/* 单源 */}
              {(_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).length <= 1 ? (
                <Trigger
                  action={['click']}
                  key={`groupFields_${(_.get(groupDt, 'nodeConfig.config.groupFields') || []).length}`}
                  getPopupContainer={() => document.body}
                  popupAlign={{ points: ['tl', 'bl'], offset: [0, 4], overflow: { adjustX: true, adjustY: true } }}
                  popup={
                    (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).length <= 0 ? (
                      <span />
                    ) : (
                      <WrapDropW>
                        <ChooseControls
                          title={((_.get(sourceDt, 'nodeConfig.config.sourceTables') || [])[0] || {}).tableName}
                          worksheetId={((_.get(sourceDt, 'nodeConfig.config.sourceTables') || [])[0] || {}).workSheetId}
                          flowData={flowData}
                          sourceInfos={sourceInfos}
                          onChange={data => {
                            const { control, childrenControl } = data;
                            let newDt = {
                              alias: getRuleAlias(control.controlName, flowData),
                              controlSetting: !!childrenControl ? childrenControl : control,
                              isChildField: !!childrenControl, //可选，是否为子表字段(工作表关联字段关联表下的字段)-默认false
                              parentFieldInfo: !!childrenControl ? control : {}, //可选，父字段，子表字段的上级字段，isChildField为true的时候必须有
                              isNotNull: true,
                              isTitle: control.attribute === 1, //是否是标题，只有是工作表字段才有值
                              mdType: control.type,
                              name: control.controlName,
                              oid: `${
                                ((_.get(sourceDt, 'nodeConfig.config.sourceTables') || [])[0] || {}).workSheetId
                              }_${control.controlId}`, //工作表:oid记录为 worksheetId_controllId,这里前端需要这种层级关系，后端获取的时候只需controllerId
                              precision: 0,
                              scale: 0,
                            };
                            const groupFieldAdd = {
                              fields: [newDt],
                              resultField: newDt,
                            };
                            const groupDt = getNodeInfo(flowData, 'GROUP');
                            onUpdate({
                              ...groupDt,
                              nodeConfig: {
                                ..._.get(groupDt, 'nodeConfig'),
                                config: {
                                  ..._.get(groupDt, 'nodeConfig.config'),
                                  groupFields: (_.get(groupDt, 'nodeConfig.config.groupFields') || []).concat(
                                    groupFieldAdd,
                                  ),
                                  // groupFields: [],
                                },
                              },
                            });
                          }}
                        />
                      </WrapDropW>
                    )
                  }
                >
                  <div
                    className={cx(
                      'mTop16 Gray_75 ThemeHoverColor3 qw alignItemsCenter flexRow',
                      (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).length <= 0 ? '' : 'Hand',
                    )}
                  >
                    <Icon icon="add" className="Font16" /> <span>{_l('归组')}</span>
                  </div>
                </Trigger>
              ) : (
                ''
              )}
            </div>
            <div className="line mTop20" />
            <div className="Bold Font14 Gray mTop24">{_l('聚合')}</div>
            <AggregationCon
              flowData={flowData}
              list={_.get(aggregateDt, 'nodeConfig.config.aggregateFields') || []}
              sourceTables={_.get(sourceDt, 'nodeConfig.config.sourceTables') || []}
              onChange={(aggregateFields, isChange) => {
                onUpdate(
                  {
                    ...aggregateDt,
                    nodeConfig: {
                      ..._.get(aggregateDt, 'nodeConfig'),
                      config: {
                        ..._.get(aggregateDt, 'nodeConfig.config'),
                        aggregateFields: aggregateFields,
                      },
                    },
                  },
                  isChange,
                );
              }}
              updateErr={() => {
                !hasDelete && setState({ hasDelete: true });
              }}
            />
            <Trigger
              action={['click']}
              getPopupContainer={() => document.body}
              key={`ChooseControlsForAggregation_${
                (_.get(aggregateDt, 'nodeConfig.config.aggregateFields') || []).length
              }`}
              popupAlign={{ points: ['tl', 'bl'], offset: [0, 4], overflow: { adjustX: true, adjustY: true } }}
              popup={
                (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).length > 0 ? (
                  <ChooseControlsForAggregation
                    worksheets={_.get(sourceDt, 'nodeConfig.config.sourceTables').map(o => {
                      return {
                        ...o,
                        controls: (sourceInfos.find(it => it.worksheetId === o.workSheetId) || {}).controls,
                      };
                    })}
                    worksheetId={
                      (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).length > 1
                        ? ''
                        : (_.get(sourceDt, 'nodeConfig.config.sourceTables') || [])[0].workSheetId
                    }
                    list={[]}
                    flowData={flowData}
                    sourceInfos={sourceInfos}
                    onChange={({ control = {}, childrenControl }, worksheetId) => {
                      const aggregateDt = getNodeInfo(flowData, 'AGGREGATE');
                      const { hs, aggFuncType } = getAggFuncTypes(
                        _.get(aggregateDt, 'nodeConfig.config.aggregateFields') || [],
                        !!childrenControl ? childrenControl : control,
                        worksheetId,
                      );
                      if (hs) {
                        alert(_l('不能重复添加相同计算方式的相同字段'), 3);
                        return;
                      }
                      let newDt =
                        control.controlId === 'rowscount'
                          ? {
                              name: _l('记录数量'),
                              alias: getRuleAlias(`${_l('记录数量')}_${aggFuncType}`, flowData),
                              isRowsCount: true,
                              aggFuncType,
                              oid: `${worksheetId}_rowscount`,
                              // isCalculateField: false,
                            }
                          : {
                              aggFuncType,
                              alias: getRuleAlias(
                                `${(!!childrenControl ? childrenControl : control).controlName}_${aggFuncType}`,
                                flowData,
                              ),
                              controlSetting: !!childrenControl ? childrenControl : control,
                              isChildField: !!childrenControl, //可选，是否为子表字段(工作表关联字段关联表下的字段)-默认false
                              parentFieldInfo: !!childrenControl ? control : {}, //可选，父字段，子表字段的上级字段，isChildField为true的时候必须有
                              isNotNull: true,
                              isTitle: (!!childrenControl ? childrenControl : control).attribute === 1, //是否是标题，只有是工作表字段才有值
                              mdType: (!!childrenControl ? childrenControl : control).type,
                              name: (!!childrenControl ? childrenControl : control).controlName,
                              oid: `${worksheetId}_${(!!childrenControl ? childrenControl : control).controlId}`, //工作表:oid记录为 worksheetId_controllId,这里前端需要这种层级关系，后端获取的时候只需controllerId
                              precision: 0,
                              scale: 0,
                              isCalculateField: false,
                            };
                      onUpdate({
                        ...aggregateDt,
                        nodeConfig: {
                          ..._.get(aggregateDt, 'nodeConfig'),
                          config: {
                            ..._.get(aggregateDt, 'nodeConfig.config'),
                            aggregateFields: (_.get(aggregateDt, 'nodeConfig.config.aggregateFields') || []).concat(
                              newDt,
                            ),
                          },
                        },
                      });
                    }}
                  />
                ) : (
                  <span className=""></span>
                )
              }
            >
              <span className="InlineBlock">
                <span
                  className={cx(
                    'mTop16 Gray_75 ThemeHoverColor3 Bold alignItemsCenter flexRow',
                    (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).length <= 0 ? '' : 'Hand',
                  )}
                >
                  <Icon icon="add" className="Font16" />
                  <span>{_l('字段')}</span>
                </span>
              </span>
            </Trigger>
            {/* 数值类字段配置：求和（默认）、最大值、最小值、平均值 ｜ 非数值字段配置：计数、去重计数 */}
            {/* calculation */}
            {/* 存在聚合字段 */}
            {/* 在聚合显示的字段中选择字段进行加减乘除运算 */}
            {(_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).length > 0 &&
              (_.get(aggregateDt, 'nodeConfig.config.aggregateFields') || []).filter(o => !o.isCalculateField).length >
                0 && (
                <span className="InlineBlock">
                  <span
                    className={cx('Hand mTop16 Gray_75 ThemeHoverColor3 Bold flexRow alignItemsCenter mLeft25', {})}
                    onClick={() => {
                      setState({
                        showCalculation: true,
                      });
                    }}
                  >
                    <Icon icon="add" className="Font16" />
                    <span>{_l('计算字段')}</span>
                  </span>
                </span>
              )}
            <div className="line mTop20" />
          </div>
          <div className="preview flex h100">
            <Preview
              {...props}
              sourceInfos={sourceInfos}
              flowData={flowData}
              hasChange={hasChange}
              renderErrerDialog={renderErrerDialog}
              onChangePreview={isPreviewRunning => {
                setState({
                  isPreviewRunning,
                });
              }}
            />
          </div>
        </div>
      </div>

      {showGroupDialog && (
        <GroupDialog
          visible={showGroupDialog}
          onHide={() => {
            setState({
              showGroupDialog: false,
            });
          }}
          flowData={flowData}
          sourceInfos={sourceInfos.map(o => {
            return {
              ...o,
              workSheetName: (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).find(
                it => it.workSheetId === o.worksheetId,
              ).tableName,
            };
          })}
          groupControls={_.get(groupDt, 'nodeConfig.config.groupFields') || []}
          onOk={groupFields => {
            const groupDt = getNodeInfo(flowData, 'GROUP');
            onUpdate({
              ...groupDt,
              nodeConfig: {
                ..._.get(groupDt, 'nodeConfig'),
                config: {
                  ..._.get(groupDt, 'nodeConfig.config'),
                  groupFields: groupFields,
                },
              },
            });
          }}
        />
      )}
      {showCalculation && (
        <CalculationDialog
          visible={showCalculation}
          onHide={() => {
            setState({
              showCalculation: false,
            });
          }}
          onOk={control => {
            let newDt = {
              alias: getRuleAlias(control.controlName, flowData),
              controlSetting: control,
              isChildField: false, //可选，是否为子表字段(工作表关联字段关联表下的字段)-默认false
              parentFieldInfo: {}, //可选，父字段，子表字段的上级字段，isChildField为true的时候必须有
              isNotNull: true,
              isTitle: false, //是否是标题，只有是工作表字段才有值
              mdType: 31,
              name: control.controlName,
              // oid: `${o.worksheetId}_${control.controlId}`, //工作表:oid记录为 worksheetId_controllId,这里前端需要这种层级关系，后端获取的时候只需controllerId
              precision: 0,
              scale: 0,
              isCalculateField: true,
            };
            const aggregateDt = getNodeInfo(flowData, 'AGGREGATE');
            onUpdate({
              ...aggregateDt,
              nodeConfig: {
                ..._.get(aggregateDt, 'nodeConfig'),
                config: {
                  ..._.get(aggregateDt, 'nodeConfig.config'),
                  aggregateFields: (_.get(aggregateDt, 'nodeConfig.config.aggregateFields') || []).concat(newDt),
                },
              },
            });
          }}
          allControls={(_.get(aggregateDt, 'nodeConfig.config.aggregateFields') || [])
            .filter(o => !o.isCalculateField)
            .map(o => {
              return { ...o, controlName: o.alias, controlId: _.get(o, 'id'), type: 6 };
            })}
        />
      )}
    </Wrap>
  );
}
