import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Skeleton } from 'ming-ui/antd-components';
import * as actions from 'worksheet/redux/actions/gunterview';
import IScroll from 'worksheet/views/GunterView/components/Iscroll';
import { isChartScrollLocked, setChartScrollLock, setGroupingScrollLock } from 'worksheet/views/GunterView/scrollState';
import {
  getGunterScrollerHeight,
  getGunterVisibleRange,
  getVisibleGunterGroups,
  isSameGunterVisibleRange,
} from 'worksheet/views/GunterView/virtual';
import GroupItem from '../GroupItem';

const isGunterExport = location.href.includes('gunterExport');
const defaultTitleWidth = 200;
const defaultFieldWidth = 180;
const operateWidth = 32;
const dayCountWidth = 80;
const getColumnWidth = (widthConfig, index, defaultWidth) => Number(widthConfig[index]) || defaultWidth;
const getDirectoryContentWidth = (widthConfig = {}, viewConfig = {}) => {
  const displayControls = viewConfig.displayControls || [];
  const startIndex = displayControls.length + 1;
  const endIndex = displayControls.length + 2;
  const displayControlsWidth = displayControls.reduce((total, control, index) => {
    return total + getColumnWidth(widthConfig, index + 1, defaultFieldWidth);
  }, 0);
  return (
    operateWidth +
    getColumnWidth(widthConfig, 0, defaultTitleWidth) +
    displayControlsWidth +
    getColumnWidth(widthConfig, startIndex, defaultFieldWidth) +
    getColumnWidth(widthConfig, endIndex, defaultFieldWidth) +
    dayCountWidth
  );
};
const GroupingTotalWrapper = styled.div`
  height: 100%;
  pointer-events: none;
  .item {
    height: 32px;
    justify-content: flex-end;
    padding-right: 20px;
    position: absolute;
    right: 0;
  }
`;
let GroupWrap = class GroupWrap extends Component {
  constructor(props) {
    super(props);
    this.$groupingWrapperRef = createRef(null);
    this.state = {
      groupingScrollX: 0,
      visibleRange: getGunterVisibleRange(null, props.grouping),
    };
  }
  componentDidMount() {
    const scroll = new IScroll(this.$groupingWrapperRef.current, {
      scrollX: true,
      scrollY: true,
      mouseWheelScrollsHorizontally: false,
      freeScroll: true,
      scrollbars: true,
      mouseWheel: true,
      bounce: false,
      momentum: false,
      disablePointer: true,
      interactiveScrollbars: true,
      probeType: 2,
    });
    setGroupingScrollLock(true);
    scroll.on('scroll', this.linkageScroll);
    scroll.on('scrollStart', () => {
      setGroupingScrollLock(true);
      setChartScrollLock(false);
    });
    scroll.on('scrollEnd', () => {
      setGroupingScrollLock(false);
      setChartScrollLock(true);
    });
    this.props.updateGroupingScroll(scroll);
    this.updateScrollState(scroll);
  }
  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.loading !== prevProps.loading || !_.isEqual(this.props.widthConfig, prevProps.widthConfig)) {
        setTimeout(() => {
          this.props.groupingScroll && this.props.groupingScroll.refresh();
          this.handleUpdateWidth(this.props);
          this.updateScrollState();
        }, 100);
      }
      if (this.props.grouping !== prevProps.grouping) {
        setTimeout(() => {
          this.props.groupingScroll && this.props.groupingScroll.refresh();
          this.updateScrollState();
        }, 0);
      }
    }
  }
  componentWillUnmount() {
    const { groupingScroll } = this.props;
    if (groupingScroll) {
      groupingScroll.off('scroll', this.linkageScroll);
      groupingScroll.destroy();
      this.props.updateGroupingScroll(null);
    }
  }
  linkageScroll = () => {
    const { chartScroll, groupingScroll } = this.props;
    if (!groupingScroll) {
      return;
    }
    this.updateScrollState(groupingScroll);
    if (isChartScrollLocked()) {
      return;
    }
    this.handleUpdateX(groupingScroll.x);
    chartScroll.scrollTo(chartScroll.x, groupingScroll.y);
    chartScroll._execEvent('scroll');
  };
  updateScrollState = scroll => {
    const { grouping, groupingScroll } = this.props;
    const currentScroll = scroll || groupingScroll;
    const visibleRange = getGunterVisibleRange(currentScroll, grouping);
    const groupingScrollX = Math.abs((currentScroll && currentScroll.x) || 0);
    const state = {};
    if (this.state.groupingScrollX !== groupingScrollX) {
      state.groupingScrollX = groupingScrollX;
    }
    if (!isSameGunterVisibleRange(this.state.visibleRange, visibleRange)) {
      state.visibleRange = visibleRange;
    }
    if (!_.isEmpty(state)) {
      this.setState(state);
    }
  };
  handleUpdateWidth = props => {
    const { base, groupingScroll } = props || this.props;
    const controlHeader = document.querySelector(`.gunterView-${base.viewId} .groupingControlHeader`);
    if (controlHeader && groupingScroll) {
      this.handleUpdateX(groupingScroll.x);
      controlHeader.style.width = `${groupingScroll.scrollerWidth}px`;
      controlHeader.classList.remove('hide');
    }
  };
  handleUpdateX = x => {
    const { base } = this.props;
    const controlHeader = document.querySelector(`.gunterView-${base.viewId} .groupingControlHeader`);
    if (controlHeader) {
      controlHeader.style.transform = `translateX(${x}px)`;
    }
  };
  renderGroupingTotal() {
    const { grouping } = this.props;
    return (
      <GroupingTotalWrapper className="Relative">
        {grouping.map((item, index) => (
          <div
            key={index} // style={{ top: index ? (grouping[index - 1].openCount * 32) : 0 }}
            style={{
              top: index ? (item.openCount - (item.subVisible ? item.rows.length : 0) - 1) * 32 : 0,
            }}
            className="valignWrapper item textTertiary"
          >
            <span>{item.totalNum}</span>
            {/*<Icon icon="custom_add_circle" />*/}
          </div>
        ))}
      </GroupingTotalWrapper>
    );
  }
  renderLoading() {
    return (
      <div className="Relative">
        <Skeleton
          className="pAll20 pBottom0"
          style={{
            flex: 1,
          }}
          active
          paragraph={{
            rows: 4,
            width: ['30%', '40%', '90%', '60%'],
          }}
        />
        <Skeleton
          className="pAll20"
          style={{
            flex: 1,
          }}
          active
          paragraph={{
            rows: 4,
            width: ['30%', '40%', '90%', '60%'],
          }}
        />
      </div>
    );
  }
  renderContent() {
    const { groupingScrollX, visibleRange } = this.state;
    const { width, grouping, widthConfig, withoutArrangementVisible, viewConfig } = this.props;
    if (isGunterExport) {
      return (
        <div>
          {grouping.map(item => (
            <GroupItem
              key={item.key}
              group={item}
              width={width + groupingScrollX}
              widthConfig={widthConfig}
              onUpdateHeaderWidth={this.handleUpdateWidth}
            />
          ))}
        </div>
      );
    }
    const visibleGroups = getVisibleGunterGroups(grouping, visibleRange, withoutArrangementVisible);
    const scrollerHeight = getGunterScrollerHeight(
      grouping,
      this.$groupingWrapperRef.current ? this.$groupingWrapperRef.current.clientHeight : 0,
    );
    const scrollerWidth = Math.max(width, getDirectoryContentWidth(widthConfig, viewConfig));
    return (
      <div
        className="gunterVirtualRows"
        style={{
          height: scrollerHeight,
          width: scrollerWidth,
        }}
      >
        {visibleGroups.map(item => (
          <GroupItem
            key={item.group.key}
            group={item.group}
            groupRowVisible={item.groupVisible}
            visibleRows={item.rows}
            visibleRange={visibleRange}
            virtual
            width={width + groupingScrollX}
            widthConfig={widthConfig}
            onUpdateHeaderWidth={this.handleUpdateWidth}
          />
        ))}
      </div>
    );
  }
  render() {
    const { loading } = this.props;
    return (
      <div className="flex Relative overflowHidden">
        <div className="gunterGroupingWrapper" ref={this.$groupingWrapperRef}>
          <div
            className={cx('gunterGroupingScroller', {
              w100: loading,
            })}
          >
            {loading ? this.renderLoading() : this.renderContent()}
          </div>
        </div>
      </div>
    );
  }
};
GroupWrap = connect(
  state => ({
    ..._.pick(state.sheet.gunterView, [
      'loading',
      'grouping',
      'groupingScroll',
      'chartScroll',
      'withoutArrangementVisible',
      'viewConfig',
    ]),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)(GroupWrap);
export default GroupWrap;
