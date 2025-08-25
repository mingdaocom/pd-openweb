import React from 'react';
import { bool } from 'prop-types';
import styled from 'styled-components';

const Con = styled.div`
  position: relative;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid #ddd;
  background: #fff;
  .line {
    position: absolute;
    left: 3px;
    top: 6.5px;
    height: 1px;
    width: 8px;
    background: #757575;
  }
  .line-vertical {
    transform: rotate(${({ folded }) => (folded ? '90deg' : '0deg')});
  }
  .line-horizontal {
    transform: rotate(${({ folded }) => (folded ? '180deg' : '0deg')});
  }
  &:hover {
    border-color: #1677ff;
    .line {
      background: #1677ff;
      transition: transform 0.2s ease-in;
    }
  }
`;

function CollapseExpandButton(props) {
  const { folded } = props;
  return (
    <Con folded={folded}>
      <div className="line line-vertical"></div>
      <div className="line line-horizontal"></div>
    </Con>
  );
}

CollapseExpandButton.propTypes = {
  folded: bool,
};

export default CollapseExpandButton;
