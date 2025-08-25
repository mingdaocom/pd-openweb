import React, { Component } from 'react';
import { Icon, Linkify, Textarea } from 'ming-ui';

export default class CalendarSummary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFocus: false,
    };
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
    const { isFocus } = this.state;

    return (
      <div className="calendarSummary calRow">
        <Icon icon={'abstract'} className="Font18 calIcon" />
        <div className="calLine">
          <div className="summaryBox" onClick={() => this.setState({ isFocus: true })}>
            {isFocus || !this.props.description ? (
              <Textarea
                minHeight={18}
                maxHeight={150}
                isFocus
                placeholder={editable ? _l('添加摘要') : _l('未填写摘要')}
                onBlur={() => this.setState({ isFocus: false })}
                onChange={this.changeText}
                value={this.props.description}
              />
            ) : (
              <div style={{ minHeight: 20, whiteSpace: 'pre-wrap' }}>
                <Linkify properties={{ target: '_blank' }}>{this.props.description}</Linkify>
              </div>
            )}

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
