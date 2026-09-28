import React from 'react';
import styled from 'styled-components';
import { Checkbox } from 'ming-ui/antd-components';
import { AddButton } from './WorksheetDataGenerator';

const CHECKBOX_STYLES = {
  left: {
    root: { display: 'flex', flexDirection: 'row-reverse', justifyContent: 'flex-end' },
    label: { paddingInlineStart: 0, paddingInlineEnd: 8 },
  },
  right: {
    root: { display: 'flex' },
    label: { paddingInlineEnd: 0 },
  },
};

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

export function ConfigPanel({ config, checkboxTextPosition = 'right', onConfigChange }) {
  const { includeSamplePeople, includeSampleAttachments } = config;
  return (
    <div>
      <Checkbox
        checked={includeSamplePeople}
        styles={CHECKBOX_STYLES[checkboxTextPosition]}
        onChange={event => onConfigChange({ ...config, includeSamplePeople: event.target.checked })}
      >
        {_l('包含示例人员')}
      </Checkbox>
      <Checkbox
        className="mTop15"
        checked={includeSampleAttachments}
        styles={CHECKBOX_STYLES[checkboxTextPosition]}
        onChange={event => onConfigChange({ ...config, includeSampleAttachments: event.target.checked })}
      >
        {_l('包含示例附件')}
      </Checkbox>
    </div>
  );
}

export default function Recommend({ config, onSelect = () => {}, onConfigChange = () => {} }) {
  return (
    <Con className="t-flex t-flex-col">
      <div>
        {_l('我可以为您的工作表添加一些示例数据，方便你进行数据测试。如果您对添加的数据有具体要求也可以告诉我。')}
      </div>
      <div className="generate-card">
        <ConfigPanel config={config} onConfigChange={onConfigChange} />
        <AddButton className="generate-data-btn secondary" onClick={() => onSelect(_l('生成'))}>
          {_l('立即生成')}
        </AddButton>
      </div>
    </Con>
  );
}
