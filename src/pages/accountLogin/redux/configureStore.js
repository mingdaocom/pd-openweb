import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import reducer from './reducer';

export function configureStore() {
  const store = createStore(reducer, compose(applyMiddleware(thunk)));
  return store;
}

export default configureStore();
