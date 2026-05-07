import React from 'react';
import styled from 'styled-components';
import { Checkbox } from 'ming-ui';

export const AddButton = styled.div`
  height: 36px;
  line-height: 34px;
  width: 100%;
  text-align: center;
  background: var(--color-mingo);
  border-radius: 36px;
  font-size: 14px;
  color: var(--color-white);
  cursor: pointer;
  font-weight: bold;
  &.secondary {
    background: transparent;
    color: var(--color-text-title);
    border: 1px solid var(--color-border-primary);
    &:hover {
      background: var(--color-background-hover);
    }
  }
  &.disabled {
    background: var(--color-background-secondary);
    color: var(--color-text-disabled);
    cursor: not-allowed;
    &.secondary {
      border-color: var(--color-background-secondary);
    }
  }
`;

const Con = styled.div`
  font-size: 15px;
  margin-top: 8px;
  .generate-card {
    margin-top: 8px;
    border-radius: 8px;
    border: 1px solid var(--color-border-primary);
    padding: 16px 14px 14px;
    background-color: var(--color-background-primary);
  }
  .generate-data-btn {
    margin-top: 16px;
    color: var(--color-mingo);
  }
`;

const AiCheckbox = styled(Checkbox)`
  &.checked .Checkbox-box {
    background-color: var(--color-mingo) !important;
  }
  &.Checkbox--disabled .Checkbox-box {
    border-color: var(--color-border-primary) !important;
  }
  &.Checkbox--disabled.checked .Checkbox-box {
    border-color: var(--color-border-primary) !important;
  }
`;

export function ConfigPanel({ config, checkboxTextPosition = 'right', onConfigChange, disabled = false }) {
  const { includeAppName, includeAppIcon } = config;
  return (
    <div>
      <AiCheckbox
        textPosition={checkboxTextPosition}
        text={_l('名称')}
        checked={includeAppName}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          onConfigChange({
            ...config,
            includeAppName: includeAppName && !includeAppIcon ? true : !includeAppName,
          });
        }}
      />
      <AiCheckbox
        className="mTop15"
        textPosition={checkboxTextPosition}
        text={_l('图标')}
        checked={includeAppIcon}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          onConfigChange({
            ...config,
            includeAppIcon: includeAppIcon && !includeAppName ? true : !includeAppIcon,
          });
        }}
      />
    </div>
  );
}

export default function Recommend({ config, onGenerate = () => {}, onConfigChange = () => {}, disabled = false }) {
  const btnText = (() => {
    if (config.includeAppName && config.includeAppIcon) return _l('优化名称、图标');
    if (config.includeAppName) return _l('优化名称');
    if (config.includeAppIcon) return _l('优化图标');
    return _l('开始优化');
  })();
  return (
    <Con className="t-flex t-flex-col">
      <div>{_l('我根据当前应用信息，智能优化名称、图标。如果您对优化内容有具体要求也可以告诉我。')}</div>
      <div className="generate-card">
        <ConfigPanel config={config} onConfigChange={onConfigChange} disabled={disabled} />
        <AddButton className="generate-data-btn secondary" onClick={() => onGenerate(btnText)}>
          {_l('开始优化')}
        </AddButton>
      </div>
    </Con>
  );
}
