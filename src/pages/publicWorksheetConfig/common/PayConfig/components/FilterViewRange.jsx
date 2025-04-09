import React, { useState, useRef } from 'react';
import { Icon, Radio } from 'ming-ui';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import cx from 'classnames';

const Wrap = styled.div`
  height: 36px;
  align-items: center;
  border: 1px solid #e0e0e0;
  padding: 0 10px;
  &.current {
    border: 1px solid #2196f3 !important;
  }
`;

const RangeBox = styled.div`
  background: #ffffff 0% 0% no-repeat padding-box;
  box-shadow: 0px 12px 24px #0000003d;
  box-sizing: border-box;
  line-height: 1;
  font-size: 14px;
  font-weight: bold;
  .con {
    padding: 24px;
    max-height: 350px;
    overflow: auto;
    .Radio-text {
      font-weight: initial;
      color: #151515;
    }
  }
  .inputTxt {
    font-weight: normal;
  }
`;

export default function FilterViewRange(props) {
  const { className, worksheetInfo = {}, type, viewIds = [], changeViewRange = () => {} } = props;
  const { views = [] } = worksheetInfo;
  const [showRange, setShowRange] = useState();
  const [isAllView, setIsAllView] = useState(_.isEmpty(viewIds));
  const ref = useRef(null);

  const filterViewCon = () => {
    return (
      <RangeBox>
        <div className="con flexColumn">
          {[
            { key: 'all', text: _l('所有记录'), isAllView: true },
            { key: 'assign', text: _l('应用于指定的视图下的记录'), isAllView: false },
          ].map(item => (
            <Radio
              className={cx({ mBottom15: item.key === 'all' })}
              key={item.index}
              text={item.text}
              checked={item.key === 'all' ? isAllView : !isAllView}
              onClick={() => {
                changeViewRange({ type, viewIds: [] });
                setIsAllView(item.isAllView);
              }}
            />
          ))}
          {!isAllView &&
            views.filter(l => l.worksheetId !== l.viewId).map(it => {
              return (
                <div
                  className="mTop15 mLeft25 inputTxt Hand"
                  onClick={() => {
                    if (viewIds.includes(it.viewId)) {
                      changeViewRange({ type, viewIds: _.pull(viewIds, it.viewId) });
                    } else {
                      changeViewRange({ type, viewIds: (viewIds || []).concat(it.viewId) });
                    }
                  }}
                >
                  <input type="checkbox" className="viewInput TxtMiddle" checked={viewIds.includes(it.viewId)} />
                  <span className="TxtMiddle">{it.name}</span>
                </div>
              );
            })}
        </div>
      </RangeBox>
    );
  };

  return (
    <Trigger
      popup={filterViewCon}
      action={['click']}
      popupVisible={showRange}
      onPopupVisibleChange={showRange => {
        if (!showRange && !isAllView && _.isEmpty(viewIds)) {
          alert('至少选中一个视图！', 3);
          return;
        }
        setShowRange(showRange);
      }}
      popupStyle={{ width: ref && ref.current ? ref.current.clientWidth : 'auto' }}
      popupAlign={{
        points: ['tl', 'bl'],
        offset: [0, 1],
        overflow: { adjustX: true, adjustY: true },
      }}
    >
      <Wrap className={cx(`flexRow Hand ${className}`, { current: showRange })} ref={ref}>
        <span className="Font14 flex">
          {_.isEmpty(viewIds) ? _l('所有记录') : _l('%0个视图下的记录', viewIds.length)}
        </span>
        <Icon icon="arrow-down-border" className="Gray_9d Hand Font20" />
      </Wrap>
    </Trigger>
  );
}
