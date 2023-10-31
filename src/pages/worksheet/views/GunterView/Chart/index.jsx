import React, { Component, Fragment, createRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Icon, Skeleton } from 'ming-ui';
import cx from 'classnames';
import Header from './components/Header';
import ToolBar from './components/ToolBar';
import TimeBlock from './components/TimeBlock';
import TimeCanvas from './components/TimeCanvas';
import TimeDot from './components/TimeDot';
import SpeedCreateTime from './components/SpeedCreateTime';
import IScroll from 'worksheet/views/GunterView/components/Iscroll';
import * as actions from 'worksheet/redux/actions/gunterview';
import './index.less';
import _ from 'lodash';

const isGunterExport = location.href.includes('gunterExport');

@connect(
  state => ({
    ..._.pick(state.sheet, ['gunterView', 'base']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class GunterChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
    this.$ref = createRef(null);
  }
  componentDidMount() {
    const { isMobile } = this.props;
    const isIPad = navigator.userAgent.toLocaleLowerCase().includes('ipad');
    const scroll = new IScroll(this.$ref.current, {
      scrollX: true,
      scrollY: true,
      mouseWheelScrollsHorizontally: false,
      freeScroll: true,
      scrollbars: true,
      mouseWheel: true,
      bounce: false,
      momentum: false,
      disablePointer: isIPad ? false : !isMobile,
      interactiveScrollbars: true,
      probeType: 2,
    });
    if (!isGunterExport) {
      window.chartScrollLock = true;
      scroll.on('scroll', this.handleScroll);
      scroll.on('scroll', this.linkageScroll);
      scroll.on('scrollStart', () => {
        window.chartScrollLock = true;
        window.groupingScrollLock = false;
      });
      scroll.on('scrollEnd', () => {
        window.chartScrollLock = false;
        window.groupingScrollLock = true;
      });
    }
    this.props.updateChartScroll(scroll);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.gunterView.zoom !== this.props.gunterView.zoom) {
      window.isZoom = true;
      const { chartScroll, periodList } = nextProps.gunterView;
      const newWidth = periodList.reduce((count, item) => count + item.width, 0);
      const oldWidth = this.props.gunterView.periodList.reduce((count, item) => count + item.width, 0);
      const diff = oldWidth - newWidth;
      chartScroll.refresh();
      chartScroll.scrollTo(chartScroll.x + diff / 2, chartScroll.y);
      chartScroll._execEvent('scroll');
      setTimeout(() => {
        chartScroll._execEvent('scroll');
      }, 0);
      return;
    }
    if (
      nextProps.gunterView.periodType !== this.props.gunterView.periodType ||
      nextProps.gunterView.loading !== this.props.gunterView.loading ||
      nextProps.gunterView.isRefresh !== this.props.gunterView.isRefresh
    ) {
      setTimeout(() => {
        window.isZoom = true;
        const { chartScroll } = nextProps.gunterView;
        chartScroll.refresh();
        chartScroll.scrollTo(isGunterExport ? 0 : chartScroll.maxScrollX / 2, chartScroll.y);
        chartScroll._execEvent('scroll');
      }, 0);
      this.headerEl = null;
      this.timeDotWrapperEl = null;
    }
    if (nextProps.gunterView.groupingVisible !== this.props.gunterView.groupingVisible) {
      const { chartScroll } = nextProps.gunterView;
      chartScroll.refresh();
      chartScroll._execEvent('scroll');
    }
  }
  componentWillUnmount() {
    const { chartScroll } = this.props.gunterView;
    if (chartScroll) {
      chartScroll.off('scroll', this.handleScroll);
      chartScroll.off('scroll', this.linkageScroll);
      chartScroll.destroy && chartScroll.destroy();
    }
  }
  setScrollValue = value => {
    const { chartScroll } = this.props.gunterView;
    chartScroll.scrollTo(chartScroll.x + value, chartScroll.y);
    chartScroll._execEvent('scroll');
  };
  handleScroll = event => {
    const { chartScroll, viewConfig } = this.props.gunterView;
    const { loading } = this.state;
    const { periodCount } = viewConfig;
    const movePeriodCount = periodCount / 2;
    const scrollLeft = Math.abs(chartScroll.x);
    const boundary = (10 / 100) * screen.width;

    if (!chartScroll.enabled) {
      return;
    }

    if (boundary >= scrollLeft && loading) {
      this.props.loadLeftPeriodList();
      this.setState(
        {
          loading: false,
        },
        () => {
          const { periodList } = this.props.gunterView;
          const value = periodList
            .slice(0, movePeriodCount)
            .map(item => item.width)
            .reduce((a, b) => a + b);
          this.setScrollValue(-value);
        },
      );
      return;
    }

    if (scrollLeft >= chartScroll.scrollerWidth - chartScroll.wrapperWidth - boundary && loading) {
      this.props.loadRightPeriodList();
      this.setState(
        {
          loading: false,
        },
        () => {
          const { periodList } = this.props.gunterView;
          const value = periodList
            .slice(periodList.length - movePeriodCount)
            .map(item => item.width)
            .reduce((a, b) => a + b);
          this.setScrollValue(value);
        },
      );
      return;
    }

    if (!loading) {
      this.setState({
        loading: true,
      });
    }

    const { viewId } = this.props.base;
    if (!this.headerEl) {
      this.headerEl = document.querySelector(`.gunterView-${viewId} .gunterChartHeader .headerScroll`);
    }
    if (!this.timeDotWrapperEl) {
      this.timeDotWrapperEl = document.querySelector(`.gunterView-${viewId} .gunterChart .timeDotWrapper`);
    }
    this.headerEl && (this.headerEl.style.transform = `translateX(${chartScroll.x}px)`);
    this.timeDotWrapperEl && (this.timeDotWrapperEl.style.transform = `translateY(${chartScroll.y}px)`);
  };
  linkageScroll = () => {
    const { groupingScroll, chartScroll } = this.props.gunterView;
    if (window.groupingScrollLock) {
      return;
    }
    if (groupingScroll) {
      groupingScroll.scrollTo(groupingScroll.x, chartScroll.y);
      groupingScroll._execEvent('scroll');
    }
  };
  handleUpdateGroupingVisible = () => {
    this.props.updateGroupingVisible();
  };
  renderContent() {
    const { gunterView } = this.props;
    const { grouping, withoutArrangementVisible } = gunterView;
    return (
      <div className="Relative">
        <TimeCanvas />
        <TimeBlock />
        {withoutArrangementVisible && <SpeedCreateTime />}
      </div>
    );
  }
  renderLoading() {
    return (
      <div className="Relative w100">
        <Skeleton
          style={{ flex: 1 }}
          direction="column"
          widths={['30%', '40%', '90%', '60%']}
          active
          itemStyle={{ marginBottom: '10px' }}
        />
        <Skeleton
          style={{ flex: 1 }}
          direction="column"
          widths={['40%', '55%', '100%', '80%']}
          active
          itemStyle={{ marginBottom: '10px' }}
        />
        <Skeleton
          style={{ flex: 2 }}
          direction="column"
          widths={['45%', '100%', '100%', '100%']}
          active
          itemStyle={{ marginBottom: '10px' }}
        />
      </div>
    );
  }
  render() {
    const { base, gunterView, isMobile } = this.props;
    const { loading, grouping, groupingVisible, chartScroll, groupingScroll } = gunterView;
    return (
      <div className="gunterChart flexColumn flex">
        <Header />
        <div className="flex Relative overflowHidden">
          <div className="gunterChartWrapper" ref={this.$ref}>
            <div className={cx('gunterChartScroller', { w100: loading })}>{!loading && this.renderContent()}</div>
          </div>
          {loading && this.renderLoading()}
          {!loading && (
            <Fragment>
              <TimeDot />
              <ToolBar isMobile={isMobile} />
            </Fragment>
          )}
          {!isMobile && (
            <div
              className={cx('gunterDivider valignWrapper pointer', { hideGrouping: !groupingVisible })}
              onClick={this.handleUpdateGroupingVisible}
              onMouseOver={() => {
                if (!groupingVisible) return;
                document.querySelector(`.gunterView-${base.viewId} .gunterDirectory`).style.borderColor = '#2196f3';
              }}
              onMouseOut={() => {
                if (!groupingVisible) return;
                document.querySelector(`.gunterView-${base.viewId} .gunterDirectory`).style.borderColor = null;
              }}
            >
              <Icon className="Gray_bd" icon="a-arrowback" />
            </div>
          )}
        </div>
      </div>
    );
  }
}
