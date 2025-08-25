import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import ConnectAvator from './ConnectAvator';

const Wrap = styled.div(
  ({ w }) => `
  width: ${w < 320 ? 320 : w}px;
  // height: 220px;
  background: #ffffff;
  border: 1px solid #EAEAEA;
  border-radius: 8px;
  padding: 24px 24px 0 24px;
  margin: 0 24px 24px 0;
  box-sizing: border-box;
  &.mMargin {
    margin: 0 0 24px 0;
  }
  &:hover{
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.16);
  }
  .cardDes {
    height: 30px;
    .imgCon {
      width: 32px;
      height: 32px;
      background: rgba(0,0,0,0.1);
      border-radius: 50%;
      overflow: hidden;
      line-height: 32px;
      text-align: center;
      font-size: 16px;
    }
    .addConnect {
      width: 66px;
      height: 30px;
      background: rgba(33, 150, 243, 0.08);
      border-radius: 20px;
      color: #1677ff;
      text-align: center;
      line-height: 30px;
    }
  }
  .des{
    .title {
      font-weight: 600;
    }
    .txt {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      height: 40px;
      margin:0;
      overflow: hidden;
    }
  }
`,
);

function Card(props) {
  let n = Math.floor(props.w / (320 + 24)) < 1 ? 1 : Math.floor(props.w / (320 + 24)); //一行几个
  return (
    <Wrap
      w={Math.floor((props.w - 24 * (n - 1)) / n)}
      className={cx('InlineBlock', {
        mMargin: props.i % n === 0,
      })}
      onClick={props.onClick}
    >
      <div className="flexRow cardDes">
        <div className="flex">
          <ConnectAvator {...props} width={32} size={22} />
        </div>
        <span className="addConnect Hand">{_l('安装')}</span>
      </div>
      <div className="des mTop20">
        <p className="title breakAll Font20 overflow_ellipsis">{props.name}</p>
        <p className="txt mTop8 Gray_75 breakAll" style={{ WebkitBoxOrient: 'vertical' }}>
          {props.explain}
        </p>
        <p className="tipTxt Gray_75 mTop20 breakAll overflow_ellipsis">
          {_l('%0 次安装·包含 %1 API', props.installCount || 0, props.apiCount)}
        </p>
      </div>
    </Wrap>
  );
}

export default Card;
