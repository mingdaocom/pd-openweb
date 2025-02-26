import React from 'react';
import { createRoot } from 'react-dom/client';
import styled from 'styled-components';
import { getRequest } from 'src/util';
import { FlowChart } from 'src/pages/workflow/components/FlowChart';
import preall from 'src/common/preall';

const LayoutContent = styled.div`
  background-color: #f5f5f9;
  display: flex;
  .workflowEditRelease {
    height: 100%;
  }
`;

const { processId, instanceId, selectNodeId } = getRequest();

class MobileFlowChart extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <LayoutContent className="flowChartModal h100">
        <FlowChart processId={processId} instanceId={instanceId} selectNodeId={selectNodeId} />
      </LayoutContent>
    );
  }
}

const Comp = preall(MobileFlowChart, { allowNotLogin: false });
const root = createRoot(document.getElementById('app'));

root.render(<Comp />);
