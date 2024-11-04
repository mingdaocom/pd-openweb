import React, { Fragment, useState, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { LoadDiv, Icon, Dialog, Support } from 'ming-ui';
import CheckBox from 'ming-ui/components/Checkbox';
import ChooseControls from './ChooseControls';
import './style.less';
import GroupDialog from './GroupDialog';
import GroupCon from './GroupCon';
import AggregationCon from './AggregationCon';
import 'src/pages/workflow/components/Switch/index.less';
import sheetAjax from 'src/api/worksheet';
import SyncTask from 'src/pages/integration/api/syncTask.js';
import AggTableAjax from 'src/pages/integration/api/aggTable.js';
import {
  getNodeInfo,
  getRuleAlias,
  updateConfig,
  getGroupFields,
  getGroupInfo,
  setGroupFields,
  setResultFieldSettingByAggFuncType,
} from '../util';
import Preview from './Preview';
import { Wrap, WrapDropW, Header } from './style';
import 'src/pages/integration/dataIntegration/connector/style.less';
import SourceCon from './SourceCon';
import AddAggregation from './AggregationConForAdd';
import { getTranslateInfo } from 'src/util';
import DocumentTitle from 'react-document-title';
import { systemControls } from '../config';

export default function Info(props) {
  const scrollDivRef = useRef(null);
  const { onClose, projectId, appId, id } = props;
  const [
    {
      flowData,
      showGroupDialog,
      sourceInfos,
      updating,
      loading,
      isEdit,
      name,
      hasChange,
      hasDelete,
      isPreviewRunning,
      isChange,
      sourceHasChange,
      showList,
      isErr,
      errorMsg,
    },
    setState,
  ] = useSetState({
    flowData: {},
    showGroupDialog: false,
    sourceInfos: [],
    updating: false,
    loading: true,
    isEdit: false,
    name: '',
    hasChange: false, //是否修改过配置
    hasDelete: false,
    isPreviewRunning: false, //存在未保存的配置 且当前正在保存ing
    isChange: false,
    sourceHasChange: false,
    showList: false,
    isErr: false,
    errorMsg: '',
  });

  useEffect(() => {
    getInfo();
  }, []);

  const getInfo = async () => {
    setState({
      loading: true,
    });
    if (!id) {
      initState({});
    } else {
      let data = {};
      try {
        data = await AggTableAjax.getAggTable({ projectId, appId, aggTableId: id }, { isAggTable: true });
      } catch (error) {}
      initState(data);
    }
  };

  const initAggretion = () => {
    return AggTableAjax.initEmpty(
      { projectId, appId, owner: md.global.Account.accountId, name: _l('未命名聚合表') },
      { isAggTable: true },
    );
  };

  const reset = () => {
    setState({
      loading: true,
      isChange: false,
    });
    AggTableAjax.undoChange({ projectId, appId, aggTableId: id }, { isAggTable: true }).then(res => {
      initState({
        ...flowData,
        ...res,
        status: 'INIT',
      });
    });
  };

  const initState = (res, cb) => {
    setState({
      flowData: res,
      loading: (_.get(getNodeInfo(res, 'DATASOURCE'), 'nodeConfig.config.sourceTables') || []).length > 0,
      hasChange: res.status === 'EDITING',
      isErr: !res.isScucceed,
      errorMsg: res.errorMsg,
    });
    (_.get(getNodeInfo(res, 'DATASOURCE'), 'nodeConfig.config.sourceTables') || []).length > 0 &&
      getWorksheets(
        _.get(getNodeInfo(res, 'DATASOURCE'), 'nodeConfig.config.sourceTables').map(o => o.workSheetId),
        res,
      );
    cb && cb(res);
  };

  const getWorksheets = (ids, res) => {
    sheetAjax
      .getWorksheetsControls({ worksheetIds: ids, handControlSource: true, getRelationSearch: true })
      .then(({ code, data }) => {
        if (code === 1) {
          const sourceInfos = _.map(ids, id => _.keyBy(data, 'worksheetId')[id]).map((o = {}) => {
            return {
              ...o,
              controls: [...(o.controls || []), ...systemControls].map(a => {
                const relationControls = (a.relationControls || []).filter(it => !it.encryId);
                return {
                  ...a,
                  relationControls: [29, 34].includes(a.type)//子表 关联 都支持系统字段
                    ? [...relationControls, ...systemControls]
                    : relationControls,
                };
              }),
            };
          });
          if (res) {
            const flowData = res;
            const groupDt = getNodeInfo(flowData, 'GROUP');
            setState({
              loading: false,
              sourceInfos,
              flowData: {
                ...flowData,
                aggTableNodes: {
                  ..._.get(flowData, 'aggTableNodes'),
                  [groupDt.nodeId]: updateConfig(groupDt, {
                    groupFields: setGroupFields(groupDt, sourceInfos, flowData),
                  }),
                },
              },
            });
          } else {
            setState({
              loading: false,
              sourceInfos,
            });
          }
        }
      });
  };

  const updateNodeConfig = nodes => {
    setState({
      flowData: {
        ...flowData,
        aggTableNodes: {
          ..._.get(flowData, 'aggTableNodes'),
          ...nodes,
        },
      },
    });
  };

  const onUpdate = (nodes, isChange = true, data) => {
    const flowData = data || flowData;
    setState({
      isChange,
    });
    if (!hasChange && isChange) {
      setState({
        hasChange: true,
      });
    }
    AggTableAjax.updateNode(
      {
        projectId,
        aggTableId: flowData.id,
        nodeConfigs: nodes,
        updateFlag: isChange, //&& flowData.aggTableTaskStatus !== 0,
      },
      { isAggTable: true },
    ).then(res => {
      const clearAll = !!res.nodeConfigs.find(o => o.clearAll);
      if (clearAll) {
        const groupDt = getNodeInfo(flowData, 'GROUP');
        const aggregateDt = getNodeInfo(flowData, 'AGGREGATE');
        const node = nodes[0];
        let param = {};
        if (flowData.aggTableTaskStatus === 0) {
          param = { sourceHasChange: true };
        }
        setState({
          ...param,
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
      } else {
        setState({
          sourceHasChange: false,
        });
        let infos = {};
        res.nodeConfigs.map((o, i) => {
          infos[o.nodeId] = { ...nodes[i], nodeConfig: o };
        });
        updateNodeConfig(infos);
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
  const publishTaskAction = () => {
    const hasC = hasChange;
    setState({
      updating: true,
      hasChange: false,
      isPreviewRunning: false,
    });
    AggTableAjax.publishTask(
      {
        projectId,
        appId,
        aggTableId: flowData.id,
        preview: false, //是否预览
      },
      { isAggTable: true },
    ).then(
      res => {
        setState({
          updating: false,
          hasChange: false,
        });
        const { errorMsgList = [], isSucceeded } = res;
        if (isSucceeded) {
          onClose();
        } else {
          if (errorMsgList.length > 0) {
            setState({
              hasChange: hasC,
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

  const changeUrl = id => {
    history.pushState({}, '', `${window.subPath || ''}/app/${appId}/settings/aggregation/${id}${location.search}`);
  };

  //修改同步任务属性(name)
  const updateSyncTask = async () => {
    const updateTask = flowData => {
      SyncTask.updateSyncTask(
        {
          taskId: flowData.taskId,
          name: name,
          projectId,
          owner: md.global.Account.accountId,
        },
        { isAggTable: true },
      ).then(res => {
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
    if (!flowData.id) {
      const data = await initAggretion();
      changeUrl(data.id);
      initState(data, updateTask);
    } else {
      updateTask(flowData);
    }
  };

  if (loading) {
    return <LoadDiv />;
  }
  if (isErr && errorMsg) {
    return <div className="Font17 Gray_75 mTop90 pTop100 TxtCenter">{errorMsg}</div>;
  }
  if (id && !flowData.id) {
    return <div className="Font17 Gray_75 mTop90 pTop100 TxtCenter">{_l('无相关聚合表')}</div>;
  }
  const sourceDt = getNodeInfo(flowData, 'DATASOURCE');
  const groupDt = getNodeInfo(flowData, 'GROUP');
  const aggregateDt = getNodeInfo(flowData, 'AGGREGATE');
  const getSourceTableData = (_.get(sourceDt, 'nodeConfig.config.sourceTables') || [])[0] || {};
  return (
    <Wrap className="flexColumn h100">
      <DocumentTitle
        title={
          props.appName
            ? `${(flowData || {}).taskName || _l('未命名聚合表')} - ${props.appName} - ${_l('应用管理')} - ${_l(
                '聚合表',
              )}`
            : `${(flowData || {}).taskName || _l('未命名聚合表')} - ${_l('应用管理')} - ${_l('聚合表')}`
        }
      />
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
              maxlength="50"
              onChange={e => {
                const name = e.target.value;
                setState({
                  name,
                });
              }}
              onBlur={() => {
                if (!name.trim()) {
                  setState({ isEdit: false, name: '' });
                } else if (flowData.taskName !== name.trim()) {
                  updateSyncTask();
                } else {
                  setState({ isEdit: false });
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
          <Support
            text={_l('使用帮助')}
            type={2}
            href="https://help.mingdao.com/application/aggregation"
            className="mRight20 Gray_bd"
          />
          {hasChange && flowData.aggTableTaskStatus === 1 && (
            <span
              className={cx('reset InlineBlock mRight24 Gray_9e', { 'ThemeHoverColor3 Hand': !isPreviewRunning })}
              onClick={() => {
                if (isPreviewRunning) {
                  return;
                }
                reset();
              }}
            >
              {_l('撤销更改')}
            </span>
          )}
          {!!flowData.id && (
            <span
              className={cx('publishBtn InlineBlock Hand mRight24', { disable: updating })}
              onClick={() => {
                if (updating) {
                  return;
                }
                if (flowData.aggTableTaskStatus === 0 || hasChange) {
                  publishTask();
                } else {
                  onClose();
                }
              }}
            >
              {flowData.aggTableTaskStatus === 0
                ? updating
                  ? _l('发布中...')
                  : _l('发布')
                : updating
                ? _l('保存中...')
                : _l('保存')}
            </span>
          )}
        </div>
      </Header>
      <div className="con flex overflowHidden">
        <div className="flexRow h100">
          <div className="setCon h100 Relative flexColumn">
            <div className="flex setConB noSelect" ref={scrollDivRef}>
              {isPreviewRunning && (
                <React.Fragment>
                  <div className="cover"></div>
                  <div className="TxtLeft Bold Black mBottom20">{_l('预览中无法修改配置，请先停止预览')}</div>
                </React.Fragment>
              )}
              <div className="Bold Font14 Gray">{_l('数据源')}</div>
              <SourceCon
                projectId={projectId}
                appId={appId}
                onChangeByInit={async cb => {
                  const data = await initAggretion();
                  changeUrl(data.id);
                  initState(data, data => cb(data));
                }}
                flowData={flowData}
                sourceInfos={sourceInfos}
                onChange={(data, state) => {
                  data && onUpdate(data, true, (state || {}).flowData || flowData);
                  state && setState({ ...state });
                }}
                getWorksheets={getWorksheets}
              />
              <div className="line mTop20" />
              <div className="Bold Font13 Gray mTop24">
                <div className="flexRow alignItemsCenter">
                  <span className="flex Font14">{_l('归组字段')} </span>
                  <CheckBox
                    className="Hand Gray_75 ThemeHoverColor3"
                    checked={_.get(groupDt, 'nodeConfig.config.displayNull') !== false}
                    onClick={checked => {
                      onUpdate(
                        [
                          updateConfig(groupDt, {
                            displayNull: _.get(groupDt, 'nodeConfig.config.displayNull') === false,
                          }),
                        ],
                        true,
                        flowData,
                      );
                    }}
                  >
                    <span className="">{_l('显示空值')}</span>
                  </CheckBox>
                </div>
                {/* 归组 */}
                {/* 关联记录限制10个，选择了下一级字段才算使用1个。 */}
                {getGroupFields(flowData).length > 0 && (
                  <GroupCon
                    flowData={flowData}
                    sourceInfos={sourceInfos}
                    list={getGroupFields(flowData) || []}
                    sourceTables={_.get(sourceDt, 'nodeConfig.config.sourceTables') || []}
                    onChange={(groupFields, isChange) => {
                      onUpdate([updateConfig(groupDt, { groupFields })], isChange, flowData);
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
                    key={`groupFields_${(getGroupFields(flowData) || []).length}`}
                    getPopupContainer={() => document.body}
                    popupAlign={{ points: ['tl', 'bl'], offset: [0, 4], overflow: { adjustX: true, adjustY: true } }}
                    popupVisible={showList}
                    onPopupVisibleChange={showList => setState({ showList })}
                    popup={
                      (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).length <= 0 || !showList ? (
                        <span />
                      ) : (
                        <WrapDropW>
                          <ChooseControls
                            title={
                              getTranslateInfo(getSourceTableData.appId, null, getSourceTableData.workSheetId).name ||
                              getSourceTableData.tableName
                            }
                            worksheetId={getSourceTableData.workSheetId}
                            flowData={flowData}
                            sourceInfos={sourceInfos.map(o => {
                              const { appId, workSheetId, tableName } =
                                (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).find(
                                  ii => ii.workSheetId === o.worksheetId,
                                ) || {};
                              return {
                                ...o,
                                controls: o.controls.filter(o => ![6, 8].includes(o.type)), //归组这一期先不做数值和金额）
                                tableName: getTranslateInfo(appId, null, workSheetId).name || tableName,
                              };
                            })}
                            onChange={data => {
                              const { control, childrenControl } = data;
                              const workSheetId = ((_.get(sourceDt, 'nodeConfig.config.sourceTables') || [])[0] || {})
                                .workSheetId;
                              const controlData = !!childrenControl ? childrenControl : control;
                              const name = !!childrenControl
                                ? `${control.controlName}-${controlData.controlName}`
                                : controlData.controlName;
                              let newDt = {
                                alias: getRuleAlias(name, flowData),
                                controlSetting: controlData,
                                isChildField: !!childrenControl, //可选，是否为子表字段(工作表关联字段关联表下的字段)-默认false
                                parentFieldInfo: !!childrenControl
                                  ? {
                                      controlSetting: control,
                                      oid: `${workSheetId}_${control.controlId}`,
                                    }
                                  : {}, //可选，父字段，子表字段的上级字段，isChildField为true的时候必须有
                                isNotNull: true,
                                isTitle: controlData.attribute === 1, //是否是标题，只有是工作表字段才有值
                                mdType: controlData.type,
                                name: name,
                                oid: `${!!childrenControl ? control.dataSource : workSheetId}_${controlData.controlId}`, //工作表:oid记录为 worksheetId_controllId,这里前端需要这种层级关系，后端获取的时候只需controllerId
                                precision: 0,
                                scale: 0,
                              };
                              const resultField = { ...newDt, ...getGroupInfo({ fields: [newDt] }, flowData) };
                              const groupFieldAdd = {
                                fields: [newDt],
                                resultField: setResultFieldSettingByAggFuncType(resultField),
                              };
                              const groupDt = getNodeInfo(flowData, 'GROUP');
                              onUpdate(
                                [
                                  updateConfig(groupDt, {
                                    displayNull: _.get(groupDt, 'nodeConfig.config.displayNull') !== false,
                                    groupFields: getGroupFields(flowData).concat(groupFieldAdd),
                                  }),
                                ],
                                true,
                                flowData,
                              );
                              setState({ showList: false });
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
                      <Icon icon="add" className="Font16" /> <span>{_l('字段')}</span>
                    </div>
                  </Trigger>
                ) : (
                  <span
                    className="Hand mTop16 Gray_75 ThemeHoverColor3 InlineBlock"
                    onClick={() => {
                      setState({ showGroupDialog: true });
                    }}
                  >
                    {_l('设置归组')}
                  </span>
                )}
              </div>
              <div className="line mTop20" />
              <div className="Bold Font14 Gray mTop24">{_l('聚合字段')}</div>
              <AggregationCon
                flowData={flowData}
                sourceInfos={sourceInfos}
                list={_.get(aggregateDt, 'nodeConfig.config.aggregateFields') || []}
                sourceTables={_.get(sourceDt, 'nodeConfig.config.sourceTables') || []}
                onChange={(aggregateFields, isChange) => {
                  onUpdate(
                    [
                      updateConfig(aggregateDt, {
                        aggregateFields,
                      }),
                    ],
                    isChange,
                    flowData,
                  );
                }}
                updateErr={() => {
                  !hasDelete && setState({ hasDelete: true });
                }}
              />
              <AddAggregation
                flowData={flowData}
                sourceInfos={sourceInfos}
                onUpdate={(data, isChange) => onUpdate(data, isChange, flowData)}
              />
              <div className="line mTop20" />
            </div>
          </div>
          <div className="preview flex h100">
            <Preview
              {...props}
              updating={updating}
              sourceHasChange={sourceHasChange}
              sourceInfos={sourceInfos}
              flowData={flowData}
              hasChange={hasChange}
              isChange={isChange}
              renderErrerDialog={renderErrerDialog}
              onChangePreview={isPreviewRunning => {
                setState({
                  isPreviewRunning,
                });
                if (isPreviewRunning) {
                  scrollDivRef.current.scrollTop = 0;
                }
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
            const dataInfo = (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).find(
              it => it.workSheetId === o.worksheetId,
            );
            return {
              ...o,
              workSheetName: getTranslateInfo(dataInfo.appId, null, dataInfo.workSheetId).name || dataInfo.tableName,
            };
          })}
          groupControls={getGroupFields(flowData) || []}
          onOk={groupFields => {
            const groupDt = getNodeInfo(flowData, 'GROUP');
            onUpdate(
              [
                updateConfig(groupDt, {
                  displayNull: _.get(groupDt, 'nodeConfig.config.displayNull') !== false,
                  groupFields,
                }),
              ],
              true,
              flowData,
            );
          }}
        />
      )}
    </Wrap>
  );
}
