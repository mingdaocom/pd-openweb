import React from 'react';
import styled from 'styled-components';

const AiLoadingWrap = styled.div`
  width: 80px;
  height: 80px;
  .aiIconCenter {
    position: absolute;
    font-size: 32px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
    background: unset;
    -webkit-text-fill-color: #fff;
  }
  .box1 {
    margin-top: -30px;
    margin-left: -30px;
    background: conic-gradient(#6e32f8, #b63ee6);
    animation: regAni 2s ease 0s infinite;
  }
  .box2 {
    border: 1px solid #d546e6;
    animation: wAni 3s cubic-bezier(0.3, 0.57, 0.56, 0.93) 0s infinite;
  }
  .box3 {
    border: 1px solid #d546e6;
    animation: wAni 3s cubic-bezier(0.3, 0.57, 0.56, 0.93) 1s infinite;
  }
  .box4 {
    border: 1px solid #d546e6;
    animation: wAni 3s cubic-bezier(0.3, 0.57, 0.56, 0.93) 2s infinite;
  }
  .box1,
  .box2,
  .box3,
  .box4 {
    position: absolute;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  @keyframes wAni {
    from {
      width: 60px;
      height: 60px;
      opacity: 1;
    }
    to {
      width: 100px;
      height: 100px;
      opacity: 0;
    }
  }

  @keyframes regAni {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export default function AiLoading() {
  return (
    <AiLoadingWrap>
      <div class="box1"></div>
      <div class="box2"></div>
      <div class="box3"></div>
      <div class="box4"></div>
      <span className="icon-ai1 aiIconCenter"></span>
    </AiLoadingWrap>
  );
}
