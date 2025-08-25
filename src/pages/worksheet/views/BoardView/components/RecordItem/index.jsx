import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useDrag } from 'react-dnd-latest';
import { useInView } from 'react-intersection-observer';
import { useSetState } from 'react-use';
import { Skeleton } from 'antd';
import cx from 'classnames';
import { get, includes } from 'lodash';
import _ from 'lodash';
import worksheetAjax from 'src/api/worksheet';
import RecordInfoWrapper from 'worksheet/common/recordInfo/RecordInfoWrapper';
import * as boardActions from 'worksheet/redux/actions/boardView';
import { emitter } from 'src/utils/common';
import { addBehaviorLog, handleReplaceState } from 'src/utils/project';
import { handleRecordClick } from 'src/utils/record';
import EditableCard from '../../../components/EditableCard';
import EditingRecordItem from '../../../components/EditingRecordItem';
import RecordPortal from '../../../components/RecordPortal';
import { CAN_AS_BOARD_OPTION, ITEM_TYPE } from '../../config';
import { getSecondGroupDefaultValue, getTargetName } from '../../util';
import useHoverDelay from './useHoverDelay';
import './index.less';

const RELATION_SHEET_TYPE = 29;

const canDrag = props => {
  const { data = {}, viewControl, selectControl = {}, fieldPermission = '111', controlPermissions = '111' } = props;
  const { allowEdit } = data;
  if (_.get(window, 'shareState.shareId')) return false;
  if (viewControl === 'caid') return false;
  return (
    allowEdit &&
    !selectControl.disable &&
    (fieldPermission || '111')[1] === '1' &&
    (controlPermissions || '111')[1] === '1'
  );
};

