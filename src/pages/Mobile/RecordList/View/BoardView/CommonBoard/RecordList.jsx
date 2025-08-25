import React, { useMemo, useRef } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { LoadDiv, ScrollView } from 'ming-ui';
import RecordCardIO from 'mobile/RecordList/RecordCard/RecordCardIO';
import { isShowAddRecord } from 'worksheet/views/BoardView/util';
import AddRecordBtn from '../components/AddRecordBtn';
import './index.less';

const RecordList = props => {
  const {
    appId,
    controls,
    view,
    worksheetInfo = {},
    sheetSwitchPermit,
    itemFirstGroup,
    getSingleBoardGroup,
    openRecord,
    authParams,
    boardData,
    addBoardViewRecord,
    viewData,
    viewRootEl,
    updateViewCard,
  } = props;
  const { viewControl } = view;
  const showAdd = isShowAddRecord(worksheetInfo, authParams, viewControl, sheetSwitchPermit);
  const pendingFlag = useRef(false);
  const [{ pageIndex, loading }, setState] = useSetState({
    pageIndex: 1,
    loading: false,
  });

  const allowOperation = useMemo(() => {
    const firstGroupControl = _.find(controls, item => item.controlId === view.viewControl);
    return firstGroupControl && firstGroupControl.type !== 30;
  }, [view.viewControl]);

  const resetLoad = () => {
    pendingFlag.current = false;
    setState({
      loading: false,
    });
  };

  const scrollGroupItem = () => {
    if (pendingFlag.current) return;

    if (!loading && itemFirstGroup.rows.length < itemFirstGroup.totalNum) {
      const currentPageIndex = pageIndex + 1;
      pendingFlag.current = true;
      setState({
        pageIndex: currentPageIndex,
        loading: true,
      });
      getSingleBoardGroup(
        {
          pageIndex: currentPageIndex,
          kanbanKey: itemFirstGroup.key,
        },
        resetLoad,
      );
    }
  };

  return (
    <div className="commonGroupItemWrap">
      <div className={cx('commonGroupItemScrollBox', allowOperation && showAdd ? 'hasAddBtn' : 'noAddBtn')}>
        <ScrollView
          className="commonGroupItemScroll"
          options={{ overflow: { x: 'hidden' } }}
          springBackMode="disableSpringBackX"
          onScrollEnd={scrollGroupItem}
        >
          {itemFirstGroup.rows?.map((row, idx) => {
            const _row = safeParse(row);
            return (
              <RecordCardIO
                key={`recordItem-${itemFirstGroup.key}-${idx}`}
                data={safeParse(row)}
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
                      key: itemFirstGroup.key,
                      preRow: _row,
                    },
                    _row,
                  )
                }
              />
            );
          })}
          {loading && <LoadDiv />}
        </ScrollView>
      </div>
      {allowOperation && showAdd && (
        <div className={cx('pRight10', { mTop10: itemFirstGroup.rows?.length })}>
          <AddRecordBtn
            view={view}
            appId={appId}
            worksheetInfo={worksheetInfo}
            sheetSwitchPermit={sheetSwitchPermit}
            boardData={boardData}
            itemFirstGroup={itemFirstGroup}
            addBoardViewRecord={addBoardViewRecord}
            viewData={viewData}
          />
        </div>
      )}
    </div>
  );
};

export default RecordList;
