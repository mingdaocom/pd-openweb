import React, { Component } from 'react';
import { string, number, func } from 'prop-types';
import styled from 'styled-components';
import cx from 'classnames';
import { Dropdown, Icon } from 'ming-ui';
import { FlexCenter } from 'worksheet/styled';
import { getItem, setItem } from './util';

const SCALE_LIMIT = {
  min: 50,
  max: 100,
};

const ToolBarWrap = styled(FlexCenter)`
  position: absolute;
  bottom: 50px;
  left: 24px;
  background-color: #fff;
  border-radius: 18px;
  height: 36px;
  padding: 0 10px;
  z-index: 9;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.16);
  .adjustScale {
    display: flex;
    align-items: center;
  }
  .toOrigin {
    margin: 0 12px;
  }
  .shrink {
    margin: 0 12px;
  }
  .genScreenshot,
  .toOrigin,
  .shrink,
  .enlarge {
    cursor: pointer;
  }
  .shrink,
  .enlarge {
    color: #757575;
    &.disableAdjustSize {
      color: #bdbdbd;
      cursor: not-allowed;
    }
  }
  .scale {
    font-size: 13px;
    color: #515151;
  }
  .expand {
    .Dropdown--input {
      .value {
        font-size: 13px;
      }
    }
  }
`;

const DISPLAY_HIERARCHY = [
  { value: '1', text: _l('1级') },
  { value: '2', text: _l('2级') },
  { value: '3', text: _l('3级') },
  { value: '4', text: _l('4级') },
  { value: '5', text: _l('5级') },
];
export default class ToolBar extends Component {
  updateStorage = data => {
    const { viewId } = this.props.currentView;
    const config = getItem(`hierarchyConfig-${viewId}`) || {};
    setItem(`hierarchyConfig-${viewId}`, { ...config, ...data });
  };

  changeDisplayLevel = value => {
    this.props.showLevelData({ layer: value });
    this.updateStorage({ level: value });
  };

  adjustSize = type => {
    const { scale, onClick } = this.props;
    const nextScale = type === 'shrink' ? Math.max(SCALE_LIMIT.min, scale - 10) : Math.min(SCALE_LIMIT.max, scale + 10);
    onClick('adjustScale', { scale: nextScale });
    this.updateStorage({ scale: nextScale });
  };
  render() {
    const { scale, level, onClick } = this.props;
    return (
      <ToolBarWrap>
        {/* <div data-tip={_l('生成截图')} className="toolItem genScreenshot" onClick={() => onClick('genScreenshot')}>
          <Icon className="Font18 Gray_75" icon="15_2_picture" />
        </div> */}
        <div className="toolItem expand">
          <Dropdown
            renderTitle={() => <span>{level ? _l('%0级', level) : _l('展开')}</span>}
            value={level}
            data={DISPLAY_HIERARCHY}
            onChange={this.changeDisplayLevel}
          />
        </div>
        {/* <div data-tip={_l('回到原点')} className="toolItem toOrigin" onClick={() => onClick('toOrigin')}>
          <Icon className="Font16 Gray_75" icon="Position" />
        </div> */}
        <div className="toolItem adjustScale">
          <div className="scale">{`${scale}%`}</div>
          <div
            data-tip={_l('缩小')}
            className={cx('shrink', {
              disableAdjustSize: scale <= SCALE_LIMIT.min,
            })}
            onClick={() => scale > SCALE_LIMIT.min && this.adjustSize('shrink')}
          >
            <Icon icon="maximizing_a2" />
          </div>
          <div
            data-tip={_l('放大')}
            className={cx('enlarge', {
              disableAdjustSize: scale >= SCALE_LIMIT.max,
            })}
            onClick={() => scale < SCALE_LIMIT.max && this.adjustSize('enlarge')}
          >
            <Icon icon="plus" />
          </div>
        </div>
      </ToolBarWrap>
    );
  }
}
