import React, { Fragment, Component } from 'react';
import instance from 'src/pages/workflow/api/instanceVersion';
import { Icon, Tooltip } from 'ming-ui';
import store from 'redux/configureStore';
import cx from 'classnames';
import './index.less';

let request = null;

export const getTodoCount = () => {
  return new Promise((resolve, reject) => {
    if (request && request.state() === 'pending') {
      request.abort();
    }
    request = instance.getTodoCount();
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
    const count = countData ? (countData.myProcessCount > 99 ? '99+' : countData.myProcessCount) : 0;
    const isNative = type === 'native';
    const { iconColor } = store.getState().appPkg;
    if (_.isFunction(renderContent)) {
      return renderContent(count);
    }
    return type ? (
      <Tooltip text={<span>{_l('流程待办')}</span>}>
        <div
          className={`myProcessHeader pointer mLeft10 ${isNative ? 'Gray_75' : 'White'} ${className}`}
          onClick={onClick}
        >
          <Icon icon={cx('knowledge_file', { appIcon: !isNative })} className="mRight5 Font20" />
          {count ? (
            <span className={`count ${isNative ? 'native' : 'app'}`} style={{ color: isNative ? '' : iconColor }}>
              {count}
            </span>
          ) : null}
        </div>
      </Tooltip>
    ) : (
      <ul className="mTop10">
        <li className="myProcess" onClick={onClick}>
          <Icon icon="knowledge_file" />
          <span className="Gray_75 bold">{_l('流程待办')}</span>
          {count ? <span className="count">{count}</span> : null}
        </li>
      </ul>
    );
  }
}
