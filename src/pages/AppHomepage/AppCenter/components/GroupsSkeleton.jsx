import React from 'react';
import styled from 'styled-components';

const Con = styled.div``;

const Row = styled.div`
  display: flex;
  margin-bottom: 26px;
`;

const Cell = styled.div`
  ${({ width }) => (width ? `width: ${width}px;` : 'width: 100%;')}
  height: 17px;
  border-radius: 17px;
  background-color: #f5f5f5;
`;

export default function GroupsSkeleton(props) {
  const { repeat = 3 } = props;
  return [...new Array(repeat)].map((_, i) => (
    <Con>
      <Row>
        <Cell width={64} />
        <div className="flex"></div>
        <Cell width={17} />
      </Row>
      <Row>
        <Cell />
      </Row>
      <Row>
        <Cell />
      </Row>
    </Con>
  ));
}
