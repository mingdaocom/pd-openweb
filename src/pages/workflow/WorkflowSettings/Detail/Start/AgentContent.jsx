import React, { Fragment } from 'react';

export default ({ data }) => {
  return (
    <Fragment>
      <div className="flowDetailStartHeader flexColumn BGBlue">
        <div className="flowDetailStartIcon flexRow">
          <i className="icon-chat-full Font40 gray" />
        </div>
        <div className="Font16 mTop10">{_l('对话触发')}</div>
      </div>
      <div className="workflowDetailBox mTop20">
        <div className="Gray_75">
          {_l(
            '对话触发后，系统将依序执行工作流中各节点。所有 AI Agent 节点的输出内容作为本轮对话的回复，依序展示给用户',
          )}
        </div>
        <div className="ellipsis mTop15">
          {_l('名称')}
          <span className="mLeft10 bold">{data.appName}</span>
        </div>
      </div>
    </Fragment>
  );
};
