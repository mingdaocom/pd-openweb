import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';

const Con = styled.div`
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #f7f8f9;
  margin-bottom: 10px;
`;

const ResultConfirmButton = styled.div`
  background: var(--ai-primary-color);
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
  border-radius: 18px;
  color: #fff;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  &.disabled {
    color: #151515;
    background: #fff;
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
