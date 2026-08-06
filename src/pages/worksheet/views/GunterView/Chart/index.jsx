import React, { Component, createRef, Fragment, useMemo } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, Skeleton } from 'ming-ui';
import useButtonStatusOfRows from 'worksheet/hooks/useButtonStatusOfRows';
import * as actions from 'worksheet/redux/actions/gunterview';
import IScroll from 'worksheet/views/GunterView/components/Iscroll';
import {
  isGroupingScrollLocked,
  setChartScrollLock,
  setGroupingScrollLock,
} from 'worksheet/views/GunterView/scrollState';
import {
  filterButtonBySheetSwitchPermit,
  getSheetOperateButtonIds,
  getSheetOperatesButtons,
} from 'src/utils/worksheet';
import Header from './components/Header';
import SpeedCreateTime from './components/SpeedCreateTime';
import TimeBlock from './components/TimeBlock';
import TimeCanvas from './components/TimeCanvas';
import TimeDot from './components/TimeDot';
import ToolBar from './components/ToolBar';
import './index.less';

const isGunterExport = location.href.includes('gunterExport');

class GunterChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
    this.$ref = createRef(null);
  }
  componentDidMount() {
    const { isMobile } = this.props;
    const scroll = new IScroll(this.$ref.current, {
      scrollX: true,
      scrollY: true,
      mouseWheelScrollsHorizontally: false,
      freeScroll: true,
      scrollbars: true,
      mouseWheel: true,
      bounce: false,
      momentum: false,
      disablePointer: window.isIPad ? false : !isMobile,
      interactiveScrollbars: true,
      probeType: 2,
    });

    if (!isGunterExport) {
      setChartScrollLock(true);
      scroll.on('scroll', this.handleScroll);
      scroll.on('scroll', this.linkageScroll);
      scroll.on('scrollStart', () => {
        setChartScrollLock(true);
        setGroupingScrollLock(false);
      });
      scroll.on('scrollEnd', () => {
        setChartScrollLock(false);
        setGroupingScrollLock(true);
      });
    }

    if (window.isWindows) {
      window.addEventListener('wheel', this.handleWheel);
    }

    this.props.updateChartScroll(scroll);
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.gunterView.zoom !== prevProps.gunterView.zoom) {
        window.isZoom = true;
        const { chartScroll, periodList } = this.props.gunterView;
        const newWidth = periodList.reduce((count, item) => count + item.width, 0);
        const oldWidth = prevProps.gunterView.periodList.reduce((count, item) => count + item.width, 0);
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
        this.props.gunterView.periodType !== prevProps.gunterView.periodType ||
        this.props.gunterView.loading !== prevProps.gunterView.loading ||
        this.props.gunterView.isRefresh !== prevProps.gunterView.isRefresh
      ) {
        setTimeout(() => {
          window.isZoom = true;
          const { chartScroll } = this.props.gunterView;
          chartScroll.refresh();
          chartScroll.scrollTo(isGunterExport ? 0 : chartScroll.maxScrollX / 2, chartScroll.y);

          chartScroll._execEvent('scroll');
        }, 0);
        this.headerEl = null;
        this.timeDotWrapperEl = null;
      }

      if (this.props.gunterView.groupingVisible !== prevProps.gunterView.groupingVisible) {
        const { chartScroll, groupingScroll } = this.props.gunterView;
        chartScroll.refresh();

        chartScroll._execEvent('scroll');

        if (this.props.gunterView.groupingVisible) {
          setTimeout(() => {
            const controlHeader = document.querySelector(
              `.gunterView-${this.props.base.viewId} .groupingControlHeader`,
            );
            groupingScroll.refresh();

            groupingScroll._execEvent('scroll');

            if (controlHeader) {
              controlHeader.style.width = `${groupingScroll.scrollerWidth}px`;
              controlHeader.classList.remove('hide');
            }
          }, 0);
        }
      }
    }
  }
  componentWillUnmount() {
    const { chartScroll } = this.props.gunterView;

    if (chartScroll) {
      chartScroll.off('scroll', this.handleScroll);
      chartScroll.off('scroll', this.linkageScroll);
      chartScroll.destroy && chartScroll.destroy();
    }

    if (window.isWindows) {
      window.removeEventListener('wheel', this.handleWheel);
    }
  }
  setScrollValue = value => {
    const { chartScroll } = this.props.gunterView;
    chartScroll.scrollTo(chartScroll.x + value, chartScroll.y);
    chartScroll._execEvent('scroll');
  };
  handleScroll = () => {
    const { chartScroll, viewConfig, periodList } = this.props.gunterView;
    const { loading } = this.state;
    const { periodCount } = viewConfig;
    const movePeriodCount = periodCount / 2;
    const scrollLeft = Math.abs(chartScroll.x);
    const boundary = (10 / 100) * screen.width;

    if (!chartScroll.enabled || !periodList.length) {
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
            .reduce((a, b) => a + b, 0);
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
            .reduce((a, b) => a + b, 0);
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

    if (isGroupingScrollLocked()) {
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
  handleWheel = e => {
    const { chartScroll } = this.props.gunterView;

    if (e.shiftKey) {
      if (e.deltaY >= 0) {
        chartScroll.scrollTo(chartScroll.x - 30, chartScroll.y);
      } else {
        chartScroll.scrollTo(chartScroll.x + 30, chartScroll.y);
      }
    }
  };
  renderContent() {
    const { gunterView, buttonsCheckStatus } = this.props;
    const { withoutArrangementVisible } = gunterView;
    return (
      <div className="Relative">
        <TimeCanvas />
        <TimeBlock buttonsCheckStatus={buttonsCheckStatus} />
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
    const { loading, groupingVisible } = gunterView;
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
                const el = document.querySelector(`.gunterView-${base.viewId} .gunterDirectory`);
                if (el) el.style.borderColor = 'var(--color-primary)';
              }}
              onMouseOut={() => {
                if (!groupingVisible) return;
                const el = document.querySelector(`.gunterView-${base.viewId} .gunterDirectory`);
                if (el) el.style.borderColor = null;
              }}
            >
              <Icon className="textDisabled" icon="a-arrowback" />
            </div>
          )}
        </div>
      </div>
    );
  }
}

