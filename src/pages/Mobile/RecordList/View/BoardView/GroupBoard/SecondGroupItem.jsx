import React from 'react';
import RecordCardIO from 'mobile/RecordList/RecordCard/RecordCardIO';
import { isShowAddRecord } from 'worksheet/views/BoardView/util';
import AddRecordBtn from '../components/AddRecordBtn';

const SecondGroupItem = props => {
  const {
    viewControl,
    items,
    groupKey,
    mapRowKey,
    view,
    worksheetInfo,
    sheetSwitchPermit,
    appId,
    controls,
    openRecord,
    authParams,
    control,
    boardData,
    secondGroupOpt,
    secondGroupControlId,
    list,
    addBoardViewRecord,
    viewData,
    allowOperation,
    viewRootEl,
    updateViewCard,
  } = props;

  return (
    <div className="secondGroupItemWrap">
      {items.map((item, idx) => {
        const _row = safeParse(item.rawRow);
        return (
          <RecordCardIO
            key={`recordItem-${mapRowKey}-${idx}`}
            data={_row}
            view={view}
            appId={appId}
            projectId={worksheetInfo.projectId}
            controls={controls}
            allowAdd={worksheetInfo.allowAdd}
            sheetSwitchPermit={sheetSwitchPermit}
            viewRootEl={viewRootEl}
            updateViewCard={updateViewCard}
            onClick={() =>
              openRecord(
                {
                  key: groupKey,
                  preRow: _row,
                },
                _row,
              )
            }
          />
        );
      })}
      {allowOperation && isShowAddRecord(worksheetInfo, authParams, viewControl, sheetSwitchPermit) && (
        <AddRecordBtn
          view={view}
          appId={appId}
          worksheetInfo={worksheetInfo}
          sheetSwitchPermit={sheetSwitchPermit}
          secondGroupControl={control}
          boardData={boardData}
          itemFirstGroup={list}
          secondGroupControlId={secondGroupControlId}
          secondGroupOpt={secondGroupOpt}
          addBoardViewRecord={addBoardViewRecord}
          viewData={viewData}
        />
      )}
    </div>
  );
};

export default SecondGroupItem;
