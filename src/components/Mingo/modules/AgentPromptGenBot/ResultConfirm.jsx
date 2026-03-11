import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';

const Con = styled.div`
  padding: 10px;
  border-radius: 6px;
  border: 1px solid var(--color-border-primary);
  background: var(--color-primary-transparent);
  margin-bottom: 10px;
`;

const ResultConfirmButton = styled.div`
  background: var(--color-mingo);
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
  border-radius: 18px;
  color: var(--color-white);
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  &.disabled {
    color: var(--color-text-title);
    background: var(--color-background-primary);
    font-weight: normal;
    cursor: not-allowed;
  }
`;

export default function ResultConfirm({ disabled, isStreaming, content, onUse = () => {} }) {
  let className = cx('result-confirm-button', {
    disabled,
  });
  return (
    <Con>
      {content}
      {!isStreaming && (
        <ResultConfirmButton
          className={className}
          onClick={() => {
            if (disabled) return;
            onUse(content);
          }}
        >
          {_l('使用')}
        </ResultConfirmButton>
      )}
    </Con>
  );
}
