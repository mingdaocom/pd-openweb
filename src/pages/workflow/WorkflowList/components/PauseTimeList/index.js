import React, { useState } from 'react';
import Trigger from 'rc-trigger';
import styled from 'styled-components';

const PauseTimeListCon = styled.div`
  background: #fff;
  box-shadow: 0 3px 9px rgba(0, 0, 0, 0.16);
  width: 240px;
  padding: 6px 0;
  .runDateItem {
    line-height: 32px;
    color: #333;
    padding: 0 24px;
    .pause {
      color: #f44336;
    }
    .recover {
      color: #4caf50;
    }
    &:hover {
      .pause {
        color: #fff;
      }
      .recover {
        color: #fff;
      }
    }
  }
  .runDateItem:hover {
    background-color: #2196f3;
    color: #fff;
  }
`;

const runDateList = [
  { value: 0, label: _l('直到手动恢复') },
  { value: 1, label: _l('暂停1小时') },
  { value: 2, label: _l('暂停2小时') },
  { value: 3, label: _l('暂停3小时') },
  { value: 4, label: _l('暂停4小时') },
  { value: 5, label: _l('暂停5小时') },
  { value: 6, label: _l('暂停6小时') },
];

export default function PauseTimeList(props) {
  const { changeOperation = () => {}, clickRecover = () => {}, item = {} } = props;
  const { waiting } = item;
  const [visible, setVisible] = useState(false);

  return (
    <Trigger
      getPopupContainer={props.getPopupContainer}
      popupVisible={visible}
      onPopupVisibleChange={visible => {
        setVisible(visible);
      }}
      popup={() => (
        <PauseTimeListCon className="pauseTimeListCon">
          {runDateList.map(v => (
            <div
              className="runDateItem Font13 Hand"
              key={v.value}
              onClick={() => {
                setVisible(false);
                if (v.value === 0 && waiting) {
                  clickRecover(item);
                  return;
                }
                changeOperation(item, v.value);
              }}
            >
              {v.value === 0 ? (
                !waiting ? (
                  <span>
                    <span className="pause">{_l('暂停')}</span>
                    {` （${v.label}）`}
                  </span>
                ) : (
                  <span className="recover">{_l('恢复消费')}</span>
                )
              ) : !waiting ? (
                v.label
              ) : (
                _l('继续') + v.label
              )}
            </div>
          ))}
        </PauseTimeListCon>
      )}
      action={['click']}
      popupAlign={{
        points: ['tc', 'bc'],
        offset: [5, 5],
        overflow: { adjustX: true, adjustY: true },
      }}
    >
      <span onClick={() => setVisible(true)}>{props.children}</span>
    </Trigger>
  );
}
