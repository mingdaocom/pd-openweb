import flowNode from '../api/flowNode';
import process from '../api/process';
import _ from 'lodash';

// 获取工作流基础信息
export const getFlowInfo = processId => (dispatch, getState) => {
  process
    .getProcessPublish({ processId }, { isIntegration: location.href.indexOf('integration') > -1 })
    .then(result => {
      dispatch({
        type: 'GET_FLOW_INFO',
        data: result,
      });
    });
};

// 更新工作流基础信息
export const updateProcess = (companyId, processId, name, explain) => (dispatch, getState) => {
  process
    .updateProcess({
      companyId,
      processId,
      name,
      explain,
    })
    .then(result => {
      dispatch({
        type: 'UPDATE_PROCESS',
        data: result,
      });
    });
};

// 更新发布状态
export const updatePublishState = obj => (dispatch, getState) => {
  const { workflowDetail } = getState().workflow;

  dispatch({
    type: 'UPDATE_PUBLIC_STATE',
    obj,
  });

  if (!obj.pending && obj.state !== 13) {
    getProcessById(workflowDetail.id, null)(dispatch);
  }
};

// 获取工作流配置详情
export const getProcessById =
  (processId, count = 200) =>
  (dispatch, getState) => {
    flowNode.get({ processId, count }, { isIntegration: location.href.indexOf('integration') > -1 }).then(result => {
      const isSimple = count && Object.keys(result.flowNodeMap).length > count;

      dispatch({
        type: 'GET_PROCESS_INFO',
        data: Object.assign({}, result, { isSimple }),
      });

      if (isSimple) {
        getProcessById(processId, null)(dispatch);
      }
    });
  };

// 清除工作流数据
export const clearSource = () => (dispatch, getState) => {
  dispatch({
    type: 'CLEAR_FLOW_SOURCE',
  });
  dispatch({
    type: 'CLEAR_SOURCE',
  });
};

// 获得审批流程对象对应的节点ID
const getApprovalProcessNodeId = (flowNodeMap, processId) => {
  let nodeId;

  Object.keys(flowNodeMap).forEach(key => {
    if (flowNodeMap[key].processNode && flowNodeMap[key].processNode.id === processId) {
      nodeId = key;
    }
  });

  return nodeId;
};

// 添加工作流节点
export const addFlowNode =
  (processId, args, callback = () => {}) =>
  (dispatch, getState) => {
    flowNode
      .add({
        processId,
        ...args,
      })
      .then(result => {
        const { workflowDetail } = _.cloneDeep(getState().workflow);

        if (workflowDetail.id !== processId) {
          const nodeId = getApprovalProcessNodeId(workflowDetail.flowNodeMap, processId);

          if (nodeId) {
            result.addFlowNodes.concat(result.updateFlowNodes).forEach(item => {
              workflowDetail.flowNodeMap[nodeId].processNode.flowNodeMap[item.id] = item;
            });
          }
        } else {
          result.addFlowNodes.concat(result.updateFlowNodes).forEach(item => {
            workflowDetail.flowNodeMap[item.id] = item;
          });
        }

        dispatch({
          type: 'ADD_FLOW_NODE',
          data: workflowDetail,
        });

        dispatch({
          type: 'UPDATE_PUBLISH_STATUS',
          publishStatus: 1,
        });

        callback(result.addFlowNodes[0].id);
      });
  };

// 删除工作流节点
export const deleteFlowNode = (processId, nodeId) => (dispatch, getState) => {
  flowNode
    .delete({
      nodeId,
      processId,
    })
    .then(result => {
      const { workflowDetail } = _.cloneDeep(getState().workflow);

      if (workflowDetail.id !== processId) {
        const nodeId = getApprovalProcessNodeId(workflowDetail.flowNodeMap, processId);

        if (nodeId) {
          // 删除节点数据
          result.deleteFlowNodes.forEach(item => {
            delete workflowDetail.flowNodeMap[nodeId].processNode.flowNodeMap[item.id];
          });

          // 更新老数据
          result.updateFlowNodes.forEach(item => {
            workflowDetail.flowNodeMap[nodeId].processNode.flowNodeMap[item.id] = item;
          });
        }
      } else {
        // 删除节点数据
        result.deleteFlowNodes.forEach(item => {
          delete workflowDetail.flowNodeMap[item.id];
        });

        // 更新老数据
        result.updateFlowNodes.forEach(item => {
          workflowDetail.flowNodeMap[item.id] = item;
        });
      }

      dispatch({
        type: 'DELETE_FLOW_NODE',
        data: workflowDetail,
      });

      dispatch({
        type: 'UPDATE_PUBLISH_STATUS',
        publishStatus: 1,
      });
    });
};

