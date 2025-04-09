import React from 'react';
import { Popup, Button } from 'antd-mobile';
import styled from 'styled-components';

const BtnsWrap = styled.div`
  height: 50px;
  background-color: #fff;
  padding: 0 10px;
  box-sizing: border-box;
  z-index: 2;
  background-color: #fff;

  &.confirm {
    border: none;
    padding: 0;
    position: relative;
    bottom: -10px;
  }
`;

const ModalWrap = styled(Popup)`
  .mobileContainer {
    padding-top: 25px;
  }
  .mobileNewRecord {
    -webkit-overflow-scrolling: touch;
  }
`;

export default function MobileRecordRecoverConfirm(props) {
  const { title, cancelText, updateText, visible, onCancel, onUpdate } = props;
  return (
    <ModalWrap onClose={onUpdate} visible={visible} className="mobileModal topRadius">
      <div className="flexColumn h100">
        <div className="flexRow alignItemsCenter Font17 Gray bold pLeft15 pRight15 mTop24 mBottom32">{title}</div>
        <BtnsWrap className="footerBox valignWrapper flexRow" style={{ border: 'none' }}>
          <Button className="flex mLeft6 mRight6 Font13 bold Gray_75" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button className="flex mLeft6 mRight6 Font13 bold" color="primary" onClick={onUpdate}>
            {updateText}
          </Button>
        </BtnsWrap>
      </div>
    </ModalWrap>
  );
}
