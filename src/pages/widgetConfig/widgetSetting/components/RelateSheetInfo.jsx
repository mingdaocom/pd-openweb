import React, { useState, useEffect } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import cx from 'classnames';
import { toEditWidgetPage } from '../../util';

const RelateInfo = styled.div`
  display: flex;
  align-items: center;
  margin-top: 12px;
  .text {
    margin: 0 6px;
  }
  .name {
    max-width: 220px;
    &.needLink {
      cursor: pointer;
      color: #2196f3;
    }
  }
`;

export default function RelateSheetInfo({ name, id, appName }) {
  return (
    <RelateInfo>
      <i className="icon-link_record Font16 Gray_9e"></i>
      <div className="text">{_l('工作表')}</div>
      <div
        className={cx('name Bold overflow_ellipsis', { needLink: !!id })}
        onClick={() => id && toEditWidgetPage({ sourceId: id, fromURL: 'newPage' })}
      >
        {name}
      </div>
      {appName && <div className="mLeft6">({appName})</div>}
    </RelateInfo>
  );
}
