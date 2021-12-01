import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import ChildTable from './ChildTable';
import reducer from './redux/reducer';
import './style.less';
export default class extends React.Component {
  constructor(props) {
    super(props);
    this.store = createStore(reducer, compose(applyMiddleware(thunk)));
    this.bindSubscribe();
  }

  bindSubscribe() {
    const { onChange } = this.props;
    this.store.subscribe(() => {
      const state = this.store.getState();
      onChange({
        rows: state.rows,
        lastAction: state.lastAction,
        originRows: state.originRows,
      });
    });
  }

  render() {
    return (
      <Provider store={this.store}>
        <ChildTable {...this.props} />
      </Provider>
    );
  }
}
