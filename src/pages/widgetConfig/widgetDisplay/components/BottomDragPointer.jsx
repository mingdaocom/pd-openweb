import React, { Fragment, useRef } from 'react';
import { useDrop } from 'react-dnd-latest';
import cx from 'classnames';
import _, { get, pick } from 'lodash';
import styled from 'styled-components';
import { useGlobalStore } from 'src/common/GlobalStore';
import CreateByMingoButton from 'src/components/Mingo/ChatBot/CreateByMingoButton';
import { MINGO_TASK_STATUS, MINGO_TASK_TYPE } from 'src/components/Mingo/ChatBot/enum';
import { EmptyControl } from 'src/pages/widgetConfig/widgetSetting/components/SplitLineConfig/style';
import { emitter } from 'src/utils/common';
import { DRAG_ACCEPT, DRAG_MODE } from '../../config/Drag';
import { notInsetSectionTab } from '../../util';

const DragPointer = styled.div`
  flex: 1;
  width: 100%;
  overflow: hidden;
  min-height: 40px;
  min-width: 20px;
  .line {
    margin-top: 0px;
    height: 4px;
  }
  .emptyForMingo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    color: #9e9e9e;
    .aiGenIcon {
      font-size: 22px;
      color: var(--ai-primary-color);
    }
  }
  &.isOver {
    .line {
      background-color: #1677ff;
    }
  }
`;
window.emitter = emitter;
export default function BottomDragPointer({
  isDialog,
  showCreateByMingo,
  rowIndex,
  displayItemType,
  showEmpty,
  sectionId,
  globalSheetInfo,
}) {
  window.globalSheetInfo = globalSheetInfo;
  const {
    store: { mingoCreateWorksheetAction },
  } = useGlobalStore();
  const ref = useRef(null);
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: DRAG_ACCEPT[displayItemType],
    canDrop(item) {
      // 标签页内不允许标签页、多条列表(旧)等拖拽
      if (sectionId && (_.includes(['SECTION'], item.enumType) || notInsetSectionTab(item.data))) return false;

      return true;
    },
    drop() {
      return {
        mode: DRAG_MODE.INSERT_NEW_LINE,
        displayItemType,
        rowIndex,
        sectionId: sectionId || '',
        activePath: [rowIndex - 1, 0],
      };
    },
    collect(monitor) {
      return { isOver: monitor.canDrop() && monitor.isOver({ shallow: true }) };
    },
  });

  drop(ref);
  return (
    <DragPointer ref={ref} className={cx('flexColumn', { isOver, canDrop })}>
      {showEmpty ? (
        <EmptyControl style={!isDialog && showCreateByMingo ? {} : { lineHeight: '86px' }}>
          {!mingoCreateWorksheetAction ? (
            <Fragment>
              <div className="line"></div>
              <div className="emptyText">{_l('从左侧列表拖拽或点击添加字段')}</div>
              {!isDialog && showCreateByMingo && (
                <CreateByMingoButton
                  className="mingoGenWidgets"
                  onClick={() => {
                    localStorage.removeItem(`MINGO_CACHE_CREATE_WORKSHEET_BOT_${get(md, 'global.Account.accountId')}`);
                    window.mingoPendingStartTask = { type: MINGO_TASK_TYPE.CREATE_WORKSHEET_ASSIGNMENT };
                    window.mingoPendingCreateWorksheetTaskStatus =
                      MINGO_TASK_STATUS.CREATE_WORKSHEET_ASSIGNMENT_CREATE_WORKSHEET_WIDGETS;
                    emitter.emit('UPDATE_GLOBAL_STORE', 'mingoCreateWorksheetAction', {
                      action: 'createFromEmpty',
                      worksheetInfo: pick(globalSheetInfo, ['appId', 'projectId', 'worksheetId', 'name', 'desc']),
                    });
                    emitter.emit('SET_MINGO_VISIBLE');
                  }}
                >
                  {_l('AI生成字段')}
                </CreateByMingoButton>
              )}
            </Fragment>
          ) : (
            <div className="emptyForMingo">
              <i className="aiGenIcon icon icon-auto_awesome"></i>
              <div className="tip">{_l('正在与AI对话生成字段')}</div>
            </div>
          )}
        </EmptyControl>
      ) : (
        <div className="line"></div>
      )}
    </DragPointer>
  );
}
