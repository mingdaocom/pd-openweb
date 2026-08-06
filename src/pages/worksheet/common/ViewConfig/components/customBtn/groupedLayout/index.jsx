import React, { Fragment } from 'react';
import { useDragLayer } from 'react-dnd-latest';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { ITEM_TYPE_GROUP } from './constants';
import { GroupedLayoutDragLayer, GroupedLayoutDropIndicatorCleanup } from './DragLayer';
import { DropGap, EmptyGroupDropTarget, SegmentBlockDropTarget, SegmentBoundaryGap } from './dropTargets';
import GroupHeader from './GroupHeader';
import SegmentList from './SegmentList';
import useCustomBtnGroupedLayout from './useCustomBtnGroupedLayout';
import '../CustomBtn.less';

function CollapsedGroupDropStrip({
  segment,
  segmentIndex,
  layoutId,
  activeDropPlacementRef,
  activeGap,
  onDropOnGap,
  onDropButtonToBoundary,
  setActiveDropPlacement,
  setActiveGap,
  setActiveGroupInsert,
  setActiveButtonInsert,
}) {
  const hasChildren = segment.ids.length > 0;

  return (
    <div
      className={cx('customBtnGroupedCollapsedDropStrip', {
        customBtnGroupedCollapsedDropStripEmpty: !hasChildren,
      })}
    >
      {hasChildren ? (
        <DropGap segmentIndex={segmentIndex} gapIndex={0} activeGap={activeGap} />
      ) : (
        <EmptyGroupDropTarget
          segmentIndex={segmentIndex}
          layoutId={layoutId}
          activeDropPlacementRef={activeDropPlacementRef}
          onDropOnGap={onDropOnGap}
          onDropButtonToBoundary={onDropButtonToBoundary}
          setActiveDropPlacement={setActiveDropPlacement}
          setActiveGap={setActiveGap}
          setActiveGroupInsert={setActiveGroupInsert}
          setActiveButtonInsert={setActiveButtonInsert}
          activeGap={activeGap}
        />
      )}
      {hasChildren && <DropGap segmentIndex={segmentIndex} gapIndex={segment.ids.length} activeGap={activeGap} />}
    </div>
  );
}

function AddGroupButton({ showDivider, onAddGroup }) {
  return (
    <Fragment>
      {showDivider && <div className="customBtnGroupedBlockDivider mTop2 mBottom2" aria-hidden="true" />}
      <div className="customBtnGroupedAddGroup Hand InlineFlex alignItemsCenter mTop10 mLeft8" onClick={onAddGroup}>
        <span
          className="customBtnGroupedAddGroupIcon InlineFlex alignItemsCenter justifyContentCenter"
          aria-hidden="true"
        >
          <Icon icon="add" className="customBtnGroupedAddGroupPlus" />
        </span>
        <span className="customBtnGroupedAddGroupText Bold Font13">{_l('添加分组')}</span>
      </div>
    </Fragment>
  );
}

