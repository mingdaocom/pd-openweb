import React from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { isDisabledKnowledge } from '../../../../../../core/utils';
import Dropdown from '../../../../../Dropdown';

const AddWorksheetBtn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  min-width: 88px;
  height: 36px;
  border-radius: 36px;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-inverse);
  background: var(--color-primary);
  cursor: pointer;
  &:hover {
    background: var(--color-primary-dark);
  }
  .icon {
    margin-right: 4px;
  }
  ${props =>
    props.disabled &&
    `pointer-events: none;
    background: var(--color-background-disabled);
    color: var(--color-text-disabled);
    cursor: not-allowed;
    `}
`;

const AddWorksheet = props => {
  const { availableList, onSelect, disabled, projectId } = props;

  const abortVisibleChange = () => {
    if (isDisabledKnowledge(projectId)) return true;

    return false;
  };

  return (
    <Dropdown
      disabled={disabled}
      data={availableList}
      immediateClose
      getKey={item => item.worksheetId}
      getLabel={item => item.worksheetName}
      onSelect={onSelect}
      triggerText={_l('工作表')}
      searchPlaceholder={_l('搜索工作表')}
      emptyText={_l('无可选工作表')}
      abortVisibleChange={abortVisibleChange}
    >
      <AddWorksheetBtn disabled={disabled}>
        <Icon icon="plus" />
        {_l('工作表')}
      </AddWorksheetBtn>
    </Dropdown>
  );
};

export default AddWorksheet;
