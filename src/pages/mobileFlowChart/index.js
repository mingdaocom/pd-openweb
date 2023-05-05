import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { getRequest } from 'src/util';
import { FlowChart } from 'src/pages/workflow/components/FlowChart';
import preall from 'src/common/preall';

const LayoutContent = styled.div`
  background-color: #f5f5f9;
  display: flex;
`;

const { processId, instanceId } = getRequest();

class MobileFlowChart extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <LayoutContent className="flowChartModal h100">
        <FlowChart processId={processId} instanceId={instanceId} />
      </LayoutContent>
    );
  }
}

const Comp = preall(MobileFlowChart, { allownotlogin: false });

ReactDOM.render(<Comp />, document.querySelector('#mobileFlowChart'));
