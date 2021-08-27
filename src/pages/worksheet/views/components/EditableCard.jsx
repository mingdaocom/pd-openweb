import React, { forwardRef, useState, useEffect } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import BaseCard from './BaseCard';

const EditableCardWrap = styled.div`
  position: relative;
  &:hover {
    .editTitleText,
    .recordOperateWrap {
      visibility: visible;
    }
  }
  .editTitleText {
    position: absolute;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.9);
    right: 20px;
    top: 12px;
    visibility: hidden;
    text-align: center;
    line-height: 24px;
    color: #9e9e9e;
    cursor: pointer;
    i {
      vertical-align: text-top;
    }
    &:hover {
      color: #2196f3;
    }
  }
`;

const EditableCard = forwardRef((props, ref) => {
  return (
    <EditableCardWrap ref={ref}>
      <BaseCard {...props} />
    </EditableCardWrap>
  );
});

export default EditableCard;
