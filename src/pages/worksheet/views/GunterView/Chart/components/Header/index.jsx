import React, { Component, createRef, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Skeleton } from 'ming-ui/antd-components';
import MajorAxisLabel from '../MajorAxisLabel';
import MinorAxisLabel from '../MinorAxisLabel';
import Today from '../Today';

const defaultStickyYearLabelWidth = 76;
const isGunterExport = location.href.includes('gunterExport');
let GunterChartHeader = class GunterChartHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stickyYearLabel: '',
      hiddenMajorAxisTime: '',
    };
    this.stickyYearLabelFrame = null;
    this.boundChartScroll = null;
    this.$stickyYearLabelRef = createRef(null);
    this.stickyYearLabelWidth = 0;
  }
  componentDidMount() {
    this.bindChartScroll();
    this.updateStickyYearLabel();
  }
  componentDidUpdate(prevProps) {
    const { gunterView } = this.props;
    const { gunterView: prevGunterView } = prevProps;
    if (gunterView.chartScroll !== prevGunterView.chartScroll) {
      this.unbindChartScroll(prevGunterView.chartScroll);
      this.bindChartScroll();
    }
    if (
      gunterView.periodType !== prevGunterView.periodType ||
      gunterView.loading !== prevGunterView.loading ||
      gunterView.periodParentList !== prevGunterView.periodParentList
    ) {
      this.scheduleUpdateStickyYearLabel();
    }
    this.updateStickyYearLabelWidth();
  }
  componentWillUnmount() {
    this.unbindChartScroll();
    if (this.stickyYearLabelFrame) {
      cancelAnimationFrame(this.stickyYearLabelFrame);
    }
  }
  bindChartScroll() {
    const { chartScroll } = this.props.gunterView;
    if (!chartScroll || !chartScroll.on || this.boundChartScroll === chartScroll) {
      return;
    }
    chartScroll.on('scroll', this.scheduleUpdateStickyYearLabel);
    this.boundChartScroll = chartScroll;
  }
  unbindChartScroll(scroll = this.boundChartScroll) {
    if (scroll && scroll.off) {
      scroll.off('scroll', this.scheduleUpdateStickyYearLabel);
    }
    if (scroll === this.boundChartScroll) {
      this.boundChartScroll = null;
    }
  }
  shouldShowStickyYearLabel() {
    const { loading, chartScroll, periodParentList } = this.props.gunterView;
    return !isGunterExport && !loading && chartScroll && !_.isEmpty(chartScroll) && !_.isEmpty(periodParentList);
  }
  getStickyYearLabelData() {
    if (!this.shouldShowStickyYearLabel()) {
      return {
        stickyYearLabel: '',
        hiddenMajorAxisTime: '',
      };
    }
    const { chartScroll, periodParentList } = this.props.gunterView;
    const stickyRight = Math.abs(chartScroll.x || 0) + (this.stickyYearLabelWidth || defaultStickyYearLabelWidth);
    let left = 0;
    for (const item of periodParentList) {
      const right = left + item.width;
      if (stickyRight >= left && stickyRight < right) {
        return {
          stickyYearLabel: item.time,
          hiddenMajorAxisTime: item.time,
        };
      }
      left = right;
    }
    const lastTime = _.get(_.last(periodParentList), 'time', '');
    return {
      stickyYearLabel: lastTime,
      hiddenMajorAxisTime: lastTime,
    };
  }
  scheduleUpdateStickyYearLabel = () => {
    if (this.stickyYearLabelFrame) {
      return;
    }
    this.stickyYearLabelFrame = requestAnimationFrame(() => {
      this.stickyYearLabelFrame = null;
      this.updateStickyYearLabel();
    });
  };
  updateStickyYearLabel = () => {
    const stickyYearLabelData = this.getStickyYearLabelData();
    if (
      stickyYearLabelData.stickyYearLabel !== this.state.stickyYearLabel ||
      stickyYearLabelData.hiddenMajorAxisTime !== this.state.hiddenMajorAxisTime
    ) {
      this.setState(stickyYearLabelData);
    }
  };
  updateStickyYearLabelWidth() {
    const stickyYearLabelWidth = _.get(this.$stickyYearLabelRef, 'current.offsetWidth') || 0;
    if (stickyYearLabelWidth && stickyYearLabelWidth !== this.stickyYearLabelWidth) {
      this.stickyYearLabelWidth = stickyYearLabelWidth;
      this.scheduleUpdateStickyYearLabel();
    }
  }
  renderContent() {
    const { periodType, periodList, periodParentList } = this.props.gunterView;
    const { hiddenMajorAxisTime } = this.state;
    return (
      <Fragment>
        <div className="majorTimeAxis flexRow">
          {periodParentList.map((item, index) => (
            <MajorAxisLabel key={index} item={item} periodType={periodType} hiddenTime={hiddenMajorAxisTime} />
          ))}
        </div>
        <div className="minorTimeAxis flexRow">
          {periodList.map((item, index) => (
            <MinorAxisLabel key={index} item={item} periodType={periodType} />
          ))}
        </div>
      </Fragment>
    );
  }
  renderStickyYearLabel() {
    const { stickyYearLabel } = this.state;

    if (!stickyYearLabel || !this.shouldShowStickyYearLabel()) {
      return null;
    }

    return (
      <div className="stickyYearLabel" ref={this.$stickyYearLabelRef}>
        {stickyYearLabel}
      </div>
    );
  }
  renderLoading() {
    return (
      <Skeleton
        className="pAll20"
        title={false}
        style={{
          flex: 1,
        }}
        active
        paragraph={{
          rows: 1,
          width: ['100%'],
        }}
      />
    );
  }
  render() {
    const { gunterView } = this.props;
    const { loading, periodList, chartScroll } = gunterView;
    const wrapperWidth = periodList.length ? periodList.map(item => item.width).reduce((a, b) => a + b) : 0;
    return (
      <div className="gunterChartHeader">
        {loading || _.isEmpty(chartScroll) ? (
          this.renderLoading()
        ) : (
          <Fragment>
            <div className="headerWrapper">
              <div
                className="headerScroll"
                style={{
                  width: wrapperWidth,
                }}
              >
                {this.renderContent()}
              </div>
              {this.renderStickyYearLabel()}
            </div>
            <Today />
          </Fragment>
        )}
      </div>
    );
  }
};
GunterChartHeader = connect(state => ({
  ..._.pick(state.sheet, ['gunterView', 'base']),
}))(GunterChartHeader);
export default GunterChartHeader;
