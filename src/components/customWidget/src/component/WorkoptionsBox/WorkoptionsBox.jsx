import React from 'react';
import Checkbox from '../common/checkbox';

export default class WorkoptionsBox extends React.Component {
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
    let { widget, setWidgetAttribute } = this.props;
    if (widget.data && widget.data.type === 7) {
      if (widget.data.enumDefault === 3 || widget.data.enumDefault === 4) {
        widget.OAOptions.validate = undefined;
      }
    }
    if (widget.type === 25 || widget.type === 14 || widget.type === 30 || widget.type === 29 || widget.type === 37) {
      widget.OAOptions.required = undefined;
    }
    if (widget.data.type === 7 && widget.data.enumDefault === 2) {
      widget.validateTxt = _l('护照格式');
    }
    return (
      <div className="WORKSHEETOptionsBox">
        {(widget.type === 3 || widget.type === 9 || (widget.type === 11 && (widget.data.enumDefault === 1 || widget.data.enumDefault === 2))) ? (
          <Checkbox
            toggleCheckbox={this.handleChange.bind(this)}
            optionKey="validate"
            checked={widget.OAOptions.validate}
            name={_l('提交时验证格式：%0', widget.validateTxt)}
          />
        ) : null}
        {
          widget.type < 10000
          && widget.type !== 13 // 附件
          && widget.type !== 21 // 自由连接
          && widget.type !== 14// 分段
          && widget.type !== 29 // 关联他表
          && widget.type !== 30 // 他表字段
          && widget.type !== 36 // Switch
          && widget.type !== 37 // 汇总
          && <div className="checkbox-container mBottom5">
          <Checkbox
            toggleCheckbox={(key, value) => {
                setWidgetAttribute(widget.id, value);
            }}
            optionKey="attribute"
            checked={!!widget.data.attribute}
            name={_l('设为标题字段')}
          />
        </div> }
        {widget.OAOptions.required !== undefined
          && widget.type < 10000
          && widget.type !== 31 // 新公式
          && widget.type !== 32 // 文本拼接
          && widget.type !== 33 // 自动编号
          && <div className="checkbox-container">
            <Checkbox toggleCheckbox={this.handleChange.bind(this)} optionKey="required" checked={widget.OAOptions.required} name="必填项" />
          </div>
        }
      </div>
    );
  }
}
