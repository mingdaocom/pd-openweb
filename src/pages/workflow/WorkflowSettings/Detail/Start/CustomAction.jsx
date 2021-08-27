import React, { Fragment } from 'react';
import { CUSTOM_ACTION_TEXT } from '../../enum';

export default ({ data }) => {
  return (
    <Fragment>
      <div className="flowDetailStartHeader flexColumn BGBlueAsh">
        <div className="flowDetailStartIcon flexRow">
          <i className="icon-custom_actions Font40 gray" />
        </div>
        <div className="Font16 mTop10">{_l('按钮触发')}</div>
      </div>
      <div className="workflowDetailBox mTop20">
        <div className="ellipsis">
          {_l('工作表')}
          <span className="mLeft10 bold">{data.appName}</span>
        </div>
        <div className="mTop20 bold">{_l('按钮')}</div>
        <div className="workflowDetailDesc mTop10" style={{ padding: '8px 16px', border: '1px solid #ddd' }}>
          <div>{data.triggerName}</div>
          <div className="ellipsis Gray_75">{CUSTOM_ACTION_TEXT[data.clickType]}</div>
        </div>
      </div>
    </Fragment>
  );
};
