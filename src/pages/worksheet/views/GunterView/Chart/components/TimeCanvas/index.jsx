import React, { Component, createRef } from 'react';
import cx from 'classnames';
import { connect } from 'react-redux';
import { isWeekEndDay } from 'worksheet/views/GunterView/util';

@connect(
  state => ({
    ..._.pick(state.sheet.gunterView, ['grouping', 'periodList', 'periodType', 'withoutArrangementVisible', 'chartScroll', 'groupingScroll']),
  })
)
export default class TimeCanvas extends Component {
  constructor(props) {
    super(props);
    this.$ref = createRef(null);
    this.debounceUpdateHeight = _.debounce(this.updateHeight, 500);
  }
  componentWillReceiveProps(nextProps) {
    if (
      !_.isEqual(nextProps.grouping, this.props.grouping) ||
      nextProps.withoutArrangementVisible !== this.props.withoutArrangementVisible
    ) {
      this.updateHeight(null, nextProps);
      setTimeout(() => {
        const { chartScroll, groupingScroll } = nextProps;
        chartScroll.refresh();
        groupingScroll && groupingScroll.refresh();
        chartScroll._execEvent('scroll');
      }, 0);
    }
  }
  componentDidMount() {
    this.updateHeight();
    window.addEventListener('resize', this.debounceUpdateHeight);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.debounceUpdateHeight);
  }
  updateHeight = (event, props) => {
    const { grouping, chartScroll, groupingScroll } = props || this.props;
    const gunterChartWrapperEl = document.querySelector('.gunterChartWrapper');
    const gunterGroupingScrollerEl = document.querySelector('.gunterGroupingScroller');
    const height = document.body.clientHeight - gunterChartWrapperEl.getBoundingClientRect().top;
    const maxHeight = grouping.length ? grouping[grouping.length - 1].openCount * 32 : 0;
    const isScroll = maxHeight >= height;
    const marginBottom = 80;
    this.$ref.current.style.height = `${isScroll ? maxHeight + marginBottom : height}px`;
    if (gunterGroupingScrollerEl) {
      if (isScroll) {
        gunterGroupingScrollerEl.classList.add('gunterGroupingLastMarginBottom');
      } else {
        gunterGroupingScrollerEl.classList.remove('gunterGroupingLastMarginBottom');
      }
    }
    if (event) {
      chartScroll.refresh();
      groupingScroll && groupingScroll.refresh();
    }
  }
  render() {
    const { periodType, periodList } = this.props;
    return (
      <div className="timeCanvasWrapper flexRow" ref={this.$ref}>
        {
          periodList.map((item, index) => (
            <div
              key={index}
              className={cx('item', { Relative: item.isToday, weekEndDay: isWeekEndDay(item.time, periodType) })}
              style={{ width: item.width }}
            >
              {item.isToday && (
                <div className="today" style={{ left: item.left }}></div>
              )}
            </div>
          ))
        }
      </div>
    );
  }
}