import PropTypes from 'prop-types';
import React, { Component } from 'react';
import * as components from '../components';

const { CalendarDate, CalendarRemind, CalendarAddress, CalendarMembers, CalendarSummary, CalendarPrivate } = components;

export default class CalendarMain extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { calendar, change, addCalendarMember, bindBusinessCard, changePrivacy } = this.props;
    const {
      id,
      canLook,
      members,
      thirdUser,
      createUser,
      description,
      attachments,
      remindTime,
      remindType,
      address,
      isPrivate,
      editable,
      voiceRemind,
    } = calendar;
    const membersProps = {
      members,
      thirdUser,
      createUser,
      editable,
      addCalendarMember,
      bindBusinessCard,
    };
    const summaryProps = {
      description,
      calendarId: id,
      change,
      editable,
      attachments,
    };
    const privateProps = {
      isPrivate,
      createUser,
      changePrivacy,
    };
    return (
      <div className="calendarMainPart">
        <div className="calBox mBottom10">
          <CalendarDate {...this.props} />
          <CalendarRemind {...{ editable, id, remindTime, remindType, voiceRemind, change }} />
          <CalendarAddress {...{ editable, address, canLook, change }} />
        </div>
        <div className="calBox mBottom10">
          <CalendarMembers {...membersProps} />
          <CalendarSummary {...summaryProps} />
        </div>
        <CalendarPrivate {...privateProps} />
      </div>
    );
  }
}