// 修改工作流节点的名称
export const updateFlowNodeName = (processId, nodeId, name) => (dispatch, getState) => {
  flowNode
    .updateFlowNodeName({
      nodeId,
      processId,
      name,
    })
    .then(result => {
      const { workflowDetail } = _.cloneDeep(getState().workflow);

      if (workflowDetail.id !== processId) {
        const approvalNodeId = getApprovalProcessNodeId(workflowDetail.flowNodeMap, processId);

        workflowDetail.flowNodeMap[approvalNodeId].processNode.flowNodeMap[nodeId].name = name;
      } else {
        workflowDetail.flowNodeMap[nodeId].name = name;
      }

      dispatch({
        type: 'UPDATE_FLOW_NODE_NAME',
        data: workflowDetail,
      });

      dispatch({
        type: 'UPDATE_PUBLISH_STATUS',
        publishStatus: 1,
      });
    });
};

// 更新单个节点数据
export const updateNodeData = (processId, data) => (dispatch, getState) => {
  const { workflowDetail } = _.cloneDeep(getState().workflow);

  if (workflowDetail.id !== processId) {
    const approvalNodeId = getApprovalProcessNodeId(workflowDetail.flowNodeMap, processId);

    workflowDetail.flowNodeMap[approvalNodeId].processNode.flowNodeMap[data.id] = data;
  } else {
    workflowDetail.flowNodeMap[data.id] = data;
  }

  dispatch({
    type: 'UPDATE_NODE_DATA',
    data: workflowDetail,
  });

  dispatch({
    type: 'UPDATE_PUBLISH_STATUS',
    publishStatus: 1,
  });
};

// 更新单个节点说明
export const updateNodeDesc = (processId, id, alias, desc) => (dispatch, getState) => {
  const { workflowDetail } = _.cloneDeep(getState().workflow);

  if (workflowDetail.id !== processId) {
    const approvalNodeId = getApprovalProcessNodeId(workflowDetail.flowNodeMap, processId);

    workflowDetail.flowNodeMap[approvalNodeId].processNode.flowNodeMap[id].alias = alias;
    workflowDetail.flowNodeMap[approvalNodeId].processNode.flowNodeMap[id].desc = desc;
  } else {
    workflowDetail.flowNodeMap[id].alias = alias;
    workflowDetail.flowNodeMap[id].desc = desc;
  }

  dispatch({
    type: 'UPDATE_NODE_DATA',
    data: workflowDetail,
  });

  dispatch({
    type: 'UPDATE_PUBLISH_STATUS',
    publishStatus: 1,
  });
};

/**
 * 更新分支节点类型
 */
export const updateBranchGatewayType = (processId, nodeId, gatewayType) => (dispatch, getState) => {
  flowNode
    .saveNode({
      nodeId,
      processId,
      gatewayType,
    })
    .then(result => {
      const { workflowDetail } = _.cloneDeep(getState().workflow);

      if (workflowDetail.id !== processId) {
        const approvalNodeId = getApprovalProcessNodeId(workflowDetail.flowNodeMap, processId);

        workflowDetail.flowNodeMap[approvalNodeId].processNode.flowNodeMap[nodeId].gatewayType = gatewayType;
      } else {
        workflowDetail.flowNodeMap[nodeId].gatewayType = gatewayType;
      }

      dispatch({
        type: 'UPDATE_NODE_GATEWAY',
        data: workflowDetail,
      });

      dispatch({
        type: 'UPDATE_PUBLISH_STATUS',
        publishStatus: 1,
      });
    });
};

/**
 * 调整分支顺序
 */
export const updateBranchSort = (processId, nodeId, flowIds) => (dispatch, getState) => {
  flowNode
    .saveNode({
      nodeId,
      processId,
      flowIds,
    })
    .then(result => {
      const { workflowDetail } = _.cloneDeep(getState().workflow);

      if (workflowDetail.id !== processId) {
        const approvalNodeId = getApprovalProcessNodeId(workflowDetail.flowNodeMap, processId);
        workflowDetail.flowNodeMap[approvalNodeId].processNode.flowNodeMap[nodeId].flowIds = flowIds;
      } else {
        workflowDetail.flowNodeMap[nodeId].flowIds = flowIds;
      }

      dispatch({
        type: 'UPDATE_BRANCH_SORT',
        data: workflowDetail,
      });

      dispatch({
        type: 'UPDATE_PUBLISH_STATUS',
        publishStatus: 1,
      });
    });
};