export default function CustomBtnGroupedLayout({
  btnData,
  btnGroupsJson,
  flatBtnOrderJson,
  layoutId = 'default',
  projectId,
  onSaveLayout,
  editBtn,
  deleteBtn,
  handleCopy,
  toggleEnable = () => {},
  isListOption,
}) {
  const {
    segments,
    btnById,
    layoutDragStateRef,
    activeDropPlacementRef,
    activeGap,
    activeGroupInsert,
    activeButtonInsert,
    collapsedGroupIds,
    openMoreKey,
    setActiveGap,
    setActiveGroupInsert,
    setActiveButtonInsert,
    setActiveDropPlacement,
    clearActiveDropPlacement,
    setOpenMoreKey,
    onDropOnGap,
    onDropButtonToBoundary,
    onDropGroupSegment,
    handleAddGroup,
    handleRenameGroup,
    handleRemoveGroup,
    handleEditGroup,
    toggleGroupCollapsed,
  } = useCustomBtnGroupedLayout({ btnData, btnGroupsJson, flatBtnOrderJson, projectId, onSaveLayout });
  const draggingGroupSegmentIndex = useDragLayer(monitor => {
    const item = monitor.getItem();

    return monitor.isDragging() && monitor.getItemType() === ITEM_TYPE_GROUP && item?.layoutId === layoutId
      ? item.segmentIndex
      : null;
  });

  const clearDropIndicator = () => {
    clearActiveDropPlacement();
    setActiveGap(null);
    setActiveGroupInsert(null);
    setActiveButtonInsert(null);
  };

  return (
    <React.Fragment>
      <GroupedLayoutDragLayer layoutDragStateRef={layoutDragStateRef} />
      <GroupedLayoutDropIndicatorCleanup
        clearActiveDropPlacement={clearActiveDropPlacement}
        setActiveGap={setActiveGap}
        setActiveGroupInsert={setActiveGroupInsert}
        setActiveButtonInsert={setActiveButtonInsert}
      />
      <div className="customBtnGroupedWrap" onMouseLeave={clearDropIndicator}>
        {segments.map((seg, si) => {
          const isGroup = seg.type === 'group';
          const isGroupCollapsed = isGroup && collapsedGroupIds.has(seg.id);
          const isGroupDropInsideActive = isGroup && activeGap && activeGap.segmentIndex === si;
          const isDraggingGroup = isGroup && draggingGroupSegmentIndex === si;

          return (
            <Fragment key={isGroup ? seg.id : `ung-${si}`}>
              <SegmentBlockDropTarget
                segment={seg}
                segmentIndex={si}
                layoutId={layoutId}
                activeDropPlacementRef={activeDropPlacementRef}
                isGroupCollapsed={isGroupCollapsed}
                setActiveDropPlacement={setActiveDropPlacement}
                setActiveGap={setActiveGap}
                setActiveGroupInsert={setActiveGroupInsert}
                setActiveButtonInsert={setActiveButtonInsert}
                onDropOnGap={onDropOnGap}
                onDropGroupSegment={onDropGroupSegment}
                onDropButtonToBoundary={onDropButtonToBoundary}
              >
                {si === 0 && (
                  <SegmentBoundaryGap
                    insertBefore={0}
                    layoutId={layoutId}
                    activeGroupInsert={activeGroupInsert}
                    activeButtonInsert={activeButtonInsert}
                    setActiveDropPlacement={setActiveDropPlacement}
                    setActiveGap={setActiveGap}
                    setActiveGroupInsert={setActiveGroupInsert}
                    setActiveButtonInsert={setActiveButtonInsert}
                    onDropGroupSegment={onDropGroupSegment}
                    onDropButtonToBoundary={onDropButtonToBoundary}
                  />
                )}
                <div
                  className={cx('customBtnGroupedBlock', {
                    customBtnGroupedBlockWithGroup: isGroup,
                    customBtnGroupedBlockDropInsideActive: isGroupDropInsideActive,
                  })}
                >
                  {isGroup && (
                    <GroupHeader
                      segmentIndex={si}
                      layoutId={layoutId}
                      name={seg.name}
                      icon={seg.icon}
                      iconUrl={seg.iconUrl}
                      iconColor={seg.iconColor}
                      collapsed={isGroupCollapsed}
                      listExpanded={!isGroupCollapsed}
                      onToggleCollapsed={() => toggleGroupCollapsed(seg.id)}
                      onRename={name => handleRenameGroup(si, name)}
                      onRemoveGroup={() => handleRemoveGroup(si)}
                      onEditFromMenu={() => handleEditGroup(si)}
                      moreKey={`group:${seg.id}`}
                      openMoreKey={openMoreKey}
                      setOpenMoreKey={setOpenMoreKey}
                    />
                  )}
                  {isGroupCollapsed ? (
                    <CollapsedGroupDropStrip
                      segment={seg}
                      segmentIndex={si}
                      layoutId={layoutId}
                      activeDropPlacementRef={activeDropPlacementRef}
                      activeGap={activeGap}
                      onDropOnGap={onDropOnGap}
                      onDropButtonToBoundary={onDropButtonToBoundary}
                      setActiveDropPlacement={setActiveDropPlacement}
                      setActiveGap={setActiveGap}
                      setActiveGroupInsert={setActiveGroupInsert}
                      setActiveButtonInsert={setActiveButtonInsert}
                    />
                  ) : (
                    <div
                      className={cx({
                        customBtnGroupedDraggingGroupBodyHidden: isDraggingGroup,
                      })}
                    >
                      <SegmentList
                        segmentIndex={si}
                        segment={seg}
                        layoutId={layoutId}
                        activeDropPlacementRef={activeDropPlacementRef}
                        btnById={btnById}
                        editBtn={editBtn}
                        deleteBtn={deleteBtn}
                        handleCopy={handleCopy}
                        toggleEnable={toggleEnable}
                        isListOption={isListOption}
                        activeGap={activeGap}
                        onDropOnGap={onDropOnGap}
                        onDropButtonToBoundary={onDropButtonToBoundary}
                        setActiveDropPlacement={setActiveDropPlacement}
                        setActiveGap={setActiveGap}
                        setActiveGroupInsert={setActiveGroupInsert}
                        setActiveButtonInsert={setActiveButtonInsert}
                        openMoreKey={openMoreKey}
                        setOpenMoreKey={setOpenMoreKey}
                      />
                    </div>
                  )}
                </div>
                {si < segments.length - 1 && (
                  <div className="customBtnGroupedBlockDivider mTop2 mBottom2" aria-hidden="true" />
                )}
                <SegmentBoundaryGap
                  insertBefore={si + 1}
                  layoutId={layoutId}
                  activeGroupInsert={activeGroupInsert}
                  activeButtonInsert={activeButtonInsert}
                  setActiveDropPlacement={setActiveDropPlacement}
                  setActiveGap={setActiveGap}
                  setActiveGroupInsert={setActiveGroupInsert}
                  setActiveButtonInsert={setActiveButtonInsert}
                  onDropGroupSegment={onDropGroupSegment}
                  onDropButtonToBoundary={onDropButtonToBoundary}
                  isAfterGroup={isGroup}
                />
              </SegmentBlockDropTarget>
            </Fragment>
          );
        })}
        {(btnData || []).length > 0 && <AddGroupButton showDivider={segments.length > 0} onAddGroup={handleAddGroup} />}
      </div>
    </React.Fragment>
  );
}
