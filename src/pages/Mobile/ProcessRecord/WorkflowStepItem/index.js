import React, { Component } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import Steps from 'src/pages/workflow/components/ExecDialog/Steps';
import { MobileFlowChart } from 'src/pages/workflow/components/FlowChart';

const Wrap = styled.ul`
  padding: 0 17px 50px;
  background-color: #f8f8f8;
`;

class WorkflowStepItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    }
  }
  render() {
    const { visible } = this.state;
    const { instance, worksheetId, recordId, controls = [] } = this.props;
    const { works, currentWork, currentWorkItem, processId, status, isApproval } = instance;
    return (
      <Wrap className="stepList">
        <div className="pTop20 flexRow valignWrapper">
          <div className="Font17 bold flex">{_l('流程进度')}</div>
          {isApproval && (
            <div className="flexRow alignItemsCenter Gray_9e" onClick={() => this.setState({ visible: true })}>
              <Icon className="Font16 mRight5" icon="department1" />
              <div className="bold">{_l('流转图')}</div>
            </div>
          )}
        </div>
        <Steps
          worksheetId={worksheetId}
          rowId={recordId}
          currentWork={currentWork}
          currentType={(currentWorkItem || {}).type}
          controls={controls}
          works={works}
          status={status}
        />
        {visible && (
          <MobileFlowChart
            processId={processId}
            instanceId={currentWork.instanceId}
            onClose={() => this.setState({ visible: false })}
          />
        )}
      </Wrap>
    );
  }
}

export default WorkflowStepItem;
