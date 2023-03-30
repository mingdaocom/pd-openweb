import React, { Component } from 'react';
import styled from 'styled-components';
import Steps from 'src/pages/workflow/components/ExecDialog/Steps';

const Wrap = styled.ul`
  padding: 0 17px 50px;
  background-color: #f8f8f8;
`;

class WorkflowStepItem extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { instance, worksheetId, recordId } = this.props;
    const { works, currentWork, currentWorkItem, status } = instance;
    return (
      <Wrap className="stepList">
        <div className="pTop20 Font17 bold">{_l('流程进度')}</div>
        <Steps
          worksheetId={worksheetId}
          rowId={recordId}
          currentWork={currentWork}
          currentType={(currentWorkItem || {}).type}
          works={works}
          status={status}
        />
      </Wrap>
    );
  }
}

export default WorkflowStepItem;
