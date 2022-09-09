import React from 'react';
import styled from 'styled-components';
import ExecDialog from 'src/pages/workflow/components/ExecDialog';

const Con = styled.div`
  position: relative;
  height: 100%;
  padding: 20px 32px;
  .workSheetRecordInfo {
    overflow: hidden;
    max-width: 1600px;
    margin: 0 auto;
    width: 100%;
    height: 100%;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    background-color: #fff;
  }
`;

export default function WorkflowRecordLand(props) {
  const { id, workId } = props.match.params;
  return (
    <Con>
      <ExecDialog isLand id={id} workId={workId} onClose={() => location.reload()} />
    </Con>
  );
}
