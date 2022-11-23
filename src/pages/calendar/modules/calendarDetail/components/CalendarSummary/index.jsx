import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Icon from 'ming-ui/components/Icon';
import Textarea from 'ming-ui/components/Textarea';

export default class CalendarSummary extends Component {
  constructor(props) {
    super(props);

    this.changeText = this.changeText.bind(this);
  }

  changeText(value) {
    if (!this.props.editable) return false;
    this.props.change({
      description: value,
    });
  }

  render() {
    const { editable, attachments } = this.props;
    return (
      <div className="calendarSummary calRow">
        <Icon icon={'task-signal'} className="Font18 calIcon" />
        <div className="calLine">
          <div className="summaryBox">
            <Textarea
              minHeight={18}
              maxHeight={150}
              placeholder={editable ? _l('添加摘要') : _l('未填写摘要')}
              onChange={this.changeText}
              value={this.props.description}
            />
            {attachments && attachments.length ? (
              <div
                className="attachmentBox"
                ref={ref => {
                  this.attachmentBox = ref;
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
