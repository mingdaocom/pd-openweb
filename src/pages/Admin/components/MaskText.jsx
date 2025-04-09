import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';

const MaskTextWrap = styled.span`
  .eyeIcon {
    width: 20px;
    height: 20px;
    font-size: 14px;
    display: inline-block;
    text-align: center;
    vertical-align: middle;
    line-height: 20px;
    border-radius: 50%;
    &:hover {
      background: rgb(245, 245, 245);
    }
  }
`;

export default function MaskText({ text }) {
  const [isMasked, setIsMasked] = useState(true);

  const handleMask = () => setIsMasked(!isMasked);

  return (
    <MaskTextWrap>
      {isMasked ? '*****' : text}
      <Icon icon={isMasked ? 'eye_off' : 'eye'} className="mLeft8 eyeIcon Hand Gray_9e" onClick={handleMask} />
    </MaskTextWrap>
  );
}
