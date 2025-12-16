import React from 'react';
import styled from 'styled-components';
import LoadingDots from 'src/pages/widgetConfig/widgetSetting/components/DevelopWithAI/ChatBot/LoadingDots';
import { STEP_STATUS } from './index';

const Con = styled.div`
  font-size: 14px;
  color: #757575;
  .loading-step:not(:first-child) {
    margin-top: 6px;
  }
`;

export function getStepStatusText(stepStatus) {
  switch (stepStatus) {
    case STEP_STATUS.GET_WORKSHEET_NAME_AND_ICON:
      return _l('获取工作表图标');
    case STEP_STATUS.CREATING_WORKSHEET:
      return _l('创建工作表');
    case STEP_STATUS.CREATING_WORKSHEET_WIDGETS:
      return _l('生成表单字段');
  }
  return;
}

export default function LoadingWithSteps({ stepStatus }) {
  return (
    <Con className="t-flex t-flex-col">
      {[STEP_STATUS.GET_WORKSHEET_NAME_AND_ICON, STEP_STATUS.CREATING_WORKSHEET, STEP_STATUS.CREATING_WORKSHEET_WIDGETS]
        .slice(0, stepStatus + 1)
        .map(status => (
          <div className="loading-step t-flex t-items-center" key={stepStatus}>
            {status === stepStatus ? (
              <LoadingDots dotNumber={3} />
            ) : (
              <i className="icon icon-ok Font18" style={{ color: '#4CAF50' }} />
            )}
            <div className="mLeft5">{getStepStatusText(status)}</div>
          </div>
        ))}
    </Con>
  );
}
