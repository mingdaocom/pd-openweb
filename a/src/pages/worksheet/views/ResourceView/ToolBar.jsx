import React, { Component } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon, Tooltip } from 'ming-ui';
import { types, resourceTypes } from './config';
import { browserIsMobile } from 'src/util';

const ToolBarWrap = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  bottom: ${props => (!props.isM ? 32 : 20)}px;
  left: ${props => (!props.isM ? props.left + 24 : 16)}px;
  height: 32px;
  z-index: 1;
  background-color: #fff;
  border-radius: 26px;
  height: 44px;
  padding: 0 22px 0 16px;
  z-index: 9;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.16);
`;

export default function ToolBar(props) {
  const { onClick, onChangeType, view } = props;
  const isM = browserIsMobile();
  return (
    <ToolBarWrap className={cx('flexRow valignWrappe')} left={props.left} isM={isM}>
      {!isM && (
        <Tooltip text={<span>{_l('导出为图片')}</span>}>
          <Icon icon="download" className="Gray_75 Font18 pointer" onClick={() => onClick('genScreenshot')} />
        </Tooltip>
      )}
      {resourceTypes.map(o => {
        const type =
          localStorage.getItem(`${view.viewId}_resource_type`) ||
          types[_.get(view, 'advancedSetting.calendarType') || 0];
        return (
          <div
            className={cx(
              'Hand ThemeHoverColor3 Bold',
              type === o.value ? 'ThemeColor3' : 'Gray_75',
              isM ? 'mLeft10' : 'mLeft20',
            )}
            onClick={() => onChangeType(o.value)}
          >
            {o.text}
          </div>
        );
      })}
    </ToolBarWrap>
  );
}
