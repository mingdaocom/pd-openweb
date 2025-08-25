import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import * as actions from 'worksheet/redux/actions/gunterview';

const TodayWrapper = styled.div`
  position: absolute;
  bottom: 5px;
  color: #fff;
  padding: 1px 5px;
  border-radius: 4px;
  background-color: #1677ff;
  &.left {
    left: 5px;
  }
  &.right {
    right: 5px;
  }
`;

@connect(
  state => ({
    ..._.pick(state.sheet, ['gunterView', 'base']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class Today extends Component {
  constructor(props) {
    super(props);
    const { onlyWorkDay, dayOff } = props.gunterView.viewConfig;
    this.state = {
      disable: onlyWorkDay ? dayOff.includes(moment().days()) : false,
      todayVisible: false,
      direction: 'left',
    };
    this.debounceScroll = _.debounce(this.handleScroll, 500);
  }
  componentDidMount() {
    const { chartScroll } = this.props.gunterView;
    chartScroll.on('scroll', this.debounceScroll);
  }
  componentWillUnmount() {
    const { chartScroll } = this.props.gunterView;
    chartScroll.off('scroll', this.debounceScroll);
  }
  componentWillReceiveProps({ gunterView }) {
    const { onlyWorkDay, dayOff } = gunterView.viewConfig;
    this.setState({
      disable: onlyWorkDay ? dayOff.includes(moment().days()) : false,
    });
  }
  handleScroll = () => {
    const { base, gunterView } = this.props;
    const { chartScroll, periodList } = gunterView;
    const todayEl = document.querySelector(`.gunterView-${base.viewId} .gunterChart .today`);
    if (todayEl) {
      const parentNode = todayEl.parentNode;
      const offsetLeft = parentNode.offsetLeft + todayEl.offsetLeft;
      const scrollLeft = Math.abs(chartScroll.x);
      const isLeft = scrollLeft >= offsetLeft;
      const isRight = scrollLeft <= Math.abs(chartScroll.wrapperWidth - offsetLeft);
      if (isLeft || isRight) {
        this.setState({ todayVisible: true, direction: isLeft ? 'left' : 'right' });
      } else {
        this.setState({ todayVisible: false });
      }
    } else {
      const today = moment().format('YYYY-MM-DD');
      const start = periodList[0];
      const end = periodList[periodList.length - 1];
      if (end && moment(today).isBefore(end.time)) {
        this.setState({ direction: 'left' });
      }
      if (start && moment(today).isAfter(start.time)) {
        this.setState({ direction: 'right' });
      }
      this.setState({ todayVisible: true });
    }
  };
  handleGoToday = () => {
    const { todayVisible } = this.state;
    if (todayVisible) {
      this.setState({ todayVisible: false });
      this.props.refreshGunterView();
    }
  };
  render() {
    const { todayVisible, disable, direction } = this.state;
    return (
      todayVisible &&
      !disable && (
        <TodayWrapper className={cx('pointer', direction)} onClick={this.handleGoToday}>
          {_l('今天')}
        </TodayWrapper>
      )
    );
  }
}
