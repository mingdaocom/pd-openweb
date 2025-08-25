import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { openAddRecord } from 'mobile/Record/addRecord';
import { getFirstGroupDefaultValue, getSecondGroupDefaultValue } from 'worksheet/views/BoardView/util';
import { handlePushState } from 'src/utils/project';

const AddBtnWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 36px;
  background-color: var(--color-third);
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.16);
  border-radius: 3px;

  .icon {
    font-size: 28px;
    color: var(--color-primary);
  }
`;

const AddRecordBtn = props => {
  const {
    className,
    appId,
    view,
    worksheetInfo,
    sheetSwitchPermit,
    secondGroupControl,
    boardData,
    itemFirstGroup,
    secondGroupControlId,
    secondGroupOpt,
    addBoardViewRecord,
    viewData,
  } = props;
  const { viewControl } = view;

  const handleClick = () => {
    if (window.isMingDaoApp && window.APP_OPEN_NEW_PAGE) {
      window.location.href = `/mobile/addRecord/${appId}/${worksheetInfo.worksheetId}/${view.viewId}`;
      return;
    }
    if (window.isMingDaoApp) {
      handlePushState('page', 'newRecord');
    }

    const firstGroupValue = getFirstGroupDefaultValue(itemFirstGroup, boardData);
    const secondGroupValue = secondGroupControl ? getSecondGroupDefaultValue(secondGroupControl, secondGroupOpt) : '';
    const defaultFormData = {
      ...(firstGroupValue === '-1' || !firstGroupValue ? {} : { [viewControl]: firstGroupValue }),
      ...(secondGroupValue === '-1' || !secondGroupValue ? {} : { [secondGroupControlId]: secondGroupValue }),
    };

    openAddRecord({
      className: 'full',
      worksheetInfo,
      appId: appId,
      worksheetId: worksheetInfo.worksheetId,
      viewId: view.viewId,
      addType: 2,
      entityName: worksheetInfo.entityName,
      defaultFormData,
      defaultFormDataEditable: false,
      // openRecord: this.sheetViewOpenRecord,
      onAdd: record => {
        if (_.isEmpty(record)) {
          return;
        }
        let key = itemFirstGroup.key;
        // 一级分组为-1时，表示未指定，新增的数据要重新判断在哪个一级分组下
        if (key === '-1') {
          const firstGroupKeys = viewData.map(group => group.key);
          key = firstGroupKeys.find(item => item !== '-1' && record[viewControl].includes(item)) ?? '-1';
        }

        addBoardViewRecord({ item: record, key });
      },
      showDraftsEntry: true,
      sheetSwitchPermit,
    });
  };

  return (
    <AddBtnWrap className={className} onClick={handleClick}>
      <i className="icon icon-add"></i>
    </AddBtnWrap>
  );
};

export default AddRecordBtn;
