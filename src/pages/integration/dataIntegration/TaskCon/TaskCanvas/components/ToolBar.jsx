import React, { Component } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';

const SCALE_LIMIT = {
  min: 50,
  max: 100,
};

const ToolBarWrap = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  bottom: 32px;
  right: 24px;
  height: 32px;
  z-index: 1;
  &.isOpenEdit {
    bottom: 427px;
  }
  .toolItem {
    height: 32px;
    text-align: center;
    border: 1px solid var(--color-border-primary);
    border-radius: 3px;
    .icon {
      background: var(--color-background-primary);
      width: 32px;
      line-height: 30px;
      border-radius: 3px;
      &.bL {
        border-left: 1px solid var(--color-border-primary);
      }
    }
  }
  .adjustScale {
    display: flex;
    align-items: center;
    .searchIcon {
      color: var(--color-text-secondary);
    }
  }
  .genScreenshot {
    cursor: pointer;
  }
  .disableAdjustSize {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .scale {
    width: 36px;
    font-size: 13px;
    color: var(--color-text-title);
  }
`;

export default class ToolBar extends Component {
  adjustSize = type => {
    const { scale, onClick } = this.props;
    const nextScale = type === 'shrink' ? Math.max(SCALE_LIMIT.min, scale - 10) : Math.min(SCALE_LIMIT.max, scale + 10);
    onClick('adjustScale', { scale: nextScale });
  };
  render() {
    const { scale, onClick, isOpenEdit } = this.props;
    return (
      <ToolBarWrap className={cx('flexRow valignWrappe', { isOpenEdit })}>
        <Tooltip title={_l('导出为图片')}>
          <Icon
            icon="download"
            className="textSecondary Font18 mRight14 pointer"
            onClick={() => onClick('genScreenshot')}
          />
        </Tooltip>
        <div className="toolItem adjustScale mLeft16">
          <Tooltip title={_l('放大')}>
            <Icon
              className={cx('Font19 textSecondary pointer', {
                disableAdjustSize: scale >= SCALE_LIMIT.max,
              })}
              icon="add"
              onClick={() => scale < SCALE_LIMIT.max && this.adjustSize('enlarge')}
            />
          </Tooltip>
          <Tooltip title={_l('缩小')}>
            <Icon
              className={cx('Font19 textSecondary pointer bL', {
                disableAdjustSize: scale <= SCALE_LIMIT.min,
              })}
              icon="minus"
              onClick={() => scale > SCALE_LIMIT.min && this.adjustSize('shrink')}
            />
          </Tooltip>
        </div>
        <div className="scale mLeft16">{`${scale}%`}</div>
      </ToolBarWrap>
    );
  }
}
