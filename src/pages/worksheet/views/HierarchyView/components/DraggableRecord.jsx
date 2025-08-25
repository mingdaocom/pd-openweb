import React, { useEffect, useRef, useState } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd-latest';
import { useInView } from 'react-intersection-observer';
import { Skeleton } from 'antd';
import cx from 'classnames';
import { noop, pick } from 'lodash';
import _ from 'lodash';
import styled from 'styled-components';
import { FlexCenter } from 'worksheet/styled';
import { browserIsMobile } from 'src/utils/common';
import { getRecordColorConfig } from 'src/utils/record';
import EditableCard from '../../components/EditableCard';
import EditingRecordItem from '../../components/EditingRecordItem';
import RecordPortal from '../../components/RecordPortal';
import { isDisabledCreate, isTextTitle } from '../../util';
import { ITEM_TYPE } from '../config';
import { dealHierarchyData, getRelateDefaultValue } from '../util';
import AddRecord from './AddRecord';
import CountTip from './CountTip';

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
    searchRecordId,
    isCharge,
    onClick,
    isMix,
    isNarrow,
    stateTree,
    width,
    hierarchyTopLevelDataCount = 0,
    drawConnector = () => {},
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
  const skeletonHeight = recordData.fields?.length * 30 || 200;

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
  const [, drag, connectDragPreview] = useDrag({
    item: { type: ITEM_TYPE.ITEM },
    canDrag() {
      const { allowedit } = treeData[data.rowId];
      return allowedit;
    },
    begin() {
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
  const [realCardHeight, setRealCardHeight] = useState(skeletonHeight);
  const [skeletonRows, setSkeletonRows] = useState(Math.floor(skeletonHeight / 50));

  // TODO 发布前调整为200
  const shouldSkip = hierarchyTopLevelDataCount < 200;
  const { ref, inView: inViewRaw } = useInView({
    root: null,
    rootMargin: '100px',
    threshold: 0,
    skip: shouldSkip,
  });
  const inView = shouldSkip ? true : inViewRaw;

  useEffect(() => {
    if (inView && $ref.current && !shouldSkip) {
      const height = $ref.current.getBoundingClientRect().height;
      setRealCardHeight(height);
      setSkeletonRows(Math.floor(height / 40));
      drawConnector();
    }
  }, [inView]);

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

  const isSubLevelAfterTrim = () => {
    const parentPathId = window.hierarchViewExpandPathId;
    if (!pathId?.length || !parentPathId?.length) return false;

    const trimmed = pathId.slice(0, -1);
    if (parentPathId.length !== trimmed.length) return false;

    return parentPathId.every((element, index) => element === trimmed[index]);
  };

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
      let _depth = isMix && stateTree.length > 1 ? depth : depth + 1;
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
  if (width) {
    STYLE = {
      minWidth: Number(width),
      maxWidth: Number(width),
    };
  }

  return (
    <div
      ref={ref}
      className={cx('recordItemWrap', {
        normalOver: isOver && canDrop,
        directParentOver: isOver && !canDrop,
      })}
      onClick={onClick}
    >
      <div
        ref={$dragDropRef}
        id={rowId}
        className={cx('dragDropRecordWrap', { highLight: rowId === searchRecordId })}
        style={STYLE}
      >
        {inView || isSubLevelAfterTrim() ? (
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
            {..._.pick(worksheetInfo, ['entityName', 'roleType'])}
            editTitle={() => setEditTitle(true)}
            onCopySuccess={data => {
              onCopySuccess({ path, pathId, item: data });
            }}
            updateTitleData={updateTitleData}
            showNull={isMix}
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
            data={{ ...recordData, rowId, rawRow: treeData[rowId], recordColorConfig: getRecordColorConfig(view) }}
            stateData={data}
            currentView={view}
            allowCopy={allowAdd}
            isCharge={isCharge}
            style={{ ...getStyle(), ...STYLE }}
            closeEdit={closeEdit}
            updateTitleData={updateTitleData}
            showNull={isMix}
          />
        </RecordPortal>
      )}
      <OperationWrap onClick={e => e.stopPropagation()}>
        {normalDisplayedRecord.length > 0 && (
          <CountTip
            rowId={rowId}
            count={normalDisplayedRecord.length}
            visible={visible && hasExpanded}
            onClick={() => {
              window.hierarchViewExpandPathId = pathId;
              toggleChildren({ rowId, visible: !visible, path, pathId });
            }}
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
