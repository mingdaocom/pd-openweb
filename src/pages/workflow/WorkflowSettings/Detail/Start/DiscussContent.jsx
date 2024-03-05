import React, { Fragment } from 'react';

export default ({ data }) => {
  return (
    <Fragment>
      <div className="flowDetailStartHeader flexColumn BGBlue">
        <div className="flowDetailStartIcon flexRow">
          <i className="icon-replyto Font40 blue" />
        </div>
        <div className="Font16 mTop10">{_l('讨论通知触发')}</div>
      </div>
      <div className="workflowDetailBox mTop20">
        <div className="ellipsis">
          {_l('应用')}
          <span className="mLeft10 bold">{data.apkName}</span>
        </div>
        <div className="mTop20 bold">{_l('讨论通知')}</div>
        <div className="workflowDetailDesc mTop10" style={{ padding: '8px 16px', border: '1px solid #ddd' }}>
          <div className="ellipsis Gray_75">{_l('当外部用户收到讨论通知时（被回复、被提到）触发')}</div>
        </div>
      </div>
    </Fragment>
  );
};
