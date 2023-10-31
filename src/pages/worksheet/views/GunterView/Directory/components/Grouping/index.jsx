import React, { Component, Fragment, createRef } from 'react';
import cx from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import * as actions from 'worksheet/redux/actions/gunterview';
import { Skeleton } from 'ming-ui';
import IScroll from 'worksheet/views/GunterView/components/Iscroll';
import Group from '../Group';
import _ from 'lodash';

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

@connect(
  state => ({
    ..._.pick(state.sheet.gunterView, ['loading', 'grouping', 'groupingScroll', 'chartScroll']),
    ..._.pick(state.sheet, ['base']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class Grouping extends Component {
  constructor(props) {
    super(props);
    this.$groupingWrapperRef = createRef(null);
  }
  componentDidMount() {
    const scroll = new IScroll(this.$groupingWrapperRef.current, {
      // scrollX: true,
      scrollY: true,
      freeScroll: true,
      // scrollbars: true,
      mouseWheel: true,
      bounce: false,
      momentum: false,
      disablePointer: true,
      interactiveScrollbars: false,
      probeType: 2,
    });
    window.groupingScrollLock = true;
    scroll.on('scroll', this.handleScroll);
    scroll.on('scroll', this.linkageScroll);
    scroll.on('scrollStart', () => {
      window.groupingScrollLock = true;
      window.chartScrollLock = false;
    });
    scroll.on('scrollEnd', () => {
      window.groupingScrollLock = false;
      window.chartScrollLock = true;
    });
    this.props.updateGroupingScroll(scroll);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.loading !== this.props.loading) {
      setTimeout(() => {
        nextProps.groupingScroll.refresh();
      }, 0);
    }
  }
  componentWillUnmount() {
    const { groupingScroll } = this.props;
    if (groupingScroll) {
      groupingScroll.off('scroll', this.handleScroll);
      groupingScroll.off('scroll', this.linkageScroll);
      groupingScroll.destroy();
      this.props.updateGroupingScroll(null);
    }
  }
  handleScroll = () => {
    const { groupingScroll, base } = this.props;
    if (!this.groupingControlHeaderEl) {
      const el = document.querySelector(`.gunterView-${base.viewId} .groupingControlHeader`);
      this.groupingControlHeaderEl = el;
    }
    this.groupingControlHeaderEl &&
      (this.groupingControlHeaderEl.style.transform = `translateX(${groupingScroll.x}px)`);
  };
  linkageScroll = event => {
    if (window.chartScrollLock) {
      return;
    }
    const { groupingScroll, chartScroll } = this.props;
    chartScroll.scrollTo(chartScroll.x, groupingScroll.y);
    chartScroll._execEvent('scroll');
  };
  renderGroupingTotal() {
    const { grouping } = this.props;
    return (
      <GroupingTotalWrapper className="Relative">
        {grouping.map((item, index) => (
          <div
            key={index}
            // style={{ top: index ? (grouping[index - 1].openCount * 32) : 0 }}
            style={{ top: index ? (item.openCount - (item.subVisible ? item.rows.length : 0) - 1) * 32 : 0 }}
            className="valignWrapper item Gray_9e"
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
          style={{ flex: 1 }}
          direction="column"
          widths={['30%', '40%', '90%', '60%']}
          active
          itemStyle={{ marginBottom: '10px' }}
        />
        <Skeleton
          style={{ flex: 1 }}
          direction="column"
          widths={['30%', '40%', '90%', '60%']}
          active
          itemStyle={{ marginBottom: '10px' }}
        />
      </div>
    );
  }
  renderContent() {
    const { width, grouping } = this.props;
    return (
      <Fragment>
        {grouping.map(item => (
          <Group width={width} group={item} key={item.key} />
        ))}
      </Fragment>
    );
  }
  render() {
    const { loading, width } = this.props;
    return (
      <div className="flex Relative overflowHidden">
        <div className="gunterGroupingWrapper" ref={this.$groupingWrapperRef}>
          <div className={cx('gunterGroupingScroller', { w100: loading })} style={{ width: '100%' }}>
            {loading ? this.renderLoading() : this.renderContent()}
          </div>
        </div>
      </div>
    );
  }
}
