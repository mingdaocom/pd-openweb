import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import * as actions from 'worksheet/redux/actions/gunterview';

const TimeDotWrapper = styled.div`
  position: relative;
  z-index: 1;
`;

const DotWrapper = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1;
  background-color: #1677ff;
`;

const lineHeight = 32;
const rowDotHeight = 10;

@connect(state => ({
  ..._.pick(state.sheet.gunterView, ['chartScroll']),
}))
class MonitorTimeDot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      position: {},
    };
  }
  componentDidMount() {
    const { chartScroll } = this.props;
    chartScroll.on('scroll', this.handleScroll);
  }
  componentWillUnmount() {
    const { chartScroll } = this.props;
    chartScroll.off('scroll', this.handleScroll);
  }
  handleScroll = () => {
    const { row, chartScroll } = this.props;
    const { left, width } = row;
    const x = Math.abs(chartScroll.x);

    if (left + width <= x) {
      this.setState({
        position: { left: 10 },
      });
      return;
    }
    if (left >= x + chartScroll.wrapperWidth) {
      this.setState({
        position: { right: 10 },
      });
      return;
    }

    this.setState({ position: {} });
  };
  render() {
    const { position } = this.state;
    const { top, row, onPositionRow } = this.props;
    return (
      !_.isEmpty(position) && (
        <DotWrapper
          style={{ top, ...position, backgroundColor: row.color }}
          onClick={() => {
            const { position } = this.state;
            if (position.left) {
              onPositionRow(row.endTime);
            }
            if (position.right) {
              onPositionRow(row.startTime);
            }
          }}
        />
      )
    );
  }
}

@connect(
  state => ({
    ..._.pick(state.sheet, ['gunterView']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class TimeDot extends Component {
  constructor(props) {
    super(props);
  }
  handlePositionRow = time => {
    this.props.refreshGunterView(time);
  };
  renderRow(row, index) {
    const { left, right, width } = row;
    const top = index * lineHeight + (lineHeight / 2 - rowDotHeight / 2);

    if (_.isEmpty(row.startTime) || _.isEmpty(row.endTime) || moment(row.startTime).isAfter(row.endTime)) {
      return null;
    }

    if (right === 0) {
      return (
        <DotWrapper
          key={row.rowid}
          style={{ top, right: 10, backgroundColor: row.color }}
          onClick={() => {
            this.handlePositionRow(row.startTime);
          }}
        />
      );
    }
    if (left === 0 && width === 0) {
      return (
        <DotWrapper
          key={row.rowid}
          style={{ top, left: 10, backgroundColor: row.color }}
          onClick={() => {
            this.handlePositionRow(row.endTime);
          }}
        />
      );
    }

    return <MonitorTimeDot key={row.rowid} row={row} top={top} onPositionRow={this.handlePositionRow} />;
  }
  renderGroupingItem(item) {
    const { withoutArrangementVisible } = this.props.gunterView;
    return (
      item.subVisible &&
      item.rows
        .filter(item => (withoutArrangementVisible ? true : item.diff > 0))
        .map((row, index) => this.renderRow(row, item.hide ? index : item.groupingIndex + index + 1))
    );
  }
  render() {
    const { grouping } = this.props.gunterView;
    return (
      <TimeDotWrapper className="timeDotWrapper">{grouping.map(item => this.renderGroupingItem(item))}</TimeDotWrapper>
    );
  }
}
