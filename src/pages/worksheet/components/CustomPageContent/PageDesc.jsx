import React, { useState, useRef, useEffect } from 'react';
import { Textarea, Button } from 'ming-ui';
import styled from 'styled-components';
import { useClickAway } from 'react-use';

const PageDescWrap = styled.div`
  position: absolute;
  top: 44px;
  left: 15px;
  z-index: 1000;
  width: 260px;
  background: #fff;
  padding: 12px;
  box-shadow: 0 8px 17px 0 rgba(0, 0, 0, 0.18), 0 6px 20px 0 rgba(0, 0, 0, 0.12);
  .btns {
    text-align: right;
    margin-top: 12px;
  }
`;

export default function PageDesc({ onOk, onCancel, desc }) {
  const [value, setValue] = useState(desc);
  const ref = useRef(null);
  useClickAway(ref, onCancel);
  return (
    <PageDescWrap ref={ref}>
      <Textarea autoFocus value={value} onChange={setValue} placeholder={_l('自定义页面描述')} />
      <div className="btns">
        <Button size="small" type="link" onClick={onCancel}>
          {_l('取消')}
        </Button>
        <Button size="small" onClick={() => onOk(value)}>
          {_l('确定')}
        </Button>
      </div>
    </PageDescWrap>
  );
}
