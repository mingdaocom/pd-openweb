import React, { useEffect, useState, useRef } from 'react';
import { isDisabledCreate, dropItem, setItem, getItem, isTextTitle } from '../../util';
import cx from 'classnames';
import { getEmptyImage } from 'react-dnd-html5-backend';
import styled from 'styled-components';
import { FlexCenter } from 'worksheet/styled';
import AddRecord from './AddRecord';
import { dealHierarchyData, getRelateDefaultValue } from '../util';
import { ITEM_TYPE } from '../config';
import CountTip from './CountTip';
import Components from '../../components';
import { noop, pick } from 'lodash';
import { useDrag, useDrop } from 'react-dnd-latest';

const OperationWrap = styled(FlexCenter)`
  position: absolute;
  top: 50%;
  left: 100%;
  transform: translate(0px, -50%);
  padding-left: 4px;
  z-index: 2;
  height: 100%;
  .addHierarchyRecord {
    visibility: hidden;
  }
`;

const isParent = (src, tar) => {
  return JSON.stringify(tar) === JSON.stringify(src.slice(0, -1));
};

// 判断是否拖拽到父节点的兄弟节点
const isParentSibling = (src, tar) => {
  if (src.length <= 1) return false;
  if (tar.length === src.length - 1 && !isParent(src, tar)) return true;
  return false;
};

export default function DraggableRecord(props) {
  const {
    data,
    controls,
    view,
    allowAdd,
    treeData,
    hierarchyRelateSheetControls,
    toggleChildren,
    handleAddRecord,
    updateTitleData,
    onCopySuccess = noop,
    depth,
    sheetSwitchPermit,
    updateMovedRecord,
    moveMultiSheetRecord,
    worksheetInfo,
    appId,
  } = props;
  const { rowId, visible, path = [], pathId = [], children } = data;
  const recordData = dealHierarchyData(treeData[rowId], {
    worksheetControls: controls,
    currentView: view,
    stateData: data,
    hierarchyRelateSheetControls,
  });
  const hasExpanded = _.some(children, child => typeof child === 'object');
  const normalDisplayedRecord = hasExpanded ? _.filter(children, child => !!child && !!child.display) : children;
  const isMultiRelate = String(view.childType) === '2';

  const $ref = useRef(null);
  const $dragDropRef = useRef(null);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ITEM_TYPE.ITEM,
    canDrop() {
      const draggingItem = getItem('draggingHierarchyItem') || '';
      if (data.rowId === draggingItem.rowId) return false;
      if (String(view.childType) === '2') {
        return isParentSibling(draggingItem.path, data.path);
      }
      return !isParent(draggingItem.path, data.path);
    },
    drop() {
      return { data };
    },
    collect(monitor) {
      return { isOver: monitor.isOver(), canDrop: monitor.canDrop() };
    },
  });
  const [{ isDragging }, drag, connectDragPreview] = useDrag({
    item: { type: ITEM_TYPE.ITEM },
    canDrag(props) {
      const { allowedit } = treeData[data.rowId];
      return allowedit;
    },
    begin(props) {
      setItem('draggingHierarchyItem', data);
      // 拖拽时折叠所有子记录
      toggleChildren({ visible: false, ..._.pick(data, ['path', 'pathId', 'rowId']) });
      return data;
    },

    end(item, monitor) {
      const dropResult = monitor.getDropResult();
      if (!dropResult) return;
      const draggingItem = getItem('draggingHierarchyItem') || '';
      const { data } = dropResult;
      if (!data) return;
      if (String(view.childType) === '2') {
        // 关联多表
        moveMultiSheetRecord({ src: draggingItem, target: data });
      } else {
        updateMovedRecord({ src: draggingItem, target: data });
      }
      dropItem('draggingHierarchyItem');
    },
    collect(monitor) {
      return { isDragging: monitor.isDragging() };
    },
  });

  const [isEditTitle, setEditTitle] = useState(false);

  useEffect(() => {
    if (connectDragPreview) {
      // Use empty image as a drag preview so browsers don't draw it
      // and we can draw whatever we want on the custom drag layer instead.
      connectDragPreview(getEmptyImage(), {
        // IE fallback: specify that we'd rather screenshot the node
        // when it already knows it's being dragged so we can hide it with CSS.
        captureDraggingState: true,
      });
    }
  }, []);

  const getStyle = () => {
    const $dom = $ref.current;
    if (!$dom) return {};
    const { top, left } = $dom.getBoundingClientRect();
    return { top, left };
  };

  const closeEdit = () => {
    setEditTitle(false);
  };

  const canAddChildren = () => {
    const { childType, viewControls } = view;
    if (isDisabledCreate(sheetSwitchPermit)) return;
    if (childType === 2) {
      return allowAdd && depth + 1 < viewControls.length;
    }
    return allowAdd;
  };

  drag(drop($dragDropRef));

  return (
    <div className={cx('recordItemWrap', { normalOver: isOver && canDrop, directParentOver: isOver && !canDrop })}>
      <div ref={$dragDropRef} className="dragDropRecordWrap">
        <Components.EditableCard
          {...pick(props, ['viewParaOfRecord', 'sheetSwitchPermit', 'onUpdate', 'onDelete'])}
          data={{ ...recordData, rowId }}
          stateData={data}
          ref={$ref}
          currentView={{ ...view, projectId: worksheetInfo.projectId, appId }}
          editTitle={() => setEditTitle(true)}
          onCopySuccess={data => {
            onCopySuccess({ path, pathId, item: data });
          }}
        />
      </div>
      {isEditTitle && (
        <Components.RecordPortal closeEdit={closeEdit}>
          <Components.EditingRecordItem
            data={{ ...recordData, rowId }}
            stateData={data}
            currentView={view}
            allowCopy={allowAdd}
            style={{ ...getStyle() }}
            closeEdit={closeEdit}
            updateTitleData={updateTitleData}
          />
        </Components.RecordPortal>
      )}
      <OperationWrap onClick={e => e.stopPropagation()}>
        {normalDisplayedRecord.length > 0 && (
          <CountTip
            rowId={rowId}
            count={normalDisplayedRecord.length}
            visible={visible && hasExpanded}
            onClick={() => toggleChildren({ rowId, visible: !visible, path, pathId })}
          />
        )}
        {canAddChildren() && (
          <AddRecord
            onAdd={() =>
              handleAddRecord({
                value: getRelateDefaultValue(treeData[rowId], {
                  currentView: view,
                  worksheetControls: controls,
                  stateData: data,
                  hierarchyRelateSheetControls,
                }),
                path,
                pathId,
                isTextTitle: isMultiRelate ? false : isTextTitle(controls),
                pid: rowId,
                visible,
              })
            }
          />
        )}
      </OperationWrap>
    </div>
  );
}
