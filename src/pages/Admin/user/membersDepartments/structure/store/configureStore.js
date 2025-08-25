import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import api from '../middleware/api';
import reducer from '../reducers';

const configureStore = preloadState => {
  const finalCreateStore = compose(applyMiddleware(thunk, api))(createStore);
  const store = finalCreateStore(
    reducer,
    preloadState,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  );

  return store;
};

export default configureStore;
