import React, { Fragment } from 'react';
import cx from 'classnames';
import { DraggableBtnRow } from './ActionRow';
import { DropGap, EmptyGroupDropTarget } from './dropTargets';

export default function SegmentList({
  segmentIndex,
  segment,
  layoutId,
  activeDropPlacementRef,
  btnById,
  editBtn,
  deleteBtn,
  handleCopy,
  toggleEnable,
  isListOption,
  activeGap,
  onDropOnGap,
  onDropButtonToBoundary,
  setActiveDropPlacement,
  setActiveGap,
  setActiveGroupInsert,
  setActiveButtonInsert,
  openMoreKey,
  setOpenMoreKey,
}) {
  const { ids } = segment;
  const isEmpty = !(ids && ids.length);

  if (isEmpty) {
    return (
      <div
        className={cx('customBtnGroupedSegment', 'customBtnGroupedSegmentEmptyExpanded', {
          isGroupBody: segment.type === 'group',
        })}
      >
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
      </div>
    );
  }

  return (
    <div className={cx('customBtnGroupedSegment', { isGroupBody: segment.type === 'group' })}>
      {ids.map((id, ii) => {
        const btn = btnById[id];

        if (!btn) {
          return null;
        }

        const disable = (btn.writeObject === 2 || btn.writeType === 2) && btn.clickType === 3 && isListOption;
        return (
          <Fragment key={id}>
            <DropGap segmentIndex={segmentIndex} gapIndex={ii} activeGap={activeGap} />
            <DraggableBtnRow
              btn={btn}
              segmentIndex={segmentIndex}
              idIndex={ii}
              layoutId={layoutId}
              editBtn={editBtn}
              deleteBtn={deleteBtn}
              handleCopy={handleCopy}
              toggleEnable={toggleEnable}
              disable={disable}
              openMoreKey={openMoreKey}
              setOpenMoreKey={setOpenMoreKey}
            />
          </Fragment>
        );
      })}
      <DropGap segmentIndex={segmentIndex} gapIndex={ids.length} activeGap={activeGap} />
    </div>
  );
}
