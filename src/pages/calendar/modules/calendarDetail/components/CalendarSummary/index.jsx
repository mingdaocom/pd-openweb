import React, { Component } from 'react';
import { Icon, Linkify } from 'ming-ui';
import { Input } from 'ming-ui/antd-components';

const SUMMARY_TEXTAREA_STYLES = {
  root: {
    lineHeight: 1.5,
    maxHeight: 150,
    minHeight: 18,
    padding: 0,
    verticalAlign: 'top',
  },
};

export default class CalendarSummary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFocus: false,
    };
    this.textareaRef = React.createRef();
    this.changeText = this.changeText.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.isFocus && this.state.isFocus) {
      this.textareaRef.current?.focus({ cursor: 'end', preventScroll: true });
    }
  }

  changeText(event) {
    if (!this.props.editable) return false;
    this.props.change({
      description: event.target.value,
    });
  }

  render() {
    const { editable, attachments, description } = this.props;
    const { isFocus } = this.state;
    const placeholder = editable ? _l('添加摘要') : _l('未填写摘要');

    return (
      <div className="calendarSummary calRow">
        <Icon icon={'abstract'} className="Font18 calIcon" />
        <div className="calLine">
          <div className="summaryBox" onClick={() => this.setState({ isFocus: true })}>
            {isFocus ? (
              <Input.TextArea
                autoSize
                placeholder={placeholder}
                onBlur={() => this.setState({ isFocus: false })}
                onChange={this.changeText}
                ref={this.textareaRef}
                styles={SUMMARY_TEXTAREA_STYLES}
                value={description}
                variant="borderless"
              />
            ) : (
              <div
                className={description ? undefined : 'textPlaceholder'}
                style={{ minHeight: 20, whiteSpace: 'pre-wrap' }}
              >
                <Linkify properties={{ target: '_blank' }}>{description || placeholder}</Linkify>
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
