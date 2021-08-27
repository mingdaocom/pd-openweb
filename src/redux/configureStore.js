import EventEmitter from 'events';
import thunkMiddleware from 'redux-thunk';
import { applyMiddleware, compose, createStore } from 'redux';
import { makeRootReducer } from './reducers';

function promiseMiddleware({ dispatch }) {
  return next => action => (action && action.then ? action.then(dispatch) : next(action));
}

function eventMiddleware(emitter) {
  return ({ dispatch }) => {
    return next => action => {
      next(action);
      emitter.emit(action.type, action);
    };
  };
}

const defaultState = {
  post: {
    fontSize: parseInt(window.localStorage.getItem(md.global.Account.accountId + '_fontsize') || 13, 10),
  },
  appPkg: {},
};

export function configureStore(initialState = defaultState) {
  const emitter = new EventEmitter();
  const middleware = [thunkMiddleware, promiseMiddleware, eventMiddleware(emitter)];

  const enhancers = [];
  if (process.env.NODE_ENV !== 'production') {
    const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;
    if (typeof devToolsExtension === 'function') {
      enhancers.push(devToolsExtension());
    }
  }

  const store = createStore(makeRootReducer(), initialState, compose(applyMiddleware(...middleware), ...enhancers));
  store.emitter = emitter;

  return store;
}

export default configureStore();
