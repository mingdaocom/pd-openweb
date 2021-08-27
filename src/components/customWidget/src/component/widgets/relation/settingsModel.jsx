import React from 'react';
import config from '../../../config';
import Dropdown from '../../common/dropdown';
import firstInputSelect from '../../common/firstInputSelect';

@firstInputSelect
class SettingsModel extends React.Component {
  constructor(props) {
    super(props);
  }

  handleChange() {
    this.props.changeWidgetData(this.props.widget.id, {
      controlName: this.refs.controlName.value,
    });
  }

  changeDefaultValue(value) {
    this.props.changeWidgetData(this.props.widget.id, {
      enumDefault: parseInt(value, 10),
    });
  }

  render() {
    let { widget } = this.props;
    return (
      <div className="">
        <div className="wsItem">
          <span className="wsLf">{_l('名称')}</span>
          <input
            className="ThemeBorderColor3"
            data-editcomfirm="true"
            type="text"
            ref="controlName"
            value={this.props.widget.data.controlName}
            onChange={this.handleChange.bind(this)}
            maxLength="100"
          />
        </div>
        <div className="wsItem">
          <span className="wsLf">
            {_l('类型')}
            <span
              className="tip-bottom-right tipWidth mLeft5"
              style={{ verticalAlign: 'middle', marginTop: '-5px', display: 'inline-block' }}
              data-tip={_l('管理员可以选择用户需要自由连接的类型，例：自由连接的类型为任务，成员在详情处选择自由连接的内容只能是相关的任务')}
            >
              <i className="icon-novice-circle pointer" style={{ color: '#b0b0b0' }} />
            </span>
          </span>
          <Dropdown data={widget.defaultArr} value={widget.data.enumDefault} onChange={this.changeDefaultValue.bind(this)} width="140px" />
        </div>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.RELATION.type,
  SettingsModel,
};
