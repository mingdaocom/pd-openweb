import React, { Component, createRef, useRef } from 'react';
import { string } from 'prop-types';
import { get, includes } from 'lodash';
import { bindActionCreators } from 'redux';
import { useSetState } from 'react-use';
import { useDrag } from 'react-dnd-latest';
import cx from 'classnames';
import update from 'immutability-helper';
import { connect } from 'react-redux';
import * as boardActions from 'worksheet/redux/actions/boardView';
import RecordInfoWrapper from 'worksheet/common/recordInfo/RecordInfoWrapper';
import { updateWorksheetRow } from 'src/api/worksheet';
import { CAN_AS_BOARD_OPTION, ITEM_TYPE } from '../config';
import Components from '../../components';

const RELATION_SHEET_TYPE = 29;

const canDrag = props => {
  const { data = {}, viewControl, selectControl = {}, fieldPermission = '111', controlPermissions = '111' } = props;
  const { allowEdit } = data;
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
  } = props;
  const { rowId, rawRow, fields, ...rest } = data;
  const $ref = useRef(null);
  const [{ recordInfoVisible, recordInfoRowId, recordInfoType, isEditTitle }, setState] = useSetState({
    recordInfoVisible: false,
    recordInfoRowId: '',
    recordInfoType: null,
    isEditTitle: false,
  });
  const isRelationSheetType = recordInfoType === RELATION_SHEET_TYPE;
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE.RECORD,
    item: { type: ITEM_TYPE.RECORD, rowId },
    canDrag() {
      return canDrag(props);
    },
    begin() {
      return { rowId, keyType };
    },
    end(item, monitor) {
      const dropRes = monitor.getDropResult();
      if (!dropRes || !item) return;
      const { list } = dropRes;
      if (!list) return;
      const { rowId, keyType: srcKey } = item;
      const targetKey = list.key;
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
        if (list.type === 26) {
          nextVal = getUserValue();
        }
      }
      if (targetKey !== srcKey) {
        // 多选更新走单独逻辑
        if (list.type === 10) {
          props.sortRecord({ rowId, srcKey, targetKey, value: nextVal, rawRow });
          return;
        }
        props.sortRecord({ rowId, srcKey, targetKey, value: nextVal });
      }
      return;
    },
    collect(monitor) {
      return { isDragging: monitor.isDragging() };
    },
  });

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
    updateWorksheetRow({
      rowId: data.rowId,
      ..._.pick(props, ['worksheetId', 'viewId']),
      newOldControl: [control],
    }).then(({ data, resultCode }) => {
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

  return (
    <div
      ref={drag}
      onClick={() => {
        if (!recordInfoVisible) {
          showRecordInfo({ recordInfoType: keyType, recordInfoRowId: rowId });
        }
      }}
      className={cx('boardDataRecordItemWrap', { isDragging, isDraggingTemp: type === 'temp' })}
    >
      <Components.EditableCard
        ref={$ref}
        data={data}
        canDrag={canDrag(props)}
        currentView={{ ...currentView, projectId: worksheetInfo.projectId, appId }}
        allowCopy={worksheetInfo.allowAdd}
        editTitle={() => setState({ isEditTitle: true })}
        onUpdate={(updated, item) => {
          updateBoardViewRecord(
            updated[viewControl]
              ? { key: keyType, rowId, target: updated[viewControl], item }
              : { key: keyType, rowId, item },
          );
        }}
        onCopySuccess={item => onCopySuccess({ key: keyType, item })}
        onDelete={() => delBoardViewRecord({ key: keyType, rowId })}
        sheetSwitchPermit={sheetSwitchPermit}
      />
      {isEditTitle && (
        <Components.RecordPortal closeEdit={closeEdit}>
          <Components.EditingRecordItem
            type="board"
            currentView={currentView}
            data={data}
            style={{ ...getStyle() }}
            closeEdit={closeEdit}
            updateTitleData={updateTitleControlData}
            {...rest}
          />
        </Components.RecordPortal>
      )}
      {recordInfoVisible && (
        <RecordInfoWrapper
          showPrevNext
          allowAdd={worksheetInfo.allowAdd}
          sheetSwitchPermit={sheetSwitchPermit}
          from={1}
          visible
          recordId={recordInfoRowId}
          projectId={worksheetInfo.projectId}
          currentSheetRows={getCurrentSheetRows()}
          worksheetId={isRelationSheetType ? _.get(selectControl, 'dataSource') : worksheetId}
          hideRecordInfo={() => {
            setState({ recordInfoVisible: false });
          }}
          hideRows={() => {
            setState({ recordInfoVisible: false });
          }}
          updateRows={(ids, newItem, updateControls) => {
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
                return { ...para, target: updateControls[viewControl] };
              }
              return para;
            };
            // 多选作为看板更改多选字段 更新数据
            if (list.type === 10) {
              const { value } = _.find(data.fields, item => item.controlId === viewControl) || {};
              const currentValue = updateControls[viewControl];
              if (currentValue !== value) {
                updateMultiSelectBoard({ ...getPara(), prevValue: value, currentValue });
                return;
              }
            }
            if (newItem) {
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
