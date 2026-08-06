import React from 'react';
import { connect, Provider } from 'react-redux';
import _, { isFunction } from 'lodash';
import DataFormat from 'src/components/Form/core/DataFormat';
import generateStore from 'src/pages/worksheet/components/ChildTable/redux/store';
import ChildTable from './ChildTable';
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
          background: 'var(--color-background-secondary)',
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

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      const { onChange } = this.props;

      if (this.props.control.store && this.props.control.store !== this.store) {
        this.store = this.props.control.store;
        this.store.init();
        this.bindSubscribe();
      }

      const state = this.store.getState() || {};

      if (this.props.from === 21 && !_.isEqual(prevProps.flag, this.props.flag) && !_.isEmpty(state.rows)) {
        // h5草稿箱已有子表值时编辑赋值
        onChange({
          rows: state.rows,
          lastAction: state.lastAction,
          originRows: state.originRows,
        });
      }
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

      if (_.get(state, 'lastAction.type') === 'LOAD_ROWS_COMPLETE') {
        this.store.waitListForLoadRows.forEach(fn => fn());
        this.store.waitListForLoadRows = [];
        return;
      }

      // realCount 仅为内部统计（未筛选真实总数），rows 未变，不构成数据变更，
      // 不向大表单上报，否则会被当成子表变更误触发记录详情进入编辑态。
      if (_.get(state, 'lastAction.type') === 'SET_REAL_COUNT') {
        return;
      }

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
