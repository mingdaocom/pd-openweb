import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducer';

export default function createReportRelationStore(projectId) {
  return createStore(rootReducer, applyMiddleware(thunk.withExtraArgument({ projectId })));
}
