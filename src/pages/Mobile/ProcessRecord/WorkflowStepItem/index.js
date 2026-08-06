import React, { Component, lazy, Suspense } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import Steps from 'src/pages/workflow/components/ExecDialog/Steps';

const MobileFlowChart = lazy(() =>
  import('src/pages/workflow/components/FlowChart').then(module => ({ default: module.MobileFlowChart })),
);

const Wrap = styled.ul`
  padding: 0 17px 50px;
  background-color: var(--color-background-secondary);
`;

class WorkflowStepItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }
  render() {
    const { visible } = this.state;
    const { appId, instance, worksheetId, recordId, controls = [], hideStep = false } = this.props;
    const { works, currentWork, currentWorkItem, processId, status, isApproval } = instance;
    return (
      <Wrap className="stepList">
        <div className="pTop20 flexRow valignWrapper">
          <div className="Font17 bold flex">{_l('流程进度')}</div>
          {isApproval && !hideStep && (
            <div className="flexRow alignItemsCenter textTertiary" onClick={() => this.setState({ visible: true })}>
              <Icon className="Font16 mRight5" icon="department" />
              <div className="bold">{_l('流转图')}</div>
            </div>
          )}
        </div>
        <Steps
          appId={appId}
          worksheetId={worksheetId}
          rowId={recordId}
          currentWork={currentWork}
          currentType={(currentWorkItem || {}).type}
          controls={controls}
          works={works}
          status={status}
        />
        {visible && (
          <Suspense fallback={null}>
            <MobileFlowChart
              appId={appId}
              processId={processId}
              instanceId={currentWork.instanceId}
              onClose={() => this.setState({ visible: false })}
            />
          </Suspense>
        )}
      </Wrap>
    );
  }
}

export default WorkflowStepItem;
