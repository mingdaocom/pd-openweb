import React from 'react';
import { arrayOf, func, shape, string } from 'prop-types';
import styled from 'styled-components';

const Con = styled.div`
  display: flex;
  align-items: center;
  height: 32px;
  line-height: 32px;
  border: 1px solid #ddd !important;
  border-radius: 4px;
  background-color: #f5f5f5;
  padding: 0 12px;
  color: #bdbdbd;
  cursor: not-allowed;
`;

export default function UnNormal() {
  return <Con> {_l('字段配置出错')}</Con>;
}

UnNormal.propTypes = {
  control: shape({}),
  values: arrayOf(string),
  onChange: func,
};
