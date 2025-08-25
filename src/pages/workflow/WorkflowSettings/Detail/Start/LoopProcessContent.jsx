import React, { Fragment } from 'react';
import { ACTION_ID } from '../../enum';
import { LoopProcessParameters } from '../components';

export default props => {
  const { data } = props;

  return (
    <Fragment>
      <div className="flowDetailStartHeader flexColumn BGBlueAsh" style={{ height: 245 }}>
        <div className="flowDetailStartIcon flexRow" style={{ background: 'rgba(0, 0, 0, 0.24)' }}>
          <i className="icon-arrow_loop Font40 white" />
        </div>
        <div className="Font16 mTop10">
          {data.triggerId
            ? data.triggerId === ACTION_ID.CONDITION_LOOP
              ? _l('满足条件时循环')
              : _l('循环指定次数')
            : _l('循环触发')}
        </div>
        {data.triggerId && (
          <div className="Font14 mTop10">
            {data.triggerId === ACTION_ID.CONDITION_LOOP
              ? _l('一直循环运行一段流程，并在参数达到退出条件后结束')
              : _l('按指定的起始值、结束值和步长值循环固定次数')}
          </div>
        )}
      </div>

      <div className="workflowDetailBox mTop20">
        <LoopProcessParameters {...props} isFirstNode />

        <div className="Font13 bold mTop30">{_l('在本组织下，正在被以下事件调用')}</div>
        {!data.processList.length && (
          <div className="Font12 Gray_75 workflowDetailDesc mTop10 subProcessDesc">{_l('未被任何流程或按钮调用')}</div>
        )}
        {data.processList.map((item, i) => {
          return (
            <div className="workflowDetailDesc mTop10 subProcessDesc" key={i}>
              <div className="Font13">
                <span
                  className="ThemeColor3 ThemeHoverColor2 pointer"
                  onClick={() => window.open(`/workflowedit/${item.processId}`)}
                >
                  {_l('工作流：') + item.processName}
                </span>
              </div>
              <div className="Font12">
                <span className="Gray_75">{_l('节点：')}</span>
                <span>{item.flowNodes.map(obj => `${obj.name}`).join('、')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Fragment>
  );
};
