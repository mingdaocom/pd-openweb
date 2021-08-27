import React from 'react';
import config from '../../../config';
import RadioGroup from '../../common/radioGroup';
import Dropdown from '../../common/dropdown';
import firstInputSelect from '../../common/firstInputSelect';

@firstInputSelect
class SettingsModel extends React.Component {
  constructor(props) {
    super(props);
  }

  handleChange() {
    let data = {
      controlName: this.refs.controlName.value,
      hint: this.refs.hint.value,
    };
    this.props.changeWidgetData(this.props.widget.id, data);
  }

  changeDefaultValue(value) {
    value = parseInt(value, 10);
    let controlName;
    let { widget } = this.props;
    widget = _.cloneDeep(widget);
    widget.certArr.forEach(item => {
      if (item.value === value) {
        controlName = item.name;
      }
    });
    let data = {
      enumDefault: parseInt(value, 10),
      controlName,
      hint: _l('填写') + controlName,
    };
    widget.data = Object.assign(widget.data, data);
    widget = Object.assign(widget, {
      validateTxt: controlName + _l('格式'),
    });
    if (value === 3 || value === 4) {
      widget.OAOptions.validate = undefined;
    } else {
      widget.OAOptions.validate = true;
    }
    this.props.changeWidgetData(this.props.widget.id, widget.data, true);
    this.props.changeWidget(this.props.widget.id, widget);
  }

  render() {
    let { widget } = this.props;
    return (
      <div className="">
        <div className="wsItem">
          <span className="wsLf">{_l('证件类型')}</span>
          <Dropdown data={widget.certArr} value={widget.data.enumDefault} onChange={this.changeDefaultValue.bind(this)} width="140px" />
        </div>
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
          <span className="wsLf">{_l('引导文字')}</span>
          <input
            className="ThemeBorderColor3 allowEmpty"
            type="text"
            ref="hint"
            value={this.props.widget.data.hint}
            onChange={this.handleChange.bind(this)}
            maxLength="100"
          />
        </div>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.CRED_INPUT.type,
  SettingsModel,
};
