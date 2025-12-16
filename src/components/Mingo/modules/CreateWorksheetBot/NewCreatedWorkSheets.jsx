import React, { useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';

const Con = styled.div`
  .createWorksheetTitle {
    margin-bottom: 10px;
  }
`;

const EditWorkSheetItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  border-radius: 6px;
  border: 1px solid var(--color-border-secondary);
  padding: 10px;
  cursor: pointer;
  margin-bottom: 8px;
  .name {
    font-size: 14px;
    color: #151515;
    line-clamp: 1;
  }
  .description {
    font-size: 13px;
    color: var(--color-text-tertiary);
    line-clamp: 2;
  }
  &.disabled {
    cursor: not-allowed;
    color: var(--color-text-disabled);
    background: var(--color-background-disabled);
  }
  &:not(.disabled):hover {
    border-color: var(--color-border-hover);
    background: var(--color-background-hover);
  }
`;
export default function NewCreatedWorkSheets({ relateControls = [], onEditWorkSheet = () => {} }) {
  const [disabledIdsMap, setDisabledIdsMap] = useState({});
  return (
    <Con>
      <div
        className="createWorksheetTitle"
        dangerouslySetInnerHTML={{
          __html: _l(
            '已新建关联表 <b>%0</b>。点击开始为您继续生成关联表字段。',
            relateControls.map(item => item.worksheetName).join('、'),
          ),
        }}
      />
      {relateControls.map((item, i) => (
        <EditWorkSheetItem
          onClick={() => {
            if (disabledIdsMap[item.controlId]) return;
            onEditWorkSheet({
              worksheetId: item.dataSource,
              worksheetName: item.worksheetName,
              worksheetDescription: item.hint,
            });
            setDisabledIdsMap(prev => ({ ...prev, [item.controlId]: true }));
          }}
          className={cx({ disabled: disabledIdsMap[item.controlId] })}
          key={i}
        >
          <div
            className="name"
            dangerouslySetInnerHTML={{
              __html: _l('生成 <b>%0</b> 表字段', item.worksheetName),
            }}
          />
          <div className="description">{item.worksheetDescription}</div>
        </EditWorkSheetItem>
      ))}
    </Con>
  );
}
