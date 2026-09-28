import React from 'react';
import styled from 'styled-components';

const Content = styled.div`
  min-width: 0;
`;

const Description = styled.div`
  margin-bottom: 12px;
  color: var(--color-text-tertiary);
  font-size: 13px;
`;

const RecordList = styled.div`
  max-height: ${({ $mobile }) => ($mobile ? 'none' : '480px')};
  overflow-y: ${({ $mobile }) => ($mobile ? 'visible' : 'auto')};
`;

const RecordItem = styled.div`
  height: 48px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--color-border-secondary);
  color: var(--color-text-primary);
  font-size: 15px;

  &:last-child {
    border-bottom: none;
  }
`;

const RecordName = styled.div`
  min-width: 0;
  flex: 1;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export default function BatchPrintErrorContent({ recordNames, mobile = false }) {
  return (
    <Content>
      <Description>
        <span className="Bold">{recordNames.length}</span> {_l('条记录因已达打印上限，未加入本次打印任务。')}
      </Description>
      <RecordList $mobile={mobile}>
        {recordNames.map((name, index) => (
          <RecordItem key={index}>
            <RecordName title={name}>{name}</RecordName>
          </RecordItem>
        ))}
      </RecordList>
    </Content>
  );
}
