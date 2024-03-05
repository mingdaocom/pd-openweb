import React, { Component } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon, Tooltip } from 'ming-ui';
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
    border: 1px solid #dddddd;
    border-radius: 3px;
    .icon {
      background: #fff;
      width: 32px;
      line-height: 30px;
      border-radius: 3px;
      &.bL {
        border-left: 1px solid #dddddd;
      }
    }
  }
  .adjustScale {
    display: flex;
    align-items: center;
    .searchIcon {
      color: #757575;
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
    color: #515151;
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
        <Tooltip text={<span>{_l('导出为图片')}</span>}>
          <Icon icon="download" className="Gray_75 Font18 mRight14 pointer" onClick={() => onClick('genScreenshot')} />
        </Tooltip>
        <div className="toolItem adjustScale mLeft16">
          <Tooltip text={<span>{_l('放大')}</span>}>
            <Icon
              className={cx('Font19 Gray_75 pointer', {
                disableAdjustSize: scale >= SCALE_LIMIT.max,
              })}
              icon="add"
              onClick={() => scale < SCALE_LIMIT.max && this.adjustSize('enlarge')}
            />
          </Tooltip>
          <Tooltip text={<span>{_l('缩小')}</span>}>
            <Icon
              className={cx('Font19 Gray_75 pointer bL', {
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
