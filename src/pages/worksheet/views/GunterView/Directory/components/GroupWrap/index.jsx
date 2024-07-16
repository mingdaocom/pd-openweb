import React, { Component, Fragment, createRef } from 'react';
import cx from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import * as actions from 'worksheet/redux/actions/gunterview';
import { Icon, Skeleton } from 'ming-ui';
import IScroll from 'worksheet/views/GunterView/components/Iscroll';
import GroupItem from '../GroupItem';
import { RecordWrapper } from '../Record';
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


const GroupingChildWrapper = styled.div`
  height: 29px;
  border-bottom: 1px solid #ececec;
  .drag {
    position: absolute;
    right: -1px;
    top: 0;
    z-index: 1;
    height: 100%;
    width: 2px;
    cursor: ew-resize;
    // background-color: red;
  }
  .dragLine {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
    height: 100%;
    width: 2px;
    cursor: ew-resize;
    background-color: #0f8df2;
  }
`;

@connect(
  state => ({
    ..._.pick(state.sheet.gunterView, ['loading', 'grouping', 'viewConfig', 'groupingScroll', 'chartScroll']),
    ..._.pick(state.sheet, ['base', 'controls']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class GroupWrap extends Component {
  constructor(props) {
    super(props);
    this.$groupingWrapperRef = createRef(null);
    const config = localStorage.getItem(`gunterViewColumnWidthConfig-${props.base.viewId}`);
    this.state = {
      dragValue: 0,
      groupingScrollX: 0,
      widthConfig: config ? JSON.parse(config) : { 0: 200 }
    }
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
    if (nextProps.loading !== this.props.loading) {
      setTimeout(() => {
        nextProps.groupingScroll.refresh();
      }, 0);
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
  linkageScroll = event => {
    if (window.chartScrollLock) {
      return;
    }
    const { groupingScroll, chartScroll } = this.props;
    this.setState({ groupingScrollX: Math.abs(groupingScroll.x) });
    chartScroll.scrollTo(chartScroll.x, groupingScroll.y);
    chartScroll._execEvent('scroll');
  }
  handleMouseDown = (event, index) => {
    const { target } = event;
    const startClientX = event.clientX;
    const startDragValue = target.parentElement.offsetLeft + target.parentElement.clientWidth;
    const minWidth = 80;
    this.setState({
      dragValue: startDragValue
    });
    const setColumnWidth = width => {
      const { widthConfig } = this.state;
      const data = {
        ...widthConfig,
        [index]: width
      }
      this.setState({
        widthConfig: data
      }, () => {
        const { base, groupingScroll } = this.props;
        localStorage.setItem(`gunterViewColumnWidthConfig-${base.viewId}`, JSON.stringify(data));
        groupingScroll.refresh();
      });
    }
    document.onmousemove = event => {
      const x = event.clientX - startClientX;
      const width = target.parentElement.clientWidth + x;
      if (width >= minWidth) {
        this.setState({
          dragValue: startDragValue + x
        });
      }
    }
    document.onmouseup = (event) => {
      const x = event.clientX - startClientX;
      const width = target.parentElement.clientWidth + x;
      setColumnWidth(width >= minWidth ? width : minWidth);
      this.setState({
        dragValue: 0
      });
      document.onmousemove = null;
      document.onmouseup = null;
    }
  }
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
  renderDrag(index) {
    return (
      <div onMouseDown={(event) => { this.handleMouseDown(event, index) }} className="drag" />
    );
  }
  renderControlName() {
    const { dragValue, widthConfig } = this.state;
    const { width, controls, viewConfig } = this.props;
    const displayControls = viewConfig.displayControls || [];
    const titleControl = _.find(controls, { attribute: 1 });
    const startControl = _.find(controls, { controlId: viewConfig.startId }) || {};
    const endControl = _.find(controls, { controlId: viewConfig.endId }) || {};
    const startIndex = displayControls.length + 1;
    const endIndex = displayControls.length + 2;
    return (
      <GroupingChildWrapper className="overflowHidden">
        <RecordWrapper className="valignWrapper groupingControlHeader">
          <Icon className="Gray_9e Font17 mRight5 Visibility" icon="more_horiz" />
          <div className="groupingName relative overflow_ellipsis" style={{ width: widthConfig[0] }}>
            {titleControl.controlName}
            {this.renderDrag(0)}
          </div>
          {displayControls.map((data, index) => (
            <div className="field" key={data.controlId} style={{ width: widthConfig[index + 1] }}>
              {data.controlName}
              {this.renderDrag(index + 1)}
            </div>
          ))}
          <div className="field" style={{ width: widthConfig[startIndex] }}>
            {startControl.controlName || _l('开始时间')}
            {this.renderDrag(startIndex)}
          </div>
          <div className="field" style={{ width: widthConfig[endIndex] }}>
            {endControl.controlName || _l('结束时间')}
            {this.renderDrag(endIndex)}
          </div>
          <div className="dayCountField overflow_ellipsis">{_l('时长')}</div>
        </RecordWrapper>
        {!!dragValue && <div style={{ left: dragValue }} className="dragLine" />}
      </GroupingChildWrapper>
    );
  }
  renderContent() {
    const { widthConfig, groupingScrollX } = this.state;
    const { width, grouping } = this.props;
    return (
      <div>
        {this.renderControlName()}
        {grouping.map(item => (
          <GroupItem
            key={item.key}
            group={item}
            width={width + groupingScrollX}
            widthConfig={widthConfig}
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
