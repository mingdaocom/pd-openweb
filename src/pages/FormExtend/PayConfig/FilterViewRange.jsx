import React, { useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Checkbox, Popover, Radio } from 'ming-ui/antd-components';

const Wrap = styled.div`
  height: 36px;
  align-items: center;
  border: 1px solid var(--color-border-secondary);
  padding: 0 10px;
  &.current {
    border: 1px solid var(--color-primary) !important;
  }
`;

const RangeBox = styled.div`
  box-sizing: border-box;
  line-height: 1;
  font-size: 14px;
  font-weight: bold;
  .con {
    padding: 24px;
    max-height: 350px;
    overflow: auto;
    .ant-radio-label {
      font-weight: initial;
      color: var(--color-text-title);
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
              className={cx({
                mBottom15: item.key === 'all',
              })}
              key={item.index}
              checked={item.key === 'all' ? isAllView : !isAllView}
              onChange={() => {
                changeViewRange({
                  type,
                  viewIds: [],
                });
                setIsAllView(item.isAllView);
              }}
              title={item.text}
            >
              {item.text}
            </Radio>
          ))}
          {!isAllView &&
            views
              .filter(l => l.worksheetId !== l.viewId)
              .map(it => {
                return (
                  <Checkbox
                    className="mTop15 mLeft25 Normal"
                    checked={viewIds.includes(it.viewId)}
                    onChange={event => {
                      changeViewRange({
                        type,
                        viewIds: !event.target.checked ? _.pull(viewIds, it.viewId) : (viewIds || []).concat(it.viewId),
                      });
                    }}
                  >
                    {it.name}
                  </Checkbox>
                );
              })}
        </div>
      </RangeBox>
    );
  };

  return (
    <Popover
      noPadding
      content={filterViewCon}
      trigger="click"
      open={showRange}
      onOpenChange={showRange => {
        if (!showRange && !isAllView && _.isEmpty(viewIds)) {
          alert(_l('至少选中一个视图！'), 3);
          return;
        }

        setShowRange(showRange);
      }}
      styles={{ container: { width: ref && ref.current ? ref.current.clientWidth : 'auto' } }}
      placement="bottomLeft"
    >
      <Wrap className={cx(`flexRow Hand ${className}`, { current: showRange })} ref={ref}>
        <span className="Font14 flex">
          {_.isEmpty(viewIds) ? _l('所有记录') : _l('%0个视图下的记录', viewIds.length)}
        </span>
        <Icon icon="arrow-down-border" className="textTertiary Hand Font20" />
      </Wrap>
    </Popover>
  );
}
