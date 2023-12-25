import React from 'react';
import styled from 'styled-components';

const Com = styled.span`
  display: inline-block;
  font-size: 12px;
  padding: 0 3px;
  color: #fff;
  background: #67ad5b;
  border-radius: 2px 2px 2px 2px;
  height: 16px;
  line-height: 14px;
  margin-left: 5px;
  vertical-align: middle;
`;

export default function Beta({ className }) {
  return <Com className={className}>beta</Com>;
}