function SortableRecordItem(props) {
  const {
    type,
    isCharge,
    list,
    keyType,
    boardData,
    onCopySuccess,
    data = {},
    updateTitleData,
    view: currentView,
    appId,
    worksheetId,
    viewId,
    selectControl,
    worksheetInfo,
    viewControl,
    delBoardViewRecord,
    updateBoardViewRecord,
    sheetSwitchPermit,
    updateMultiSelectBoard,
    onAdd,
    fieldShowCount,
    width,
    allowEditForGroup,
    groups,
    groupControl,
    currentGroupKey,
    secondGroupOpt = {},
    viewRootEl,
    updateBoardViewCard,
  } = props;
  const { rowId, rawRow, ...rest } = data;
  const $ref = useRef(null);
  const [{ recordInfoVisible, recordInfoRowId, recordInfoType, isEditTitle, observerEnabled }, setState] = useSetState({
    recordInfoVisible: false,
    recordInfoRowId: '',
    recordInfoType: null,
    isEditTitle: false,
    observerEnabled: false,
  });
  const { hoverDelayEvents } = useHoverDelay($ref, isEditTitle);
  const isRelationSheetType = recordInfoType === RELATION_SHEET_TYPE;
  const skeletonHeight = data.fields?.length * 30 || 200;

  const [realCardHeight, setRealCardHeight] = useState(skeletonHeight);
  const [skeletonRows, setSkeletonRows] = useState(Math.floor(skeletonHeight / 40));
  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE.RECORD,
    item: { type: ITEM_TYPE.RECORD, rowId },
    canDrag() {
      return canDrag(props);
    },
    begin() {
      const dragEl = $ref.current;
      const rect = dragEl?.getBoundingClientRect() || {};
      const clonedNode = dragEl?.cloneNode(true);
      return {
        rowId,
        keyType,
        secondGroupKey: secondGroupOpt.key,
        width: rect.width,
        height: rect.height,
        clonedNode,
      };
    },
    end(item, monitor) {
      const dropRes = monitor.getDropResult();
      if (!dropRes || !item) return;
      const { list, secondGroupOpt = {}, secondGroupControl } = dropRes;
      if (!list) return;
      const { rowId, keyType: srcKey, secondGroupKey: srcSecondKey } = item;
      const targetKey = list.key;
      const targetSecondKey = secondGroupOpt.key;

      const firstGroupChange = targetKey !== srcKey;
      const secondGroupChange = targetSecondKey !== srcSecondKey;

      if (firstGroupChange || secondGroupChange) {
        const params = {
          rowId,
          srcKey,
          targetKey,
          value: getFirstGroupValue(targetKey, list),
          secondGroupValue: secondGroupControl ? getSecondGroupDefaultValue(secondGroupControl, secondGroupOpt) : null,
          firstGroupChange,
          secondGroupChange,
        };

        // 多选更新走单独逻辑
        props.sortRecord({ ...params, ...(list.type === 10 ? { rawRow } : {}) });
      }
      return;
    },
    collect(monitor) {
      return { isDragging: monitor.isDragging() };
    },
  });

  const { ref, inView } = useInView({
    root: observerEnabled ? viewRootEl : undefined,
    rootMargin: '100px',
    threshold: 0,
    skip: !observerEnabled,
  });
  const shouldRender = observerEnabled ? inView : false;
  useEffect(() => {
    if (viewRootEl instanceof Element) {
      setState({ observerEnabled: true });
    }
  }, [viewRootEl]);

  useEffect(() => {
    if (shouldRender && $ref.current) {
      const height = $ref.current.getBoundingClientRect().height;
      updateBoardViewCard(data.rowId, height);
      setRealCardHeight(height);
      setSkeletonRows(Math.floor(height / 40));
    }
  }, [shouldRender]);

  // 禁用默认的拖拽镜像
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const emptyImage = new Image();
      emptyImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
      preview(emptyImage, { captureDraggingState: true });
    }
  }, [preview]);

  const getFirstGroupValue = (targetKey, list) => {
    let nextVal = list.key;
    if (targetKey === '-1') {
      nextVal = '';
    } else {
      const getUserValue = () => {
        if (!list.name) return '';
        if (viewControl === 'ownerid') return get(JSON.parse(list.name), 'accountId');
        return JSON.stringify([JSON.parse(list.name)]);
      };

      if (list.type === 29) nextVal = JSON.stringify([{ sid: targetKey, name: list.name }]);

      if (includes(CAN_AS_BOARD_OPTION, list.type)) {
        nextVal = JSON.stringify([targetKey]);
      }
      if (_.includes([26, 27, 48], list.type)) {
        nextVal = getUserValue();
      }
    }
    return nextVal;
  };

  // 展示记录信息
  const showRecordInfo = obj => {
    if (obj.type === RELATION_SHEET_TYPE) {
      setState({
        recordInfoVisible: true,
        recordInfoType: obj.type,
        recordInfoRowId: obj.rowId,
      });
    } else {
      setState({ recordInfoVisible: true, ...obj });
    }
  };
  const getCurrentSheetRows = () => {
    try {
      return _.map(
        _.get(
          _.find(boardData, item => item.key === recordInfoType),
          'rows',
        ),
        item => JSON.parse(item),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const updateTitleControlData = control => {
    const { controlId, value } = control;
    worksheetAjax
      .updateWorksheetRow({
        rowId: data.rowId,
        ..._.pick(props, ['worksheetId', 'viewId']),
        newOldControl: [control],
      })
      .then(({ data, resultCode }) => {
        if (data && resultCode === 1) {
          updateTitleData({ [controlId]: value });
        }
      });
  };
  const getStyle = () => {
    const $dom = $ref.current;
    if (!$dom) return {};
    const { top, left } = $dom.getBoundingClientRect();
    return { top, left };
  };

  const closeEdit = () => {
    setState({ isEditTitle: false });
  };

  const onQueryChange = () => {
    handleReplaceState('page', 'recordDetail', () => setState({ recordInfoVisible: false }));
  };

  useEffect(() => {
    window.addEventListener('popstate', onQueryChange);

    return () => {
      window.removeEventListener('popstate', onQueryChange);
    };
  }, []);

  return (
    <div
      ref={drag}
      onClick={() => {
        handleRecordClick(currentView, safeParse(rawRow), () => {
          if (!recordInfoVisible) {
            showRecordInfo({ recordInfoType: keyType, recordInfoRowId: rowId });
            addBehaviorLog('worksheetRecord', worksheetId, { rowId }); // 埋点
          }
        });
      }}
      className={cx('boardDataRecordItemWrap', { isDragging, isDraggingTemp: type === 'temp' })}
      {...hoverDelayEvents}
    >
      <div ref={observerEnabled ? ref : null}>
        {shouldRender ? (
          <EditableCard
            ref={$ref}
            data={data}
            type="board"
            hoverShowAll
            fieldShowCount={fieldShowCount}
            canDrag={canDrag(props)}
            isCharge={isCharge}
            currentView={{
              ...currentView,
              projectId: worksheetInfo.projectId,
              appId,
            }}
            allowCopy={worksheetInfo.allowAdd && data.allowEdit}
            allowRecreate={worksheetInfo.allowAdd}
            {..._.pick(worksheetInfo, ['entityName', 'roleType'])}
            editTitle={() => {
              setState({ isEditTitle: true });
              $($ref.current).find('.hoverShowAll').stop().slideUp('fast');
            }}
            onUpdate={item => {
              const prevRow = JSON.parse(rawRow);
              updateBoardViewRecord({
                key: keyType,
                rowId,
                item: {
                  ...item,
                  ..._.pick(prevRow, ['allowdelete', 'allowedit']),
                },
                info: { type: list.type, viewControl },
              });
            }}
            onCopySuccess={item => onCopySuccess({ key: keyType, item })}
            onDelete={() => delBoardViewRecord({ key: keyType, rowId })}
            sheetSwitchPermit={sheetSwitchPermit}
            updateTitleData={updateTitleControlData}
            onAdd={item => onAdd({ ...item, key: keyType })}
            allowEditForGroup={allowEditForGroup}
            groups={groups}
            groupControl={groupControl}
            currentGroupKey={currentGroupKey}
          />
        ) : (
          <div className="skeletonBox" style={{ height: realCardHeight }}>
            <Skeleton paragraph={{ rows: skeletonRows }} />
          </div>
        )}
      </div>
      {isEditTitle && (
        <RecordPortal closeEdit={closeEdit}>
          <EditingRecordItem
            type="board"
            currentView={{
              ...currentView,
              projectId: worksheetInfo.projectId,
              appId,
            }}
            data={data}
            hoverShowAll
            fieldShowCount={fieldShowCount}
            isCharge={isCharge}
            style={{ ...getStyle() }}
            closeEdit={closeEdit}
            updateTitleData={updateTitleControlData}
            allowEditForGroup={allowEditForGroup}
            groups={groups}
            groupControl={groupControl}
            currentGroupKey={currentGroupKey}
            {...rest}
            width={width}
          />
        </RecordPortal>
      )}
      {recordInfoVisible && (
        <RecordInfoWrapper
          enablePayment={worksheetInfo.enablePayment}
          showPrevNext
          allowAdd={worksheetInfo.allowAdd}
          sheetSwitchPermit={sheetSwitchPermit}
          from={1}
          visible
          recordId={recordInfoRowId}
          rules={worksheetInfo.rules}
          projectId={worksheetInfo.projectId}
          currentSheetRows={getCurrentSheetRows()}
          worksheetId={isRelationSheetType ? _.get(selectControl, 'dataSource') : worksheetId}
          hideRecordInfo={() => {
            setState({ recordInfoVisible: false });
            emitter.emit('ROWS_UPDATE');
          }}
          hideRows={() => {
            setState({ recordInfoVisible: false });
          }}
          updateRows={(ids, newItem, updateControls = {}) => {
            // 如果当前看板控件发生改变 则记录所属看板需要调整 需要传递target参数
            const getPara = () => {
              // 取当前的记录id， 因为记录详情弹层可以上下切换
              const currentRowId = ids[0];
              const prevRow = JSON.parse(rawRow);
              let para = {
                key: keyType,
                rowId: currentRowId,
                item: {
                  ...newItem,
                  ..._.pick(prevRow, ['allowdelete', 'allowedit']),
                },
                info: { type: list.type, viewControl },
              };
              // 如果看板控件没改变 无需传递target参数
              if (updateControls[viewControl] !== undefined) {
                const target = updateControls[viewControl];
                const targetName = getTargetName(newItem[viewControl], selectControl, list);
                return { ...para, target, targetName };
              }
              return para;
            };
            // 多选作为看板更改多选字段 更新数据
            if (list.type === 10) {
              const { value } = _.find(data.fields, item => item.controlId === viewControl) || {};
              const currentValue = updateControls[viewControl];
              if (currentValue !== value) {
                updateMultiSelectBoard({ ...getPara(), prevValue: value, currentValue, selectControl });
                return;
              }
            }
            // 看板关联多条列表放开，防止记录初始化多条列表count更新引起视图更新
            if (newItem && newItem.rowid) {
              updateBoardViewRecord(getPara());
            }
          }}
          isCharge={isCharge}
          appId={isRelationSheetType ? '' : appId}
          viewId={isRelationSheetType ? _.get(selectControl, 'viewId') : viewId}
          deleteRows={() => delBoardViewRecord({ key: keyType, rowId })}
        />
      )}
    </div>
  );
}

export default connect(undefined, dispatch =>
  bindActionCreators(
    _.pick(boardActions, ['delBoardViewRecord', 'updateBoardViewRecord', 'addRecord', 'updateMultiSelectBoard']),
    dispatch,
  ),
)(SortableRecordItem);
