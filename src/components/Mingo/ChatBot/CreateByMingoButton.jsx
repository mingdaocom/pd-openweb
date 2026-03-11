import React from 'react';
import styled from 'styled-components';

const Con = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  border: 1px solid var(--color-border-primary);
  border-radius: 34px;
  line-height: 34px;
  padding: 0 15px;
  color: var(--color-text-title);
  font-size: 14px;
  margin-top: 32px;
  .icon {
    font-size: 18px;
    color: var(--color-mingo);
  }
  &:hover {
    background: var(--color-background-hover);
  }
`;

export default function CreateByMingoButton({ className, children, onClick }) {
  return (
    <Con className={className} onClick={onClick}>
      <i className="icon icon-auto_awesome"></i>
      {children}
    </Con>
  );
}
