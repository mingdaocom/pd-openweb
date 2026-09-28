import React from 'react';
import { Icon } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';
import { isDisabledKnowledge } from '../../../../../../core/utils';
import Dropdown from '../../../../../Dropdown';

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
      <Button type="primary" shape="round" disabled={disabled} icon={<Icon icon="plus" />}>
        {_l('工作表')}
      </Button>
    </Dropdown>
  );
};

export default AddWorksheet;
