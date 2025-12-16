import React, { Fragment, useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';
import _ from 'lodash';
import styled from 'styled-components';
import { Skeleton } from 'ming-ui';
import DragMask from 'worksheet/common/DragMask';
import { isSameType } from 'src/pages/worksheet/common/ViewConfig/util.js';
import { browserIsMobile } from 'src/utils/common';
import { timeWidth, timeWidthHalf, types } from './config';
import ConTimegrid from './ConTimegrid';
import DataCon from './DataCon';
import ToolBar from './ToolBar';

const Wrap = styled.div`
  width: 100%;
  height: 100%;
  .resourceView {
    width: 100%;
    height: 100%;
  }
`;
const Drag = styled.div(
  ({ left }) => `
  position: absolute;
  z-index: 2;
  left: ${left}px;
  width: 2px;
  height: 100%;
  cursor: ew-resize;
  &:hover {
    border-left: 1px solid #ddd;
  }
`,
);
export default function Resource(props) {
  const isM = browserIsMobile();
  const { fetchRows, getRelationControls, view, getTimeList, resourceview, controls } = props;
  const getDirectoryWidth = () => {
    if (isM) {
      return Math.floor(props.width * 0.3);
    }
    const resourceDirectoryWidth = localStorage.getItem(`resourceDirectoryWidth-${props.viewId}`);
    const worksheetContentBoxEl = document.querySelector('.worksheetSheet');
    const contentBoxWidth = worksheetContentBoxEl ? worksheetContentBoxEl.clientWidth / 3 : 210;
    return resourceDirectoryWidth ? Number(resourceDirectoryWidth) : contentBoxWidth;
  };
  const [{ dragMaskVisible, directoryWidth, maxWidth, showGroup, canvasType }, setState] = useSetState({
    dragMaskVisible: false,
    directoryWidth: getDirectoryWidth(),
    maxWidth: 3000,
    showGroup: true,
    canvasType:
      localStorage.getItem(`${view.viewId}_resource_type`) || types[_.get(view, 'advancedSetting.calendarType') || 0],
  });

  useEffect(() => {
    onFetch();
  }, [props.view, resourceview.currentTime]);
  const onFetch = () => {
    const { dataSource = '' } = (controls || []).find(o => o.controlId === props.view.viewControl) || {};
    getTimeList(() => {
      !!dataSource &&
        isSameType([29], (controls || []).find(o => o.controlId === props.view.viewControl) || {}) &&
        getRelationControls(dataSource);
      fetchRows();
    });
  };
  useEffect(() => {
    const viewEl = document.querySelector(`.resourceView-${view.viewId}`);
    setState({
      maxWidth: viewEl ? (50 / 100) * viewEl.offsetWidth : 0,
    });
  }, []);
  const renderLoading = () => {
    return (
      <div className="Relative w100">
        <Skeleton
          style={{ flex: 1 }}
          direction="column"
          widths={['30%', '40%', '90%', '60%']}
          active
          itemStyle={{ marginBottom: '10px' }}
        />
        <Skeleton
          style={{ flex: 1 }}
          direction="column"
          widths={['40%', '55%', '100%', '80%']}
          active
          itemStyle={{ marginBottom: '10px' }}
        />
        <Skeleton
          style={{ flex: 2 }}
          direction="column"
          widths={['45%', '100%', '100%', '100%']}
          active
          itemStyle={{ marginBottom: '10px' }}
        />
      </div>
    );
  };
  const handleToolClick = () => {
    const $wrap = document.querySelector('.resourceView');
    const oneWidth = canvasType !== 'Day' ? timeWidth : timeWidthHalf;
    const timeWidthAll = resourceview.gridTimes.length * oneWidth;

    let copyDom = $wrap.cloneNode(true);
    copyDom.classList.add('new-div-class');
    const leftW = $(`#resourceGroup_${view.viewId}_0`).width() || directoryWidth;
    const width = timeWidthAll + leftW + 100;
    const height =
      resourceview.resourceDataByKey
        .map(o => o.height + 18)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0) + 100;
    copyDom.style.width = width;
    copyDom.style.height = height;
    document.querySelector('body').appendChild(copyDom);
    $('.new-div-class').css({
      width: width,
      height: height,
    });
    $('.new-div-class .resourceViewLeftCon').css({
      minWidth: leftW,
      width: leftW,
    });
    $('.new-div-class .resourceViewLeftCon .titleCon,.new-div-class .resourceViewLeftCon .tableCon').css({
      overflow: 'hidden',
    });
    $('.new-div-class .ConTimegrid').css({
      minWidth: timeWidthAll,
      width: timeWidthAll,
    });
    $('.new-div-class .valignWrappe').hide();
    const name = view.name + '.png';
    try {
      domtoimage.toBlob(copyDom, { bgcolor: '#f5f5f5', width: width, height: height }).then(function (blob) {
        saveAs(blob, name);
        document.querySelector('body').removeChild(copyDom);
      });
    } catch (error) {
      console.log(error);
      alert(_l('生成失败'), 2);
      document.querySelector('body').removeChild(copyDom);
    }
  };
  return (
    <Wrap>
      <div className={cx('resourceView flexRow', `resourceView-${view.viewId}`)}>
        <Fragment>
          {dragMaskVisible && showGroup && (
            <DragMask
              value={directoryWidth}
              min={210}
              max={maxWidth}
              onChange={value => {
                setState({ dragMaskVisible: false, directoryWidth: value });
                safeLocalStorageSetItem(`resourceDirectoryWidth-${view.viewId}`, value);
              }}
            />
          )}
          {showGroup && (
            <DataCon {...props} directoryWidth={!showGroup ? 0 : directoryWidth} renderLoading={renderLoading} />
          )}
          {!isM && showGroup && <Drag left={directoryWidth} onMouseDown={() => setState({ dragMaskVisible: true })} />}
        </Fragment>
        <ConTimegrid
          className="ConTimegrid"
          {...props}
          mx={Math.floor(props.width - directoryWidth)}
          directoryWidth={!showGroup ? 0 : directoryWidth}
          renderLoading={renderLoading}
          hideGroup={() => {
            setState({
              showGroup: !showGroup,
            });
          }}
          canvasType={canvasType}
          key={`${view.viewId}_${canvasType}`}
          showGroup={showGroup}
        />
        <ToolBar
          left={!showGroup || isM ? 0 : directoryWidth}
          onClick={() => {
            handleToolClick();
          }}
          view={view}
          onChangeType={value => {
            safeLocalStorageSetItem(`${view.viewId}_resource_type`, value);
            onFetch();
            setState({
              canvasType: value,
            });
          }}
        />
      </div>
    </Wrap>
  );
}
