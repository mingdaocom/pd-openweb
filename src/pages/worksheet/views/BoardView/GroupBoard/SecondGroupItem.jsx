import React, { useState } from 'react';
import { useDrop } from 'react-dnd-latest';
import _ from 'lodash';
import NewRecord from 'worksheet/common/newRecord/NewRecord';
import { AddRecord } from '../components';
import RecordItem from '../components/RecordItem';
import { ITEM_TYPE } from '../config';
import { getFirstGroupDefaultValue, getSecondGroupDefaultValue, isShowAddRecord } from '../util';
import { parseGroupsByOptions } from './core/util';

const SecondGroupItem = props => {
  const {
    items,
    list,
    control,
    groupOptions,
    mapRowKey,
    view,
    boardData,
    worksheetInfo,
    viewControl,
    selectControl,
    sheetSwitchPermit,
    updateTitleData,
    sheetButtons,
    addRecord,
    fieldShowCount,
    secondGroupControlId,
    secondGroupOpt,
    viewData,
    allowOperation,
    currentGroupKey,
    ...rest
  } = props;
  const [createRecordVisible, setCreateRecordVisible] = useState(false);
  const [groupDefaultValue, setGroupDefaultValue] = useState({
    firstGroupValue: '',
    secondGroupValue: '',
  });
  const [curList, setCurList] = useState({});
  const [{ isOver, dragItem }, drop] = useDrop({
    accept: ITEM_TYPE.RECORD,
    drop() {
      return { list, secondGroupOpt, secondGroupControl: control };
    },
    collect: monitor => {
      return {
        isOver: monitor.isOver(),
        dragItem: monitor.getItem(),
      };
    },
  });
  const { keyType: dragItemKey, secondGroupKey } = dragItem || {};

  const getNewRecordDefaultValue = () => {
    const { firstGroupValue, secondGroupValue } = groupDefaultValue;
    const defaultValue = {
      ...(firstGroupValue === '-1' || !firstGroupValue ? {} : { [viewControl]: firstGroupValue }),
      ...(secondGroupValue === '-1' || !secondGroupValue ? {} : { [secondGroupControlId]: secondGroupValue }),
    };
    return defaultValue;
  };

  const handleAddRecord = opt => {
    const firstGroupValue = getFirstGroupDefaultValue(list, boardData);
    const secondGroupValue = getSecondGroupDefaultValue(control, opt);
    setGroupDefaultValue({
      firstGroupValue,
      secondGroupValue,
    });
    setCreateRecordVisible(true);
    setCurList(list);
  };

  return (
    <div className="secondGroupItemWrap" ref={allowOperation ? drop : null}>
      <div className="secondGroupItemWrap">
        {isOver && (list.key !== dragItemKey || secondGroupOpt.key !== secondGroupKey) && (
          <div className="isDragTempBlock"></div>
        )}
        {items.map((item, idx) => (
          <RecordItem
            fieldShowCount={fieldShowCount}
            key={`recordItem-${mapRowKey}-${idx}`}
            keyType={list.key}
            list={list}
            view={view}
            data={item}
            boardData={boardData}
            worksheetInfo={worksheetInfo}
            viewControl={viewControl}
            selectControl={selectControl()}
            sheetSwitchPermit={sheetSwitchPermit}
            updateTitleData={data => updateTitleData({ key: list.key, index: item._originIndex, data })}
            {..._.pick(list, ['fieldPermission'])}
            sheetButtons={sheetButtons}
            onAdd={addRecord}
            allowEditForGroup
            groups={parseGroupsByOptions(control.type, groupOptions)}
            groupControl={control}
            currentGroupKey={currentGroupKey}
            secondGroupOpt={secondGroupOpt}
            {...rest}
          />
        ))}
        {allowOperation && isShowAddRecord(worksheetInfo, list, viewControl, sheetSwitchPermit) && (
          <AddRecord className="addBoardRecord" onAddRecord={() => handleAddRecord(secondGroupOpt)} />
        )}
      </div>
      {createRecordVisible && (
        <NewRecord
          visible
          showFillNext
          onAdd={record => {
            let key = curList.key;
            // 一级分组为-1时，表示未指定，新增的数据要重新判断在哪个一级分组下
            if (key === '-1') {
              const firstGroupKeys = viewData.map(group => group.key);
              key = firstGroupKeys.find(item => item !== '-1' && record[viewControl].includes(item)) ?? '-1';
            }

            addRecord({ item: record, key });
          }}
          hideNewRecord={() => setCreateRecordVisible(false)}
          entityName={worksheetInfo.entityName}
          defaultFormData={getNewRecordDefaultValue()}
          {..._.pick(props, ['projectId', 'worksheetId', 'appId', 'viewId', 'worksheetInfo'])}
        />
      )}
    </div>
  );
};

export default SecondGroupItem;