function GunterChartContainer(props) {
  const { gunterView, base, worksheetInfo, views, sheetButtons, printList, sheetSwitchPermit, ...rest } = props;
  const { viewId } = base;
  const { worksheetId } = worksheetInfo;
  const currentView = views.find(o => o.viewId === viewId) || {};
  const grouping = gunterView.grouping || [];

  const allRecordIds = useMemo(() => {
    const ids = [];
    grouping.forEach(group => {
      (group.rows || []).forEach(row => {
        if (row && row.rowid) {
          ids.push(row.rowid);
        }
      });
    });
    return _.uniq(ids);
  }, [grouping]);

  const operateButtons = useMemo(() => {
    let buttons = getSheetOperatesButtons(currentView, { buttons: sheetButtons, printList });
    buttons = filterButtonBySheetSwitchPermit(buttons, sheetSwitchPermit, viewId);
    return buttons;
  }, [currentView, sheetButtons, printList, sheetSwitchPermit, viewId]);

  const btnIds = useMemo(() => getSheetOperateButtonIds(operateButtons), [operateButtons]);

  const { buttonsCheckStatus } = useButtonStatusOfRows(worksheetId, allRecordIds, btnIds);

  return <GunterChart {...rest} gunterView={gunterView} base={base} buttonsCheckStatus={buttonsCheckStatus} />;
}

export default connect(
  state => ({
    gunterView: state.sheet.gunterView,
    base: state.sheet.base,
    worksheetInfo: state.sheet.worksheetInfo,
    views: state.sheet.views,
    sheetButtons: state.sheet.sheetButtons,
    printList: state.sheet.printList,
    sheetSwitchPermit: state.sheet.sheetSwitchPermit || [],
  }),
  dispatch => bindActionCreators(actions, dispatch),
)(GunterChartContainer);
