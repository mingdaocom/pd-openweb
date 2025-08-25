import React, { Component } from 'react';
import styled from 'styled-components';
import WorksheetRocordLog from 'src/pages/worksheet/components/WorksheetRecordLog/WorksheetRocordLog';

const LogsContent = styled.div`
  width: 100%;
  height: 100%;
  color: rgba(0, 0, 0, 0.85);
  background-color: #fafafa;
`;

class Logs extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { appId, worksheetId, rowId, originalData, refreshDiscussCount } = this.props;
    return (
      <LogsContent>
        <WorksheetRocordLog
          appId={appId}
          worksheetId={worksheetId}
          rowId={rowId}
          controls={originalData || []}
          refreshDiscussCount={refreshDiscussCount}
        />
      </LogsContent>
    );
  }
}

export default Logs;
