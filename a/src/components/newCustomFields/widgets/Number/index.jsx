import React, { Component } from 'react';
import Number from './number';
import { Slider } from 'ming-ui';
import NumberUtil from 'src/util/number';
import { getAdvanceSetting } from 'src/pages/widgetConfig/util/setting.js';
import { browserIsMobile } from 'src/util';

const isMobile = browserIsMobile();

export default class Widgets extends Component {
  render() {
    const {
      disabled,
      advancedSetting: { showtype, numinterval, showinput, min, max, numshow },
      value,
    } = this.props;

    if (showtype === '2') {
      const itemnames = getAdvanceSetting(this.props, 'itemnames');
      const itemcolor = getAdvanceSetting(this.props, 'itemcolor');

      return (
        <Slider
          from="recordInfo"
          disabled={disabled}
          itemnames={itemnames}
          itemcolor={itemcolor}
          showInput={isMobile ? (disabled ? false : showinput === '1') : showinput === '1'} // h5非编辑状态显示数值
          showAsPercent={numshow === '1'}
          barStyle={{ margin: '15px 0' }}
          min={NumberUtil.parseFloat(min)}
          max={NumberUtil.parseFloat(max)}
          value={NumberUtil.parseFloat(value)}
          step={NumberUtil.parseFloat(numinterval)}
          onChange={value => this.props.onChange(value)}
        />
      );
    }

    return <Number {...this.props} />;
  }
}
