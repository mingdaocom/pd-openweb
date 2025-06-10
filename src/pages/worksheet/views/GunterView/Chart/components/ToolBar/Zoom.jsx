import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, Tooltip } from 'ming-ui';
import * as actions from 'worksheet/redux/actions/gunterview';
import { PERIOD_TYPE, PERIODS } from 'worksheet/views/GunterView/config';
import { browserIsMobile } from 'src/utils/common';

const IconWrap = styled(Icon)`
  &.disable {
    opacity: 0.5;
    cursor: inherit;
  }
  &.hoverColor:hover:not(.disable) {
    color: #2196f3 !important;
  }
`;

@connect(
  state => ({ ..._.pick(state.sheet.gunterView, ['periodType', 'zoom']) }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class Zoom extends Component {
  constructor(props) {
    super(props);
    window.isZoom = true;
    this.isMobile = browserIsMobile();
  }
  handleReduce = () => {
    if (!window.isZoom) {
      return;
    }
    window.isZoom = false;
    const { periodType } = this.props;
    PERIODS.forEach((item, index) => {
      if (item.value === periodType) {
        const next = PERIODS[index + 1];
        if (next || item.minDayWidth > item.defaultMinDayWidth) {
          const value = item.minDayWidth - 4;
          if (next && value <= next.minDayWidth) {
            this.props.updataPeriodType(next.value);
            item.minDayWidth = item.defaultMinDayWidth;
          } else {
            item.minDayWidth = value;
            this.props.zoomGunterView();
          }
        }
      }
    });
  };
  handleAdd = () => {
    if (!window.isZoom) {
      return;
    }
    window.isZoom = false;
    const { periodType } = this.props;
    PERIODS.forEach((item, index) => {
      if (item.value === periodType) {
        const next = PERIODS[index - 1];
        if (next || item.minDayWidth < item.defaultMinDayWidth) {
          const value = item.minDayWidth + 4;
          if (next && value >= next.minDayWidth) {
            this.props.updataPeriodType(next.value);
            item.minDayWidth = item.defaultMinDayWidth;
          } else {
            item.minDayWidth = value;
            this.props.zoomGunterView();
          }
        }
      }
    });
  };
  render() {
    const { periodType } = this.props;
    const { minDayWidth, defaultMinDayWidth } = _.find(PERIODS, { value: periodType }) || {};
    const reduceDisable = periodType === PERIOD_TYPE.year && minDayWidth <= defaultMinDayWidth;
    const addDisable = periodType === PERIOD_TYPE.day && minDayWidth >= defaultMinDayWidth;
    return (
      <Fragment>
        <Tooltip disable={this.isMobile} text={<span>{_l('缩小')}</span>}>
          <IconWrap
            className={cx('Font18 Gray_75 pointer mRight12 mLeft12', {
              disable: reduceDisable,
              hoverColor: !this.isMobile,
            })}
            icon="minus"
            onClick={reduceDisable ? _.noop : this.handleReduce}
          />
        </Tooltip>
        <Tooltip disable={this.isMobile} text={<span>{_l('放大')}</span>}>
          <IconWrap
            className={cx('Font18 Gray_75 pointer mLeft6', { disable: addDisable, hoverColor: !this.isMobile })}
            icon="add1"
            onClick={addDisable ? _.noop : this.handleAdd}
          />
        </Tooltip>
      </Fragment>
    );
  }
}
