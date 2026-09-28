import React from 'react';
import { connect, Provider } from 'react-redux';
import { get, isFunction } from 'lodash';
import DataFormat from 'src/components/Form/core/DataFormat';
import { useSelectRecords } from 'src/components/SelectRecords';
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
  const { open: openSelectRecords, holder: selectRecordsHolder } = useSelectRecords();

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

  return (
    <React.Fragment>
      {selectRecordsHolder}
      <ChildTable {...props} openSelectRecords={openSelectRecords} />
    </React.Fragment>
  );
});
export default class extends React.Component {
  constructor(props) {
    super(props);
    const { appId, worksheetId, recordId, masterData } = props;
    this.store =
      props.control.store ||
      generateStore(props.control, {
        appId,
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
      if (this.props.control.store && this.props.control.store !== this.store) {
        this.store = this.props.control.store;
        this.store.init();
        this.bindSubscribe();
      }
    }
  }

  componentWillUnmount() {
    if (isFunction(get(this, 'props.control.setLoadingInfo'))) {
      this.props.control.setLoadingInfo('loadRows_' + this.props.control.controlId, false);
    }

    if (isFunction(this.unsubscribe)) {
      this.unsubscribe();
    }
  }

  bindSubscribe() {
    const { onChange } = this.props;
    this.unsubscribe = this.store.subscribe(() => {
      const state = this.store.getState();

      if (get(state, 'lastAction.type') === 'LOAD_ROWS_COMPLETE') {
        this.store.waitListForLoadRows.forEach(fn => fn());
        this.store.waitListForLoadRows = [];
        return;
      }

      // realCount 仅为内部统计（未筛选真实总数），rows 未变，不构成数据变更，
      // 不向大表单上报，否则会被当成子表变更误触发记录详情进入编辑态。
      if (get(state, 'lastAction.type') === 'SET_REAL_COUNT') {
        return;
      }

      // 静默拖拽排序（查看已存记录时直接走接口持久化）不向大表单上报，避免记录被误触发进入编辑态。
      if (get(state, 'lastAction.type') === 'MOVE_ROW' && get(state, 'lastAction.silent')) {
        return;
      }

      onChange({
        rows: state.rows,
        lastAction: state.lastAction,
        originRows: state.originRows,
      });
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
