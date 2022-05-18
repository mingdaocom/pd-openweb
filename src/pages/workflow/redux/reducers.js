import { combineReducers } from 'redux';

const flowInfo = (state = {}, action) => {
  switch (action.type) {
    case 'GET_FLOW_INFO':
      return action.data;
    case 'UPDATE_PROCESS':
      return Object.assign({}, state, {
        name: action.data.name,
        groupId: action.data.groupId,
        explain: action.data.explain,
      });
    case 'UPDATE_PUBLIC_STATE':
      return Object.assign({}, state, action.obj);
    case 'UPDATE_PUBLISH_STATUS':
      return Object.assign({}, state, { publishStatus: action.publishStatus });
    case 'CLEAR_FLOW_SOURCE':
      return {};
    default:
      return state;
  }
};

const workflowDetail = (state = {}, action) => {
  switch (action.type) {
    case 'GET_PROCESS_INFO':
    case 'ADD_FLOW_NODE':
    case 'DELETE_FLOW_NODE':
    case 'UPDATE_NODE_DATA':
    case 'GO_BACK_UPDATE_SOURCE':
    case 'UPDATE_FLOW_NODE_NAME':
    case 'UPDATE_NODE_GATEWAY':
      return action.data;
    case 'CLEAR_SOURCE':
      return {};
    default:
      return state;
  }
};

export default combineReducers({
  flowInfo,
  workflowDetail,
});
