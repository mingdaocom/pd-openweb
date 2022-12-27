import React, { Component } from 'react';
import styled from 'styled-components';
import StepItem from 'src/pages/workflow/components/ExecDialog/StepItem';

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
    const { works, currentWork, currentWorkItem } = instance;
    return (
      <Wrap className="stepList">
        <div className="pTop20 Font17 bold">{_l('流程进度')}</div>
        {works.map((item, index) => {
          return (
            <StepItem
              key={index}
              data={item}
              currentWork={currentWork}
              currentType={(currentWorkItem || {}).type}
              worksheetId={worksheetId}
              rowId={recordId}
            />
          );
        })}
      </Wrap>
    );
  }
}

export default WorkflowStepItem;
