import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const SchemeSkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px;
  width: 200px;
  height: 140px;
  border: 1px solid var(--color-border-tertiary);
  background-color: var(--color-background-primary);
  border-radius: 6px;

  div {
    border-radius: 3px;

    background: linear-gradient(
      90deg,
      var(--color-background-tertiary) 25%,
      var(--color-background-secondary) 37%,
      var(--color-background-tertiary) 63%
    );
    background-size: 400% 100%;
    animation: ${shimmer} 2s linear infinite;
  }

  .skeleton-title,
  .skeleton-footer {
    width: 130px;
    height: 20px;
  }

  .skeleton-desc {
    width: 100%;
    height: 55px;
  }
`;

const SchemeSkeleton = () => {
  return (
    <SchemeSkeletonWrapper>
      <div className="skeleton-title" />
      <div className="skeleton-desc" />
      <div className="skeleton-footer" />
    </SchemeSkeletonWrapper>
  );
};

export default SchemeSkeleton;
