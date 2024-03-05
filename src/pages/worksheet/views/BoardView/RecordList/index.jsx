import React, { useEffect, useRef } from 'react';
import NewRecord from 'worksheet/common/newRecord/NewRecord';
import cx from 'classnames';
import { LoadDiv } from 'ming-ui';
import RecordItem from './RecordItem';
import { AddRecord } from '../components';
import BoardTitle from './BoardTitle';
import { CAN_AS_BOARD_OPTION, ITEM_TYPE } from '../config';
import { includes, find, get } from 'lodash';
import { isDisabledCreate } from '../../util';
import { useSetState } from 'react-use';
import { useDrop } from 'react-dnd-latest';
import { browserIsMobile } from 'src/util';
import styled from 'styled-components';

const Wrap = styled.div`
  width: ${props => `${(props.width ? props.width : 280) + 12 * 2}px`};
  .boardDataRecordItemWrap {
    width: ${props => `${props.width ? props.width : 280}px`};
  }
`;

export default function Board(props) {
  const {
    getSingleBoardPageData,
    list,
    boardData = [],
    worksheetInfo,
    viewControl,
    sheetSwitchPermit,
    showRecordInfo,
    boardViewRecordCount,
    viewData,
    view,
    addRecord,
    updateTitleData,
    sheetButtons,
    fieldShowCount,
    index,
    ...rest
  } = props;
  const [{ pageIndex, loading, createRecordVisible, addRecordDefaultValue, isMore }, setState] = useSetState({
    pageIndex: 1,
    createRecordVisible: false,
    addRecordDefaultValue: '',
    loading: false,
    isMore: true,
  });
  const $contentRef = useRef(null);
  const $scrollerRef = useRef(null);

  const pendingFlag = useRef(false);

  const [{ isOver, dragItem }, drop] = useDrop({
    accept: ITEM_TYPE.RECORD,
    hover() {
      // 滚动至头部
      if ($contentRef) {
        const { current } = $contentRef;
        if (current) {
          const $parent = current.offsetParent;
          if ($parent.scrollTop) {
            $parent.scrollTop = 0;
          }
        }
      }
    },
    drop() {
      return { list };
    },
    collect(monitor) {
      return {
        isOver: monitor.isOver(),
        dragItem: monitor.getItem(),
      };
    },
  });

  const { keyType: dragItemKey, rowId } = dragItem || {};

  const scrollLoad = (e, o) => {
    if (!$scrollerRef || !$contentRef) return;
    const threshold =
      $scrollerRef.current.scrollHeight - $contentRef.current.clientHeight - $scrollerRef.current.scrollTop;
    if (!loading && threshold <= 100 && isMore && list.rows.length < list.totalNum) {
      setState(state => {
        const { pageIndex } = state;
        const nextPageIndex = pageIndex + 1;
        if (pendingFlag.current) return;
        pendingFlag.current = true;
        getSingleBoardPageData({
          kanbanKey: list.key,
          pageIndex: nextPageIndex,
          alwaysCallback: () => {
            pendingFlag.current = false;
            setState({ loading: false });
          },
          checkIsMore: isMore => {
            setState({ isMore });
          },
        });
        return { ...state, pageIndex: nextPageIndex, loading: true };
      });
    }
  };
  const handleAddRecord = () => {
    let value = list.key;
    if (list.type === 26) {
      const { name = '' } = boardData.find(item => item.key === list.key) || {};
      if (name) {
        const user = JSON.parse(name);
        value = JSON.stringify(Array.isArray(user) ? user : [user]);
      } else {
        value = '[]';
      }
    }

    if (list.type === 29) {
      value = JSON.stringify([{ sid: list.key, name: list.name }]);
    }
    if (includes(CAN_AS_BOARD_OPTION, list.type)) {
      value = JSON.stringify([value]);
    }
    if (list.key === '-1') {
      value = '';
    }
    setState({ createRecordVisible: true, addRecordDefaultValue: value });
  };

  const isShowAddRecord = () => {
    const { allowAdd } = worksheetInfo;
    const { key, required, fieldPermission = '' } = list;
    if (isDisabledCreate(sheetSwitchPermit)) return false;
    // 以创建者为看板 无法添加创建者为其他成员的记录
    if (viewControl === 'caid' && list.key !== get(md, ['global', 'Account', 'accountId'])) return false;
    if (!allowAdd || fieldPermission[1] === '0') return false;
    if (required && key === '-1') return false;
    return true;
  };
  const getDragItemData = () =>
    find(
      get(
        viewData.find(item => item.key === dragItemKey),
        'data',
      ) || [],
      item => item.rowId === rowId,
    );
  const isMobile = browserIsMobile();
  let param = {};
  if (!!_.get(view, 'advancedSetting.cardwidth')) {
    param = {
      width: Number(_.get(view, 'advancedSetting.cardwidth')),
    };
  }

  return (
    <Wrap ref={drop} className={cx('boardDataRecordListWrap')} {...param}>
      <BoardTitle
        count={boardViewRecordCount[list.key] || 0}
        showRecordInfo={showRecordInfo}
        keyType={list.key}
        selectControl={rest.selectControl}
        appId={props.appId}
        projectId={worksheetInfo.projectId}
        {..._.pick(list, ['name', 'type', 'key', 'color', 'enumDefault', 'enumDefault2', 'noGroup', 'rowId'])}
      />
      <div className="boardDataItemScrollWrap" ref={$scrollerRef} onScroll={_.throttle(scrollLoad, 400)}>
        <div className="boardDataContentWrap" ref={$contentRef}>
          {isOver && list.key !== dragItemKey && (
            <RecordItem
              fieldShowCount={fieldShowCount}
              type="temp"
              keyType={list.key}
              list={list}
              view={view}
              boardData={boardData}
              data={getDragItemData()}
              worksheetInfo={worksheetInfo}
              viewControl={viewControl}
              sheetButtons={sheetButtons}
              {...param}
            />
          )}
          {list.data.map((item, index) => (
            <RecordItem
              fieldShowCount={fieldShowCount}
              key={index}
              keyType={list.key}
              list={list}
              view={view}
              data={item}
              boardData={boardData}
              worksheetInfo={worksheetInfo}
              viewControl={viewControl}
              sheetSwitchPermit={sheetSwitchPermit}
              updateTitleData={data => updateTitleData({ key: list.key, index, data })}
              {..._.pick(list, ['fieldPermission'])}
              sheetButtons={sheetButtons}
              onAdd={addRecord}
              {...rest}
              {...param}
            />
          ))}
          {loading && <LoadDiv />}
        </div>
      </div>
      {!isMobile && isShowAddRecord() && (
        <AddRecord className="addBoardRecord" noItem={!list.data.length} onAddRecord={handleAddRecord} {...param} />
      )}
      {createRecordVisible && (
        <NewRecord
          visible
          showFillNext
          onAdd={record => {
            addRecord({ item: record, key: list.key });
          }}
          hideNewRecord={() => setState({ createRecordVisible: false })}
          entityName={worksheetInfo.entityName}
          defaultFormData={
            addRecordDefaultValue === '-1' || !addRecordDefaultValue ? {} : { [viewControl]: addRecordDefaultValue }
          }
          {..._.pick(props, ['projectId', 'worksheetId', 'appId', 'viewId', 'worksheetInfo'])}
        />
      )}
    </Wrap>
  );
}
