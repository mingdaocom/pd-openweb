import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducer';

export default createStore(rootReducer, applyMiddleware(thunk));
