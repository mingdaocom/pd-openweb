import React, { Component } from 'react';
import { string } from 'prop-types';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import styled from 'styled-components';
import process from 'src/pages/workflow/api/process';
import { Dialog, ScrollView } from 'ming-ui';
import _ from 'lodash';

const STATUS_TEXT = {
  1: _l('执行成功'),
  2: _l('执行成功'),
  3: _l('执行失败'),
  4: _l('执行失败'),
};

const DialogTitle = styled.div`
  font-weight: bold;
  display: flex;
  align-items: center;
`;

const StatusWrap = styled.ul`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 16%;
  border-bottom: 1px solid #ddd;
  li {
    padding: 0 10px;
    font-size: 14px;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    line-height: 36px;
    &.active,
    &:hover {
      color: #2196f3;
      border-bottom-color: #2196f3;
    }
  }
`;
const WorkflowList = styled.ul`
  box-sizing: border-box;
  padding: 10px 0px;
  min-height: 400px;
  max-height: 500px;
  overflow-y: auto;
  li {
    line-height: 32px;
    padding: 0 16px;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    &:nth-child(2n) {
      background: #f0f0f0;
    }
    .success {
      color: #4caf50;
    }
    .failure,
    .btnDisabled {
      color: #f44336;
    }
  }
  .empty {
    margin-top: 130px;
    font-weight: bold;
    text-align: center;
    font-size: 14px;
    color: #bdbdbd;
  }
`;
const STATUS = [
  {
    id: 'success',
    text: _l('成功'),
    status: [1, 2],
  },
  { id: 'failure', text: _l('失败'), status: [3, 4] },
  { id: 'unFiltered', text: _l('按钮禁用') },
];

class WorkflowHistory extends Component {
  static propTypes = {};
  static defaultProps = {};
  state = {
    activeStatus: 'success',
    data: {},
  };
  componentDidMount() {
    const { storeId } = this.props;
    process.getStore({ storeId }).then(data => {
      const filtered = _.filter(data, item => !!item.checked);
      const unFiltered = _.filter(data, item => !item.checked);
      const success = _.filter(filtered, item => [1, 2].includes(item.status));
      const failure = _.filter(filtered, item => _.includes([3, 4], item.status));
      this.setState({ data: { success, failure, unFiltered } });
    });
  }
  switchStatus = id => {
    this.setState({ activeStatus: id });
  };
  render() {
    const { title, ...rest } = this.props;
    const { activeStatus, data } = this.state;
    return (
      <Dialog
        visible
        title={
          <DialogTitle>
            {_l('批量操作 “')}
            <div className="overflow_ellipsis" style={{ maxWidth: '240px' }}>{`${title}`}</div>
            {_l('” 执行完成')}
          </DialogTitle>
        }
        cancelText={null}
        okText={_l('关闭')}
        {...rest}>
        <StatusWrap>
          {STATUS.map(item => {
            const { id } = item;
            const list = data[id] || [];
            return (
              <li className={cx(id, { active: activeStatus === id })} onClick={() => this.switchStatus(id)}>
                {item.text}
                {<span>{`(${list.length})`}</span>}
              </li>
            );
          })}
        </StatusWrap>
        <WorkflowList>
          {_.isEmpty(data[activeStatus]) ? (
            <div className="empty">{_l('没有行记录')}</div>
          ) : (
            data[activeStatus].map(item => (
              <li key={item.instanceId} onClick={() => window.open(`/worksheet/${item.appId}/row/${item.sourceId}`)}>
                <div className="overflow_ellipsis">{item.title}</div>
                {_.includes(['success', 'failure'], activeStatus) ? (
                  <div className={cx(activeStatus)}>{STATUS_TEXT[item.status]}</div>
                ) : (
                  <div className="btnDisabled">{_l('按钮禁用')}</div>
                )}
              </li>
            ))
          )}
        </WorkflowList>
      </Dialog>
    );
  }
}

export default function workflowHistory(props) {
  const $container = document.createElement('div');
  document.body.appendChild($container);

  function handleClose() {
    setTimeout(() => {
      const res = ReactDOM.unmountComponentAtNode($container);
      if (res && $container.parentNode) {
        $container.parentNode.removeChild($container);
      }
      if (_.isFunction(props.onCancel)) {
        props.onCancel();
      }
    }, 0);
  }

  ReactDOM.render(<WorkflowHistory onCancel={handleClose} onOk={handleClose} {...props} />, $container);
  return handleClose;
}
