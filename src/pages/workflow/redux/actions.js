import flowNode from '../api/flowNode';
import process from '../api/process';

// 获取工作流基础信息
export const getFlowInfo = processId => (dispatch, getState) => {
  process
    .getProcessPublish({
      processId,
    })
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
    getProcessById(workflowDetail.id)(dispatch);
  }
};

// 获取工作流配置详情
export const getProcessById = processId => (dispatch, getState) => {
  flowNode
    .get({
      processId,
    })
    .then(result => {
      dispatch({
        type: 'GET_PROCESS_INFO',
        data: result,
      });
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

// 添加工作流节点
export const addFlowNode = (processId, args, callback = () => {}) => (dispatch, getState) => {
  flowNode
    .add({
      processId,
      ...args,
    })
    .then(result => {
      const { workflowDetail } = _.cloneDeep(getState().workflow);

      // 添加新数据
      result.addFlowNodes.forEach(item => {
        workflowDetail.flowNodeMap[item.id] = item;
      });

      // 更新老数据
      result.updateFlowNodes.forEach(item => {
        workflowDetail.flowNodeMap[item.id] = item;
      });

      dispatch({
        type: 'ADD_FLOW_NODE',
        data: workflowDetail,
      });

      dispatch({
        type: 'UPDATE_PUBLISH_STATUS',
        publishStatus: 1,
      });

      callback();
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

      // 删除节点数据
      result.deleteFlowNodes.forEach(item => {
        delete workflowDetail.flowNodeMap[item.id];
      });

      // 更新老数据
      result.updateFlowNodes.forEach(item => {
        workflowDetail.flowNodeMap[item.id] = item;
      });

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

      workflowDetail.flowNodeMap[nodeId].name = name;

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
export const updateNodeData = data => (dispatch, getState) => {
  const { workflowDetail } = _.cloneDeep(getState().workflow);

  workflowDetail.flowNodeMap[data.id] = data;

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
export const updateNodeDesc = (id, alias, desc) => (dispatch, getState) => {
  const { workflowDetail } = _.cloneDeep(getState().workflow);

  workflowDetail.flowNodeMap[id].alias = alias;
  workflowDetail.flowNodeMap[id].desc = desc;

  dispatch({
    type: 'UPDATE_NODE_DATA',
    data: workflowDetail,
  });

  dispatch({
    type: 'UPDATE_PUBLISH_STATUS',
    publishStatus: 1,
  });
};
