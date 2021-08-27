import React from 'react';
import Checkbox from '../common/checkbox';

export default class OAOptionsBox extends React.Component {
  constructor(props) {
    super(props);
  }

  handleChange(key, value) {
    let options = {
      [key]: value,
    };
    this.props.changeOAOptions(this.props.widget.id, options);
  }

  render() {
    let { widget } = this.props;
    let { data } = widget;
    if (data && data.type === 7) {
      if (data.enumDefault === 3 || data.enumDefault === 4) {
        widget.OAOptions.validate = undefined;
      }
    }

    return (
      <div className="OAOptionsBox">
        {(widget.type === 3 || widget.type === 9 || (widget.type === 11 && (widget.data.enumDefault === 1 || widget.data.enumDefault === 2))) ? (
          <Checkbox
            toggleCheckbox={this.handleChange.bind(this)}
            optionKey="validate"
            checked={widget.OAOptions.validate}
            name={_l('提交时验证格式：%0', widget.validateTxt)}
          />
        ) : null}
        {widget.OAOptions.required !== undefined && widget.type !== 17 && !(widget.type === 19 && widget.data.dataSource !== '0') ? (
          <div className="checkbox-container">
            <Checkbox toggleCheckbox={this.handleChange.bind(this)} optionKey="required" checked={widget.OAOptions.required} name="必填项" />
          </div>
        ) : null}
        {widget.OAOptions.printHide !== undefined ? (
          <Checkbox toggleCheckbox={this.handleChange.bind(this)} optionKey="printHide" checked={widget.OAOptions.printHide} name={_l('打印时隐藏')} />
        ) : null}
      </div>
    );
  }
}
