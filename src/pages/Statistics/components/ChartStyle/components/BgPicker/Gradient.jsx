import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';

const Wrap = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: -10px;
  margin-bottom: -10px;
  height: 256px;
  overflow: scroll;
  margin-right: -7px;
  padding-right: 5px;
  .item {
    width: 106px;
    height: 54px;
    border-radius: 4px;
    margin: 2px 0 10px 2px;
    position: relative;
  }
  .active {
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      width: calc(100% + 4px);
      height: calc(100% + 4px);
      border: 1px solid #1677ff;
      border-radius: 3px;
    }
  }
`;

const gradientColos = [
  '180deg, #8CC5FD 0%, #E0EFFF 100%',
  '180deg, #A08EFA 0%, #E4E0FC 100%',
  '180deg, #FFD888 0%, #FFF5DF 100%',
  '180deg, #FD8B8B 0%, #FFE1E0 100%',
  '180deg, #3093F5 0%, #A6E5FF 100%',
  '180deg, #826DFE 0%, #EBA1F8 100%',
  '180deg, #FDAD17 0%, #FEEA8D 100%',
  '180deg, #FD3027 0%, #FFB575 100%',
  '131deg, #58ADFC 0%, #56F2CD 100%, #5BF5CF 100%',
  '134deg, #D38CFD 0%, rgba(94,236,253,0.9) 100%',
  '135deg, #FF9800 0%, #FCEDCA 60%, #FFF59D 100%',
  '131deg, #FFB7C5 0%, #ECC1DB 57%, #E0C8E9 100%',
  '135deg, #BDC8FE 0%, #BDC9FC 32%, #BEE5CF 71%, #BEE6CD 100%',
  '133deg, #FFCDB2 0%, #FECDAF 0%, #FFB7C5 3%, #BDE0FE 100%',
  '133deg, #C9E2F0 0%, #F5F5DC 100%',
  '133deg, #FFCDB2 0%, #F0F9FF 0%, #E0F2FE 100%',
  '133deg, #3A0D27 0%, #81204F 52%, #EDA38F 100%',
  '133deg, #8FBC8F 0%, #228B22 100%',
  '47deg, #063554 0%, #1A459D 50%, #6660E0 100%',
  '47deg, #981236 0%, #291463 51%, #3C63BC 100%',
];

export default props => {
  const { value, config, onChange } = props;
  const { gradient } = config;
  return (
    <Wrap>
      {gradientColos.map(color => (
        <div
          key={color}
          className={cx('item pointer', { active: color === gradient })}
          style={{ background: `linear-gradient(${color})` }}
          onClick={() => {
            onChange({
              bgStyleValue: value,
              gradient: color,
            });
          }}
        ></div>
      ))}
    </Wrap>
  );
};
