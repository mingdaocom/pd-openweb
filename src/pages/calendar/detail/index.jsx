import './style.less';
import React, { Component } from 'react';
import CalendarDetail from '../modules/calendarDetail';
import { connect } from 'react-redux';

class CalendarDetailEntrypoint extends Component {
  componentDidMount() {
    $('html').addClass('AppCalendar AppCalendarDetail');
    CalendarDetail({
      isDetailPage: true,
      container: this.el,
    });
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      CalendarDetail({
        isDetailPage: true,
        container: this.el,
      });
    }
  }
  componentWillUnmount() {
    $('html').removeClass('AppCalendar AppCalendarDetail');
  }
  render() {
    return (
      <div className="borderContainer Relative flexColumn">
        <div
          ref={el => {
            this.el = el;
          }}
          className="detail flex"
        />
      </div>
    );
  }
}

export default connect(state => state)(CalendarDetailEntrypoint);
