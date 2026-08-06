import React from 'react';
import styled, { keyframes } from 'styled-components';

// 复用全站骨架的扫光配色（--skeleton-* 已在 ming-ui Skeleton 的 less 中按明暗主题定义）
const shimmer = keyframes`
  from { background-position: 100% 50%; }
  to { background-position: 0 50%; }
`;

const Wrap = styled.div`
  max-width: 762px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Card = styled.div`
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 18px 20px;
  border: 1px solid var(--color-border-secondary);
  border-radius: 12px;
  background: var(--color-background-card);
`;

const Shimmer = styled.div`
  background: linear-gradient(90deg, var(--skeleton-start), var(--skeleton-middle), var(--skeleton-end));
  background-size: 400% 100%;
  animation: ${shimmer} 2s ease infinite;
`;

const Lead = styled(Shimmer)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const Lines = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Bar = styled(Shimmer)`
  height: 14px;
  border-radius: 8px;
  width: ${({ $w }) => $w || '100%'};
`;

export default function SkeletonPanel({ rows = 4 }) {
  return (
    <Wrap>
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i}>
          <Lead />
          <Lines>
            <Bar $w="40%" />
            <Bar $w="82%" />
          </Lines>
        </Card>
      ))}
    </Wrap>
  );
}
