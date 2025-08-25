import React, { useRef } from 'react';
import { useDrop } from 'react-dnd-latest';
import { useSetState } from 'react-use';
import cx from 'classnames';
import { get } from 'lodash';
import _ from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import NewRecord from 'worksheet/common/newRecord/NewRecord';
import { getCardWidth } from 'src/utils/worksheet';
import { isDisabledCreate } from '../../util';
import { AddRecord } from '../components';
import BoardTitle from '../components/BoardTitle';
import RecordItem from '../components/RecordItem';
import { ITEM_TYPE } from '../config';
import { getFirstGroupDefaultValue } from '../util';

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
    allowOperation,
    ...rest
  } = props;
  const [{ loading, createRecordVisible, addRecordDefaultValue, isMore }, setState] = useSetState({
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

  const { keyType: dragItemKey } = dragItem || {};

  const scrollLoad = () => {
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
    let value = getFirstGroupDefaultValue(list, boardData);
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
  let param = {};

  if (_.get(view, 'advancedSetting.cardwidth')) {
    param = {
      width: getCardWidth(view),
    };
  }

  return (
    <Wrap ref={allowOperation ? drop : null} className={cx('boardDataRecordListWrap')} {...param}>
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
          {isOver && list.key !== dragItemKey && <div className="isDragTempBlock"></div>}
          {list.data.map((item, index) => (
            <RecordItem
              fieldShowCount={fieldShowCount}
              key={`${props.viewId}-${item.rowId}-${index}`}
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
      {allowOperation && isShowAddRecord() && (
        <AddRecord className="addBoardRecord" noItem={!list.data.length} onAddRecord={handleAddRecord} {...param} />
      )}
      {createRecordVisible && (
        <NewRecord
          visible
          showFillNext
          onAdd={record => {
            let key = list.key;
            if (key === '-1') {
              const firstGroupKeys = viewData.map(group => group.key);
              key = firstGroupKeys.find(item => item !== '-1' && record[viewControl].includes(item)) ?? '-1';
            }
            addRecord({ item: record, key });
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
