import thunkMiddleware from 'redux-thunk';
import { applyMiddleware, compose, createStore } from 'redux';
import { makeRootReducer } from './reducers';

export function configureStore() {
  const enhancers = [];
  if (process.env.NODE_ENV !== 'production') {
    const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;
    if (typeof devToolsExtension === 'function') {
      enhancers.push(devToolsExtension());
    }
  }
  const store = createStore(makeRootReducer(), compose(applyMiddleware(thunkMiddleware), ...enhancers));
  return store;
}

export default configureStore();
