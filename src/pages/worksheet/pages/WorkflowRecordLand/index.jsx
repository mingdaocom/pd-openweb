import React, { lazy, Suspense } from 'react';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';

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
    background-color: var(--color-background-primary);
  }
`;
const LoadableExecDialog = lazy(() => import('src/pages/workflow/components/ExecDialog'));

export default function WorkflowRecordLand(props) {
  const { id, workId } = props.match.params;
  return (
    <Con>
      <Suspense fallback={<LoadDiv className="mTop10" />}>
        <LoadableExecDialog
          isLand
          id={id}
          workId={workId}
          onClose={isError => {
            if (isError) {
              return;
            }

            setTimeout(() => {
              location.reload();
            }, 1000);
          }}
        />
      </Suspense>
    </Con>
  );
}
