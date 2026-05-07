import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Skeleton } from 'ming-ui';
import * as actions from 'worksheet/redux/actions/gunterview';
import IScroll from 'worksheet/views/GunterView/components/Iscroll';
import GroupItem from '../GroupItem';

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
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class GroupWrap extends Component {
  constructor(props) {
    super(props);
    this.$groupingWrapperRef = createRef(null);
    this.state = {
      groupingScrollX: 0,
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
    window.groupingScrollLock = true;
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
    if (nextProps.loading !== this.props.loading || !_.isEqual(nextProps.widthConfig, this.props.widthConfig)) {
      setTimeout(() => {
        nextProps.groupingScroll.refresh();
        this.handleUpdateWidth(nextProps);
      }, 100);
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
    if (window.chartScrollLock) {
      return;
    }

    const { groupingScroll, chartScroll } = this.props;
    this.setState({ groupingScrollX: Math.abs(groupingScroll.x) });
    this.handleUpdateX(groupingScroll.x);
    chartScroll.scrollTo(chartScroll.x, groupingScroll.y);
    chartScroll._execEvent('scroll');
  };
  handleUpdateWidth = props => {
    const { base, groupingScroll } = props || this.props;
    const controlHeader = document.querySelector(`.gunterView-${base.viewId} .groupingControlHeader`);

    if (controlHeader) {
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
            key={index}
            // style={{ top: index ? (grouping[index - 1].openCount * 32) : 0 }}
            style={{ top: index ? (item.openCount - (item.subVisible ? item.rows.length : 0) - 1) * 32 : 0 }}
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
    const { groupingScrollX } = this.state;
    const { width, grouping, widthConfig } = this.props;
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
  render() {
    const { loading } = this.props;
    return (
      <div className="flex Relative overflowHidden">
        <div className="gunterGroupingWrapper" ref={this.$groupingWrapperRef}>
          <div className={cx('gunterGroupingScroller', { w100: loading })}>
            {loading ? this.renderLoading() : this.renderContent()}
          </div>
        </div>
      </div>
    );
  }
}
