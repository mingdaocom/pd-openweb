import React from 'react';
import styled from 'styled-components';

const Con = styled.div`
  display: inline-block;
  margin: 5px 10px 5px 0;
  position: relative;
  background: #f0f0f0;
  border-radius: 5px;
  max-width: 97%;
  padding: 0 12px;
  box-sizing: border-box;
  height: 32px;
  line-height: 32px;
`;

const DeleteButton = styled.span`
  position: absolute;
  top: -5px;
  right: -8px;
  font-size: 20px;
  color: #757575;
  line-height: 1em;
  overflow: hidden;
`;

const Title = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: #151515;
  width: 100%;
`;

function click(func) {
  return e => {
    e.stopPropagation();
    func();
  };
}

export default function RecordTag(props) {
  const { disabled, title, onClick, onDelete } = props;

  return (
    <Con onClick={onClick}>
      {!disabled && (
        <DeleteButton onClick={click(onDelete)}>
          <i className="icon icon-minus-square"></i>
        </DeleteButton>
      )}
      <Title className="ellipsis" title={title}>
        {title}
      </Title>
    </Con>
  );
}
