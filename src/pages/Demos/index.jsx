import React from 'react';
import styled from 'styled-components';
import RecordCard from 'src/pages/worksheet/components/RelateRecordCards/RecordCard';

const Con = styled.div`
  background: #fff;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
`;

const RecordsCon = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
`;

export default function Demo(props) {
  const records = [1, 2, 3, 4, 5];
  return (
    <Con>
      <RecordsCon>
        {records.map(record => (
          <RecordCard key={record.rowid} record={record} />
        ))}
      </RecordsCon>
    </Con>
  );
}
