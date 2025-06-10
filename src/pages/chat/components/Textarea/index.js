import React, { Component } from 'react';
import Textarea from 'ming-ui/components/Textarea';
import { getCaretPosition, setCaretPosition } from 'src/utils/common';
import * as utils from '../../utils/';
import config from '../../utils/config';
import Constant from '../../utils/constant';
import './index.less';

export default class TextareaBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
    };
    this.lastHeight = 50;
    this.currentHeight = 50;
  }
  componentWillReceiveProps(newProps) {
    const { value } = this.state;
    // 表情 & @ 的更新
    if (newProps.value !== value) {
      this.setState({
        value: newProps.value,
      });
    }
  }
  handleKeyDown(event) {
    if (event.which === 13) {
      const { value } = this.state;
      const isSendMsg =
        (config.inputMode === Constant.INPUT_MODE_ENTER && !event.ctrlKey) ||
        (config.inputMode === Constant.INPUT_MODE_CTRLENTER && event.ctrlKey);
      const isEnter = config.inputMode === Constant.INPUT_MODE_ENTER;

      if (isSendMsg) {
        if (value.length > config.msgMaxSize) {
          alert(_l('您最多可输入%0个字符', config.msgMaxSize), 3);
        } else {
          value.trim() && this.props.onSendMsg(value);
        }
        event.preventDefault();
      } else {
        const pos = getCaretPosition(event.target);
        const start = value.slice(0, pos);
        const end = value.slice(pos);

        this.setState({
          value: isEnter ? start + '\r\n' + end : start + end,
        });

        if (isEnter) {
          setCaretPosition(event.target, pos + 1);
          event.preventDefault();
        }
      }
      return false;
    }
  }
  handleBlur() {
    const { value } = this.state;
    this.props.onBlur(value || $(this.textareaWrapper).find('textarea').val());
  }
  handleChange(value) {
    const { session } = this.props;
    const height = $(this.textareaWrapper).height();
    this.currentHeight = height;
    if (this.lastHeight !== this.currentHeight) {
      this.lastHeight = height;
      utils.scrollEnd(session.id);
    }
    this.props.onChange(value || $(this.textareaWrapper).find('textarea').val());
  }
  handleKeyUp(event) {
    if (event.which === 37 || event.which === 38 || event.which === 39 || event.which === 40) {
      const { session } = this.props;
      utils.recordCursortPosition(session.id);
    }
  }
  renderIcon(type) {
    if (type === Constant.MSGTYPE_FILE) {
      return <i className="icon-defaultFile" />;
    } else if (type === Constant.MSGTYPE_PIC) {
      return <i className="icon-picture" />;
    } else {
      return undefined;
    }
  }
  renderMessageRefer() {
    const { referMessage } = this.props;
    const { msg, fromAccount, type } = referMessage;
    const text = `“ ${fromAccount.name}：${msg.con} ”`;
    return (
      <div
        className="ChatPanel-MessageRefer"
        ref={messageRefer => {
          this.messageRefer = messageRefer;
        }}
      >
        <div className="text" title={text}>
          “ {this.renderIcon(type)} {fromAccount.name}：{msg.con} ”
        </div>
        <i onClick={this.props.onRemoveReferMessage.bind(this)} className="icon-delete" />
      </div>
    );
  }
  render() {
    const { value } = this.state;
    const { referMessage, disabled, placeholder } = this.props;
    return (
      <div
        className="ChatPanel-Textarea inputWrapper"
        ref={textareaWrapper => {
          this.textareaWrapper = textareaWrapper;
        }}
      >
        {referMessage ? this.renderMessageRefer() : undefined}
        <div>
          <Textarea
            chat={true}
            disabled={disabled}
            isFocus
            value={value}
            placeholder={placeholder}
            onChange={this.handleChange.bind(this)}
            onKeyDown={this.handleKeyDown.bind(this)}
            onKeyUp={this.handleKeyUp.bind(this)}
            onBlur={this.handleBlur.bind(this)}
            maxHeight={110}
            minHeight={50}
          />
        </div>
      </div>
    );
  }
}
