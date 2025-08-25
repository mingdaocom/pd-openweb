import React, { useEffect, useRef } from 'react';
import DocumentTitle from 'react-document-title';
import { useSetState } from 'react-use';
import { Tooltip } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Dialog, Icon, LoadDiv, Support } from 'ming-ui';
import CheckBox from 'ming-ui/components/Checkbox';
import sheetAjax from 'src/api/worksheet';
import AggTableAjax from 'src/pages/integration/api/aggTable.js';
import SyncTask from 'src/pages/integration/api/syncTask.js';
import 'src/pages/integration/dataIntegration/connector/style.less';
import 'src/pages/workflow/components/Switch/index.less';
import { getTranslateInfo } from 'src/utils/app';
import { AGG_CONTROL_MAX, GROUPMAX, GROUPMAXBYREL, systemControls } from '../config';
import {
  getAllSourceList,
  getGroupFields,
  getNodeInfo,
  getSourceMaxCountByVersion,
  setGroupFields,
  updateConfig,
} from '../util';
import AddGroup from './AddGroup';
import AggregationCon from './AggregationCon';
import AddAggregation from './AggregationConForAdd';
import GroupCon from './GroupCon';
import GroupDialog from './GroupDialog';
import Preview from './Preview';
import SourceCon from './SourceCon';
import { Header, Wrap } from './style';
import './style.less';

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
      isErr,
      errorMsg,
      updateLoading,
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
    isErr: false,
    errorMsg: '',
    updateLoading: false,
  });

  useEffect(() => {
    getInfo();
  }, []);

  const getInfo = async () => {
    setState({ loading: true });
    if (!id) {
      initState({});
    } else {
      let data = {};
      try {
        data = await AggTableAjax.getAggTable({ projectId, appId, aggTableId: id }, { isAggTable: true });
      } catch (error) {
        console.log(error);
      }
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
    setState({ loading: true, isChange: false });
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
          const sourceInfos = _.map(ids, id => _.keyBy(data, 'worksheetId')[id]).map((o = {}, i) => {
            return {
              ...o,
              worksheetId: o.worksheetId || ids[i],
              controls: [...(o.controls || []), ...systemControls].map(a => {
                const relationControls = (a.relationControls || []).filter(it => !it.encryId);
                return {
                  ...a,
                  relationControls: [29, 34].includes(a.type) //子表 关联 都支持系统字段
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
      updateLoading: true,
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
          updateLoading: false,
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
          updateLoading: false,
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
        setState({ updating: false });
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
          <div className="iconWrap Hand" onClick={() => onClose()}>
            <i className="back icon-backspace Font24"></i>
          </div>
          {isEdit ? (
            <input
              autoFocus
              className="flex"
              value={name}
              maxlength="50"
              onChange={e => {
                const name = e.target.value;
                setState({ name });
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
              title={(flowData || {}).taskName || _l('未命名聚合表')}
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
                if (isPreviewRunning) return;
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
              <div className="Bold Font14 Gray flexRow alignItemsCenter">
                {_l('数据源')}
                <span className="Gray_75 mLeft10">
                  {getAllSourceList(flowData).length}/{getSourceMaxCountByVersion(projectId)}
                </span>
                {!md.global.Config.IsLocal && (
                  <Tooltip
                    placement="bottom"
                    title={<span className="">{_l('标准版支持5个、专业版和旗舰版支持10个')}</span>}
                  >
                    <Icon icon="info" className="Hand Gray_9e ThemeHoverColor3 mLeft5 Font16" />
                  </Tooltip>
                )}
              </div>
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
                updateLoading={updateLoading}
              />
              <div className="line mTop20" />
              <div className="Bold Font13 Gray mTop24">
                <div className="flexRow alignItemsCenter">
                  <span className="flex Font14 flexRow alignItemsCenter">
                    {_l('归组字段')}
                    <span className="Gray_75 mLeft10">{`(${getGroupFields(flowData).length}/${GROUPMAX})`}</span>
                    <Tooltip
                      placement="bottom"
                      autoCloseDelay={0}
                      title={
                        <span className="">
                          {_l('上限添加%0个归组字段，关联记录下数组类型字段最多%1个', GROUPMAX, GROUPMAXBYREL)}
                        </span>
                      }
                    >
                      <Icon icon="info" className="Hand Gray_9e ThemeHoverColor3 mLeft5 Font16" />
                    </Tooltip>
                  </span>
                  <CheckBox
                    className="Hand Gray_75 ThemeHoverColor3"
                    checked={_.get(groupDt, 'nodeConfig.config.displayNull') !== false}
                    onClick={() => {
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
                  <AddGroup
                    flowData={flowData}
                    onUpdate={onUpdate}
                    sourceInfos={sourceInfos}
                    updateLoading={updateLoading}
                  />
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
              <div className="Bold Font14 Gray mTop24">
                {_l('聚合字段')}
                <span className="Gray_75 mLeft10">{`(${(_.get(aggregateDt, 'nodeConfig.config.aggregateFields') || []).filter(o => !o.isCalculateField).length}/${AGG_CONTROL_MAX})`}</span>
              </div>
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
                updateLoading={updateLoading}
              />
              <div className="line mTop20" />
            </div>
          </div>
          <div className="preview flex h100">
            <Preview
              {...props}
              updateLoading={updateLoading}
              updating={updating}
              sourceHasChange={sourceHasChange}
              sourceInfos={sourceInfos}
              flowData={flowData}
              hasChange={hasChange}
              isChange={isChange}
              renderErrerDialog={renderErrerDialog}
              onChangePreview={isPreviewRunning => {
                setState({ isPreviewRunning });
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
          onHide={() => setState({ showGroupDialog: false })}
          flowData={_.cloneDeep(flowData)}
          sourceInfos={_.cloneDeep(sourceInfos).map(o => {
            const dataInfo =
              (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).find(it => it.workSheetId === o.worksheetId) ||
              {};
            return {
              ...o,
              workSheetName: getTranslateInfo(dataInfo.appId, null, dataInfo.workSheetId).name || dataInfo.tableName,
            };
          })}
          groupControls={getGroupFields(_.cloneDeep(flowData)) || []}
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
