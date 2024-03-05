import _ from 'lodash';
import React, { useState, useEffect, useRef, Fragment } from 'react';
import styled from 'styled-components';
import { minHeightObj, lineBottomHeight } from '../config';
import RecordBlock from './RecordBlock';

const Wrap = styled.div`
  z-index: 1;
  overflow-y: auto;
  /* 隐藏Chrome、Safari和Opera的滚动条 */
  &::-webkit-scrollbar {
    display: none;
  }
  /* 隐藏Internet Explorer和Edge的滚动条 */
  -ms-overflow-style: none; /* Internet Explorer和Edge */
  scrollbar-width: none; /* Firefox */
  .thByGroup {
    min-height: ${props => `${props.minHeight}px`};
    height: auto;
    display: grid;
    border-bottom: 1px solid rgba(0, 0, 0, 0.09);
    .lineTimeHr {
      min-height: ${props => `${props.minHeight}px`};
      height: auto;
    }
  }
`;

export default function RecordWrap(props) {
  const [data, setData] = useState(_.get(props, 'resourceview.resourceDataByKey'));
  const { view } = props;
  const tbodyContainer = useRef(null);
  useEffect(() => {
    setData(_.get(props, 'resourceview.resourceDataByKey'));
  }, [_.get(props, 'resourceview.resourceDataByKey')]);
  const bodyScroll = () => {
    const { view, viewId } = props;
    const scrollTop = tbodyContainer.current && tbodyContainer.current.scrollTop;
    document.getElementById(`leftCon_${viewId}`).scrollTop = scrollTop;
    document.getElementById(`scrollDiv_${viewId}`).scrollTop = scrollTop;
    if (
      Math.floor(props.mx) < Math.floor(props.width) &&
      Math.floor($(`#resourceGroup_${viewId}_${0}`).width()) <= Math.floor(props.directoryWidth)
    ) {
      $(`#leftCon_${viewId}`).css({
        paddingBottom: 10,
      });
    }
  };
  const renderContent = () => {
    const { view, viewId, fetchRowsByGroupId, controls } = props;
    const dateStart = controls.find(o => o.controlId === _.get(view, 'advancedSetting.begindate'));
    const dateEnd = controls.find(o => o.controlId === _.get(view, 'advancedSetting.enddate'));
    const hasStartAndEnd = !!dateStart && !!dateEnd;
    return (
      <React.Fragment>
        {data.map((o, i) => {
          return (
            <div
              className="thByGroup"
              id={`resourceRow_${viewId}_${i}`}
              onMouseEnter={() => {
                $(`#resourceRow_${viewId}_${i}`).css({
                  background: 'rgba(0,0,0,0.04)',
                });
                $(`#resourceGroup_${viewId}_${i}`).css({
                  background: 'rgba(0,0,0,0.04)',
                });
                $(`#resourceGroup_${viewId}_${i}`).find('.totalNum,.addCoin').css({
                  background: '#F4F4F4',
                });
              }}
              onMouseLeave={() => {
                $(`#resourceRow_${viewId}_${i}`).css({
                  background: 'transparent',
                });
                $(`#resourceGroup_${viewId}_${i}`).css({
                  background: 'transparent',
                });
                $(`#resourceGroup_${viewId}_${i}`).find('.totalNum,.addCoin').css({
                  background: '#fff',
                });
              }}
            >
              <div className="lineTimeHr Relative" style={{ height: o.height }}>
                {o.rows.map(it => {
                  return (
                    <RecordBlock
                      {...props}
                      key={it.rowid}
                      row={it}
                      list={o.rows}
                      keyForGroup={o.key}
                      minHeight={minHeightObj[Number(_.get(view, 'rowHeight') || '0')]}
                    />
                  );
                })}
              </div>
              <div className="pLeft10" style={{ height: lineBottomHeight }}>
                {o.totalNum > o.rows.length && o.totalNum > 20 && hasStartAndEnd && (
                  <div
                    className="Hand Gray_9e ThemeHoverColor3 Font13 LineHeight20 lineBottomHeightMore Left0 Relative"
                    onClick={() => {
                      fetchRowsByGroupId(o.key, Math.ceil(o.rows.length / 20) + 1);
                    }}
                  >
                    {_l('查看更多')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </React.Fragment>
    );
  };

  return (
    <Wrap
      className="flex"
      id={`rightCon_${view.viewId}`}
      onScroll={bodyScroll}
      ref={tbodyContainer}
      minHeight={minHeightObj[Number(_.get(view, 'rowHeight') || '0')]}
    >
      {renderContent()}
    </Wrap>
  );
}
