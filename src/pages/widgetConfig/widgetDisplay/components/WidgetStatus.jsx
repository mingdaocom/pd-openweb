import React, { useState, useEffect } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';

const StatusWrap = styled.div`
  max-height: 18px;
  i {
    font-size: 18px;
    margin-left: 6px;
    &:first-child {
      margin-left: ${props => (props.showTitle ? '6px' : '0px')};
    }
    &.title {
      color: #2196f3;
    }
  }
`;

export default function WidgetStatus({ data, showTitle }) {
  let { fieldPermission } = data;
  fieldPermission = fieldPermission || '111';
  const [visible, editable, canAdd] = fieldPermission.split('');
  return (
    <StatusWrap showTitle={showTitle}>
      {data.attribute === 1 && <i className="title icon-ic_title"></i>}
      {[visible, canAdd].some(i => i === '0') && (
        <i className="icon-workflow_hide" style={{ color: visible === '0' ? '#9e9e9e' : '#ffa340' }}></i>
      )}
    </StatusWrap>
  );
}
