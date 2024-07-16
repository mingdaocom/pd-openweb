import React, { Fragment } from 'react';
import { ApprovalProcessSettings } from '../components';

export default props => {
  const { data } = props;

  return (
    <Fragment>
      <div className="flowDetailStartHeader flexColumn BGDarkBlue" style={{ height: 245 }}>
        <div className="flowDetailStartIcon flexRow" style={{ background: 'rgba(0, 0, 0, 0.24)' }}>
          <i className="icon-approval Font40 white" />
        </div>
        <div className="Font16 mTop10">{_l('发起审批流程')}</div>
        <div className="Font14 mTop10">{_l('对自动化工作流中的数据发起审批流程，实现业务自动化和人工审批的打通')}</div>
      </div>
      <div className="workflowDetailBox mTop20">
        <div className="Font13 bold">{_l('被以下工作流触发')}</div>
        <div className="Font13 mTop15 flexRow alignItemsCenter">
          <div className="ellipsis">
            {data.triggerName || <span style={{ color: '#f44336' }}>{_l('流程已删除')}</span>}
          </div>
          {data.triggerName && (
            <i
              className="mLeft5 icon-task-new-detail Font12 ThemeColor3 ThemeHoverColor2 pointer"
              onClick={() => window.open(`/workflowedit/${data.triggerId}`)}
            />
          )}
          <div className="flex" />
        </div>

        <div className="Font13 bold mTop20">{_l('发起审批的数据对象')}</div>
        <div className="workflowDetailDesc mTop10 subProcessDesc bold alignItemsCenter flexRow">
          <i className="icon-worksheet Gray_75 mRight8 Font16" />
          {_l('工作表“%0”', data.appName)}
        </div>

        <ApprovalProcessSettings {...props} />
      </div>
    </Fragment>
  );
};
