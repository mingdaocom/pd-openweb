import React, { Component } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, Tooltip } from 'ming-ui';
import { browserIsMobile } from 'src/utils/common';
import { resourceTypes, types } from './config';

const ToolBarWrap = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  bottom: 20px;
  left: ${props => (!props.isM ? 'auto' : '16px')};
  right: ${props => (!props.isM ? '20px' : 'auto')};
  z-index: 1;
  background-color: #fff;
  border-radius: 26px;
  z-index: 11;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.16);
  padding: 0 10px;
  .H40 {
    height: 40px;
    line-height: 40px;
    padding: 0 ${props => (props.isM ? '3px' : '10px')};
  }
`;

export default function ToolBar(props) {
  const { onClick, onChangeType, view } = props;
  const isM = browserIsMobile();
  return (
    <ToolBarWrap className={cx('flexRow valignWrappe')} left={props.left} isM={isM}>
      {!isM && (
        <Tooltip text={<span>{_l('导出为图片')}</span>}>
          <Icon
            icon="download"
            className="Gray_75 Font18 pointer pLeft16 H40"
            onClick={() => onClick('genScreenshot')}
          />
        </Tooltip>
      )}
      {resourceTypes.map((o, i) => {
        const type =
          localStorage.getItem(`${view.viewId}_resource_type`) ||
          types[_.get(view, 'advancedSetting.calendarType') || 0];
        return (
          <div
            className={cx('Hand ThemeHoverColor3 Bold H40', type === o.key ? 'ThemeColor3' : 'Gray_75', {
              pRight20: !isM && i >= resourceTypes.length - 1,
              pLeft10: isM,
              pRight10: isM,
            })}
            onClick={() => onChangeType(o.key)}
          >
            {o.text}
          </div>
        );
      })}
    </ToolBarWrap>
  );
}
