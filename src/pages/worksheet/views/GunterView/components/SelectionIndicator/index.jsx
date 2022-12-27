import React, { Fragment } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'worksheet/redux/actions/gunterview';
import _ from 'lodash';

const SelectionIndicatorWrapper = styled.div(
  ({ color }) => `
  width: 100%;
  height: 32px;
  position: absolute;
  top: 0;
  left: 0;
  background: ${color};
  pointer-events: none;
`,
);

const headerHeight = 60;
const rowHeight = 32;

@connect(
  state => ({
    ..._.pick(state.sheet.gunterView, ['editIndex', 'grouping', 'searchRecordId', 'chartScroll', 'groupingScroll']),
    ..._.pick(state.sheet, ['base']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class SelectionIndicator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      top: null,
      height: rowHeight,
    };
  }
  componentWillReceiveProps({ groupingScroll, grouping }) {
    if (groupingScroll && !this.props.groupingScroll) {
      groupingScroll.on('scrollStart', this.handleMouseLeave);
    }
    if (!_.isEqual(grouping, this.props.grouping) && groupingScroll && groupingScroll.y) {
      this.handleMouseLeave();
    }
  }
  componentDidMount() {
    const { chartScroll, groupingScroll, base } = this.props;
    this.gunterViewEl = document.querySelector(`.gunterView-${base.viewId}`);
    this.gunterViewEl.addEventListener('mousemove', this.handleMouseMove);
    this.gunterViewEl.addEventListener('mouseleave', this.handleMouseLeave);
    this.appEl = document.querySelector('#app');
    this.appEl.addEventListener('click', this.handleClick);
    chartScroll.on('scrollStart', this.handleMouseLeave);
    groupingScroll && groupingScroll.on('scrollStart', this.handleMouseLeave);
  }
  componentWillUnmount() {
    const { chartScroll, groupingScroll } = this.props;
    this.gunterViewEl.removeEventListener('mousemove', this.handleMouseMove);
    this.gunterViewEl.removeEventListener('mouseleave', this.handleMouseLeave);
    this.appEl.removeEventListener('click', this.handleClick);
    chartScroll.off('scrollStart', this.handleMouseLeave);
    groupingScroll && groupingScroll.off('scrollStart', this.handleMouseLeave);
  }
  handleClick = () => {
    const { editIndex, updateEditIndex } = this.props;
    if (_.isNumber(editIndex)) {
      updateEditIndex(null);
    }
  }
  handleMouseLeave = (event) => {
    this.setState({ top: null });
    if (_.isNumber(this.props.editIndex) && !event) {
      this.props.updateEditIndex(null);
    }
  }
  handleMouseMove = event => {
    const { grouping, chartScroll, editIndex } = this.props;
    const scrollY = Math.abs(chartScroll.y);
    const y = event.clientY - this.gunterViewEl.getBoundingClientRect().top;
    if (y >= headerHeight && grouping.length) {
      const newY = y + scrollY;
      const index = Math.floor((newY - headerHeight) / rowHeight);
      const value = headerHeight - scrollY + index * rowHeight;
      if (index >= grouping[grouping.length - 1].openCount || index === editIndex) {
        this.setState({ top: null });
        return;
      }
      if (index * rowHeight <= scrollY) {
        const diff = Math.abs(index * rowHeight - scrollY);
        this.setState({ top: value + diff, height: rowHeight - diff });
      } else {
        this.setState({ top: value, height: rowHeight });
      }
    } else {
      this.setState({ top: null });
    }
  }
  render() {
    const { editIndex, searchRecordId, chartScroll } = this.props;
    const { top, height } = this.state;
    return (
      <Fragment>
        {top !== null && <SelectionIndicatorWrapper color="rgba(0, 0, 0, .04)" style={{ top, height }} />}
        {editIndex !== null && (
          <SelectionIndicatorWrapper
            color={searchRecordId ? 'rgba(255, 147, 0, .09);' : 'rgba(33, 150, 243, .06)'}
            style={{
              top: editIndex * rowHeight + headerHeight + chartScroll.y,
              height: rowHeight,
            }}
          />
        )}
      </Fragment>
    );
  }
}
