import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { RecordInfoModal } from 'mobile/Record';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import RecordInfoWrapper from 'src/pages/worksheet/common/recordInfo/RecordInfoWrapper.jsx';
import { browserIsMobile, emitter } from 'src/utils/common';
import { addBehaviorLog, handlePushState, handleReplaceState } from 'src/utils/project';
import { handleRecordClick } from 'src/utils/record';
import { lineHeight, timeWidth, timeWidthHalf, types } from '../config';
import { getTops } from '../util';

const Wrap = styled.div`
  cursor: ${props => (props.dragDisable ? 'auto' : 'grab')};
  max-width: ${props => props.maxWidth}px;
  position: absolute;
  z-index: 1;
  margin-top: 1px;
  margin-left: -0.5px;
  padding: 1px;
  color: ${props => props.row.fontColor};
  line-height: ${lineHeight}px;
  min-height: ${props => props.minHeight}px;
  height: ${props => props.height}px;
  .conW {
    border-radius: 2px;
    padding: 4px;
    background: ${props => props.row.color};
    .rowInfo {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 5;
      overflow: hidden;
      max-height: 100%;
    }
  }
  top: 0;
  .dragStart,
  .dragEnd {
    position: absolute;
    cursor: col-resize;
    display: none;
    width: 4px;
    top: 0;
    height: ${props => props.height}px;
    &::before {
      content: '';
      height: 8px;
      background: #fff;
      position: absolute;
      left: 0;
      top: 50%;
      width: 4px;
      border: 1px solid #2196f3;
      transform: translate(0, -4px);
    }
    &.dragStart {
      left: -2px;
    }
    &.dragEnd {
      right: -2px;
    }
  }
  &:hover {
    .dragStart,
    .dragEnd {
      display: block;
    }
  }
`;
export default function RecordBlock(props) {
  const $ref = useRef(null);
  const {
    worksheetInfo,
    appId,
    viewId,
    view,
    worksheetId,
    sheetSwitchPermit,
    updateRecordTime,
    refresh,
    resourceview,
    keyForGroup,
  } = props;
  const { gridTimes, resourceDataByKey } = resourceview;

  const type =
    localStorage.getItem(`${view.viewId}_resource_type`) || types[_.get(view, 'advancedSetting.calendarType') || 0];
  const oneWidth = type === 'Week' ? timeWidth * 2 : type !== 'Day' ? timeWidth : timeWidthHalf;
  const [{ recordInfoVisible, style }, setState] = useSetState({
    recordInfoVisible: false,
    style: {},
  });
  useEffect(() => {
    const { left, width, top, height } = props.row;
    setState({
      style: {
        left,
        width,
        top,
        height,
        WebkitBoxOrient: 'vertical',
      },
    });
    $ref.current.style.left = `${left}px`;
    $ref.current.style.width = `${width}px`;
  }, [props.row]);
  useEffect(() => {
    window.addEventListener('popstate', onQueryChange);

    return () => {
      window.removeEventListener('popstate', onQueryChange);
    };
  }, []);
  const onQueryChange = () => {
    handleReplaceState('page', 'recordDetail', () => setState({ recordInfoVisible: false }));
    refresh();
  };
  const handleMouseDown = event => {
    if (!window.isCanvasTime) {
      return;
    }
    event.stopPropagation();
    const allList = getTops(resourceDataByKey);
    const { left, width, before, after, top } = props.row;
    const x = event.clientX;
    const y = event.clientY;
    let changValue = null;
    let changValueY = null;
    let newKey = null;
    document.onmousemove = event => {
      let move = Math.round((event.clientX - x) / oneWidth) * oneWidth;
      let moveY = event.clientY - y;
      changValue = move;
      changValueY = moveY;
      $ref.current.style.transform = `translate(${move}px,${moveY}px)`;
      $ref.current.style.zIndex = 100;
      let oldTop = allList.find(it => it.key === keyForGroup).top + top;
      let newTop = oldTop + changValueY + 3; //3px偏差
      const { controls = [] } = props;
      const viewControlData = controls.find(o => o.controlId === view.viewControl) || {};
      newKey =
        (viewControlData.fieldPermission || '111')[1] === '1'
          ? (allList.find(o => (o.top < newTop || o.top === newTop) && newTop < o.bottom) || {}).key
          : null;
    };
    document.onmouseup = () => {
      $ref.current.style.transform = 'none';
      $ref.current.style.zIndex = 0;
      if (Math.abs(changValue) <= 0 && Math.abs(changValueY) <= 0) {
        handleRecordClick(view, props.row, () => {
          $ref.current.style.top = `${top + changValueY}px`;
          if (window.isMingDaoApp && (!window.shareState.shareId || window.APP_OPEN_NEW_PAGE)) {
            window.location.href = `/mobile/record/${appId}/${worksheetId}/${viewId}/${props.row.rowid}`;
            return;
          }
          setState({ recordInfoVisible: true });
          addBehaviorLog('worksheetRecord', worksheetId, { rowId: props.row.rowid }); // 埋点
        });
        document.onmousemove = null;
        document.onmouseup = null;
      } else {
        if ((before || after) && !!newKey && newKey !== keyForGroup) {
          $ref.current.style.top = `${top + changValueY}px`;
          handleUpdateRecordTime(null, null, newKey);
        } else {
          const start = Math.round((left + changValue) / oneWidth);
          let startTime = moment(gridTimes[start <= 0 ? 0 : start].date).format('YYYY-MM-DD HH:mm');
          let endTime = moment(moment(startTime).add(row.diff)).format('YYYY-MM-DD HH:mm');
          $ref.current.style.left = `${left + changValue}px`;
          if (resourceDataByKey.length <= 1 || !newKey || newKey === keyForGroup) {
            Math.abs(changValue) > 0 && handleUpdateRecordTime(startTime, endTime);
          } else {
            $ref.current.style.top = `${top + changValueY}px`;
            !!newKey && newKey !== keyForGroup && handleUpdateRecordTime(startTime, endTime, newKey);
          }
        }
      }
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
  const handleMouseDownStart = event => {
    if (!window.isCanvasTime) {
      return;
    }
    event.stopPropagation();
    const { left, width } = props.row;
    const x = event.clientX;
    let changValue = null;
    document.onmousemove = event => {
      const newLeft = Math.round((event.clientX - (x - left)) / oneWidth) * oneWidth;
      let move = Math.round((event.clientX - x) / oneWidth) * oneWidth;
      $ref.current.style.width = `${width - move}px`;
      $ref.current.style.left = `${newLeft}px`;
      $ref.current.style.zIndex = 1;
      changValue = newLeft;
    };
    document.onmouseup = () => {
      $ref.current.style.zIndex = 0;
      const value = Math.floor(changValue / oneWidth);
      handleChangeStart(moment(gridTimes[value].date).format('YYYY-MM-DD HH:mm'));
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
  const handleChangeStart = start => {
    const { endTime } = row;
    updateRecordTime(row, start, endTime, keyForGroup);
  };
  const handleChangeEnd = end => {
    const { startTime } = row;
    updateRecordTime(row, startTime, end, keyForGroup);
  };
  const handleUpdateRecordTime = (start, end, newKey) => {
    updateRecordTime(row, start, end, keyForGroup, newKey);
  };
  const handleMouseDownEnd = event => {
    if (!window.isCanvasTime) {
      return;
    }
    event.stopPropagation();
    const { left, width } = props.row;
    const x = event.clientX;
    let changValue = null;
    document.onmousemove = event => {
      let move = Math.round((event.clientX - x) / oneWidth) * oneWidth;
      $ref.current.style.width = `${width + move}px`;
      changValue = (width + move + left) / oneWidth;
      $ref.current.style.zIndex = 1;
    };
    document.onmouseup = () => {
      $ref.current.style.zIndex = 0;
      const date = gridTimes[(changValue > gridTimes.length ? gridTimes.length : changValue) - 1].date;
      changValue &&
        handleChangeEnd(
          type === 'Year'
            ? moment(date).date() < 16
              ? moment(date).format('YYYY-MM-15 23:59:59')
              : moment(date).endOf('month').format('YYYY-MM-DD HH:mm')
            : moment(date)
                .add(type === 'Day' || type === 'Week' ? 0.5 : 1, type !== 'Month' ? 'h' : 'd')
                .subtract(1, 's')
                .format('YYYY-MM-DD HH:mm'),
        );
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };

  const { row, controls, minHeight } = props;
  const startControl = controls.find(o => o.controlId === _.get(view, 'advancedSetting.begindate'));
  const endControl = controls.find(o => o.controlId === _.get(view, 'advancedSetting.enddate'));
  const startDisable =
    !controlState(startControl, 3).editable ||
    _.get(window, 'shareState.isPublicView') ||
    _.get(window, 'shareState.isPublicPage') ||
    browserIsMobile();
  const endDisable =
    !controlState(endControl, 3).editable ||
    _.get(window, 'shareState.isPublicView') ||
    _.get(window, 'shareState.isPublicPage') ||
    browserIsMobile();
  const dragDisable = startDisable || endDisable;
  return (
    <React.Fragment>
      <Wrap
        row={props.row}
        style={style}
        ref={$ref}
        dragDisable={dragDisable}
        className={cx('recordTitle Hand WordBreak')}
        onMouseDown={
          dragDisable
            ? () => {
                handleRecordClick(view, props.row, () => {
                  if (window.isMingDaoApp && (!window.shareState.shareId || window.APP_OPEN_NEW_PAGE)) {
                    window.location.href = `/mobile/record/${appId}/${worksheetId}/${viewId}/${props.row.rowid}`;
                    return;
                  }
                  handlePushState('page', 'recordDetail');
                  setState({ recordInfoVisible: true });
                  addBehaviorLog('worksheetRecord', worksheetId, { rowId: props.row.rowid }); // 埋点
                });
              }
            : handleMouseDown
        }
        // onMouseEnter={handleMouseEnter}
        maxWidth={oneWidth * gridTimes.length}
        minHeight={minHeight}
        height={props.row.height}
      >
        <div
          className={cx('w100 h100 conW Relative flexRow alignItemsCenter', {
            pLeft16: row.before,
            pRight16: row.after,
          })}
        >
          {!startDisable && (
            <div
              onMouseDown={startDisable ? _.noop() : handleMouseDownStart}
              className="dragStart"
              style={{ borderColor: row.color }}
            ></div>
          )}
          {row.before && (
            <Icon
              type="arrow-left-tip"
              className="moreLeft Absolute"
              style={{ left: 0, top: '50%', transform: `translateY(-50%)`, color: 'rgba(0,0,0,0.5)' }}
            />
          )}
          <span className="flex rowInfo">{props.row.text}</span>
          {row.after && (
            <Icon
              type="arrow-right-tip"
              className="moreRight Absolute"
              style={{ right: 0, top: '50%', transform: `translateY(-50%)`, color: 'rgba(0,0,0,0.5)' }}
            />
          )}
          {!endDisable && (
            <div
              onMouseDown={endDisable ? _.noop() : handleMouseDownEnd}
              className="dragEnd"
              style={{ borderColor: row.color }}
            ></div>
          )}
        </div>
      </Wrap>
      {/* 表单信息 */}
      {recordInfoVisible &&
        (browserIsMobile() ? (
          <RecordInfoModal
            className="full"
            visible
            appId={appId}
            worksheetId={worksheetId}
            enablePayment={worksheetInfo.enablePayment}
            viewId={viewId}
            rowId={props.row.rowid}
            onClose={() => {
              refresh();
            }}
          />
        ) : (
          <RecordInfoWrapper
            enablePayment={worksheetInfo.enablePayment}
            projectId={worksheetInfo.projectId}
            // currentSheetRows={props.list}
            // showPrevNext
            allowAdd={worksheetInfo.allowAdd}
            sheetSwitchPermit={sheetSwitchPermit} // 表单权限
            visible
            appId={appId}
            viewId={viewId}
            from={1}
            view={view}
            hideRecordInfo={() => {
              setState({ recordInfoVisible: false });
              emitter.emit('ROWS_UPDATE');
            }}
            recordId={props.row.rowid}
            worksheetId={worksheetId}
            rules={worksheetInfo.rules}
            updateSuccess={(ids, updated, data) => {
              refresh();
            }}
            onDeleteSuccess={() => {
              refresh();
            }}
            // hideRows={() => {}}
            handleAddSheetRow={data => {
              refresh();
            }}
          />
        ))}
    </React.Fragment>
  );
}
