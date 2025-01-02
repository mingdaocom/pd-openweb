import React, { Component } from 'react';
import WorksheetRocordLog from 'src/pages/worksheet/components/WorksheetRecordLog/WorksheetRocordLog';
import styled from 'styled-components';

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
    const { worksheetId, rowId, originalData, refreshDiscussCount } = this.props;
    return (
      <LogsContent>
        <WorksheetRocordLog
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
