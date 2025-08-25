import React from 'react';
import styled from 'styled-components';
import EmptyImg from '../image/empty.png';

const Container = styled.div`
  font-size: 16px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #757575;
  .imgCon {
    width: 114px;
    height: 118px;
    margin-bottom: 16px;
    img {
      width: 100%;
      height: 100%;
    }
  }
`;

export default function GlobalSearchEmpty(props) {
  const { text, positionStyle } = props;

  return (
    <Container
      style={{
        ...positionStyle,
      }}
    >
      <div className="imgCon">
        <img src={EmptyImg} />
      </div>
      {text ? text : _l('没有搜索结果')}
    </Container>
  );
}
