import React, { useEffect, useRef, useState } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd-latest';
import cx from 'classnames';
import { noop, pick } from 'lodash';
import styled from 'styled-components';
import { FlexCenter } from 'worksheet/styled';
import { browserIsMobile } from 'src/utils/common';
import { getRecordColorConfig } from 'src/utils/record';
import EditableCard from '../../components/EditableCard';
import EditingRecordItem from '../../components/EditingRecordItem';
import RecordPortal from '../../components/RecordPortal';
import AddRecord from '../../HierarchyView/components/AddRecord';
import CountTip from '../../HierarchyView/components/CountTip';
import { ITEM_TYPE } from '../../HierarchyView/config';
import { dealHierarchyData, getRelateDefaultValue } from '../../HierarchyView/util';
import { isDisabledCreate, isTextTitle } from '../../util';

const OperationWrap = styled(FlexCenter)`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translate(-50%, 6px);
  z-index: 2;
  flex-direction: column;
  .addHierarchyRecord {
    visibility: hidden;
  }
  .countTip {
    margin-right: 0;
    margin-bottom: 6px;
    .icon-navigate_next {
      transform: rotate(90deg);
    }
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
    searchRecordId,
    isCharge,
    isNarrow,
    onClick,
    stateTree,
    width,
  } = props;
  const { rowId, visible, path = [], pathId = [], children = [] } = data;
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
      const draggingItem = safeParse(localStorage.getItem('draggingHierarchyItem'));
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
      safeLocalStorageSetItem('draggingHierarchyItem', JSON.stringify(data));
      // 拖拽时折叠所有子记录
      toggleChildren({ visible: false, ..._.pick(data, ['path', 'pathId', 'rowId']) });
      return data;
    },

    end(item, monitor) {
      const dropResult = monitor.getDropResult();
      if (!dropResult) return;
      const draggingItem = safeParse(localStorage.getItem('draggingHierarchyItem'));
      const { data } = dropResult;
      if (!data) return;
      if (String(view.childType) === '2') {
        // 关联多表
        moveMultiSheetRecord({ src: draggingItem, target: data });
      } else {
        updateMovedRecord({ src: draggingItem, target: data });
      }
      localStorage.removeItem('draggingHierarchyItem');
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
      let _depth = stateTree.length > 1 ? depth : depth + 1;
      return allowAdd && _depth < viewControls.length;
    }
    return allowAdd;
  };

  drag(drop($dragDropRef));

  let STYLE = {};
  if (isNarrow) {
    STYLE = {
      minWidth: 240,
      maxWidth: 240,
    };
  }
  if (!!width) {
    STYLE = {
      minWidth: Number(width),
      maxWidth: Number(width),
    };
  }

  return (
    <div
      className={cx('recordItemWrap', {
        normalOver: isOver && canDrop,
        directParentOver: isOver && !canDrop,
      })}
      style={{
        width: 'fit-content',
        margin: 'auto',
      }}
      onClick={onClick}
    >
      <div
        ref={$dragDropRef}
        id={rowId}
        className={cx('dragDropRecordWrap', { highLight: rowId === searchRecordId })}
        style={STYLE}
      >
        <EditableCard
          {...pick(props, ['viewParaOfRecord', 'sheetSwitchPermit', 'onUpdate', 'onDelete'])}
          data={{ ...recordData, rowId, rawRow: treeData[rowId], recordColorConfig: getRecordColorConfig(view) }}
          stateData={data}
          ref={$ref}
          currentView={{
            ...view,
            projectId: worksheetInfo.projectId,
            appId,
          }}
          isCharge={isCharge}
          editTitle={() => setEditTitle(true)}
          onCopySuccess={data => {
            onCopySuccess({ path, pathId, item: data });
          }}
          updateTitleData={updateTitleData}
          showNull={true}
        />
      </div>
      {isEditTitle && (
        <RecordPortal closeEdit={closeEdit}>
          <EditingRecordItem
            data={{ ...recordData, rowId, rawRow: treeData[rowId], recordColorConfig: getRecordColorConfig(view) }}
            stateData={data}
            currentView={view}
            allowCopy={allowAdd}
            isCharge={isCharge}
            style={{ ...getStyle(), ...STYLE }}
            closeEdit={closeEdit}
            updateTitleData={updateTitleData}
            showNull={true}
          />
        </RecordPortal>
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
        {canAddChildren() && !browserIsMobile() && (
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
