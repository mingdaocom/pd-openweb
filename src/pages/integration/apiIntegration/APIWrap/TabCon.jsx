import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';

const TABLIST = [_l('API设置'), _l('查看引用'), _l('请求日志')];

const TabConWrap = styled.div`
  position: sticky;
  z-index: 1;
  background: var(--color-background-primary);
  li {
    color: var(--color-text-title);
    border-bottom: 3px solid transparent;
    &.isCur {
      color: var(--color-primary);
      border-bottom: 3px solid var(--color-primary);
    }
  }
`;

function TabCon({ data, info, tab, setTab, forPage }) {
  if (data.parentId) return <div className="pBottom10" />;

  return (
    <TabConWrap className={cx('TxtCenter BorderBottom pLeft40 pRight24 Top0', { TxtLeft: !forPage })}>
      <ul>
        {TABLIST.filter((o, i) => (!info.startEventId ? [0].includes(i) : true)).map((o, i) => {
          return (
            <li
              key={i}
              className={cx('Hand Font15 Bold InlineBlock mAll0 pTop16 pBottom16 pLeft20 pRight20', {
                isCur: tab === i,
              })}
              onClick={() => {
                setTab(i);
              }}
            >
              {o}
            </li>
          );
        })}
      </ul>
    </TabConWrap>
  );
}

export default TabCon;
