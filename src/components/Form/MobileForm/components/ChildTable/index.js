import React from 'react';
import { connect, Provider } from 'react-redux';
import _, { isFunction } from 'lodash';
import DataFormat from 'src/components/newCustomFields/tools/DataFormat';
import ChildTable from './ChildTable';
import generateStore from './redux/store';
import './style.less';

const ChildTableComp = connect(state => ({
  baseLoading: state.baseLoading,
  base: state.base,
  rows: state.rows,
  lastAction: state.lastAction,
}))(props => {
  const { baseLoading } = props;
  if (baseLoading) {
    return (
      <div
        style={{
          minHeight: 74,
          background: '#f7f7f7',
        }}
      ></div>
    );
  }
  return <ChildTable {...props} />;
});
export default class extends React.Component {
  constructor(props) {
    super(props);
    const { worksheetId, recordId, masterData } = props;
    this.store =
      props.control.store ||
      generateStore(props.control, {
        initRowIsCreate: props.initRowIsCreate,
        relationWorksheetId: worksheetId,
        recordId,
        masterData,
        DataFormat,
      });
    this.store.init();
    this.bindSubscribe();
  }

  componentWillReceiveProps(nextProps) {
    const { onChange } = nextProps;
    if (nextProps.control.store && nextProps.control.store !== this.store) {
      this.store = nextProps.control.store;
      this.store.init();
      this.bindSubscribe();
    }
    const state = this.store.getState() || {};
    if (nextProps.from === 21 && !_.isEqual(this.props.flag, nextProps.flag) && !_.isEmpty(state.rows)) {
      // h5草稿箱已有子表值时编辑赋值
      onChange({
        rows: state.rows,
        lastAction: state.lastAction,
        originRows: state.originRows,
      });
    }
  }

  componentWillUnmount() {
    if (isFunction(this.unsubscribe)) {
      this.unsubscribe();
    }
  }

  bindSubscribe() {
    const { onChange = () => {} } = this.props;
    this.unsubscribe = this.store.subscribe(() => {
      const state = this.store.getState();
      const value = _.get(this.props, 'control.value');
      onChange(
        {
          rows: state.rows,
          lastAction: state.lastAction,
          originRows: state.originRows,
        },
        value,
      );
    });
  }

  render() {
    const { registerCell = () => {} } = this.props;
    return (
      <Provider store={this.store}>
        <ChildTableComp
          {...this.props}
          store={this.store}
          registerCell={ref => {
            registerCell(ref);
            this.store.ref = ref;
          }}
        />
      </Provider>
    );
  }
}
