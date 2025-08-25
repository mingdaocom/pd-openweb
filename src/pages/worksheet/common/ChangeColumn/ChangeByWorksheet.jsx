import React, { useState } from 'react';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Button, Icon, Tooltip } from 'ming-ui';

const PopupCon = styled.div`
  width: 360px;
  border-radius: 2px;
  padding: 20px;
  box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.16);
  background-color: #fff;
  .title {
    font-size: 15px;
    color: #151515;
    font-weight: 500;
  }
  .description {
    font-size: 13px;
    color: #757575;
    line-height: 1.8em;
    margin: 10px 0 26px;
  }
  .buttons {
    text-align: right;
    .Button {
      margin-left: 16px;
    }
  }
`;

export default function ChangedIcon(props) {
  const { onOk = () => {} } = props;
  const [popupVisible, setPopupVisible] = useState();
  return (
    <button className="iconButton ThemeHoverColor3">
      <Trigger
        popupVisible={popupVisible}
        onPopupVisibleChange={newvisible => {
          setPopupVisible(newvisible);
        }}
        popup={
          <PopupCon>
            <div className="title">{_l('你确定重置显示列吗？')}</div>
            <div className="description">{_l('显示顺序与表单字段保持一致（显示前50个）')}</div>
            <div className="buttons">
              <Button size="mdnormal" type="ghostgray" onClick={() => setPopupVisible(false)}>
                {_l('取消')}
              </Button>
              <Button
                size="mdnormal"
                onClick={() => {
                  onOk();
                  setPopupVisible(false);
                }}
              >
                {_l('确定')}
              </Button>
            </div>
          </PopupCon>
        }
        action={['click']}
        popupAlign={{
          points: ['tl', 'bl'],
          offset: [-13, 8],
          overflow: { adjustX: true, adjustY: true },
        }}
      >
        <Tooltip text={_l('重置')} popupPlacement="bottom">
          <Icon icon="loop" className="Font20" />
        </Tooltip>
      </Trigger>
    </button>
  );
}
