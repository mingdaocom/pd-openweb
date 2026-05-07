import React, { useMemo } from 'react';
import Dropdown from '../../../Dropdown';
import { useCreateKnowledgeStore } from '../../index';
import { addSelectedWorksheet } from '../../store/actions';
import { useSheetList } from './useSheetList';

const SelectSheetDropdown = () => {
  const { state, dispatch } = useCreateKnowledgeStore();
  const { appId, selectedWorksheetList, activeScheme, allWorksheetList } = state;

  const { list } = useSheetList({
    appId,
    selectedWorksheetList,
    allWorksheetList,
    dispatch,
  });

  const disabled = useMemo(() => !activeScheme?.id, [activeScheme]);

  return (
    <Dropdown
      disabled={disabled}
      data={list}
      getKey={item => item.worksheetId}
      getLabel={item => item.worksheetName}
      onSelect={item => addSelectedWorksheet(dispatch, item)}
      triggerText={_l('工作表')}
      searchPlaceholder={_l('搜索工作表')}
      emptyText={_l('无可选工作表')}
    />
  );
};

export default SelectSheetDropdown;
