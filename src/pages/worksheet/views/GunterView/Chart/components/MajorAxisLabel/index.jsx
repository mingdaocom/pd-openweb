import React, { Fragment, Component, createRef } from 'react';
import styled from 'styled-components';
import { PERIOD_TYPE } from 'worksheet/views/GunterView/config';
import { connect } from 'react-redux';
import _ from 'lodash';

const AxisLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  background: #fff;
`;

const YearLabel = styled.div`
  position: absolute;
  left: 0;
  font-size: 14px;
  font-weight: 500;
`;

const paddingLeft = 15;

const isGunterExport = location.href.includes('gunterExport');

@connect(
  state => ({
    ..._.pick(state.sheet.gunterView, ['chartScroll']),
  })
)
export default class MajorAxisLabel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isyear: false,
      reset: true
    }
    this.$axisRef = createRef(null);
  }
  componentDidMount() {
    const { chartScroll } = this.props;
    if (!isGunterExport) {
      chartScroll.on('scroll', this.onScroll);
      this.setState({ reset: true });
    }
  }
  componentWillUnmount() {
    const { chartScroll } = this.props;
    chartScroll.off('scroll', this.onScroll);
  }
  onScroll = (type) => {
    const { item, periodType, chartScroll } = this.props;
    const [ y, m ] = item.time.split('-');
    const yearVisible = [PERIOD_TYPE.day, PERIOD_TYPE.week].includes(periodType) && !isGunterExport;
    const width = 38;  // YearLabel width
    const scrollLeft = Math.abs(chartScroll.x - paddingLeft) + (yearVisible ? width : 0);
    const currentEl = this.$axisRef.current;
    const { offsetLeft, offsetWidth } = currentEl;
    if (scrollLeft >= offsetLeft && scrollLeft <= offsetLeft + offsetWidth) {
      this.setState({ reset: true, isyear: false });
      const value = scrollLeft - offsetLeft;
      currentEl.style.textIndent = `${value}px`;
    } else if (this.state.reset) {
      this.setState({ isyear: m === '01' });
      currentEl.style.textIndent = null;
      this.setState({ reset: false });
    } else {
      this.setState({ isyear: m === '01' });
    }
  }
  renderYearLabel() {
    const { item, chartScroll } = this.props;
    const [ y, m ] = item.time.split('-');

    if (this.state.reset) {
      const left = Math.abs(chartScroll.x);
      return (
        <YearLabel style={{ paddingLeft, transform: `translateX(${left}px)` }}>{`${y}-`}</YearLabel>
      );
    } else {
      return null;
    }
  }
  renderName() {
    const { item, periodType } = this.props;
    const [ y, m ] = item.time.split('-');
    if (this.state.isyear || ![PERIOD_TYPE.day, PERIOD_TYPE.week].includes(periodType) || isGunterExport) {
      return item.time;
    }
    return m;
  }
  render() {
    const { item, periodType } = this.props;
    return (
      <Fragment>
        {[PERIOD_TYPE.day, PERIOD_TYPE.week].includes(periodType) && !isGunterExport && this.renderYearLabel()}
        <AxisLabel
          ref={this.$axisRef}
          style={{ width: item.width }}
        >
          {this.renderName()}
        </AxisLabel>
      </Fragment>
    );
  }
}
