import React, { Component } from 'react';
import store from 'redux/configureStore';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import instance from 'src/pages/workflow/api/instanceVersion';
import './index.less';

let request = null;

export const getTodoCount = (params = {}) => {
  return new Promise(resolve => {
    if (request) {
      request.abort();
    }
    request = instance.getTodoCount(params);
    request.then(list => {
      const mySponsor = list[0]; // 我的发起
      const waitingWrite = list[3]; // 待填写
      const waitingApproval = list[4]; // 待审批
      const waitingExamine = list[5]; // 待查看

      const waitingDispose = waitingWrite + waitingApproval; // 待处理
      const myProcessCount = waitingDispose + waitingExamine; // 我的流程总数

      resolve({
        mySponsor,
        waitingWrite,
        waitingApproval,
        waitingExamine,
        waitingDispose,
        myProcessCount,
      });
    });
  });
};

export default class Entry extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    getTodoCount().then(countData => {
      this.props.updateCountData(countData);
    });
  }
  render() {
    const { countData, onClick, type, renderContent, className } = this.props;
    const count = countData ? (countData.waitingDispose > 99 ? '99+' : countData.waitingDispose) : 0;
    const { waitingExamine = 0 } = countData || {};
    const isNative = ['native', 'integration'].includes(type);
    const { iconColor } = store.getState().appPkg;
    if (_.isFunction(renderContent)) {
      return renderContent({ count, waitingExamine }, onClick);
    }
    return (
      <Tooltip title={_l('流程待办')}>
        <div
          className={`myProcessHeader pointer mRight10 ${isNative ? 'Gray_75' : 'White'} ${className}`}
          onClick={onClick}
        >
          <Icon icon={cx('task_alt', { appIcon: !isNative })} className="mRight5 Font20" />
          {!!count && (
            <span className={`count ${isNative ? 'native' : 'app'}`} style={{ color: isNative ? '' : iconColor }}>
              {count}
            </span>
          )}
          {!!waitingExamine && !count && <span className="weakCount"></span>}
        </div>
      </Tooltip>
    );
  }
}
